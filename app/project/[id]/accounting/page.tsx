"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
import {
  Folder,
  FileText,
  Receipt,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function AccountingPage() {
  const params = useParams();
  const id = params?.id as string;

  // Estados para estadísticas (luego se cargarán desde Firebase)
  const [stats, setStats] = useState({
    totalBudget: 0,
    totalSpent: 0,
    totalPending: 0,
    totalAvailable: 0,
  });

  const [poStats, setPoStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
  });

  const [invoiceStats, setInvoiceStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
  });

  return (
    <div className={`flex flex-col min-h-screen bg-white ${inter.className}`}>
      {/* Banner superior fino */}
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
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-3 rounded-xl shadow-lg">
                <DollarSign size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                  Panel de contabilidad
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  Resumen financiero y gestión de documentos
                </p>
              </div>
            </div>
          </header>

          {/* Estadísticas generales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-600 text-white p-3 rounded-xl shadow-md">
                  <DollarSign size={20} />
                </div>
                <div className="text-3xl font-bold text-blue-700">
                  {stats.totalBudget.toLocaleString()} €
                </div>
              </div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Presupuesto total
              </h3>
              <p className="text-xs text-blue-700">Del proyecto</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-md">
                  <CheckCircle size={20} />
                </div>
                <div className="text-3xl font-bold text-emerald-700">
                  {stats.totalSpent.toLocaleString()} €
                </div>
              </div>
              <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                Gastado
              </h3>
              <p className="text-xs text-emerald-700">Facturas pagadas</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-amber-600 text-white p-3 rounded-xl shadow-md">
                  <Clock size={20} />
                </div>
                <div className="text-3xl font-bold text-amber-700">
                  {stats.totalPending.toLocaleString()} €
                </div>
              </div>
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Pendiente de pago
              </h3>
              <p className="text-xs text-amber-700">Por liquidar</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-purple-600 text-white p-3 rounded-xl shadow-md">
                  <TrendingUp size={20} />
                </div>
                <div className="text-3xl font-bold text-purple-700">
                  {stats.totalAvailable.toLocaleString()} €
                </div>
              </div>
              <h3 className="text-sm font-semibold text-purple-900 mb-1">
                Disponible
              </h3>
              <p className="text-xs text-purple-700">Del presupuesto</p>
            </div>
          </div>

          {/* Paneles principales: POs y Facturas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de POs (Purchase Orders) */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-300 hover:shadow-xl transition-all">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <FileText size={28} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Órdenes de compra
                      </h2>
                      <p className="text-indigo-100 text-sm">
                        Órdenes de compra del proyecto
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Resumen rápido */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 mb-1">
                      {poStats.total}
                    </div>
                    <p className="text-xs text-slate-600">Total POs</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600 mb-1">
                      {poStats.pending}
                    </div>
                    <p className="text-xs text-slate-600">Pendientes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 mb-1">
                      {poStats.approved}
                    </div>
                    <p className="text-xs text-slate-600">Aprobadas</p>
                  </div>
                </div>

                {/* Actividad reciente */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Actividad reciente
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-500 text-center">
                        No hay POs creadas todavía
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acceso al módulo */}
                <Link href={`/project/${id}/accounting/pos`}>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-md">
                    Gestionar POs
                    <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
            </div>

            {/* Panel de Facturas */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-emerald-300 hover:shadow-xl transition-all">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <Receipt size={28} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Facturas
                      </h2>
                      <p className="text-emerald-100 text-sm">
                        Gestión de facturas del proyecto
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Resumen rápido */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 mb-1">
                      {invoiceStats.total}
                    </div>
                    <p className="text-xs text-slate-600">Total facturas</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600 mb-1">
                      {invoiceStats.pending}
                    </div>
                    <p className="text-xs text-slate-600">Pendientes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 mb-1">
                      {invoiceStats.paid}
                    </div>
                    <p className="text-xs text-slate-600">Pagadas</p>
                  </div>
                </div>

                {/* Actividad reciente */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Facturas recientes
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-500 text-center">
                        No hay facturas registradas todavía
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acceso al módulo */}
                <Link href={`/project/${id}/accounting/facturas`}>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-md">
                    Gestionar facturas
                    <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
