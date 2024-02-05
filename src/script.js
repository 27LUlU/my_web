import * as THREE from "three";
import GUI from "lil-gui";
import { ImprovedNoise } from "three/addons/math/ImprovedNoise.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Stats from "three/addons/libs/stats.module.js";
import { DragControls } from "three/addons/controls/DragControls.js";

/**
 * Debug
 */
// const gui = new GUI();

// const parameters = {
//   materialColor: "#ffeded",
// };

// gui.addColor(parameters, "materialColor");

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Fonts
 */
// Textures
// const textureLoader = new THREE.TextureLoader();
// const matcapTexture = textureLoader.load("/textures/matcaps/1.png");

// // font
// const fontLoader = new FontLoader();
// fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
//   const textGeometry = new TextGeometry("XIA WU", {
//     font: font,
//     size: 0.2,
//     height: 0.2,
//     curveSegments: 4,
//     bevelEnabled: true,
//     bevelThickness: 0.01,
//     bevelSize: 0.02,
//     bevelOffset: 0,
//     bevelSegments: 4,
//   });
//   textGeometry.computeBoundingBox();
//   // console.log(textGeometry);
//   textGeometry.translate(
//     -(textGeometry.boundingBox.max.x + 1.3),
//     textGeometry.boundingBox.max.y + 0.2,
//     textGeometry.boundingBox.max.z
//   );

//   const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
//   // textMaterial.wireframe = true;
//   const text1 = new THREE.Mesh(textGeometry, textMaterial);
//   text1.castShadow = true;
//   text1.rotation.x = 0.1;
//   text1.rotation.y = 0.25;
//   text1.rotation.z = -0.1;
//   chars.add(text1);
// });

// const icons = new THREE.Group();
// fontLoader.load("/icons/Social_Circles_Regular.json", (font) => {
//   const textGeometry = new TextGeometry("l", {
//     font: font,
//     size: 0.5,
//     height: 0.1,
//     // curveSegments: 4,
//     // bevelEnabled: true,
//     // bevelThickness: 0.01,
//     // bevelSize: 0.02,
//     // bevelOffset: 0,
//     // bevelSegments: 4,
//   });
//   // textGeometry.computeBoundingBox();
//   // // console.log(textGeometry);
//   // textGeometry.translate(
//   //   -(textGeometry.boundingBox.max.x + 0.1),
//   //   textGeometry.boundingBox.max.y - 1.5,
//   //   textGeometry.boundingBox.max.z
//   // );

//   const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
//   // textMaterial.wireframe = true;
//   const icons1 = new THREE.Mesh(textGeometry, textMaterial);
//   icons1.castShadow = true;
//   icons1.position.x = objectsDistance * 1;
//   icons1.position.y = -objectsDistance * 2.5;
//   // icons1.rotation.x = -0.07;
//   // icons1.rotation.y = 0.1;
//   // icons1.rotation.z = 0.1;
//   icons.add(icons1);
// });

// fontLoader.load("/icons/Modern_Pictograms_Normal.json", (font) => {
//   const textGeometry = new TextGeometry("m", {
//     font: font,
//     size: 0.5,
//     height: 0.1,
//     // curveSegments: 4,
//     // bevelEnabled: true,
//     // bevelThickness: 0.01,
//     // bevelSize: 0.02,
//     // bevelOffset: 0,
//     // bevelSegments: 4,
//   });
//   // textGeometry.computeBoundingBox();
//   // // console.log(textGeometry);
//   // textGeometry.translate(
//   //   textGeometry.boundingBox.max.x + 0.1,
//   //   textGeometry.boundingBox.max.y - 1.4,
//   //   textGeometry.boundingBox.max.z
//   // );

//   const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
//   // textMaterial.wireframe = true;
//   const icons2 = new THREE.Mesh(textGeometry, textMaterial);
//   icons2.castShadow = true;
//   icons2.position.x = -objectsDistance * 0.5;
//   icons2.position.y = -objectsDistance * 2.5;
//   // icons2.position.y = sizes.height;
//   // icons2.rotation.x = -0.07;
//   // icons2.rotation.y = -0.08;
//   // icons2.rotation.z = -0.005;
//   icons.add(icons2);
// });
// scene.add(icons);

/**
 * Cloud
 */
const objectsDistance = 1; // control the distance between objects

// Texture
const size = 64;
const data = new Uint8Array(size * size * size);

let i = 0;
const scale = 0.05; // set cloud scale
const perlin = new ImprovedNoise();
const vector = new THREE.Vector3();

for (let z = 0; z < size; z++) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d =
        1.0 -
        vector
          .set(x, y, z)
          .subScalar(size / 2)
          .divideScalar(size)
          .length();
      data[i] =
        (128 +
          128 * perlin.noise((x * scale) / 1.5, y * scale, (z * scale) / 1.5)) *
        d *
        d;
      i++;
    }
  }
}

const texture = new THREE.Data3DTexture(data, size, size, size);
texture.format = THREE.RedFormat;
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.unpackAlignment = 1;
texture.needsUpdate = true;

// Material

const vertexShader = /* glsl */ `
  in vec3 position;

  uniform mat4 modelMatrix;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform vec3 cameraPos;

  out vec3 vOrigin;
  out vec3 vDirection;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
    vDirection = position - vOrigin;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  precision highp sampler3D;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  in vec3 vOrigin;
  in vec3 vDirection;

  out vec4 color;

  uniform vec3 base;
  uniform sampler3D map;

  uniform float threshold;
  uniform float range;
  uniform float opacity;
  uniform float steps;
  uniform float frame;

  uint wang_hash(uint seed)
  {
      seed = (seed ^ 61u) ^ (seed >> 16u);
      seed *= 9u;
      seed = seed ^ (seed >> 4u);
      seed *= 0x27d4eb2du;
      seed = seed ^ (seed >> 15u);
      return seed;
  }

  float randomFloat(inout uint seed)
  {
      return float(wang_hash(seed)) / 4294967296.;
  }

  vec2 hitBox( vec3 orig, vec3 dir ) {
    const vec3 box_min = vec3( - 0.5 );
    const vec3 box_max = vec3( 0.5 );
    vec3 inv_dir = 1.0 / dir;
    vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
    vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
    vec3 tmin = min( tmin_tmp, tmax_tmp );
    vec3 tmax = max( tmin_tmp, tmax_tmp );
    float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
    float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
    return vec2( t0, t1 );
  }

  float sample1( vec3 p ) {
    return texture( map, p ).r;
  }

  float shading( vec3 coord ) {
    float step = 0.01;
    return sample1( coord + vec3( - step ) ) - sample1( coord + vec3( step ) );
  }

  vec4 linearToSRGB( in vec4 value ) {
    return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
  }

  void main(){
    vec3 rayDir = normalize( vDirection );
    vec2 bounds = hitBox( vOrigin, rayDir );

    if ( bounds.x > bounds.y ) discard;

    bounds.x = max( bounds.x, 0.0 );

    vec3 p = vOrigin + bounds.x * rayDir;
    vec3 inc = 1.0 / abs( rayDir );
    float delta = min( inc.x, min( inc.y, inc.z ) );
    delta /= steps;

    // Jitter

    // Nice little seed from
    // https://blog.demofox.org/2020/05/25/casual-shadertoy-path-tracing-1-basic-camera-diffuse-emissive/
    uint seed = uint( gl_FragCoord.x ) * uint( 1973 ) + uint( gl_FragCoord.y ) * uint( 9277 ) + uint( frame ) * uint( 26699 );
    vec3 size = vec3( textureSize( map, 0 ) );
    float randNum = randomFloat( seed ) * 2.0 - 1.0;
    p += rayDir * randNum * ( 1.0 / size );

    //

    vec4 ac = vec4( base, 0.0 );

    for ( float t = bounds.x; t < bounds.y; t += delta ) {

      float d = sample1( p + 0.5 );

      d = smoothstep( threshold - range, threshold + range, d ) * opacity;

      float col = shading( p + 0.5 ) * 3.0 + ( ( p.x + p.y ) * 0.25 ) + 0.2;

      ac.rgb += ( 1.0 - ac.a ) * d * col;

      ac.a += ( 1.0 - ac.a ) * d;

      if ( ac.a >= 0.95 ) break;

      p += rayDir * delta;

    }

    color = linearToSRGB( ac );

    if ( color.a == 0.0 ) discard;

  }
`;

const cloudGeometry = new THREE.BoxGeometry(1, 1, 1);
const cloudMaterial = new THREE.RawShaderMaterial({
  glslVersion: THREE.GLSL3,
  uniforms: {
    base: { value: new THREE.Color("#ccccff") },
    map: { value: texture },
    cameraPos: { value: new THREE.Vector3() },
    threshold: { value: 0.25 },
    opacity: { value: 0.25 },
    range: { value: 0.1 },
    steps: { value: 100 },
    frame: { value: 0 },
  },
  vertexShader,
  fragmentShader,
  side: THREE.BackSide,
  transparent: true,
});

const cloudMesh1 = new THREE.Mesh(cloudGeometry, cloudMaterial);
const cloudMesh2 = new THREE.Mesh(cloudGeometry, cloudMaterial);
const cloudMesh3 = new THREE.Mesh(cloudGeometry, cloudMaterial);
const cloudMesh4 = new THREE.Mesh(cloudGeometry, cloudMaterial);

cloudMesh1.position.y =
  objectsDistance * (window.innerWidth / window.innerHeight) * 0.1;
cloudMesh2.position.y =
  -objectsDistance * (window.innerWidth / window.innerHeight) * 0.1;
cloudMesh3.position.y =
  -objectsDistance * (window.innerWidth / window.innerHeight) * 0.7;
cloudMesh4.position.y =
  objectsDistance * (window.innerWidth / window.innerHeight) * 0.6;

cloudMesh1.position.x = (-1.2 * window.innerWidth) / window.innerHeight;
cloudMesh2.position.x = (1.2 * window.innerWidth) / window.innerHeight;
cloudMesh3.position.x = (0.1 * window.innerWidth) / window.innerHeight;
cloudMesh4.position.x = (0.5 * window.innerWidth) / window.innerHeight;

cloudMesh3.position.z = 0.1;
cloudMesh4.position.z = 1;

cloudMesh1.scale.set(
  (window.innerWidth / window.innerHeight) * 0.8,
  (window.innerWidth / window.innerHeight) * 0.8,
  (window.innerWidth / window.innerHeight) * 0.8
);
cloudMesh2.scale.set(
  (window.innerWidth / window.innerHeight) * 0.6,
  (window.innerWidth / window.innerHeight) * 0.3,
  (window.innerWidth / window.innerHeight) * 0.6
);
cloudMesh3.scale.set(
  (window.innerWidth / window.innerHeight) * 0.7,
  (window.innerWidth / window.innerHeight) * 0.7,
  (window.innerWidth / window.innerHeight) * 0.7
);
cloudMesh4.scale.set(
  (window.innerWidth / window.innerHeight) * 0.4,
  (window.innerWidth / window.innerHeight) * 0.2,
  (window.innerWidth / window.innerHeight) * 0.4
);

const cloudMeshes = [cloudMesh1, cloudMesh2, cloudMesh3, cloudMesh4];
scene.add(cloudMesh1, cloudMesh2, cloudMesh3, cloudMesh4);

const cloudParameters = {
  threshold: 0.2,
  opacity: 0.05,
  range: 0.1,
  steps: 40,
};

cloudMaterial.uniforms.threshold.value = cloudParameters.threshold;
cloudMaterial.uniforms.opacity.value = cloudParameters.opacity;
cloudMaterial.uniforms.range.value = cloudParameters.range;
cloudMaterial.uniforms.steps.value = cloudParameters.steps;

/**
 * Flamingo
 */
// MODEL
const mixers = [];
const loader = new GLTFLoader();
let flamingo_mesh;

loader.load("models/gltf/flamingo.glb", function (gltf) {
  // const mesh = gltf.scene.children[0];
  flamingo_mesh = gltf.scene.children[0];
  const s = (window.innerWidth / window.innerHeight) * 0.003;
  flamingo_mesh.scale.set(s, s, s);

  flamingo_mesh.position.y = (0.3 * window.innerWidth) / window.innerHeight;
  flamingo_mesh.position.x = window.innerWidth / window.innerHeight;

  flamingo_mesh.rotation.y = -0.8;
  flamingo_mesh.rotation.x = 0.3;

  flamingo_mesh.castShadow = true;
  flamingo_mesh.receiveShadow = true;

  scene.add(flamingo_mesh);

  const mixer = new THREE.AnimationMixer(flamingo_mesh);
  mixer.clipAction(gltf.animations[0]).setDuration(1).play();
  mixers.push(mixer);
});

// Settings
const fontName = "Verdana";
const textureFontSize = 60;
let textureCoordinates = [];
let particleGeometry, particleMaterial, textInstancedMesh, dummy;
const textTexture = new THREE.TextureLoader().load(
  "textures/gradients/smoke.png"
);
particleGeometry = new THREE.PlaneGeometry(0.1, 0.1);
particleMaterial = new THREE.MeshBasicMaterial({
  // color: 0xffffff,
  alphaMap: textTexture,
  depthTest: false,
  opacity: 0.3,
  transparent: true,
  // vertexColors: true,
});
dummy = new THREE.Object3D();

// 1d-array of data objects to store and change params of each instance
let particles = [];

// String to show
let string = "XIA WU";
// let string = "XIA WU" + "\n" + "to sample" + "\n" + "with Canvas";
// Create canvas to sample the text
const textCanvas = document.createElement("canvas");
document.body.appendChild(textCanvas);
textCanvas.classList.add("text-canvas");

textCanvas.width = textCanvas.height = 0;
const textCtx = textCanvas.getContext("2d");

function sampleCoordinates() {
  // Parse text
  const lines = string.split(`\n`);
  const linesMaxLength = [...lines].sort((a, b) => b.length - a.length)[0]
    .length;
  const wTexture = textureFontSize * 0.7 * linesMaxLength;
  const hTexture = lines.length * textureFontSize;

  // Draw text
  const linesNumber = lines.length;
  textCanvas.width = wTexture;
  textCanvas.height = hTexture;
  textCtx.font = "100 " + textureFontSize + "px " + fontName;
  textCtx.fillStyle = "#2a9d8f";
  textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
  for (let i = 0; i < linesNumber; i++) {
    textCtx.fillText(lines[i], 0, ((i + 0.8) * hTexture) / linesNumber);
  }
  // Sample coordinates
  // const samplingStep = 4;
  // if (wTexture > 0) {
  //   const imageData = textCtx.getImageData(
  //     0,
  //     0,
  //     textCanvas.width,
  //     textCanvas.height
  //   );
  //   for (let i = 0; i < textCanvas.height; i += samplingStep) {
  //     for (let j = 0; j < textCanvas.width; j += samplingStep) {
  //       // Checking if R-channel is not zero since the background RGBA is (0,0,0,0)
  //       if (imageData.data[(j + i * textCanvas.width) * 4] > 0) {
  //         textureCoordinates.push({
  //           x: j,
  //           y: i,
  //         });
  //       }
  //     }
  //   }
  // }
  if (wTexture > 0) {
    // Image data to 2d array
    const imageData = textCtx.getImageData(
      0,
      0,
      textCanvas.width,
      textCanvas.height
    );
    const imageMask = Array.from(
      Array(textCanvas.height),
      () => new Array(textCanvas.width)
    );
    for (let i = 0; i < textCanvas.height; i++) {
      for (let j = 0; j < textCanvas.width; j++) {
        imageMask[i][j] = imageData.data[(j + i * textCanvas.width) * 4] > 0;
      }
    }

    if (textureCoordinates.length !== 0) {
      // Clean up: delete coordinates and particles which disappeared on the prev step
      // We need to keep same indexes for coordinates and particles to reuse old particles properly
      textureCoordinates = textureCoordinates.filter((c) => !c.toDelete);
      particles = particles.filter((c) => !c.toDelete);

      // Go through existing coordinates (old to keep, toDelete for fade-out animation)
      textureCoordinates.forEach((c) => {
        if (imageMask[c.y]) {
          if (imageMask[c.y][c.x]) {
            c.old = true;
            if (!c.toDelete) {
              imageMask[c.y][c.x] = false;
            }
          } else {
            c.toDelete = true;
          }
        } else {
          c.toDelete = true;
        }
      });
    }

    // Add new coordinates
    for (let i = 0; i < textCanvas.height; i++) {
      for (let j = 0; j < textCanvas.width; j++) {
        if (imageMask[i][j]) {
          textureCoordinates.push({
            x: j,
            y: i,
            old: false,
            toDelete: false,
          });
        }
      }
    }
  } else {
    textureCoordinates = [];
  }
}

// function createPlane() {
//   const textPlaneTexture = new THREE.CanvasTexture(textCanvas);
//   const textPlaneGeometry = new THREE.PlaneGeometry(
//     // textCanvas.width,
//     // textCanvas.height
//     0.5,
//     0.5
//   );
//   const textPlaneMaterial = new THREE.MeshBasicMaterial({
//     map: textPlaneTexture,
//   });
//   const textPlaneMesh = new THREE.Mesh(textPlaneGeometry, textPlaneMaterial);

//   scene.add(textPlaneMesh);
//   textPlaneMesh.position.x = 1;
//   textPlaneMesh.position.y = -1;
// }
// console.log(textureCoordinates);
// function createParticles() {
//   const textParticleGeometry = new THREE.BufferGeometry();
//   const textParticleMaterial = new THREE.PointsMaterial({
//     color: 0xff0000,
//     size: 0.1,
//   });

//   const particlesCount = textureCoordinates.length;
//   const vertices = new Float32Array(particlesCount * 3);
//   for (let i = 0; i < particlesCount; i++) {
//     vertices[i * 3 + 0] = textureCoordinates[i].x * 0.005;
//     vertices[i * 3 + 1] = -textureCoordinates[i].y * 0.005;
//     vertices[i * 3 + 2] = 0.1 * Math.random();
//   }
//   // console.log(vertices);
//   textParticleGeometry.setAttribute(
//     "position",
//     new THREE.BufferAttribute(vertices, 3)
//     // new THREE.Float32BufferAttribute(vertices, 3)
//   );
//   const textParticles = new THREE.Points(
//     textParticleGeometry,
//     textParticleMaterial
//   );
//   scene.add(textParticles);

//   textParticles.position.y = -1;
// }

function cloudText([x, y]) {
  this.x = x + 0.05 * (Math.random() - 0.5);
  this.y = y + 0.05 * (Math.random() - 0.5);
  this.z = 0;

  this.color = Math.random * 60;

  this.isGrowing = true;
  this.toDelete = false;

  this.scale = 0;
  this.maxScale = 0.1 + 1.5 * Math.pow(Math.random(), 10);
  this.deltaScale = 0.03 + 1 * Math.random();
  this.age = Math.PI * Math.random();
  this.ageDelta = 0.03 + 0.05 * Math.random();
  this.rotationZ = 0.5 * Math.random() * Math.PI;
  this.deltaRotation = 0.01 * (Math.random() - 0.5);

  this.grow = function () {
    this.age += this.ageDelta;
    this.rotationZ += this.deltaRotation;
    if (this.isGrowing) {
      this.scale += this.deltaScale;
      if (this.scale >= this.maxScale) {
        this.isGrowing = false;
      }
    } else if (this.toDelete) {
      this.scale -= this.deltaScale;
      if (this.scale <= 0) {
        this.scale = 0;
        this.deltaScale = 0;
      }
    } else {
      this.scale = this.maxScale + 0.2 * Math.sin(this.age);
    }
  };
}

function createTextInstancedMesh() {
  particleGeometry.center();
  // textInstancedMesh = new THREE.InstancedMesh(
  //   particleGeometry,
  //   particleMaterial,
  //   particles.length
  // );
  // scene.add(textInstancedMesh);
  scene.remove(textInstancedMesh);
  const totalNumberOfCloud = particles.length;
  textInstancedMesh = new THREE.InstancedMesh(
    particleGeometry,
    particleMaterial,
    totalNumberOfCloud
  );
  scene.add(textInstancedMesh);

  let cloudIdx = 0;
  particles.forEach((p) => {
    textInstancedMesh.setColorAt(
      cloudIdx,
      new THREE.Color("hsl(" + p.color + ", 100%, 50%)")
    );
    // console.log(p.color);
    cloudIdx++;
  });

  // centralize it in the same way as before
  textInstancedMesh.position.x =
    -(window.innerWidth / window.innerHeight) * 0.6;
  textInstancedMesh.position.y = 1.1;
  textInstancedMesh.scale.set(
    (window.innerWidth / window.innerHeight) * 1,
    (window.innerWidth / window.innerHeight) * 1,
    (window.innerWidth / window.innerHeight) * 1
  );
}

function updateTextParticlesMatrices() {
  let idx = 0;
  // textureCoordinates.forEach((p) => {
  //   // we apply samples coordinates like before + some random rotation
  //   dummy.rotation.set(2 * Math.random(), 2 * Math.random(), 2 * Math.random());
  //   dummy.position.set(p.x * 0.005, -p.y * 0.005, Math.random() * 0.1);

  //   dummy.updateMatrix();
  //   textInstancedMesh.setMatrixAt(idx, dummy.matrix);

  //   idx++;
  // });
  particles.forEach((p) => {
    p.grow();
    dummy.quaternion.copy(camera.quaternion);
    dummy.rotation.z += p.rotationZ;
    dummy.scale.set(p.scale * 0.5, p.scale * 0.5, p.scale * 0.5);
    dummy.position.set(p.x, -p.y, p.z);
    dummy.updateMatrix();
    textInstancedMesh.setMatrixAt(idx, dummy.matrix);
    idx++;
  });
  textInstancedMesh.instanceMatrix.needsUpdate = true;
  // textInstancedMesh.instanceColor.needsUpdate = true;
}

function refreshText() {
  sampleCoordinates();

  particles = textureCoordinates.map((c, cIdx) => {
    const x = c.x * 0.005;
    const y = c.y * 0.005;
    let p = c.old && particles[cIdx] ? particles[cIdx] : new cloudText([x, y]);
    if (c.toDelete) {
      p.toDelete = true;
      p.scale = p.maxScale;
    }
    return p;
  });

  createTextInstancedMesh();
  // updateTextParticlesMatrices();
  // createPlane();
  // createParticles();
}
refreshText();

/**
 * Lights
 */
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
hemiLight.color.setHSL(0.6, 1, 0.6);
hemiLight.groundColor.setHSL(0.095, 1, 0.75);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);
const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 3);
scene.add(hemiLightHelper);

const directionLight = new THREE.DirectionalLight("#ffffff", 8);
directionLight.position.set(1, 1, 0);
scene.add(directionLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  textInstancedMesh.position.x = -(sizes.width / sizes.height) * 0.6;
  textInstancedMesh.position.y = 1.1;
  textInstancedMesh.scale.set(
    (sizes.width / sizes.height) * 1,
    (sizes.width / sizes.height) * 1,
    (sizes.width / sizes.height) * 1
  );

  cloudMesh1.position.y = objectsDistance * (sizes.width / sizes.height) * 0.1;
  cloudMesh2.position.y = -objectsDistance * (sizes.width / sizes.height) * 0.1;
  cloudMesh3.position.y = -objectsDistance * (sizes.width / sizes.height) * 0.7;
  cloudMesh4.position.y = objectsDistance * (sizes.width / sizes.height) * 0.6;

  cloudMesh1.position.x = (-1.2 * sizes.width) / sizes.height;
  cloudMesh2.position.x = (1.2 * sizes.width) / sizes.height;
  cloudMesh3.position.x = (0.1 * sizes.width) / sizes.height;
  cloudMesh4.position.x = (0.5 * sizes.width) / sizes.height;

  cloudMesh1.scale.set(
    (sizes.width / sizes.height) * 0.8,
    (sizes.width / sizes.height) * 0.8,
    (sizes.width / sizes.height) * 0.8
  );
  cloudMesh2.scale.set(
    (sizes.width / sizes.height) * 0.6,
    (sizes.width / sizes.height) * 0.3,
    (sizes.width / sizes.height) * 0.6
  );
  cloudMesh3.scale.set(
    (sizes.width / sizes.height) * 0.7,
    (sizes.width / sizes.height) * 0.7,
    (sizes.width / sizes.height) * 0.7
  );
  cloudMesh4.scale.set(
    (sizes.width / sizes.height) * 0.4,
    (sizes.width / sizes.height) * 0.2,
    (sizes.width / sizes.height) * 0.4
  );

  const s = (window.innerWidth / window.innerHeight) * 0.003;
  flamingo_mesh.scale.set(s, s, s);

  flamingo_mesh.position.y = (0.3 * window.innerWidth) / window.innerHeight;
  flamingo_mesh.position.x = window.innerWidth / window.innerHeight;

  flamingo_mesh.rotation.y = -0.8;
  flamingo_mesh.rotation.x = 0.3;

  // flamingo_mesh.position.y = (0.3 * sizes.width) / sizes.height;
  // flamingo_mesh.position.x = -0.1 + sizes.width / sizes.height;

  // const s = (sizes.width / sizes.height) * 0.003;
  // flamingo_mesh.scale.set(s, s, s);

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Raycasters
 */
// const chars = new THREE.Group();
// const raycaster = new THREE.Raycaster();
// scene.add(chars);

/**
 * Cursor (this can move the cubes)
 */
// move cloud
// const cursor = {};
// cursor.x = 0;
// cursor.y = 0;

// window.addEventListener("mousemove", (event) => {
//   cursor.x = event.clientX / sizes.width - 0.5;
//   cursor.y = event.clientY / sizes.height + 0.5;
// });

// move texts
// const mouse = new THREE.Vector2();

// window.addEventListener("mousemove", (_event) => {
//   mouse.x = (_event.clientX / sizes.width) * 2 - 1;
//   mouse.y = -(_event.clientX / sizes.width) * 2 + 1;
//   // console.log(mouse);
// });

// window.addEventListener("click", () => {
//   if (currentIntersect) {
//     switch (currentIntersect.object) {
//       case chars.children:
//         console.log("click");
//         break;
//     }
//   }
// });
// console.log(chars.children);

/**
 * Camera
 */
// Group
// const cameraGroup = new THREE.Group();
// scene.add(cameraGroup);

// Base camera
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;

scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll (scroll the show the next cubes)
 */

let scrollY = window.scrollY;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  textInstancedMesh.position.y = 1.1 + scrollY * 0.01;
  // flamingo_mesh.position.y =
  //   (0.3 * sizes.width) / sizes.height - (scrollY * 0.1) / sizes.height;
  // flamingo_mesh.position.x =
  //   -(scrollY / sizes.height) * 0.2 + (-0.1 + sizes.width / sizes.height);
  // flamingo_mesh.rotation.y = -1 + (scrollY * 1.5) / sizes.height;
  // flamingo_mesh.rotation.x = 0.5 + (scrollY * 1) / sizes.height;

  flamingo_mesh.position.y =
    (0.3 * sizes.width) / sizes.height - (scrollY * 0.01) / sizes.height;
  flamingo_mesh.position.x =
    sizes.width / sizes.height - (1.5 * scrollY) / sizes.height;

  flamingo_mesh.rotation.y = -0.8 + (0.5 * scrollY) / sizes.height;
  flamingo_mesh.rotation.x = 0.3 - (0.2 * scrollY) / sizes.height;

  const s =
    (sizes.width / sizes.height) * 0.003 + (0.0008 * scrollY) / sizes.height;
  flamingo_mesh.scale.set(s, s, s);

  renderer.render(scene, camera);
});

// const textControls = new DragControls(
//   chars.children,
//   camera,
//   renderer.domElement
// );
// textControls.deactivate();
// textControls.activate();

// textControls.addEventListener("dragstart", (event) => {
//   console.log(event);
// });

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

// stats
const stats = new Stats();
canvas.appendChild(stats.dom);

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate camera (scroll the show the next cubes)
  // icons.position.y = (scrollY / sizes.height) * 1;
  // console.log(sizes.height);
  // const parallaxX = cursor.x * 0.5;
  // const parallaxY = -cursor.y * 0.5;
  // cameraGroup.position.x +=
  //   (parallaxX - cameraGroup.position.x) * 0.005 * deltaTime;
  // cameraGroup.position.y +=
  //   (parallaxY - cameraGroup.position.y) * 0.005 * deltaTime;

  // Animate meshes
  // for (const icon of icons.children) {
  //   icon.rotation.x = elapsedTime * 0.1;
  //   icon.rotation.y = elapsedTime * 0.12;
  // }

  for (const cloudMesh of cloudMeshes) {
    cloudMesh.material.uniforms.cameraPos.value.copy(camera.position);
    cloudMesh.rotation.x = elapsedTime * 0.2;
    cloudMesh.rotation.y = elapsedTime * 0.4;
    // cloudMesh.rotation.y = -performance.now() / 7500;
    cloudMesh.material.uniforms.frame.value++;
    // cloudMesh.position.x +=
    //   (parallaxX - cloudMesh.position.x) * 0.005 * deltaTime;
    // cloudMesh.position.y +=
    //   (parallaxY - cloudMesh.position.y) * 0.005 * deltaTime;
  }
  for (let i = 0; i < mixers.length; i++) {
    mixers[i].update(deltaTime * 0.8);
  }

  updateTextParticlesMatrices();

  // textInstancedMesh.rotation.x = Math.sin(elapsedTime * 0.5) * (Math.PI / 10);

  //Cast a ray
  // raycaster.setFromCamera(mouse, camera);
  // const rayOrigin = new THREE.Vector3(-3, 0, 0);
  // const rayDirection = new THREE.Vector3(1, 0, 0);
  // rayDirection.normalize();
  // raycaster.set(rayOrigin, rayDirection);

  // const objectsToTest = [chars.children];
  // const objectsToTest = [object1];
  // const intersects = raycaster.intersectObjects(chars.children);
  // console.log(intersects.length);

  // if (intersects.length > 0) {
  //   chars.children.forEach((child, j) => {
  //     // console.log(child.computeBoundingBox);
  //     child.rotation.x += 0.2 * deltaTime;
  //     child.rotation.y -= 0.1 * deltaTime; // Rotate 0.1 radians around Y axis
  //     child.rotation.z -= 0.3 * deltaTime;
  //   });
  // } else {
  //   chars.children.forEach((child, j) => {
  //     // console.log(child);
  //     child.rotation.x = 0.1;
  //     child.rotation.y = 0.25; // Rotate 0.1 radians around Y axis
  //     child.rotation.z = -0.1;
  //   });
  // }

  // Update controls
  // controls.update();

  // // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
