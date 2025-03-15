export function drawFaceOrientationAxes(
    ctx: CanvasRenderingContext2D, // Canvas context
    point: { x: number, y: number, z: number }, 
    roll: number, // Roll angle in degrees
    pitch: number, // Pitch angle in degrees
    yaw: number, // Yaw angle in degrees
    axisLength: number = 50 // Length of each axis
  ) {
    const rollRad = roll * Math.PI / 180;
    const pitchRad = pitch * Math.PI / 180;
    const yawRad = yaw * Math.PI / 180;
    
    // Create rotation matrices for each axis
    // Roll (Z-axis rotation)
    const rollMatrix: number[][] = [
      [Math.cos(rollRad), -Math.sin(rollRad), 0],
      [Math.sin(rollRad), Math.cos(rollRad), 0],
      [0, 0, 1]
    ];
    
    // Pitch (X-axis rotation)
    const pitchMatrix: number[][] = [
      [1, 0, 0],
      [0, Math.cos(pitchRad), -Math.sin(pitchRad)],
      [0, Math.sin(pitchRad), Math.cos(pitchRad)]
    ];
    
    // Yaw (Y-axis rotation)
    const yawMatrix: number[][] = [
      [Math.cos(yawRad), 0, Math.sin(yawRad)],
      [0, 1, 0],
      [-Math.sin(yawRad), 0, Math.cos(yawRad)]
    ];
    
    // Function to multiply matrices
    function multiplyMatrix(a: number[][], b: number[][]): number[][] {
      const result: number[][] = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ];
      
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          for (let k = 0; k < 3; k++) {
            result[i][j] += a[i][k] * b[k][j];
          }
        }
      }
      
      return result;
    }
    
    // Combine rotation matrices: R = Ry * Rx * Rz (yaw, pitch, roll)
    const tempMatrix = multiplyMatrix(yawMatrix, pitchMatrix);
    const rotationMatrix = multiplyMatrix(tempMatrix, rollMatrix);
    
    // Define the axes in 3D space
    const axes = [
      {color: 'red', vector: [axisLength, 0, 0]},  // X-axis (red)
      {color: 'green', vector: [0, axisLength, 0]}, // Y-axis (green)
      {color: 'blue', vector: [0, 0, axisLength]}   // Z-axis (blue)
    ];

    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
    
    // // Draw each axis
    // axes.forEach(axis => {
    //   // Apply rotation to the axis vector
    //   const rotatedVector: number[] = [0, 0, 0];
    //   for (let i = 0; i < 3; i++) {
    //     for (let j = 0; j < 3; j++) {
    //       rotatedVector[i] += rotationMatrix[i][j] * axis.vector[j];
    //     }
    //   }
      
    //   // Convert 3D point to 2D (simple projection)
    //   // Note: z-coordinate affects the x and y positions for perspective
    //   const endPoint = {
    //     x: point.x + rotatedVector[0],
    //     y: point.y + rotatedVector[1]
    //   };
      
    //   // Draw the axis
    //   ctx.beginPath();
    //   ctx.moveTo(point.x, point.y);
    //   ctx.lineTo(endPoint.x, endPoint.y);
    //   ctx.strokeStyle = axis.color;
    //   ctx.lineWidth = 3;
    //   ctx.stroke();
      
    //   // Draw arrowhead
    //   const arrowSize = 5;
    //   const angle = Math.atan2(endPoint.y - point.y, endPoint.x - point.x);
    //   ctx.beginPath();
    //   ctx.moveTo(endPoint.x, endPoint.y);
    //   ctx.lineTo(
    //     endPoint.x - arrowSize * Math.cos(angle - Math.PI / 6),
    //     endPoint.y - arrowSize * Math.sin(angle - Math.PI / 6)
    //   );
    //   ctx.lineTo(
    //     endPoint.x - arrowSize * Math.cos(angle + Math.PI / 6),
    //     endPoint.y - arrowSize * Math.sin(angle + Math.PI / 6)
    //   );
    //   ctx.closePath();
    //   ctx.fillStyle = axis.color;
    //   ctx.fill();
    // });
  }
  