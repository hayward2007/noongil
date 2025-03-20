import numpy as np

from defaults.vector import Vector3D

class Coordinate:
    def __init__(self, x_axis: Vector3D, y_axis: Vector3D, z_axis=None):
        self.x = np.array(x_axis)
        self.y = np.array(y_axis)
        if(z_axis is None): self.z = np.cross(self.x, self.y)
        else: self.z = np.array(z_axis)
            
    def unify(self):
        self.x = Vector3D.unify(self.x)
        self.y = Vector3D.unify(self.y)
        self.z = Vector3D.unify(self.z)
        return self
        
    def intify(self):
        self.x = self.x.astype(int)
        self.y = self.y.astype(int)
        self.z = self.z.astype(int)
        return self