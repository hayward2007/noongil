import React, { useRef, useEffect, useState } from "react";
import HeadPoseIndicator from "@/components/headpose ";
import { drawFaceOrientationAxes } from "@/utils/drawOrientation ";

const FaceMeshGazeArrows: React.FC = () => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [headPose, setHeadPose] = useState<{ roll: number; pitch: number; yaw: number }>({ roll: 0, pitch: 0, yaw: 0 });

  useEffect(() => {
    const setupFaceMesh = async () => {
      const facemesh = await import("@mediapipe/face_mesh");
      const cam = await import("@mediapipe/camera_utils");
      const drawing = await import("@mediapipe/drawing_utils");

      if (!webcamRef.current || !canvasRef.current) return;

      const faceMeshInstance = new facemesh.FaceMesh({
        locateFile: (file: string): string => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      faceMeshInstance.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,  // Important for iris detection
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

        const canvasCtx = canvasRef.current.getContext("2d");
        if (!canvasCtx) return;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasCtx.drawImage(
          results.image, 0, 0, canvasRef.current.width, canvasRef.current.height
        );

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];

          setHeadPose(calculateHeadPose(landmarks));


          drawing.drawConnectors(
            canvasCtx,
            landmarks,
            facemesh.FACEMESH_CONTOURS,
            { color: "#F00", lineWidth: 2 }
          );

          drawFaceOrientationAxes(canvasCtx, landmarks[1], headPose.roll, headPose.pitch, headPose.yaw);
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
  },[]);
    
  return (
    <div>
      {isLoading && <p>Loading...</p>}
      <video
        ref={webcamRef}
        autoPlay
        playsInline
        muted
        style={{ display: "none" }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      <HeadPoseIndicator headPose={headPose} />
    </div>
  );
};

export default FaceMeshGazeArrows;