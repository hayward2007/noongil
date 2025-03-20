import numpy as np

class Camera:
    def __init__(self, width=640, height=480,focal_length=1):
        self.focal_length = focal_length
        self.width = width
        self.height = height
        self.center = (self.width//2, self.height//2)
        self.matrix = np.array([[focal_length, 0, 0], [0, focal_length, 0], [0, 0, 1]], dtype=np.float32)