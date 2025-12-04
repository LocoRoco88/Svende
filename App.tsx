import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Sky, Stars, Sparkles, Environment } from '@react-three/drei';
import { Vector3, Group, RepeatWrapping, TextureLoader } from 'three';
import { useStore } from './store';
import { UI } from './components/UI';
import { AudioManager } from './components/Audio';
import { Teacher, Student } from './components/Characters';
import { WorkStation, MaterialCrate, ConveyorBelt, OilSpill } from './components/FactoryObjects';
import { GameState } from './types';

// --- Player Controller ---
const Player = ({ playerRef }: { playerRef: React.RefObject<Group> }) => {
  const { camera } = useThree();
  const [move, setMove] = useState({ 
    forward: false, 
    backward: false, 
    left: false, 
    right: false, 
    sprint: false,
    rotateLeft: false,
    rotateRight: false
  });
  const gameState = useStore(state => state.gameState);
  
  // Physics / Hazards
  const oilSpills = useStore(state => state.oilSpills);
  const setSlipping = useStore(state => state.setSlipping);
  const isSlipping = useStore(state => state.isSlipping);
  
  // Slipping velocity
  const slipVelocity = useRef(new Vector3(0,0,0));

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': 
        case 'ArrowUp':
          setMove(m => ({ ...m, forward: true })); break;
        case 'KeyS': 
        case 'ArrowDown':
          setMove(m => ({ ...m, backward: true })); break;
        case 'KeyA': setMove(m => ({ ...m, left: true })); break;
        case 'KeyD': setMove(m => ({ ...m, right: true })); break;
        case 'ShiftLeft': setMove(m => ({ ...m, sprint: true })); break;
        // Rotation
        case 'KeyQ': 
        case 'ArrowLeft':
          setMove(m => ({ ...m, rotateLeft: true })); break;
        case 'KeyE': 
        case 'ArrowRight':
          setMove(m => ({ ...m, rotateRight: true })); break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': 
        case 'ArrowUp':
          setMove(m => ({ ...m, forward: false })); break;
        case 'KeyS': 
        case 'ArrowDown':
          setMove(m => ({ ...m, backward: false })); break;
        case 'KeyA': setMove(m => ({ ...m, left: false })); break;
        case 'KeyD': setMove(m => ({ ...m, right: false })); break;
        case 'ShiftLeft': setMove(m => ({ ...m, sprint: false })); break;
        // Rotation
        case 'KeyQ': 
        case 'ArrowLeft':
          setMove(m => ({ ...m, rotateLeft: false })); break;
        case 'KeyE': 
        case 'ArrowRight':
          setMove(m => ({ ...m, rotateRight: false })); break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (gameState !== GameState.PLAYING) return;
    if (!playerRef.current) return;

    // Check Oil Spills
    let currentlyOnOil = false;
    for (const spill of oilSpills) {
        const spillPos = new Vector3(...spill.position);
        if (playerRef.current.position.distanceTo(spillPos) < 1.0) {
            currentlyOnOil = true;
            break;
        }
    }

    if (currentlyOnOil && !isSlipping) {
        setSlipping(true);
        // Initial slip impulse (keep current direction mostly)
        // We will calc vel later, but here just set flag
    } else if (!currentlyOnOil && isSlipping) {
        // Friction slowly stops slipping
        setSlipping(false);
    }

    if (isSlipping) {
        // Drifting logic
        // Ignore input, slide in current slipVelocity direction
        // Add random rotation to camera for disorientation
        camera.rotation.y += Math.sin(state.clock.elapsedTime * 10) * 0.02;
        
        // Decay slip velocity just a tiny bit or maintain it to feel like ice/oil
        // We actually want to slide OUT of the oil
        // Use last known direction
        
        const moveX = Math.sin(camera.rotation.y) * 6.0 * delta;
        const moveZ = -Math.cos(camera.rotation.y) * 6.0 * delta; // Force forward drift
        
        playerRef.current.position.x -= Math.sin(camera.rotation.y + Math.PI/2) * 5 * delta; // Slide sideways
        playerRef.current.position.z -= Math.cos(camera.rotation.y + Math.PI/2) * 5 * delta;

    } else {
        // Normal Movement
        const rotateSpeed = 2.0;
        if (move.rotateLeft) camera.rotation.y += rotateSpeed * delta;
        if (move.rotateRight) camera.rotation.y -= rotateSpeed * delta;

        const baseSpeed = 8.0; 
        const sprintMultiplier = 1.8;
        const currentSpeed = move.sprint ? baseSpeed * sprintMultiplier : baseSpeed;

        const direction = new Vector3();
        const frontVector = new Vector3(0, 0, Number(move.backward) - Number(move.forward));
        const sideVector = new Vector3(Number(move.left) - Number(move.right), 0, 0);

        direction
          .subVectors(frontVector, sideVector)
          .normalize()
          .multiplyScalar(currentSpeed * delta)
          .applyEuler(camera.rotation);

        playerRef.current.position.add(direction);
        
        // Footsteps Audio Trigger
        if (direction.length() > 0.01) {
            if ((window as any).playFootstep) (window as any).playFootstep();
        }
    }
    
    // Clamp
    playerRef.current.position.x = Math.max(-19, Math.min(19, playerRef.current.position.x));
    playerRef.current.position.z = Math.max(-19, Math.min(19, playerRef.current.position.z));
    
    camera.position.copy(playerRef.current.position).add(new Vector3(0, 1.7, 0));
  });

  return <group ref={playerRef} position={[0, 0, 0]} />;
};

// --- Floor Markings ---
const SafetyStripes = () => {
  return (
    <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Main aisle stripes */}
        <mesh position={[0, 0, 0]}>
            <planeGeometry args={[4, 38]} />
            <meshBasicMaterial color="#fbbf24" opacity={0.3} transparent />
        </mesh>
        <mesh position={[0, 0, 0]}>
            <planeGeometry args={[3.5, 38]} />
            <meshBasicMaterial color="#1f2937" />
        </mesh>
        
        {/* Cross aisle */}
        <mesh position={[0, 0, 0]}>
            <planeGeometry args={[38, 4]} />
            <meshBasicMaterial color="#fbbf24" opacity={0.3} transparent />
        </mesh>
        <mesh position={[0, 0, 0]}>
            <planeGeometry args={[38, 3.5]} />
            <meshBasicMaterial color="#1f2937" />
        </mesh>

        {/* Workstation Zones */}
        <mesh position={[5, 2, 0]}>
            <circleGeometry args={[2, 32]} />
            <meshBasicMaterial color="#fbbf24" opacity={0.5} transparent />
        </mesh>
        <mesh position={[10, -8, 0]}>
            <circleGeometry args={[2, 32]} />
            <meshBasicMaterial color="#fbbf24" opacity={0.5} transparent />
        </mesh>
    </group>
  );
}

// --- Game Scene ---
const GameScene = () => {
  const playerRef = useRef<Group>(null);
  const gameState = useStore(state => state.gameState);
  const updateLoop = useStore(state => state.updateLoop);
  const oilSpills = useStore(state => state.oilSpills);
  
  useFrame((state) => {
    updateLoop(Date.now());
  });

  // Unlock mouse on menus
  useEffect(() => {
    if (gameState !== GameState.PLAYING) {
      document.exitPointerLock?.();
    }
  }, [gameState]);

  return (
    <>
      <AudioManager />
      <Sky sunPosition={[100, 20, 100]} turbidity={2} rayleigh={0.5} />
      <Environment preset="city" /> 
      <fog attach="fog" args={['#1e293b', 5, 40]} />
      
      <ambientLight intensity={0.4} />
      <directionalLight position={[20, 30, 10]} intensity={1.0} castShadow shadow-mapSize={[1024, 1024]}>
        <orthographicCamera attach="shadow-camera" args={[-25, 25, 25, -25]} />
      </directionalLight>
      
      {/* Factory Dust/Particles */}
      <Sparkles count={500} scale={40} size={4} speed={0.4} opacity={0.5} color="#fbbf24" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#334155" roughness={0.8} metalness={0.2} />
      </mesh>
      
      <SafetyStripes />

      {/* Walls */}
      <mesh position={[0, 4, -20]}>
        <boxGeometry args={[40, 8, 1]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, 4, 20]}>
        <boxGeometry args={[40, 8, 1]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[-20, 4, 0]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[40, 8, 1]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[20, 4, 0]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[40, 8, 1]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Logic */}
      <Player playerRef={playerRef} />
      {gameState === GameState.PLAYING && <PointerLockControls />}

      {/* Objects */}
      <ConveyorBelt position={[5, 0, 0]} />
      <WorkStation id={1} position={[5, 0, 2]} playerRef={playerRef} />
      <MaterialCrate position={[-5, 0, 2]} playerRef={playerRef} />
      
      <ConveyorBelt position={[10, 0, -10]} />
      <WorkStation id={2} position={[10, 0, -8]} playerRef={playerRef} />
      
      {/* Oil Spills */}
      {oilSpills.map(spill => (
          <OilSpill key={spill.id} id={spill.id} position={spill.position} playerRef={playerRef} />
      ))}
      
      {/* Decorative Crates */}
      <MaterialCrate position={[-15, 0, -15]} playerRef={playerRef} />
      <MaterialCrate position={[-14, 0, -15]} playerRef={playerRef} />
      <MaterialCrate position={[-15, 1, -15]} playerRef={playerRef} />

      {/* Characters */}
      <Teacher position={[10, 0, 10]} playerRef={playerRef} type="teacher" index={0} />
      <Teacher position={[-10, 0, -10]} playerRef={playerRef} type="teacher" index={1} />
      
      <Teacher position={[0, 0, 15]} playerRef={playerRef} type="censor" index={2} /> 
      <Teacher position={[15, 0, 0]} playerRef={playerRef} type="censor" index={3} /> 
      
      {[...Array(6)].map((_, i) => (
        <Student key={i} position={[
          (Math.random() - 0.5) * 30, 
          0, 
          (Math.random() - 0.5) * 30
        ]} />
      ))}
    </>
  );
};

const App = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows camera={{ fov: 60 }}>
        <GameScene />
      </Canvas>
      <UI />
    </div>
  );
};

export default App;
