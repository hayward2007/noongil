import React from 'react';
import { MajorFacialFeatures } from '@/utils/enums ';

export const calculateAngle = (landmarks: { x: number; y: number; z: number }[]) => {
    const leftEye = landmarks[MajorFacialFeatures.LEFT_EYE];
    const rightEye = landmarks[MajorFacialFeatures.RIGHT_EYE];

    const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
    return angle;
}

export const calculateTriangleInFace = (landmarks: { x: number; y: number; z: number }[]) => {

    return <div>

    </div>;
}