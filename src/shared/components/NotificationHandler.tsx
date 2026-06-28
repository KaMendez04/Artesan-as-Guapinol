import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Capacitor } from "@capacitor/core"
import { LocalNotifications } from "@capacitor/local-notifications"

export function NotificationHandler() {
    const navigate = useNavigate()

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return

        const listenerPromise = LocalNotifications.addListener(
            "localNotificationActionPerformed",
            (action) => {
                const id = action.notification.extra?.id_pedido as string | undefined
                if (id) {
                    navigate(`/app/pedidos?open=${id}`)
                }
            }
        )

        return () => {
            listenerPromise.then((l) => l.remove())
        }
    }, [navigate])

    return null
}
