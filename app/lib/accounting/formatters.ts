// ===== UTILIDADES DE FORMATEO =====

import { POStatus } from "@/app/types/accounting";

// Formatear moneda
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

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

// Colores y etiquetas de estado de PO
export function getStatusStyle(status: POStatus): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (status) {
    case "Aprobada":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        border: "border-emerald-300",
        label: "Aprobada",
      };
    case "Pendiente":
      return {
        bg: "bg-amber-100",
        text: "text-amber-700",
        border: "border-amber-300",
        label: "Pendiente",
      };
    case "Cerrada":
      return {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-300",
        label: "Cerrada",
      };
    case "Anulada":
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-300",
        label: "Anulada",
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

// Abreviar texto
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Generar número de PO
export function generatePONumber(year: number, sequence: number): string {
  return `PO-${year}-${String(sequence).padStart(3, "0")}`;
}

// Calcular totales de un ítem
export function calculateItemTotals(
  baseTotal: number,
  vatType: number,
  irpfPercent: number
) {
  const iva = (baseTotal * vatType) / 100;
  const irpf = (baseTotal * irpfPercent) / 100;
  const total = baseTotal + iva - irpf;

  return {
    base: baseTotal,
    iva,
    irpf,
    total,
  };
}

// Calcular disponible en un ítem
export function calculateAvailable(
  baseTotal: number,
  baseInvoiced: number
): number {
  return baseTotal - baseInvoiced;
}
