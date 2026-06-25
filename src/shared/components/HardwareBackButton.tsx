import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { ConfirmModal } from "@/shared/components/ui/confirm-modal";

export function HardwareBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleBackButton = ({ canGoBack }: { canGoBack: boolean }) => {
      if (showExitConfirm) {
        setShowExitConfirm(false);
        return;
      }

      // Rutas donde presionando atrás debería pedir confirmación antes de cerrar la app
      if (location.pathname === "/app" || location.pathname === "/login" || !canGoBack) {
        setShowExitConfirm(true);
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
  }, [navigate, location, showExitConfirm]);

  return (
    <ConfirmModal
      open={showExitConfirm}
      onOpenChange={setShowExitConfirm}
      onConfirm={() => CapacitorApp.exitApp()}
      title="¿Cerrar la aplicación?"
      description="¿Estás seguro de que querés cerrar esta aplicación?"
      confirmText="Cerrar"
      cancelText="Cancelar"
      variant="default"
    />
  );
}
