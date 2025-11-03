"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Space_Grotesk, Inter } from "next/font/google";
import { Eye, EyeOff } from "lucide-react";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const WORDS = [
  { text: "filma", x: 8, y: 12, size: 120, bold: true },
  { text: "workspace", x: 75, y: 18, size: 85, bold: false },
  { text: "workspace", x: 12, y: 38, size: 95, bold: false },
  { text: "filma", x: 78, y: 48, size: 90, bold: true },
  { text: "filma", x: 20, y: 65, size: 110, bold: true },
  { text: "workspace", x: 72, y: 72, size: 88, bold: false },
  { text: "workspace", x: 15, y: 88, size: 80, bold: false },
  { text: "filma", x: 82, y: 85, size: 115, bold: true },
];

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    const handleMouseLeave = () => {
      setMousePos({ x: -100, y: -100 });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    // Cargar email recordado
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  const calculateOffset = (wordX: number, wordY: number) => {
    const dx = wordX - mousePos.x;
    const dy = wordY - mousePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 25;

    if (distance < maxDistance && distance > 0) {
      const force = (maxDistance - distance) / maxDistance;
      const pushX = (dx / distance) * force * 50;
      const pushY = (dy / distance) * force * 50;
      return { x: pushX, y: pushY };
    }
    return { x: 0, y: 0 };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Guardar email si el usuario marcó "recordar"
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Verificar el rol del usuario en Firestore
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userRole = userDoc.exists() ? userDoc.data().role : "user";

        console.log("👤 Usuario autenticado:", user.uid);
        console.log("🎭 Rol del usuario:", userRole);

        // Redirigir según el tipo de usuario
        if (userRole === "admin") {
          console.log("✅ Redirigiendo a AdminDashboard");
          router.push("/admindashboard");
        } else {
          console.log("✅ Redirigiendo a Dashboard normal");
          router.push("/dashboard");
        }
      } catch (roleError) {
        console.error(
          "⚠️ Error al obtener rol, usando dashboard normal:",
          roleError
        );
        // Si hay error al obtener el rol, redirigir al dashboard normal
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Error en login:", error);

      let errorMessage = "Error al iniciar sesión";

      if (error.code === "auth/invalid-credential") {
        errorMessage = "Email o contraseña incorrectos";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No existe una cuenta con este email";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Esta cuenta ha sido deshabilitada";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Demasiados intentos. Intenta más tarde";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden ${inter.className}`}
    >
      <div
        className={`absolute inset-0 select-none pointer-events-none ${grotesk.className}`}
      >
        {WORDS.map((word, i) => {
          const offset = calculateOffset(word.x, word.y);
          return (
            <div
              key={i}
              className={`absolute font-bold tracking-tighter ${
                word.text === "workspace"
                  ? "text-slate-500 opacity-[0.035]"
                  : "text-slate-900 opacity-[0.035]"
              }`}
              style={{
                left: `${word.x}%`,
                top: `${word.y}%`,
                fontSize: `${word.size}px`,
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${
                  ((i % 3) - 1) * 12
                }deg)`,
                transition: "transform 0.3s ease-out",
              }}
            >
              {word.text}
            </div>
          );
        })}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/50 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-1">
              Iniciar sesión
            </h2>
            <p className="text-sm text-slate-500">
              Accede a tu espacio de trabajo
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 text-slate-900"
          >
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                disabled={loading}
                className="w-full border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-400/30 rounded-lg px-4 py-2.5 text-sm bg-white outline-none transition-all placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-400/30 rounded-lg px-4 py-2.5 pr-10 text-sm bg-white outline-none transition-all placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-400/30 focus:ring-offset-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors select-none">
                  Recordar mi email
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-sm text-slate-600 hover:text-slate-900 hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 text-white font-medium rounded-lg py-3 text-sm
              bg-slate-900
              hover:bg-gradient-to-r hover:from-indigo-500 hover:via-blue-600 hover:to-sky-500
              transition-all duration-500 ease-out
              focus:ring-2 focus:ring-indigo-300 focus:outline-none shadow-md hover:shadow-lg active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900 disabled:active:scale-100"
            >
              {loading ? "Iniciando sesión" : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
