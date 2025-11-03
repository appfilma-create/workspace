"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { DollarSign, Plus, Download, Upload, Folder } from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function PresupuestoPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className={`flex flex-col min-h-screen bg-white ${inter.className}`}>
      {/* Banner superior fino, como en configuración */}
      <div className="mt-[4.5rem] bg-gradient-to-r from-indigo-100 to-indigo-200 border-y border-indigo-200 px-6 md:px-12 py-2 flex items-center justify-center relative">
        <h1 className="text-[13px] font-medium text-indigo-700 tracking-tight text-center">
          {id}
        </h1>
        <Link
          href="/dashboard"
          className="absolute right-6 md:right-12 text-indigo-600 hover:text-indigo-900 transition-colors"
          title="Volver a proyectos"
        >
          <Folder size={16} />
        </Link>
      </div>

      <main className="pb-16 px-6 md:px-12 flex-grow mt-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-3 rounded-xl shadow-lg">
                  <DollarSign size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                    Presupuesto
                  </h1>
                  <p className="text-slate-600 text-sm mt-1">
                    Control de presupuesto y gastos del proyecto
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                  <Upload size={16} />
                  Importar
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                  <Download size={16} />
                  Exportar
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md">
                  <Plus size={16} />
                  Nueva partida
                </button>
              </div>
            </div>
          </header>

          {/* Resumen de presupuesto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Presupuesto Total
              </h3>
              <p className="text-3xl font-bold text-blue-700">0 €</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Gastado
              </h3>
              <p className="text-3xl font-bold text-amber-700">0 €</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                Disponible
              </h3>
              <p className="text-3xl font-bold text-emerald-700">0 €</p>
            </div>
          </div>

          {/* Contenido placeholder */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
            <DollarSign size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Página de Presupuesto
            </h3>
            <p className="text-slate-600 mb-4">
              Gestiona el presupuesto y controla los gastos del proyecto
            </p>
            <div className="text-xs text-slate-500 bg-white rounded-lg p-4 inline-block">
              <p className="font-mono">
                app/project/[id]/accounting/presupuesto/page.tsx
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
