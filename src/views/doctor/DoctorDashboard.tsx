"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import Icon from "../../components/common/Icon";
import ThemeToggle from "../../components/common/ThemeToggle";
import { useToast } from "../../components/common/Toast";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "../../hooks/useRouter";
import DoctorHome from "../../components/doctor/DoctorHome";
import { patientService } from "../../services/patientService";
import { slotService } from "../../services/slotService";
import {
  bottomNavClass,
  destinations,
  firstName,
  greeting,
  primaryPurple,
  railButtonClass,
} from "../../components/doctor/dashboardShared";
import type { DoctorPatient, DoctorSession, ScheduleForm } from "../../types/doctor";

const MonitorScreen = dynamic(() => import("../../components/doctor/MonitorScreen"));
const PatientsScreen = dynamic(() => import("../../components/doctor/PatientsScreen"));
const ScheduleSessionModal = dynamic(() => import("../../components/doctor/ScheduleSessionModal"));
const SessionsScreen = dynamic(() => import("../../components/doctor/SessionsScreen"));

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
  const [schedulePatient, setSchedulePatient] = useState<DoctorPatient | null | undefined>(undefined);
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
      if (!doctorId) throw new Error("Doctor id is missing from the current session.");
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
    await slotService.createSlot(createSlotPayload(form, schedulePatient));
    await loadSlots();
    setSelected("sessions");
    setSchedulePatient(undefined);
  }

  async function editSession(session: DoctorSession) {
    try {
      await slotService.updateSlot(session.id, {
        endTime: session.raw?.endTime || new Date(session.scheduledAt.getTime() + (session.duration || 60) * 60 * 1000).toISOString(),
        startTime: session.raw?.startTime || session.scheduledAt.toISOString(),
        status: session.status || "available",
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
        <aside className="dashboard-glass sticky top-0 hidden h-screen w-28 shrink-0 flex-col border-r px-3 py-4 lg:flex">
          <div className="mb-5 grid h-12 w-12 place-items-center self-center rounded-lg bg-[var(--primary)] text-white shadow-lg shadow-indigo-900/20">
            <Icon name="stethoscope" size={24} color="#fff" />
          </div>
          <nav className="grid gap-2" aria-label="Doctor navigation">
            {destinations.map((item) => (
              <button type="button" className={railButtonClass(selected === item.key)} key={item.key} onClick={() => setSelected(item.key)}>
                <Icon name={item.icon} size={22} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 pb-28 lg:pb-0">
          <header className="dashboard-glass sticky top-0 z-20 border-b px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex w-full items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase text-[var(--primary)]">{greeting()}</span>
                <h1 className="text-2xl font-bold tracking-normal text-slate-950">Dr. {firstName(doctorName)}</h1>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle className="hidden sm:inline-flex" />
                <button type="button" className="dashboard-outline-btn hidden rounded-lg px-3 py-2 text-sm font-bold sm:inline-flex" onClick={() => setSchedulePatient(null)}>
                  <Icon name="calendar-plus" size={18} />
                  New session
                </button>
                <button type="button" className="dashboard-outline-btn grid h-10 w-10 place-items-center rounded-lg" aria-label="Logout" title="Logout" onClick={logout}>
                  <Icon name="log-out" size={20} />
                </button>
              </div>
            </div>
          </header>

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
          {selected === "monitor" ? <MonitorScreen onOpenSchedule={setSchedulePatient} /> : null}
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

      <nav className="dashboard-nav fixed inset-x-0 bottom-0 z-30 border-t px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden" aria-label="Doctor navigation">
        <div className="mx-auto grid max-w-2xl grid-cols-4 gap-1">
          {destinations.map((item) => (
            <button type="button" className={bottomNavClass(selected === item.key)} key={item.key} onClick={() => setSelected(item.key)}>
              <Icon name={item.icon} size={22} color={selected === item.key ? primaryPurple : "currentColor"} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="fixed bottom-[5.4rem] right-3 z-30 lg:hidden">
        <ThemeToggle />
      </div>

      {schedulePatient !== undefined ? (
        <ScheduleSessionModal patient={schedulePatient} onClose={() => setSchedulePatient(undefined)} onCreate={createSession} />
      ) : null}
    </main>
  );
}

function createSlotPayload(form: ScheduleForm, patient: DoctorPatient | null | undefined) {
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
    endTime: endTime.toISOString(),
    patient: patient?.id || undefined,
    startTime: startTime.toISOString(),
    status: patient?.id ? "booked" : "available",
  };
}
