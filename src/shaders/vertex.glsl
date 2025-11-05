uniform sampler2D map;
uniform sampler2D depthMap;
uniform float depthScale;
uniform float yaw;
uniform float pitch;

varying vec2 vUv;

void main() {
  vUv = uv;

  // Sample depth map
  float depth = texture2D(depthMap, uv).r;

  // Calculate displacement based on depth and rotation
  // Yaw rotates around Y axis (left/right)
  // Pitch rotates around X axis (up/down)
  
  // Convert angles to radians
  float yawRad = yaw * 3.14159265359 / 180.0;
  float pitchRad = pitch * 3.14159265359 / 180.0;

  // Calculate displacement direction based on rotation
  // For parallax effect, displace vertices based on depth and rotation
  vec3 pos = position;
  
  // Apply depth-based displacement along normal
  vec3 normal = normalize(normal);
  float displacement = (depth - 0.5) * depthScale;
  
  // Apply rotation-based offset
  vec2 rotationOffset = vec2(
    sin(yawRad) * displacement,
    sin(pitchRad) * displacement
  );
  
  pos.xy += rotationOffset;
  pos += normal * displacement;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

