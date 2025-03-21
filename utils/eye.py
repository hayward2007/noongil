import mediapipe as mp
import numpy as np
import cv2

from defaults.coordinate import Coordinate
from utils.camera import Camera
from utils.face import Face


class Eye:
    # iris indices
    LEFT_IRIS = [469, 470, 471, 472]
    RIGHT_IRIS = [474, 475, 476, 477]
    LEFT_IRIS_CENTER = 468
    RIGHT_IRIS_CENTER = 473
    
    # left eye indices
    LEFT_EYE_OUTLINE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
    LEFT_EYE_UPPER = [33, 246, 161, 160, 159, 158, 157, 173]
    LEFT_EYE_LOWER = [33, 7, 163, 144, 145, 153, 154, 155, 133]
    LEFT_EYE_HORIZONTAL = [33, 133]

    # right eye indices
    RIGHT_EYE_OUTLINE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
    RIGHT_EYE_UPPER = [362, 398, 384, 385, 386, 387, 388, 466]
    RIGHT_EYE_LOWER = [362, 382, 381, 380, 374, 373, 390, 249, 263]
    RIGHT_EYE_HORIZONTAL = [362, 263]
     
 
    def __init__(self, camera: Camera, face: Face):
        self.camera = camera
        self.face = face
        
    def refresh(self, frame):
        self.frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        self.frame_height, self.frame_width, _ = self.frame.shape
        
        if(self.face.no_face_found()): return
        
        self.left_iris_center = self.face.return_point(self.LEFT_IRIS_CENTER)
        self.right_iris_center = self.face.return_point(self.RIGHT_IRIS_CENTER)
        
        self.left_iris = [i for i in [self.face.return_point(index) for index in self.LEFT_IRIS]]
        self.right_iris = [i for i in [self.face.return_point(index) for index in self.RIGHT_IRIS]]
        
        self.left_eye_outline = [i for i in [self.face.return_point(index) for index in self.LEFT_EYE_OUTLINE]]
        self.right_eye_outline = [i for i in [self.face.return_point(index) for index in self.RIGHT_EYE_OUTLINE]]
        
        self.left_eye_upper = [i for i in [self.face.return_point(index) for index in self.LEFT_EYE_UPPER]]
        self.right_eye_upper = [i for i in [self.face.return_point(index) for index in self.RIGHT_EYE_UPPER]]
        
        self.left_eye_lower = [i for i in [self.face.return_point(index) for index in self.LEFT_EYE_LOWER]]
        self.right_eye_lower = [i for i in [self.face.return_point(index) for index in self.RIGHT_EYE_LOWER]]
        
        # self.left_eye_vector = self.calculate_eye_vector(self.calculate_eye_orientation()) + self.face.coordinate.z
        
        
        # print(self.left_eye_vector)
        # self.right_eye_vector = self.calculate_eye_vector(self.calculate_eye_orientation())
        
        
        # self.left_eye_horizontal = [i for i in [self.face.return_point(index) for index in self.LEFT_EYE_HORIZONTAL]]
        # self.right_eye_horizontal = [i for i in [self.face.return_point(index) for index in self.RIGHT_EYE_HORIZONTAL]]
    
    # def calculate_coordinate(self):
    #     x_axis = np.array(self.landmarks[0]) - np.array(self.landmarks[3])
    #     y_axis = np.array(self.landmarks[1]) - np.array(self.landmarks[5])
    #     return Coordinate(x_axis, y_axis).unify()
    
    # def project_coordinate(self, coordinate):
        # return Coordinate(np.dot(self.camera.rotation_matrix, coordinate.x), np.dot(self.camera.rotation_matrix, coordinate.y), np.dot(self.camera.rotation_matrix, coordinate.z)).intify()
        
    def visualize_eye_vectors(self, frame):
        if not hasattr(self, 'left_iris_center') or self.face.no_face_found():
            return
        
        cv2.line(frame, self.left_iris_center, np.array(self.face.project_vector(self.left_eye_vector)).astype(np.int32), (255, 0, 0), 6)
        
        # cv2.line(frame, self.left_iris_center, np.array(self.face.project_vector(self.calculate_eye_vector(self.calculate_eye_orientation()))).astype(np.int32), (255, 0, 0), 6)
        # cv2.line(frame, self.right_iris_center, np.array(self.face.project_vector(self.calculate_eye_vector(self.calculate_eye_orientation()))).astype(np.int32), (255, 0, 0), 6)
    
        
    def visualize_major_factors(self, frame):
        cv2.circle(frame, self.left_iris_center, 2, (0, 0, 255), 6)
        cv2.circle(frame, self.right_iris_center, 2, (0, 0, 255), 6)
        
        # cv2.polylines(frame, [np.array(self.left_iris)], True, (0, 0, 255), 2)
        # cv2.polylines(frame, [np.array(self.right_iris)], True, (0, 0, 255), 2)
        
        cv2.polylines(frame, [np.array(self.left_eye_outline)], True, (0, 255, 0), 2)
        cv2.polylines(frame, [np.array(self.right_eye_outline)], True, (0, 255, 0), 2)
        
        # cv2.polylines(frame, [np.array(self.left_eye_upper)], True, (0, 255, 0), 2)
        # cv2.polylines(frame, [np.array(self.right_eye_upper)], True, (0, 255, 0), 2)
        
        cv2.polylines(frame, [np.array(self.left_eye_lower)], True, (0, 255, 0), 2)
        cv2.polylines(frame, [np.array(self.right_eye_lower)], True, (0, 255, 0), 2)

        
    def calculate_eye_orientation(self):
        if not hasattr(self, 'left_iris_center') or self.face.no_face_found():
            return 0, 0, 0
        
        # # Calculate eye centers
        # left_eye_center = np.mean(self.left_eye_outline, axis=0)
        # right_eye_center = np.mean(self.right_eye_outline, axis=0)
        
        # # Get eye dimensions
        # left_eye_width = max(p[0] for p in self.left_eye_outline) - min(p[0] for p in self.left_eye_outline)
        # left_eye_height = max(p[1] for p in self.left_eye_outline) - min(p[1] for p in self.left_eye_outline)
        
        # right_eye_width = max(p[0] for p in self.right_eye_outline) - min(p[0] for p in self.right_eye_outline)
        # right_eye_height = max(p[1] for p in self.right_eye_outline) - min(p[1] for p in self.right_eye_outline)
        
        # # Calculate normalized iris positions (-1 to 1 range where 0 is center)
        # left_x_ratio = 2 * (self.left_iris_center[0] - left_eye_center[0]) / left_eye_width
        # left_y_ratio = 2 * (self.left_iris_center[1] - left_eye_center[1]) / left_eye_height
        
        # right_x_ratio = 2 * (self.right_iris_center[0] - right_eye_center[0]) / right_eye_width
        # right_y_ratio = 2 * (self.right_iris_center[1] - right_eye_center[1]) / right_eye_height
        
        # # Convert to angles (approximate)
        # max_angle = 50  # degrees - typical maximum eye rotation
        
        # # Calculate final angles
        # yaw = ((left_x_ratio + right_x_ratio) / 2) * max_angle
        # pitch = -((left_y_ratio + right_y_ratio) / 2) * max_angle  # Negative because y increases downward
        
        # # Roll calculation from eye orientation
        # left_corner = np.array(self.left_eye_outline[0])
        # right_corner = np.array(self.left_eye_outline[8])  # Adjust index if needed
        # eye_vector = right_corner - left_corner
        # roll = np.degrees(np.arctan2(eye_vector[1], eye_vector[0]))
        
        return yaw, pitch, roll

    # def calculate_eye_vector(self, orientation):
    #     yaw, pitch, roll = orientation
    #     # Convert to radians
    #     yaw = np.radians(yaw)
    #     pitch = np.radians(pitch)
    #     roll = np.radians(roll)
        
    #     # Calculate rotation matrix
    #     yaw_matrix = np.array([[np.cos(yaw), 0, np.sin(yaw)],
    #                            [0, 1, 0],
    #                            [-np.sin(yaw), 0, np.cos(yaw)]])
        
    #     pitch_matrix = np.array([[1, 0, 0],
    #                              [0, np.cos(pitch), -np.sin(pitch)],
    #                              [0, np.sin(pitch), np.cos(pitch)]])
        
    #     roll_matrix = np.array([[np.cos(roll), -np.sin(roll), 0],
    #                             [np.sin(roll), np.cos(roll), 0],
    #                             [0, 0, 1]])
        
    #     # Combine rotations
    #     rotation_matrix = np.dot(yaw_matrix, np.dot(pitch_matrix, roll_matrix))
        
    #     # Get eye vector
    #     eye_vector = np.array([0, 0, 1])
    #     rotated_eye_vector = np.dot(rotation_matrix, eye_vector)
        
    #     return rotated_eye_vector
        