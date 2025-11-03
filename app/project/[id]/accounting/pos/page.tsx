"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import {
  Folder,
  FileText,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

interface PO {
  id: string;
  number: string;
  supplier: string;
  description: string;
  totalAmount: number;
  createdAt: string;
  status: "Pendiente" | "Aprobada" | "Cerrada" | "Anulada";
  department: string;
  type: string;
}

export default function POsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");

  // Datos de ejemplo temporal
  const [pos] = useState<PO[]>([
    {
      id: "1",
      number: "PO-2025-001",
      supplier: "Catering Services SL",
      description: "Catering rodaje - 3 días",
      totalAmount: 2500,
      createdAt: "2025-01-15",
      status: "Aprobada",
      department: "Producción",
      type: "Servicios",
    },
    {
      id: "2",
      number: "PO-2025-002",
      supplier: "Equipment Rental Pro",
      description: "Alquiler cámaras RED",
      totalAmount: 8500,
      createdAt: "2025-01-20",
      status: "Pendiente",
      department: "Fotografía",
      type: "Bienes",
    },
  ]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Aprobada":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          border: "border-emerald-300",
        };
      case "Pendiente":
        return {
          bg: "bg-amber-100",
          text: "text-amber-700",
          border: "border-amber-300",
        };
      case "Cerrada":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          border: "border-blue-300",
        };
      case "Anulada":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-300",
        };
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-700",
          border: "border-slate-300",
        };
    }
  };

  const estadoIcons = {
    Aprobada: <CheckCircle size={14} />,
    Pendiente: <Clock size={14} />,
    Cerrada: <CheckCircle size={14} />,
    Anulada: <XCircle size={14} />,
  };

  const filteredPOs = pos.filter((po) => {
    const matchSearch =
      po.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado = filterEstado === "todos" || po.status === filterEstado;

    return matchSearch && matchEstado;
  });

  const totalAprobadas = pos.filter((po) => po.status === "Aprobada").length;
  const totalPendientes = pos.filter((po) => po.status === "Pendiente").length;
  const montoTotal = pos
    .filter((po) => po.status === "Aprobada")
    .reduce((sum, po) => sum + po.totalAmount, 0);

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
          {/* Header con botón volver */}
          <div className="mb-6">
            <Link
              href={`/project/${id}/accounting`}
              className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Volver al Panel de Contabilidad
            </Link>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-3 rounded-xl shadow-lg">
                  <FileText size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                    Purchase Orders
                  </h1>
                  <p className="text-slate-600 text-sm mt-1">
                    Gestión de órdenes de compra del proyecto
                  </p>
                </div>
              </div>
              <Link href={`/project/${id}/accounting/pos/nueva`}>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md">
                  <Plus size={16} />
                  Nueva PO
                </button>
              </Link>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Total POs
              </h3>
              <p className="text-3xl font-bold text-blue-700">{pos.length}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                Aprobadas
              </h3>
              <p className="text-3xl font-bold text-emerald-700">
                {totalAprobadas}
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Pendientes
              </h3>
              <p className="text-3xl font-bold text-amber-700">
                {totalPendientes}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-purple-900 mb-1">
                Monto Total
              </h3>
              <p className="text-3xl font-bold text-purple-700">
                {montoTotal.toLocaleString()} €
              </p>
            </div>
          </div>

          {/* Búsqueda y filtros */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar por número, proveedor o concepto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none text-sm"
              />
            </div>

            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none text-sm"
            >
              <option value="todos">Todos los estados</option>
              <option value="Aprobada">Aprobadas</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Cerrada">Cerradas</option>
              <option value="Anulada">Anuladas</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
              <Download size={16} />
              Exportar
            </button>
          </div>

          {/* Lista de POs */}
          {filteredPOs.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <FileText size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No se encontraron POs
              </h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || filterEstado !== "todos"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Crea tu primera Purchase Order para comenzar"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPOs.map((po) => {
                const statusStyle = getStatusStyle(po.status);
                return (
                  <div
                    key={po.id}
                    className="bg-white border border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {po.number}
                          </h3>
                          <span
                            className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            {estadoIcons[po.status]}
                            {po.status}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <User size={14} />
                            <span className="font-medium">{po.supplier}</span>
                          </div>

                          <p className="text-sm text-slate-700">
                            {po.description}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(po.createdAt).toLocaleDateString(
                                "es-ES"
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign size={12} />
                              {po.totalAmount.toLocaleString()} €
                            </div>
                            <span className="px-2 py-1 bg-slate-100 rounded-md">
                              {po.department}
                            </span>
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md">
                              {po.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Ver detalles"
                          onClick={() => alert("Funcionalidad próximamente")}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                          onClick={() =>
                            alert("Funcionalidad de edición próximamente")
                          }
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                          onClick={() => alert("Funcionalidad próximamente")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mostrar contador de resultados */}
          {filteredPOs.length > 0 && (
            <div className="mt-4 text-center text-sm text-slate-600">
              Mostrando {filteredPOs.length} de {pos.length} POs
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
