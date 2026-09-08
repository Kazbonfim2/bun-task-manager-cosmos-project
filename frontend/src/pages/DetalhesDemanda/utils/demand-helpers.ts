export type TipoPrazo = "concluida" | "atrasada" | "hoje" | "amanha" | "no_prazo";

export interface InfoPrazo {
  tipo: TipoPrazo;
  texto: string;
  badgeTexto: string;
  badgeClasse: string;
  diasDiferenca: number;
}

export function formatarDataCompleta(dataIso?: string): string {
  if (!dataIso) return "—";
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return dataIso;
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatarDataCurta(dataIso?: string): string {
  if (!dataIso) return "—";
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return dataIso.slice(0, 10);
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatarPrazoExtenso(prazoIso?: string): string {
  if (!prazoIso) return "—";
  const dataStr = prazoIso.slice(0, 10);
  const partes = dataStr.split("-");
  if (partes.length !== 3) return dataStr;

  const ano = Number.parseInt(partes[0], 10);
  const mes = Number.parseInt(partes[1], 10) - 1;
  const dia = Number.parseInt(partes[2], 10);

  const data = new Date(ano, mes, dia);
  if (Number.isNaN(data.getTime())) return `${partes[2]}/${partes[1]}/${partes[0]}`;

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function calcularStatusPrazo(prazoIso: string, status: string): InfoPrazo {
  if (status === "concluida") {
    return {
      tipo: "concluida",
      texto: "Demanda finalizada",
      badgeTexto: "Concluída",
      badgeClasse: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      diasDiferenca: 0,
    };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const partes = prazoIso.slice(0, 10).split("-");
  const ano = Number.parseInt(partes[0], 10);
  const mes = Number.parseInt(partes[1], 10) - 1;
  const dia = Number.parseInt(partes[2], 10);
  const prazo = new Date(ano, mes, dia);
  prazo.setHours(0, 0, 0, 0);

  const diffMs = prazo.getTime() - hoje.getTime();
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0) {
    const atraso = Math.abs(diffDias);
    return {
      tipo: "atrasada",
      texto: `Atrasada há ${atraso} ${atraso === 1 ? "dia" : "dias"}`,
      badgeTexto: `${atraso}d em atraso`,
      badgeClasse: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      diasDiferenca: diffDias,
    };
  }

  if (diffDias === 0) {
    return {
      tipo: "hoje",
      texto: "Vence hoje",
      badgeTexto: "Vence hoje",
      badgeClasse: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      diasDiferenca: 0,
    };
  }

  if (diffDias === 1) {
    return {
      tipo: "amanha",
      texto: "Vence amanhã",
      badgeTexto: "Vence amanhã",
      badgeClasse: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      diasDiferenca: 1,
    };
  }

  return {
    tipo: "no_prazo",
    texto: `Restam ${diffDias} dias para o prazo`,
    badgeTexto: `Restam ${diffDias}d`,
    badgeClasse: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    diasDiferenca: diffDias,
  };
}

export function obterIniciais(nome?: string, fallback = "U"): string {
  if (!nome) return fallback;
  const partes = nome.trim().split(" ").filter(Boolean);
  if (partes.length === 0) return fallback;
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

const CORES_AVATAR = [
  { bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
  { bg: "bg-indigo-500/10 dark:bg-indigo-500/20", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/20" },
  { bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20" },
  { bg: "bg-teal-500/10 dark:bg-teal-500/20", text: "text-teal-600 dark:text-teal-400", border: "border-teal-500/20" },
  { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
  { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20" },
  { bg: "bg-rose-500/10 dark:bg-rose-500/20", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20" },
];

export function obterCorAvatar(nome?: string) {
  if (!nome) return CORES_AVATAR[0];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = (hash + nome.charCodeAt(i) * 31) % CORES_AVATAR.length;
  }
  return CORES_AVATAR[Math.abs(hash) % CORES_AVATAR.length];
}
