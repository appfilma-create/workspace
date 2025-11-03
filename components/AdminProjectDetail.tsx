"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Inter } from "next/font/google";
import {
  ArrowLeft,
  Users,
  Briefcase,
  Info,
  Edit,
  Trash2,
  UserPlus,
  Plus,
  X,
  Mail,
  Calendar,
  Building2,
  Save,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

const phaseColors: Record<string, string> = {
  Desarrollo: "from-sky-400 to-sky-600",
  Preproducción: "from-amber-400 to-amber-600",
  Rodaje: "from-indigo-400 to-indigo-600",
  Postproducción: "from-purple-400 to-purple-600",
  Finalizado: "from-emerald-400 to-emerald-600",
};

interface ProjectData {
  name: string;
  phase: string;
  description: string;
  productionCompanies: string[];
  genre: string;
  director: string;
  startDate: string;
  budget: string;
  createdAt: any;
}

interface Member {
  id: string;
  email: string;
  name: string;
  role: string;
  addedAt: any;
}

interface Department {
  id: string;
  name: string;
  head: string;
  memberCount: number;
}

export default function AdminProjectDetail() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "members" | "departments">("info");
  const [project, setProject] = useState<ProjectData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);

  const [newMember, setNewMember] = useState({
    email: "",
    name: "",
    role: "Productor Ejecutivo",
    createUser: false,
    tempPassword: "",
  });

  const [newDepartment, setNewDepartment] = useState({
    name: "",
    head: "",
  });

  const [editedProject, setEditedProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
      } else {
        setUserId(user.uid);
        
        // Verificar si el usuario es admin
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const role = userDoc.exists() ? userDoc.data().role : "user";
          
          console.log("🔐 Verificando acceso admin al proyecto...");
          console.log("👤 Usuario:", user.uid);
          console.log("🎭 Rol:", role);
          
          setUserRole(role);
          
          if (role !== "admin") {
            console.log("❌ Acceso denegado: No es admin");
            alert("⛔ No tienes permisos para acceder a esta vista");
            router.push("/dashboard");
          } else {
            console.log("✅ Acceso permitido: Es admin");
            setCheckingAccess(false);
          }
        } catch (error) {
          console.error("Error verificando rol:", error);
          router.push("/dashboard");
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (userId && projectId) {
      loadProjectData();
    }
  }, [userId, projectId]);

  const loadProjectData = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const projectDoc = await getDoc(doc(db, "projects", projectId));
      if (projectDoc.exists()) {
        const data = projectDoc.data() as ProjectData;
        setProject(data);
        setEditedProject(data);
      }

      const membersRef = collection(db, `projects/${projectId}/members`);
      const membersSnapshot = await getDocs(membersRef);
      const membersData: Member[] = [];
      membersSnapshot.forEach((doc) => {
        membersData.push({ id: doc.id, ...doc.data() } as Member);
      });
      setMembers(membersData);

      const departmentsRef = collection(db, `projects/${projectId}/departments`);
      const departmentsSnapshot = await getDocs(departmentsRef);
      const departmentsData: Department[] = [];
      departmentsSnapshot.forEach((doc) => {
        departmentsData.push({ id: doc.id, ...doc.data() } as Department);
      });
      setDepartments(departmentsData);

      setLoading(false);
    } catch (error) {
      console.error("Error al cargar proyecto:", error);
      setLoading(false);
    }
  };

  const checkUserExists = async () => {
    if (!newMember.email) return;

    try {
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      let found = false;

      usersSnapshot.forEach((doc) => {
        if (doc.data().email === newMember.email) {
          found = true;
          setNewMember(prev => ({ ...prev, name: doc.data().displayName || "" }));
        }
      });

      setUserNotFound(!found);
      
      if (!found) {
        alert(`⚠️ No se encontró un usuario registrado con el email: ${newMember.email}\n\nOpciones:\n1. El usuario debe registrarse primero en la plataforma\n2. Contacta con el usuario para que cree su cuenta`);
      }
    } catch (error) {
      console.error("Error al buscar usuario:", error);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.email || !newMember.name || !projectId) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      let targetUserId: string | null = null;

      usersSnapshot.forEach((doc) => {
        if (doc.data().email === newMember.email) {
          targetUserId = doc.id;
        }
      });

      if (!targetUserId) {
        alert(`❌ El usuario con email ${newMember.email} no está registrado en la plataforma.\n\nPara añadir este usuario:\n1. El usuario debe registrarse en /register\n2. Luego podrás añadirlo al proyecto`);
        return;
      }

      await setDoc(doc(db, `projects/${projectId}/members/${targetUserId}`), {
        email: newMember.email,
        name: newMember.name,
        role: newMember.role,
        addedAt: serverTimestamp(),
      });

      await setDoc(doc(db, `userProjects/${targetUserId}/projects/${projectId}`), {
        role: newMember.role,
        addedAt: serverTimestamp(),
      });

      alert(`✅ ${newMember.name} añadido al proyecto correctamente`);
      setNewMember({ email: "", name: "", role: "Productor Ejecutivo", createUser: false, tempPassword: "" });
      setShowAddMemberModal(false);
      setUserNotFound(false);
      loadProjectData();
    } catch (error) {
      console.error("Error al añadir miembro:", error);
      alert("Error al añadir miembro. Revisa la consola para más detalles.");
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`¿Eliminar a ${memberName} del proyecto?\n\nEsto eliminará su acceso pero no su cuenta de usuario.`)) return;

    try {
      await deleteDoc(doc(db, `projects/${projectId}/members/${memberId}`));
      await deleteDoc(doc(db, `userProjects/${memberId}/projects/${projectId}`));

      alert(`✅ ${memberName} eliminado del proyecto`);
      loadProjectData();
    } catch (error) {
      console.error("Error al eliminar miembro:", error);
      alert("Error al eliminar miembro");
    }
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.name || !projectId) {
      alert("El nombre del departamento es obligatorio");
      return;
    }

    try {
      await setDoc(doc(db, `projects/${projectId}/departments`, newDepartment.name), {
        name: newDepartment.name,
        head: newDepartment.head,
        memberCount: 0,
        createdAt: serverTimestamp(),
      });

      alert(`✅ Departamento "${newDepartment.name}" creado`);
      setNewDepartment({ name: "", head: "" });
      setShowAddDepartmentModal(false);
      loadProjectData();
    } catch (error) {
      console.error("Error al crear departamento:", error);
      alert("Error al crear departamento");
    }
  };

  const handleDeleteDepartment = async (deptId: string, deptName: string) => {
    if (!confirm(`¿Eliminar el departamento "${deptName}"?`)) return;

    try {
      await deleteDoc(doc(db, `projects/${projectId}/departments/${deptId}`));
      alert(`✅ Departamento "${deptName}" eliminado`);
      loadProjectData();
    } catch (error) {
      console.error("Error al eliminar departamento:", error);
      alert("Error al eliminar departamento");
    }
  };

  const handleSaveInfo = async () => {
    if (!editedProject || !projectId) return;

    try {
      await updateDoc(doc(db, "projects", projectId), {
        ...editedProject,
        updatedAt: serverTimestamp(),
      });

      alert("✅ Información actualizada");
      setProject(editedProject);
      setEditingInfo(false);
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar información");
    }
  };

  if (loading || checkingAccess) {
    return (
      <div className={`flex flex-col min-h-screen bg-white ${inter.className}`}>
        <main className="pt-28 pb-16 px-6 md:px-12 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm font-medium">
              {checkingAccess ? "Verificando permisos de acceso..." : "Cargando proyecto..."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={`flex flex-col min-h-screen bg-white ${inter.className}`}>
        <main className="pt-28 pb-16 px-6 md:px-12 flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 mb-4">Proyecto no encontrado</p>
            <Link
              href="/admindashboard"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium"
            >
              Volver al dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen bg-white ${inter.className}`}>
      {/* Modal añadir miembro MEJORADO */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Añadir usuario al proyecto</h3>
              <button onClick={() => {
                setShowAddMemberModal(false);
                setUserNotFound(false);
                setNewMember({ email: "", name: "", role: "Productor Ejecutivo", createUser: false, tempPassword: "" });
              }}>
                <X size={24} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-900">
                ℹ️ <strong>Este usuario podrá gestionar el equipo del proyecto</strong> y tendrá acceso completo a las herramientas de administración (Config, Accounting, Team).
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email del usuario *
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    onBlur={checkUserExists}
                    placeholder="usuario@example.com"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {userNotFound ? (
                    <span className="text-amber-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Usuario no registrado. Debe crear su cuenta primero.
                    </span>
                  ) : (
                    "El usuario debe estar registrado en la plataforma"
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Nombre y apellidos"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rol en el proyecto *
                </label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                >
                  <option value="Productor Ejecutivo">Productor Ejecutivo</option>
                  <option value="Director de Producción">Director de Producción</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Ambos roles tienen permisos completos de gestión del proyecto
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                <strong>Nota importante:</strong> El usuario recibirá acceso al proyecto automáticamente cuando inicie sesión.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddMember}
                  disabled={userNotFound}
                  className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Añadir al proyecto
                </button>
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setUserNotFound(false);
                    setNewMember({ email: "", name: "", role: "Productor Ejecutivo", createUser: false, tempPassword: "" });
                  }}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal añadir departamento */}
      {showAddDepartmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Crear departamento</h3>
              <button onClick={() => setShowAddDepartmentModal(false)}>
                <X size={24} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre del departamento *
                </label>
                <input
                  type="text"
                  value={newDepartment.name}
                  onChange={(e) =>
                    setNewDepartment({ ...newDepartment, name: e.target.value })
                  }
                  placeholder="Ej: Fotografía, Sonido, Arte, Vestuario"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Responsable (opcional)
                </label>
                <input
                  type="text"
                  value={newDepartment.head}
                  onChange={(e) =>
                    setNewDepartment({ ...newDepartment, head: e.target.value })
                  }
                  placeholder="Nombre del jefe de departamento"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddDepartment}
                  className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
                >
                  Crear departamento
                </button>
                <button
                  onClick={() => setShowAddDepartmentModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="pt-28 pb-16 px-6 md:px-12 flex-grow">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admindashboard"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors"
            >
              <ArrowLeft size={16} />
              Volver al dashboard
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-slate-900 mb-2">
                  {project.name}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-medium text-white rounded-full px-3 py-1.5 bg-gradient-to-r ${
                      phaseColors[project.phase]
                    }`}
                  >
                    {project.phase}
                  </span>
                  {project.genre && (
                    <span className="text-xs font-medium text-purple-700 bg-purple-100 border border-purple-200 rounded-full px-3 py-1.5">
                      {project.genre}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 mb-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("info")}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === "info"
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Info size={16} />
                  Información
                </div>
                {activeTab === "info" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("members")}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === "members"
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  Equipo ({members.length})
                </div>
                {activeTab === "members" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("departments")}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === "departments"
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase size={16} />
                  Departamentos ({departments.length})
                </div>
                {activeTab === "departments" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content - Info */}
          {activeTab === "info" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Detalles del Proyecto
                </h2>
                {!editingInfo ? (
                  <button
                    onClick={() => setEditingInfo(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveInfo}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
                    >
                      <Save size={16} />
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setEditingInfo(false);
                        setEditedProject(project);
                      }}
                      className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              {editingInfo && editedProject ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Título
                      </label>
                      <input
                        type="text"
                        value={editedProject.name}
                        onChange={(e) =>
                          setEditedProject({ ...editedProject, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Fase
                      </label>
                      <select
                        value={editedProject.phase}
                        onChange={(e) =>
                          setEditedProject({ ...editedProject, phase: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                      >
                        <option value="Desarrollo">Desarrollo</option>
                        <option value="Preproducción">Preproducción</option>
                        <option value="Rodaje">Rodaje</option>
                        <option value="Postproducción">Postproducción</option>
                        <option value="Finalizado">Finalizado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={editedProject.description}
                      onChange={(e) =>
                        setEditedProject({ ...editedProject, description: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Género
                      </label>
                      <input
                        type="text"
                        value={editedProject.genre}
                        onChange={(e) =>
                          setEditedProject({ ...editedProject, genre: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Director
                      </label>
                      <input
                        type="text"
                        value={editedProject.director}
                        onChange={(e) =>
                          setEditedProject({ ...editedProject, director: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Fecha de inicio
                      </label>
                      <input
                        type="date"
                        value={editedProject.startDate}
                        onChange={(e) =>
                          setEditedProject({ ...editedProject, startDate: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Presupuesto
                      </label>
                      <input
                        type="text"
                        value={editedProject.budget}
                        onChange={(e) =>
                          setEditedProject({ ...editedProject, budget: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Descripción</p>
                    <p className="text-sm text-slate-900">
                      {project.description || "Sin descripción"}
                    </p>
                  </div>

                  {project.productionCompanies && project.productionCompanies.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                        <Building2 size={14} />
                        Productoras
                      </p>
                      <p className="text-sm text-slate-900">
                        {project.productionCompanies.join(", ")}
                      </p>
                    </div>
                  )}

                  {project.director && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Director</p>
                      <p className="text-sm text-slate-900">{project.director}</p>
                    </div>
                  )}

                  {project.startDate && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                        <Calendar size={14} />
                        Fecha de inicio
                      </p>
                      <p className="text-sm text-slate-900">{project.startDate}</p>
                    </div>
                  )}

                  {project.budget && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Presupuesto</p>
                      <p className="text-sm text-slate-900">{project.budget}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab Content - Members */}
          {activeTab === "members" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-600">
                  {members.length} {members.length === 1 ? "usuario" : "usuarios"} con acceso al proyecto
                </p>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <UserPlus size={16} />
                  Añadir usuario
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {member.name}
                        </h3>
                        <p className="text-xs text-slate-600 flex items-center gap-1 mb-2">
                          <Mail size={12} />
                          {member.email}
                        </p>
                        <span className="inline-block text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-md font-medium">
                          {member.role}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar del proyecto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {members.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <Users size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm mb-2">
                    No hay usuarios asignados a este proyecto
                  </p>
                  <p className="text-slate-400 text-xs">
                    Añade usuarios para que puedan gestionar el equipo
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab Content - Departments */}
          {activeTab === "departments" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-600">{departments.length} departamentos</p>
                <button
                  onClick={() => setShowAddDepartmentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Crear departamento
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{dept.name}</h3>
                        {dept.head && (
                          <p className="text-xs text-slate-600">
                            Responsable: {dept.head}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="text-xs text-slate-500">
                      {dept.memberCount} miembros
                    </div>
                  </div>
                ))}
              </div>

              {departments.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <Briefcase size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">
                    No hay departamentos creados
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}