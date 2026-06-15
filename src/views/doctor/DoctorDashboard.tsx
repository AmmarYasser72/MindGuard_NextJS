"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "../../components/common/Toast";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "../../hooks/useRouter";
import DoctorHome from "../../components/doctor/DoctorHome";
import {
  DoctorMobileNav,
  DoctorSideNav,
} from "../../components/doctor/DoctorDashboardNav";
import DoctorTopBar from "../../components/doctor/DoctorTopBar";
import { patientService } from "../../services/patientService";
import { slotService } from "../../services/slotService";
import {
  SLOT_CHANGE_EVENT,
  isSlotStorageEvent,
} from "../../services/slotSync";
import { cleanString } from "../../services/slotService.helpers";
import type {
  DoctorPatient,
  DoctorSession,
  ScheduleForm,
} from "../../types/doctor";

const MonitorScreen = dynamic(
  () => import("../../components/doctor/MonitorScreen"),
);
const PatientsScreen = dynamic(
  () => import("../../components/doctor/PatientsScreen"),
);
const ScheduleSessionModal = dynamic(
  () => import("../../components/doctor/ScheduleSessionModal"),
);
const SessionsScreen = dynamic(
  () => import("../../components/doctor/SessionsScreen"),
);

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function DoctorDashboard() {
  const [selected, setSelected] = useState("dashboard");
  const [patientList, setPatientList] = useState<DoctorPatient[]>([]);
  const [patientLoading, setPatientLoading] = useState(true);
  const [patientError, setPatientError] = useState("");
  const [sessionList, setSessionList] = useState<DoctorSession[]>([]);
  const [slotLoading, setSlotLoading] = useState(true);
  const [slotError, setSlotError] = useState("");
  const [schedulePatient, setSchedulePatient] = useState<
    DoctorPatient | null | undefined
  >(undefined);
  const { user, signOut } = useAuth();
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const doctorName = user?.displayName || "Doctor";
  const doctorId = user?.uid || user?._id || user?.id || "";
  const displaySessions = useMemo(
    () => enrichSessionPatientNames(sessionList, patientList),
    [patientList, sessionList],
  );

  function logout() {
    signOut();
    navigate("/login");
  }

  const loadPatients = useCallback(async () => {
    setPatientLoading(true);
    setPatientError("");

    try {
      if (!doctorId)
        throw new Error("Doctor id is missing from the current session.");
      const patients = await patientService.getDoctorPatients(doctorId);
      setPatientList(patients);
    } catch (error) {
      setPatientList([]);
      setPatientError(errorMessage(error, "Unable to load patients."));
    } finally {
      setPatientLoading(false);
    }
  }, [doctorId]);

  const loadSlots = useCallback(async () => {
    setSlotLoading(true);
    setSlotError("");

    try {
      const slots = await slotService.getDoctorSlots({
        all: true,
        sortBy: "startTime",
        sortOrder: "asc",
      });
      setSessionList(slots);
    } catch (error) {
      setSessionList([]);
      setSlotError(errorMessage(error, "Unable to load slots."));
    } finally {
      setSlotLoading(false);
    }
  }, []);

  const refreshDoctorData = useCallback(() => {
    loadPatients();
    loadSlots();
  }, [loadPatients, loadSlots]);

  useEffect(() => {
    window.queueMicrotask(refreshDoctorData);
  }, [refreshDoctorData]);

  useEffect(() => {
    function handleSlotChange() {
      refreshDoctorData();
    }

    function handleStorage(event: StorageEvent) {
      if (!isSlotStorageEvent(event)) return;
      refreshDoctorData();
    }

    window.addEventListener(SLOT_CHANGE_EVENT, handleSlotChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(SLOT_CHANGE_EVENT, handleSlotChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshDoctorData]);

  useEffect(() => {
    void import("../../components/doctor/PatientsScreen");
    void import("../../components/doctor/MonitorScreen");
    void import("../../components/doctor/SessionsScreen");
  }, []);

  async function createSession(form: ScheduleForm) {
    await slotService.createSlot(
      createSlotPayload(form, schedulePatient, doctorId),
    );
    await loadSlots();
    setSelected("sessions");
    setSchedulePatient(undefined);
  }

  async function editSession(session: DoctorSession) {
    try {
      const hasBookedPatient = Boolean(
        session.patientId || session.raw?.patient || session.raw?.patientId,
      );
      const sessionUpdatedAt = new Date().toISOString();
      const patientNotificationMessage = `Your doctor updated your session for ${formatPatientNotificationDate(
        session.scheduledAt,
      )}. Note: ${session.notes || "Session details were updated."}`;

      await slotService.updateSlot(session.id, {
        doctorNote: session.notes || "",
        endTime:
          session.raw?.endTime ||
          new Date(
            session.scheduledAt.getTime() +
              (session.duration || 60) * 60 * 1000,
          ).toISOString(),
        notes: session.notes || "",
        patient: session.patientId || session.raw?.patient || undefined,
        patientEmail: session.raw?.patientEmail || undefined,
        patientId: session.patientId || session.raw?.patientId || undefined,
        patientName: session.patientName,
        patientNotificationAt: hasBookedPatient
          ? sessionUpdatedAt
          : undefined,
        patientNotificationCategory: hasBookedPatient
          ? "Session"
          : undefined,
        patientNotificationMessage: hasBookedPatient
          ? patientNotificationMessage
          : undefined,
        patientNotificationTitle: hasBookedPatient
          ? "Session updated"
          : undefined,
        patientNotificationValue: hasBookedPatient
          ? "Doctor note"
          : undefined,
        reason: session.reason || undefined,
        sessionUpdatedAt,
        startTime: session.raw?.startTime || session.scheduledAt.toISOString(),
        status: session.status || "available",
        type: session.type || undefined,
      });
      await loadSlots();
      showToast("Slot saved.", "success");
    } catch (error) {
      showToast(errorMessage(error, "Unable to update slot."), "error");
    }
  }

  async function deleteSession(session: DoctorSession) {
    try {
      const hasBookedPatient = Boolean(
        session.patientId || session.raw?.patient || session.raw?.patientId,
      );

      if (hasBookedPatient) {
        const cancelledAt = new Date().toISOString();
        await slotService.updateSlot(session.id, {
          cancelledAt,
          cancelledBy: "doctor",
          patient: session.patientId || session.raw?.patient || undefined,
          patientEmail: session.raw?.patientEmail || undefined,
          patientId: session.patientId || session.raw?.patientId || undefined,
          patientName: session.patientName,
          patientNotificationAt: cancelledAt,
          patientNotificationCategory: "Session",
          patientNotificationMessage: `Your doctor cancelled your session for ${formatPatientNotificationDate(
            session.scheduledAt,
          )}.`,
          patientNotificationTitle: "Session cancelled",
          patientNotificationValue: "Cancelled by doctor",
          reason: "cancelled",
          sessionUpdatedAt: cancelledAt,
          status: "cancelled",
        });
      } else {
        await slotService.deleteSlot(session.id);
      }

      await loadSlots();
      showToast(
        hasBookedPatient ? "Session cancelled." : "Slot deleted.",
        "success",
      );
    } catch (error) {
      showToast(errorMessage(error, "Unable to update slot."), "error");
    }
  }

  function deletePatient(patient: DoctorPatient) {
    if (!doctorId) {
      showToast("Doctor id is missing from the current session.", "error");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${patient.displayName} from your patient list?`,
    );
    if (!confirmed) return;

    patientService.hideDoctorPatient(doctorId, patient);
    setPatientList((current) =>
      current.filter((item) => item.id !== patient.id),
    );
    showToast("Patient removed from your list.", "success");
  }

  return (
    <main className="doctor-shell dashboard-shell min-h-screen [background:var(--doctor-page-bg)] text-slate-950">
      <div className="flex min-h-screen w-full">
        <DoctorSideNav selected={selected} onSelect={setSelected} />

        <section className="min-w-0 flex-1 pb-28 lg:pb-0">
          <DoctorTopBar
            doctorName={doctorName}
            onLogout={logout}
            onNewSession={() => setSchedulePatient(null)}
          />

          {selected === "dashboard" ? (
            <DoctorHome
              onEditSession={editSession}
              onNavigate={setSelected}
              onRefresh={refreshDoctorData}
              patientError={patientError}
              patients={patientList}
              sessions={displaySessions}
              slotError={slotError}
            />
          ) : null}
          {selected === "patients" ? (
            <PatientsScreen
              error={patientError}
              isLoading={patientLoading}
              onDeletePatient={deletePatient}
              onOpenSchedule={setSchedulePatient}
              onRetry={loadPatients}
              patients={patientList}
            />
          ) : null}
          {selected === "monitor" ? (
            <MonitorScreen onOpenSchedule={setSchedulePatient} />
          ) : null}
          {selected === "sessions" ? (
            <SessionsScreen
              error={slotError}
              isLoading={slotLoading}
              onDeleteSession={deleteSession}
              onEditSession={editSession}
              onOpenSchedule={() => setSchedulePatient(null)}
              onRetry={loadSlots}
              sessions={displaySessions}
            />
          ) : null}
        </section>
      </div>

      <DoctorMobileNav selected={selected} onSelect={setSelected} />

      {schedulePatient !== undefined ? (
        <ScheduleSessionModal
          patient={schedulePatient}
          onClose={() => setSchedulePatient(undefined)}
          onCreate={createSession}
        />
      ) : null}
    </main>
  );
}

function createSlotPayload(
  form: ScheduleForm,
  patient: DoctorPatient | null | undefined,
  doctorId: string,
) {
  const startTime = new Date(`${form.date}T${form.time}`);
  const duration = Number(form.duration);
  const now = new Date();

  if (Number.isNaN(startTime.getTime())) {
    throw new Error("Choose a valid date and time before scheduling.");
  }

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("Choose a valid session duration.");
  }

  if (startTime <= now) {
    throw new Error("Choose a future date and time for the session.");
  }

  const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
  return {
    doctor: doctorId || undefined,
    doctorNote: form.notes || undefined,
    endTime: endTime.toISOString(),
    notes: form.notes || undefined,
    bookedAt: patient?.id ? now.toISOString() : undefined,
    patient: patient?.id || undefined,
    patientEmail: patient?.email || undefined,
    patientId: patient?.id || undefined,
    patientName: patient?.id ? patient.displayName : undefined,
    reason: patient?.id ? form.reason || undefined : "available",
    startTime: startTime.toISOString(),
    status: patient?.id ? "booked" : "available",
    type: normalizeSessionType(form.type),
  };
}

function normalizeSessionType(type: string) {
  const cleanType = type.toLowerCase();
  if (cleanType.includes("person")) return "inPerson";
  if (cleanType.includes("audio")) return "audio";
  if (cleanType.includes("chat")) return "chat";
  return "video";
}

function formatPatientNotificationDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function enrichSessionPatientNames(
  sessions: DoctorSession[],
  patients: DoctorPatient[],
) {
  return sessions.map((session) => {
    const patient = matchPatientToSession(session, patients);
    const displayName = cleanString(patient?.displayName);

    if (!displayName || displayName === session.patientName) {
      return session;
    }

    return {
      ...session,
      patientId: session.patientId || patient?.id || null,
      patientName: displayName,
      raw: {
        ...session.raw,
        patientEmail: session.raw?.patientEmail || patient?.email || undefined,
        patientId: session.raw?.patientId || patient?.id || undefined,
        patientName: displayName,
      },
    };
  });
}

function matchPatientToSession(
  session: DoctorSession,
  patients: DoctorPatient[],
) {
  const sessionEmail = cleanString(session.raw?.patientEmail).toLowerCase();
  const sessionPatientId = cleanString(session.patientId);

  return (
    patients.find((patient) => patient.id === sessionPatientId) ||
    patients.find(
      (patient) =>
        sessionEmail && cleanString(patient.email).toLowerCase() === sessionEmail,
    ) ||
    null
  );
}
