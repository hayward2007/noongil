const HeadPoseIndicator: React.FC<{ headPose: { roll: number; pitch: number; yaw: number } }> = ({ headPose }) => {
    return (
      <h4 style={{ position: 'absolute', bottom: 0, left: 0, color: 'white' }}>
        tilt: {headPose.roll.toFixed(2)}°,
        pitch: {headPose.pitch.toFixed(2)}°,
        yaw: {headPose.yaw.toFixed(2)}°
      </h4>
    );
  };

export default HeadPoseIndicator;