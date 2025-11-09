# Face-API.js Models

This directory should contain the face-api.js model files for emotion detection.

## Automatic Loading

The app will automatically load models from GitHub if they're not available locally. No manual setup required!

## Optional: Download Models Locally (Faster)

For faster loading, you can download the models locally:

1. Visit: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Download these files:
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`
   - `face_recognition_model-shard2`
   - `face_expression_model-weights_manifest.json`
   - `face_expression_model-shard1`

3. Place all files in this `public/models/` directory

## How It Works

The EmotionCamera component will:
1. First try to load models from `/models` (local directory)
2. If not found, automatically load from GitHub raw content
3. This ensures the feature works even without local models

## Note

The GitHub fallback requires an internet connection. For offline use, download the models locally.

