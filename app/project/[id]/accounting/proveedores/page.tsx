"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { Users, Plus, Search, Filter, Folder } from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function ProveedoresPage() {
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
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-3 rounded-xl shadow-lg">
                  <Users size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                    Proveedores
                  </h1>
                  <p className="text-slate-600 text-sm mt-1">
                    Gestión de proveedores y colaboradores
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md">
                <Plus size={16} />
                Añadir proveedor
              </button>
            </div>
          </header>

          {/* Barra de búsqueda y filtros */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar proveedores..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
              <Filter size={16} />
              Filtros
            </button>
          </div>

          {/* Contenido placeholder */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
            <Users size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Página de Proveedores
            </h3>
            <p className="text-slate-600 mb-4">
              Aquí podrás gestionar todos los proveedores del proyecto
            </p>
            <div className="text-xs text-slate-500 bg-white rounded-lg p-4 inline-block">
              <p className="font-mono">
                app/project/[id]/accounting/proveedores/page.tsx
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
