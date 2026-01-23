import { useEffect, useRef } from 'react';
import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry, TeapotGeometry } from 'three/examples/jsm/Addons.js';
import { sphericalToCartesianUnit, translateOnSphere } from './ThreeDee.helpers';

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
    };

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
    let particleR: Float32Array | null = null;
    let particleThetas: Float32Array | null = null;
    let particlePhis: Float32Array | null = null;
    let particleSpeed: Float32Array | null = null;
    let particleBearing: Float32Array | null = null;

    let linePositions, lineColors;
    const segments = PARTICLE_COUNT * PARTICLE_COUNT;
    const effectController = {
      minDistance: 0.7,
      limitConnections: true,
      maxConnections: 10,
      particleCount: PARTICLE_COUNT
    };
    let linesMesh: THREE.LineSegments<THREE.BufferGeometry, THREE.Material, THREE.Object3DEventMap>;


    const clock = new THREE.Clock();
    init();

    function init() {
      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setAnimationLoop(animate);
      ref.current?.appendChild(renderer.domElement);

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);

      const cameraPos = sphericalToCartesianUnit(
        (Math.random() * 2 - 1) * Math.PI,
        (Math.random() * .5 - 0.25) * Math.PI,
        2
      );

      camera.position.set(
        cameraPos.x,
        cameraPos.y,
        cameraPos.z
      );
      camera.lookAt(new THREE.Vector3(0, 0, 0));
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
        if (g === geos.length)
          return [teapotGeo, knotGeo][Math.floor(Math.random() * 2)];
        return geos[g];
      };

      for (let i = 0; i < solids.length; i++) {
        const mesh = new THREE.Mesh(getGeo(i), pearlMat);
        group.add(mesh);
        objects.push(mesh);
      }
      scene.add(group);


      // --- Particles: points with random directions ---
      particlePositions = new Float32Array(PARTICLE_COUNT * 3); // cartesian 
      particleR = new Float32Array(PARTICLE_COUNT); // spherical
      particleThetas = new Float32Array(PARTICLE_COUNT); // spherical
      particlePhis = new Float32Array(PARTICLE_COUNT); // spherical

      particleSpeed = new Float32Array(PARTICLE_COUNT); // dist per frame
      particleBearing = new Float32Array(PARTICLE_COUNT); // radians

      // initialize particles on the sphere of radius 2
      for (let p = 0; p < PARTICLE_COUNT; p++) {
        // uniform distribution on sphere
        const theta = Math.acos(1 - 2 * Math.random()); // 0..PI
        const r = (Math.random() * 2 - 1) + 4;
        const phi = (Math.random() * Math.PI) * 2; // 0..2PI
        particleR[p] = r;
        particleThetas[p] = theta;
        particlePhis[p] = phi;

        particleSpeed[p] = (Math.random() * 0.1) + 0.1; // 0.05 .. 0.1
        particleBearing[p] = Math.PI; // (Math.random() * Math.PI * 2) - Math.PI; // -pi .. pi


        const coord = sphericalToCartesianUnit(theta, phi, r);
        const idx = p * 3;
        particlePositions[idx] = coord.x;
        particlePositions[idx + 1] = coord.y;
        particlePositions[idx + 2] = coord.z;
      }

      particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0x999999,
        size: 1.5,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      particles = new THREE.Points(particleGeo, particleMat);
      particles.frustumCulled = false;
      scene.add(particles);



      const linesGeometry = new THREE.BufferGeometry();
      linePositions = new Float32Array(segments * 3);
      lineColors = new Float32Array(segments * 3);
      linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
      linesGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));
      linesGeometry.computeBoundingSphere();
      linesGeometry.setDrawRange(0, 0);

      const linesMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true
      });

      linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
      scene.add(linesMesh);

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

        const coord = sphericalToCartesianUnit(solid.theta, solid.phi, r);
        objects[i].position.set(coord.x, coord.y, coord.z);

        const rot = sphericalToCartesianUnit(solid.spinT, solid.spinP, 1);
        objects[i].rotation.set(rot.x * trot, rot.y * trot, rot.z * trot);
      }

      // update particles
      if (dt !== 0 && particlePositions && particleThetas && particlePhis && particleGeo) {
        for (let p = 0; p < PARTICLE_COUNT; p++) {

          const sph = translateOnSphere(
            particleR?.[p] ?? 0,
            particleThetas[p],
            particlePhis[p],
            particleBearing?.[p] ?? 0,
            (particleSpeed?.[p] ?? 0) * tr
          );

          const coord = sphericalToCartesianUnit(sph.theta, sph.phi, sph.r);
          const idx = p * 3;
          particlePositions[idx] = coord.x;
          particlePositions[idx + 1] = coord.y;
          particlePositions[idx + 2] = coord.z;



        }
        (particleGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      }

      // update lines 
      let vertexpos = 0;
      let colorpos = 0;
      let numConnected = 0;
      const particleConnections = new Float32Array(PARTICLE_COUNT * 3);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        for (let j = 0; j < PARTICLE_COUNT; j++) {

          const idx0 = i * 3;
          const idx1 = j * 3;
          if (effectController.limitConnections && particleConnections[j] >= effectController.maxConnections)
            continue;

          const dx = particlePositions ? particlePositions[idx0] - particlePositions[idx1] : 0;
          const dy = particlePositions ? particlePositions[idx0 + 1] - particlePositions[idx1 + 1] : 0;
          const dz = particlePositions ? particlePositions[idx0 + 2] - particlePositions[idx1 + 2] : 0;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist > 0 && dist < effectController.minDistance) {

            particleConnections[i]++;
            particleConnections[j]++;

            const alpha = (1.0 - dist / effectController.minDistance) * 0.012;

            linePositions[vertexpos++] = particlePositions?.[idx0];
            linePositions[vertexpos++] = particlePositions?.[idx0 + 1];
            linePositions[vertexpos++] = particlePositions?.[idx0 + 2];

            linePositions[vertexpos++] = particlePositions?.[idx1];
            linePositions[vertexpos++] = particlePositions?.[idx1 + 1];
            linePositions[vertexpos++] = particlePositions?.[idx1 + 2];

            lineColors[colorpos++] = alpha;
            lineColors[colorpos++] = alpha;
            lineColors[colorpos++] = alpha;

            lineColors[colorpos++] = alpha;
            lineColors[colorpos++] = alpha;
            lineColors[colorpos++] = alpha;

            numConnected++;

          }
        }
      }
      linesMesh.geometry.setDrawRange(0, numConnected * 2);
      linesMesh.geometry.attributes.position.needsUpdate = true;
      linesMesh.geometry.attributes.color.needsUpdate = true;

      group.rotation.y += 0.004;
      renderer.render(scene, camera);

    }

    function gradTexture(color: [number[], string[]]) {
      const c = document.createElement('canvas');
      const ct = c.getContext('2d');
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


    function randomSort() {
      return Math.floor(Math.random() * 3) - 1;
    }

  }, []);
  return <div className="ThreeDee" style={{}} ref={ref}></div>;
};
export default ThreeDee;
