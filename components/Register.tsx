"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Space_Grotesk, Inter } from "next/font/google";

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

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    inviteCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { email, password, name, inviteCode } = formData;

    try {
      if (inviteCode.trim() !== "FILMA2025") {
        setError("Código de invitación incorrecto");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        setLoading(false);
        return;
      }

      if (!name.trim()) {
        setError("El nombre es obligatorio");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name.trim(),
      });

      await user.reload();

      console.log("Usuario creado:", user.uid, name);
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Error en registro:", error);

      let errorMessage = "Error al crear la cuenta";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email ya está registrado";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido";
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Registro deshabilitado. Contacta al administrador";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña es demasiado débil";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Error de conexión. Verifica tu internet";
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
              Crear cuenta
            </h2>
            <p className="text-sm text-slate-500">
              Únete a tu espacio de trabajo
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 text-slate-900"
          >
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Nombre completo
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                disabled={loading}
                className="w-full border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-400/30 rounded-lg px-4 py-2.5 text-sm bg-white outline-none transition-all placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@correo.com"
                disabled={loading}
                className="w-full border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-400/30 rounded-lg px-4 py-2.5 text-sm bg-white outline-none transition-all placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className="w-full border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-400/30 rounded-lg px-4 py-2.5 text-sm bg-white outline-none transition-all placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Código de invitación
              </label>
              <input
                type="text"
                name="inviteCode"
                required
                value={formData.inviteCode}
                onChange={handleChange}
                placeholder="Código proporcionado"
                disabled={loading}
                className="w-full border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-400/30 rounded-lg px-4 py-2.5 text-sm bg-white outline-none transition-all placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
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
              hover:bg-gradient-to-r hover:from-amber-500 hover:via-orange-500 hover:to-rose-500
              transition-all duration-500 ease-out
              focus:ring-2 focus:ring-amber-300 focus:outline-none shadow-md hover:shadow-lg active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900 disabled:active:scale-100"
            >
              {loading ? "Creando cuenta" : "Crear cuenta"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/"
              className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
