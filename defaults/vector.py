import numpy as np

class Vector3D:
    def unify(vector):
        return vector / np.linalg.norm(vector)