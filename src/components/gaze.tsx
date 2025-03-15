// // pages/face-mesh.tsx

// import React, { useRef, useEffect, useState } from 'react';
// import dynamic from 'next/dynamic';

// // Type definitions for MediaPipe libraries
// declare module '@mediapipe/face_mesh' {
//   export interface Results {
//     image: HTMLVideoElement | HTMLImageElement;
//     multiFaceLandmarks: Array<Array<{
//       x: number;
//       y: number;
//       z: number;
//     }>>;
//   }

//   export class FaceMesh {
//     constructor(options: { locateFile: (file: string) => string });
//     setOptions(options: {
//       maxNumFaces: number;
//       refineLandmarks: boolean;
//       minDetectionConfidence: number;
//       minTrackingConfidence: number;
//     }): void;
//     onResults(callback: (results: Results) => void): void;
//     send(options: { image: HTMLVideoElement | HTMLImageElement }): Promise<void>;
//     close(): void;
//   }
// }

// declare module '@mediapipe/camera_utils' {
//   export class Camera {
//     constructor(
//       videoElement: HTMLVideoElement,
//       options: {
//         onFrame: () => Promise<void>;
//         width: number;
//         height: number;
//       }
//     );
//     start(): Promise<void>;
//     stop(): void;
//   }
// }

// // Define the iris and eye contour indices
// const RIGHT_IRIS_INDICES = [473, 474, 475, 476, 477];
// const LEFT_IRIS_INDICES = [468, 469, 470, 471, 472];

// // Eye contour indices
// const RIGHT_EYE_CONTOUR = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
// const LEFT_EYE_CONTOUR = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];

// // Gaze data interface
// interface GazeData {
//   leftEye: {
//     horizontal: number;  // -1 (full left) to 1 (full right)
//     vertical: number;    // -1 (full up) to 1 (full down)
//     confidence: number;  // 0 to 1
//   };
//   rightEye: {
//     horizontal: number;  // -1 (full left) to 1 (full right)
//     vertical: number;    // -1 (full up) to 1 (full down)
//     confidence: number;  // 0 to 1
//   };
//   combined: {
//     horizontal: number;  // Average of both eyes
//     vertical: number;    // Average of both eyes
//     confidence: number;  // Average of both eyes
//   };
// }

// const FaceMeshGazeTracker: React.FC = () => {
//   const webcamRef = useRef<HTMLVideoElement>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [gazeData, setGazeData] = useState<GazeData | null>(null);
//   const cameraRef = useRef<any>(null);

//   useEffect(() => {
//     const setupGazeTracking = async () => {
//       const facemesh = await import('@mediapipe/face_mesh');
//       const cam = await import('@mediapipe/camera_utils');

//       if (!webcamRef.current) return;

//       const faceMeshInstance = new facemesh.FaceMesh({
//         locateFile: (file: string): string => {
//           return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
//         }
//       });

//       faceMeshInstance.setOptions({
//         maxNumFaces: 1,
//         refineLandmarks: true,  // Important for iris detection
//         minDetectionConfidence: 0.5,
//         minTrackingConfidence: 0.5
//       });

//       faceMeshInstance.onResults((results: facemesh.Results): void => {
//         if (!webcamRef.current) return;
//         setIsLoading(false);

//         if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
//           const landmarks = results.multiFaceLandmarks[0];
          
//           // Extract eye and iris landmarks
//           const leftIris = LEFT_IRIS_INDICES.map(index => landmarks[index]);
//           const rightIris = RIGHT_IRIS_INDICES.map(index => landmarks[index]);
//           const leftEye = LEFT_EYE_CONTOUR.map(index => landmarks[index]);
//           const rightEye = RIGHT_EYE_CONTOUR.map(index => landmarks[index]);
          
//           // Calculate gaze data
//           const leftGaze = calculateGazeDirection(leftIris, leftEye);
//           const rightGaze = calculateGazeDirection(rightIris, rightEye);
          
//           // Combined gaze (average of both eyes)
//           const combinedGaze = {
//             horizontal: (leftGaze.horizontal + rightGaze.horizontal) / 2,
//             vertical: (leftGaze.vertical + rightGaze.vertical) / 2,
//             confidence: (leftGaze.confidence + rightGaze.confidence) / 2
//           };
          
//           setGazeData({
//             leftEye: leftGaze,
//             rightEye: rightGaze,
//             combined: combinedGaze
//           });
//         }
//       });

//       if (webcamRef.current) {
//         cameraRef.current = new cam.Camera(webcamRef.current, {
//           onFrame: async (): Promise<void> => {
//             if (webcamRef.current) {
//               await faceMeshInstance.send({ image: webcamRef.current });
//             }
//           },
//           width: 640,
//           height: 480
//         });

//         cameraRef.current.start();
//       }

//       return () => {
//         if (cameraRef.current) {
//           cameraRef.current.stop();
//         }
//         faceMeshInstance.close();
//       };
//     };

//     setupGazeTracking();
//   }, []);

//   // Function to calculate gaze direction based on iris and eye contour
//   const calculateGazeDirection = (
//     iris: Array<{x: number, y: number, z: number}>,
//     eyeContour: Array<{x: number, y: number, z: number}>
//   ) => {
//     // Calculate the iris center
//     const irisCenter = iris.reduce(
//       (acc, point) => ({
//         x: acc.x + point.x,
//         y: acc.y + point.y,
//         z: acc.z + point.z
//       }),
//       { x: 0, y: 0, z: 0 }
//     );
    
//     irisCenter.x /= iris.length;
//     irisCenter.y /= iris.length;
//     irisCenter.z /= iris.length;
    
//     // Calculate the eye center
//     const eyeCenter = eyeContour.reduce(
//       (acc, point) => ({
//         x: acc.x + point.x,
//         y: acc.y + point.y,
//         z: acc.z + point.z
//       }),
//       { x: 0, y: 0, z: 0 }
//     );
    
//     eyeCenter.x /= eyeContour.length;
//     eyeCenter.y /= eyeContour.length;
//     eyeCenter.z /= eyeContour.length;
    
//     // Find eye width and height for normalization
//     let minX = 1, maxX = 0, minY = 1, maxY = 0;
    
//     eyeContour.forEach(point => {
//       minX = Math.min(minX, point.x);
//       maxX = Math.max(maxX, point.x);
//       minY = Math.min(minY, point.y);
//       maxY = Math.max(maxY, point.y);
//     });
    
//     const eyeWidth = maxX - minX;
//     const eyeHeight = maxY - minY;
    
//     // Calculate normalized horizontal and vertical gaze directions
//     // This gives us values from -1 to 1 where:
//     // horizontal: -1 is far left, 0 is center, 1 is far right
//     // vertical: -1 is far up, 0 is center, 1 is far down
//     const horizontal = (2 * (irisCenter.x - eyeCenter.x)) / eyeWidth;
//     const vertical = (2 * (irisCenter.y - eyeCenter.y)) / eyeHeight;
    
//     // Calculate confidence based on eye openness and visibility
//     // This is a simple heuristic - higher values mean more confidence
//     const confidence = eyeWidth > 0.01 && eyeHeight > 0.005 ? Math.min(eyeWidth * 10, 1) : 0;
    
//     return {
//       horizontal,
//       vertical,
//       confidence
//     };
//   };

//   // Convert numerical gaze to directional terms
//   const getGazeDirection = (horizontal: number, vertical: number) => {
//     // Horizontal direction
//     let hDir = "center";
//     if (horizontal < -0.15) hDir = "left";
//     else if (horizontal > 0.15) hDir = "right";
    
//     // Vertical direction
//     let vDir = "center";
//     if (vertical < -0.15) vDir = "up";
//     else if (vertical > 0.15) vDir = "down";
    
//     // Combine directions
//     if (hDir === "center" && vDir === "center") return "center";
//     return `${vDir}-${hDir}`.replace("center-", "").replace("-center", "");
//   };

//   return (
//     <div className="container">
//       <h1>Gaze Direction Tracking</h1>
//       {isLoading && <p>Loading face mesh model...</p>}
      
//       <div className="video-container">
//         <video
//           ref={webcamRef}
//           style={{
//             width: 640,
//             height: 480
//           }}
//           autoPlay
//           playsInline
//         />
//       </div>
      
//       {gazeData && (
//         <div className="gaze-data">
//           <h2>Gaze Direction Data</h2>
          
//           <div className="gaze-stats">
//             <div>
//               <h3>Combined Gaze</h3>
//               <p><strong>Direction:</strong> {getGazeDirection(gazeData.combined.horizontal, gazeData.combined.vertical)}</p>
//               <p><strong>Horizontal:</strong> {gazeData.combined.horizontal.toFixed(2)} ({gazeData.combined.horizontal < -0.15 ? "Left" : gazeData.combined.horizontal > 0.15 ? "Right" : "Center"})</p>
//               <p><strong>Vertical:</strong> {gazeData.combined.vertical.toFixed(2)} ({gazeData.combined.vertical < -0.15 ? "Up" : gazeData.combined.vertical > 0.15 ? "Down" : "Center"})</p>
//               <p><strong>Confidence:</strong> {(gazeData.combined.confidence * 100).toFixed(1)}%</p>
//             </div>
            
//             <div className="eyes-container">
//               <div className="eye-box">
//                 <h3>Left Eye</h3>
//                 <p><strong>Horizontal:</strong> {gazeData.leftEye.horizontal.toFixed(2)}</p>
//                 <p><strong>Vertical:</strong> {gazeData.leftEye.vertical.toFixed(2)}</p>
//               </div>
              
//               <div className="eye-box">
//                 <h3>Right Eye</h3>
//                 <p><strong>Horizontal:</strong> {gazeData.rightEye.horizontal.toFixed(2)}</p>
//                 <p><strong>Vertical:</strong> {gazeData.rightEye.vertical.toFixed(2)}</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="gaze-visualization">
//             <div className="eye-container">
//               <div 
//                 className="iris" 
//                 style={{ 
//                   transform: `translate(${gazeData.combined.horizontal * 30}px, ${gazeData.combined.vertical * 30}px)` 
//                 }}
//               />
//             </div>
//           </div>
//         </div>
//       )}
      
//       <style jsx>{`
//         .container {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           padding: 20px;
//           font-family: Arial, sans-serif;
//         }
        
//         .video-container {
//           position: relative;
//           width: 640px;
//           height: 480px;
//           margin-top: 20px;
//           border: 1px solid #ccc;
//           overflow: hidden;
//         }
        
//         .gaze-data {
//           margin-top: 20px;
//           width: 640px;
//           padding: 15px;
//           background-color: #f5f5f5;
//           border-radius: 8px;
//         }
        
//         .gaze-stats {
//           display: flex;
//           flex-direction: column;
//           gap: 15px;
//         }
        
//         .eyes-container {
//           display: flex;
//           justify-content: space-between;
//           gap: 15px;
//         }
        
//         .eye-box {
//           flex: 1;
//           padding: 10px;
//           background-color: white;
//           border-radius: 5px;
//           box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//         }
        
//         .gaze-visualization {
//           margin-top: 20px;
//           display: flex;
//           justify-content: center;
//         }
        
//         .eye-container {
//           width: 100px;
//           height: 50px;
//           border: 2px solid #333;
//           border-radius: 50%;
//           position: relative;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           background-color: white;
//         }
        
//         .iris {
//           width: 30px;
//           height: 30px;
//           background-color: #333;
//           border-radius: 50%;
//           transition: transform 0.1s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// // Create a dynamic component with SSR disabled
// const GazeDirectionPage = dynamic(
//   () => Promise.resolve(FaceMeshGazeTracker),
//   { ssr: false }
// );

// export default GazeDirectionPage;