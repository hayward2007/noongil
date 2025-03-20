import cv2
import mediapipe as mp
import numpy as np

from utils.camera import Camera
from utils.face import Face

# def calculate_face_vector(landmarks):
#     nose_end = (int(landmarks[4][0] * w), int(landmarks[4][1] * h))
#     upper_spot = (int(landmarks[10][0] * w), int(landmarks[10][1] * h))
#     lower_spot = (int(landmarks[152][0] * w), int(landmarks[152][1] * h))
#     mid_spot = ((upper_spot[0] + lower_spot[0])//2, (upper_spot[1] + lower_spot[1])//2)
    
#     global center
#     center = mid_spot
    
#     face_vector_x = np.array([nose_end[0] - mid_spot[0], nose_end[1] - mid_spot[1], landmarks[4][2] - (landmarks[10][2] + landmarks[152][2])/2])
#     face_vector_y = np.array([lower_spot[0] - mid_spot[0], lower_spot[1] - mid_spot[1], landmarks[152][2] - (landmarks[10][2] + landmarks[152][2])/2])
#     face_vector_z = np.cross(face_vector_x, face_vector_y) # cross product of x and y vectors in order to calculate the perpendicular vector
    
#     #make all vectors unit vectors
#     face_vector_x /= np.linalg.norm(face_vector_x)
#     face_vector_y /= np.linalg.norm(face_vector_y)
#     face_vector_z /= np.linalg.norm(face_vector_z)
    
#     visualize_face_vector(frame, (face_vector_x, face_vector_y, face_vector_z))
    
#     return [face_vector_x, face_vector_y, face_vector_z]

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

    
# def project_vector(frame, center, vectors):
#     vector_x, vector_y, vector_z = vectors
#     projected_x = (vector_x[:2] / (vector_x[2] + focal_length)) * vector_length
#     projected_x = projected_x + center
#     projected_x = projected_x.astype(np.int32)
    
#     projected_y = (vector_y[:2] / (vector_y[2] + focal_length)) * vector_length
#     projected_y = projected_y + center
#     projected_y = projected_y.astype(np.int32)
    
#     projected_z = (vector_z[:2] / (vector_z[2] + focal_length))
#     projected_z = projected_z / np.linalg.norm(projected_z) * vector_length
#     projected_z = projected_z + center
#     projected_z = projected_z.astype(np.int32)
    
#     cv2.line(frame, center, projected_z, (0, 0, 255), 6)
#     cv2.line(frame, center, projected_y, (0, 255, 0), 6)
#     cv2.line(frame, center, projected_x, (255, 0, 0), 6)
    
#     return [projected_x, projected_y, projected_z]

if __name__ == '__main__':
    # mp_face_mesh = mp.solutions.face_mesh
    # mp_drawing = mp.solutions.drawing_utils
    # face_mesh =  mp.solutions.face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)
    
    camera = Camera()
    face = Face(camera)
    cap = cv2.VideoCapture(0)
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        # h, w, _ = frame.shape
        face.refresh(frame)
        face.visualize_major_factors()
        
        # frame = face.frame
        cv2.line(frame, camera.center, (camera.center[0], camera.center[1] + 50), (0, 0, 255), 2)  
        
        cv2.imshow('Face Mesh Tracking', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'): break

    cap.release()
    cv2.destroyAllWindows()
