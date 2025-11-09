
from flask import Flask, request, jsonify, send_from_directory
import cv2
import numpy as np
import base64
# Import your model and feature extraction here
from realtimedetection import extract_features, model, labels, face_cascade

app = Flask(__name__)

@app.route('/')
def index():
    # serve the frontend HTML from the static folder
    return send_from_directory('static', 'index.html')

def predict_emotion_with_model(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    if len(faces) == 0:
        return "No Face"
    for (x, y, w, h) in faces:
        face_img = gray[y:y+h, x:x+w]
        face_img = cv2.resize(face_img, (48, 48))
        features = extract_features(face_img)
        # `extract_features` already returns a batched tensor (1,48,48,1)
        prediction = model.predict(features)
        emotion_id = int(np.argmax(prediction))
        return labels[emotion_id]
    return "No Face"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        img_data = data['image'].split(',')[1]
        img_bytes = base64.b64decode(img_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        emotion = predict_emotion_with_model(img)
        return jsonify({'emotion': emotion})
    except Exception as e:
        # return error as JSON so frontend JSON.parse doesn't fail on HTML
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # listen on all interfaces so you can access from another device on the LAN if needed
    app.run(host='0.0.0.0', port=8000, debug=True)
