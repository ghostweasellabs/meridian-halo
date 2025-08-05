/**
 * GLSL shader sources.
 * Vertex shader computes per-point size and inner-layer biasing.
 * Fragment shader shades points with palette blending, depth tinting, and soft edges.
 */
export const vert = /*glsl*/`
  attribute float size;
  attribute vec3 color;
  attribute float seed;
  attribute float baseR;
  attribute float layer;
  varying vec3 vColor;
  varying float vRad01;
  varying float vSeed;
  varying float vLayer;
  varying float vEyeZ;
  uniform float u_radius;
  uniform float u_innerRadiusFactor;
  void main() {
    vColor = color;
    vSeed = seed;
    vLayer = layer;
    vec3 p = position;
    float r = length(p);
    vRad01 = clamp(r / u_radius, 0.0, 1.0);
    if (layer > 0.5) {
      vec3 dir = normalize(p);
      vec3 target = dir * (u_innerRadiusFactor * u_radius);
      p = mix(p, target, 0.12);
    }
    float moodSize = u_size;
    gl_PointSize = size * moodSize;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vEyeZ = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const frag = /*glsl*/`
  uniform sampler2D u_tex;
  uniform vec3 u_colorAccent;
  uniform float u_moodMix;
  uniform float u_alphaScale;
  uniform float u_alphaCut;
  uniform vec3 u_innerA; uniform vec3 u_outerA;
  uniform vec3 u_innerB; uniform vec3 u_outerB;
  uniform float u_paletteMix;
  uniform vec3 u_frontTint; uniform vec3 u_backTint; uniform float u_depthStrength;
  uniform vec3 u2_front; uniform vec3 u2_back; uniform vec3 u2_edge;
  uniform float u_layerAlphaMul0; uniform float u_layerAlphaMul1;
  varying vec3 vColor;
  varying float vRad01;
  varying float vSeed;
  varying float vLayer;
  varying float vEyeZ;
  void main() {
    // Sparse jitter to reduce aliasing on point sprites
    vec2 jitter = vec2(fract(vSeed*37.23)-0.5, fract(vSeed*91.17)-0.5) * 0.005;
    vec2 uv = clamp(gl_PointCoord.xy + jitter, 0.0, 1.0);
    vec4 s = texture2D(u_tex, uv);
    if (s.a < u_alphaCut) discard;

    // Palette mixing across inner/outer tones and mood-based tinting
    float energy = u_moodMix;
    vec3 inner = mix(u_innerA, u_innerB, u_paletteMix);
    vec3 outer = mix(u_outerA, u_outerB, u_paletteMix);
    vec3 baseCol = mix(inner, outer, pow(vRad01, 0.9));

    // Depth-aware tint for subtle parallax
    float df = clamp(vEyeZ / 3.0, 0.0, 1.0);
    vec3 col = mix(mix(baseCol, u_frontTint, 0.18), mix(baseCol, u_backTint, 0.22), df);

    // Inner-layer extra tinting
    if (vLayer > 0.5) {
      vec3 iCol = mix(u2_front, u2_back, df);
      col = mix(col, iCol, 0.35);
    }

    // Edge emphasis
    float edge = smoothstep(0.5, 1.0, vRad01);
    vec3 edgeCol = (vLayer > 0.5) ? u2_edge : mix(u2_edge, outer, 0.65);
    col = mix(col, edgeCol, edge * 0.12);

    // Soft falloff towards sprite bounds
    float r = length(uv - 0.5) * 2.0;
    float soften = smoothstep(0.75, 1.0, r);
    vec3 gradCol = mix(col * (1.0 - 0.008*vRad01), col * (1.0 + 0.008*vRad01), energy);
    gradCol = mix(gradCol, col, soften * 0.12);

    // Layer-aware alpha with global scaling
    float alphaBase = s.a * u_alphaScale;
    float layerMul = (vLayer > 0.5) ? u_layerAlphaMul1 : u_layerAlphaMul0;
    float alpha = clamp(alphaBase * layerMul, 0.78, 0.92);
    gl_FragColor = vec4(gradCol * alpha, alpha);
  }
`; 