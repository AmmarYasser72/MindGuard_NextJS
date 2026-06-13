import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../../common/Toast";
import { slotService } from "../../../../services/slotService";
import type { DoctorSession } from "../../../../types/doctor";
import type { DoctorRecommendation } from "../../../../types/recommendations";
import { formatSlotDateTime } from "./contactDoctorUtils";

type UseDoctorSlotBookingParams = {
  doctor: DoctorRecommendation;
  patientEmail?: string;
  patientId?: string;
  patientName?: string;
};

export function useDoctorSlotBooking({
  doctor,
  patientEmail,
  patientId,
  patientName,
}: UseDoctorSlotBookingParams) {
  const { showToast } = useToast();
  const [slots, setSlots] = useState<DoctorSession[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [slotError, setSlotError] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) || null;
  const bookingPatient = useMemo(
    () => ({
      patientEmail: patientEmail || "",
      patientId: patientId || patientEmail || "",
      patientName: patientName || patientEmail?.split("@")[0] || "Patient",
    }),
    [patientEmail, patientId, patientName],
  );

  useEffect(() => {
    let isActive = true;

    async function loadSlots() {
      setIsLoadingSlots(true);
      setSlotError("");

      try {
        const availableSlots = await slotService.getDoctorAvailableSlots(
          doctor.id,
          doctor,
        );
        if (!isActive) return;
        setSlots(availableSlots);
        setSelectedSlotId((current) =>
          availableSlots.some((slot) => slot.id === current) ? current : "",
        );
      } catch (error) {
        if (!isActive) return;
        setSlots([]);
        setSelectedSlotId("");
        setSlotError(
          error instanceof Error
            ? error.message
            : "Unable to load available slots.",
        );
      } finally {
        if (isActive) {
          setIsLoadingSlots(false);
        }
      }
    }

    loadSlots();

    return () => {
      isActive = false;
    };
  }, [doctor]);

  async function refreshSlots() {
    setIsLoadingSlots(true);
    setSlotError("");
    try {
      const availableSlots = await slotService.getDoctorAvailableSlots(
        doctor.id,
        doctor,
      );
      setSlots(availableSlots);
      setSelectedSlotId((current) =>
        availableSlots.some((slot) => slot.id === current) ? current : "",
      );
    } catch (error) {
      setSlots([]);
      setSelectedSlotId("");
      setSlotError(
        error instanceof Error
          ? error.message
          : "Unable to refresh available slots.",
      );
    } finally {
      setIsLoadingSlots(false);
    }
  }

  async function bookSelectedSlot() {
    if (!selectedSlot) {
      setSlotError("Choose an available future slot before booking.");
      return;
    }

    if (!bookingPatient.patientId && !bookingPatient.patientEmail) {
      setSlotError("Sign in to your patient profile before booking a session.");
      return;
    }

    if (selectedSlot.scheduledAt.getTime() <= Date.now()) {
      setSlotError("This time slot has already passed. Choose a future slot.");
      return;
    }

    setIsBooking(true);
    setSlotError("");

    try {
      const bookedSlot = await slotService.bookSlot(
        selectedSlot.id,
        bookingPatient,
      );
      setSlots((current) =>
        current.filter((slot) => slot.id !== bookedSlot.id),
      );
      setSelectedSlotId("");
      showToast(
        `Session booked for ${formatSlotDateTime(bookedSlot.scheduledAt)}`,
        "success",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "This slot is no longer available. Please choose another time.";
      setSlotError(message);
      showToast(message, "error");
      await refreshSlots();
    } finally {
      setIsBooking(false);
    }
  }

  return {
    bookSelectedSlot,
    isBooking,
    isLoadingSlots,
    refreshSlots,
    selectedSlot,
    selectedSlotId,
    setSelectedSlotId,
    slotError,
    slots,
  };
}
