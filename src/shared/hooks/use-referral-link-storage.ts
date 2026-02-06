"use client"

import { useCallback, useEffect, useState } from "react"

export const DEFAULT_REFERRAL_LINK_STORAGE_KEY = "gabinete:my_referral_link"
const REFERRAL_LINK_STORAGE_EVENT = "gabinete:referral-link-storage"

type UseReferralLinkStorageOptions = {
	storageKey?: string
	defaultValue?: string
}

export function useReferralLinkStorage(options: UseReferralLinkStorageOptions = {}) {
	const { storageKey = DEFAULT_REFERRAL_LINK_STORAGE_KEY, defaultValue = "" } = options

	const readFromStorage = useCallback(() => {
		if (typeof window === "undefined") return defaultValue
		const cached = window.localStorage.getItem(storageKey)
		return cached ?? defaultValue
	}, [defaultValue, storageKey])

	const [referralUrl, setReferralUrlState] = useState<string>(() => readFromStorage())

	useEffect(() => {
		setReferralUrlState(readFromStorage())
	}, [readFromStorage])

	useEffect(() => {
		if (typeof window === "undefined") return

		const sync = () => setReferralUrlState(readFromStorage())
		const handleStorage = (event: StorageEvent) => {
			if (event.key && event.key !== storageKey) return
			sync()
		}

		window.addEventListener("storage", handleStorage)
		window.addEventListener(REFERRAL_LINK_STORAGE_EVENT, sync)

		return () => {
			window.removeEventListener("storage", handleStorage)
			window.removeEventListener(REFERRAL_LINK_STORAGE_EVENT, sync)
		}
	}, [readFromStorage, storageKey])

	const setReferralUrl = useCallback(
		(value: string) => {
			setReferralUrlState(value)
			if (typeof window === "undefined") return
			if (value) {
				window.localStorage.setItem(storageKey, value)
			} else {
				window.localStorage.removeItem(storageKey)
			}
			window.dispatchEvent(new Event(REFERRAL_LINK_STORAGE_EVENT))
		},
		[storageKey]
	)

	const clearReferralUrl = useCallback(() => {
		setReferralUrlState(defaultValue)
		if (typeof window === "undefined") return
		window.localStorage.removeItem(storageKey)
		window.dispatchEvent(new Event(REFERRAL_LINK_STORAGE_EVENT))
	}, [defaultValue, storageKey])

	return {
		referralUrl,
		setReferralUrl,
		clearReferralUrl,
		storageKey
	}
}
