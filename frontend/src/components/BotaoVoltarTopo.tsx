import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Botão flutuante lateral para rolar suavemente ao topo da página.
 */
export function BotaoVoltarTopo() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    function verificarRolagem() {
      setVisivel(window.scrollY > 250);
    }

    verificarRolagem();
    window.addEventListener("scroll", verificarRolagem, { passive: true });
    return () => window.removeEventListener("scroll", verificarRolagem);
  }, []);

  function rolarParaTopo() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!visivel) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={rolarParaTopo}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      className="fixed bottom-6 right-6 z-50 size-10 rounded-full shadow-lg bg-card/90 backdrop-blur-xs border-border hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer"
    >
      <ArrowUp className="size-5" />
    </Button>
  );
}
