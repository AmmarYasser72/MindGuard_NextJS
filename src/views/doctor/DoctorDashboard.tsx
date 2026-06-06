"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
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
        reason: session.reason || undefined,
        sessionUpdatedAt: new Date().toISOString(),
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
      await slotService.deleteSlot(session.id);
      await loadSlots();
      showToast("Slot deleted.", "success");
    } catch (error) {
      showToast(errorMessage(error, "Unable to delete slot."), "error");
    }
  }

  return (
    <main className="doctor-shell dashboard-shell min-h-screen text-slate-950">
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
              onNavigate={setSelected}
              onRefresh={refreshDoctorData}
              patientError={patientError}
              patients={patientList}
              sessions={sessionList}
              slotError={slotError}
            />
          ) : null}
          {selected === "patients" ? (
            <PatientsScreen
              error={patientError}
              isLoading={patientLoading}
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
              sessions={sessionList}
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
    endTime: endTime.toISOString(),
    patient: patient?.id || undefined,
    patientEmail: patient?.email || undefined,
    patientId: patient?.id || undefined,
    patientName: patient?.id ? patient.displayName : undefined,
    reason: form.reason || undefined,
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
