import mediapipe as mp
import numpy as np
import cv2

from defaults.coordinate import Coordinate
from defaults.vector import Vector3D
from utils.camera import Camera

class Face:
    def __init__(self, camera: Camera, vector_length=100):
        self.frame = None
        self.camera = camera
        self.vector_length = vector_length
        self.mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)
        
    def no_face_found(self):
        if(self.result.multi_face_landmarks is None):
            return True
        return False
    
    def face_found(self):
        return not self.no_face_found()
        
    def refresh(self, frame):
        self.frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        self.frame_height, self.frame_width, _ = self.frame.shape
        self.result = self.mesh.process(self.frame)
        if(self.no_face_found()): return
        for temp in self.result.multi_face_landmarks:
            self.landmarks = [(lm.x, lm.y, lm.z) for lm in temp.landmark]
        
        self.nose_end = self.return_point(4)
        self.upper_spot = self.return_point(10)
        self.lower_spot = self.return_point(152)
        self.mid_spot = self.return_center(10, 152)
        
        self.coordinate = self.calculate_coordinate()
        self.projected_coordinate = self.project_coordinate(self.coordinate)
        
    def return_point(self, index: int):
        return (int(self.landmarks[index][0] * self.frame_width), int(self.landmarks[index][1] * self.frame_height))
    
    def return_center(self, index1: int, index2: int):
        return (int((self.landmarks[index1][0] + self.landmarks[index2][0]) * self.frame_width / 2), int((self.landmarks[index1][1] + self.landmarks[index2][1]) * self.frame_height / 2))
    
    def visualize_coordinate(self, frame):
        try:
            cv2.line(frame, self.mid_spot, self.projected_coordinate.z, (255, 0, 0), 6)
            cv2.line(frame, self.mid_spot, self.projected_coordinate.y, (0, 255, 0), 6)
            cv2.line(frame, self.mid_spot, self.projected_coordinate.x, (0, 0, 255), 6)
        except:
            pass
        
    def visualize_coordinate_size(self, frame):
        cv2.putText(frame, f'[{self.coordinate.x[0]:.6f} {self.coordinate.x[1]:.6f} {self.coordinate.x[2]:.6f}]', (0,50), 0, 1, (255, 0, 0))
        cv2.putText(frame, f'[{self.coordinate.y[0]:.6f} {self.coordinate.y[1]:.6f} {self.coordinate.y[2]:.6f}]', (0,100), 0, 1, (0, 255, 0))
        cv2.putText(frame, f'[{self.coordinate.z[0]:.6f} {self.coordinate.z[1]:.6f} {self.coordinate.z[2]:.6f}]', (0,150), 0, 1, (0, 0, 255))
        
    def visualize_major_factors(self, frame):
        cv2.line(frame, (int(self.landmarks[10][0] * self.frame_width), int(self.landmarks[10][1] * self.frame_height)), (int(self.landmarks[152][0] * self.frame_width), int(self.landmarks[152][1] * self.frame_height)), (0, 0, 255), 2)
        cv2.line(frame, (int(self.landmarks[61][0] * self.frame_width), int(self.landmarks[61][1] * self.frame_height)), (int(self.landmarks[291][0] * self.frame_width), int(self.landmarks[291][1] * self.frame_height)), (0, 0, 255), 2)
        cv2.line(frame, (int(self.landmarks[33][0] * self.frame_width), int(self.landmarks[33][1] * self.frame_height)), (int(self.landmarks[263][0] * self.frame_width), int(self.landmarks[263][1] * self.frame_height)), (0, 255, 0), 2)
        cv2.line(frame, (int(self.landmarks[4][0] * self.frame_width), int(self.landmarks[4][1] * self.frame_height)), (int(self.landmarks[263][0] * self.frame_width), int(self.landmarks[263][1] * self.frame_height)), (0, 255, 0), 2)
        cv2.line(frame, (int(self.landmarks[33][0] * self.frame_width), int(self.landmarks[33][1] * self.frame_height)), (int(self.landmarks[4][0] * self.frame_width), int(self.landmarks[4][1] * self.frame_height)), (0, 255, 0), 2)
        cv2.line(frame, (int(self.landmarks[10][0] * self.frame_width), int(self.landmarks[10][1] * self.frame_height)), (int(self.landmarks[4][0] * self.frame_width), int(self.landmarks[4][1] * self.frame_height)), (0, 255, 0), 2)
        cv2.line(frame, (int(self.landmarks[152][0] * self.frame_width), int(self.landmarks[152][1] * self.frame_height)), (int(self.landmarks[4][0] * self.frame_width), int(self.landmarks[4][1] * self.frame_height)), (0, 255, 0), 2)
    
    def calculate_coordinate(self):
        vector_x = [self.nose_end[0] - self.mid_spot[0], self.nose_end[1] - self.mid_spot[1], self.landmarks[4][2] - (self.landmarks[10][2] + self.landmarks[152][2])/2]
        vector_y = [self.lower_spot[0] - self.mid_spot[0], self.lower_spot[1] - self.mid_spot[1], self.landmarks[152][2] - (self.landmarks[10][2] + self.landmarks[152][2])/2]
        return Coordinate(vector_x, vector_y).unify()
    
    def project_vector(self, vector):
        return (vector[:2] / (vector[2] + self.camera.focal_length)) * self.vector_length + self.mid_spot
        
    def project_vector_unified(self, vector):
        return Vector3D.unify((vector[:2] / (vector[2] + self.camera.focal_length))) * self.vector_length + self.mid_spot
    
    def project_coordinate(self, coordinate: Coordinate):
        return Coordinate(self.project_vector(coordinate.x), self.project_vector(coordinate.y), self.project_vector_unified(coordinate.z)).intify()