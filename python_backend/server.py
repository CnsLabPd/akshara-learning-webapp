"""
FastAPI server for Akshara Speech Recognition
AWS Lambda (Container) + Function URL / HTTP API v2 compatible
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mangum import Mangum

import numpy as np
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import alphabet_predictor as ap

app = FastAPI(title="Akshara Speech Recognition API")

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Replace these with your real domains later:
    "https://YOUR_VERCEL_DOMAIN_HERE",
    "https://akshara.yourdomain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.environ.get(
    "MODEL_PATH",
    "/app/models/kfold_i_identify_phonemes.weights.h5"
)

# Cached model (warm invocations reuse this)
_model = None
_model_load_ms = None


def get_model():
    """Lazy-load model only when needed. Avoids Lambda init timeout."""
    global _model, _model_load_ms
    if _model is None:
        t0 = time.time()
        _model = ap.build_model(weights_path=MODEL_PATH)
        _model_load_ms = int((time.time() - t0) * 1000)
        print(f"Model loaded in {_model_load_ms} ms")
    return _model


# --- OPTIONAL debug (safe): prints requested path in CloudWatch logs ---
@app.middleware("http")
async def log_request_path(request: Request, call_next):
    try:
        print(f"REQUEST: {request.method} {request.url.path}")
    except Exception:
        pass
    return await call_next(request)


class AudioRequest(BaseModel):
    audio: list[float]
    sampleRate: int = 16000


class RecognitionResponse(BaseModel):
    success: bool
    letter: str
    phonemes: list[str]
    confidence: float
    debug: dict


@app.get("/")
async def root():
    return {"status": "ok", "message": "Akshara Speech Recognition API is running"}


@app.get("/health")
async def health_check():
    # MUST be fast: do NOT load model here
    return {
        "status": "healthy",
        "model_loaded": _model is not None,
        "model_load_ms": _model_load_ms
    }


# ✅ IMPORTANT: Function URL sometimes normalizes trailing slash differently.
# This makes both /health and /health/ work.
@app.get("/health/")
async def health_check_slash():
    return await health_check()


@app.post("/recognize", response_model=RecognitionResponse)
async def recognize_letter(request: AudioRequest):
    try:
        model = get_model()  # loads once (cold), reused (warm)

        audio = np.array(request.audio, dtype=np.float32)
        if len(audio) < 1600:
            raise HTTPException(status_code=400, detail="Audio too short")

        if request.sampleRate != 16000:
            ratio = 16000 / request.sampleRate
            new_length = int(len(audio) * ratio)
            indices = np.linspace(0, len(audio) - 1, new_length).astype(int)
            audio = audio[indices]

        max_val = np.max(np.abs(audio))
        if max_val > 0:
            audio = audio / max_val

        segment = ap.extract_segment_with_onset(audio)
        X_data = ap.extract_features(segment)

        y_pred = model.predict(X_data, verbose=0)

        decoded_phonemes, letters, logs = ap.map_prediction_to_alphabet(y_pred)
        letter = letters[0] if letters else "?"
        phonemes = decoded_phonemes[0] if decoded_phonemes else []
        log_info = logs[0] if logs else {}

        confidence = log_info.get("chosen_score", 50) / 100.0
        confidence = min(1.0, confidence)

        return RecognitionResponse(
            success=True,
            letter=letter,
            phonemes=phonemes,
            confidence=confidence,
            debug=log_info
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Recognition error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ✅ IMPORTANT: make Mangum robust for Lambda Function URL / HTTP API v2 routing
# This helps avoid weird "Message: null" responses for subpaths.
handler = Mangum(app, api_gateway_base_path=None)
