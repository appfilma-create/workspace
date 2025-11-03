// ===== UTILIDADES DE FORMATEO PARA TEAM =====

import { MemberStatus } from "@/types/team";

// Formatear fecha
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Formatear fecha y hora
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Formatear hora (HH:MM)
export function formatTime(time: string): string {
  if (!time) return "--:--";
  return time;
}

// Calcular horas entre dos tiempos
export function calculateHours(start: string, end: string): number {
  if (!start || !end) return 0;

  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return (endMinutes - startMinutes) / 60;
}

// Calcular total de horas de un parte diario
export function calculateDailyHours(
  morningIn?: string,
  lunchOut?: string,
  afternoonIn?: string,
  eveningOut?: string
): { total: number; regular: number; overtime: number } {
  let totalMinutes = 0;

  // Calcular turno de mañana
  if (morningIn && lunchOut) {
    const morning = calculateHours(morningIn, lunchOut);
    totalMinutes += morning * 60;
  }

  // Calcular turno de tarde
  if (afternoonIn && eveningOut) {
    const afternoon = calculateHours(afternoonIn, eveningOut);
    totalMinutes += afternoon * 60;
  }

  const totalHours = totalMinutes / 60;
  const regularHours = Math.min(totalHours, 8);
  const overtimeHours = Math.max(0, totalHours - 8);

  return {
    total: Number(totalHours.toFixed(2)),
    regular: Number(regularHours.toFixed(2)),
    overtime: Number(overtimeHours.toFixed(2)),
  };
}

// Formatear horas con decimales
export function formatHours(hours: number): string {
  return hours.toFixed(2) + " h";
}

// Colores y estilos de estado de miembro
export function getStatusStyle(status: MemberStatus): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (status) {
    case "Activo":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        border: "border-emerald-300",
        label: "Activo",
      };
    case "Inactivo":
      return {
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-300",
        label: "Inactivo",
      };
    case "Pendiente":
      return {
        bg: "bg-amber-100",
        text: "text-amber-700",
        border: "border-amber-300",
        label: "Pendiente",
      };
    default:
      return {
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-300",
        label: status,
      };
  }
}

// Obtener iniciales de un nombre
export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar teléfono español
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

// Formatear teléfono
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

// Validar DNI/NIE español
export function isValidDNI(dni: string): boolean {
  const dniRegex = /^[0-9]{8}[A-Z]$/;
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
  
  dni = dni.toUpperCase().replace(/\s/g, "");
  
  if (!dniRegex.test(dni) && !nieRegex.test(dni)) return false;

  const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
  let number = dni.slice(0, -1);
  
  // Para NIE, reemplazar la letra inicial
  if (/^[XYZ]/.test(dni)) {
    number = number.replace("X", "0").replace("Y", "1").replace("Z", "2");
  }
  
  const expectedLetter = letters[parseInt(number) % 23];
  return dni[dni.length - 1] === expectedLetter;
}

// Generar token aleatorio
export function generateToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Truncar texto
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Obtener color del departamento
export function getDepartmentColor(department: string): string {
  const colors: Record<string, string> = {
    Dirección: "bg-purple-100 text-purple-700 border-purple-300",
    Producción: "bg-blue-100 text-blue-700 border-blue-300",
    Fotografía: "bg-indigo-100 text-indigo-700 border-indigo-300",
    Cámara: "bg-cyan-100 text-cyan-700 border-cyan-300",
    Eléctricos: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Maquinaria: "bg-orange-100 text-orange-700 border-orange-300",
    Arte: "bg-pink-100 text-pink-700 border-pink-300",
    Vestuario: "bg-rose-100 text-rose-700 border-rose-300",
    Caracterización: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300",
    Sonido: "bg-emerald-100 text-emerald-700 border-emerald-300",
    Script: "bg-teal-100 text-teal-700 border-teal-300",
    Casting: "bg-violet-100 text-violet-700 border-violet-300",
    Reparto: "bg-amber-100 text-amber-700 border-amber-300",
  };

  return colors[department] || "bg-slate-100 text-slate-700 border-slate-300";
}