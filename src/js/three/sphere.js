import * as THREE from 'three';

export function initSphere() {
  // Détection mobile (<600px)
  const isMobile = window.innerWidth < 600;
  const navHeightPx = 3 * 16; // 3rem = 3×16px

  // Tailles du canvas
  const canvasWidth  = isMobile ? window.innerWidth : window.innerWidth * 0.4;
  const canvasHeight = isMobile
    ? window.innerWidth
    : window.innerHeight - navHeightPx;

  // Scène & caméra
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    canvasWidth / canvasHeight,
    0.1,
    1000
  );
  camera.position.z = 3;

// Renderer — responsive mobile-first
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(canvasWidth, canvasHeight);

// 🔴 On force le centrage
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '50%';
renderer.domElement.style.left = '50%';
renderer.domElement.style.transform = 'translate(-50%, -50%)';

// taille responsive (à ajuster selon ton goût)
renderer.domElement.style.width = isMobile ? '90vw' : '40vw';
renderer.domElement.style.height = 'auto';

document.getElementById("app").appendChild(renderer.domElement);

  // Lumières
  const lightDir = new THREE.Vector3(1, 1, 1).normalize();
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.copy(lightDir);
  scene.add(dirLight);

  // Interaction souris
  const raycaster = new THREE.Raycaster();
  const mouse     = new THREE.Vector2();
  let isPressed   = false;
  let targetRot   = new THREE.Vector2(0, 0);

  window.addEventListener('mousemove', e => {
    targetRot.x = (e.clientY / window.innerHeight - 0.5) * Math.PI * 0.5;
    targetRot.y = (e.clientX / window.innerWidth  - 0.5) * Math.PI * 0.5;
  });

  // Uniforms & material
  const uniforms = {
    u_time:     { value: 0 },
    u_lightDir: { value: lightDir }
  };

  // —— ShaderMaterial & bruit ——
const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x,289.0); }
      vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
      float snoise3(vec3 v){
        const vec2 C = vec2(1.0/6.0,1.0/3.0);
        const vec4 D = vec4(0.0,0.5,1.0,2.0);
        vec3 i = floor(v + dot(v,C.yyy));
        vec3 x0 = v - i + dot(i,C.xxx);
        vec3 g = step(x0.yzx,x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz,l.zxy);
        vec3 i2 = max(g.xyz,l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod(i,289.0);
        vec4 p = permute( permute( permute(
                  i.z + vec4(0.0,i1.z,i2.z,1.0))
                + i.y + vec4(0.0,i1.y,i2.y,1.0))
                + i.x + vec4(0.0,i1.x,i2.x,1.0));
        vec4 j = p - 49.0 * floor(p*(1.0/7.0)*(1.0/7.0));
        vec4 x_ = floor(j*(1.0/7.0));
        vec4 y_ = floor(j - 7.0*x_);
        vec4 x = x_*(1.0/7.0)+(1.0/14.0);
        vec4 y = y_*(1.0/7.0)+(1.0/14.0);
        vec4 h = 1.0-abs(x)-abs(y);
        vec4 b0=vec4(x.xy,y.xy), b1=vec4(x.zw,y.zw);
        vec4 s0=floor(b0)*2.0+1.0, s1=floor(b1)*2.0+1.0;
        vec4 sh=-step(h,vec4(0.0));
        vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
        vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
        vec3 g0=vec3(a0.xy,h.x), g1=vec3(a0.zw,h.y);
        vec3 g2=vec3(a1.xy,h.z), g3=vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(g0,g0),dot(g1,g1),dot(g2,g2),dot(g3,g3)));
        g0*=norm.x; g1*=norm.y; g2*=norm.z; g3*=norm.w;
        vec4 m = max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
        m = m*m;
        return 42.0 * dot(m*m,vec4(dot(g0,x0),dot(g1,x1),dot(g2,x2),dot(g3,x3)));
      }
      uniform float u_time;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main(){
        float n = snoise3(position * 1.5 + u_time * 0.3);
        vec3 disp = position + normal * n * 0.1;
        vec4 mvPos = modelViewMatrix * vec4(disp, 1.0);
        vViewPos   = -mvPos.xyz;
        vNormal    = normalize(mat3(modelViewMatrix) * normal);
        gl_Position= projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      precision highp float;
  
  // Palette sombre : noir → gris → blanc
      vec3 C1 = vec3(0.0);    // noir
      vec3 C2 = vec3(0.5);    // gris moyen
      vec3 C3 = vec3(1.0);    // blanc
  
      varying vec3 vNormal;
      varying vec3 vViewPos;
      uniform vec3 u_lightDir;
      uniform float u_time;
  
      vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x,289.0); }
      vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
      float snoise3(vec3 v){
        const vec2 C = vec2(1.0/6.0,1.0/3.0);
        const vec4 D = vec4(0.0,0.5,1.0,2.0);
        vec3 i=floor(v+dot(v,C.yyy)), x0=v-i+dot(i,C.xxx);
        vec3 g=step(x0.yzx,x0.xyz), l=1.0-g;
        vec3 i1=min(g.xyz,l.zxy), i2=max(g.xyz,l.zxy);
        vec3 x1=x0-i1+C.xxx, x2=x0-i2+C.yyy, x3=x0-D.yyy;
        i=mod(i,289.0);
        vec4 p=permute(permute(permute(
                  i.z+vec4(0.0,i1.z,i2.z,1.0))
                +i.y+vec4(0.0,i1.y,i2.y,1.0))
                +i.x+vec4(0.0,i1.x,i2.x,1.0));
        vec4 j=p-49.0*floor(p*(1.0/7.0)*(1.0/7.0));
        vec4 x_=floor(j*(1.0/7.0)); vec4 y_=floor(j-7.0*x_);
        vec4 x=x_*(1.0/7.0)+(1.0/14.0), y=y_*(1.0/7.0)+(1.0/14.0);
        vec4 h=1.0-abs(x)-abs(y);
        vec4 b0=vec4(x.xy,y.xy), b1=vec4(x.zw,y.zw);
        vec4 s0=floor(b0)*2.0+1.0, s1=floor(b1)*2.0+1.0;
        vec4 sh=-step(h,vec4(0.0));
        vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
        vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
        vec3 g0=vec3(a0.xy,h.x), g1=vec3(a0.zw,h.y);
        vec3 g2=vec3(a1.xy,h.z), g3=vec3(a1.zw,h.w);
        vec4 norm=taylorInvSqrt(vec4(dot(g0,g0),dot(g1,g1),dot(g2,g2),dot(g3,g3)));
        g0*=norm.x; g1*=norm.y; g2*=norm.z; g3*=norm.w;
        vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
        m=m*m;
        return 42.0 * dot(m*m,vec4(dot(g0,x0),dot(g1,x1),dot(g2,x2),dot(g3,x3)));
      }
  
      void main(){
        vec3 N = normalize(vNormal);
        vec3 V = normalize(vViewPos);
        vec3 L = normalize(u_lightDir);
  
        float diff = max(dot(N,L),0.0);
        float rim  = pow(1.0 - max(dot(V,N),0.0),3.0);
        vec3 R     = reflect(-L,N);
        float spec = pow(max(dot(R,V),0.0),32.0);
  
        float f = snoise3(N * 2.0 + u_time * 0.15) * 0.5 + 0.5;
        vec3 colA = mix(C1, C2, smoothstep(0.2,0.8,f));
        vec3 base = mix(colA, C3, smoothstep(0.5,1.0,f));
  
        vec3 color = base * (0.4 + 0.6 * diff)
                   + rim  * 0.6
                   + spec * 0.8;
  
        gl_FragColor = vec4(color,1.0);
      }
    `,
    dithering: true
  });
  
 // Création de la sphère
 const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 128, 128),
    mat
  );
  scene.add(sphere);

  const canvas = renderer.domElement;
  canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    // calcul en coordonnées normalisées X/Y de la souris dans le canvas
    mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    if (raycaster.intersectObject(sphere).length) isPressed = true;
  });
  window.addEventListener('mouseup', () => (isPressed = false));

  // Boucle d’animation
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    uniforms.u_time.value += delta;

    const targetScale = isPressed ? 0.7 : 1.0;
    sphere.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );

    sphere.rotation.x += (targetRot.x - sphere.rotation.x) * 0.1;
    sphere.rotation.y += (targetRot.y - sphere.rotation.y) * 0.1;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const isM = window.innerWidth < 600;
    const isT = window.innerWidth >= 600 && window.innerWidth <= 1024;
  
    let w, h;
  
    if (isM) {
      w = window.innerWidth;
      h = 300; // hauteur fixe plus petite sur mobile
    } else if (isT) {
      w = window.innerWidth * 0.35; // un peu plus petit que desktop
      h = window.innerHeight - navHeightPx;
    } else {
      w = window.innerWidth * 0.4;
      h = window.innerHeight - navHeightPx;
    }
  
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  
    // centrage mobile
    if (isM) {
      renderer.domElement.style.position = "relative";
      renderer.domElement.style.top = "0";       // ou un petit margin-top si tu veux descendre un peu
      renderer.domElement.style.left = "0";      // alignement à gauche
      renderer.domElement.style.transform = "none"; // plus besoin de translate
    } else {
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.top = "50%";
      renderer.domElement.style.left = "50%";
      renderer.domElement.style.transform = "translate(-50%, -50%)";
    }
  });
}

