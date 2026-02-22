import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Mouse-reactive camera ─── */
function CameraRig() {
    const { camera } = useThree()
    const mouse = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const onMove = (e) => {
            mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
            mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
        }
        window.addEventListener('mousemove', onMove)
        return () => window.removeEventListener('mousemove', onMove)
    }, [])

    useFrame(() => {
        camera.position.x += (mouse.current.x * 1.5 - camera.position.x) * 0.02
        camera.position.y += (mouse.current.y * 1.0 - camera.position.y) * 0.02
        camera.lookAt(0, 0, 0)
    })

    return null
}

/* ─── Starfield — dense twinkling stars ─── */
function Starfield() {
    const ref = useRef()
    const count = 3000

    const [positions, sizes] = useMemo(() => {
        const pos = new Float32Array(count * 3)
        const sz = new Float32Array(count)
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 60
            pos[i * 3 + 1] = (Math.random() - 0.5) * 40
            pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10
            sz[i] = Math.random()
        }
        return [pos, sz]
    }, [])

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.003
            ref.current.rotation.x = state.clock.elapsedTime * 0.002
            // Twinkle: modulate opacity
            ref.current.material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 0.8) * 0.15
        }
    })

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#e2e8f0"
                size={0.015}
                sizeAttenuation
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    )
}

/* ─── Particle Nebula — 6000 particles in helix spiral ─── */
function ParticleNebula() {
    const ref = useRef()
    const count = 6000

    const [positions, colors] = useMemo(() => {
        const pos = new Float32Array(count * 3)
        const col = new Float32Array(count * 3)
        const c1 = new THREE.Color('#6366f1')
        const c2 = new THREE.Color('#a855f7')
        const c3 = new THREE.Color('#06d6a0')

        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 8
            const r = 3 + Math.sin(t * 0.3) * 2 + Math.random() * 2
            pos[i * 3] = Math.cos(t) * r + (Math.random() - 0.5) * 1.5
            pos[i * 3 + 1] = (i / count - 0.5) * 20 + (Math.random() - 0.5) * 1.5
            pos[i * 3 + 2] = Math.sin(t) * r + (Math.random() - 0.5) * 1.5

            const mix = i / count
            const color = mix < 0.33 ? c1.clone().lerp(c2, mix * 3)
                : mix < 0.66 ? c2.clone().lerp(c3, (mix - 0.33) * 3)
                    : c3.clone().lerp(c1, (mix - 0.66) * 3)
            col[i * 3] = color.r
            col[i * 3 + 1] = color.g
            col[i * 3 + 2] = color.b
        }
        return [pos, col]
    }, [])

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.015
            ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1
        }
    })

    return (
        <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                vertexColors
                size={0.03}
                sizeAttenuation
                depthWrite={false}
                opacity={0.7}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    )
}

/* ─── Neural Network Mesh — Connected nodes with glowing lines ─── */
function NeuralNetwork() {
    const groupRef = useRef()
    const linesRef = useRef()
    const nodeCount = 80
    const connectionDistance = 4

    const { nodes, linePositions, lineCount } = useMemo(() => {
        const n = []
        for (let i = 0; i < nodeCount; i++) {
            n.push(new THREE.Vector3(
                (Math.random() - 0.5) * 18,
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 12 - 3
            ))
        }

        // Build connections
        const lines = []
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                if (n[i].distanceTo(n[j]) < connectionDistance) {
                    lines.push(n[i].x, n[i].y, n[i].z, n[j].x, n[j].y, n[j].z)
                }
            }
        }

        return { nodes: n, linePositions: new Float32Array(lines), lineCount: lines.length / 6 }
    }, [])

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.01
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.05
        }
    })

    return (
        <group ref={groupRef}>
            {/* Connection lines */}
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={lineCount * 2}
                        array={linePositions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#6366f1"
                    transparent
                    opacity={0.08}
                    blending={THREE.AdditiveBlending}
                />
            </lineSegments>

            {/* Nodes */}
            {nodes.map((pos, i) => (
                <mesh key={i} position={pos}>
                    <sphereGeometry args={[0.04 + Math.random() * 0.03, 8, 8]} />
                    <meshBasicMaterial
                        color={i % 3 === 0 ? '#06d6a0' : i % 3 === 1 ? '#a855f7' : '#6366f1'}
                        transparent
                        opacity={0.6}
                    />
                </mesh>
            ))}
        </group>
    )
}

/* ─── Holographic Floating Geometries ─── */
function HolographicGeometries() {
    const icoRef = useRef()
    const torusRef = useRef()
    const octRef = useRef()

    useFrame((state) => {
        const t = state.clock.elapsedTime
        if (icoRef.current) {
            icoRef.current.rotation.x = t * 0.05
            icoRef.current.rotation.y = t * 0.07
            icoRef.current.position.y = Math.sin(t * 0.3) * 0.5
        }
        if (torusRef.current) {
            torusRef.current.rotation.x = t * 0.08
            torusRef.current.rotation.z = t * 0.05
            torusRef.current.position.y = Math.cos(t * 0.25) * 0.4 + 1
        }
        if (octRef.current) {
            octRef.current.rotation.y = t * 0.06
            octRef.current.rotation.z = t * 0.04
            octRef.current.position.y = Math.sin(t * 0.35) * 0.3 - 1
        }
    })

    return (
        <>
            {/* Large icosahedron */}
            <mesh ref={icoRef} position={[5, 0, -5]}>
                <icosahedronGeometry args={[2, 1]} />
                <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.08} />
            </mesh>

            {/* Torus knot */}
            <mesh ref={torusRef} position={[-5, 1, -6]}>
                <torusKnotGeometry args={[1.2, 0.08, 128, 16, 2, 3]} />
                <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.1} />
            </mesh>

            {/* Octahedron */}
            <mesh ref={octRef} position={[3, -2, -4]}>
                <octahedronGeometry args={[1, 0]} />
                <meshBasicMaterial color="#06d6a0" wireframe transparent opacity={0.1} />
            </mesh>
        </>
    )
}

/* ─── Pulse Rings — expanding energy rings ─── */
function PulseRings() {
    const ring1 = useRef()
    const ring2 = useRef()
    const ring3 = useRef()

    useFrame((state) => {
        const t = state.clock.elapsedTime
            ;[ring1, ring2, ring3].forEach((ref, i) => {
                if (ref.current) {
                    const phase = (t * 0.3 + i * 2.1) % 6.28
                    const scale = 1 + Math.sin(phase) * 0.5 + phase * 0.1
                    ref.current.scale.setScalar(scale)
                    ref.current.material.opacity = Math.max(0, 0.08 - phase * 0.01)
                    ref.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.1 + i) * 0.1
                }
            })
    })

    return (
        <>
            <mesh ref={ring1} position={[0, 0, -3]}>
                <torusGeometry args={[3, 0.01, 16, 100]} />
                <meshBasicMaterial color="#6366f1" transparent opacity={0.08} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh ref={ring2} position={[0, 0, -3]}>
                <torusGeometry args={[4, 0.01, 16, 100]} />
                <meshBasicMaterial color="#a855f7" transparent opacity={0.06} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh ref={ring3} position={[0, 0, -3]}>
                <torusGeometry args={[5, 0.01, 16, 100]} />
                <meshBasicMaterial color="#06d6a0" transparent opacity={0.04} blending={THREE.AdditiveBlending} />
            </mesh>
        </>
    )
}

/* ─── Main Export ─── */
export default function Background3D() {
    return (
        <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
            <Canvas
                camera={{ position: [0, 0, 10], fov: 55 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                style={{ background: 'transparent' }}
                dpr={[1, 1.5]}
            >
                <CameraRig />
                <ambientLight intensity={0.2} />
                <Starfield />
                <ParticleNebula />
                <NeuralNetwork />
                <HolographicGeometries />
                <PulseRings />
            </Canvas>
        </div>
    )
}
