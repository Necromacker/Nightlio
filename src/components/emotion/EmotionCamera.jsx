import { useState, useRef, useEffect } from 'react';
import { Camera, X, Check } from 'lucide-react';
import * as faceapi from 'face-api.js';

const EMOTION_TO_MOOD = {
  'happy': 5,
  'sad': 1,
  'angry': 2,
  'surprised': 4,
  'fearful': 2,
  'disgusted': 2,
  'neutral': 3,
};

const EMOTION_LABELS = {
  'happy': 'Happy 😊',
  'sad': 'Sad 😢',
  'angry': 'Angry 😠',
  'surprised': 'Surprised 😲',
  'fearful': 'Fearful 😨',
  'disgusted': 'Disgusted 🤢',
  'neutral': 'Neutral 😐',
};

const EmotionCamera = ({ onMoodDetected, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [detectedMood, setDetectedMood] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        const GITHUB_MODELS_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        
        // Try to load models from public/models directory first
        try {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          ]);
          console.log('Models loaded from local /models directory');
        } catch (e) {
          // Fallback to GitHub raw content
          console.log('Loading models from GitHub...');
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(GITHUB_MODELS_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(GITHUB_MODELS_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(GITHUB_MODELS_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(GITHUB_MODELS_URL),
          ]);
          console.log('Models loaded from GitHub');
        }
        
        setModelsLoaded(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading face-api models:', err);
        setError('Failed to load emotion detection models. Please check your internet connection and try again.');
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  // Start camera
  useEffect(() => {
    if (!modelsLoaded) return;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: 640, 
            height: 480,
            facingMode: 'user'
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please allow camera permissions.');
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [modelsLoaded]);

  // Detect emotions
  useEffect(() => {
    if (!modelsLoaded || !videoRef.current || !canvasRef.current) return;

    const detectEmotion = async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const displaySize = { width: video.width, height: video.height };
      
      faceapi.matchDimensions(canvas, displaySize);

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
      // Clear canvas
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw detections
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

      if (detections.length > 0) {
        const expressions = detections[0].expressions;
        const emotions = Object.keys(expressions);
        const sortedEmotions = emotions.sort((a, b) => expressions[b] - expressions[a]);
        const topEmotion = sortedEmotions[0];
        const confidence = expressions[topEmotion];

        // Only update if confidence is high enough
        if (confidence > 0.5) {
          setDetectedEmotion(topEmotion);
          setDetectedMood(EMOTION_TO_MOOD[topEmotion] || 3);
        }
      }
    };

    const interval = setInterval(detectEmotion, 100);
    return () => clearInterval(interval);
  }, [modelsLoaded, isDetecting]);

  const handleConfirm = () => {
    if (detectedMood) {
      onMoodDetected(detectedMood);
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          background: 'var(--surface)',
          padding: '2rem',
          borderRadius: '16px',
          maxWidth: '400px',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text)', marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={handleClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--accent-bg)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: '16px',
        padding: '1.5rem',
        maxWidth: '600px',
        width: '100%',
        position: 'relative',
      }}>
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text)' }}>
          Detect Your Mood
        </h2>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading emotion detection...</p>
          </div>
        ) : (
          <>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '500px',
              margin: '0 auto',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#000',
            }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>

            {detectedEmotion && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'var(--accent-bg)',
                borderRadius: '12px',
                textAlign: 'center',
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '1.2rem', 
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '0.5rem',
                }}>
                  Detected: {EMOTION_LABELS[detectedEmotion]}
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.9rem', 
                  color: 'rgba(255, 255, 255, 0.8)',
                }}>
                  Mood Level: {detectedMood}/5
                </p>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1.5rem',
              justifyContent: 'center',
            }}>
              <button
                onClick={handleClose}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!detectedMood}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: detectedMood ? 'var(--accent-bg)' : 'var(--border)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: detectedMood ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Check size={18} />
                Use This Mood
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmotionCamera;

