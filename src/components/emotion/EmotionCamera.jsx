import { useState, useRef, useEffect } from 'react';
import { Camera, X, Check } from 'lucide-react';

// Flask backend emotions: angry, disgust, fear, happy, neutral, sad, surprise
const EMOTION_TO_MOOD = {
  'happy': 5,
  'sad': 1,
  'angry': 2,
  'surprise': 4,
  'fear': 2,
  'disgust': 2,
  'neutral': 3,
};

const EMOTION_LABELS = {
  'happy': 'Happy 😊',
  'sad': 'Sad 😢',
  'angry': 'Angry 😠',
  'surprise': 'Surprised 😲',
  'fear': 'Fearful 😨',
  'disgust': 'Disgusted 🤢',
  'neutral': 'Neutral 😐',
};

const FLASK_API_URL = 'http://localhost:8000/predict';

const EmotionCamera = ({ onMoodDetected, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [detectedMood, setDetectedMood] = useState(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const detectionIntervalRef = useRef(null);

  // Start camera
  useEffect(() => {
    let videoElement = null;
    let currentStream = null;
    let timeoutId = null;
    const eventHandlers = [];
    
    const startVideo = () => {
      if (!videoElement) return;
      
      videoElement.play().then(() => {
        console.log('Video started playing');
        setIsLoading(false);
        setIsDetecting(true);
        if (timeoutId) clearTimeout(timeoutId);
      }).catch((playErr) => {
        console.error('Error playing video:', playErr);
        setError('Could not start video playback.');
        setIsLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      });
    };
    
    const handleCanPlay = () => {
      console.log('Video can play');
      startVideo();
    };
    
    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded');
      startVideo();
    };
    
    const handlePlaying = () => {
      console.log('Video is playing');
      setIsLoading(false);
      setIsDetecting(true);
      if (timeoutId) clearTimeout(timeoutId);
    };
    
    const handleError = (err) => {
      console.error('Video error:', err);
      setError('Error loading video stream.');
      setIsLoading(false);
      if (timeoutId) clearTimeout(timeoutId);
    };
    
    const startCamera = async () => {
      try {
        console.log('Requesting camera access...');
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: 640, 
            height: 480,
            facingMode: 'user'
          }
        });
        
        console.log('Camera access granted');
        currentStream = mediaStream;
        setStream(mediaStream);
        
        // Use setTimeout to ensure video element is ready
        setTimeout(() => {
          if (videoRef.current) {
            videoElement = videoRef.current;
            console.log('Setting video srcObject');
            videoElement.srcObject = mediaStream;
            
            // Add multiple event listeners for reliability
            videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
            videoElement.addEventListener('canplay', handleCanPlay);
            videoElement.addEventListener('playing', handlePlaying);
            videoElement.addEventListener('error', handleError);
            
            eventHandlers.push(
              { event: 'loadedmetadata', handler: handleLoadedMetadata },
              { event: 'canplay', handler: handleCanPlay },
              { event: 'playing', handler: handlePlaying },
              { event: 'error', handler: handleError }
            );
            
            // Fallback: if video doesn't start in 3 seconds, try to start it manually
            timeoutId = setTimeout(() => {
              console.log('Timeout fallback - trying to start video');
              if (videoElement && videoElement.readyState >= 2) {
                startVideo();
              } else {
                setError('Video took too long to load. Please try again.');
                setIsLoading(false);
              }
            }, 3000);
            
            // Try to start immediately if already ready
            if (videoElement.readyState >= 2) {
              console.log('Video already ready, starting immediately');
              startVideo();
            }
          }
        }, 100);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please allow camera permissions.');
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (videoElement) {
        eventHandlers.forEach(({ event, handler }) => {
          videoElement.removeEventListener(event, handler);
        });
        videoElement.srcObject = null;
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  // Detect emotions using Flask backend
  useEffect(() => {
    if (!isDetecting || !videoRef.current || !canvasRef.current) return;

    const detectEmotion = async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        // Convert canvas to base64 image
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        // Send to Flask backend
        const response = await fetch(FLASK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: imageData }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          console.error('Flask API error:', data.error);
          return;
        }

        if (data.emotion && data.emotion !== 'No Face') {
          const emotion = data.emotion.toLowerCase();
          setDetectedEmotion(emotion);
          setDetectedMood(EMOTION_TO_MOOD[emotion] || 3);
          
          // Draw a simple rectangle to indicate face detection
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 3;
          // Draw a rectangle in the center area (approximate face location)
          const rectSize = Math.min(canvas.width, canvas.height) * 0.4;
          const x = (canvas.width - rectSize) / 2;
          const y = (canvas.height - rectSize) / 2;
          ctx.strokeRect(x, y, rectSize, rectSize);
          
          // Draw emotion label
          ctx.fillStyle = '#00ff00';
          ctx.font = 'bold 24px Arial';
          ctx.fillText(EMOTION_LABELS[emotion] || emotion, x, y - 10);
        } else {
          // Clear detection if no face
          setDetectedEmotion(null);
          setDetectedMood(null);
        }
      } catch (err) {
        console.error('Error detecting emotion:', err);
        // Don't show error for every failed request, just log it
        if (err.message.includes('Failed to fetch') && !error) {
          setError('Could not connect to emotion detection server. Make sure the Flask server is running on http://localhost:8000');
        }
      }
    };

    // Start detection loop - check every 500ms to avoid overwhelming the server
    detectionIntervalRef.current = setInterval(detectEmotion, 500);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isDetecting, error]);

  const handleConfirm = () => {
    if (detectedMood) {
      onMoodDetected(detectedMood);
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
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
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            To start the Flask server, run: <code style={{ background: 'var(--bg)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>cd Face-detection && python app.py</code>
          </p>
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
              pointerEvents: 'none',
            }}
          />
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
            }}>
              <p>Starting camera...</p>
            </div>
          )}
        </div>

        {!isLoading && (
          <>
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
                  Detected: {EMOTION_LABELS[detectedEmotion] || detectedEmotion}
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

            {!detectedEmotion && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                textAlign: 'center',
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.9rem', 
                  color: 'var(--text-muted)',
                }}>
                  Position your face in the camera frame...
                </p>
              </div>
            )}

          </>
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
            disabled={!detectedMood || isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              background: (detectedMood && !isLoading) ? 'var(--accent-bg)' : 'var(--border)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (detectedMood && !isLoading) ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Check size={18} />
            Confirm Mood
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmotionCamera;
