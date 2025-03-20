import numpy as np

class Vector:
    def __init__(self, x, y, z):
        self.vector = np.array([x, y, z])
        self.vector = self.vector / np.linalg.norm(self.vector)
    
    def __cross__(self, other):
        temp = np.cross(self.vector, other.vector)
        return temp / np.linalg.norm(temp)
    
    def __unify__(self):
        return self.vector / np.linalg.norm(self.vector)
    
    