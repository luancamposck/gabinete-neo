"use client"

import type { ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table"
import { useEffect, useState } from "react"

interface PersistedTableState {
	sorting: SortingState
	columnFilters: ColumnFiltersState
	columnVisibility: VisibilityState
}

export function usePersistedTableState({ storageKey, initialState }: { storageKey: string; initialState: Partial<PersistedTableState> }) {
	const [sorting, setSorting] = useState<SortingState>(() => {
		if (typeof window === "undefined") return initialState.sorting || []
		const saved = window.localStorage.getItem(storageKey)
		if (saved) {
			const state: PersistedTableState = JSON.parse(saved)
			return state.sorting ?? initialState.sorting ?? []
		}
		return initialState.sorting || []
	})

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
		if (typeof window === "undefined") return initialState.columnFilters || []
		const saved = window.localStorage.getItem(storageKey)
		if (saved) {
			const state: PersistedTableState = JSON.parse(saved)
			return state.columnFilters ?? initialState.columnFilters ?? []
		}
		return initialState.columnFilters || []
	})

	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
		if (typeof window === "undefined") return initialState.columnVisibility || {}
		const saved = window.localStorage.getItem(storageKey)
		if (saved) {
			const state: PersistedTableState = JSON.parse(saved)
			return { ...initialState.columnVisibility, ...state.columnVisibility }
		}
		return initialState.columnVisibility || {}
	})

	useEffect(() => {
		const stateToSave: PersistedTableState = {
			sorting,
			columnFilters,
			columnVisibility
		}
		window.localStorage.setItem(storageKey, JSON.stringify(stateToSave))
	}, [sorting, columnFilters, columnVisibility, storageKey])

	return {
		sorting,
		setSorting,
		columnFilters,
		setColumnFilters,
		columnVisibility,
		setColumnVisibility
	}
}
