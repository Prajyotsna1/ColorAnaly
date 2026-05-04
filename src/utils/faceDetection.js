/**
 * Face Detection using MediaPipe FaceMesh (Tasks Vision API)
 * Detects face landmarks and extracts skin region coordinates (cheeks + forehead)
 */

import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let faceLandmarker = null;

/**
 * Initialize the MediaPipe FaceLandmarker model.
 * Uses a pretrained model — no training needed.
 */
export async function initFaceDetection() {
  if (faceLandmarker) return faceLandmarker;

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'IMAGE',
    numFaces: 1,
    outputFacialTransformationMatrixes: false,
    outputFaceBlendshapes: false,
  });

  return faceLandmarker;
}

/**
 * Detect face landmarks from an image element.
 * @param {HTMLImageElement} imageElement
 * @returns {{ landmarks: Array, skinRegions: Object } | null}
 */
export async function detectFace(imageElement) {
  const landmarker = await initFaceDetection();
  const result = landmarker.detect(imageElement);

  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    return null;
  }

  const landmarks = result.faceLandmarks[0];
  const imgWidth = imageElement.naturalWidth || imageElement.width;
  const imgHeight = imageElement.naturalHeight || imageElement.height;

  // Extract skin regions using landmark indices
  const skinRegions = extractSkinRegions(landmarks, imgWidth, imgHeight);

  return {
    landmarks,
    skinRegions,
    imageWidth: imgWidth,
    imageHeight: imgHeight,
  };
}

/**
 * Extract skin regions (cheeks, forehead) from facial landmarks.
 * These regions avoid eyes, mouth, and eyebrows for clean skin sampling.
 *
 * MediaPipe FaceMesh landmark indices:
 *  - Left cheek: ~234, 93, 132, 58, 172
 *  - Right cheek: ~454, 323, 361, 288, 397
 *  - Forehead: ~10, 338, 297, 67, 109
 */
function extractSkinRegions(landmarks, imgWidth, imgHeight) {
  // Helper: convert normalized coords to pixel coords
  const toPixel = (lm) => ({
    x: Math.round(lm.x * imgWidth),
    y: Math.round(lm.y * imgHeight),
  });

  // Left cheek region
  const leftCheekPoints = [234, 93, 132, 58, 172].map((i) => toPixel(landmarks[i]));
  const leftCheek = getBoundingBox(leftCheekPoints);

  // Right cheek region
  const rightCheekPoints = [454, 323, 361, 288, 397].map((i) => toPixel(landmarks[i]));
  const rightCheek = getBoundingBox(rightCheekPoints);

  // Forehead region (between eyebrows and hairline)
  const foreheadPoints = [10, 338, 297, 67, 109].map((i) => toPixel(landmarks[i]));
  const forehead = getBoundingBox(foreheadPoints);

  // Nose bridge (small stable region)
  const noseBridgePoints = [6, 197, 195, 5].map((i) => toPixel(landmarks[i]));
  const noseBridge = getBoundingBox(noseBridgePoints);

  return {
    leftCheek: shrinkBox(leftCheek, 0.2),
    rightCheek: shrinkBox(rightCheek, 0.2),
    forehead: shrinkBox(forehead, 0.25),
    noseBridge: shrinkBox(noseBridge, 0.1),
  };
}

/**
 * Get bounding box from a set of points.
 */
function getBoundingBox(points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

/**
 * Shrink a bounding box by a fraction to get more central, reliable skin pixels.
 */
function shrinkBox(box, fraction) {
  const dx = box.width * fraction;
  const dy = box.height * fraction;
  return {
    x: Math.round(box.x + dx),
    y: Math.round(box.y + dy),
    width: Math.round(box.width - 2 * dx),
    height: Math.round(box.height - 2 * dy),
  };
}

/**
 * Draw face mesh overlay on a canvas for visualization.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} landmarks
 * @param {number} width
 * @param {number} height
 * @param {Object} skinRegions
 */
export function drawFaceMesh(ctx, landmarks, width, height, skinRegions) {
  // Draw landmark dots
  ctx.fillStyle = 'rgba(32, 211, 178, 0.4)';
  landmarks.forEach((lm) => {
    const x = lm.x * width;
    const y = lm.y * height;
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Highlight skin sampling regions
  ctx.strokeStyle = 'rgba(32, 211, 178, 0.8)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);

  Object.values(skinRegions).forEach((region) => {
    ctx.strokeRect(region.x, region.y, region.width, region.height);
  });

  ctx.setLineDash([]);
}
