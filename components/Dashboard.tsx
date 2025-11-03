"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import {
  Folder,
  FileText,
  Users,
  Settings,
  Search,
  Filter,
  Calendar,
  Clock,
  Film,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, getDocs, getDoc, doc } from "firebase/firestore";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

const phaseColors: Record<string, string> = {
  Desarrollo: "from-sky-400 to-sky-600",
  Preproducción: "from-amber-400 to-amber-600",
  Rodaje: "from-indigo-400 to-indigo-600",
  Postproducción: "from-purple-400 to-purple-600",
  Finalizado: "from-emerald-400 to-emerald-600",
};

const rolePermissions: Record<string, string[]> = {
  "Productor Ejecutivo": ["config", "accounting", "team"],
  "Director de Producción": ["config", "accounting", "team"],
  "Jefe de Producción": ["accounting", "team"],
  "Ayudante de Producción": ["team"],
  Director: ["team"],
  "Director de Fotografía": ["team"],
  Técnico: ["team"],

  Administrador: ["config", "accounting", "team"],
  Producción: ["accounting", "team"],
};

interface Project {
  id: string;
  name: string;
  phase: string;
  role: string;
  createdAt: any;
  addedAt: any;
}

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Usuario");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "phase">("recent");
  const [countAnimation, setCountAnimation] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      } else {
        setUserId(user.uid);
        setUserName(user.displayName || user.email?.split("@")[0] || "Usuario");
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const loadProjects = async () => {
      try {
        console.log("🔍 Usuario ID:", userId);

        const userProjectsRef = collection(
          db,
          `userProjects/${userId}/projects`
        );
        const userProjectsSnapshot = await getDocs(userProjectsRef);

        console.log(
          "📊 Proyectos del usuario encontrados:",
          userProjectsSnapshot.size
        );

        const projectsData: Project[] = [];

        for (const userProjectDoc of userProjectsSnapshot.docs) {
          const userProjectData = userProjectDoc.data();
          const projectId = userProjectDoc.id;

          console.log("👤 Proyecto del usuario:", projectId, userProjectData);

          const projectRef = doc(db, "projects", projectId);
          const projectSnapshot = await getDoc(projectRef);

          console.log("📁 Proyecto:", projectId, projectSnapshot.exists());

          if (projectSnapshot.exists()) {
            const projectData = projectSnapshot.data();

            console.log("✅ Proyecto cargado:", projectData);

            projectsData.push({
              id: projectSnapshot.id,
              name: projectData.name,
              phase: projectData.phase,
              role: userProjectData.role,
              createdAt: projectData.createdAt,
              addedAt: userProjectData.addedAt,
            });
          }
        }

        projectsData.sort((a, b) => {
          const dateA = a.addedAt?.toMillis() || 0;
          const dateB = b.addedAt?.toMillis() || 0;
          return dateB - dateA;
        });

        console.log("🎯 Proyectos finales:", projectsData);
        setProjects(projectsData);
        setFilteredProjects(projectsData);
        setLoading(false);
        setInitialLoad(false);

        // Trigger animation
        setTimeout(() => setCountAnimation(true), 300);
      } catch (error) {
        console.error("❌ Error al cargar proyectos:", error);
        setLoading(false);
        setInitialLoad(false);
      }
    };

    loadProjects();
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

    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "phase":
        filtered.sort((a, b) => a.phase.localeCompare(b.phase));
        break;
      case "recent":
      default:
        filtered.sort((a, b) => {
          const dateA = a.addedAt?.toMillis() || 0;
          const dateB = b.addedAt?.toMillis() || 0;
          return dateB - dateA;
        });
    }

    setFilteredProjects(filtered);
  }, [searchTerm, selectedPhase, sortBy, projects]);

  if (loading && initialLoad) {
    return (
      <div className={`flex flex-col min-h-screen bg-white ${inter.className}`}>
        <main className="pt-28 pb-16 px-6 md:px-12 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm font-medium">
              Cargando tus proyectos
            </p>
          </div>
        </main>
      </div>
    );
  }

  const activeProjects = projects.filter(
    (p) => p.phase !== "Finalizado"
  ).length;
  const finishedProjects = projects.filter(
    (p) => p.phase === "Finalizado"
  ).length;

  return (
    <div className={`flex flex-col min-h-screen bg-white ${inter.className}`}>
      <main className="pt-28 pb-16 px-6 md:px-12 flex-grow">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-2">
                  Tu espacio de trabajo
                </h1>
                <p className="text-slate-600">
                  Gestiona todos tus proyectos en un solo lugar
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-blue-600 text-white p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                    <Folder size={24} />
                  </div>
                  <div
                    className={`text-3xl font-bold text-blue-700 transition-all duration-500 ${
                      countAnimation
                        ? "scale-100 opacity-100"
                        : "scale-75 opacity-0"
                    }`}
                  >
                    {projects.length}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Total de proyectos
                </h3>
                <p className="text-xs text-blue-700">
                  Todos tus proyectos asignados
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
                  <div
                    className={`text-3xl font-bold text-emerald-700 transition-all duration-500 delay-100 ${
                      countAnimation
                        ? "scale-100 opacity-100"
                        : "scale-75 opacity-0"
                    }`}
                  >
                    {activeProjects}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                  Proyectos activos
                </h3>
                <p className="text-xs text-emerald-700">
                  En desarrollo o producción
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-purple-600 text-white p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                    <Film size={24} />
                  </div>
                  <div
                    className={`text-3xl font-bold text-purple-700 transition-all duration-500 delay-200 ${
                      countAnimation
                        ? "scale-100 opacity-100"
                        : "scale-75 opacity-0"
                    }`}
                  >
                    {finishedProjects}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-purple-900 mb-1">
                  Finalizados
                </h3>
                <p className="text-xs text-purple-700">Proyectos completados</p>
              </div>
            </div>
          </header>

          {projects.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Folder size={40} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-800 mb-3">
                  No tienes proyectos asignados
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Aún no has sido asignado a ningún proyecto. Contacta con tu
                  administrador para obtener acceso o espera a que te añadan a
                  un equipo.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Clock size={16} />
                  <span>Los proyectos aparecerán aquí cuando seas añadido</span>
                </div>
              </div>
            </div>
          ) : (
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

                <div className="flex gap-3">
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

                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none text-sm appearance-none bg-white"
                    >
                      <option value="recent">Más recientes</option>
                      <option value="name">Por nombre</option>
                      <option value="phase">Por fase</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-slate-500">
                    No se encontraron proyectos con los filtros aplicados
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedPhase("all");
                    }}
                    className="mt-4 text-sm text-slate-700 hover:text-slate-900 underline"
                  >
                    Limpiar filtros
                  </button>
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
                    {filteredProjects.map((project) => {
                      const permissions = rolePermissions[project.role] || [];

                      return (
                        <div
                          key={project.id}
                          className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1"
                        >
                          <div className="flex items-start justify-between mb-5">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="bg-slate-900 text-white p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                                  <Folder size={18} />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
                                  {project.name}
                                </h2>
                              </div>

                              <div className="flex items-center gap-2 mt-3">
                                <span className="text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5">
                                  {project.role}
                                </span>
                                <span
                                  className={`text-xs font-medium text-white rounded-full px-3 py-1.5 bg-gradient-to-r ${
                                    phaseColors[project.phase]
                                  } shadow-sm`}
                                >
                                  {project.phase}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`grid gap-3 ${
                              permissions.length === 3
                                ? "grid-cols-3"
                                : permissions.length === 2
                                ? "grid-cols-2"
                                : "grid-cols-1"
                            }`}
                          >
                            {permissions.includes("config") && (
                              <Link href={`/project/${project.id}/config`}>
                                <div className="group/card border border-slate-200 rounded-xl p-4 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer bg-white flex flex-col items-center justify-center h-24">
                                  <div className="bg-slate-100 text-slate-700 p-2.5 rounded-lg group-hover/card:bg-slate-200 group-hover/card:scale-110 transition-all">
                                    <Settings size={18} />
                                  </div>
                                  <h3 className="text-xs font-medium text-slate-800 mt-2">
                                    Config
                                  </h3>
                                </div>
                              </Link>
                            )}

                            {permissions.includes("accounting") && (
                              <Link href={`/project/${project.id}/accounting`}>
                                <div className="group/card border border-slate-200 rounded-xl p-4 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-white flex flex-col items-center justify-center h-24">
                                  <div className="bg-indigo-100 text-indigo-700 p-2.5 rounded-lg group-hover/card:bg-indigo-200 group-hover/card:scale-110 transition-all">
                                    <FileText size={18} />
                                  </div>
                                  <h3 className="text-xs font-medium text-slate-800 mt-2">
                                    Accounting
                                  </h3>
                                </div>
                              </Link>
                            )}

                            {permissions.includes("team") && (
                              <Link href={`/project/${project.id}/team`}>
                                <div className="group/card border border-slate-200 rounded-xl p-4 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer bg-white flex flex-col items-center justify-center h-24">
                                  <div className="bg-amber-100 text-amber-700 p-2.5 rounded-lg group-hover/card:bg-amber-200 group-hover/card:scale-110 transition-all">
                                    <Users size={18} />
                                  </div>
                                  <h3 className="text-xs font-medium text-slate-800 mt-2">
                                    Team
                                  </h3>
                                </div>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
