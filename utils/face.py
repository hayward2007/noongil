import numpy as np
import mediapipe as mp
import cv2

from utils.camera import Camera

class Face:
    def __init__(self, camera: Camera):
        self.camera = camera
        self.mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)
        
    def no_face_found(self):
        if(self.result.multi_face_landmarks is None):
            return True
        return False
        
    def refresh(self, frame):
        self.frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        self.result = self.mesh.process(self.frame)
        
        if(self.no_face_found()): return
        
        for temp in self.result.multi_face_landmarks:
            self.landmarks = [(lm.x, lm.y, lm.z) for lm in temp.landmark]
        
        # self.nose_end = (int(landmarks[4][0] * self.camera.width), int(landmarks[4][1] * self.camera.height))
        # self.upper_spot = (int(landmarks[10][0] * self.camera.width), int(landmarks[10][1] * self.camera.height))
        # self.lower_spot = (int(landmarks[152][0] * self.camera.width), int(landmarks[152][1] * self.camera.height))
        # self.mid_spot = ((self.upper_spot[0] + self.lower_spot[0])//2, (self.upper_spot[1] + self.lower_spot[1])//2)
        self.nose_end = self.__return_point(4)
        self.upper_spot = self.__return_point(10)
        self.lower_spot = self.__return_point(152)
        self.mid_spot = self.__return_center(10, 152)
        
    def __return_point(self, index: int):
        return (int(self.landmarks[index][0] * self.camera.width), int(self.landmarks[index][1] * self.camera.height))
    
    def __return_center(self, index1, index2):
        return (int((self.landmarks[index1][0] + self.landmarks[index2][0]) * self.camera.width / 2), int((self.landmarks[index1][1] + self.landmarks[index2][1]) * self.camera.height / 2))
        
    def visualize_vectors(self):
        vector_x, vector_y, vector_z = self.coordinates
        cv2.putText(self.frame, f'[{vector_x[0]:.6f} {vector_x[1]:.6f} {vector_x[2]:.6f}]', (0,50), 0, 1, (255, 0, 0))
        cv2.putText(self.frame, f'[{vector_y[0]:.6f} {vector_y[1]:.6f} {vector_y[2]:.6f}]', (0,100), 0, 1, (0, 255, 0))
        cv2.putText(self.frame, f'[{vector_z[0]:.6f} {vector_z[1]:.6f} {vector_z[2]:.6f}]', (0,150), 0, 1, (0, 0, 255))
        
    def visualize_major_factors(self):
        if(self.no_face_found()): return
        self.draw_line(self.nose_end, self.mid_spot)
        self.draw_line(self.upper_spot, self.lower_spot)
        self.draw_line(self.nose_end, self.upper_spot)
        self.draw_line(self.nose_end, self.lower_spot)
        # cv2.line(frame, (int(self.landmarks[10][0] * self.camera.width), int(self.landmarks[10][1] * self.camera.height)), (int(self.landmarks[152][0] * w), int(landmarks[152][1] * h)), (0, 0, 255), 2)
        # cv2.line(frame, (int(self.landmarks[61][0] * self.camera.width), int(self.landmarks[61][1] * self.camera.height)), (int(self.landmarks[291][0] * w), int(landmarks[291][1] * h)), (0, 0, 255), 2)
        # cv2.line(frame, (int(self.landmarks[33][0] * self.camera.width), int(self.landmarks[33][1] * self.camera.height)), (int(self.landmarks[263][0] * w), int(landmarks[263][1] * h)), (0, 255, 0), 2)
        # cv2.line(frame, (int(self.landmarks[4][0] * self.camera.width), int(self.landmarks[4][1] * self.camera.height)), (int(self.landmarks[263][0] * w), int(landmarks[263][1] * h)), (0, 255, 0), 2)
        # cv2.line(frame, (int(self.landmarks[33][0] * self.camera.width), int(self.landmarks[33][1] * self.camera.height)), (int(self.landmarks[4][0] * w), int(landmarks[4][1] * h)), (0, 255, 0), 2)
        # cv2.line(frame, (int(self.landmarks[10][0] * self.camera.width), int(self.landmarks[10][1] * self.camera.height)), (int(self.landmarks[4][0] * w), int(landmarks[4][1] * h)), (0, 255, 0), 2)
        # cv2.line(frame, (int(self.landmarks[152][0] * self.camera.width), int(self.landmarks[152][1] * self.camera.height)), (int(self.landmarks[4][0] * w), int(landmarks[4][1] * h)), (0, 255, 0), 2)
    
    def draw_line(self, start, end, color=(0, 255, 0)):
        cv2.line(self.frame, (int(start[0] * self.camera.width), int(start[1] * self.camera.height)), (int(end[0] * self.camera.width), int(end[1] * self.camera.height)), color, 2)