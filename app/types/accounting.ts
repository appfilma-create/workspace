// ===== TIPOS PARA EL SISTEMA DE CONTABILIDAD =====

import { Timestamp } from "firebase/firestore";

// ----- Aprobaciones -----
export interface Approval {
  approved: boolean;
  name: string;
  date: string;
}

export interface POApprovals {
  requiresHod: boolean;
  hod?: Approval;
  pm?: Approval;
  controller?: Approval;
}

// ----- Estados -----
export type POStatus = "Pendiente" | "Aprobada" | "Cerrada" | "Anulada";
export type InvoiceStatus = "Pendiente" | "Codificada" | "Pagada" | "Cancelada";
export type POType = "Servicios" | "Bienes";

// ----- Roles -----
export type UserRole = "HOD" | "PM" | "Controller" | "Admin" | "Viewer";

// ----- Item de PO -----
export interface POItem {
  id: string;
  accountCode: string;
  description: string;
  baseTotal: number;
  baseInvoiced: number;
  vatType: number; // 0, 4, 10, 21
  irpfPercent: number;
  createdAt: Timestamp;
}

// ----- Purchase Order -----
export interface PurchaseOrder {
  id: string;
  number: string;
  supplier: string;
  department: string;
  type: POType;
  description: string;
  status: POStatus;
  createdBy: string;
  createdAt: Timestamp;
  modifiedAt?: Timestamp;
  modifiedBy?: string;
  version: number;
  approvals: POApprovals;
  // Campos calculados (no en Firebase)
  items?: POItem[];
  totalBase?: number;
  totalIVA?: number;
  totalIRPF?: number;
  totalAmount?: number;
}

// ----- Factura -----
export interface Invoice {
  id: string;
  poId: string;
  poNumber: string;
  invoiceNumber: string;
  supplier: string;
  description: string;
  reportedTotal: number;
  baseAmount: number;
  totalAmount: number;
  taxPercent: number;
  irpfPercent: number;
  dueDate: string;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  mimeType: string;
  coded: boolean;
  paid: boolean;
  canceled: boolean;
  allocations: Record<string, number>; // itemId -> amount
  createdAt: Timestamp;
  createdBy: string;
  modifiedAt?: Timestamp;
}

// ----- Proveedor -----
export interface Supplier {
  id: string;
  name: string;
  nif: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Timestamp;
}

// ----- Cuenta contable -----
export interface Account {
  id: string;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: Timestamp;
}

// ----- Departamento -----
export interface Department {
  id: string;
  name: string;
  hod?: string; // nombre del HOD
  budget?: number;
  createdAt: Timestamp;
}

// ----- Resumen financiero -----
export interface FinancialSummary {
  totalBudget: number;
  totalSpent: number;
  totalPending: number;
  totalAvailable: number;
  poCount: number;
  invoiceCount: number;
}

// ----- Formulario de creación de PO -----
export interface POFormData {
  supplier: string;
  department: string;
  type: POType;
  description: string;
  requiresHod: boolean;
  items: {
    accountCode: string;
    description: string;
    baseTotal: number;
    vatType: number;
    irpfPercent: number;
  }[];
}

// ----- Formulario de subida de factura -----
export interface InvoiceUploadFormData {
  poId: string;
  poNumber: string;
  supplier: string;
  description: string;
  reportedTotal: number;
  dueDate: string;
  file: File | null;
}
