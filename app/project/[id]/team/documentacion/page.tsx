"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import {
  Folder,
  FileText,
  ArrowLeft,
  Upload,
  Send,
  Users,
  CheckSquare,
  Square,
  Search,
  Filter,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
}

export default function DocumentacionPage() {
  const params = useParams();
  const id = params?.id as string;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("todos");
  const [withWatermark, setWithWatermark] = useState(false);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // Datos de ejemplo
  const [members] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Juan Pérez",
      role: "Director de Fotografía",
      department: "Fotografía",
      email: "juan@example.com",
    },
    {
      id: "2",
      name: "María García",
      role: "1er Ayudante de Dirección",
      department: "Dirección",
      email: "maria@example.com",
    },
    {
      id: "3",
      name: "Carlos López",
      role: "Jefe de Producción",
      department: "Producción",
      email: "carlos@example.com",
    },
    {
      id: "4",
      name: "Ana Martín",
      role: "Script",
      department: "Script",
      email: "ana@example.com",
    },
  ]);

  const departments = ["Dirección", "Producción", "Fotografía", "Script"];

  const filteredMembers = members.filter((member) => {
    const matchSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDepartment =
      filterDepartment === "todos" || member.department === filterDepartment;

    return matchSearch && matchDepartment;
  });

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map((m) => m.id));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSend = () => {
    if (selectedMembers.length === 0) {
      alert("Selecciona al menos un destinatario");
      return;
    }
    if (files.length === 0) {
      alert("Adjunta al menos un documento");
      return;
    }

    // TODO: Lógica de envío con Firebase
    alert(
      `Enviando ${files.length} documento(s) a ${selectedMembers.length} persona(s)`
    );
  };

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      Dirección: "bg-purple-100 text-purple-700",
      Producción: "bg-blue-100 text-blue-700",
      Fotografía: "bg-indigo-100 text-indigo-700",
      Script: "bg-teal-100 text-teal-700",
    };
    return colors[dept] || "bg-slate-100 text-slate-700";
  };

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

            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-3 rounded-xl shadow-lg">
                <FileText size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                  Envío de Documentación
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  Distribuye documentos al equipo de forma rápida y segura
                </p>
              </div>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="mb-8 flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {s}
                </div>
                <span
                  className={`text-sm ${
                    step >= s ? "text-slate-900 font-medium" : "text-slate-500"
                  }`}
                >
                  {s === 1
                    ? "Seleccionar equipo"
                    : s === 2
                    ? "Adjuntar documentos"
                    : "Confirmar envío"}
                </span>
                {s < 3 && (
                  <div className="w-12 h-0.5 bg-slate-200 ml-2"></div>
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Seleccionar destinatarios */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Selecciona destinatarios
                  </h3>
                  <button
                    onClick={toggleAll}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {selectedMembers.length === filteredMembers.length
                      ? "Deseleccionar todos"
                      : "Seleccionar todos"}
                  </button>
                </div>

                {/* Filtros */}
                <div className="mb-4 flex gap-3">
                  <div className="relative flex-1">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o rol..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none text-sm"
                    />
                  </div>

                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none text-sm"
                  >
                    <option value="todos">Todos los departamentos</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lista de miembros */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedMembers.includes(member.id)
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {selectedMembers.includes(member.id) ? (
                        <CheckSquare
                          size={20}
                          className="text-emerald-600 flex-shrink-0"
                        />
                      ) : (
                        <Square
                          size={20}
                          className="text-slate-400 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-600">{member.role}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-md ${getDepartmentColor(
                          member.department
                        )}`}
                      >
                        {member.department}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Resumen selección */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-emerald-600">
                      {selectedMembers.length}
                    </span>{" "}
                    persona{selectedMembers.length !== 1 ? "s" : ""}{" "}
                    seleccionada{selectedMembers.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={selectedMembers.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente: Adjuntar documentos
                  <ArrowLeft size={16} className="rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Adjuntar documentos */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Adjunta los documentos
                </h3>

                {/* Upload area */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
                  <Upload size={48} className="text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-700 font-medium mb-2">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    PDF, JPG, PNG, DOCX (máx. 10 MB)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <span className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg cursor-pointer hover:bg-emerald-700 transition-colors">
                      Seleccionar archivos
                    </span>
                  </label>
                </div>

                {/* Archivos seleccionados */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                      Archivos seleccionados:
                    </p>
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-slate-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setFiles(files.filter((_, i) => i !== index))
                          }
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Opciones */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="watermark"
                      checked={withWatermark}
                      onChange={(e) => setWithWatermark(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-400"
                    />
                    <label
                      htmlFor="watermark"
                      className="text-sm text-slate-700"
                    >
                      Aplicar marca de agua a los documentos
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mensaje adicional (opcional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
                      rows={3}
                      placeholder="Añade un mensaje para el equipo..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  <ArrowLeft size={16} />
                  Volver
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={files.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente: Confirmar
                  <ArrowLeft size={16} className="rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmar y enviar */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Confirma el envío
                </h3>

                {/* Resumen */}
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Users size={20} className="text-blue-600" />
                      <p className="font-medium text-blue-900">
                        Destinatarios
                      </p>
                    </div>
                    <p className="text-sm text-blue-700">
                      {selectedMembers.length} persona
                      {selectedMembers.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText size={20} className="text-emerald-600" />
                      <p className="font-medium text-emerald-900">Documentos</p>
                    </div>
                    <p className="text-sm text-emerald-700">
                      {files.length} archivo{files.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {withWatermark && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm text-amber-700">
                        ✓ Se aplicará marca de agua
                      </p>
                    </div>
                  )}

                  {message && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <p className="text-xs text-slate-600 mb-1">Mensaje:</p>
                      <p className="text-sm text-slate-700">{message}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  <ArrowLeft size={16} />
                  Volver
                </button>
                <button
                  onClick={handleSend}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-lg"
                >
                  <Send size={16} />
                  Enviar documentación
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}