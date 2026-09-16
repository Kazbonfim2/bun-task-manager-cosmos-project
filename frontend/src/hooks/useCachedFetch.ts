import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

const PREFIXO = "orion_cache:";
const TTL_PADRAO = 5 * 60 * 1000; // 5 min
const POLL_PADRAO = 5 * 60 * 1000; // 5 min

type Entrada<T> = { ts: number; data: T };

function lerCache<T>(path: string): Entrada<T> | null {
  try {
    const bruto = localStorage.getItem(PREFIXO + path);
    return bruto ? (JSON.parse(bruto) as Entrada<T>) : null;
  } catch {
    return null;
  }
}

function gravarCache<T>(path: string, data: T): void {
  try {
    localStorage.setItem(PREFIXO + path, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // quota cheia ou storage indisponível: ignora
  }
}

// Limpa entradas cujo path começa com o prefixo dado. Chame após POST/PUT/DELETE.
export function invalidarCache(prefixoPath: string): void {
  const alvo = PREFIXO + prefixoPath;
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const chave = localStorage.key(i);
    if (chave && chave.startsWith(alvo)) localStorage.removeItem(chave);
  }
}

type Opcoes = { ttlMs?: number; pollMs?: number; enabled?: boolean };

export function useCachedFetch<T>(path: string, opcoes: Opcoes = {}) {
  const { ttlMs = TTL_PADRAO, pollMs = POLL_PADRAO, enabled = true } = opcoes;

  const cacheInicial = enabled ? lerCache<T>(path) : null;
  const [data, setData] = useState<T | null>(cacheInicial?.data ?? null);
  const [isCached, setIsCached] = useState<boolean>(!!cacheInicial);
  const [loading, setLoading] = useState<boolean>(enabled && !cacheInicial);
  const [error, setError] = useState<string>("");

  const emAndamento = useRef(false);

  const buscar = useCallback(async () => {
    if (!enabled || emAndamento.current) return;
    emAndamento.current = true;
    setLoading(true);
    setError("");
    try {
      const resposta = await api<T>(path);
      gravarCache(path, resposta);
      setData(resposta);
      setIsCached(true);
    } catch (falha) {
      setError(falha instanceof Error ? falha.message : "Falha ao carregar");
    } finally {
      setLoading(false);
      emAndamento.current = false;
    }
  }, [path, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const cache = lerCache<T>(path);
    if (cache) {
      setData(cache.data);
      setIsCached(true);
      setLoading(false);
      // Revalida em segundo plano só se expirado (sem skeleton, pois já há dados)
      if (Date.now() - cache.ts >= ttlMs) buscar();
    } else {
      setIsCached(false);
      buscar();
    }

    if (pollMs <= 0) return;
    const intervalo = setInterval(buscar, pollMs);
    return () => clearInterval(intervalo);
  }, [path, enabled, ttlMs, pollMs, buscar]);

  return { data, loading, error, isCached, refetch: buscar, setData };
}
