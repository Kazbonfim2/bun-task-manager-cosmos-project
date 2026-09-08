import {
  Calendar,
  Check,
  Clock,
  Copy,
  Folder,
  History,
  Info,
  Link2,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { SelectSimples } from "@/components/SelectSimples";
import type { Demanda, Usuario } from "@/lib/api";
import { STATUS_ITENS } from "@/lib/status";
import { cn } from "@/lib/utils";
import {
  calcularStatusPrazo,
  formatarDataCompleta,
  formatarPrazoExtenso,
  obterCorAvatar,
  obterIniciais,
} from "../utils/demand-helpers";

interface DemandSidebarProps {
  demanda: Demanda;
  usuarios: Usuario[];
  alterandoStatus: boolean;
  onTrocarStatus: (status: string) => void;
}

export function DemandSidebar({
  demanda,
  usuarios,
  alterandoStatus,
  onTrocarStatus,
}: DemandSidebarProps) {
  const [copiadoId, setCopiadoId] = useState(false);
  const [copiadoLink, setCopiadoLink] = useState(false);

  const responsavel = usuarios.find((u) => u.id === demanda.responsavel_id);
  const emailResponsavel = responsavel?.email || `${demanda.responsavel_nome.toLowerCase().replace(/\s+/g, ".")}@cosmos.com`;
  const avatarCores = obterCorAvatar(demanda.responsavel_nome);
  const iniciais = obterIniciais(demanda.responsavel_nome);
  const infoPrazo = calcularStatusPrazo(demanda.prazo, demanda.status);

  function copiarId() {
    navigator.clipboard.writeText(demanda.id);
    setCopiadoId(true);
    setTimeout(() => setCopiadoId(false), 2000);
  }

  function copiarLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopiadoLink(true);
    setTimeout(() => setCopiadoLink(false), 2000);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Card de Propriedades e Metadados */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Info className="size-4 text-primary" />
            Propriedades da Demanda
          </CardTitle>
        </CardHeader>

        <CardPanel className="flex flex-col gap-4 pt-4 text-xs">
          {/* Alteração Rápida de Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              Status Atual
            </label>
            <SelectSimples
              itens={STATUS_ITENS}
              valor={demanda.status}
              aoMudar={onTrocarStatus}
              placeholder="Selecionar status"
              disabled={alterandoStatus}
            />
          </div>

          <div className="h-px bg-border/60" />

          {/* Responsável */}
          <div className="flex flex-col gap-2">
            <label className="text-muted-foreground font-medium flex items-center gap-1.5">
              <User className="size-3.5 text-muted-foreground" />
              Responsável Designado
            </label>
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2.5">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full font-semibold text-xs border shadow-xs select-none",
                  avatarCores.bg,
                  avatarCores.text,
                  avatarCores.border
                )}
              >
                {iniciais}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-foreground text-xs">
                  {demanda.responsavel_nome}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Mail className="size-3 shrink-0" />
                  {emailResponsavel}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-border/60" />

          {/* Projeto */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Folder className="size-3.5 text-muted-foreground" />
              Projeto Vinculado
            </label>
            <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 p-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                  <Folder className="size-4" />
                </div>
                <span className="font-semibold text-foreground truncate text-xs">
                  {demanda.projeto_nome}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-border/60" />

          {/* Prazo Limite */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              Prazo Limite de Entrega
            </label>
            <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-xs">
                  {formatarPrazoExtenso(demanda.prazo)}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                    infoPrazo.badgeClasse
                  )}
                >
                  {infoPrazo.badgeTexto}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {infoPrazo.texto}
              </span>
            </div>
          </div>

          <div className="h-px bg-border/60" />

          {/* Metadados de Auditoria */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <History className="size-3 text-muted-foreground" />
                Criada em:
              </span>
              <span className="font-medium text-foreground">
                {formatarDataCompleta(demanda.criado_em)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground" />
                Última alteração:
              </span>
              <span className="font-medium text-foreground">
                {formatarDataCompleta(demanda.atualizado_em)}
              </span>
            </div>
          </div>
        </CardPanel>
      </Card>

      {/* Card de Identificação e Compartilhamento */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            Acesso & Identificação
          </CardTitle>
        </CardHeader>
        <CardPanel className="flex flex-col gap-3 pt-4 text-xs">
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-2.5">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase text-muted-foreground font-semibold">Código Único</span>
              <code className="font-mono text-xs font-bold text-foreground truncate">{demanda.id}</code>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copiarId}
              className="h-7 px-2 text-xs gap-1"
            >
              {copiadoId ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              <span>{copiadoId ? "Copiado" : "Copiar"}</span>
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-2.5">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase text-muted-foreground font-semibold">Link Permanente</span>
              <span className="text-xs text-muted-foreground truncate max-w-32 sm:max-w-40">
                /demandas/{demanda.id}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copiarLink}
              className="h-7 px-2 text-xs gap-1"
            >
              {copiadoLink ? <Check className="size-3 text-emerald-500" /> : <Link2 className="size-3" />}
              <span>{copiadoLink ? "Copiado" : "Copiar Link"}</span>
            </Button>
          </div>
        </CardPanel>
      </Card>
    </div>
  );
}
