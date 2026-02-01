import numpy as np
from tensorflow.keras import layers, models, backend as K  # lightweight enough, but we will avoid tf import elsewhere

# --- Constants ---
SAMPLE_RATE = 16000
INTENSITY_THRESHOLD = 0.10
PRE_ONSET_DURATION = 0.2
POST_ONSET_DURATION = 1.3
PHONEME_LIST = [
    'AA', 'AH', 'AY', 'B', 'CH', 'D', 'EH', 'EY', 'F', 'IY', 'JH', 'K', 'L',
    'M', 'N', 'OW', 'P', 'R', 'S', 'T', 'UW', 'V', 'W', 'Y', 'Z'
]
NUM_PHONEMES = len(PHONEME_LIST)
IDX_TO_PHONEME = {i: p for i, p in enumerate(PHONEME_LIST)}

# --- Lazy imports (IMPORTANT for Lambda cold start) ---
_librosa = None

def _lazy_import_audio_deps():
    global _librosa
    if _librosa is None:
        import librosa as _lb
        _librosa = _lb
    return _librosa

# --- Preprocessing ---

def extract_segment_with_onset(y, sr=SAMPLE_RATE):
    """Detects onset and crops the audio to the standard window."""
    onset_sample = -1
    for i, sample_value in enumerate(y):
        if np.abs(sample_value) > INTENSITY_THRESHOLD:
            onset_sample = i
            break

    if onset_sample == -1:
        onset_sample = 0

    pre_onset_samples = int(PRE_ONSET_DURATION * sr)
    post_onset_samples = int(POST_ONSET_DURATION * sr)
    target_length = pre_onset_samples + post_onset_samples

    extracted = np.zeros(target_length, dtype=y.dtype)
    start = max(0, onset_sample - pre_onset_samples)
    end = min(len(y), onset_sample + post_onset_samples)

    offset = pre_onset_samples - (onset_sample - start)
    length_to_copy = end - start
    extracted[offset : offset + length_to_copy] = y[start : end]

    return extracted


def extract_features(y, sr=SAMPLE_RATE):
    """Extracts Mel-spectrogram, Deltas, and Pitch (F0)."""
    librosa = _lazy_import_audio_deps()

    mel = librosa.feature.melspectrogram(
        y=y, sr=sr, n_fft=512, hop_length=160, win_length=400, n_mels=80
    )
    mel_db = librosa.power_to_db(mel)
    delta = librosa.feature.delta(mel_db)
    delta2 = librosa.feature.delta(mel_db, order=2)

    f0, _, _ = librosa.pyin(y, fmin=80, fmax=350, sr=sr)
    f0 = np.nan_to_num(f0)
    f0 = librosa.util.fix_length(data=f0, size=mel_db.shape[1])

    feats = np.vstack([mel_db, delta, delta2, f0]).T  # Shape (T, 241)
    return np.expand_dims(np.expand_dims(feats, axis=0), axis=-1)


# --- Model Architecture ---

def build_model(weights_path=None):
    """Reconstructs the CNN-CTC architecture and loads weights from Keras 3 format."""
    import h5py  # lazy import

    input_shape = (151, 241, 1)
    num_classes = NUM_PHONEMES + 1

    input_data = layers.Input(name="input_data", shape=input_shape, dtype="float32")

    conv1 = layers.Conv2D(32, (3,3), padding="same", activation='relu', name='conv2d')
    x = conv1(input_data)
    bn1 = layers.BatchNormalization(name='batch_normalization')
    x = bn1(x)
    x = layers.MaxPool2D((2,2))(x)

    conv2 = layers.Conv2D(64, (3,3), padding="same", activation='relu', name='conv2d_1')
    x = conv2(x)
    bn2 = layers.BatchNormalization(name='batch_normalization_1')
    x = bn2(x)
    x = layers.MaxPool2D((2,2))(x)

    conv3 = layers.Conv2D(128, (3,3), padding="same", activation='relu', name='conv2d_2')
    x = conv3(x)
    bn3 = layers.BatchNormalization(name='batch_normalization_2')
    x = bn3(x)
    x = layers.MaxPool2D((2,2))(x)

    _, t, f, c = K.int_shape(x)
    x = layers.Reshape((t, f * c))(x)

    bilstm = layers.Bidirectional(layers.LSTM(128, return_sequences=True), name='bidirectional')
    x = bilstm(x)

    dense1 = layers.Dense(256, activation='relu', name='dense')
    x = dense1(x)
    x = layers.Dropout(0.3)(x)

    dense2 = layers.Dense(num_classes, activation='softmax', name='dense_1')
    y_pred = dense2(x)

    model = models.Model(inputs=input_data, outputs=y_pred, name="cnn_ctc_base")
    model.build(input_shape=(None,) + input_shape)

    if weights_path:
        print(f"Loading weights from {weights_path}...")
        with h5py.File(weights_path, 'r') as f:
            layers_group = f['layers']

            for layer_name in ['conv2d', 'conv2d_1', 'conv2d_2']:
                if layer_name in layers_group:
                    layer = model.get_layer(layer_name)
                    kernel = np.array(layers_group[layer_name]['vars']['0'])
                    bias = np.array(layers_group[layer_name]['vars']['1'])
                    layer.set_weights([kernel, bias])

            for layer_name in ['batch_normalization', 'batch_normalization_1', 'batch_normalization_2']:
                if layer_name in layers_group:
                    layer = model.get_layer(layer_name)
                    gamma = np.array(layers_group[layer_name]['vars']['0'])
                    beta = np.array(layers_group[layer_name]['vars']['1'])
                    moving_mean = np.array(layers_group[layer_name]['vars']['2'])
                    moving_var = np.array(layers_group[layer_name]['vars']['3'])
                    layer.set_weights([gamma, beta, moving_mean, moving_var])

            if 'bidirectional' in layers_group:
                bilstm_layer = model.get_layer('bidirectional')
                fwd_kernel = np.array(layers_group['bidirectional']['forward_layer']['cell']['vars']['0'])
                fwd_rec_kernel = np.array(layers_group['bidirectional']['forward_layer']['cell']['vars']['1'])
                fwd_bias = np.array(layers_group['bidirectional']['forward_layer']['cell']['vars']['2'])
                bwd_kernel = np.array(layers_group['bidirectional']['backward_layer']['cell']['vars']['0'])
                bwd_rec_kernel = np.array(layers_group['bidirectional']['backward_layer']['cell']['vars']['1'])
                bwd_bias = np.array(layers_group['bidirectional']['backward_layer']['cell']['vars']['2'])
                bilstm_layer.set_weights([fwd_kernel, fwd_rec_kernel, fwd_bias,
                                          bwd_kernel, bwd_rec_kernel, bwd_bias])

            for layer_name in ['dense', 'dense_1']:
                if layer_name in layers_group:
                    layer = model.get_layer(layer_name)
                    kernel = np.array(layers_group[layer_name]['vars']['0'])
                    bias = np.array(layers_group[layer_name]['vars']['1'])
                    layer.set_weights([kernel, bias])

        print("All weights loaded successfully!")

    return model


def ctc_lambda_func(args):
    labels, y_pred, input_length, label_length = args
    return K.ctc_batch_cost(labels, y_pred, input_length, label_length)


def decode_predictions(y_pred):
    input_length = np.full(
        shape=(y_pred.shape[0],),
        fill_value=y_pred.shape[1],
        dtype="int32"
    )

    decoded, _ = K.ctc_decode(
        y_pred,
        input_length=input_length,
        greedy=True
    )
    decoded = decoded[0].numpy()

    sequences = []
    for seq in decoded:
        phones = []
        for idx in seq:
            if idx == -1:
                continue
            if idx == NUM_PHONEMES:
                continue
            phones.append(IDX_TO_PHONEME[int(idx)])
        sequences.append(phones)
    return sequences


# --- Alphabet Mapping (Transcription) ---
from dataclasses import dataclass
from typing import List, Set, Dict, Tuple

@dataclass
class Rule:
    any_groups: List[Set[str]]
    soft_any: Set[str] = None
    forbidden: Set[str] = None
    priority: int = 0

def _contains_all(seq_set: Set[str], required: Set[str]) -> bool:
    return required.issubset(seq_set)

def match_rule(phonemes: List[str], rule: Rule) -> Tuple[bool, int]:
    s = set(phonemes)

    if rule.forbidden and (s & rule.forbidden):
        return (False, 0)

    matched = False
    score = 0

    for grp in rule.any_groups:
        if _contains_all(s, grp):
            matched = True
            score = max(score, 10 + len(grp))

    if (not matched) and rule.soft_any:
        if len(s & rule.soft_any) > 0:
            matched = True
            score = max(score, 5 + len(s & rule.soft_any))

    if matched:
        score += rule.priority

    return matched, score

# (RULES dict unchanged — keep your existing RULES here)
RULES: Dict[str, Rule] = {
    # ... keep your RULES exactly as you pasted ...
    # (omitted here for brevity; paste the same RULES block unchanged)
}

def phonemes_to_letter(phonemes: List[str]) -> Tuple[str, Dict]:
    best_letter = "?"
    best_score = -1
    debug = {}

    for letter, rule in RULES.items():
        ok, score = match_rule(phonemes, rule)
        if ok:
            debug[letter] = score
            if score > best_score:
                best_score = score
                best_letter = letter

    return best_letter, {"scores": debug, "chosen_score": best_score, "phonemes": phonemes}


def phoneme_sequences_to_text(decoded_sequences: List[List[str]], join_with: str = "") -> Tuple[List[str], List[Dict]]:
    texts = []
    logs = []
    for seq in decoded_sequences:
        letter, info = phonemes_to_letter(seq)
        texts.append(letter)
        logs.append(info)
    return texts, logs

def map_prediction_to_alphabet(y_pred):
    decoded = decode_predictions(y_pred)
    letter, logs = phoneme_sequences_to_text(decoded)
    return decoded, letter, logs
