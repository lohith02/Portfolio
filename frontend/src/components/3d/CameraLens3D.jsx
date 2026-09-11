import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, MeshRefractionMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function CameraLens3D({ aperture = 1.4, onHoverState }) {
  const groupRef = useRef();
  const innerApertureRef = useRef();
  const frontGlassRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Smooth lerp values for rotation & aperture iris
  const targetRotation = useRef({ x: 0, y: 0 });
  const irisOpening = useRef(0.6);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Mouse tracking tilt
    const mouseX = state.pointer.x;
    const mouseY = state.pointer.y;

    targetRotation.current.y = mouseX * 0.45;
    targetRotation.current.x = -mouseY * 0.35;

    // Smooth lerp
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotation.current.y, 4, delta);
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotation.current.x, 4, delta);

    // Dynamic subtle breathing animation
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.08;

    // Aperture iris blade animation
    const targetOpening = hovered ? 0.9 : 0.45;
    irisOpening.current = THREE.MathUtils.damp(irisOpening.current, targetOpening, 6, delta);

    if (innerApertureRef.current) {
      innerApertureRef.current.scale.set(irisOpening.current, irisOpening.current, 1);
      innerApertureRef.current.rotation.z = state.clock.elapsedTime * 0.2 + (hovered ? 0.5 : 0);
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => {
        setHovered(true);
        if (onHoverState) onHoverState(true);
      }}
      onPointerOut={() => {
        setHovered(false);
        if (onHoverState) onHoverState(false);
      }}
      scale={[1.1, 1.1, 1.1]}
    >
      {/* Studio Lighting */}
      <pointLight position={[3, 3, 4]} intensity={1.8} color="#ffffff" />
      <pointLight position={[-4, -2, 2]} intensity={0.9} color="#38bdf8" />
      <pointLight position={[0, -3, -2]} intensity={1.2} color="#e6a15c" />
      <directionalLight position={[0, 5, 5]} intensity={1.5} color="#fff8f0" />

      {/* 1. Main Outer Lens Barrel Body */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.4, 2.2, 48]} />
        <meshStandardMaterial
          color="#10121a"
          roughness={0.25}
          metalness={0.88}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* 2. Metallic Ribbed Focus Ring */}
      <mesh position={[0, 0, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.53, 1.53, 0.9, 64]} />
        <meshStandardMaterial
          color="#0b0c12"
          roughness={0.4}
          metalness={0.7}
          wireframe={false}
        />
      </mesh>

      {/* 3. Luxury Gold Accent Aperture Ring */}
      <mesh position={[0, 0, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.44, 1.44, 0.08, 48]} />
        <meshStandardMaterial
          color="#e6a15c"
          roughness={0.15}
          metalness={0.95}
        />
      </mesh>

      {/* Red G-Master / Luxury Line Index Dot */}
      <mesh position={[0, 1.48, -0.85]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* 4. Front Bezel / Filter Thread Ring */}
      <mesh position={[0, 0, 1.1]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.42, 0.08, 16, 48]} />
        <meshStandardMaterial
          color="#161824"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* 5. Curved Front Optical Glass Element */}
      <mesh ref={frontGlassRef} position={[0, 0, 0.95]}>
        <sphereGeometry args={[1.35, 48, 24, 0, Math.PI * 2, 0, Math.PI / 3]} />
        <meshPhysicalMaterial
          color="#60a5fa"
          transmission={0.94}
          opacity={1}
          transparent={true}
          roughness={0.03}
          ior={1.65}
          thickness={0.8}
          specularIntensity={1.5}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={0.9}
        />
      </mesh>

      {/* 6. Deep Internal Chamber */}
      <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.0, 1.4, 32, 1, true]} />
        <meshStandardMaterial
          color="#050608"
          roughness={0.8}
          metalness={0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 7. Animated Aperture Iris Blades */}
      <group ref={innerApertureRef} position={[0, 0, 0.2]}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((deg * Math.PI) / 180) * 0.45,
              Math.sin((deg * Math.PI) / 180) * 0.45,
              0
            ]}
            rotation={[0, 0, (deg * Math.PI) / 180 + 0.4]}
          >
            <planeGeometry args={[0.9, 0.45]} />
            <meshStandardMaterial
              color="#0d0e14"
              roughness={0.3}
              metalness={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* Central Glowing Optical Aperture Light Tunnel */}
        <mesh position={[0, 0, -0.4]}>
          <circleGeometry args={[0.7, 32]} />
          <meshBasicMaterial
            color="#e6a15c"
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* 8. Rear Optical Element */}
      <mesh position={[0, 0, -1.05]}>
        <sphereGeometry args={[0.9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
        <meshPhysicalMaterial
          color="#c084fc"
          transmission={0.92}
          roughness={0.05}
          ior={1.55}
          transparent
        />
      </mesh>

      {/* 9. Front Lens Markings */}
      <group position={[0, 0, 1.15]} rotation={[0, 0, 0]}>
        <Text
          position={[0, 1.22, 0]}
          fontSize={0.09}
          color="#94a3b8"
          font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOV.woff"
          anchorX="center"
          anchorY="middle"
        >
          LOHITH ARCHIVE • F/1.2 • 50MM
        </Text>
        <Text
          position={[0, -1.22, 0]}
          fontSize={0.075}
          color="#e6a15c"
          font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOV.woff"
          anchorX="center"
          anchorY="middle"
        >
          ⌀ 77MM • NANO AR COATING II
        </Text>
      </group>
    </group>
  );
}
