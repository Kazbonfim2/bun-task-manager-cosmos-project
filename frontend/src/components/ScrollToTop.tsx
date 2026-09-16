import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Garante que a rolagem retorne ao topo (0, 0) imediatamente ao trocar de rota.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
