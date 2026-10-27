import React, { useState } from 'react';
import { FulgorProductImpact } from '../types/economic';
import { FULGOR_ECOSYSTEM_PRODUCTS } from '../data/economicData';
import { EpistemicBadge } from './EpistemicBadge';
import { 
  Sparkles, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

interface EcosystemViewProps {
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const EcosystemView: React.FC<EcosystemViewProps> = ({ onOpenCopilotWithPrompt }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(FULGOR_ECOSYSTEM_PRODUCTS[0].id);

  const selectedProduct = FULGOR_ECOSYSTEM_PRODUCTS.find(p => p.id === selectedProductId) || FULGOR_ECOSYSTEM_PRODUCTS[0];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> ECOSISTEMA FULGOR IA • IMPACTO PENDIENTE DE MEDICIÓN
            </span>
            <EpistemicBadge type="MODEL_ESTIMATE" size="sm" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            Hipótesis de valor del ecosistema Fulgor IA (sin métricas verificadas)
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl">
            No hay telemetría de empresas suscritas ni interacciones de producción conectadas. Las cifras de ahorro, productividad y ROI no se mostrarán hasta contar con mediciones verificables.
          </p>
        </div>

        <button
          onClick={() => onOpenCopilotWithPrompt(`Calcula el ROI estimado de implementar la suite completa de Fulgor IA (Creador, Ingeniero y Logística) para una empresa de 150 empleados en el sector manufacturero y de exportación.`)}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" /> Calcular ROI para mi Empresa
        </button>
      </div>

      {/* Product Cards Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {FULGOR_ECOSYSTEM_PRODUCTS.map((prod) => {
          const isSelected = prod.id === selectedProductId;
          return (
            <div
              key={prod.id}
              onClick={() => setSelectedProductId(prod.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                isSelected
                  ? 'bg-slate-800/90 border-amber-400/60 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-400 font-bold">{prod.category}</span>
                <span className="text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 font-mono">
                  Sin telemetría
                </span>
              </div>

              <h4 className="font-bold text-slate-100 text-sm">
                {prod.name}
              </h4>

              <div className="space-y-1 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Ahorro mensual:</span>
                  <span className="font-mono font-bold text-emerald-400">No medido</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Productividad:</span>
                  <span className="font-mono font-bold text-sky-400">No medido</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Múltiplo ROI:</span>
                  <span className="font-mono font-bold text-amber-400">No medido</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Chart & Deep-Dive Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Ecosystem Comparison Chart */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Métricas de impacto no disponibles
            </h3>
            <EpistemicBadge type="MODEL_ESTIMATE" size="sm" />
          </div>

          <div className="h-80 w-full flex items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-950/70 p-6 text-center">
            <div className="max-w-md space-y-2">
              <Database className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="font-semibold text-slate-200">Sin datos de producción</p>
              <p className="text-xs text-slate-400">El gráfico se habilitará cuando existan métricas reales, fuente de captura, periodo de observación y método de cálculo verificables.</p>
            </div>
          </div>
        </div>

        {/* Right: Selected Tool Deep-Dive */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-amber-400 font-mono font-semibold">{selectedProduct.category}</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">ROI medido: no disponible</span>
            </div>
            <h3 className="font-bold text-slate-100 text-lg">{selectedProduct.name}</h3>
            <p className="text-xs text-slate-400 mt-1">{selectedProduct.description}</p>
          </div>

          {/* Key Use Cases */}
          <div className="space-y-2 text-xs">
            <span className="font-semibold text-slate-200 block">Casos de Uso Principales & Flujos de Valor:</span>
            <div className="space-y-1.5">
              {selectedProduct.keyUseCases.map((useCase, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{useCase}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry Method Note */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Privacidad & Muestreo Telemetría:
            </span>
            <p>
              No hay muestra de producción conectada ni datos de clientes verificados. Los indicadores de impacto se mantienen ocultos hasta contar con registros auditables y metodología de medición.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
