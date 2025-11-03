"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import {
  Folder,
  Plus,
  Search,
  Filter,
  Users,
  Database,
  Activity,
  Terminal,
  Trash2,
  Edit,
  Eye,
  Shield,
  Zap,
  RefreshCw,
  Building2,
  Calendar,
  FileText,
  X,
} from "lucide-react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

const phaseColors: Record<string, string> = {
  Desarrollo: "from-sky-400 to-sky-600",
  Preproducción: "from-amber-400 to-amber-600",
  Rodaje: "from-indigo-400 to-indigo-600",
  Postproducción: "from-purple-400 to-purple-600",
  Finalizado: "from-emerald-400 to-emerald-600",
};

interface Project {
  id: string;
  name: string;
  phase: string;
  description?: string;
  productionCompanies?: string[];
  genre?: string;
  director?: string;
  startDate?: string;
  budget?: string;
  createdAt: any;
  memberCount?: number;
}

interface SystemStats {
  totalProjects: number;
  totalUsers: number;
  activeProjects: number;
  recentActivity: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalProjects: 0,
    totalUsers: 0,
    activeProjects: 0,
    recentActivity: 0,
  });

  const [newProject, setNewProject] = useState({
    name: "",
    phase: "Desarrollo",
    description: "",
    productionCompanies: [""],
    genre: "",
    director: "",
    startDate: "",
    budget: "",
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
      } else {
        setUserId(user.uid);
        setUserName(user.displayName || user.email?.split("@")[0] || "Admin");

        // Verificar si el usuario es admin
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const role = userDoc.exists() ? userDoc.data().role : "user";

          console.log("🔐 Verificando acceso admin...");
          console.log("👤 Usuario:", user.uid);
          console.log("🎭 Rol:", role);

          setUserRole(role);

          if (role !== "admin") {
            console.log("❌ Acceso denegado: No es admin");
            alert("No tienes permisos para acceder al panel de administración");
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

    return () => unsubscribeAuth();
  }, [router]);

  const loadAdminData = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      console.log("🔄 Cargando datos del admin...");

      const projectsRef = collection(db, "projects");
      const projectsSnapshot = await getDocs(projectsRef);

      console.log(`📁 Proyectos encontrados: ${projectsSnapshot.size}`);

      const projectsData: Project[] = [];

      for (const projectDoc of projectsSnapshot.docs) {
        const projectData = projectDoc.data();

        const membersRef = collection(db, `projects/${projectDoc.id}/members`);
        const membersSnapshot = await getDocs(membersRef);

        projectsData.push({
          id: projectDoc.id,
          name: projectData.name,
          phase: projectData.phase,
          description: projectData.description || "",
          productionCompanies: projectData.productionCompanies || [],
          genre: projectData.genre || "",
          director: projectData.director || "",
          startDate: projectData.startDate || "",
          budget: projectData.budget || "",
          createdAt: projectData.createdAt,
          memberCount: membersSnapshot.size,
        });
      }

      projectsData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis() || 0;
        const dateB = b.createdAt?.toMillis() || 0;
        return dateB - dateA;
      });

      setProjects(projectsData);
      setFilteredProjects(projectsData);

      const activeCount = projectsData.filter(
        (p) => p.phase !== "Finalizado"
      ).length;

      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);

      setSystemStats({
        totalProjects: projectsData.length,
        totalUsers: usersSnapshot.size,
        activeProjects: activeCount,
        recentActivity: 0,
      });

      console.log("✅ Datos cargados correctamente");
      setLoading(false);
    } catch (error) {
      console.error("❌ Error al cargar datos de admin:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [userId]);

  useEffect(() => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPhase !== "all") {
      filtered = filtered.filter((p) => p.phase === selectedPhase);
    }

    setFilteredProjects(filtered);
  }, [searchTerm, selectedPhase, projects]);

  const addProductionCompany = () => {
    setNewProject({
      ...newProject,
      productionCompanies: [...newProject.productionCompanies, ""],
    });
  };

  const updateProductionCompany = (index: number, value: string) => {
    const updated = [...newProject.productionCompanies];
    updated[index] = value;
    setNewProject({ ...newProject, productionCompanies: updated });
  };

  const removeProductionCompany = (index: number) => {
    const updated = newProject.productionCompanies.filter(
      (_, i) => i !== index
    );
    setNewProject({ ...newProject, productionCompanies: updated });
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      alert("El nombre del proyecto es obligatorio");
      return;
    }

    if (!userId) {
      alert("Error: No hay usuario autenticado");
      return;
    }

    try {
      console.log("🆕 Creando nuevo proyecto...");

      // Filtrar productoras vacías
      const filteredCompanies = newProject.productionCompanies.filter(
        (c) => c.trim() !== ""
      );

      const projectRef = await addDoc(collection(db, "projects"), {
        name: newProject.name.trim(),
        phase: newProject.phase,
        description: newProject.description.trim(),
        productionCompanies: filteredCompanies,
        genre: newProject.genre.trim(),
        director: newProject.director.trim(),
        startDate: newProject.startDate,
        budget: newProject.budget.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Proyecto creado en 'projects':", projectRef.id);

      await setDoc(
        doc(db, `userProjects/${userId}/projects/${projectRef.id}`),
        {
          role: "Productor Ejecutivo",
          addedAt: serverTimestamp(),
        }
      );

      await setDoc(doc(db, `projects/${projectRef.id}/members/${userId}`), {
        email: auth.currentUser?.email || "",
        name: userName,
        role: "Productor Ejecutivo",
        addedAt: serverTimestamp(),
      });

      console.log("✅ Proyecto creado completamente");

      alert(`✅ Proyecto "${newProject.name}" creado correctamente`);

      setNewProject({
        name: "",
        phase: "Desarrollo",
        description: "",
        productionCompanies: [""],
        genre: "",
        director: "",
        startDate: "",
        budget: "",
      });
      setShowCreateModal(false);

      loadAdminData();
    } catch (error) {
      console.error("❌ Error al crear proyecto:", error);
      alert("Error al crear el proyecto. Revisa la consola para más detalles.");
    }
  };

  const handleDeleteProject = async (
    projectId: string,
    projectName: string
  ) => {
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar el proyecto "${projectName}"?\n\n⚠️ Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      console.log("🗑️ Eliminando proyecto:", projectId);

      const membersRef = collection(db, `projects/${projectId}/members`);
      const membersSnapshot = await getDocs(membersRef);

      for (const memberDoc of membersSnapshot.docs) {
        await deleteDoc(memberDoc.ref);
      }

      const departmentsRef = collection(
        db,
        `projects/${projectId}/departments`
      );
      const departmentsSnapshot = await getDocs(departmentsRef);

      for (const deptDoc of departmentsSnapshot.docs) {
        await deleteDoc(deptDoc.ref);
      }

      await deleteDoc(doc(db, "projects", projectId));

      console.log("✅ Proyecto eliminado completamente");

      alert(`✅ Proyecto "${projectName}" eliminado correctamente`);

      setProjects(projects.filter((p) => p.id !== projectId));
      setFilteredProjects(filteredProjects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("❌ Error al eliminar proyecto:", error);
      alert("Error al eliminar el proyecto.");
    }
  };

  if (loading || checkingAccess) {
    return (
      <div className={`flex flex-col min-h-screen bg-white ${inter.className}`}>
        <main className="pt-28 pb-16 px-6 md:px-12 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm font-medium">
              {checkingAccess
                ? "Verificando permisos de acceso..."
                : "Cargando panel de administración..."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen bg-white ${inter.className}`}>
      {/* Modal de crear proyecto MEJORADO */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-2 rounded-lg">
                  <Folder size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Crear nuevo proyecto
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
              {/* Información básica */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText size={16} />
                  Información básica
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Título del proyecto *
                    </label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject({ ...newProject, name: e.target.value })
                      }
                      placeholder="Ej: El Gran Robo"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Fase *
                      </label>
                      <select
                        value={newProject.phase}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            phase: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm"
                      >
                        <option value="Desarrollo">Desarrollo</option>
                        <option value="Preproducción">Preproducción</option>
                        <option value="Rodaje">Rodaje</option>
                        <option value="Postproducción">Postproducción</option>
                        <option value="Finalizado">Finalizado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Género
                      </label>
                      <input
                        type="text"
                        value={newProject.genre}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            genre: e.target.value,
                          })
                        }
                        placeholder="Ej: Drama, Acción"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          description: e.target.value,
                        })
                      }
                      placeholder="Breve sinopsis del proyecto..."
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none resize-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Productoras */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 size={16} />
                    Productoras
                  </h4>
                  <button
                    onClick={addProductionCompany}
                    className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                  >
                    + Añadir
                  </button>
                </div>

                <div className="space-y-2">
                  {newProject.productionCompanies.map((company, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={company}
                        onChange={(e) =>
                          updateProductionCompany(index, e.target.value)
                        }
                        placeholder={`Productora ${index + 1}`}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm"
                      />
                      {newProject.productionCompanies.length > 1 && (
                        <button
                          onClick={() => removeProductionCompany(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Detalles adicionales */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Calendar size={16} />
                  Detalles adicionales
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Director
                    </label>
                    <input
                      type="text"
                      value={newProject.director}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          director: e.target.value,
                        })
                      }
                      placeholder="Nombre del director"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Fecha de inicio
                      </label>
                      <input
                        type="date"
                        value={newProject.startDate}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            startDate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Presupuesto
                      </label>
                      <input
                        type="text"
                        value={newProject.budget}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            budget: e.target.value,
                          })
                        }
                        placeholder="Ej: 2.5M €"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={handleCreateProject}
                className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
              >
                Crear proyecto
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel de debug */}
      {showDebugPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal size={20} className="text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">
                  Debug Console
                </h3>
              </div>
              <button
                onClick={() => setShowDebugPanel(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm">
              <div className="space-y-2">
                <p className="text-emerald-400">$ firebase status</p>
                <p className="text-slate-300">✓ Firebase Auth: Connected</p>
                <p className="text-slate-300">✓ Firestore: Connected</p>
                <p className="text-slate-300">✓ User ID: {userId}</p>
                <p className="text-slate-300">
                  ✓ Projects loaded: {projects.length}
                </p>
                <p className="text-emerald-400 mt-4">$ system info</p>
                <p className="text-slate-300">
                  Total Projects: {systemStats.totalProjects}
                </p>
                <p className="text-slate-300">
                  Active Projects: {systemStats.activeProjects}
                </p>
                <p className="text-slate-300">
                  Total Users: {systemStats.totalUsers}
                </p>
                <p className="text-slate-300">Environment: Production</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="pt-28 pb-16 px-6 md:px-12 flex-grow">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-3 rounded-xl shadow-lg">
                  <Shield size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-1">
                    Admin Dashboard
                  </h1>
                  <p className="text-slate-600">
                    Panel de administración de Filma Workspace
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => loadAdminData()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                  title="Recargar datos"
                >
                  <RefreshCw size={16} />
                  Recargar
                </button>
                <button
                  onClick={() => setShowDebugPanel(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <Terminal size={16} />
                  Debug
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
                >
                  <Plus size={16} />
                  Crear Proyecto
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-blue-600 text-white p-3 rounded-xl shadow-md">
                    <Database size={20} />
                  </div>
                  <div className="text-3xl font-bold text-blue-700">
                    {systemStats.totalProjects}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Total Proyectos
                </h3>
                <p className="text-xs text-blue-700">En toda la plataforma</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-md">
                    <Activity size={20} />
                  </div>
                  <div className="text-3xl font-bold text-emerald-700">
                    {systemStats.activeProjects}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                  Proyectos Activos
                </h3>
                <p className="text-xs text-emerald-700">En producción</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-purple-600 text-white p-3 rounded-xl shadow-md">
                    <Users size={20} />
                  </div>
                  <div className="text-3xl font-bold text-purple-700">
                    {systemStats.totalUsers}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-purple-900 mb-1">
                  Usuarios Totales
                </h3>
                <p className="text-xs text-purple-700">En la plataforma</p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-amber-600 text-white p-3 rounded-xl shadow-md">
                    <Zap size={20} />
                  </div>
                  <div className="text-3xl font-bold text-amber-700">
                    {systemStats.recentActivity}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-amber-900 mb-1">
                  Actividad Reciente
                </h3>
                <p className="text-xs text-amber-700">Últimas 24 horas</p>
              </div>
            </div>
          </header>

          <div>
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Buscar proyectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div className="relative">
                <Filter
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                  className="pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none text-sm appearance-none bg-white"
                >
                  <option value="all">Todas las fases</option>
                  <option value="Desarrollo">Desarrollo</option>
                  <option value="Preproducción">Preproducción</option>
                  <option value="Rodaje">Rodaje</option>
                  <option value="Postproducción">Postproducción</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="text-center py-16">
                <Database size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">
                  {projects.length === 0
                    ? "No hay proyectos en la plataforma"
                    : "No se encontraron proyectos con los filtros aplicados"}
                </p>
                {projects.length === 0 && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    Crear primer proyecto
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-600">
                    Mostrando {filteredProjects.length} de {projects.length}{" "}
                    {projects.length === 1 ? "proyecto" : "proyectos"}
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-slate-900 text-white p-2 rounded-lg shadow-md">
                              <Folder size={18} />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
                              {project.name}
                            </h2>
                          </div>

                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span
                              className={`text-xs font-medium text-white rounded-full px-3 py-1.5 bg-gradient-to-r ${
                                phaseColors[project.phase]
                              } shadow-sm`}
                            >
                              {project.phase}
                            </span>
                            {project.memberCount !== undefined && (
                              <span className="text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5 flex items-center gap-1">
                                <Users size={12} />
                                {project.memberCount}
                              </span>
                            )}
                            {project.genre && (
                              <span className="text-xs font-medium text-purple-700 bg-purple-100 border border-purple-200 rounded-full px-3 py-1.5">
                                {project.genre}
                              </span>
                            )}
                          </div>

                          {project.productionCompanies &&
                            project.productionCompanies.length > 0 && (
                              <div className="mt-3 text-xs text-slate-600 flex items-center gap-1">
                                <Building2 size={12} />
                                {project.productionCompanies.join(", ")}
                              </div>
                            )}

                          {project.description && (
                            <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <Link href={`/admin/project/${project.id}`}>
                          <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors">
                            <Eye size={14} />
                            Ver
                          </button>
                        </Link>
                        <Link href={`/project/${project.id}/config`}>
                          <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium transition-colors">
                            <Edit size={14} />
                            Editar
                          </button>
                        </Link>
                        <button
                          onClick={() =>
                            handleDeleteProject(project.id, project.name)
                          }
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
