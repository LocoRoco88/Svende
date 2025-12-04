
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, Euler } from 'three';
import { useStore } from '../store';

// --- Reusable Composite Humanoid Model ---
const HumanoidModel = ({ color, shirtColor, isCensor = false }: { color: string, shirtColor: string, isCensor?: boolean }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
        // Simple idle/bobbing animation
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 8) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Head - Slightly larger for cartoon feel */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshToonMaterial color="#ffccaa" /> {/* Skin */}
      </mesh>
      
      {/* Censor Hat */}
      {isCensor && (
        <group position={[0, 1.9, 0]}>
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.3]} />
                <meshToonMaterial color="#111" />
            </mesh>
            <mesh position={[0, -0.15, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.05]} />
                <meshToonMaterial color="#111" />
            </mesh>
        </group>
      )}

      {/* Torso */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.4, 0.7, 0.25]} />
        <meshToonMaterial color={shirtColor} />
      </mesh>
      
      {/* Censor Tie */}
      {isCensor && (
         <mesh position={[0, 1.2, 0.13]}>
            <boxGeometry args={[0.1, 0.4, 0.02]} />
            <meshToonMaterial color="red" />
         </mesh>
      )}

      {/* Left Arm */}
      <mesh position={[-0.28, 1.1, 0]}>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshToonMaterial color={shirtColor} />
      </mesh>
      {/* Right Arm */}
      <mesh position={[0.28, 1.1, 0]}>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshToonMaterial color={shirtColor} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.1, 0.4, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshToonMaterial color="#333" />
      </mesh>
      <mesh position={[0.1, 0.4, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshToonMaterial color="#333" />
      </mesh>
    </group>
  );
};

// --- Teacher / Censor (Enemy) ---
// Index helps create unique behavior patterns so they don't clump
export const Teacher = ({ position, playerRef, type = 'teacher', index = 0 }: { position: [number, number, number], playerRef: React.RefObject<Group>, type?: 'teacher' | 'censor', index?: number }) => {
  const ref = useRef<Group>(null);
  const catchPlayer = useStore(state => state.catchPlayer);
  const isInvincible = useStore(state => state.isInvincible);
  
  // Censors are slightly faster
  // Increased base speed for difficulty
  const speed = type === 'censor' ? 2.3 : 2.0; 
  
  useFrame((state, delta) => {
    if (!ref.current || !playerRef.current) return;
    
    // Determine target
    const playerPos = playerRef.current.position.clone();
    const myPos = ref.current.position;
    
    // TACTICAL AI:
    // Instead of aiming directly at the player, aim for a point AROUND the player.
    // Index 0: Front Right, Index 1: Front Left, Index 2: Back Right, Index 3: Back Left
    // This creates an encirclement behavior.
    
    const distanceToPlayer = myPos.distanceTo(playerPos);
    let targetPos = playerPos;

    // If far away, use flanking tactics
    if (distanceToPlayer > 3.0) {
        const angleOffset = (index % 4) * (Math.PI / 2); // 0, 90, 180, 270 degrees
        const flankRadius = 4.0; // Try to stay 4 units away from player center
        
        const flankX = Math.cos(angleOffset) * flankRadius;
        const flankZ = Math.sin(angleOffset) * flankRadius;
        
        targetPos = new Vector3(
            playerPos.x + flankX,
            playerPos.y,
            playerPos.z + flankZ
        );
    }
    // If close (< 3.0), attack directly (target the playerPos directly as initialized)

    // Vector to target
    const direction = new Vector3().subVectors(targetPos, myPos);
    direction.y = 0; // Stay on floor
    
    // AI Logic
    if (isInvincible) {
       // Retreat slightly or stop
       if (distanceToPlayer < 6) {
         // Run away from actual player pos, not flank pos
         const runDir = new Vector3().subVectors(myPos, playerPos);
         runDir.y = 0;
         runDir.normalize();
         myPos.add(runDir.multiplyScalar(speed * delta));
         ref.current.lookAt(playerPos.x, myPos.y, playerPos.z); // Look at player while backing away
       }
    } else {
       // Chase
       if (direction.length() > 0.1) {
         direction.normalize();
         myPos.add(direction.multiplyScalar(speed * delta));
         // Look at player to be creepy, even if moving to flank
         ref.current.lookAt(playerPos.x, myPos.y, playerPos.z);
       }
       
       // Catch logic
       if (distanceToPlayer < 1.3) {
         catchPlayer();
       }
    }
  });

  const shirtColor = type === 'censor' ? '#1a1a1a' : '#8B0000'; // Black suit vs Red shirt
  const label = type === 'censor' ? 'CENSOR' : 'LÆRER';
  const labelColor = type === 'censor' ? 'black' : 'red';

  return (
    <group ref={ref} position={position}>
      {/* Floating Name Tag */}
      <mesh position={[0, 2.5, 0]}>
         <planeGeometry args={[1.2, 0.3]} />
         <meshBasicMaterial color={labelColor} />
      </mesh>
      <HumanoidModel color="#ffccaa" shirtColor={shirtColor} isCensor={type === 'censor'} />
    </group>
  );
};

// --- Student (Obstacle) ---
export const Student = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<Group>(null);
  const target = useRef(new Vector3(position[0], position[1], position[2]));
  
  useFrame((state, delta) => {
    if (!ref.current) return;
    
    const myPos = ref.current.position;
    const dir = new Vector3().subVectors(target.current, myPos);
    dir.y = 0;
    
    if (dir.length() < 0.5) {
      // Pick new random target within factory bounds roughly (-10 to 10)
      target.current.set(
        (Math.random() - 0.5) * 30,
        0,
        (Math.random() - 0.5) * 30
      );
    } else {
      dir.normalize();
      myPos.add(dir.multiplyScalar(4.0 * delta)); // Fast running
      ref.current.lookAt(target.current.x, myPos.y, target.current.z);
    }
  });

  return (
    <group ref={ref} position={position}>
      <HumanoidModel color="#ffccaa" shirtColor="#4444ff" /> {/* Blue Shirt */}
    </group>
  );
};
