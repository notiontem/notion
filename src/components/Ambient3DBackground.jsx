import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, EyeOff } from 'lucide-react';

export default function Ambient3DBackground({ theme = 'light' }) {
  const containerRef = useRef(null);
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('ministry_3d_bg_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const isEnabledRef = useRef(isEnabled);
  isEnabledRef.current = isEnabled;

  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    localStorage.setItem('ministry_3d_bg_enabled', isEnabled);
  }, [isEnabled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isEnabled) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 32);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Color Palette according to Theme
    const isDark = themeRef.current === 'dark';
    const waveColor = isDark ? 0x8b9bb4 : 0x4a6572;
    const starColor = isDark ? 0xd4af37 : 0x8c7853;

    // 3. Flowing 3D Wave Particles Grid (생명수의 강 & 지식의 파동)
    const gridCols = 85;
    const gridRows = 55;
    const numPoints = gridCols * gridRows;
    const positions = new Float32Array(numPoints * 3);
    const scales = new Float32Array(numPoints);

    let idx = 0;
    const spacingX = 0.85;
    const spacingZ = 0.85;
    const startX = -((gridCols * spacingX) / 2);
    const startZ = -((gridRows * spacingZ) / 2);

    for (let i = 0; i < gridCols; i++) {
      for (let j = 0; j < gridRows; j++) {
        positions[idx * 3] = startX + i * spacingX;
        positions[idx * 3 + 1] = 0;
        positions[idx * 3 + 2] = startZ + j * spacingZ;
        scales[idx] = 1.0;
        idx++;
      }
    }

    const waveGeometry = new THREE.BufferGeometry();
    waveGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom circular particle texture for ultra clean rendering
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.4)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();

    const particleTexture = new THREE.CanvasTexture(canvas);

    const waveMaterial = new THREE.PointsMaterial({
      color: waveColor,
      size: isDark ? 0.35 : 0.28,
      map: particleTexture,
      transparent: true,
      opacity: isDark ? 0.35 : 0.22,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false
    });

    const wavePoints = new THREE.Points(waveGeometry, waveMaterial);
    wavePoints.position.y = -6;
    wavePoints.rotation.x = 0.2;
    scene.add(wavePoints);

    // 4. Subtle Ambient Starlight Constellation (부유하는 지식의 별빛 입자들)
    const starCount = 120;
    const starPositions = new Float32Array(starCount * 3);
    for (let k = 0; k < starCount * 3; k += 3) {
      starPositions[k] = (Math.random() - 0.5) * 60;
      starPositions[k + 1] = (Math.random() - 0.5) * 35;
      starPositions[k + 2] = (Math.random() - 0.5) * 45;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
      color: starColor,
      size: isDark ? 0.6 : 0.45,
      map: particleTexture,
      transparent: true,
      opacity: isDark ? 0.45 : 0.3,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 5. Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 8;

    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseX = normX * 4;
      mouseY = normY * 2.5;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 6. Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera damping
      targetCameraX += (mouseX - targetCameraX) * 0.035;
      targetCameraY += (8 + mouseY - targetCameraY) * 0.035;
      camera.position.x = targetCameraX;
      camera.position.y = targetCameraY;
      camera.lookAt(0, -2, 0);

      // Organic Harmonic Wave Function
      const posAttr = waveGeometry.attributes.position;
      const posArray = posAttr.array;
      let pIdx = 0;

      for (let i = 0; i < gridCols; i++) {
        for (let j = 0; j < gridRows; j++) {
          const u = i * 0.12;
          const v = j * 0.12;
          // Dual sine & cosine wave simulation (like flowing river or parchment cloth)
          const y =
            Math.sin(u + elapsedTime * 0.6) * 1.6 +
            Math.cos(v + elapsedTime * 0.45) * 1.3 +
            Math.sin((u + v) * 0.5 + elapsedTime * 0.5) * 0.8;

          posArray[pIdx * 3 + 1] = y;
          pIdx++;
        }
      }
      posAttr.needsUpdate = true;

      // Slow gentle rotation for ambient stars
      stars.rotation.y = elapsedTime * 0.02;
      stars.rotation.x = Math.sin(elapsedTime * 0.015) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      waveGeometry.dispose();
      waveMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      particleTexture.dispose();
    };
  }, [isEnabled, theme]);

  return (
    <>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="ambient-3d-canvas-wrap"
        style={{
          display: isEnabled ? 'block' : 'none'
        }}
      />

      {/* Floating 3D Background Toggle Widget */}
      <div className="ambient-3d-toggle-box">
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`ambient-3d-toggle-btn ${isEnabled ? 'active' : ''}`}
          title={isEnabled ? '3D 엠비언트 배경 끄기' : '3D 엠비언트 배경 켜기'}
        >
          {isEnabled ? <Eye size={13} /> : <EyeOff size={13} />}
          <span>3D 공간 배경 {isEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </>
  );
}
