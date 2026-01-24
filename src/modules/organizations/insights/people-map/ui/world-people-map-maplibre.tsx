"use client"

import "maplibre-gl/dist/maplibre-gl.css"

import { useMemo, useState } from "react"
import MapGL, { Layer, Marker, NavigationControl, Source } from "react-map-gl/maplibre"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { CityPin } from "../shared/types/pins"

type SizePreset = "compact" | "normal" | "large"

const sizePresetClass: Record<SizePreset, string> = {
	compact: "text-[11px] px-2 py-1.5 max-w-[170px]",
	normal: "text-xs px-3 py-2 max-w-[220px]",
	large: "text-sm px-4 py-3 max-w-[280px]"
}

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

export default function WorldPeopleMapMapLibre({ pins, minZoomToShowCards = 5.8, size = "normal", scale = 1 }: { pins: CityPin[]; minZoomToShowCards?: number; size?: SizePreset; scale?: number }) {
	const [openPinId, setOpenPinId] = useState<string | null>(null)
	const [zoom, setZoom] = useState<number>(minZoomToShowCards)
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
					attribution: "© OpenStreetMap contributors"
				}
			},
			layers: [
				{ id: "background", type: "background", paint: { "background-color": "#f8f8f8" } },
				{ id: "osm-tiles", type: "raster", source: "osm" }
			]
		}),
		[]
	)

	// 1) GeoJSON das linhas (mock: hub -> todos)
	const linesGeoJson = useMemo(() => buildHubLinesGeoJson(pins), [pins])

	// 2) Layer style das linhas
	const linesLayer: any = useMemo(
		() => ({
			id: "referral-lines",
			type: "line",
			paint: {
				"line-width": 2,
				"line-opacity": 0.45
			}
		}),
		[]
	)

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

				{/* Linhas primeiro (fica “atrás” dos pins) */}
				<Source id="lines-source" type="geojson" data={linesGeoJson as any}>
					<Layer {...linesLayer} />
				</Source>

				{pins.map((p) => {
					const top3 = p.users.slice(0, 3).map((u) => u.name)
					const rest = Math.max(0, p.users.length - top3.length)

					return (
						<Marker key={p.id} latitude={p.lat} longitude={p.lng} anchor="center">
							<div className="pointer-events-auto">
								<div
									className="h-3 w-3 rounded-full border bg-primary shadow"
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
										<div className="font-semibold text-sm">
											{p.city}
											{p.state ? `/${p.state}` : ""} • {p.country}
										</div>

										<div className="mt-1 text-zinc-700">
											{top3.join(", ")}
											{rest ? ` +${rest}` : ""}
										</div>

										{p.users.length > 3 && (
											<Button variant="secondary" size="sm" className="mt-2 h-7 px-2 text-xs" onClick={() => setOpenPinId(p.id)}>
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
						<DialogTitle>{selected ? `${selected.city}${selected.state ? `/${selected.state}` : ""} • ${selected.country}` : ""}</DialogTitle>
					</DialogHeader>

					{selected && (
						<div className="space-y-3">
							<div className="text-sm text-zinc-600">{selected.users.length} pessoa(s)</div>

							<div className="grid gap-2">
								{selected.users.map((u) => (
									<div key={u.id} className="rounded-md border px-3 py-2 text-sm">
										{u.name}
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
