"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import {
  Folder,
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Upload,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

interface Factura {
  id: string;
  numero: string;
  proveedor: string;
  concepto: string;
  monto: number;
  fecha: string;
  fechaVencimiento: string;
  estado: "pagada" | "pendiente" | "vencida";
  categoria: string;
  poRelacionado?: string;
}

export default function FacturasPage() {
  const params = useParams();
  const id = params?.id as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Datos de ejemplo (luego conectarás con Firebase)
  const [facturas, setFacturas] = useState<Factura[]>([
    {
      id: "1",
      numero: "FAC-2025-001",
      proveedor: "Catering Services SL",
      concepto: "Catering rodaje - 3 días",
      monto: 2500,
      fecha: "2025-01-16",
      fechaVencimiento: "2025-02-15",
      estado: "pagada",
      categoria: "Alimentación",
      poRelacionado: "PO-2025-001",
    },
    {
      id: "2",
      numero: "FAC-2025-002",
      proveedor: "Equipment Rental Pro",
      concepto: "Alquiler cámaras RED - Semana 1",
      monto: 8500,
      fecha: "2025-01-22",
      fechaVencimiento: "2025-02-22",
      estado: "pendiente",
      categoria: "Equipamiento",
      poRelacionado: "PO-2025-002",
    },
    {
      id: "3",
      numero: "FAC-2025-003",
      proveedor: "Lighting Systems",
      concepto: "Material de iluminación",
      monto: 3200,
      fecha: "2025-01-10",
      fechaVencimiento: "2025-01-25",
      estado: "vencida",
      categoria: "Equipamiento",
    },
    {
      id: "4",
      numero: "FAC-2025-004",
      proveedor: "Transport Solutions",
      concepto: "Transporte equipo técnico",
      monto: 1200,
      fecha: "2025-01-23",
      fechaVencimiento: "2025-02-23",
      estado: "pendiente",
      categoria: "Logística",
      poRelacionado: "PO-2025-003",
    },
  ]);

  const estadoColors = {
    pagada: "bg-emerald-100 text-emerald-700 border-emerald-300",
    pendiente: "bg-amber-100 text-amber-700 border-amber-300",
    vencida: "bg-red-100 text-red-700 border-red-300",
  };

  const estadoIcons = {
    pagada: <CheckCircle size={14} />,
    pendiente: <Clock size={14} />,
    vencida: <AlertCircle size={14} />,
  };

  const filteredFacturas = facturas.filter((factura) => {
    const matchSearch =
      factura.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.concepto.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado =
      filterEstado === "todos" || factura.estado === filterEstado;

    return matchSearch && matchEstado;
  });

  const totalPagadas = facturas.filter((f) => f.estado === "pagada").length;
  const totalPendientes = facturas.filter(
    (f) => f.estado === "pendiente"
  ).length;
  const totalVencidas = facturas.filter((f) => f.estado === "vencida").length;
  const montoPagado = facturas
    .filter((f) => f.estado === "pagada")
    .reduce((sum, f) => sum + f.monto, 0);
  const montoPendiente = facturas
    .filter((f) => f.estado === "pendiente" || f.estado === "vencida")
    .reduce((sum, f) => sum + f.monto, 0);

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

      {/* Modal crear Factura (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Registrar nueva Factura
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-50 rounded-lg p-8 text-center">
              <Receipt size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 text-sm mb-3">
                Formulario de registro de factura
              </p>
              <div className="flex gap-2 justify-center">
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                  <Upload size={16} />
                  Subir factura
                </button>
                <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50">
                  Crear manualmente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="pb-16 px-6 md:px-12 flex-grow mt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header con botón volver */}
          <div className="mb-6">
            <Link
              href={`/project/${id}/accounting`}
              className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-800 transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Volver al Panel de Contabilidad
            </Link>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-3 rounded-xl shadow-lg">
                  <Receipt size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                    Facturas
                  </h1>
                  <p className="text-slate-600 text-sm mt-1">
                    Gestión de facturas del proyecto
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
              >
                <Plus size={16} />
                Nueva Factura
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Total Facturas
              </h3>
              <p className="text-3xl font-bold text-blue-700">
                {facturas.length}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                Pagadas
              </h3>
              <p className="text-3xl font-bold text-emerald-700">
                {totalPagadas}
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

            <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                Vencidas
              </h3>
              <p className="text-3xl font-bold text-red-700">{totalVencidas}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-purple-900 mb-1">
                Por Pagar
              </h3>
              <p className="text-2xl font-bold text-purple-700">
                {montoPendiente.toLocaleString()} €
              </p>
            </div>
          </div>

          {/* Alerta de facturas vencidas */}
          {totalVencidas > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900 mb-1">
                    Facturas vencidas
                  </h3>
                  <p className="text-sm text-red-700">
                    Hay {totalVencidas} factura{totalVencidas > 1 ? "s" : ""}{" "}
                    vencida{totalVencidas > 1 ? "s" : ""} que requieren atención
                    inmediata.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none text-sm"
              />
            </div>

            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none text-sm"
            >
              <option value="todos">Todos los estados</option>
              <option value="pagada">Pagadas</option>
              <option value="pendiente">Pendientes</option>
              <option value="vencida">Vencidas</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
              <Download size={16} />
              Exportar
            </button>
          </div>

          {/* Lista de Facturas */}
          {filteredFacturas.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <Receipt size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No se encontraron facturas
              </h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || filterEstado !== "todos"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Registra tu primera factura para comenzar"}
              </p>
              {!searchTerm && filterEstado === "todos" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Registrar primera factura
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFacturas.map((factura) => (
                <div
                  key={factura.id}
                  className={`bg-white border rounded-xl p-6 hover:shadow-lg transition-all ${
                    factura.estado === "vencida"
                      ? "border-red-300 bg-red-50/30"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {factura.numero}
                        </h3>
                        <span
                          className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border ${
                            estadoColors[factura.estado]
                          }`}
                        >
                          {estadoIcons[factura.estado]}
                          {factura.estado.charAt(0).toUpperCase() +
                            factura.estado.slice(1)}
                        </span>
                        {factura.poRelacionado && (
                          <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md border border-indigo-200">
                            PO: {factura.poRelacionado}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User size={14} />
                          <span className="font-medium">
                            {factura.proveedor}
                          </span>
                        </div>

                        <p className="text-sm text-slate-700">
                          {factura.concepto}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            Emitida:{" "}
                            {new Date(factura.fecha).toLocaleDateString(
                              "es-ES"
                            )}
                          </div>
                          <div
                            className={`flex items-center gap-1 ${
                              factura.estado === "vencida"
                                ? "text-red-600 font-medium"
                                : ""
                            }`}
                          >
                            <Clock size={12} />
                            Vence:{" "}
                            {new Date(
                              factura.fechaVencimiento
                            ).toLocaleDateString("es-ES")}
                          </div>
                          <div className="flex items-center gap-1 font-medium">
                            <DollarSign size={12} />
                            {factura.monto.toLocaleString()} €
                          </div>
                          <span className="px-2 py-1 bg-slate-100 rounded-md">
                            {factura.categoria}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      {factura.estado === "pendiente" && (
                        <button
                          className="px-3 py-2 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                          title="Marcar como pagada"
                        >
                          Pagar
                        </button>
                      )}
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mostrar contador de resultados */}
          {filteredFacturas.length > 0 && (
            <div className="mt-4 text-center text-sm text-slate-600">
              Mostrando {filteredFacturas.length} de {facturas.length} facturas
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
