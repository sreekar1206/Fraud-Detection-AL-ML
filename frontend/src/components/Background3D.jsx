import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ParticleField() {
    const ref = useRef()
    const count = 2000

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 25
            pos[i * 3 + 1] = (Math.random() - 0.5) * 25
            pos[i * 3 + 2] = (Math.random() - 0.5) * 25
        }
        return pos
    }, [])

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * 0.02
            ref.current.rotation.y = state.clock.elapsedTime * 0.03
        }
    })

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#6366f1"
                size={0.04}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    )
}

function GlobeWireframe() {
    const meshRef = useRef()

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.05
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.08
        }
    })

    return (
        <mesh ref={meshRef} position={[2.5, 0, -2]}>
            <icosahedronGeometry args={[2.8, 2]} />
            <meshBasicMaterial
                color="#8b5cf6"
                wireframe
                transparent
                opacity={0.12}
            />
        </mesh>
    )
}

function FloatingRings() {
    const ring1Ref = useRef()
    const ring2Ref = useRef()

    useFrame((state) => {
        const t = state.clock.elapsedTime
        if (ring1Ref.current) {
            ring1Ref.current.rotation.x = t * 0.1
            ring1Ref.current.rotation.z = t * 0.05
        }
        if (ring2Ref.current) {
            ring2Ref.current.rotation.y = t * 0.08
            ring2Ref.current.rotation.x = t * 0.04
        }
    })

    return (
        <>
            <mesh ref={ring1Ref} position={[-3, 1, -3]}>
                <torusGeometry args={[1.8, 0.02, 16, 100]} />
                <meshBasicMaterial color="#06d6a0" transparent opacity={0.15} />
            </mesh>
            <mesh ref={ring2Ref} position={[3, -1, -4]}>
                <torusGeometry args={[2.2, 0.02, 16, 100]} />
                <meshBasicMaterial color="#6366f1" transparent opacity={0.1} />
            </mesh>
        </>
    )
}

function NetworkNodes() {
    const groupRef = useRef()
    const nodesCount = 30

    const nodes = useMemo(() => {
        const n = []
        for (let i = 0; i < nodesCount; i++) {
            n.push({
                position: [
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10 - 5
                ],
                scale: Math.random() * 0.06 + 0.02
            })
        }
        return n
    }, [])

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.015
        }
    })

    return (
        <group ref={groupRef}>
            {nodes.map((node, i) => (
                <mesh key={i} position={node.position}>
                    <sphereGeometry args={[node.scale, 8, 8]} />
                    <meshBasicMaterial color="#8b5cf6" transparent opacity={0.5} />
                </mesh>
            ))}
        </group>
    )
}

export default function Background3D() {
    return (
        <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
            <Canvas
                camera={{ position: [0, 0, 8], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.3} />
                <ParticleField />
                <GlobeWireframe />
                <FloatingRings />
                <NetworkNodes />
            </Canvas>
        </div>
    )
}
