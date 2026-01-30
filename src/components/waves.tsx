"use client"

import { useEffect, useRef } from "react"

export const Waves = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const rafRef = useRef<number | null>(null)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext("2d")
		if (!ctx) return

		let t = 0

		const resize = () => {
			const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
			const w = window.innerWidth
			const h = window.innerHeight

			canvas.width = Math.floor(w * dpr)
			canvas.height = Math.floor(h * dpr)
			canvas.style.width = `${w}px`
			canvas.style.height = `${h}px`

			ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
		}

		const draw = () => {
			const w = window.innerWidth
			const h = window.innerHeight

			// Clear
			ctx.clearRect(0, 0, w, h)

			// ---- Background base (dark, subtle) ----
			// Solid deep base
			ctx.fillStyle = "#050516"
			ctx.fillRect(0, 0, w, h)

			// Soft top-left glow
			const glow1 = ctx.createRadialGradient(w * 0.25, h * 0.15, 0, w * 0.25, h * 0.15, Math.max(w, h) * 0.75)
			glow1.addColorStop(0, "rgba(34, 211, 238, 0.08)")
			glow1.addColorStop(0.55, "rgba(168, 85, 247, 0.05)")
			glow1.addColorStop(1, "rgba(0, 0, 0, 0)")
			ctx.fillStyle = glow1
			ctx.fillRect(0, 0, w, h)

			// Subtle vertical bands like the reference image
			ctx.globalAlpha = 0.18
			const bandW = Math.max(80, Math.floor(w / 10))
			for (let x = 0; x < w + bandW; x += bandW) {
				const g = ctx.createLinearGradient(x, 0, x + bandW, 0)
				g.addColorStop(0, "rgba(255,255,255,0)")
				g.addColorStop(0.5, "rgba(255,255,255,0.06)")
				g.addColorStop(1, "rgba(255,255,255,0)")
				ctx.fillStyle = g
				ctx.fillRect(x, 0, bandW, h)
			}
			ctx.globalAlpha = 1

			// ---- Waves (line contour style) ----
			// Stroke gradient (purple -> cyan), matching the image vibe
			const strokeGrad = ctx.createLinearGradient(0, 0, w, 0)
			strokeGrad.addColorStop(0.0, "rgba(168, 85, 247, 1)") // purple
			strokeGrad.addColorStop(0.55, "rgba(147, 51, 234, 1)") // violet
			strokeGrad.addColorStop(0.78, "rgba(34, 211, 238, 1)") // cyan
			strokeGrad.addColorStop(1.0, "rgba(96, 165, 250, 1)") // blue

			// Parameters tuned to look close to the reference image
			const lineCount = 22
			const spacing = 7.0
			const yStart = h * 0.78

			// A “crest” on the right (the cyan lift)
			const bumpCenter = w * 0.78
			const bumpSigma = w * 0.14

			// Pre-pass: glow
			ctx.save()
			ctx.lineWidth = 1.6
			ctx.strokeStyle = strokeGrad
			ctx.lineJoin = "round"
			ctx.lineCap = "round"
			ctx.shadowColor = "rgba(34, 211, 238, 0.30)"
			ctx.shadowBlur = 18

			for (let i = 0; i < lineCount; i++) {
				const alpha = Math.min(0.42, 0.06 + i * 0.018)
				ctx.globalAlpha = alpha

				ctx.beginPath()
				for (let x = 0; x <= w; x += 10) {
					const nx = x / w

					// Base wave mix (smooth + organic)
					const a1 = 20 + i * 0.55
					const a2 = 7 + i * 0.2

					const f1 = 0.01 + i * 0.00012
					const f2 = 0.0048 + i * 0.00006

					const s1 = 0.85 + i * 0.02
					const s2 = 0.55 + i * 0.015

					// Right “bump” to mimic the reference rising cyan wave
					const bump = Math.exp(-((x - bumpCenter) * (x - bumpCenter)) / (2 * bumpSigma * bumpSigma))
					const bumpLift = bump * (92 + i * 1.0)

					// Slight overall tilt (higher on right)
					const tilt = nx * (40 + i * 0.35)

					const y = yStart + i * spacing - tilt - bumpLift + Math.sin(x * f1 + t * s1 + i * 0.22) * a1 + Math.sin(x * f2 - t * s2 - i * 0.18) * a2

					if (x === 0) ctx.moveTo(x, y)
					else ctx.lineTo(x, y)
				}
				ctx.stroke()
			}
			ctx.restore()

			// Crisp pass: thin lines, less glow
			ctx.save()
			ctx.lineWidth = 1.1
			ctx.strokeStyle = strokeGrad
			ctx.lineJoin = "round"
			ctx.lineCap = "round"
			ctx.shadowBlur = 0

			for (let i = 0; i < lineCount; i++) {
				const alpha = Math.min(0.55, 0.08 + i * 0.02)
				ctx.globalAlpha = alpha

				ctx.beginPath()
				for (let x = 0; x <= w; x += 8) {
					const nx = x / w

					const a1 = 18 + i * 0.5
					const a2 = 6 + i * 0.18

					const f1 = 0.0105 + i * 0.00012
					const f2 = 0.0052 + i * 0.00006

					const s1 = 0.85 + i * 0.02
					const s2 = 0.52 + i * 0.015

					const bump = Math.exp(-((x - bumpCenter) * (x - bumpCenter)) / (2 * bumpSigma * bumpSigma))
					const bumpLift = bump * (88 + i * 0.95)

					const tilt = nx * (38 + i * 0.33)

					const y = yStart + i * spacing - tilt - bumpLift + Math.sin(x * f1 + t * s1 + i * 0.24) * a1 + Math.sin(x * f2 - t * s2 - i * 0.17) * a2

					if (x === 0) ctx.moveTo(x, y)
					else ctx.lineTo(x, y)
				}
				ctx.stroke()
			}
			ctx.restore()

			// Vignette
			ctx.save()
			const vignette = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.15, w * 0.5, h * 0.5, Math.max(w, h) * 0.75)
			vignette.addColorStop(0, "rgba(0,0,0,0)")
			vignette.addColorStop(1, "rgba(0,0,0,0.55)")
			ctx.fillStyle = vignette
			ctx.fillRect(0, 0, w, h)
			ctx.restore()

			t += 0.012
			rafRef.current = requestAnimationFrame(draw)
		}

		resize()
		rafRef.current = requestAnimationFrame(draw)

		window.addEventListener("resize", resize)
		return () => {
			window.removeEventListener("resize", resize)
			if (rafRef.current) cancelAnimationFrame(rafRef.current)
		}
	}, [])

	return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden="true" tabIndex={-1} />
}
