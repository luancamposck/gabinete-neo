"use client"

import { motion } from "motion/react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { useEffect, useEffectEvent, useRef } from "react"
import { createNoise3D } from "simplex-noise"

interface VortexProps {
	children?: React.ReactNode
	className?: string
	containerClassName?: string
	particleCount?: number
	rangeY?: number
	baseHue?: number
	baseSpeed?: number
	rangeSpeed?: number
	baseRadius?: number
	rangeRadius?: number
	backgroundColor?: string
}

const VortexCore = (props: VortexProps) => {
	const { resolvedTheme } = useTheme()
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const paletteRef = useRef<string[]>([])
	const backgroundColorRef = useRef<string>(props.backgroundColor || "#000000")
	const animationFrameRef = useRef<number | null>(null)
	const particleCount = props.particleCount || 700
	const particlePropCount = 10
	const particlePropsLength = particleCount * particlePropCount
	const rangeY = props.rangeY || 100
	const baseTTL = 50
	const rangeTTL = 150
	const baseSpeed = props.baseSpeed || 0.0
	const rangeSpeed = props.rangeSpeed || 1.5
	const baseRadius = props.baseRadius || 1
	const rangeRadius = props.rangeRadius || 2
	const baseHue = props.baseHue || 265
	const rangeHue = 100
	const noiseSteps = 3
	const xOff = 0.00125
	const yOff = 0.00125
	const zOff = 0.0005
	let tick = 0
	const noise3D = createNoise3D()
	let particleProps = new Float32Array(particlePropsLength)
	const center: [number, number] = [0, 0]
	const X = 0
	const Y = 1
	const VX = 2
	const VY = 3
	const LIFE = 4
	const TTL = 5
	const SPEED = 6
	const RADIUS = 7
	const HUE = 8
	const COLOR = 9

	const TAU: number = 2 * Math.PI
	const rand = (n: number): number => n * Math.random()
	const randRange = (n: number): number => n - rand(2 * n)
	const fadeInOut = (t: number, m: number): number => {
		const hm = 0.5 * m
		return Math.abs(((t + hm) % m) - hm) / hm
	}
	const lerp = (n1: number, n2: number, speed: number): number => (1 - speed) * n1 + speed * n2
	const getCssVariable = (variable: string) => {
		if (typeof window === "undefined") return undefined
		const value = getComputedStyle(document.documentElement).getPropertyValue(variable)
		return value?.trim() || undefined
	}
	const refreshThemeColors = () => {
		const themePalette = ["--primary", "--accent", "--ring", "--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"].map((token) => getCssVariable(token)).filter(Boolean) as string[]

		if (themePalette.length) {
			paletteRef.current = themePalette
		}

		const background = props.backgroundColor ?? getCssVariable("--background")
		if (background) {
			backgroundColorRef.current = background
		}
	}

	const setup = () => {
		const canvas = canvasRef.current
		const container = containerRef.current
		if (canvas && container) {
			const ctx = canvas.getContext("2d")

			if (ctx) {
				resize(canvas)
				initParticles()
				draw(canvas, ctx)
			}
		}
	}

	const initParticles = () => {
		tick = 0
		// simplex = new SimplexNoise();
		particleProps = new Float32Array(particlePropsLength)

		for (let i = 0; i < particlePropsLength; i += particlePropCount) {
			initParticle(i)
		}
	}

	const initParticle = (i: number): void => {
		const canvas = canvasRef.current
		if (!canvas) return

		const x = rand(canvas.width)
		const y = center[1] + randRange(rangeY)
		const vx = 0
		const vy = 0
		const life = 0
		const ttl = baseTTL + rand(rangeTTL)
		const speed = baseSpeed + rand(rangeSpeed)
		const radius = baseRadius + rand(rangeRadius)
		const hue = baseHue + rand(rangeHue)
		const colorIndex = Math.floor(rand(Math.max(paletteRef.current.length, 1)))

		particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue, colorIndex], i)
	}

	const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
		tick++

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		ctx.fillStyle = backgroundColorRef.current
		ctx.fillRect(0, 0, canvas.width, canvas.height)

		drawParticles(ctx)
		renderGlow(canvas, ctx)
		renderToScreen(canvas, ctx)

		animationFrameRef.current = window.requestAnimationFrame(() => draw(canvas, ctx))
	}

	const drawParticles = (ctx: CanvasRenderingContext2D) => {
		for (let i = 0; i < particlePropsLength; i += particlePropCount) {
			updateParticle(i, ctx)
		}
	}

	const updateParticle = (i: number, ctx: CanvasRenderingContext2D) => {
		const canvas = canvasRef.current
		if (!canvas) return

		const x = particleProps[i + X] ?? 0
		const y = particleProps[i + Y] ?? 0
		const n = noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU
		const vx = lerp(particleProps[i + VX] ?? 0, Math.cos(n), 0.5)
		const vy = lerp(particleProps[i + VY] ?? 0, Math.sin(n), 0.5)
		let life = particleProps[i + LIFE] ?? 0
		const ttl = particleProps[i + TTL] ?? 0
		const speed = particleProps[i + SPEED] ?? 0
		const x2 = x + vx * speed
		const y2 = y + vy * speed
		const radius = particleProps[i + RADIUS] ?? 0
		const hue = particleProps[i + HUE] ?? 0
		const colorIndex = particleProps[i + COLOR] ?? 0

		drawParticle(x, y, x2, y2, life, ttl, radius, hue, colorIndex, ctx)

		life++

		particleProps[i + X] = x2
		particleProps[i + Y] = y2
		particleProps[i + VX] = vx
		particleProps[i + VY] = vy
		particleProps[i + LIFE] = life

		const bounds = checkBounds(x, y, canvas) || life > ttl

		bounds && initParticle(i)
	}

	const drawParticle = (x: number, y: number, x2: number, y2: number, life: number, ttl: number, radius: number, hue: number, colorIndex: number, ctx: CanvasRenderingContext2D) => {
		const palette = paletteRef.current
		const paletteIndex = palette.length ? Math.abs(Math.floor(colorIndex)) % palette.length : -1
		const color = paletteIndex >= 0 ? palette[paletteIndex] : `hsla(${hue},100%,60%,1)`

		ctx.save()
		ctx.lineCap = "round"
		ctx.lineWidth = radius
		ctx.globalAlpha = fadeInOut(life, ttl)
		ctx.strokeStyle = color
		ctx.beginPath()
		ctx.moveTo(x, y)
		ctx.lineTo(x2, y2)
		ctx.stroke()
		ctx.closePath()
		ctx.restore()
	}

	const checkBounds = (x: number, y: number, canvas: HTMLCanvasElement) => {
		return x > canvas.width || x < 0 || y > canvas.height || y < 0
	}

	const resize = (canvas: HTMLCanvasElement) => {
		const { innerWidth, innerHeight } = window

		canvas.width = innerWidth
		canvas.height = innerHeight

		center[0] = 0.5 * canvas.width
		center[1] = 0.5 * canvas.height
	}

	const renderGlow = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
		ctx.save()
		ctx.filter = "blur(8px) brightness(200%)"
		ctx.globalCompositeOperation = "lighter"
		ctx.drawImage(canvas, 0, 0)
		ctx.restore()

		ctx.save()
		ctx.filter = "blur(4px) brightness(200%)"
		ctx.globalCompositeOperation = "lighter"
		ctx.drawImage(canvas, 0, 0)
		ctx.restore()
	}

	const renderToScreen = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
		ctx.save()
		ctx.globalCompositeOperation = "lighter"
		ctx.drawImage(canvas, 0, 0)
		ctx.restore()
	}

	const initializeVortex = useEffectEvent(() => {
		refreshThemeColors()
		setup()
	})

	const resizeVortex = useEffectEvent(() => {
		const canvas = canvasRef.current
		if (canvas) resize(canvas)
	})

	const effectKey = [resolvedTheme, props.backgroundColor, baseHue, baseRadius, baseSpeed, particlePropsLength, rangeRadius, rangeSpeed, rangeY].join("|")

	useEffect(() => {
		if (!effectKey) return

		initializeVortex()
		window.addEventListener("resize", resizeVortex)

		return () => {
			window.removeEventListener("resize", resizeVortex)
			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current)
			}
		}
	}, [effectKey, initializeVortex, resizeVortex])

	/**
	 * Firefox has some issues with this component and becomes very laggy
	 * so we are disabling it for Firefox for now
	 * */
	if (typeof window !== "undefined" && window.navigator.userAgent.includes("Firefox")) return null

	return (
		<div className={"relative h-full w-full"}>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} ref={containerRef} className="absolute h-full w-full inset-0 z-0 bg-transparent flex items-center justify-center">
				<canvas ref={canvasRef} />
			</motion.div>

			<div className={"relative z-10 flex size-full"}>{props.children}</div>
		</div>
	)
}

// Envolva no dynamic
export const Vortex = dynamic(() => Promise.resolve(VortexCore), {
	ssr: false
})
