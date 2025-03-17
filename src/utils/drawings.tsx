import { MajorFacialFeatures } from "@/utils/enums ";


const drawTriangleInFace = (landmarks: { x: number; y: number; z: number }[], canvasCtx: CanvasRenderingContext2D, canvasRef: HTMLCanvasElement) => {
    canvasCtx.beginPath();
    canvasCtx.moveTo(landmarks[MajorFacialFeatures.RIGHT_IRIS].x * canvasRef.width, landmarks[MajorFacialFeatures.RIGHT_IRIS].y * canvasRef.height);
    canvasCtx.lineTo(landmarks[MajorFacialFeatures.LEFT_IRIS].x * canvasRef.width, landmarks[MajorFacialFeatures.LEFT_IRIS].y * canvasRef.height);
    canvasCtx.lineTo(landmarks[MajorFacialFeatures.NOSE].x * canvasRef.width, landmarks[MajorFacialFeatures.NOSE].y * canvasRef.height);
    canvasCtx.closePath();
    canvasCtx.strokeStyle = "#FFFF00";
    canvasCtx.lineWidth = 2;
    canvasCtx.stroke();
}

export { drawTriangleInFace };