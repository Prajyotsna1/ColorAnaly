import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import StepIndicator from '../components/StepIndicator';
import { detectFace, drawFaceMesh } from '../utils/faceDetection';
import { extractSkinColor } from '../utils/colorExtraction';
import { classifyUndertone } from '../utils/undertoneClassifier';
import './AnalysisPage.css';

const STEPS = [
  { icon: '📸', label: 'Upload' },
  { icon: '🔍', label: 'Detect' },
  { icon: '🧪', label: 'Analyze' },
  { icon: '📊', label: 'Results' },
];

export default function AnalysisPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [processingSubMessage, setProcessingSubMessage] = useState('');
  const [error, setError] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualStep, setManualStep] = useState('forehead'); // forehead, leftCheek, rightCheek, chin, complete
  const [manualPoints, setManualPoints] = useState({
    forehead: null,
    leftCheek: null,
    rightCheek: null,
    chin: null
  });

  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const faceDataRef = useRef(null);

  // Dropzone
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setImageFile(file);

    // Convert to Base64 for maximum stability across page transitions and AI processing
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.onerror = () => {
      setError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
    
    setFaceDetected(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Cleanup not needed for Base64 strings
  useEffect(() => {
    return () => {};
  }, []);

  // Detect face when image loads
  const handleImageLoad = async () => {
    if (!imageRef.current) return;

    setCurrentStep(1);
    setProcessing(true);
    setProcessingMessage('Detecting face...');
    setProcessingSubMessage('Loading MediaPipe FaceMesh AI model');

    try {
      console.log('Starting face detection...');
      const result = await detectFace(imageRef.current);

      if (!result) {
        console.warn('MediaPipe: No face detected');
        setError(
          'No face detected in this image. Please try a different photo with a clear, front-facing headshot.'
        );
        setProcessing(false);
        setCurrentStep(0);
        return;
      }

      console.log('Face detected successfully:', result);
      faceDataRef.current = result;
      setFaceDetected(true);
      setProcessing(false);

      // Draw mesh overlay
      if (canvasRef.current && imageRef.current) {
        const canvas = canvasRef.current;
        canvas.width = result.imageWidth;
        canvas.height = result.imageHeight;
        const ctx = canvas.getContext('2d');
        drawFaceMesh(ctx, result.landmarks, result.imageWidth, result.imageHeight, result.skinRegions);
      }
    } catch (err) {
      console.error('Face detection CRITICAL error:', err);
      setError(
        `Face detection failed (${err.message}). This might be due to your browser's security settings or a temporary issue with the AI model. Please try refreshing.`
      );
      setProcessing(false);
      setCurrentStep(0);
    }
  };

  // Manual Sampling Click Handler
  const handleManualClick = (e) => {
    if (!isManualMode || manualStep === 'complete') return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const newPoints = { ...manualPoints, [manualStep]: { x, y } };
    setManualPoints(newPoints);

    // Advance steps
    if (manualStep === 'forehead') setManualStep('leftCheek');
    else if (manualStep === 'leftCheek') setManualStep('rightCheek');
    else if (manualStep === 'rightCheek') setManualStep('chin');
    else if (manualStep === 'chin') setManualStep('complete');
  };

  // Run full analysis
  const handleAnalyze = async () => {
    if (!imageRef.current) return;

    let colorData = null;

    if (isManualMode) {
      // Use manual points as regions
      const regions = {
        forehead: [{ x: manualPoints.forehead.x, y: manualPoints.forehead.y }],
        leftCheek: [{ x: manualPoints.leftCheek.x, y: manualPoints.leftCheek.y }],
        rightCheek: [{ x: manualPoints.rightCheek.x, y: manualPoints.rightCheek.y }],
        chin: [{ x: manualPoints.chin.x, y: manualPoints.chin.y }]
      };
      colorData = extractSkinColor(imageRef.current, regions);
    } else {
      if (!faceDataRef.current) return;
      colorData = extractSkinColor(imageRef.current, faceDataRef.current.skinRegions);
    }

    setCurrentStep(2);
    setProcessing(true);
    setProcessingMessage('Analyzing your skin tone...');
    setProcessingSubMessage('Extracting color data from skin regions');

    try {
      await sleep(600); // UX delay to show the processing state

      if (!colorData) {
        setError('Could not extract skin color. Please try a brighter, clearer photo.');
        setProcessing(false);
        setCurrentStep(1);
        return;
      }

      // Step 2: Classify undertone
      setProcessingMessage('Classifying undertone...');
      setProcessingSubMessage('Checking hue, saturation, and channel ratios');
      await sleep(800);

      const result = classifyUndertone(colorData);

      // Step 3: Navigate to results
      setCurrentStep(3);
      setProcessingMessage('Generating your report...');
      setProcessingSubMessage('Preparing personalized color recommendations');
      await sleep(600);

      // Navigate to results page with data
      navigate('/results', { state: { analysisResult: result, userImage: imagePreview } });
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Analysis failed. Please try again with a different photo.');
      setProcessing(false);
      setCurrentStep(1);
    }
  };

  // Reset
  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setCurrentStep(0);
    setProcessing(false);
    setError(null);
    setFaceDetected(false);
    faceDataRef.current = null;
  };

  return (
    <main className="analysis-page">
      <div className="container">
        <div className="section-header">
          <span className="badge badge-primary">AI Analysis</span>
          <h1 style={{ marginTop: 'var(--space-md)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            Analyze Your Colors
          </h1>
          <p>
            Upload a clear headshot to discover your skin undertone and personalized color palette.
          </p>
        </div>

        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* ═══════ Error state ═══════ */}
        {error && (
          <div className="error-container" id="error-panel">
            <span className="error-icon">😕</span>
            <h3>Oops!</h3>
            <p>{error}</p>
            <button className="btn btn-primary btn-sm" onClick={handleReset} id="error-retry-btn">
              Try Again
            </button>
          </div>
        )}

        {/* ═══════ Processing state ═══════ */}
        {processing && !error && (
          <div className="processing-container" id="processing-panel">
            <div className="processing-spinner" />
            <p className="processing-text">{processingMessage}</p>
            <p className="processing-step">{processingSubMessage}</p>
          </div>
        )}

        {/* ═══════ Upload zone (Step 0) ═══════ */}
        {!imagePreview && !processing && !error && (
          <>
            <div
              {...getRootProps()}
              className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
              id="upload-dropzone"
            >
              <input {...getInputProps()} id="file-input" />
              <span className="upload-icon">📷</span>
              <h3>Drop your photo here</h3>
              <p>or click to browse your files</p>
              <span className="upload-browse-btn">Choose Photo</span>
              <p className="upload-hint">
                Supports JPG, PNG, WebP • Max 10MB • Your image never leaves your device
              </p>
            </div>

            <div className="tips-panel">
              <h4>💡 Tips for Best Results</h4>
              <ul className="tips-list">
                <li>
                  <span>☀️</span>
                  <span>Use natural lighting — avoid harsh fluorescent or yellow bulbs</span>
                </li>
                <li>
                  <span>🤳</span>
                  <span>Take a front-facing headshot with face clearly visible</span>
                </li>
                <li>
                  <span>🚫</span>
                  <span>Avoid heavy makeup or face filters — they affect color accuracy</span>
                </li>
                <li>
                  <span>🖼️</span>
                  <span>Use a simple, non-colorful background if possible</span>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* ═══════ Image preview with mesh overlay ═══════ */}
        {/* Keep the image mounted (but hidden during processing) so imageRef stays valid */}
        {imagePreview && !error && (
          <div
            className="preview-container"
            id="preview-panel"
            style={processing ? { position: 'absolute', opacity: 0, pointerEvents: 'none' } : {}}
          >
            {isManualMode && manualStep !== 'complete' && (
              <div className="manual-instruction-banner">
                <span className="manual-step-icon">🎯</span>
                <div className="manual-step-text">
                  <span className="manual-step-title">Manual Verification</span>
                  <span className="manual-step-instruction">
                    Step {manualStep === 'forehead' ? '1' : manualStep === 'leftCheek' ? '2' : manualStep === 'rightCheek' ? '3' : '4'}: 
                    <strong> Tap your {manualStep.replace('Cheek', ' Cheek')}</strong>
                  </span>
                </div>
              </div>
            )}

            <div className="preview-image-wrapper">
              <img
                ref={imageRef}
                src={imagePreview}
                alt="Uploaded photo for analysis"
                onLoad={handleImageLoad}
                id="preview-image"
              />
              <canvas 
                ref={canvasRef} 
                id="mesh-overlay" 
                onClick={handleManualClick}
                className={isManualMode ? 'manual-cursor' : ''}
              />
              
              {/* Manual Markers */}
              {isManualMode && Object.entries(manualPoints).map(([key, point]) => (
                point && (
                  <div 
                    key={key} 
                    className="manual-marker"
                    style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
                  >
                    <span className="marker-label">{key === 'forehead' ? 'F' : key === 'leftCheek' ? 'L' : key === 'rightCheek' ? 'R' : 'C'}</span>
                  </div>
                )
              ))}
            </div>

            <div className="preview-actions-refined">
              {!isManualMode ? (
                <>
                  {faceDetected && !processing && (
                    <button className="btn btn-primary btn-glow" onClick={handleAnalyze} id="analyze-btn">
                      🧪 Analyze My Undertone
                    </button>
                  )}
                  <button 
                    className="btn btn-outline-premium" 
                    onClick={() => {
                      setIsManualMode(true);
                      setFaceDetected(false); // Hide the mesh
                    }}
                  >
                    📍 Switch to Manual Sampling
                  </button>
                </>
              ) : (
                <>
                  {manualStep === 'complete' ? (
                    <button className="btn btn-primary btn-glow" onClick={handleAnalyze} id="analyze-btn">
                      🚀 Analyze Manual Samples
                    </button>
                  ) : (
                    <div className="manual-progress-info">
                      Click {manualStep.replace('Cheek', ' cheek')} to continue...
                    </div>
                  )}
                  <button 
                    className="btn btn-outline-premium" 
                    onClick={() => {
                      setIsManualMode(false);
                      setManualStep('forehead');
                      setManualPoints({ forehead: null, leftCheek: null, rightCheek: null, chin: null });
                      handleImageLoad(); // Retrigger AI
                    }}
                  >
                    🤖 Switch Back to AI
                  </button>
                </>
              )}
              
              {!processing && (
                <button className="btn btn-secondary-subtle" onClick={handleReset} id="reset-btn">
                  ↩ Different Photo
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
