import mediapipe as mp
import numpy as np
import cv2

from utils.camera import Camera
from utils.face import Face
from utils.eye import Eye

if __name__ == '__main__':
    camera = Camera()
    face = Face(camera)
    eye = Eye(camera, face)
    cap = cv2.VideoCapture(0)
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        face.refresh(frame)
        eye.refresh(frame)

        if(face.face_found()):
            # face.visualize_major_factors(frame)
            face.visualize_coordinate(frame)
            # face.visualize_coordinate_size(frame)
            # eye.visualize_major_factors(frame)
            eye.visualize_eye_vectors(frame)
            
        cv2.imshow('Face Mesh Tracking', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'): break

    cap.release()
    cv2.destroyAllWindows()
