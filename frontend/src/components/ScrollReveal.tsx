import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ScrollRevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "fade";
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
}

export function saoAnimacoesDesabilitadas(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem("orion:desabilitar-animacoes") === "true" ||
    document.documentElement.classList.contains("no-animations") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function alternarAnimacoes(desabilitar: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("orion:desabilitar-animacoes", desabilitar ? "true" : "false");
  document.documentElement.classList.toggle("no-animations", desabilitar);
  window.dispatchEvent(new CustomEvent("orion:animacoes-alteradas", { detail: { desabilitar } }));
}

/**
 * Componente helper para animações de rolagem (Scroll Reveal)
 * Utiliza IntersectionObserver nativo para máxima performance e zero overhead.
 */
export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 500,
  threshold = 0.1,
  once = true,
  className,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [desabilitado, setDesabilitado] = useState(() => saoAnimacoesDesabilitadas());
  const [visivel, setVisivel] = useState(() => saoAnimacoesDesabilitadas());

  useEffect(() => {
    function aoAlterar(e: Event) {
      const detalhe = (e as CustomEvent<{ desabilitar: boolean }>).detail;
      const novoEstado = detalhe !== undefined ? detalhe.desabilitar : saoAnimacoesDesabilitadas();
      setDesabilitado(novoEstado);
      if (novoEstado) setVisivel(true);
    }

    window.addEventListener("orion:animacoes-alteradas", aoAlterar);
    return () => window.removeEventListener("orion:animacoes-alteradas", aoAlterar);
  }, []);

  useEffect(() => {
    if (desabilitado) {
      setVisivel(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setVisivel(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisivel(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisivel(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, desabilitado]);

  if (desabilitado) {
    return (
      <div ref={ref} className={cn("opacity-100", className)} {...props}>
        {children}
      </div>
    );
  }

  const direcoes = {
    up: "translate-y-6",
    down: "-translate-y-6",
    left: "translate-x-6",
    right: "-translate-x-6",
    fade: "translate-0",
  };

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
      className={cn(
        "transition-all ease-out",
        visivel
          ? "opacity-100 translate-x-0 translate-y-0"
          : `opacity-0 ${direcoes[direction]} pointer-events-none`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Hook reutilizável para aplicar Scroll Reveal diretamente em elementos ou refs.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  once = true,
}: { threshold?: number; once?: boolean } = {}) {
  const ref = useRef<T>(null);
  const [visivel, setVisivel] = useState(() => saoAnimacoesDesabilitadas());

  useEffect(() => {
    if (saoAnimacoesDesabilitadas()) {
      setVisivel(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setVisivel(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisivel(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisivel(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  return { ref, visivel };
}
