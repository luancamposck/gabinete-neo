import { AuthTabs } from "@/components/auth-tabs"
import { Vortex } from "@/components/vortex"

export default function LoginPage() {
	return (
		<div className="relative bg-muted/20 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
			<div className="fixed left-0 -top-40 size-full -z-20 overflow-hidden">
				<Vortex backgroundColor="transparent" className="flex size-full" rangeY={300} baseRadius={2} particleCount={50} rangeSpeed={1.5} baseHue={200} />
			</div>

			<AuthTabs />
		</div>
	)
}
