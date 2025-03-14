"use client";

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Type definitions for MediaPipe libraries
declare module '@mediapipe/face_mesh' {
  export interface Results {
    image: HTMLVideoElement | HTMLImageElement;
    multiFaceLandmarks: Array<Array<{
      x: number;
      y: number;
      z: number;
    }>>;
  }

  export class FaceMesh {
    constructor(options: { locateFile: (file: string) => string });
    setOptions(options: {
      maxNumFaces: number;
      refineLandmarks: boolean;
      minDetectionConfidence: number;
      minTrackingConfidence: number;
    }): void;
    onResults(callback: (results: Results) => void): void;
    send(options: { image: HTMLVideoElement | HTMLImageElement }): Promise<void>;
    close(): void;
  }

  export const FACEMESH_TESSELATION: Array<[number, number]>;
  export const FACEMESH_RIGHT_EYE: Array<[number, number]>;
  export const FACEMESH_RIGHT_EYEBROW: Array<[number, number]>;
  export const FACEMESH_LEFT_EYE: Array<[number, number]>;
  export const FACEMESH_LEFT_EYEBROW: Array<[number, number]>;
  export const FACEMESH_FACE_OVAL: Array<[number, number]>;
  export const FACEMESH_LIPS: Array<[number, number]>;
}

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
}

// Creating a component that will only be loaded client-side
const FaceMeshComponent: React.FC = () => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
        refineLandmarks: true,
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

        if (results.multiFaceLandmarks) {
          for (const landmarks of results.multiFaceLandmarks) {
            drawing.drawConnectors(
              canvasCtx,
              landmarks,
              facemesh.FACEMESH_TESSELATION,
              { color: '#C0C0C070', lineWidth: 1 }
            );
            drawing.drawConnectors(
              canvasCtx,
              landmarks,
              facemesh.FACEMESH_RIGHT_EYE,
              { color: '#FF3030', lineWidth: 1 }
            );
            drawing.drawConnectors(
              canvasCtx,
              landmarks,
              facemesh.FACEMESH_RIGHT_EYEBROW,
              { color: '#FF3030', lineWidth: 1 }
            );
            drawing.drawConnectors(
              canvasCtx,
              landmarks,
              facemesh.FACEMESH_LEFT_EYE,
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
        }
        canvasCtx.restore();
        setIsLoading(false);
      });

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
      <h1>MediaPipe Face Mesh in Next.js</h1>
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
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }
        
        .video-container {
          position: relative;
          width: 640px;
          height: 480px;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

// Create a dynamic component with SSR disabled to avoid server-side rendering issues
const FaceMeshPage = dynamic(
  () => Promise.resolve(FaceMeshComponent),
  { ssr: false }
);

export default FaceMeshPage;