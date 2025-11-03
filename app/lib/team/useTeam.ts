// ===== HOOKS PARA GESTIONAR TEAM =====

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
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TeamMember, DailyReport, SendingTemplate, DocumentSend } from "@/types/team";

// Hook para cargar miembros del equipo
export function useTeamMembers(projectId: string) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const membersRef = collection(db, "projects", projectId, "team", "members");
    const q = query(membersRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const membersData: TeamMember[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as TeamMember));

        setMembers(membersData);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading team members:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  return { members, loading, error };
}

// Hook para cargar partes diarios
export function useDailyReports(projectId: string, dateFilter?: string) {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const reportsRef = collection(db, "projects", projectId, "team", "dailyReports");
    let q = query(reportsRef, orderBy("submittedAt", "desc"));

    if (dateFilter) {
      q = query(reportsRef, where("date", "==", dateFilter), orderBy("submittedAt", "desc"));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reportsData: DailyReport[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as DailyReport));

        setReports(reportsData);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading daily reports:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId, dateFilter]);

  return { reports, loading, error };
}

// Hook para cargar modelos de envío
export function useSendingTemplates(projectId: string) {
  const [templates, setTemplates] = useState<SendingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const templatesRef = collection(db, "projects", projectId, "team", "sendingTemplates");
    const q = query(templatesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const templatesData: SendingTemplate[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as SendingTemplate));

        setTemplates(templatesData);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading templates:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  return { templates, loading, error };
}

// Hook para cargar historial de envíos
export function useDocumentSends(projectId: string) {
  const [sends, setSends] = useState<DocumentSend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const sendsRef = collection(db, "projects", projectId, "team", "documentSends");
    const q = query(sendsRef, orderBy("sentAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const sendsData: DocumentSend[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as DocumentSend));

        setSends(sendsData);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading document sends:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  return { sends, loading, error };
}

// Crear nuevo miembro
export async function createTeamMember(
  projectId: string,
  memberData: Omit<TeamMember, "id" | "createdAt">
): Promise<string> {
  const membersRef = collection(db, "projects", projectId, "team", "members");
  
  const docRef = await addDoc(membersRef, {
    ...memberData,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

// Actualizar miembro
export async function updateTeamMember(
  projectId: string,
  memberId: string,
  updates: Partial<TeamMember>
): Promise<void> {
  const memberRef = doc(db, "projects", projectId, "team", "members", memberId);
  await updateDoc(memberRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Eliminar miembro
export async function deleteTeamMember(
  projectId: string,
  memberId: string
): Promise<void> {
  const memberRef = doc(db, "projects", projectId, "team", "members", memberId);
  await deleteDoc(memberRef);
}

// Crear modelo de envío
export async function createSendingTemplate(
  projectId: string,
  templateData: Omit<SendingTemplate, "id" | "createdAt" | "useCount">
): Promise<string> {
  const templatesRef = collection(db, "projects", projectId, "team", "sendingTemplates");
  
  const docRef = await addDoc(templatesRef, {
    ...templateData,
    createdAt: serverTimestamp(),
    useCount: 0,
  });

  return docRef.id;
}

// Actualizar modelo de envío
export async function updateSendingTemplate(
  projectId: string,
  templateId: string,
  updates: Partial<SendingTemplate>
): Promise<void> {
  const templateRef = doc(db, "projects", projectId, "team", "sendingTemplates", templateId);
  await updateDoc(templateRef, updates);
}

// Eliminar modelo de envío
export async function deleteSendingTemplate(
  projectId: string,
  templateId: string
): Promise<void> {
  const templateRef = doc(db, "projects", projectId, "team", "sendingTemplates", templateId);
  await deleteDoc(templateRef);
}

// Registrar envío de documentación
export async function createDocumentSend(
  projectId: string,
  sendData: Omit<DocumentSend, "id" | "sentAt" | "readCount">
): Promise<string> {
  const sendsRef = collection(db, "projects", projectId, "team", "documentSends");
  
  const docRef = await addDoc(sendsRef, {
    ...sendData,
    sentAt: serverTimestamp(),
    readCount: 0,
  });

  // Incrementar useCount del template si se usó uno
  if (sendData.templateId) {
    const templateRef = doc(db, "projects", projectId, "team", "sendingTemplates", sendData.templateId);
    await updateDoc(templateRef, {
      lastUsed: serverTimestamp(),
      useCount: (await getDocs(query(collection(templateRef.parent)))).size + 1,
    });
  }

  return docRef.id;
}

// Crear parte diario
export async function createDailyReport(
  projectId: string,
  reportData: Omit<DailyReport, "id" | "submittedAt" | "approved">
): Promise<string> {
  const reportsRef = collection(db, "projects", projectId, "team", "dailyReports");
  
  const docRef = await addDoc(reportsRef, {
    ...reportData,
    submittedAt: serverTimestamp(),
    approved: false,
  });

  return docRef.id;
}

// Aprobar parte diario
export async function approveDailyReport(
  projectId: string,
  reportId: string,
  approvedBy: string
): Promise<void> {
  const reportRef = doc(db, "projects", projectId, "team", "dailyReports", reportId);
  await updateDoc(reportRef, {
    approved: true,
    approvedBy,
    approvedAt: serverTimestamp(),
  });
}