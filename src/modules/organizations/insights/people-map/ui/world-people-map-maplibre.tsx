// @/modules/organizations/insights/people-map/ui/world-people-map-maplibre.tsx

"use client"

import "maplibre-gl/dist/maplibre-gl.css"

import { ArrowRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import MapGL, { Layer, Marker, NavigationControl, Source } from "react-map-gl/maplibre"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { CityPin } from "@/modules/organizations/insights/people-map/shared/types/pins"

type SizePreset = "compact" | "normal" | "large"

const sizePresetClass: Record<SizePreset, string> = {
	compact: "text-[11px] px-2 py-1.5 max-w-[170px]",
	normal: "text-xs px-3 py-2 max-w-[220px]",
	large: "text-sm px-4 py-3 max-w-[280px]"
}

const PULSE_LIGHT_BLUE = "#93c5fd"
const PULSE_DARK_BLUE = "#1d293d"

function buildHubLinesGeoJson(pins: CityPin[]) {
	if (pins.length < 2) {
		return {
			type: "FeatureCollection",
			features: []
		} as const
	}

	const hub = pins[0]!

	return {
		type: "FeatureCollection",
		features: pins.slice(1).map((p) => ({
			type: "Feature",
			properties: {
				from: hub.id,
				to: p.id
			},
			geometry: {
				type: "LineString",
				coordinates: [
					[hub.lng, hub.lat],
					[p.lng, p.lat]
				]
			}
		}))
	} as const
}

function addPulseToLines(geoJson: ReturnType<typeof buildHubLinesGeoJson>) {
	return {
		...geoJson,
		features: geoJson.features.map((feature) => ({
			...feature,
			properties: {
				...feature.properties,
				pulse: Math.random() * 0.6 + 0.2
			}
		}))
	}
}

function getFirstName(fullName: string) {
	const cleaned = fullName.trim()
	if (!cleaned) return "pessoa"
	return cleaned.split(/\s+/)[0] ?? cleaned
}

export default function WorldPeopleMapMapLibre({ pins, minZoomToShowCards = 5.8, size = "normal", scale = 1 }: { pins: CityPin[]; minZoomToShowCards?: number; size?: SizePreset; scale?: number }) {
	const [openPinId, setOpenPinId] = useState<string | null>(null)
	const [zoom, setZoom] = useState<number>(minZoomToShowCards)
	const [linesGeoJson, setLinesGeoJson] = useState(() => addPulseToLines(buildHubLinesGeoJson(pins)))
	const showCards = zoom >= minZoomToShowCards

	const selected = useMemo(() => pins.find((p) => p.id === openPinId) ?? null, [pins, openPinId])

	const rasterStyle = useMemo(
		() => ({
			version: 8,
			sources: {
				osm: {
					type: "raster",
					tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"],
					tileSize: 256,
					attribution: "Â© OpenStreetMap contributors"
				}
			},
			layers: [
				{ id: "background", type: "background", paint: { "background-color": "#f8f8f8" } },
				{ id: "osm-tiles", type: "raster", source: "osm" }
			]
		}),
		[]
	)

	const linesLayer: any = useMemo(
		() => ({
			id: "referral-lines",
			type: "line",
			paint: {
				"line-width": 2,
				"line-opacity": 0.25,
				"line-color": PULSE_DARK_BLUE
			}
		}),
		[]
	)

	const glowLinesLayer: any = useMemo(
		() => ({
			id: "referral-lines-glow",
			type: "line",
			paint: {
				"line-width": 6,
				"line-blur": 6,
				"line-opacity": ["interpolate", ["linear"], ["get", "pulse"], 0, 0.2, 1, 0.7],
				"line-color": ["interpolate", ["linear"], ["get", "pulse"], 0, PULSE_LIGHT_BLUE, 1, PULSE_DARK_BLUE]
			}
		}),
		[]
	)

	useEffect(() => {
		setLinesGeoJson(addPulseToLines(buildHubLinesGeoJson(pins)))
	}, [pins])

	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout> | null = null

		const schedule = () => {
			timeoutId = setTimeout(
				() => {
					setLinesGeoJson((current) => addPulseToLines(current))
					schedule()
				},
				700 + Math.random() * 800
			)
		}

		schedule()

		return () => {
			if (timeoutId) clearTimeout(timeoutId)
		}
	}, [])

	return (
		<div className="w-full h-[650px] rounded-xl overflow-hidden border">
			<MapGL
				initialViewState={{
					latitude: -14.235,
					longitude: -51.9253,
					zoom: 4.2
				}}
				mapStyle={rasterStyle as any}
				onMove={(evt) => setZoom(evt.viewState.zoom)}
			>
				<div className="absolute right-3 top-3 z-10">
					<NavigationControl />
				</div>

				{/* Linhas primeiro (fica atras dos pins) */}
				<Source id="lines-source" type="geojson" data={linesGeoJson as any}>
					<Layer {...glowLinesLayer} />
					<Layer {...linesLayer} />
				</Source>

				{pins.map((p) => {
					const top3 = p.users.slice(0, 3).map((u) => u.name)
					const rest = Math.max(0, p.users.length - top3.length)

					return (
						<Marker key={p.id} latitude={p.lat} longitude={p.lng} anchor="center">
							<div className="pointer-events-auto">
								<div
									className="h-3 w-3 rounded-full border bg-foreground dark:bg-secondary shadow"
									style={{
										transform: `scale(${Math.max(0.8, Math.min(1.6, scale))})`
									}}
									title={`${p.city}${p.state ? `/${p.state}` : ""}`}
								/>

								{showCards && (
									<div
										className={["mt-2 rounded-lg bg-white/95 shadow border", sizePresetClass[size]].join(" ")}
										style={{
											transform: `scale(${scale})`,
											transformOrigin: "top left"
										}}
									>
										<div className="font-semibold text-sm text-center text-foreground dark:text-secondary">
											{p.city}
											{p.state ? `/${p.state}` : ""} • {p.country}
										</div>

										<div className="mt-1 text-zinc-700">
											{top3.join(", ")}
											{rest ? ` +${rest}` : ""}
										</div>

										{p.users.length > 3 && (
											<Button variant="secondary" size="sm" className="mt-2 h-7 px-2 text-xs w-full" onClick={() => setOpenPinId(p.id)}>
												Ver mais
											</Button>
										)}
									</div>
								)}
							</div>
						</Marker>
					)
				})}
			</MapGL>

			<Dialog open={!!selected} onOpenChange={(v) => !v && setOpenPinId(null)}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>{selected ? `${selected.city}${selected.state ? `/${selected.state}` : ""} - ${selected.country}` : ""}</DialogTitle>
					</DialogHeader>

					{selected && (
						<div className="space-y-3">
							<div className="text-sm text-zinc-600">{selected.users.length} pessoa(s)</div>

							<div className="grid gap-2">
								{selected.users.map((u) => (
									<div key={u.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
										<span>{u.name}</span>
										<Tooltip>
											<TooltipTrigger asChild>
												<button type="button" className="text-muted-foreground hover:text-foreground transition-colors" aria-label={`Visualizar perfil de ${getFirstName(u.name)}`}>
													<ArrowRight className="h-4 w-4" />
												</button>
											</TooltipTrigger>
											<TooltipContent side="left" align="center">
												Visualizar perfil de {getFirstName(u.name)}
											</TooltipContent>
										</Tooltip>
									</div>
								))}
							</div>

							<div className="flex justify-end">
								<Button variant="secondary" onClick={() => setOpenPinId(null)}>
									Fechar
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
