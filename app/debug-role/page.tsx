"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Inter } from "next/font/google";
import { Shield, AlertCircle, CheckCircle, Database, User } from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function DebugRolePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [docExists, setDocExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.uid);
      setUserEmail(user.email);

      try {
        console.log("🔍 Buscando documento en Firestore...");
        console.log("📍 Ruta:", `users/${user.uid}`);
        
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        console.log("📄 Documento existe:", userDoc.exists());

        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log("📦 Datos del documento:", data);
          
          setDocExists(true);
          setUserRole(data.role || "no definido");
          setRawData(data);
        } else {
          console.log("❌ El documento no existe en Firestore");
          setDocExists(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error("❌ Error al obtener rol:", error);
        setDocExists(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen bg-slate-50 flex items-center justify-center ${inter.className}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm font-medium">Verificando...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className={`min-h-screen bg-slate-50 flex items-center justify-center p-4 ${inter.className}`}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            No autenticado
          </h1>
          <p className="text-sm text-slate-600 mb-4">
            Necesitas iniciar sesión para ver esta página
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Ir al login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 p-4 md:p-8 ${inter.className}`}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield size={28} className="text-white" />
              <h1 className="text-2xl font-semibold text-white">
                Debug de Roles
              </h1>
            </div>
            <p className="text-slate-300 text-sm">
              Información del usuario y su rol en Firestore
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <User size={18} className="text-blue-700" />
                <h3 className="font-semibold text-blue-900">
                  Información de Authentication
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 font-medium">UID:</span>
                  <span className="text-blue-900 font-mono text-xs">
                    {userId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 font-medium">Email:</span>
                  <span className="text-blue-900">{userEmail}</span>
                </div>
              </div>
            </div>

            {/* Firestore Status */}
            <div className={`border rounded-xl p-4 ${
              docExists 
                ? "bg-emerald-50 border-emerald-200" 
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Database size={18} className={docExists ? "text-emerald-700" : "text-red-700"} />
                <h3 className={`font-semibold ${
                  docExists ? "text-emerald-900" : "text-red-900"
                }`}>
                  Estado en Firestore
                </h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${
                    docExists ? "text-emerald-700" : "text-red-700"
                  }`}>
                    Documento existe:
                  </span>
                  <span className="flex items-center gap-2">
                    {docExists ? (
                      <>
                        <CheckCircle size={16} className="text-emerald-600" />
                        <span className="text-emerald-900 font-semibold">SÍ</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="text-red-600" />
                        <span className="text-red-900 font-semibold">NO</span>
                      </>
                    )}
                  </span>
                </div>

                {docExists && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700 font-medium">Rol actual:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        userRole === "admin"
                          ? "bg-purple-100 text-purple-700 border border-purple-300"
                          : "bg-slate-100 text-slate-700 border border-slate-300"
                      }`}>
                        {userRole}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700 font-medium">Redirección:</span>
                      <span className="text-emerald-900 font-mono text-xs">
                        {userRole === "admin" ? "/admindashboard" : "/dashboard"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Raw Data */}
            {rawData && (
              <div className="bg-slate-900 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Database size={18} />
                  Datos completos del documento
                </h3>
                <pre className="text-xs text-emerald-400 font-mono overflow-x-auto">
                  {JSON.stringify(rawData, null, 2)}
                </pre>
              </div>
            )}

            {/* Instrucciones */}
            {!docExists && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="font-semibold text-amber-900 mb-2">
                  ⚠️ El documento no existe
                </h3>
                <p className="text-sm text-amber-800 mb-3">
                  Necesitas crear el documento en Firestore con tu rol:
                </p>
                <div className="bg-white rounded-lg p-3 border border-amber-200">
                  <p className="text-xs font-mono text-slate-700 mb-2">
                    Ruta: <span className="text-amber-700 font-semibold">users/{userId}</span>
                  </p>
                  <p className="text-xs text-slate-600">Campos necesarios:</p>
                  <ul className="text-xs text-slate-600 mt-1 space-y-1">
                    <li>• email: "{userEmail}"</li>
                    <li>• role: "admin"</li>
                    <li>• displayName: "Tu nombre"</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <a
                href="/"
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium text-center transition-colors"
              >
                Volver al login
              </a>
              {docExists && userRole === "admin" && (
                <a
                  href="/admindashboard"
                  className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium text-center transition-colors"
                >
                  Ir al AdminDashboard
                </a>
              )}
              {docExists && userRole !== "admin" && (
                <a
                  href="/dashboard"
                  className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium text-center transition-colors"
                >
                  Ir al Dashboard
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copy UID Button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              navigator.clipboard.writeText(userId || "");
              alert("UID copiado al portapapeles");
            }}
            className="text-sm text-slate-600 hover:text-slate-900 underline"
          >
            Copiar UID al portapapeles
          </button>
        </div>
      </div>
    </div>
  );
}