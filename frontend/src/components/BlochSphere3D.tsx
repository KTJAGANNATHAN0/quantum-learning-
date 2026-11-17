import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BlochVector } from '../types/quantum';
import { Compass, RotateCcw } from 'lucide-react';
import { sound } from '../services/audioEngine';

interface BlochSphere3DProps {
  blochVectors: BlochVector[];
  selectedQubit?: number;
  onSelectQubit?: (qubit: number) => void;
}

// Utility to generate crisp canvas text sprites for the 3D poles and axes
function createTextSprite(text: string, color: string, isAccent = false): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 80;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `bold 32px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (isAccent) {
    ctx.fillStyle = 'rgba(254, 242, 242, 0.9)';
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(14, 12, 132, 56, 8);
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = color;
  ctx.fillText(text, 80, 40);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(0.65, 0.32, 1);
  return sprite;
}

export const BlochSphere3D: React.FC<BlochSphere3DProps> = ({
  blochVectors,
  selectedQubit = 0,
  onSelectQubit
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeQubit, setActiveQubit] = useState(selectedQubit);
  const sphereGroupRef = useRef<THREE.Group | null>(null);

  // Sync state if prop changes
  useEffect(() => {
    setActiveQubit(selectedQubit);
  }, [selectedQubit]);

  const currentVector = blochVectors.find((v) => v.qubit === activeQubit) || {
    qubit: 0,
    x: 0,
    y: 0,
    z: 1,
    theta: 0,
    phi: 0,
    p0: 1,
    p1: 0
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Clear previous canvas if any
    while (mount.firstChild) {
      mount.removeChild(mount.firstChild);
    }

    const width = mount.clientWidth || 360;
    const height = 300;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Position camera symmetrically in positive octant
    camera.position.set(2.4, 1.8, 2.4);
    // CRITICAL: Look directly at the origin (0, 0, 0) to ensure exact centering
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.margin = '0 auto';
    mount.appendChild(renderer.domElement);

    // 2. Group for rotation centered at (0, 0, 0)
    const sphereGroup = new THREE.Group();
    sphereGroup.position.set(0, 0, 0);
    scene.add(sphereGroup);
    sphereGroupRef.current = sphereGroup;

    // 3. Inner sphere wireframe (Architectural Slate)
    const sphereGeo = new THREE.SphereGeometry(1, 28, 20);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xCBD5E1,
      transparent: true,
      opacity: 0.45,
      wireframe: true
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereGroup.add(sphereMesh);

    // 4. Equator Ring (XY plane) - Laboratory Crimson
    const equatorGeo = new THREE.RingGeometry(0.99, 1.01, 64);
    const equatorMat = new THREE.MeshBasicMaterial({
      color: 0xDC2626,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const equator = new THREE.Mesh(equatorGeo, equatorMat);
    equator.rotation.x = Math.PI / 2;
    sphereGroup.add(equator);

    // 5. Meridian Ring (XZ plane) - Technical Slate
    const meridianMat = new THREE.MeshBasicMaterial({
      color: 0x94A3B8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const meridian = new THREE.Mesh(equatorGeo, meridianMat);
    sphereGroup.add(meridian);

    // 6. Coordinate Axes Lines (Z: |0⟩/|1⟩, X: |+⟩/|−⟩, Y: |+i⟩/|−i⟩)
    const axesMaterial = new THREE.LineBasicMaterial({
      color: 0x475569,
      transparent: true,
      opacity: 0.55
    });

    // Z axis (vertical in Bloch sphere -> Three.js Y axis)
    const zPoints = [new THREE.Vector3(0, -1.35, 0), new THREE.Vector3(0, 1.35, 0)];
    const zGeo = new THREE.BufferGeometry().setFromPoints(zPoints);
    sphereGroup.add(new THREE.Line(zGeo, axesMaterial));

    // X axis (horizontal in Bloch sphere -> Three.js X axis)
    const xPoints = [new THREE.Vector3(-1.35, 0, 0), new THREE.Vector3(1.35, 0, 0)];
    const xGeo = new THREE.BufferGeometry().setFromPoints(xPoints);
    sphereGroup.add(new THREE.Line(xGeo, axesMaterial));

    // Y axis (depth in Bloch sphere -> Three.js Z axis)
    const yPoints = [new THREE.Vector3(0, 0, -1.35), new THREE.Vector3(0, 0, 1.35)];
    const yGeo = new THREE.BufferGeometry().setFromPoints(yPoints);
    sphereGroup.add(new THREE.Line(yGeo, axesMaterial));

    // 7. 3D Billboard Pole & Basis State Labels
    const northLabel = createTextSprite('|0⟩', '#090D16', true);
    northLabel.position.set(0, 1.52, 0);
    sphereGroup.add(northLabel);

    const southLabel = createTextSprite('|1⟩', '#090D16', true);
    southLabel.position.set(0, -1.52, 0);
    sphereGroup.add(southLabel);

    const xPosLabel = createTextSprite('|+⟩', '#B91C1C');
    xPosLabel.position.set(1.5, 0, 0);
    sphereGroup.add(xPosLabel);

    const yPosLabel = createTextSprite('|+i⟩', '#475569');
    yPosLabel.position.set(0, 0, 1.5);
    sphereGroup.add(yPosLabel);

    // 8. State Vector Arrow
    const arrowDir = new THREE.Vector3(
      currentVector.x,
      currentVector.z, // Bloch Z is UP (Three.js Y)
      currentVector.y  // Bloch Y is depth (Three.js Z)
    );
    const arrowLen = Math.max(arrowDir.length(), 0.05);
    arrowDir.normalize();

    const isEntangled = arrowLen < 0.28;
    const arrowColor = isEntangled ? 0x991B1B : 0xDC2626;

    const arrowHelper = new THREE.ArrowHelper(
      arrowDir,
      new THREE.Vector3(0, 0, 0),
      arrowLen,
      arrowColor,
      0.18,
      0.11
    );
    sphereGroup.add(arrowHelper);

    // 9. State Vector Tip Dot
    const dotGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: arrowColor });
    const tipDot = new THREE.Mesh(dotGeo, dotMat);
    tipDot.position.copy(arrowDir.clone().multiplyScalar(arrowLen));
    sphereGroup.add(tipDot);

    // 10. Interactive Drag-to-Rotate Physics
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      sphereGroup.rotation.y += deltaX * 0.01;
      sphereGroup.rotation.x += deltaY * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 11. Dynamic ResizeObserver for responsive centering
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          camera.lookAt(0, 0, 0);
        }
      }
    });
    resizeObserver.observe(mount);

    // 12. Animation Loop with subtle idle rotation
    let animFrame: number;
    const animate = () => {
      if (!isDragging) {
        sphereGroup.rotation.y += 0.002;
      }
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      animFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrame);
      resizeObserver.disconnect();
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [currentVector]);

  const handleQubitChange = (q: number) => {
    sound.playTelemetryBeep(1200 + q * 100);
    setActiveQubit(q);
    if (onSelectQubit) onSelectQubit(q);
  };

  const handleResetOrientation = () => {
    sound.playTick();
    if (sphereGroupRef.current) {
      sphereGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const r = Math.sqrt(currentVector.x ** 2 + currentVector.y ** 2 + currentVector.z ** 2);
  const isEntangled = r < 0.28;

  return (
    <div className="outer-chassis" style={{ padding: '18px', position: 'relative' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} color="var(--red-600)" />
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
            3D Bloch State Sphere
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleResetOrientation}
            title="Reset sphere orientation to standard view"
            className="btn-secondary"
            style={{ padding: '3px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RotateCcw size={12} /> Reset View
          </button>

          <span className="doc-stamp" style={{
            color: isEntangled ? 'var(--red-800)' : 'var(--ink-secondary)',
            background: isEntangled ? 'var(--red-100)' : 'var(--bg-subtle)',
            borderColor: isEntangled ? 'var(--red-border)' : 'var(--border-chassis)'
          }}>
            {isEntangled ? 'ENTANGLED (r < 0.28)' : 'PURE (r = 1.0)'}
          </span>
        </div>
      </div>

      {/* Qubit Selector Tabs */}
      {blochVectors.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
          {blochVectors.map((bv) => (
            <button
              key={bv.qubit}
              onClick={() => handleQubitChange(bv.qubit)}
              style={{
                background: activeQubit === bv.qubit ? 'var(--red-600)' : '#FFFFFF',
                color: activeQubit === bv.qubit ? '#FFFFFF' : 'var(--ink-muted)',
                border: activeQubit === bv.qubit ? '1px solid var(--red-700)' : '1px solid var(--border-chassis)',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              q[{bv.qubit}]
            </button>
          ))}
        </div>
      )}

      {/* 3D Canvas Mount Centered with Crosshair Watermark */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '300px',
          cursor: 'grab',
          borderRadius: '8px',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 50%, #FFFFFF 0%, #F8FAFC 85%)',
          border: '1px solid var(--border-chassis)',
          boxShadow: 'inset 0 1px 3px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
        title="Click and drag to rotate the Bloch sphere in 3D"
      />

      {/* Symmetric Legend Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        fontSize: '0.72rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--ink-dim)',
        marginTop: '8px',
        padding: '0 4px'
      }}>
        <span>North: <strong style={{ color: 'var(--ink-primary)' }}>|0⟩</strong> (+Z)</span>
        <span>Equator: <strong style={{ color: 'var(--red-600)' }}>|+⟩, |−⟩</strong> (XY)</span>
        <span>South: <strong style={{ color: 'var(--ink-primary)' }}>|1⟩</strong> (−Z)</span>
      </div>

      {/* Spherical & Cartesian Coordinates Readout (Double-Bezel) */}
      <div className="inner-bezel" style={{
        marginTop: '10px',
        padding: '10px 14px',
        background: '#FFFFFF',
        fontSize: '0.78rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        border: '1px solid var(--border-bezel)'
      }}>
        <div>
          <span style={{ color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
            Vector (x, y, z):
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--red-700)', marginTop: '2px' }}>
            ({currentVector.x.toFixed(3)}, {currentVector.y.toFixed(3)}, {currentVector.z.toFixed(3)})
          </div>
        </div>
        <div>
          <span style={{ color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
            Spherical (θ, φ):
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-secondary)', marginTop: '2px' }}>
            θ: {(currentVector.theta * 180 / Math.PI).toFixed(1)}°, φ: {(currentVector.phi * 180 / Math.PI).toFixed(1)}°
          </div>
        </div>
        <div>
          <span style={{ color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
            P(|0⟩):
          </span>
          <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ink-primary)' }}>
            {(currentVector.p0 * 100).toFixed(1)}%
          </div>
        </div>
        <div>
          <span style={{ color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
            P(|1⟩):
          </span>
          <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--red-600)' }}>
            {(currentVector.p1 * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};
