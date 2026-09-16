import { ArrowLeft, Check, Copy, Folder, Layers, Link2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import type { Demanda } from "@/lib/api";

interface DemandHeaderProps {
  demanda: Demanda;
  onEditar: () => void;
  onSolicitarExclusao: () => void;
  salvando?: boolean;
}

export function DemandHeader({
  demanda,
  onEditar,
  onSolicitarExclusao,
  salvando = false,
}: DemandHeaderProps) {
  const navigate = useNavigate();
  const [copiadoLink, setCopiadoLink] = useState(false);
  const [copiadoId, setCopiadoId] = useState(false);

  function copiarLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopiadoLink(true);
    setTimeout(() => setCopiadoLink(false), 2000);
  }

  function copiarId() {
    navigator.clipboard.writeText(demanda.id);
    setCopiadoId(true);
    setTimeout(() => setCopiadoId(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Barra superior de navegação e Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/dashboard" className="flex items-center gap-1.5" />}>
                <Layers className="size-3.5" />
                <span>Dashboard</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/dashboard" className="flex items-center gap-1.5" />}>
                <Folder className="size-3.5" />
                <span className="max-w-36 truncate sm:max-w-xs">{demanda.projeto_nome}</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <code className="font-mono text-xs font-semibold">{demanda.id}</code>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Botão de Cópia Rápida do ID */}
        <button
          type="button"
          onClick={copiarId}
          className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-2.5 py-1 font-mono text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          title="Copiar código da demanda"
        >
          {copiadoId ? (
            <>
              <Check className="size-3 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>{demanda.id}</span>
            </>
          )}
        </button>
      </div>

      {/* Barra de Ações Primárias */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          <span>Voltar ao Dashboard</span>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Compartilhar / Copiar Link */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copiarLink}
            className="gap-1.5"
            title="Copiar link direto desta demanda"
          >
            {copiadoLink ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Link copiado!</span>
              </>
            ) : (
              <>
                <Link2 className="size-3.5" />
                <span>Compartilhar</span>
              </>
            )}
          </Button>

          {/* Editar Demanda */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEditar}
            className="gap-1.5"
          >
            <Pencil className="size-3.5" />
            <span>Editar</span>
          </Button>

          {/* Excluir Demanda */}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onSolicitarExclusao}
            loading={salvando}
            className="gap-1.5"
          >
            <Trash2 className="size-3.5" />
            <span>Excluir</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
