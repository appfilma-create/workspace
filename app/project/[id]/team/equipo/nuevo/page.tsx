"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import {
  Folder,
  UserPlus,
  ArrowLeft,
  Save,
  Upload,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function NuevoMiembroPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dni: "",
    role: "",
    department: "",
    contractType: "Laboral" as "Laboral" | "Autónomo" | "Becario" | "Colaborador",
    startDate: "",
    endDate: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    notes: "",
  });

  const roles = [
    "Director",
    "Productor",
    "Director de Fotografía",
    "Operador de Cámara",
    "Ayudante de Dirección",
    "Script",
    "Director de Arte",
    "Jefe de Producción",
    "Coordinador de Producción",
    "Auxiliar de Producción",
    "Sonidista",
    "Microfonista",
    "Jefe de Eléctricos",
    "Eléctrico",
    "Maquinista",
    "Vestuarista",
    "Maquillador",
    "Peluquero",
    "Regidor",
    "Figurinista",
    "Actor",
    "Actriz",
    "Extra",
    "Otro",
  ];

  const departments = [
    "Dirección",
    "Producción",
    "Fotografía",
    "Cámara",
    "Eléctricos",
    "Maquinaria",
    "Arte",
    "Vestuario",
    "Caracterización",
    "Sonido",
    "Script",
    "Casting",
    "Reparto",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name.trim()) {
      alert("El nombre es obligatorio");
      return;
    }
    if (!formData.email.trim()) {
      alert("El email es obligatorio");
      return;
    }
    if (!formData.role) {
      alert("El rol es obligatorio");
      return;
    }
    if (!formData.department) {
      alert("El departamento es obligatorio");
      return;
    }

    try {
      setSaving(true);

      // TODO: Aquí irá la lógica de Firebase
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Miembro añadido correctamente");
      router.push(`/project/${id}/team/equipo`);
    } catch (error) {
      console.error("Error al crear miembro:", error);
      alert("Error al añadir el miembro");
    } finally {
      setSaving(false);
    }
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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/project/${id}/team/equipo`}
              className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-800 transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Volver al Equipo
            </Link>

            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-3 rounded-xl shadow-lg">
                <UserPlus size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                  Nuevo Miembro
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  Completa los datos para dar de alta un nuevo miembro del equipo
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos personales */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Datos personales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    placeholder="Nombre y apellidos"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    placeholder="666 777 888"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    DNI/NIE
                  </label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) =>
                      setFormData({ ...formData, dni: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    placeholder="12345678A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    placeholder="Calle, número, ciudad"
                  />
                </div>
              </div>
            </div>

            {/* Datos profesionales */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Datos profesionales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rol *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Selecciona rol...</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Departamento *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Selecciona departamento...</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de contrato
                  </label>
                  <select
                    value={formData.contractType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractType: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                  >
                    <option value="Laboral">Laboral</option>
                    <option value="Autónomo">Autónomo</option>
                    <option value="Becario">Becario</option>
                    <option value="Colaborador">Colaborador</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fecha fin
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contacto de emergencia */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Contacto de emergencia
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContactName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    placeholder="Nombre del contacto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContactPhone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    placeholder="666 777 888"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Relación
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContactRelationship: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    placeholder="Padre, hermano, pareja..."
                  />
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Notas adicionales
              </h3>

              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                rows={4}
                placeholder="Cualquier información adicional relevante..."
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <Link href={`/project/${id}/team/equipo`}>
                <button
                  type="button"
                  className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Añadir miembro
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}