import numpy as np

class Coordination:
    def __init__(self, x_axis, y_axis, z_axis=None):
        self.x_axis = x_axis
        self.y_axis = y_axis
        # z axis is optional
        if(z_axis is None):
            self.z_axis = np.cross(x_axis, y_axis)
        else:
            self.z_axis = z_axis
        # unify all vectors
        self.__unify__()
            
    def __unify__(self):
        self.x_axis = self.x_axis / np.linalg.norm(self.x_axis)
        self.y_axis = self.y_axis / np.linalg.norm(self.y_axis)
        self.z_axis = self.z_axis / np.linalg.norm(self.z_axis)