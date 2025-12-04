import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, MathUtils } from 'three';
import { useStore } from '../store';

// --- Guidance Arrow ---
const FloatingArrow = ({ color }: { color: string }) => {
  const ref = useRef<Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 2.5 + Math.sin(state.clock.elapsedTime * 5) * 0.3;
      ref.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[0, 0.4, 0.8, 4]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
};

// --- Smoke Particles (For Broken Machines) ---
const SmokeParticles = () => {
    const ref = useRef<Group>(null);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y += 0.01;
            ref.current.children.forEach((child, i) => {
                child.position.y += 0.02;
                child.scale.addScalar(0.005);
                if (child.position.y > 3) {
                    child.position.y = 0;
                    child.scale.set(0.2, 0.2, 0.2);
                }
            });
        }
    });

    return (
        <group ref={ref} position={[0, 2, 0]}>
            {[...Array(5)].map((_, i) => (
                <mesh key={i} position={[Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5]}>
                    <sphereGeometry args={[0.2, 6, 6]} />
                    <meshBasicMaterial color="#333" transparent opacity={0.6} />
                </mesh>
            ))}
        </group>
    )
}

// --- Oil Spill ---
export const OilSpill = ({ id, position, playerRef }: { id: string, position: [number, number, number], playerRef: React.RefObject<Group> }) => {
    const cleanOilSpill = useStore(state => state.cleanOilSpill);
    const [progress, setProgress] = useState(0);
    const [cleaning, setCleaning] = useState(false);

    useFrame((state, delta) => {
        if (!playerRef.current) return;
        const dist = playerRef.current.position.distanceTo(new Vector3(...position));
        
        // Clean interaction
        if (cleaning) {
            setProgress(p => p + delta);
            if (progress > 2.0) { // 2 seconds to clean
                cleanOilSpill(id);
            }
        } else {
            setProgress(0);
        }
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'e') {
                if (playerRef.current) {
                    const dist = playerRef.current.position.distanceTo(new Vector3(...position));
                    if (dist < 2.5 && dist > 0.5) { // Must be close but not ON it to clean safely
                        setCleaning(true);
                    }
                }
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'e') setCleaning(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return (
        <group position={position}>
            {/* The Spill */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
                <circleGeometry args={[1.2, 32]} />
                <meshStandardMaterial color="#000" roughness={0.1} metalness={0.8} transparent opacity={0.9} />
            </mesh>
            {cleaning && (
                <mesh position={[0, 2, 0]}>
                    <planeGeometry args={[1, 0.2]} />
                    <meshBasicMaterial color="green" />
                    <mesh position={[0, 0, 0.01]} scale={[progress / 2, 1, 1]} position-x={-0.5 + (progress/4)}>
                        <planeGeometry args={[1, 0.2]} />
                        <meshBasicMaterial color="white" />
                    </mesh>
                </mesh>
            )}
        </group>
    );
};

// --- Conveyor Belt ---
export const ConveyorBelt = ({ position }: { position: [number, number, number] }) => {
  const offset = useRef(0);
  
  useFrame((state, delta) => {
    offset.current += delta * 2;
  });

  return (
    <group position={position}>
      {/* Legs */}
      <mesh position={[-0.9, 0.5, -0.4]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshToonMaterial color="#555" />
      </mesh>
      <mesh position={[0.9, 0.5, -0.4]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshToonMaterial color="#555" />
      </mesh>
      <mesh position={[-0.9, 0.5, 0.4]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshToonMaterial color="#555" />
      </mesh>
      <mesh position={[0.9, 0.5, 0.4]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshToonMaterial color="#555" />
      </mesh>
      
      {/* Belt Frame */}
      <mesh position={[0, 1.05, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2.5, 0.1, 1]} />
        <meshToonMaterial color="#333" />
      </mesh>
      
      {/* The Belt Surface */}
      <mesh position={[0, 1.11, 0]}>
        <boxGeometry args={[2.4, 0.02, 0.9]} />
        <meshToonMaterial color="#1f2937" />
      </mesh>
    </group>
  );
};

// --- Robot Arm ---
export const RobotArm = ({ position, active }: { position: [number, number, number], active: boolean }) => {
  const baseRef = useRef<Group>(null);
  const lowerArmRef = useRef<Group>(null);
  const upperArmRef = useRef<Group>(null);
  const t = useRef(0);

  useFrame((state, delta) => {
    if (active) {
      t.current += delta * 3;
      if (baseRef.current) baseRef.current.rotation.y = Math.sin(t.current) * 0.5;
      if (lowerArmRef.current) lowerArmRef.current.rotation.z = Math.sin(t.current * 1.5) * 0.3;
      if (upperArmRef.current) upperArmRef.current.rotation.z = Math.cos(t.current * 1.5) * 0.5 - 0.5;
    } else {
      if (baseRef.current) baseRef.current.rotation.y = MathUtils.lerp(baseRef.current.rotation.y, 0, delta);
      if (lowerArmRef.current) lowerArmRef.current.rotation.z = MathUtils.lerp(lowerArmRef.current.rotation.z, 0, delta);
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.4]} />
        <meshToonMaterial color="#f59e0b" />
      </mesh>
      <group ref={baseRef} position={[0, 0.4, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.4]} />
          <meshToonMaterial color="#f59e0b" />
        </mesh>
        <group position={[0, 0.4, 0]}>
           <mesh rotation={[Math.PI / 2, 0, 0]}>
             <cylinderGeometry args={[0.15, 0.15, 0.4]} />
             <meshToonMaterial color="#333" />
           </mesh>
           <group ref={lowerArmRef}>
             <mesh position={[0, 0.8, 0]}>
               <boxGeometry args={[0.2, 1.6, 0.2]} />
               <meshToonMaterial color="#f59e0b" />
             </mesh>
             <group position={[0, 1.6, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.12, 0.12, 0.35]} />
                  <meshToonMaterial color="#333" />
                </mesh>
                <group ref={upperArmRef}>
                  <mesh position={[0.5, 0, 0]} rotation={[0, 0, -1.2]}>
                    <boxGeometry args={[0.15, 1.2, 0.15]} />
                    <meshToonMaterial color="#f59e0b" />
                  </mesh>
                  <group position={[1.0, -0.8, 0]}>
                    <mesh position={[0, -0.1, 0.1]}>
                      <boxGeometry args={[0.1, 0.3, 0.05]} />
                      <meshToonMaterial color="#111" />
                    </mesh>
                     <mesh position={[0, -0.1, -0.1]}>
                      <boxGeometry args={[0.1, 0.3, 0.05]} />
                      <meshToonMaterial color="#111" />
                    </mesh>
                  </group>
                </group>
             </group>
           </group>
        </group>
      </group>
    </group>
  );
};

// --- Work Station ---
export const WorkStation = ({ id, position, playerRef }: { id: number, position: [number, number, number], playerRef: React.RefObject<Group> }) => {
  const [hasProduct, setHasProduct] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Store
  const produceItem = useStore(state => state.produceItem);
  const holdingItem = useStore(state => state.holdingItem);
  const dropItem = useStore(state => state.dropItem);
  const machines = useStore(state => state.machines);
  const fixMachine = useStore(state => state.fixMachine);
  
  const machineState = machines[id] || { broken: false };
  const isBroken = machineState.broken;

  // Interaction State
  const [labelVisible, setLabelVisible] = useState(false);
  const [repairProgress, setRepairProgress] = useState(0);
  const [isRepairing, setIsRepairing] = useState(false);

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    const dist = playerRef.current.position.distanceTo(new Vector3(...position));
    setLabelVisible(dist < 3);

    // Repair Logic
    if (isRepairing && isBroken) {
        setRepairProgress(p => p + delta);
        if (repairProgress > 3.0) { // 3 seconds to fix
            fixMachine(id);
            setRepairProgress(0);
            setIsRepairing(false);
        }
    } else {
        setRepairProgress(0);
    }
  });

  const interact = () => {
    if (isBroken) {
        // Handled by key hold in useFrame/useEffect
        return; 
    }
    if (processing) return;
    if (holdingItem && !hasProduct) {
      dropItem();
      setHasProduct(true);
      setProcessing(true);
      
      // Simulate robot work
      setTimeout(() => {
        setHasProduct(false);
        setProcessing(false);
        produceItem();
      }, 2000);
    }
  };

  // Keyboard listener for 'E'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e' && labelVisible) {
        if (isBroken) {
            setIsRepairing(true);
        } else {
            interact();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'e') setIsRepairing(false);
    }
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [labelVisible, holdingItem, processing, isBroken]);

  const showGuidance = holdingItem && !hasProduct && !processing && !isBroken;

  return (
    <group position={position}>
      {/* Table */}
      <mesh position={[0, 0.5, 0]}>
         <boxGeometry args={[2, 1, 1.5]} />
         <meshToonMaterial color="#94a3b8" />
      </mesh>
      {/* Top */}
      <mesh position={[0, 1.01, 0]} rotation={[-Math.PI/2,0,0]}>
         <planeGeometry args={[1.8, 1.3]} />
         <meshToonMaterial color="#1e293b" />
      </mesh>
      
      {/* Status Light Pole */}
      <mesh position={[0.8, 1.5, 0.5]}>
         <cylinderGeometry args={[0.05, 0.05, 1]} />
         <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Blinking Light */}
      <mesh position={[0.8, 2.0, 0.5]}>
         <sphereGeometry args={[0.15]} />
         <meshBasicMaterial color={isBroken ? "red" : (processing ? "yellow" : "green")} />
      </mesh>
      
      {(processing || isBroken) && (
          <pointLight 
            position={[0.8, 2.0, 0.5]} 
            color={isBroken ? "red" : "yellow"} 
            intensity={2} 
            distance={3} 
          />
      )}
      
      {/* Broken Smoke */}
      {isBroken && <SmokeParticles />}

      {/* Robot */}
      <RobotArm position={[0, 1, -0.5]} active={processing && !isBroken} />
      
      {/* Product Visualization */}
      {hasProduct && (
        <mesh position={[0, 1.2, 0.3]}>
           <boxGeometry args={[0.3, 0.3, 0.3]} />
           <meshToonMaterial color="#34d399" />
        </mesh>
      )}

      {/* 3D GUIDANCE ARROW */}
      {showGuidance && <FloatingArrow color="#f97316" />} 

      {/* Repair Bar */}
      {isBroken && labelVisible && (
          <group position={[0, 2.8, 0]}>
             <mesh>
                 <planeGeometry args={[1.5, 0.3]} />
                 <meshBasicMaterial color="red" />
             </mesh>
             <mesh position={[0,0,0.01]} scale={[repairProgress / 3, 1, 1]} position-x={-0.75 + (repairProgress/6)}>
                 <planeGeometry args={[1.5, 0.3]} />
                 <meshBasicMaterial color="yellow" />
             </mesh>
          </group>
      )}

      {/* Interact Hint */}
      {labelVisible && !processing && !isBroken && (
        <group position={[0, 2.8, 0]}>
           <mesh>
             <planeGeometry args={[1.5, 0.5]} />
             <meshBasicMaterial color="rgba(0,0,0,0.7)" transparent />
           </mesh>
           <mesh position={[0,0,0.01]}>
             <planeGeometry args={[1.4, 0.4]} />
             <meshBasicMaterial color={holdingItem ? "#4ade80" : "#94a3b8"} />
           </mesh>
        </group>
      )}
    </group>
  );
};

// --- Raw Material Crate ---
export const MaterialCrate = ({ position, playerRef }: { position: [number, number, number], playerRef: React.RefObject<Group> }) => {
  const grabItem = useStore(state => state.grabItem);
  const holdingItem = useStore(state => state.holdingItem);
  const [hover, setHover] = useState(false);

  useFrame((state) => {
    if (!playerRef.current) return;
    const dist = playerRef.current.position.distanceTo(new Vector3(...position));
    setHover(dist < 2.5);
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e' && hover && !holdingItem) {
        grabItem();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hover, holdingItem]);

  // GUIDANCE LOGIC: Show Green Arrow if hands are empty
  const showGuidance = !holdingItem;

  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.2, 1, 1.2]} />
        <meshToonMaterial color="#8b5cf6" />
      </mesh>
      {/* Lid outline / detail */}
      <mesh position={[0, 1.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
         <planeGeometry args={[1, 1]} />
         <meshBasicMaterial color="#7c3aed" />
      </mesh>

      {/* 3D GUIDANCE ARROW */}
      {showGuidance && <FloatingArrow color="#4ade80" />}

      {hover && !holdingItem && (
        <>
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <pointLight position={[0, 1.5, 0]} intensity={1} distance={2} color="white" />
        </>
      )}
    </group>
  );
};
