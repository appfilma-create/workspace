"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import {
  Folder,
  List,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Copy,
  Send,
  Users,
  CheckCircle,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

interface Template {
  id: string;
  name: string;
  description: string;
  recipientsCount: number;
  withWatermark: boolean;
  lastUsed?: string;
  useCount: number;
}

export default function PlanificacionPage() {
  const params = useParams();
  const id = params?.id as string;

  // Datos de ejemplo
  const [templates] = useState<Template[]>([
    {
      id: "1",
      name: "Orden de Rodaje",
      description: "Envío diario de orden de rodaje al equipo",
      recipientsCount: 25,
      withWatermark: false,
      lastUsed: "2025-11-02",
      useCount: 45,
    },
    {
      id: "2",
      name: "Jefes de Equipo",
      description: "Documentación solo para HODs",
      recipientsCount: 8,
      withWatermark: true,
      lastUsed: "2025-11-01",
      useCount: 12,
    },
    {
      id: "3",
      name: "Cast Principal",
      description: "Información para actores principales",
      recipientsCount: 5,
      withWatermark: false,
      lastUsed: "2025-10-30",
      useCount: 8,
    },
  ]);

  return (
    <div className={`flex flex-col min-h-screen bg-white ${inter.className}`}>
      {/* Banner superior fino */}
      <div className="mt-[4.5rem] bg-gradient-to-r from-amber-100 to-amber-200 border-y border-amber-200 px-6 md:px-12 py-2 flex items-center justify-center relative">
        <h1 className="text-[13px] font-medium text-amber-700 tracking-tight text-center">
          {id}
        </h1>
        <Link
          href="/dashboard"
          className="absolute right-6 md:right-12 text-amber-600 hover:text-amber-900 transition-colors"
          title="Volver a proyectos"
        >
          <Folder size={16} />
        </Link>
      </div>

      <main className="pb-16 px-6 md:px-12 flex-grow mt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/project/${id}/team`}
              className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-800 transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Volver al Panel de Equipo
            </Link>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-3 rounded-xl shadow-lg">
                  <List size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                    Planificación
                  </h1>
                  <p className="text-slate-600 text-sm mt-1">
                    Modelos de envío y distribución de documentación
                  </p>
                </div>
              </div>
              <Link href={`/project/${id}/team/planificacion/nuevo`}>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md">
                  <Plus size={16} />
                  Nuevo modelo
                </button>
              </Link>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Total Modelos
              </h3>
              <p className="text-3xl font-bold text-blue-700">
                {templates.length}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                Más Usado
              </h3>
              <p className="text-xl font-bold text-emerald-700 truncate">
                {templates.sort((a, b) => b.useCount - a.useCount)[0]?.name}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-purple-900 mb-1">
                Total Envíos
              </h3>
              <p className="text-3xl font-bold text-purple-700">
                {templates.reduce((sum, t) => sum + t.useCount, 0)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Con Marca de Agua
              </h3>
              <p className="text-3xl font-bold text-amber-700">
                {templates.filter((t) => t.withWatermark).length}
              </p>
            </div>
          </div>

          {/* Acceso rápido a enviar documentos */}
          <div className="mb-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Send size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    Enviar documentación ahora
                  </h3>
                  <p className="text-indigo-100 text-sm">
                    Selecciona un modelo o crea un envío personalizado
                  </p>
                </div>
              </div>
              <Link href={`/project/${id}/team/documentacion`}>
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors shadow-lg">
                  <Send size={16} />
                  Ir a Documentación
                </button>
              </Link>
            </div>
          </div>

          {/* Lista de modelos */}
          {templates.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <List size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No hay modelos creados
              </h3>
              <p className="text-slate-600 mb-4">
                Crea tu primer modelo de envío para agilizar la distribución de
                documentos
              </p>
              <Link href={`/project/${id}/team/planificacion/nuevo`}>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Crear primer modelo
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-xl transition-all"
                >
                  {/* Header de la tarjeta */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {template.description}
                      </p>
                    </div>
                    {template.withWatermark && (
                      <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-md border border-amber-300">
                        Marca de agua
                      </span>
                    )}
                  </div>

                  {/* Estadísticas del modelo */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Users size={14} className="text-indigo-600" />
                        <p className="text-xs text-indigo-700 font-medium">
                          Destinatarios
                        </p>
                      </div>
                      <p className="text-xl font-bold text-indigo-700">
                        {template.recipientsCount}
                      </p>
                    </div>

                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle size={14} className="text-emerald-600" />
                        <p className="text-xs text-emerald-700 font-medium">
                          Usado
                        </p>
                      </div>
                      <p className="text-xl font-bold text-emerald-700">
                        {template.useCount}x
                      </p>
                    </div>
                  </div>

                  {/* Último uso */}
                  {template.lastUsed && (
                    <div className="text-xs text-slate-500 mb-4">
                      Último uso:{" "}
                      {new Date(template.lastUsed).toLocaleDateString("es-ES")}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Link
                      href={`/project/${id}/team/documentacion?template=${template.id}`}
                      className="flex-1"
                    >
                      <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <Send size={14} />
                        Usar ahora
                      </button>
                    </Link>
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Duplicar"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ayuda */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              💡 ¿Qué son los modelos de envío?
            </h3>
            <p className="text-sm text-blue-800">
              Los modelos de envío te permiten crear plantillas con grupos de
              destinatarios predefinidos. Por ejemplo, puedes crear un modelo
              "Orden de Rodaje" que incluya a todo el equipo técnico, y así
              enviar documentos rápidamente sin tener que seleccionar a cada
              persona manualmente cada vez.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}