import { AtSign } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import type { Usuario } from "@/lib/api";
import { cn } from "@/lib/utils";
import { obterCorAvatar, obterIniciais } from "@/pages/DetalhesDemanda/utils/demand-helpers";

interface TextareaMencoesProps
  extends Omit<React.ComponentProps<typeof Textarea>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  usuarios: Usuario[];
  onKeyDownCustom?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function TextareaMencoes({
  value,
  onChange,
  usuarios,
  className,
  onKeyDownCustom,
  ...props
}: TextareaMencoesProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [filtroMencao, setFiltroMencao] = useState("");
  const [indiceSelecionado, setIndiceSelecionado] = useState(0);
  const [posicaoArroba, setPosicaoArroba] = useState<number | null>(null);

  const usuariosFiltrados = usuarios.filter((u) => {
    const q = filtroMencao.toLowerCase();
    return (
      u.nome_completo.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  function verificarMencao(texto: string, cursorPos: number) {
    const textoAntesCursor = texto.slice(0, cursorPos);
    const ultimoArroba = textoAntesCursor.lastIndexOf("@");

    if (ultimoArroba !== -1) {
      const charAntes = ultimoArroba > 0 ? textoAntesCursor[ultimoArroba - 1] : " ";
      const textoAposArroba = textoAntesCursor.slice(ultimoArroba + 1);

      // Só abre autocomplete se @ estiver no início ou após espaço/quebra de linha
      if (/[\s\n]/.test(charAntes) || ultimoArroba === 0) {
        // E não houver quebra de linha após o @
        if (!/[\n]/.test(textoAposArroba)) {
          setPosicaoArroba(ultimoArroba);
          setFiltroMencao(textoAposArroba);
          setIndiceSelecionado(0);
          setMenuAberto(true);
          return;
        }
      }
    }

    setMenuAberto(false);
    setPosicaoArroba(null);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const novoValor = e.target.value;
    onChange(novoValor);
    verificarMencao(novoValor, e.target.selectionStart ?? novoValor.length);
  }

  function selecionarUsuario(usuario: Usuario) {
    if (posicaoArroba === null || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart ?? value.length;
    const antes = value.slice(0, posicaoArroba);
    const depois = value.slice(cursorPos);
    const textoInserido = `@${usuario.nome_completo} `;
    const novoTexto = `${antes}${textoInserido}${depois}`;

    onChange(novoTexto);
    setMenuAberto(false);
    setPosicaoArroba(null);

    // Reposiciona o cursor após a menção inserida
    setTimeout(() => {
      textarea.focus();
      const novaPos = antes.length + textoInserido.length;
      textarea.setSelectionRange(novaPos, novaPos);
    }, 0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (menuAberto && usuariosFiltrados.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndiceSelecionado((prev) => (prev + 1) % usuariosFiltrados.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndiceSelecionado((prev) =>
          prev === 0 ? usuariosFiltrados.length - 1 : prev - 1
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selecionarUsuario(usuariosFiltrados[indiceSelecionado]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuAberto(false);
        return;
      }
    }

    onKeyDownCustom?.(e);
  }

  function handleClicarMencionar() {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const pos = textarea.selectionStart ?? value.length;
    const antes = value.slice(0, pos);
    const depois = value.slice(pos);
    const espacoAntes = antes.length > 0 && !antes.endsWith(" ") && !antes.endsWith("\n") ? " " : "";
    const novoTexto = `${antes}${espacoAntes}@${depois}`;

    onChange(novoTexto);
    setTimeout(() => {
      textarea.focus();
      const novaPos = antes.length + espacoAntes.length + 1;
      textarea.setSelectionRange(novaPos, novaPos);
      verificarMencao(novoTexto, novaPos);
    }, 0);
  }

  return (
    <div className="relative w-full">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={className}
        {...props}
      />

      {/* Botão sutil de atalho @ na barra inferior do textarea */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleClicarMencionar}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          title="Mencionar membro da equipe"
        >
          <AtSign className="size-3 text-primary" />
          <span>Mencionar membro</span>
        </button>
      </div>

      {/* Dropdown de sugestões flutuante */}
      {menuAberto && usuariosFiltrados.length > 0 && (
        <div className="absolute left-0 bottom-full mb-1.5 z-50 w-64 max-h-56 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-xl animate-in fade-in zoom-in-95">
          <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Membros da equipe ({usuariosFiltrados.length})
          </div>
          <div className="space-y-0.5">
            {usuariosFiltrados.map((u, i) => {
              const selecionado = i === indiceSelecionado;
              const cores = obterCorAvatar(u.nome_completo);
              const iniciais = obterIniciais(u.nome_completo);

              return (
                <button
                  key={u.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Evita perder o foco do textarea
                    selecionarUsuario(u);
                  }}
                  onMouseEnter={() => setIndiceSelecionado(i)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors cursor-pointer",
                    selecionado
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold border",
                      selecionado
                        ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                        : `${cores.bg} ${cores.text} ${cores.border}`
                    )}
                  >
                    {iniciais}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium leading-tight">
                      {u.nome_completo}
                    </p>
                    <p
                      className={cn(
                        "truncate text-[10px]",
                        selecionado
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      )}
                    >
                      {u.email}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
