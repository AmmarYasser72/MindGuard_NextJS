"use client";

import Button from "../../common/Button";
import Icon from "../../common/Icon";
import { Modal } from "../../common/Modal";
import { useToast } from "../../common/Toast";
import type { DoctorRecommendation } from "../../../types/recommendations";
import AvailableSlotsPanel from "./contactDoctor/AvailableSlotsPanel";
import ContactMethod from "./contactDoctor/ContactMethod";
import DoctorRecommendationSummary from "./contactDoctor/DoctorRecommendationSummary";
import { buildMailTo } from "./contactDoctor/contactDoctorUtils";
import { useDoctorSlotBooking } from "./contactDoctor/useDoctorSlotBooking";

type ContactDoctorModalProps = {
  conditionLabel: string;
  doctor: DoctorRecommendation;
  patientEmail?: string;
  patientId?: string;
  patientName?: string;
  onClose: () => void;
  onOpenCareChat: () => void;
};

export default function ContactDoctorModal({
  conditionLabel,
  doctor,
  patientEmail,
  patientId,
  patientName,
  onClose,
  onOpenCareChat,
}: ContactDoctorModalProps) {
  const { showToast } = useToast();
  const mailToHref = buildMailTo(doctor, conditionLabel, patientEmail);
  const {
    bookSelectedSlot,
    isBooking,
    isLoadingSlots,
    refreshSlots,
    selectedSlot,
    selectedSlotId,
    setSelectedSlotId,
    slotError,
    slots,
  } = useDoctorSlotBooking({
    doctor,
    patientEmail,
    patientId,
    patientName,
  });

  async function copyDoctorId() {
    try {
      await navigator.clipboard.writeText(doctor.id);
      showToast("Doctor profile ID copied", "success");
    } catch {
      showToast("Unable to copy the doctor ID", "error");
    }
  }

  return (
    <Modal
      title={`Book ${doctor.displayName}`}
      onClose={onClose}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <a
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-bold text-white shadow-sm shadow-teal-950/10 transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200"
            href={mailToHref}
          >
            <Icon name="mail" size={18} color="#fff" />
            {doctor.email ? "Email doctor" : "Prepare email request"}
          </a>
          <Button
            className="rounded-xl bg-teal-600 hover:bg-teal-700 focus:ring-teal-200"
            icon="calendar-check"
            onClick={bookSelectedSlot}
            disabled={!selectedSlot || isBooking || isLoadingSlots}
          >
            {isBooking ? "Booking..." : "Book selected"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <DoctorRecommendationSummary
          conditionLabel={conditionLabel}
          doctor={doctor}
        />

        <AvailableSlotsPanel
          isBooking={isBooking}
          isLoadingSlots={isLoadingSlots}
          onRefresh={refreshSlots}
          onSelectSlot={setSelectedSlotId}
          selectedSlotId={selectedSlotId}
          slotError={slotError}
          slots={slots}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <ContactMethod
            icon="mail"
            label="Email"
            value={
              doctor.email || "Direct email is not exposed by the backend yet"
            }
          />
          <ContactMethod
            icon="phone"
            label="Phone"
            value={doctor.phone || "Phone is not available on this profile"}
          />
          <ContactMethod
            icon="map-pin"
            label="Clinic"
            value={doctor.clinicAddress || "Clinic address is not available"}
          />
          <ContactMethod
            icon="clock"
            label="Session length"
            value={doctor.sessionTime || "Flexible"}
          />
        </div>

        {!doctor.email ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            This backend doctor profile does not include direct contact details
            yet. The email button prepares a request with the doctor profile ID
            so the patient can send it through their preferred care channel.
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" icon="copy" onClick={copyDoctorId}>
            Copy doctor ID
          </Button>
          <Button
            variant="ghost"
            icon="message-circle"
            onClick={onOpenCareChat}
          >
            Open care chat
          </Button>
        </div>
      </div>
    </Modal>
  );
}
