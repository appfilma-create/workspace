"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import {
  Folder,
  Users,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

interface Member {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: "Activo" | "Inactivo" | "Pendiente";
  startDate: string;
}

export default function EquipoPage() {
  const params = useParams();
  const id = params?.id as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  // Datos de ejemplo
  const [members] = useState<Member[]>([
    {
      id: "1",
      name: "Juan Pérez",
      role: "Director de Fotografía",
      department: "Fotografía",
      email: "juan@example.com",
      phone: "666 777 888",
      status: "Activo",
      startDate: "2025-01-15",
    },
    {
      id: "2",
      name: "María García",
      role: "1er Ayudante de Dirección",
      department: "Dirección",
      email: "maria@example.com",
      phone: "655 444 333",
      status: "Activo",
      startDate: "2025-01-10",
    },
  ]);

  const departments = [
    "Dirección",
    "Producción",
    "Fotografía",
    "Cámara",
    "Arte",
    "Sonido",
  ];

  const statusIcons = {
    Activo: <CheckCircle size={14} />,
    Inactivo: <XCircle size={14} />,
    Pendiente: <Clock size={14} />,
  };

  const statusColors = {
    Activo: "bg-emerald-100 text-emerald-700 border-emerald-300",
    Inactivo: "bg-slate-100 text-slate-700 border-slate-300",
    Pendiente: "bg-amber-100 text-amber-700 border-amber-300",
  };

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      Dirección: "bg-purple-100 text-purple-700",
      Producción: "bg-blue-100 text-blue-700",
      Fotografía: "bg-indigo-100 text-indigo-700",
      Cámara: "bg-cyan-100 text-cyan-700",
      Arte: "bg-pink-100 text-pink-700",
      Sonido: "bg-emerald-100 text-emerald-700",
    };
    return colors[dept] || "bg-slate-100 text-slate-700";
  };

  const filteredMembers = members.filter((member) => {
    const matchSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDepartment =
      filterDepartment === "todos" || member.department === filterDepartment;

    const matchStatus =
      filterStatus === "todos" || member.status === filterStatus;

    return matchSearch && matchDepartment && matchStatus;
  });

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
                <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-3 rounded-xl shadow-lg">
                  <Users size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                    Equipo
                  </h1>
                  <p className="text-slate-600 text-sm mt-1">
                    Gestión de miembros del equipo técnico y artístico
                  </p>
                </div>
              </div>
              <Link href={`/project/${id}/team/equipo/nuevo`}>
                <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md">
                  <Plus size={16} />
                  Nuevo miembro
                </button>
              </Link>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Total Equipo
              </h3>
              <p className="text-3xl font-bold text-blue-700">
                {members.length}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                Activos
              </h3>
              <p className="text-3xl font-bold text-emerald-700">
                {members.filter((m) => m.status === "Activo").length}
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Pendientes
              </h3>
              <p className="text-3xl font-bold text-amber-700">
                {members.filter((m) => m.status === "Pendiente").length}
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Departamentos
              </h3>
              <p className="text-3xl font-bold text-slate-700">
                {new Set(members.map((m) => m.department)).size}
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
                placeholder="Buscar por nombre, rol o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm"
              />
            </div>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm"
            >
              <option value="todos">Todos los departamentos</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm"
            >
              <option value="todos">Todos los estados</option>
              <option value="Activo">Activos</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Inactivo">Inactivos</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
              <Download size={16} />
              Exportar
            </button>
          </div>

          {/* Lista de miembros */}
          {filteredMembers.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <Users size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No se encontraron miembros
              </h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || filterDepartment !== "todos"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Añade el primer miembro del equipo para comenzar"}
              </p>
              {!searchTerm && filterDepartment === "todos" && (
                <Link href={`/project/${id}/team/equipo/nuevo`}>
                  <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                    Añadir primer miembro
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:border-amber-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold shadow-md">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {member.name}
                          </h3>
                          <span
                            className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border ${
                              statusColors[member.status]
                            }`}
                          >
                            {statusIcons[member.status]}
                            {member.status}
                          </span>
                        </div>

                        <p className="text-sm font-medium text-slate-700 mb-2">
                          {member.role}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span
                            className={`px-2 py-1 rounded-md ${getDepartmentColor(
                              member.department
                            )}`}
                          >
                            {member.department}
                          </span>
                          <div className="flex items-center gap-1">
                            <Mail size={12} />
                            {member.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone size={12} />
                            {member.phone}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
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

          {/* Contador */}
          {filteredMembers.length > 0 && (
            <div className="mt-4 text-center text-sm text-slate-600">
              Mostrando {filteredMembers.length} de {members.length} miembros
            </div>
          )}
        </div>
      </main>
    </div>
  );
}