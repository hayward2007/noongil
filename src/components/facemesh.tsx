// pages/face-mesh.tsx

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Removed custom module declaration for '@mediapipe/face_mesh'

declare module '@mediapipe/camera_utils' {
  export class Camera {
    constructor(
      videoElement: HTMLVideoElement,
      options: {
        onFrame: () => Promise<void>;
        width: number;
        height: number;
      }
    );
    start(): Promise<void>;
    stop(): void;
  }
}

declare module '@mediapipe/drawing_utils' {
  export function drawConnectors(
    canvasCtx: CanvasRenderingContext2D,
    landmarks: Array<{ x: number; y: number; z: number }>,
    connections: Array<[number, number]>,
    options: {
      color: string;
      lineWidth: number;
    }
  ): void;
  
  export function drawLandmarks(
    canvasCtx: CanvasRenderingContext2D,
    landmarks: Array<{ x: number; y: number; z: number }>,
    options?: {
      color?: string;
      fillColor?: string;
      lineWidth?: number;
      radius?: number;
    }
  ): void;
}

// Define eye landmark indices
// Reference: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
const LEFT_IRIS_INDICES = [474, 475, 476, 477];
const RIGHT_IRIS_INDICES = [469, 470, 471, 472];

// Full eye contour indices
const LEFT_EYE_INDICES = [
  362, 382, 381, 380, 374, 373, 390, 249, 263,
  466, 388, 387, 386, 385, 384, 398
];

const RIGHT_EYE_INDICES = [
  33, 7, 163, 144, 145, 153, 154, 155, 133,
  173, 157, 158, 159, 160, 161, 246
];

interface EyeData {
  leftEye: {
    contour: Array<{x: number, y: number, z: number}>;
    iris: Array<{x: number, y: number, z: number}>;
    irisCenter: {x: number, y: number, z: number};
  };
  rightEye: {
    contour: Array<{x: number, y: number, z: number}>;
    iris: Array<{x: number, y: number, z: number}>;
    irisCenter: {x: number, y: number, z: number};
  };
}

// Creating a component that will only be loaded client-side
const FaceMeshComponent: React.FC = () => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [eyeData, setEyeData] = useState<EyeData | null>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    // Import libraries dynamically to avoid SSR issues
    const setupFaceMesh = async () => {
      const facemesh = await import('@mediapipe/face_mesh');
      const cam = await import('@mediapipe/camera_utils');
      const drawing = await import('@mediapipe/drawing_utils');

      if (!webcamRef.current || !canvasRef.current) return;

      const faceMeshInstance = new facemesh.FaceMesh({
        locateFile: (file: string): string => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      faceMeshInstance.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true, // Enable iris detection
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMeshInstance.onResults((results: facemesh.Results): void => {
        if (!webcamRef.current || !canvasRef.current) return;

        const videoWidth = webcamRef.current.videoWidth;
        const videoHeight = webcamRef.current.videoHeight;

        // Set canvas width and height
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const canvasCtx = canvasRef.current.getContext('2d');
        if (!canvasCtx) return;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasCtx.drawImage(
          results.image, 0, 0, canvasRef.current.width, canvasRef.current.height
        );

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          
          // Extract eye data
          const extractedEyeData: EyeData = {
            leftEye: {
              contour: LEFT_EYE_INDICES.map(index => landmarks[index]),
              iris: LEFT_IRIS_INDICES.map(index => landmarks[index]),
              irisCenter: landmarks[468] // Left iris center
            },
            rightEye: {
              contour: RIGHT_EYE_INDICES.map(index => landmarks[index]),
              iris: RIGHT_IRIS_INDICES.map(index => landmarks[index]),
              irisCenter: landmarks[473] // Right iris center
            }
          };
          
          setEyeData(extractedEyeData);
          
          // Draw face mesh
          drawing.drawConnectors(
            canvasCtx,
            landmarks,
            facemesh.FACEMESH_TESSELATION,
            { color: '#C0C0C070', lineWidth: 1 }
          );
          
          // Draw eye contours
          drawing.drawConnectors(
            canvasCtx,
            landmarks,
            facemesh.FACEMESH_RIGHT_EYE,
            { color: '#30FF30', lineWidth: 2 }
          );
          
          drawing.drawConnectors(
            canvasCtx,
            landmarks,
            facemesh.FACEMESH_LEFT_EYE,
            { color: '#30FF30', lineWidth: 2 }
          );
          
          // Draw right pupil in red
          drawIris(canvasCtx, landmarks, RIGHT_IRIS_INDICES, '#FF0000');
          // Draw right pupil center
          canvasCtx.fillStyle = '#FF0000';
          const rightIrisCenter = landmarks[473];
          canvasCtx.beginPath();
          canvasCtx.arc(
            rightIrisCenter.x * canvasRef.current.width,
            rightIrisCenter.y * canvasRef.current.height,
            3,
            0,
            2 * Math.PI
          );
          canvasCtx.fill();
          
          // Draw left pupil in green
          drawIris(canvasCtx, landmarks, LEFT_IRIS_INDICES, '#00FF00');
          // Draw left pupil center
          canvasCtx.fillStyle = '#00FF00';
          const leftIrisCenter = landmarks[468];
          canvasCtx.beginPath();
          canvasCtx.arc(
            leftIrisCenter.x * canvasRef.current.width,
            leftIrisCenter.y * canvasRef.current.height,
            3,
            0,
            2 * Math.PI
          );
          canvasCtx.fill();
          
          // Draw other face parts
          drawing.drawConnectors(
            canvasCtx,
            landmarks,
            facemesh.FACEMESH_RIGHT_EYEBROW,
            { color: '#30FF30', lineWidth: 1 }
          );
          
          drawing.drawConnectors(
            canvasCtx,
            landmarks,
            facemesh.FACEMESH_LEFT_EYEBROW,
            { color: '#30FF30', lineWidth: 1 }
          );
          
          drawing.drawConnectors(
            canvasCtx,
            landmarks,
            facemesh.FACEMESH_FACE_OVAL,
            { color: '#E0E0E0', lineWidth: 1 }
          );
          
          drawing.drawConnectors(
            canvasCtx,
            landmarks,
            facemesh.FACEMESH_LIPS,
            { color: '#E0E0E0', lineWidth: 1 }
          );
        }
        
        canvasCtx.restore();
        setIsLoading(false);
      });
      
      // Helper function to draw iris
      function drawIris(
        ctx: CanvasRenderingContext2D,
        landmarks: Array<{x: number, y: number, z: number}>,
        irisIndices: number[],
        color: string
      ) {
        const width = canvasRef.current?.width || 640;
        const height = canvasRef.current?.height || 480;
        
        // Draw iris as a filled polygon
        ctx.beginPath();
        irisIndices.forEach((index, i) => {
          const point = landmarks[index];
          if (i === 0) {
            ctx.moveTo(point.x * width, point.y * height);
          } else {
            ctx.lineTo(point.x * width, point.y * height);
          }
        });
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      }

      if (webcamRef.current) {
        cameraRef.current = new cam.Camera(webcamRef.current, {
          onFrame: async (): Promise<void> => {
            if (webcamRef.current) {
              await faceMeshInstance.send({ image: webcamRef.current });
            }
          },
          width: 640,
          height: 480
        });

        cameraRef.current.start();
      }

      return () => {
        if (cameraRef.current) {
          cameraRef.current.stop();
        }
        faceMeshInstance.close();
      };
    };

    setupFaceMesh();
  }, []);

  return (
    <div className="container">
      <h1>MediaPipe Face Mesh with Eye Tracking</h1>
      {isLoading && <p>Loading face mesh model...</p>}
      
      <div className="video-container">
        <video
          ref={webcamRef}
          style={{
            position: 'absolute',
            width: 640,
            height: 480,
            visibility: 'hidden'
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            width: 640,
            height: 480
          }}
        />
      </div>
      
      {/* Eye data display */}
      {eyeData && (
        <div className="eye-data">
          <h2>Eye Tracking Data</h2>
          <div className="eye-data-grid">
            <div className="eye-column">
              <h3>Left Eye (Green)</h3>
              <p>Iris Center: X: {eyeData.leftEye.irisCenter.x.toFixed(4)}, Y: {eyeData.leftEye.irisCenter.y.toFixed(4)}</p>
              <p>Contour Points: {eyeData.leftEye.contour.length}</p>
              <details>
                <summary>View Raw Data</summary>
                <pre className="data-display">
                  {JSON.stringify(eyeData.leftEye, null, 2)}
                </pre>
              </details>
            </div>
            <div className="eye-column">
              <h3>Right Eye (Red)</h3>
              <p>Iris Center: X: {eyeData.rightEye.irisCenter.x.toFixed(4)}, Y: {eyeData.rightEye.irisCenter.y.toFixed(4)}</p>
              <p>Contour Points: {eyeData.rightEye.contour.length}</p>
              <details>
                <summary>View Raw Data</summary>
                <pre className="data-display">
                  {JSON.stringify(eyeData.rightEye, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .video-container {
          position: relative;
          width: 640px;
          height: 480px;
          margin-top: 20px;
        }
        
        .eye-data {
          margin-top: 500px;
          width: 100%;
          max-width: 640px;
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
        }
        
        .eye-data-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .eye-column {
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 5px;
          background-color: white;
        }
        
        .eye-column h3 {
          margin-top: 0;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        
        .data-display {
          max-height: 200px;
          overflow-y: auto;
          background-color: #f9f9f9;
          padding: 10px;
          font-size: 12px;
          border-radius: 4px;
          white-space: pre-wrap;
        }
        
        details {
          margin-top: 10px;
        }
        
        summary {
          cursor: pointer;
          color: #0066cc;
        }
      `}</style>
          </div>
        );
      };
      
const FaceMeshPage = dynamic(
    () => Promise.resolve(FaceMeshComponent),
    { ssr: false }
);

export default FaceMeshPage;