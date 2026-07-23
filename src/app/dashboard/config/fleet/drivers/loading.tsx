import { DataTableSkeleton } from "@/shared/components/ui/data-table-skeleton"
import { Skeleton } from "@/shared/components/ui/skeleton"

const FleetDriversLoading = () => {
	return (
		<div className="p-4 space-y-6">
			<header className="space-y-2">
				<Skeleton className="h-7 w-56" />
				<Skeleton className="h-4 w-80 max-w-full" />
			</header>

			<div className="w-full space-y-4">
				<div className="flex flex-wrap items-center gap-2">
					<Skeleton className="h-8 w-full sm:w-[240px] lg:w-[280px]" />
					<Skeleton className="h-8 w-24" />
					<Skeleton className="ml-auto hidden h-9 w-[220px] md:block" />
				</div>

				<Skeleton className="h-4 w-24" />

				<DataTableSkeleton columnCount={5} rowCount={6} />
			</div>
		</div>
	)
}

export default FleetDriversLoading
