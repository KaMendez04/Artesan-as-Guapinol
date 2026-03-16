import { useEffect, useState } from "react"
import { Toaster } from "sileo"
import { useTheme } from "@/shared/components/theme-provider"

/**
 * Theme-aware Sileo Toaster.
 * Detects light/dark mode and applies the correct fill + text styles
 * so toasts always have good contrast.
 */
export function ThemedToaster() {
    const { theme } = useTheme()
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        // Resolve "system" → actual theme by checking the DOM class
        const resolved =
            theme === "system"
                ? document.documentElement.classList.contains("dark")
                : theme === "dark"
        setIsDark(resolved)
    }, [theme])

    // Also listen for system preference changes when theme === "system"
    useEffect(() => {
        if (theme !== "system") return

        const mq = window.matchMedia("(prefers-color-scheme: dark)")
        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
        mq.addEventListener("change", handler)
        return () => mq.removeEventListener("change", handler)
    }, [theme])

    return (
        <Toaster
            position="top-right"
            options={
                isDark
                    ? {
                        fill: "#1c1c1e",
                        styles: {
                            title: "text-white!",
                            description: "text-white/70!",
                            badge: "bg-white/15!",
                            button: "bg-white/10! hover:bg-white/20!",
                        },
                    }
                    : {
                        fill: "#FFFFFF",
                        styles: {
                            title: "text-[#3E2723]!",
                            description: "text-[#5D4037]/70!",
                        },
                    }
            }
        />
    )
}
