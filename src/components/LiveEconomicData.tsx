import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Database, RefreshCw } from 'lucide-react';

type Observation = {
  countryCode: string;
  countryName: string;
  indicatorCode: string;
  indicatorName: string;
  value: number;
  unit: string;
  year: string;
  sourceStatus: string;
};

type FeedResponse = {
  status: string;
  source: string;
  sourceUrl: string;
  retrievedAt: string;
  note: string;
  observations: Observation[];
};

export const LiveEconomicData: React.FC = () => {
  const [data, setData] = useState<FeedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/public/world-bank', { headers: { Accept: 'application/json' } });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload?.error === 'string' ? payload.error : 'La fuente económica no respondió correctamente.');
      if (payload?.status !== 'WORLD_BANK_DATA_RETRIEVED' || !Array.isArray(payload.observations)) {
        throw new Error('La respuesta de la fuente no pasó la validación básica.');
      }
      setData(payload as FeedResponse);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : 'No se pudieron cargar datos oficiales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const numberFormat = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 });
  const grouped = (data?.observations ?? []).reduce<Record<string, Observation[]>>((acc, item) => {
    (acc[item.indicatorCode] ??= []).push(item);
    return acc;
  }, {});

  return (
    <section className="rounded-xl border border-sky-800/70 bg-slate-900/70 p-4 sm:p-5 space-y-4" aria-labelledby="live-economic-data-title">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <Database className="h-4 w-4" /> Fuente pública conectada
          </div>
          <h2 id="live-economic-data-title" className="text-lg font-bold text-slate-100">Datos económicos oficiales — World Bank Open Data</h2>
          <p className="text-xs text-slate-400 max-w-3xl">Consulta del último año no nulo disponible para cada serie. No es información en tiempo real; el año de cada observación se muestra por separado.</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-50" aria-label="Actualizar datos económicos">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      {loading && <p className="text-sm text-slate-400" role="status">Consultando la fuente pública…</p>}
      {!loading && error && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-800/70 bg-amber-950/30 p-3 text-sm text-amber-200" role="alert">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div><p className="font-semibold">Datos no disponibles</p><p className="text-xs mt-1">{error} No se sustituyeron por valores simulados.</p></div>
        </div>
      )}
      {data && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-800 bg-emerald-950/50 px-2 py-1 text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Respuesta recibida</span>
            <span className="text-slate-400">Consultado: {new Date(data.retrievedAt).toLocaleString('es-MX')}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {Object.entries(grouped).map(([indicatorCode, items]) => (
              <div key={indicatorCode} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <h3 className="text-sm font-semibold text-slate-100 min-h-10">{items[0]?.indicatorName}</h3>
                <div className="mt-2 space-y-2">
                  {items.sort((a, b) => a.countryName.localeCompare(b.countryName, 'es')).map(item => (
                    <div key={`${item.countryCode}-${item.indicatorCode}`} className="flex items-center justify-between gap-3 border-t border-slate-800 pt-2">
                      <div><p className="text-xs text-slate-300">{item.countryName}</p><p className="text-[10px] text-slate-500">{item.year} · {item.countryCode}</p></div>
                      <p className="text-sm font-mono font-semibold text-sky-200 tabular-nums">{numberFormat.format(item.value)}{item.unit}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">{data.note} Fuente: <a className="underline underline-offset-2 text-sky-300" href={data.sourceUrl} target="_blank" rel="noreferrer">World Bank Open Data</a>. Estado de cada valor: fuente oficial consultada, sin auditoría independiente de Fulgor.</p>
        </>
      )}
      <div className="flex items-start gap-2 text-[11px] text-slate-500">
        <Activity className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <p>Estos datos públicos se muestran aparte de los gráficos y rankings de demostración. No se mezclan automáticamente con los modelos ilustrativos ni validan los resultados de otros módulos.</p>
      </div>
    </section>
  );
};
