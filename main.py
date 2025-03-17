import cv2
import mediapipe as mp
import numpy as np

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)
mp_drawing = mp.solutions.drawing_utils

focal_length = 1  # 초점 거리 (가상의 값)
cam_matrix = np.array([[focal_length, 0, 0],
                        [0, focal_length, 0],
                        [0, 0, 1]], dtype=np.float32)

cap = cv2.VideoCapture(0)
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    h, w, _ = frame.shape
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)
    
    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            landmarks = [(lm.x, lm.y, lm.z) for lm in face_landmarks.landmark]
            # mp_drawing.draw_landmarks(frame, face_landmarks, mp_face_mesh.FACEMESH_TESSELATION)
            cv2.line(frame, (int(landmarks[10][0] * w), int(landmarks[10][1] * h)), (int(landmarks[152][0] * w), int(landmarks[152][1] * h)), (0, 0, 255), 2)
            cv2.line(frame, (int(landmarks[61][0] * w), int(landmarks[61][1] * h)), (int(landmarks[291][0] * w), int(landmarks[291][1] * h)), (0, 0, 255), 2)
            cv2.line(frame, (int(landmarks[33][0] * w), int(landmarks[33][1] * h)), (int(landmarks[263][0] * w), int(landmarks[263][1] * h)), (0, 255, 0), 2)
            cv2.line(frame, (int(landmarks[4][0] * w), int(landmarks[4][1] * h)), (int(landmarks[263][0] * w), int(landmarks[263][1] * h)), (0, 255, 0), 2)
            cv2.line(frame, (int(landmarks[33][0] * w), int(landmarks[33][1] * h)), (int(landmarks[4][0] * w), int(landmarks[4][1] * h)), (0, 255, 0), 2)
            cv2.line(frame, (int(landmarks[10][0] * w), int(landmarks[10][1] * h)), (int(landmarks[4][0] * w), int(landmarks[4][1] * h)), (0, 255, 0), 2)
            cv2.line(frame, (int(landmarks[152][0] * w), int(landmarks[152][1] * h)), (int(landmarks[4][0] * w), int(landmarks[4][1] * h)), (0, 255, 0), 2)
            
            nose_end = (int(landmarks[4][0] * w), int(landmarks[4][1] * h))
            upper_spot = (int(landmarks[10][0] * w), int(landmarks[10][1] * h))
            lower_spot = (int(landmarks[152][0] * w), int(landmarks[152][1] * h))
            mid_spot = ((upper_spot[0] + lower_spot[0])//2, (upper_spot[1] + lower_spot[1])//2)
            
            length = 100

            face_vector_x = np.array([nose_end[0] - mid_spot[0], nose_end[1] - mid_spot[1]])
            face_vector_x = face_vector_x / np.linalg.norm(face_vector_x)
            face_vector_x = face_vector_x.astype(np.int32)
            
            face_vector_y = np.array([lower_spot[0] - mid_spot[0], lower_spot[1] - mid_spot[1]])
            face_vector_y = face_vector_y / np.linalg.norm(face_vector_y)
            face_vector_y = face_vector_y.astype(np.int32)
            
            # face_vector_z = np.cross(face_vector_x, face_vector_y)
            # face_vector_z = face_vector_z / np.linalg.norm(face_vector_z)
            # face_vector_z = face_vector_z.astype(np.int32)
            
            # projected_x = length * (face_vector_x[:2] / (face_vector_x[2] + focal_length))
            # projected_x = projected_x.astype(np.int32)
            # cv2.line(frame, mid_spot, (mid_spot[0] + projected_x[0], mid_spot[1] + projected_x[1]), (255, 0, 0), 6)
            
            # projected_y = length * (face_vector_y[:2] / (face_vector_y[2] + focal_length))
            # projected_y = projected_y.astype(np.int32)
            # cv2.line(frame, mid_spot, (mid_spot[0] + projected_y[0], mid_spot[1] + projected_y[1]), (0, 255, 0), 6)

            # projected_z = length * (face_vector_z[:2] / (face_vector_z[2] + focal_length))
            # projected_z = projected_z.astype(np.int32)
            # cv2.line(frame, mid_spot, (mid_spot[0] + projected_z[0], mid_spot[1] + projected_z[1]), (0, 0, 255), 6)
            
            # target_vector_x = np.array([face_vector_x[0] * length + mid_spot[0], face_vector_x[1] * length + mid_spot[1]])
            # target_vector_x = target_vector_x.astype(np.int32)
            # target_vector_y = np.array([face_vector_y[0] * length + mid_spot[0], face_vector_y[1] * length + mid_spot[1]])
            # target_vector_y = target_vector_y.astype(np.int32)
            # target_vector_z = (face_vector_z[:2] * length + mid_spot).astype(np.int32)
            
            # cv2.line(frame, target_vector_x, mid_spot, (255, 0, 0), 6)
            # cv2.line(frame, target_vector_y, mid_spot, (0, 255, 0), 6)
            # cv2.line(frame, target_vector_z, mid_spot, (0, 0, 255), 6)
            
            cv2.line(frame, mid_spot, (mid_spot[0] + face_vector_x[0]*length, mid_spot[1] + face_vector_x[1]*length), (255, 0, 0), 6)
            cv2.line(frame, mid_spot, (mid_spot[0] + face_vector_y[0]*length, mid_spot[1] + face_vector_y[1]*length), (0, 255, 0), 6)
            
    cv2.imshow('Face Mesh Tracking', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
