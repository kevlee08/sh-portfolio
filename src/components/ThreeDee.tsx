import { useEffect, useRef } from 'react';
import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry, TeapotGeometry } from 'three/examples/jsm/Addons.js';

import './ThreeDee.css';

const ThreeDee = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.childNodes.length > 0) return; // prevent double rendering

    // generate solids
    interface Solid {
      min: number;
      max: number;
      init: number;
      speed: number;

      theta: number;
      phi: number;
      spinT: number;
      spinP: number;
    }

    const solidTemplate: Solid = {
      min: 1.0,
      max: 1.6,
      init: 0,
      speed: 0,

      theta: 0,
      phi: 0,
      spinT: 0,
      spinP: 0,
    }

    // set up solid objects
    const solids: Solid[] = [{ ...solidTemplate, theta: 0 }, { ...solidTemplate, theta: Math.PI }];
    const objects: THREE.Mesh[] = [];

    let i: number;
    const setA = [0, 72, 144, 216, 288];
    const setB = [36, 108, 180, 252, 324];

    for (i = 0; i < 5; i++) {
      solids.push({ ...solidTemplate, theta: 37.38 * (Math.PI / 180), phi: (setB[i % 5] * (Math.PI / 180)) });
      solids.push({ ...solidTemplate, theta: 63.43 * (Math.PI / 180), phi: (setA[i % 5] * (Math.PI / 180)) });
      solids.push({ ...solidTemplate, theta: 116.57 * (Math.PI / 180), phi: (setB[i % 5] * (Math.PI / 180)) });
      solids.push({ ...solidTemplate, theta: 142.62 * (Math.PI / 180), phi: (setA[i % 5] * (Math.PI / 180)) });
    }
    for (i = 0; i < solids.length; i++) {
      solids[i].init = Math.random() * Math.PI * 2;
      solids[i].speed = Math.random() * 0.7 + 0.2;
      solids[i].spinP = Math.random() * 2 * Math.PI;
      solids[i].spinT = Math.random() * 2 * Math.PI;
    }

    let renderer: THREE.WebGLRenderer,
      scene: THREE.Scene<THREE.Object3DEventMap>,
      camera: THREE.PerspectiveCamera;
    let group: THREE.Group;

    // Particles state (hoisted so animate() can update)
    const PARTICLE_COUNT = 1500;
    let particleGeo: THREE.BufferGeometry | null = null;
    let particles: THREE.Points | null = null;
    let particlePositions: Float32Array | null = null;
    let particleThetas: Float32Array | null = null;
    let particlePhis: Float32Array | null = null;
    let particleDTheta: Float32Array | null = null;
    let particleDPhi: Float32Array | null = null;


    const clock = new THREE.Clock();
    init();

    function init() {
      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setAnimationLoop(animate);
      ref.current?.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      //scene.background = new THREE.Color(0xebf5fa)

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 2);

      // new OrbitControls(camera, renderer.domElement);


      // lights
      // Add a diffuse point light (soft, with decay) and a subtle ambient fill
      const pointLight = new THREE.PointLight(0xebf5fa, 3.8, 7, 1.4); // color, intensity, distance, decay
      pointLight.position.set(-2, 1.5, 1.5);
      scene.add(pointLight);

      const diffuseLight = new THREE.SpotLight(0xfc8499, 5, 9, Math.PI / 2, 0.5, 0.4); // color, intensity, distance, angle, penumbra, decay
      diffuseLight.position.set(2, -2, -1);
      scene.add(diffuseLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 2.8);
      scene.add(ambientLight);

      // const light = new THREE.DirectionalLight(0xfc8499, 1);
      // light.position.set(2, 2, 2)
      // scene.add(light)

      // Visual helper for the point light (small sphere)
      // const plHelper = new THREE.PointLightHelper(pointLight, 0.08);
      // scene.add(plHelper);

      // background
      const backGeo = new THREE.IcosahedronGeometry(90, 2);
      const backMesh = new THREE.Mesh(
        backGeo,
        new THREE.MeshBasicMaterial({
          map: gradTexture([[0.8, 0.6, 0.4, 0.2], ['#0e1011ff', '#2d3235ff', '#8384a1ff', '#e2b1bdff']]),
          side: THREE.BackSide,
          depthWrite: false,
          fog: false
        })
      );
      scene.add(backMesh);

      // scene.add(new THREE.Mesh(
      //   new THREE.IcosahedronGeometry(.8, 12),
      //   new THREE.MeshPhysicalMaterial({
      //     color: 0xebf5fa,
      //     metalness: 0.1,
      //     roughness: 0.6
      //   })
      // ));

      group = new THREE.Group();

      const isoGeo = new THREE.IcosahedronGeometry(0.14, 8);
      const capGeo = new THREE.CapsuleGeometry(0.12, 0.2, 12, 24);
      const coneGeo = new THREE.ConeGeometry(0.15, 0.4, 32);
      const torusGeo = new THREE.TorusGeometry(0.1, 0.04, 16, 100);
      const cubeGeo = new RoundedBoxGeometry(0.2, 0.2, 0.2, 5, 0.03);
      const teapotGeo = new TeapotGeometry(0.12, 10, true, true, true, false, true);
      const knotGeo = new THREE.TorusKnotGeometry(0.1, 0.03, 100, 16);


      const pearlMat = new THREE.MeshPhysicalMaterial({
        color: 0xebf5fa, //0xebf5fa
        emissive: 0x343455,
        specularColor: 0xdedce5,
        // color: 0x336699,`
        metalness: 0.56,
        roughness: 0.3,
        ior: 1.3,
        reflectivity: 0.5,
        // transmission: 0.1,
        thickness: 0.5,
        // clearcoat: 0.3,
        // clearcoatRoughness: 0.8,
        iridescence: 1.2,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400]
      });
      const geos = [isoGeo, capGeo, torusGeo, coneGeo, cubeGeo].sort(randomSort);
      const getGeo = (index: number) => {
        const g = index % geos.length + 1;
        if (g == geos.length)
          return [teapotGeo, knotGeo][Math.floor(Math.random() * 2)];
        return geos[g];
      };

      for (var i = 0; i < solids.length; i++) {
        const mesh = new THREE.Mesh(getGeo(i), pearlMat);
        group.add(mesh);
        objects.push(mesh);
      }
      scene.add(group);


      // --- Particles: 500 points orbiting at radius 2 with random directions ---
      particlePositions = new Float32Array(PARTICLE_COUNT * 3);
      particleThetas = new Float32Array(PARTICLE_COUNT);
      particlePhis = new Float32Array(PARTICLE_COUNT);
      particleDTheta = new Float32Array(PARTICLE_COUNT);
      particleDPhi = new Float32Array(PARTICLE_COUNT);

      // initialize particles on the sphere of radius 2
      for (let p = 0; p < PARTICLE_COUNT; p++) {
        // uniform distribution on sphere
        const u = Math.random();
        const theta = Math.acos(1 - 2 * u); // 0..PI
        const phi = Math.random() * Math.PI * 2; // 0..2PI
        particleThetas[p] = theta;
        particlePhis[p] = phi;
        // small random angular velocities (radians/sec)
        particleDTheta[p] = (Math.random() - 0.5) * 1.2; // -0.6 .. 0.6 rad/s
        particleDPhi[p] = (Math.random() - 0.5) * 3.0; // -1.5 .. 1.5 rad/s

        const coord = sphericalToCartesian(2, theta, phi);
        const idx = p * 3;
        particlePositions[idx] = coord.x;
        particlePositions[idx + 1] = coord.y;
        particlePositions[idx + 2] = coord.z;
      }

      particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.01,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      particles = new THREE.Points(particleGeo, particleMat);
      particles.frustumCulled = false;
      scene.add(particles);

      clock.start();
      window.addEventListener('resize', onWindowResize);
      animate();
    }

    function onWindowResize() {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      if (ref.current?.getClientRects().length === 0) {
        return;
      }

      const dt = clock.getDelta() * 0.1;
      const tr = clock.getElapsedTime() * 0.2 + 5000;
      const trot = clock.getElapsedTime() * 0.5;

      for (i = 0; i < solids.length; i++) {
        const solid = solids[i];
        const r = solid.min +
          (solid.max - solid.min) * (Math.sin(solid.init + (solid.speed * tr) * Math.PI));

        const coord = sphericalToCartesian(r, solid.theta, solid.phi);
        objects[i].position.set(coord.x, coord.y, coord.z);

        const rot = sphericalToCartesian(1, solid.spinT, solid.spinP);
        objects[i].rotation.set(rot.x * trot, rot.y * trot, rot.z * trot);
      }

      // update particles
      if (dt !== 0 && particlePositions && particleThetas && particlePhis && particleDTheta && particleDPhi && particleGeo) {
        for (let p = 0; p < PARTICLE_COUNT; p++) {
          particleThetas[p] += particleDTheta[p] * dt;
          particlePhis[p] += particleDPhi[p] * dt;
          const coord = sphericalToCartesian(2, particleThetas[p], particlePhis[p]);
          const idx = p * 3;
          particlePositions[idx] = coord.x;
          particlePositions[idx + 1] = coord.y;
          particlePositions[idx + 2] = coord.z;
        }
        (particleGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      }

      group.rotation.y += 0.004;
      renderer.render(scene, camera);

    }

    function gradTexture(color: [number[], string[]]) {
      const c = document.createElement("canvas");
      const ct = c.getContext("2d");
      if (ct == null) return null;
      const size = 1024;
      c.width = 16; c.height = size;
      const gradient = ct.createLinearGradient(0, 0, 0, size);
      let i = color[0].length;
      while (i--) { gradient.addColorStop(color[0][i], color[1][i]); }
      ct.fillStyle = gradient;
      ct.fillRect(0, 0, 16, size);
      const texture = new THREE.Texture(c);
      texture.needsUpdate = true;
      return texture;
    }

    function sphericalToCartesian(r: number, theta: number, phi: number) {
      const sinT = Math.sin(theta);
      return {
        x: r * sinT * Math.cos(phi),
        y: r * sinT * Math.sin(phi),
        z: r * Math.cos(theta)
      };
    }

    function randomSort() {
      return Math.floor(Math.random() * 3) - 1;
    }

  }, []);
  return <div className="ThreeDee" style={{}} ref={ref}></div>;
}
export default ThreeDee;
