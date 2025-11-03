// ===== SISTEMA DE PERMISOS PARA TEAM =====

export type UserRole = "Admin" | "Coordinator" | "HOD" | "Member" | "Viewer";

// Puede gestionar equipo (altas y bajas)
export function canManageTeam(role: UserRole): boolean {
  return ["Admin", "Coordinator"].includes(role);
}

// Puede ver equipo completo
export function canViewTeam(role: UserRole): boolean {
  return ["Admin", "Coordinator", "HOD"].includes(role);
}

// Puede enviar documentación
export function canSendDocuments(role: UserRole): boolean {
  return ["Admin", "Coordinator"].includes(role);
}

// Puede crear modelos de envío
export function canCreateTemplates(role: UserRole): boolean {
  return ["Admin", "Coordinator"].includes(role);
}

// Puede ver partes diarios
export function canViewReports(role: UserRole): boolean {
  return ["Admin", "Coordinator", "HOD"].includes(role);
}

// Puede aprobar partes diarios
export function canApproveReports(role: UserRole): boolean {
  return ["Admin", "Coordinator"].includes(role);
}

// Puede generar tokens de formularios
export function canGenerateTokens(role: UserRole): boolean {
  return ["Admin", "Coordinator"].includes(role);
}

// Puede editar miembro del equipo
export function canEditMember(role: UserRole): boolean {
  return ["Admin", "Coordinator"].includes(role);
}

// Puede eliminar miembro del equipo
export function canDeleteMember(role: UserRole): boolean {
  return ["Admin", "Coordinator"].includes(role);
}

// Puede exportar listados
export function canExportLists(role: UserRole): boolean {
  return ["Admin", "Coordinator", "HOD"].includes(role);
}

// Puede ver datos sensibles (DNI, IBAN, etc.)
export function canViewSensitiveData(role: UserRole): boolean {
  return ["Admin", "Coordinator"].includes(role);
}