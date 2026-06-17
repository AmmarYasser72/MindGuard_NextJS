import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "../../../../components/common/Toast";
import { useAuth } from "../../../../hooks/useAuth";
import { doctorService } from "../../../../services/doctorService";
import {
  doctorNameFromRecord,
  slotService,
} from "../../../../services/slotService";
import {
  SLOT_CHANGE_EVENT,
  isSlotStorageEvent,
} from "../../../../services/slotSync";
import type { DoctorSession } from "../../../../types/doctor";
import {
  compareAppointmentsByRemainingTime,
  getPatientAppointmentDetails,
  isUpcomingAppointment,
} from "./appointmentUtils";

async function resolveMissingDoctorNames(sessions: DoctorSession[]) {
  const doctorIds = [
    ...new Set(
      sessions
        .filter((session) => !session.doctorName && session.doctorId)
        .map((session) => session.doctorId as string),
    ),
  ];

  if (!doctorIds.length) return sessions;

  const doctorResults = await Promise.allSettled(
    doctorIds.map(async (doctorId) => {
      const doctor = await doctorService.getDoctor(doctorId);
      return [doctorId, doctorNameFromRecord({ doctor, doctorId })] as const;
    }),
  );
  const namesById = new Map<string, string>();

  doctorResults.forEach((result) => {
    if (result.status !== "fulfilled") return;
    const [doctorId, doctorName] = result.value;
    if (doctorName) namesById.set(doctorId, doctorName);
  });

  if (!namesById.size) return sessions;

  return sessions.map((session) => {
    if (session.doctorName || !session.doctorId) return session;
    return {
      ...session,
      doctorName: namesById.get(session.doctorId) || null,
    };
  });
}

export function usePatientAppointments() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<DoctorSession[]>([]);
  const [availableSlots, setAvailableSlots] = useState<DoctorSession[]>([]);
  const [cancelTarget, setCancelTarget] = useState<DoctorSession | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [rescheduleTarget, setRescheduleTarget] =
    useState<DoctorSession | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const patientDetails = useMemo(
    () => getPatientAppointmentDetails(user),
    [user],
  );
  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter(isUpcomingAppointment)
        .sort(compareAppointmentsByRemainingTime)
        .slice(0, 4),
    [appointments],
  );

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const patientSlots = await slotService.getPatientSlots(patientDetails);
      const patientSlotsWithDoctors =
        await resolveMissingDoctorNames(patientSlots);
      setAppointments(patientSlotsWithDoctors);
    } catch (loadError) {
      setAppointments([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load appointments.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [patientDetails]);

  useEffect(() => {
    window.queueMicrotask(loadAppointments);
  }, [loadAppointments]);

  useEffect(() => {
    function handleSlotChange() {
      void loadAppointments();
    }

    function handleStorage(event: StorageEvent) {
      if (!isSlotStorageEvent(event)) return;
      void loadAppointments();
    }

    window.addEventListener(SLOT_CHANGE_EVENT, handleSlotChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(SLOT_CHANGE_EVENT, handleSlotChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadAppointments]);

  const loadAvailableSlots = useCallback(async (appointment: DoctorSession) => {
    const doctorId = appointment.doctorId || "";
    setSelectedSlotId("");
    setAvailableSlots([]);
    setRescheduleError("");

    if (!doctorId) {
      setRescheduleError("This appointment does not include a doctor id.");
      return;
    }

    setIsLoadingSlots(true);
    try {
      const slots = await slotService.getDoctorAvailableSlots(doctorId);
      setAvailableSlots(slots);
    } catch (loadError) {
      setRescheduleError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load available time slots.",
      );
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  const openReschedule = useCallback(
    (appointment: DoctorSession) => {
      setRescheduleTarget(appointment);
      void loadAvailableSlots(appointment);
    },
    [loadAvailableSlots],
  );

  const cancelAppointment = useCallback(async () => {
    if (!cancelTarget) return;

    setIsMutating(true);
    try {
      await slotService.cancelPatientSlot(cancelTarget, patientDetails);
      setCancelTarget(null);
      await loadAppointments();
      showToast("Appointment cancelled.", "success");
    } catch (cancelError) {
      showToast(
        cancelError instanceof Error
          ? cancelError.message
          : "Unable to cancel appointment.",
        "error",
      );
    } finally {
      setIsMutating(false);
    }
  }, [cancelTarget, loadAppointments, patientDetails, showToast]);

  const rescheduleAppointment = useCallback(async () => {
    if (!rescheduleTarget || !selectedSlotId) return;

    setIsMutating(true);
    setRescheduleError("");
    try {
      const bookedSlot = await slotService.bookSlot(
        selectedSlotId,
        patientDetails,
      );
      await slotService.cancelPatientSlot(rescheduleTarget, patientDetails, {
        rescheduledTo: bookedSlot.id,
      });
      setRescheduleTarget(null);
      setSelectedSlotId("");
      setAvailableSlots([]);
      await loadAppointments();
      showToast("Appointment rescheduled.", "success");
    } catch (rescheduleFailure) {
      const message =
        rescheduleFailure instanceof Error
          ? rescheduleFailure.message
          : "Unable to reschedule appointment.";
      setRescheduleError(message);
      showToast(message, "error");
      if (rescheduleTarget) {
        await loadAvailableSlots(rescheduleTarget);
      }
    } finally {
      setIsMutating(false);
    }
  }, [
    loadAppointments,
    loadAvailableSlots,
    patientDetails,
    rescheduleTarget,
    selectedSlotId,
    showToast,
  ]);

  return {
    availableSlots,
    cancelAppointment,
    cancelTarget,
    error,
    isLoading,
    isLoadingSlots,
    isMutating,
    loadAppointments,
    loadAvailableSlots,
    openReschedule,
    rescheduleAppointment,
    rescheduleError,
    rescheduleTarget,
    selectedSlotId,
    setCancelTarget,
    setRescheduleTarget,
    setSelectedSlotId,
    upcomingAppointments,
  };
}
