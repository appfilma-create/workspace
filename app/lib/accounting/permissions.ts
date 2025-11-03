// ===== SISTEMA DE PERMISOS =====

import { UserRole, PurchaseOrder } from "@/app/types/accounting";

// Puede crear POs
export function canCreatePO(role: UserRole): boolean {
  return ["HOD", "PM", "Controller", "Admin"].includes(role);
}

// Puede aprobar POs
export function canApprovePO(
  role: UserRole,
  po: PurchaseOrder,
  userDepartment?: string
): boolean {
  if (role === "HOD") {
    // HOD solo puede aprobar POs de su departamento
    return po.department === userDepartment && po.approvals.requiresHod;
  }
  if (role === "PM") {
    // PM puede aprobar si no requiere HOD o si ya fue aprobada por HOD
    return (
      !po.approvals.requiresHod ||
      (po.approvals.requiresHod && po.approvals.hod?.approved === true)
    );
  }
  if (role === "Controller" || role === "Admin") {
    // Controller puede aprobar si PM ya aprobó
    return po.approvals.pm?.approved === true;
  }
  return false;
}

// Puede retirar aprobación
export function canUnapprove(
  role: UserRole,
  po: PurchaseOrder,
  userDepartment?: string
): boolean {
  if (role === "HOD" && po.approvals.requiresHod) {
    return (
      po.department === userDepartment && po.approvals.hod?.approved === true
    );
  }
  if (role === "PM") {
    return po.approvals.pm?.approved === true;
  }
  if (role === "Controller" || role === "Admin") {
    return po.approvals.controller?.approved === true;
  }
  return false;
}

// Puede gestionar estado (cerrar/anular)
export function canManageStatus(role: UserRole): boolean {
  return ["Controller", "Admin"].includes(role);
}

// Puede codificar facturas (asignar a ítems)
export function canCodeInvoice(role: UserRole): boolean {
  return ["Controller", "Admin"].includes(role);
}

// Puede marcar facturas como pagadas
export function canMarkAsPaid(role: UserRole): boolean {
  return ["Controller", "Admin"].includes(role);
}

// Puede subir facturas
export function canUploadInvoice(role: UserRole): boolean {
  return ["HOD", "PM", "Controller", "Admin"].includes(role);
}

// Puede ver el panel de pagos
export function canAccessPayments(role: UserRole): boolean {
  return ["Controller", "Admin"].includes(role);
}

// Puede ver aprobaciones pendientes
export function canAccessApprovals(role: UserRole): boolean {
  return ["HOD", "PM", "Controller", "Admin"].includes(role);
}

// Puede editar PO
export function canEditPO(role: UserRole, po: PurchaseOrder): boolean {
  if (role === "Admin") return true;
  if (role === "Controller") return true;
  // Solo si está en estado Pendiente y no tiene aprobaciones
  return (
    po.status === "Pendiente" &&
    !po.approvals.hod?.approved &&
    !po.approvals.pm?.approved &&
    !po.approvals.controller?.approved
  );
}

// Puede eliminar PO
export function canDeletePO(role: UserRole, po: PurchaseOrder): boolean {
  if (role === "Admin") return true;
  // Solo si está en estado Pendiente y sin aprobaciones
  return (
    po.status === "Pendiente" &&
    !po.approvals.hod?.approved &&
    !po.approvals.pm?.approved &&
    !po.approvals.controller?.approved
  );
}
