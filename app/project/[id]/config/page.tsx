"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import {
  Settings,
  Folder,
  Edit2,
  Save,
  X,
  UserPlus,
  Mail,
  Trash2,
  Shield,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Briefcase,
  Filter,
  AlertTriangle,
  UserX,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

const PHASES = [
  "Desarrollo",
  "Preproducción",
  "Rodaje",
  "Postproducción",
  "Finalizado",
];
const POSITIONS = ["HOD", "Coordinator", "Crew"];

const PHASE_COLORS: Record<string, string> = {
  Desarrollo: "from-sky-400 to-sky-600",
  Preproducción: "from-amber-400 to-amber-600",
  Rodaje: "from-indigo-400 to-indigo-600",
  Postproducción: "from-purple-400 to-purple-600",
  Finalizado: "from-emerald-400 to-emerald-600",
};

interface ProjectData {
  name: string;
  phase: string;
  description?: string;
  departments?: string[];
  createdAt: any;
}

interface Member {
  userId: string;
  role?: string;
  department?: string;
  position?: string;
  permissions: {
    config: boolean;
    accounting: boolean;
    payroll: boolean;
  };
  email?: string;
  name?: string;
  addedAt: any;
}

interface ConfirmModal {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  type: "danger" | "warning";
}

export default function ProjectConfig() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState({
    config: false,
    accounting: false,
    payroll: false,
  });
  const [project, setProject] = useState<ProjectData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [editingProject, setEditingProject] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger",
  });

  const [projectForm, setProjectForm] = useState({
    name: "",
    phase: "",
    description: "",
  });

  const [newDepartment, setNewDepartment] = useState("");

  const [newMember, setNewMember] = useState({
    email: "",
    name: "",
    role: "",
    department: "",
    position: "",
    permissions: {
      config: false,
      accounting: false,
      payroll: false,
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      } else {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!userId || !id) return;

    const loadProjectData = async () => {
      try {
        const userProjectRef = doc(db, `userProjects/${userId}/projects/${id}`);
        const userProjectSnap = await getDoc(userProjectRef);

        if (!userProjectSnap.exists()) {
          setErrorMessage("No tienes acceso a este proyecto");
          setLoading(false);
          return;
        }

        const userProjectData = userProjectSnap.data();

        let userPerms = userProjectData.permissions || {
          config: false,
          accounting: false,
          payroll: false,
        };
        if (
          userProjectData.role === "Productor ejecutivo" ||
          userProjectData.role === "Director de producción"
        ) {
          userPerms = { config: true, accounting: true, payroll: true };
        }

        setUserPermissions(userPerms);

        if (!userPerms.config) {
          setErrorMessage("No tienes permisos para acceder a la configuración");
          setLoading(false);
          return;
        }

        const projectRef = doc(db, "projects", id as string);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const projectData = projectSnap.data() as ProjectData;
          setProject(projectData);
          setProjectForm({
            name: projectData.name,
            phase: projectData.phase,
            description: projectData.description || "",
          });
        }

        const membersRef = collection(db, `projects/${id}/members`);
        const membersSnap = await getDocs(membersRef);
        const membersData: Member[] = [];

        membersSnap.forEach((doc) => {
          const data = doc.data();
          let permissions = data.permissions || {
            config: false,
            accounting: false,
            payroll: false,
          };

          if (
            data.role === "Productor ejecutivo" ||
            data.role === "Director de producción"
          ) {
            permissions = { config: true, accounting: true, payroll: true };
          }

          membersData.push({
            userId: doc.id,
            role: data.role,
            department: data.department,
            position: data.position,
            permissions: permissions,
            email: data.email,
            name: data.name,
            addedAt: data.addedAt,
          } as Member);
        });

        setMembers(membersData);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando proyecto:", error);
        setErrorMessage(
          "Error al cargar el proyecto: " + (error as any).message
        );
        setLoading(false);
      }
    };

    loadProjectData();
  }, [userId, id, router]);

  const handleSaveProject = async () => {
    if (!id) return;
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const projectRef = doc(db, "projects", id as string);
      await updateDoc(projectRef, {
        name: projectForm.name,
        phase: projectForm.phase,
        description: projectForm.description,
      });

      setProject({
        ...project!,
        name: projectForm.name,
        phase: projectForm.phase,
        description: projectForm.description,
      });

      setEditingProject(false);
      setSuccessMessage("Proyecto actualizado correctamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error actualizando proyecto:", error);
      setErrorMessage("Error al actualizar el proyecto");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!id || !newDepartment.trim()) return;
    setSaving(true);
    setErrorMessage("");

    try {
      const projectRef = doc(db, "projects", id as string);
      await updateDoc(projectRef, {
        departments: arrayUnion(newDepartment.trim()),
      });

      setProject({
        ...project!,
        departments: [...(project?.departments || []), newDepartment.trim()],
      });

      setNewDepartment("");
      setShowAddDepartment(false);
      setSuccessMessage("Departamento agregado correctamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error agregando departamento:", error);
      setErrorMessage("Error al agregar el departamento");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDepartment = async (dept: string) => {
    if (!id) return;

    // Verificar si hay usuarios asignados a este departamento
    const usersInDept = members.filter((m) => m.department === dept);

    if (usersInDept.length > 0) {
      setConfirmModal({
        isOpen: true,
        title: "No se puede eliminar",
        message: `No puedes eliminar el departamento "${dept}" porque tiene ${
          usersInDept.length
        } ${
          usersInDept.length === 1 ? "usuario asignado" : "usuarios asignados"
        }. Primero debes reasignar o eliminar estos usuarios.`,
        type: "warning",
        onConfirm: () => {
          setConfirmModal({ ...confirmModal, isOpen: false });
        },
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Eliminar departamento",
      message: `¿Estás seguro de que deseas eliminar el departamento "${dept}"? Esta acción no se puede deshacer.`,
      type: "danger",
      onConfirm: async () => {
        setSaving(true);
        try {
          const projectRef = doc(db, "projects", id as string);
          await updateDoc(projectRef, {
            departments: arrayRemove(dept),
          });

          setProject({
            ...project!,
            departments: (project?.departments || []).filter((d) => d !== dept),
          });

          setSuccessMessage("Departamento eliminado correctamente");
          setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
          console.error("Error eliminando departamento:", error);
          setErrorMessage("Error al eliminar el departamento");
        } finally {
          setSaving(false);
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      },
    });
  };

  const handleAddMember = async () => {
    if (!id || !newMember.email) {
      setErrorMessage("El email es obligatorio");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const memberId = newMember.email.replace(/[@.]/g, "_");
      const memberRef = doc(db, `projects/${id}/members`, memberId);

      await setDoc(memberRef, {
        email: newMember.email,
        name: newMember.name || newMember.email,
        role: newMember.role || null,
        department: newMember.department || null,
        position: newMember.position || null,
        permissions: newMember.permissions,
        addedAt: new Date().toISOString(),
      });

      setMembers([
        ...members,
        {
          userId: memberId,
          email: newMember.email,
          name: newMember.name || newMember.email,
          role: newMember.role || undefined,
          department: newMember.department || undefined,
          position: newMember.position || undefined,
          permissions: newMember.permissions,
          addedAt: new Date().toISOString(),
        },
      ]);

      setNewMember({
        email: "",
        name: "",
        role: "",
        department: "",
        position: "",
        permissions: {
          config: false,
          accounting: false,
          payroll: false,
        },
      });

      setShowAddMember(false);
      setSuccessMessage("Miembro agregado correctamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error agregando miembro:", error);
      setErrorMessage("Error al agregar el miembro");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!id) return;

    const member = members.find((m) => m.userId === memberId);
    setConfirmModal({
      isOpen: true,
      title: "Eliminar miembro",
      message: `¿Estás seguro de que deseas eliminar a ${
        member?.name || member?.email
      } del proyecto? Esta acción no se puede deshacer.`,
      type: "danger",
      onConfirm: async () => {
        setSaving(true);
        try {
          const memberRef = doc(db, `projects/${id}/members`, memberId);
          await deleteDoc(memberRef);

          setMembers(members.filter((m) => m.userId !== memberId));

          setSuccessMessage("Miembro eliminado correctamente");
          setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
          console.error("Error eliminando miembro:", error);
          setErrorMessage("Error al eliminar el miembro");
        } finally {
          setSaving(false);
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      },
    });
  };

  const isAdmin =
    members.find((m) => m.userId === userId)?.role === "Productor ejecutivo" ||
    members.find((m) => m.userId === userId)?.role === "Director de producción";

  const filteredMembers = members.filter((member) => {
    if (departmentFilter === "all") return true;
    if (departmentFilter === "admin") {
      return (
        member.role === "Productor ejecutivo" ||
        member.role === "Director de producción"
      );
    }
    if (departmentFilter === "unassigned") {
      return !member.department;
    }
    return member.department === departmentFilter;
  });

  const uniqueDepartments = Array.from(
    new Set(members.map((m) => m.department).filter(Boolean))
  ) as string[];

  if (loading) {
    return (
      <div
        className={`min-h-screen bg-white flex items-center justify-center ${inter.className}`}
      >
        <div className="text-slate-600">Cargando...</div>
      </div>
    );
  }

  if (errorMessage && !project) {
    return (
      <div
        className={`min-h-screen bg-white flex items-center justify-center ${inter.className}`}
      >
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-slate-700 mb-4">{errorMessage}</p>
          <Link
            href="/dashboard"
            className="text-slate-900 hover:underline font-medium"
          >
            Volver al dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen bg-white ${inter.className}`}>
      {/* Modal de confirmación */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`p-3 rounded-full ${
                  confirmModal.type === "danger" ? "bg-red-100" : "bg-amber-100"
                }`}
              >
                <AlertTriangle
                  size={24}
                  className={
                    confirmModal.type === "danger"
                      ? "text-red-600"
                      : "text-amber-600"
                  }
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {confirmModal.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() =>
                  setConfirmModal({ ...confirmModal, isOpen: false })
                }
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmModal.onConfirm}
                disabled={saving}
                className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  confirmModal.type === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {saving ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner superior fino - estilo accounting pero en gris */}
      <div className="mt-[4.5rem] bg-gradient-to-r from-slate-100 to-slate-200 border-y border-slate-200 px-6 md:px-12 py-2 flex items-center justify-center relative">
        <h1 className="text-[13px] font-medium text-slate-700 tracking-tight text-center">
          {id}
        </h1>
        <Link
          href="/dashboard"
          className="absolute right-6 md:right-12 text-slate-600 hover:text-slate-900 transition-colors"
          title="Volver a proyectos"
        >
          <Folder size={16} />
        </Link>
      </div>

      {/* Contenido */}
      <main className="flex-grow p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={20} />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && project && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    <Settings size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-slate-900">
                      Información del proyecto
                    </h1>
                    <p className="text-sm text-slate-500">
                      Gestiona la información y configuración
                    </p>
                  </div>
                </div>
                {!editingProject && (
                  <button
                    onClick={() => setEditingProject(true)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                )}
              </div>
              {!editingProject ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nombre del proyecto
                    </label>
                    <p className="text-slate-900">{project?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Fase actual
                    </label>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${
                        PHASE_COLORS[project?.phase || ""]
                      }`}
                    >
                      {project?.phase}
                    </span>
                  </div>
                  {project?.description && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Descripción
                      </label>
                      <p className="text-slate-600">{project.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nombre del proyecto
                    </label>
                    <input
                      type="text"
                      value={projectForm.name}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fase actual
                    </label>
                    <select
                      value={projectForm.phase}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          phase: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                    >
                      {PHASES.map((phase) => (
                        <option key={phase} value={phase}>
                          {phase}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={projectForm.description}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none resize-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveProject}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <Save size={16} />
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button
                      onClick={() => setEditingProject(false)}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      <X size={16} />
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                    <Briefcase size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Departamentos
                    </h2>
                    <p className="text-sm text-slate-500">
                      Organiza tu equipo por áreas
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddDepartment(!showAddDepartment)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Agregar departamento
                </button>
              </div>
              {showAddDepartment && (
                <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      placeholder="Nombre del departamento"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                    />
                    <button
                      onClick={handleAddDepartment}
                      disabled={saving || !newDepartment.trim()}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => {
                        setShowAddDepartment(false);
                        setNewDepartment("");
                      }}
                      className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {!project?.departments || project.departments.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No hay departamentos configurados
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {project.departments.map((dept) => (
                    <div
                      key={dept}
                      className="group flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {dept}
                      </span>
                      <button
                        onClick={() => handleRemoveDepartment(dept)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-all p-1"
                        title="Eliminar departamento"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Equipo
                    </h2>
                    <p className="text-sm text-slate-500">
                      Gestiona los miembros del proyecto
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <UserPlus size={16} />
                  Agregar miembro
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Filter size={16} className="text-slate-400" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm"
                >
                  <option value="all">Todos los miembros</option>
                  <option value="admin">Roles administrativos</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  <option value="unassigned">Sin departamento</option>
                </select>
                <span className="text-sm text-slate-500">
                  {filteredMembers.length}{" "}
                  {filteredMembers.length === 1 ? "miembro" : "miembros"}
                </span>
              </div>
              {showAddMember && (
                <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Agregar nuevo miembro
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={newMember.email}
                          onChange={(e) =>
                            setNewMember({
                              ...newMember,
                              email: e.target.value,
                            })
                          }
                          placeholder="correo@ejemplo.com"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={newMember.name}
                          onChange={(e) =>
                            setNewMember({ ...newMember, name: e.target.value })
                          }
                          placeholder="Nombre completo"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Rol
                        </label>
                        <select
                          value={newMember.role}
                          onChange={(e) =>
                            setNewMember({ ...newMember, role: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm"
                        >
                          <option value="">Seleccionar rol</option>
                          <option value="Productor ejecutivo">
                            Productor ejecutivo
                          </option>
                          <option value="Director de producción">
                            Director de producción
                          </option>
                          <option value="Member">Miembro del equipo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Departamento
                        </label>
                        <select
                          value={newMember.department}
                          onChange={(e) =>
                            setNewMember({
                              ...newMember,
                              department: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm"
                        >
                          <option value="">Seleccionar</option>
                          {project?.departments?.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Posición
                        </label>
                        <select
                          value={newMember.position}
                          onChange={(e) =>
                            setNewMember({
                              ...newMember,
                              position: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm"
                        >
                          <option value="">Seleccionar</option>
                          {POSITIONS.map((pos) => (
                            <option key={pos} value={pos}>
                              {pos}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {newMember.role !== "Productor ejecutivo" &&
                      newMember.role !== "Director de producción" && (
                        <>
                          <div className="pt-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Permisos
                            </label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newMember.permissions.config}
                                  onChange={(e) =>
                                    setNewMember({
                                      ...newMember,
                                      permissions: {
                                        ...newMember.permissions,
                                        config: e.target.checked,
                                      },
                                    })
                                  }
                                  className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
                                />
                                <span className="text-sm text-slate-700">
                                  Config
                                </span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newMember.permissions.accounting}
                                  onChange={(e) =>
                                    setNewMember({
                                      ...newMember,
                                      permissions: {
                                        ...newMember.permissions,
                                        accounting: e.target.checked,
                                      },
                                    })
                                  }
                                  className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
                                />
                                <span className="text-sm text-slate-700">
                                  Accounting
                                </span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newMember.permissions.payroll}
                                  onChange={(e) =>
                                    setNewMember({
                                      ...newMember,
                                      permissions: {
                                        ...newMember.permissions,
                                        payroll: e.target.checked,
                                      },
                                    })
                                  }
                                  className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
                                />
                                <span className="text-sm text-slate-700">
                                  Payroll
                                </span>
                              </label>
                            </div>
                          </div>
                        </>
                      )}

                    <button
                      onClick={handleAddMember}
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <Mail size={16} />
                      {saving ? "Enviando..." : "Enviar invitación"}
                    </button>
                  </div>
                </div>
              )}

              {filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  {departmentFilter === "all"
                    ? "No hay miembros en el equipo aún"
                    : "No hay miembros en este filtro"}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Miembro
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Departamento / Rol
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Permisos
                        </th>
                        {isAdmin && (
                          <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                            Acciones
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((member) => {
                        const isAdminRole =
                          member.role === "Productor ejecutivo" ||
                          member.role === "Director de producción";

                        return (
                          <tr
                            key={member.userId}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full ${
                                    isAdminRole
                                      ? "bg-slate-900 text-white"
                                      : "bg-slate-200 text-slate-600"
                                  } flex items-center justify-center text-xs font-semibold`}
                                >
                                  {member.name?.[0]?.toUpperCase() ||
                                    member.email?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-slate-900">
                                      {member.name || member.email}
                                    </p>
                                    {isAdminRole && (
                                      <Shield
                                        size={12}
                                        className="text-slate-900"
                                      />
                                    )}
                                  </div>
                                  {member.email && member.name && (
                                    <p className="text-xs text-slate-500">
                                      {member.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {isAdminRole ? (
                                <span className="text-sm font-medium text-slate-900">
                                  {member.role}
                                </span>
                              ) : (
                                <div className="text-sm text-slate-600">
                                  {member.department && member.position ? (
                                    <>
                                      <span className="font-medium text-slate-900">
                                        {member.position}
                                      </span>
                                      <span className="text-slate-400">
                                        {" "}
                                        ·{" "}
                                      </span>
                                      <span>{member.department}</span>
                                    </>
                                  ) : (
                                    <span className="text-slate-400">
                                      Sin asignar
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1.5">
                                {member.permissions.config && (
                                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
                                    Config
                                  </span>
                                )}
                                {member.permissions.accounting && (
                                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-medium">
                                    Accounting
                                  </span>
                                )}
                                {member.permissions.payroll && (
                                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-medium">
                                    Payroll
                                  </span>
                                )}
                                {!member.permissions.config &&
                                  !member.permissions.accounting &&
                                  !member.permissions.payroll && (
                                    <span className="text-xs text-slate-400">
                                      Sin permisos
                                    </span>
                                  )}
                              </div>
                            </td>
                            {isAdmin && (
                              <td className="py-3 px-4 text-right">
                                {member.userId !== userId && (
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => {
                                        // TODO: Implementar edición de usuario
                                        console.log(
                                          "Edit user:",
                                          member.userId
                                        );
                                      }}
                                      className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
                                      title="Editar usuario"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setConfirmModal({
                                          isOpen: true,
                                          title: "Desactivar cuenta",
                                          message: `¿Deseas desactivar la cuenta de ${
                                            member.name || member.email
                                          }? El usuario no podrá acceder al proyecto pero sus datos se mantendrán.`,
                                          type: "warning",
                                          onConfirm: async () => {
                                            // TODO: Implementar desactivación
                                            console.log(
                                              "Deactivate user:",
                                              member.userId
                                            );
                                            setConfirmModal({
                                              ...confirmModal,
                                              isOpen: false,
                                            });
                                          },
                                        });
                                      }}
                                      className="text-slate-400 hover:text-amber-600 transition-colors p-1.5 hover:bg-amber-50 rounded"
                                      title="Desactivar cuenta"
                                    >
                                      <UserX size={16} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRemoveMember(member.userId)
                                      }
                                      className="text-slate-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
                                      title="Eliminar permanentemente"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
