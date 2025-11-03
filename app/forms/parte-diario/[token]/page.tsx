"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Inter } from "next/font/google";
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Edit3,
  Trash2,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function ParteDiarioFormPage() {
  const params = useParams();
  const token = params?.token as string;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Datos del formulario
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    morningIn: "",
    lunchOut: "",
    afternoonIn: "",
    eveningOut: "",
    observations: "",
  });

  // Datos del trabajador (se cargarían desde Firebase con el token)
  const [workerData] = useState({
    name: "Juan Pérez",
    project: "El Ahogado",
  });

  // Calcular horas totales
  const calculateHours = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return (endMinutes - startMinutes) / 60;
  };

  const morningHours = calculateHours(
    formData.morningIn,
    formData.lunchOut
  );
  const afternoonHours = calculateHours(
    formData.afternoonIn,
    formData.eveningOut
  );
  const totalHours = morningHours + afternoonHours;
  const regularHours = Math.min(totalHours, 8);
  const overtimeHours = Math.max(0, totalHours - 8);

  // Canvas para firma
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configurar canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.morningIn || !formData.lunchOut || !formData.afternoonIn || !formData.eveningOut) {
      alert("Por favor, completa todos los horarios");
      return;
    }

    if (!hasSignature) {
      alert("Por favor, firma el parte diario");
      return;
    }

    try {
      setSubmitting(true);

      // Convertir firma a base64
      const canvas = canvasRef.current;
      const signatureData = canvas?.toDataURL("image/png");

      // TODO: Guardar en Firebase
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Parte enviado:", {
        ...formData,
        totalHours,
        regularHours,
        overtimeHours,
        signature: signatureData,
        token,
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error al enviar parte:", error);
      alert("Error al enviar el parte diario");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`flex flex-col min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 ${inter.className}`}>
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              ¡Parte enviado correctamente!
            </h1>
            <p className="text-slate-600 mb-6">
              Tu parte diario ha sido registrado. Gracias por tu colaboración.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800">
                <strong>{totalHours.toFixed(2)} horas</strong> registradas
              </p>
              {overtimeHours > 0 && (
                <p className="text-xs text-emerald-700 mt-1">
                  Incluye {overtimeHours.toFixed(2)}h extras
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 ${inter.className}`}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Parte Diario
              </h1>
              <p className="text-xs text-slate-600">{workerData.project}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow p-6">
        <div className="max-w-3xl mx-auto">
          {/* Info del trabajador */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {workerData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {workerData.name}
                </h2>
                <p className="text-sm text-slate-600">
                  Completa tu parte diario
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <AlertCircle size={16} />
                <p className="text-sm font-medium">
                  Rellena todos los campos y firma para enviar
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fecha */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Fecha
              </label>
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-base"
                  required
                />
              </div>
            </div>

            {/* Horarios */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Horarios de trabajo
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Entrada mañana *
                  </label>
                  <input
                    type="time"
                    value={formData.morningIn}
                    onChange={(e) =>
                      setFormData({ ...formData, morningIn: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Salida comida *
                  </label>
                  <input
                    type="time"
                    value={formData.lunchOut}
                    onChange={(e) =>
                      setFormData({ ...formData, lunchOut: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Entrada tarde *
                  </label>
                  <input
                    type="time"
                    value={formData.afternoonIn}
                    onChange={(e) =>
                      setFormData({ ...formData, afternoonIn: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Salida final *
                  </label>
                  <input
                    type="time"
                    value={formData.eveningOut}
                    onChange={(e) =>
                      setFormData({ ...formData, eveningOut: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-base"
                    required
                  />
                </div>
              </div>

              {/* Resumen de horas */}
              {totalHours > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-blue-700 mb-1">Total horas</p>
                    <p className="text-xl font-bold text-blue-700">
                      {totalHours.toFixed(1)}h
                    </p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-emerald-700 mb-1">Normales</p>
                    <p className="text-xl font-bold text-emerald-700">
                      {regularHours.toFixed(1)}h
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-amber-700 mb-1">Extras</p>
                    <p className="text-xl font-bold text-amber-700">
                      {overtimeHours.toFixed(1)}h
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Observaciones */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Observaciones (opcional)
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) =>
                  setFormData({ ...formData, observations: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-base resize-none"
                rows={3}
                placeholder="Incidencias, comentarios adicionales..."
              />
            </div>

            {/* Firma */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-900">
                  Firma *
                </label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <Trash2 size={14} />
                  Limpiar
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-48 touch-none cursor-crosshair"
                  style={{ touchAction: "none" }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <Edit3 size={12} />
                Firma aquí con el dedo o el ratón
              </p>
            </div>

            {/* Botón enviar */}
            <button
              type="submit"
              disabled={submitting || !hasSignature}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Enviar parte diario
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <div className="bg-white border-t border-slate-200 px-6 py-4 text-center">
        <p className="text-xs text-slate-500">
          Este formulario es confidencial y está protegido
        </p>
      </div>
    </div>
  );
}