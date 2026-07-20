"use client"

import type { ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table"
import { useEffect, useState } from "react"

type PersistedTableState = {
	sorting: SortingState
	columnFilters: ColumnFiltersState
	columnVisibility: VisibilityState
}

type UsePersistedApplicationsTableStateParams = {
	storageKey: string
	initialState: Partial<PersistedTableState>
}

const readPersistedState = (storageKey: string): Partial<PersistedTableState> | null => {
	if (typeof window === "undefined") return null

	const saved = window.localStorage.getItem(storageKey)
	if (!saved) return null

	try {
		return JSON.parse(saved) as PersistedTableState
	} catch {
		return null
	}
}

export const usePersistedApplicationsTableState = ({ storageKey, initialState }: UsePersistedApplicationsTableStateParams) => {
	const [sorting, setSorting] = useState<SortingState>(() => readPersistedState(storageKey)?.sorting ?? initialState.sorting ?? [])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => readPersistedState(storageKey)?.columnFilters ?? initialState.columnFilters ?? [])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => ({ ...initialState.columnVisibility, ...readPersistedState(storageKey)?.columnVisibility }))

	useEffect(() => {
		const stateToSave: PersistedTableState = { sorting, columnFilters, columnVisibility }
		window.localStorage.setItem(storageKey, JSON.stringify(stateToSave))
	}, [sorting, columnFilters, columnVisibility, storageKey])

	return { sorting, setSorting, columnFilters, setColumnFilters, columnVisibility, setColumnVisibility }
}
