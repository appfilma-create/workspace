// ===== HOOK PARA GESTIONAR POs =====

import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { PurchaseOrder, POItem } from "@/app/types/accounting";

export function usePOs(projectId: string) {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const posRef = collection(db, "projects", projectId, "pos");
    const q = query(posRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const posData: PurchaseOrder[] = [];

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();

          // Cargar items de la PO
          const itemsRef = collection(
            db,
            "projects",
            projectId,
            "pos",
            docSnap.id,
            "items"
          );
          const itemsSnap = await getDocs(itemsRef);
          const items: POItem[] = itemsSnap.docs.map(
            (itemDoc) =>
              ({
                id: itemDoc.id,
                ...itemDoc.data(),
              } as POItem)
          );

          // Calcular totales
          const totals = items.reduce(
            (acc, item) => {
              const base = item.baseTotal;
              const iva = (base * item.vatType) / 100;
              const irpf = (base * item.irpfPercent) / 100;
              acc.base += base;
              acc.iva += iva;
              acc.irpf += irpf;
              acc.total += base + iva - irpf;
              return acc;
            },
            { base: 0, iva: 0, irpf: 0, total: 0 }
          );

          posData.push({
            id: docSnap.id,
            ...data,
            items,
            totalBase: totals.base,
            totalIVA: totals.iva,
            totalIRPF: totals.irpf,
            totalAmount: totals.total,
          } as PurchaseOrder);
        }

        setPos(posData);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading POs:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  return { pos, loading, error };
}

// Crear nueva PO
export async function createPO(
  projectId: string,
  poData: {
    supplier: string;
    department: string;
    type: "Servicios" | "Bienes";
    description: string;
    requiresHod: boolean;
    createdBy: string;
  },
  items: {
    accountCode: string;
    description: string;
    baseTotal: number;
    vatType: number;
    irpfPercent: number;
  }[]
): Promise<string> {
  // Generar número de PO
  const year = new Date().getFullYear();
  const posRef = collection(db, "projects", projectId, "pos");
  const snapshot = await getDocs(posRef);
  const sequence = snapshot.size + 1;
  const poNumber = `PO-${year}-${String(sequence).padStart(3, "0")}`;

  // Crear PO
  const poRef = await addDoc(posRef, {
    number: poNumber,
    supplier: poData.supplier,
    department: poData.department,
    type: poData.type,
    description: poData.description,
    status: "Pendiente",
    createdBy: poData.createdBy,
    createdAt: serverTimestamp(),
    version: 1,
    approvals: {
      requiresHod: poData.requiresHod,
      hod: { approved: false, name: "", date: "" },
      pm: { approved: false, name: "", date: "" },
      controller: { approved: false, name: "", date: "" },
    },
  });

  // Crear items
  const itemsRef = collection(
    db,
    "projects",
    projectId,
    "pos",
    poRef.id,
    "items"
  );
  for (const item of items) {
    await addDoc(itemsRef, {
      ...item,
      baseInvoiced: 0,
      createdAt: serverTimestamp(),
    });
  }

  return poRef.id;
}

// Actualizar PO
export async function updatePO(
  projectId: string,
  poId: string,
  updates: Partial<PurchaseOrder>
): Promise<void> {
  const poRef = doc(db, "projects", projectId, "pos", poId);
  await updateDoc(poRef, {
    ...updates,
    modifiedAt: serverTimestamp(),
  });
}

// Eliminar PO
export async function deletePO(projectId: string, poId: string): Promise<void> {
  // Eliminar items primero
  const itemsRef = collection(db, "projects", projectId, "pos", poId, "items");
  const itemsSnap = await getDocs(itemsRef);
  for (const itemDoc of itemsSnap.docs) {
    await deleteDoc(itemDoc.ref);
  }

  // Eliminar PO
  const poRef = doc(db, "projects", projectId, "pos", poId);
  await deleteDoc(poRef);
}

// Aprobar/Desaprobar PO
export async function toggleApprovalPO(
  projectId: string,
  poId: string,
  role: "hod" | "pm" | "controller",
  approve: boolean,
  userName: string,
  currentApprovals: any
): Promise<void> {
  const now = new Date().toISOString();
  const updated = { ...currentApprovals };

  updated[role] = approve
    ? { approved: true, name: userName, date: now }
    : { approved: false, name: "", date: "" };

  // Determinar si está completamente aprobada
  const fullyApproved =
    (!updated.requiresHod || updated.hod?.approved) &&
    updated.pm?.approved &&
    updated.controller?.approved;

  const poRef = doc(db, "projects", projectId, "pos", poId);
  await updateDoc(poRef, {
    approvals: updated,
    status: fullyApproved ? "Aprobada" : "Pendiente",
    modifiedAt: serverTimestamp(),
  });
}

// Cambiar estado de PO (cerrar/anular/reabrir)
export async function changeStatusPO(
  projectId: string,
  poId: string,
  action: "cerrar" | "anular" | "reabrir" | "desanular",
  userName: string
): Promise<void> {
  let newStatus: "Pendiente" | "Aprobada" | "Cerrada" | "Anulada" = "Pendiente";

  if (action === "cerrar") newStatus = "Cerrada";
  if (action === "anular") newStatus = "Anulada";
  if (action === "reabrir" || action === "desanular") newStatus = "Pendiente";

  const poRef = doc(db, "projects", projectId, "pos", poId);
  await updateDoc(poRef, {
    status: newStatus,
    modifiedBy: userName,
    modifiedAt: serverTimestamp(),
  });
}
