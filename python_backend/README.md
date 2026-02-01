# Akshara Speech Recognition Backend

This is the Python FastAPI backend that runs the trained CNN-CTC model for speech recognition in the Akshara learning app.

## Prerequisites

- Python 3.9 or higher
- pip (Python package manager)

## Setup

1. **Create a virtual environment** (recommended):
   ```bash
   cd python_backend
   python -m venv venv

   # On Windows:
   venv\Scripts\activate

   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify the model path**:
   The server expects the model weights at:
   ```
   C:\Users\BALARAJ\Documents\Akshara_Integration\kfold_i_identify_phonemes.weights.h5
   ```

   If your model is in a different location, update the `MODEL_PATH` in `server.py`.

## Running the Server

```bash
python server.py
```

The server will start on `http://localhost:8000`.

## API Endpoints

### Health Check
```
GET /health
```
Returns the server status and whether the model is loaded.

### Recognize Letter
```
POST /recognize
Content-Type: application/json

{
  "audio": [0.1, 0.2, ...],  // Array of float32 audio samples
  "sampleRate": 16000        // Sample rate (default: 16000)
}
```

**Response:**
```json
{
  "success": true,
  "letter": "A",
  "phonemes": ["EY"],
  "confidence": 0.85,
  "debug": {
    "scores": {"A": 62, "I": 45},
    "chosen_score": 62,
    "phonemes": ["EY"]
  }
}
```

## How It Works

1. **Audio Preprocessing**: The audio is normalized and onset detection is applied
2. **Feature Extraction**: Mel-spectrogram, delta, delta2, and pitch (F0) features are extracted
3. **Model Inference**: The CNN-CTC model predicts phoneme sequences
4. **Letter Mapping**: Phonemes are mapped to letters using rule-based matching

## Troubleshooting

### Model not loading
- Ensure TensorFlow is properly installed
- Check that the model path is correct
- Verify you have enough memory (the model is ~49MB)

### CORS errors
- The server allows requests from `localhost:3000` (Next.js dev server)
- Add additional origins in `server.py` if needed

### Recognition not working
- Ensure audio is at 16kHz sample rate
- Check that the audio is not too short (minimum ~0.1 seconds)
- Speak clearly into the microphone
