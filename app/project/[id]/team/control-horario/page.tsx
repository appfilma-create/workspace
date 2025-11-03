"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import {
  Folder,
  Clock,
  ArrowLeft,
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Eye,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

interface DailyReport {
  id: string;
  memberName: string;
  date: string;
  morningIn: string;
  lunchOut: string;
  afternoonIn: string;
  eveningOut: string;
  totalHours: number;
  observations?: string;
  approved: boolean;
}

export default function ControlHorarioPage() {
  const params = useParams();
  const id = params?.id as string;

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  // Datos de ejemplo
  const [reports] = useState<DailyReport[]>([
    {
      id: "1",
      memberName: "Juan Pérez",
      date: "2025-11-03",
      morningIn: "08:00",
      lunchOut: "14:00",
      afternoonIn: "15:00",
      eveningOut: "20:00",
      totalHours: 11,
      observations: "Jornada completa",
      approved: true,
    },
    {
      id: "2",
      memberName: "María García",
      date: "2025-11-03",
      morningIn: "09:00",
      lunchOut: "14:00",
      afternoonIn: "15:00",
      eveningOut: "19:00",
      totalHours: 9,
      approved: false,
    },
  ]);

  const filteredReports = reports.filter((report) => {
    const matchSearch = report.memberName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchDate = report.date === selectedDate;

    const matchStatus =
      filterStatus === "todos" ||
      (filterStatus === "aprobado" && report.approved) ||
      (filterStatus === "pendiente" && !report.approved);

    return matchSearch && matchDate && matchStatus;
  });

  const totalHoursToday = filteredReports.reduce(
    (sum, r) => sum + r.totalHours,
    0
  );
  const approvedCount = filteredReports.filter((r) => r.approved).length;
  const pendingCount = filteredReports.filter((r) => !r.approved).length;

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
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-3 rounded-xl shadow-lg">
                  <Clock size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                    Control Horario
                  </h1>
                  <p className="text-slate-600 text-sm mt-1">
                    Partes diarios y registro de horas del equipo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Partes Hoy
              </h3>
              <p className="text-3xl font-bold text-blue-700">
                {filteredReports.length}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                Aprobados
              </h3>
              <p className="text-3xl font-bold text-emerald-700">
                {approvedCount}
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Pendientes
              </h3>
              <p className="text-3xl font-bold text-amber-700">
                {pendingCount}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-purple-900 mb-1">
                Horas Totales
              </h3>
              <p className="text-3xl font-bold text-purple-700">
                {totalHoursToday.toFixed(1)}h
              </p>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Calendar
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
            >
              <option value="todos">Todos</option>
              <option value="aprobado">Aprobados</option>
              <option value="pendiente">Pendientes</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
              <Download size={16} />
              Exportar
            </button>
          </div>

          {/* Alerta si hay pendientes */}
          {pendingCount > 0 && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-900 mb-1">
                    Partes pendientes de aprobación
                  </h3>
                  <p className="text-sm text-amber-700">
                    Hay {pendingCount} parte{pendingCount > 1 ? "s" : ""}{" "}
                    esperando tu aprobación.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lista de partes */}
          {filteredReports.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <Clock size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No hay partes para esta fecha
              </h3>
              <p className="text-slate-600">
                Selecciona otra fecha o espera a que el equipo envíe sus partes
                diarios
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className={`bg-white border rounded-xl p-6 hover:shadow-lg transition-all ${
                    !report.approved
                      ? "border-amber-300 bg-amber-50/30"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md text-sm">
                          {report.memberName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {report.memberName}
                          </h3>
                          <p className="text-xs text-slate-600">
                            {new Date(report.date).toLocaleDateString("es-ES", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                          </p>
                        </div>
                        {report.approved ? (
                          <span className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-300">
                            <CheckCircle size={14} />
                            Aprobado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border bg-amber-100 text-amber-700 border-amber-300">
                            <Clock size={14} />
                            Pendiente
                          </span>
                        )}
                      </div>

                      {/* Horarios */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">
                            Entrada mañana
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {report.morningIn}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">
                            Salida comida
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {report.lunchOut}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">
                            Entrada tarde
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {report.afternoonIn}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">
                            Salida final
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {report.eveningOut}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                          <p className="text-xs text-purple-700 mb-1">
                            Total horas
                          </p>
                          <p className="text-lg font-bold text-purple-700">
                            {report.totalHours}h
                          </p>
                        </div>
                      </div>

                      {/* Observaciones */}
                      {report.observations && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-700 font-medium mb-1">
                            Observaciones:
                          </p>
                          <p className="text-sm text-slate-700">
                            {report.observations}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 ml-4">
                      <button
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      {!report.approved && (
                        <button
                          className="px-3 py-2 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                          title="Aprobar parte"
                        >
                          Aprobar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contador */}
          {filteredReports.length > 0 && (
            <div className="mt-4 text-center text-sm text-slate-600">
              Mostrando {filteredReports.length} parte
              {filteredReports.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}