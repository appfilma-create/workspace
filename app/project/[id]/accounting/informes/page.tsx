"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import {
  BarChart3,
  Download,
  Calendar,
  FileText,
  TrendingUp,
  Folder,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function InformesPage() {
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
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl shadow-lg">
                  <BarChart3 size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                    Informes
                  </h1>
                  <p className="text-slate-600 text-sm mt-1">
                    Reportes y análisis financiero del proyecto
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md">
                <Download size={16} />
                Exportar informe
              </button>
            </div>
          </header>

          {/* Selector de período */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar size={16} />
              <span>Período:</span>
            </div>
            <select className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-sm">
              <option>Último mes</option>
              <option>Últimos 3 meses</option>
              <option>Últimos 6 meses</option>
              <option>Este año</option>
              <option>Personalizado</option>
            </select>
          </div>

          {/* Tipos de informes disponibles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <TrendingUp size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900">
                  Informe de Gastos
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Desglose detallado de todos los gastos del proyecto
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Generar informe →
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <FileText size={20} className="text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900">
                  Informe Presupuestario
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Comparativa entre presupuesto planificado y ejecutado
              </p>
              <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Generar informe →
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <BarChart3 size={20} className="text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900">
                  Informe por Proveedores
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Análisis de gastos agrupados por proveedor
              </p>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Generar informe →
              </button>
            </div>
          </div>

          {/* Contenido placeholder */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
            <BarChart3 size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Página de Informes
            </h3>
            <p className="text-slate-600 mb-4">
              Genera y visualiza informes financieros del proyecto
            </p>
            <div className="text-xs text-slate-500 bg-white rounded-lg p-4 inline-block">
              <p className="font-mono">
                app/project/[id]/accounting/informes/page.tsx
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
