import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

export function HardwareBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleBackButton = ({ canGoBack }: { canGoBack: boolean }) => {
      // Rutas donde presionando atrás debería cerrar la app
      if (location.pathname === "/app" || location.pathname === "/login") {
        CapacitorApp.exitApp();
      } else if (canGoBack) {
        // En cualquier otra ruta, navegamos hacia atrás
        navigate(-1);
      } else {
        navigate("/app", { replace: true });
      }
    };

    const backButtonListener = CapacitorApp.addListener("backButton", handleBackButton);

    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, [navigate, location]);

  return null;
}
