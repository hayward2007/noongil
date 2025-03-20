import cv2
import mediapipe as mp
import numpy as np

from utils.camera import Camera
from utils.face import Face

# def calculate_gaze_vector(landmarks):
#     # left_iris_index = [469, 470, 471, 472]
#     # right_iris_index = [474, 475, 476, 477]
#     left_iris_index = 468
#     right_iris_index = 473
    
#     left_eye_horizontal_index = [243, 247]
#     right_eye_horizontal_index = [463, 467]
    
#     left_eye_center = (landmarks[left_eye_horizontal_index[0]][0] + landmarks[left_eye_horizontal_index[1]][0], landmarks[left_eye_horizontal_index[0]][1] + landmarks[left_eye_horizontal_index[1]][1])
#     left_eye_center = (int(left_eye_center[0] * w / 2), int(left_eye_center[1] * h / 2))
#     right_eye_center = (landmarks[right_eye_horizontal_index[0]][0] + landmarks[right_eye_horizontal_index[1]][0], landmarks[right_eye_horizontal_index[0]][1] + landmarks[right_eye_horizontal_index[1]][1])
#     right_eye_center = (int(right_eye_center[0] * w / 2), int(right_eye_center[1] * h / 2))
    
#     left_eye_vector_x = (int(landmarks[left_iris_index][0] * w) - left_eye_center[0], int(landmarks[left_iris_index][1] * h) - left_eye_center[1], landmarks[left_iris_index][2])
#     left_eye_vector_y = (int(landmarks[left_eye_horizontal_index[1]][0] * w) - left_eye_center[0], int(landmarks[left_eye_horizontal_index[1]][1] * h) - left_eye_center[1], landmarks[left_eye_horizontal_index[1]][2])
#     left_eye_vector_z = np.cross(left_eye_vector_x, left_eye_vector_y)
    
#     right_eye_vector_x = (int(landmarks[right_iris_index][0] * w) - right_eye_center[0], int(landmarks[right_iris_index][1] * h) - right_eye_center[1], landmarks[right_iris_index][2])
#     right_eye_vector_y = (int(landmarks[right_eye_horizontal_index[1]][0] * w) - right_eye_center[0], int(landmarks[right_eye_horizontal_index[1]][1] * h) - right_eye_center[1], landmarks[right_eye_horizontal_index[1]][2])
#     right_eye_vector_z = np.cross(right_eye_vector_x, right_eye_vector_y)
    
#     left_eye_vector_x /= np.linalg.norm(left_eye_vector_x)
#     left_eye_vector_y /= np.linalg.norm(left_eye_vector_y)
#     left_eye_vector_z /= np.linalg.norm(left_eye_vector_z)
    
#     right_eye_vector_x /= np.linalg.norm(right_eye_vector_x)
#     right_eye_vector_y /= np.linalg.norm(right_eye_vector_y)
#     right_eye_vector_z /= np.linalg.norm(right_eye_vector_z)
    
#     left_eye_vectors = (left_eye_vector_x, left_eye_vector_y, left_eye_vector_z)
#     right_eye_vectors = (right_eye_vector_x, right_eye_vector_y, right_eye_vector_z)
    
#     # project_vector(frame, left_eye_center, left_eye_vectors)
#     # project_vector(frame, right_eye_center, right_eye_vectors)
    
    
#     cv2.circle(frame, (int(landmarks[left_iris_index][0] * w), int(landmarks[left_iris_index][1] * h)), 2, (0, 255, 255), -1)
#     cv2.circle(frame, (int(landmarks[right_iris_index][0] * w), int(landmarks[right_iris_index][1] * h)), 2, (0, 255, 255), -1)
    
#     return [left_eye_vectors, right_eye_vectors]

if __name__ == '__main__':
    camera = Camera()
    face = Face(camera)
    cap = cv2.VideoCapture(0)
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        face.refresh(frame)
        if(face.face_found()):
            # face.visualize_major_factors(frame)
            face.visualize_coordinate(frame)
            face.visualize_coordinate_size(frame)
        cv2.imshow('Face Mesh Tracking', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'): break

    cap.release()
    cv2.destroyAllWindows()
