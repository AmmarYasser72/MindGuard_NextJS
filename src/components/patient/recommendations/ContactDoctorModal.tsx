"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "../../common/Button";
import Icon from "../../common/Icon";
import { Modal } from "../../common/Modal";
import { useToast } from "../../common/Toast";
import { slotService } from "../../../services/slotService";
import type { DoctorRecommendation } from "../../../types/recommendations";
import type { DoctorSession } from "../../../types/doctor";

type ContactDoctorModalProps = {
  conditionLabel: string;
  doctor: DoctorRecommendation;
  patientEmail?: string;
  patientId?: string;
  patientName?: string;
  onClose: () => void;
  onOpenCareChat: () => void;
};

const matchLabels = {
  matched: "condition match",
  broad: "broad fit",
  "not-matched": "not a match",
};

function buildMailTo(
  doctor: DoctorRecommendation,
  conditionLabel: string,
  patientEmail?: string,
) {
  const recipient = doctor.email || "";
  const subject = encodeURIComponent(
    `MindGuard appointment request: ${conditionLabel}`,
  );
  const body = encodeURIComponent(
    [
      `Hello ${doctor.displayName},`,
      "",
      `I found your profile through MindGuard because I am looking for support with ${conditionLabel.toLowerCase()}.`,
      `Recommended specialization: ${doctor.specialization}`,
      `Doctor profile ID: ${doctor.id}`,
      patientEmail ? `Patient email: ${patientEmail}` : "",
      "",
      "Please let me know the next available time to talk.",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

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
  const [slots, setSlots] = useState<DoctorSession[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [slotError, setSlotError] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const mailToHref = buildMailTo(doctor, conditionLabel, patientEmail);
  const matchLabel = matchLabels[doctor.matchStatus];
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) || null;
  const bookingPatient = useMemo(
    () => ({
      patientEmail: patientEmail || "",
      patientId: patientId || patientEmail || "patient",
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

  async function copyDoctorId() {
    try {
      await navigator.clipboard.writeText(doctor.id);
      showToast("Doctor profile ID copied", "success");
    } catch {
      showToast("Unable to copy the doctor ID", "error");
    }
  }

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
        <div className="rounded-[1.25rem] bg-teal-50 p-4 text-teal-950 ring-1 ring-teal-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">
                Recommended for
              </span>
              <h3 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                {conditionLabel}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-800">
                {doctor.bio}
              </p>
            </div>
            <span className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
              <strong className="block text-2xl font-black text-teal-800">
                {doctor.matchScore}%
              </strong>
              <small className="font-bold text-teal-700">{matchLabel}</small>
            </span>
          </div>
        </div>

        <section className="rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-sm shadow-slate-950/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">
                Available sessions
              </span>
              <h4 className="mt-1 text-lg font-black text-slate-950">
                Future open slots
              </h4>
            </div>
            <Button
              variant="ghost"
              icon="refresh-cw"
              onClick={refreshSlots}
              disabled={isLoadingSlots || isBooking}
            >
              Refresh
            </Button>
          </div>

          {slotError ? (
            <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {slotError}
            </div>
          ) : null}

          {isLoadingSlots ? (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-500">
              Loading available slots...
            </div>
          ) : null}

          {!isLoadingSlots && !slots.length ? (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
              No future open slots are available for this doctor right now. You
              can still email the doctor to request another time.
            </div>
          ) : null}

          {!isLoadingSlots && slots.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {slots.map((slot) => {
                const active = selectedSlotId === slot.id;
                return (
                  <button
                    type="button"
                    key={slot.id}
                    className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-teal-100 ${
                      active
                        ? "border-teal-500 bg-teal-50 text-teal-950 shadow-sm shadow-teal-950/10"
                        : "border-slate-100 bg-slate-50 text-slate-700 hover:border-teal-200 hover:bg-white"
                    }`}
                    onClick={() => setSelectedSlotId(slot.id)}
                    aria-pressed={active}
                  >
                    <span className="block text-sm font-black">
                      {formatSlotDateTime(slot.scheduledAt)}
                    </span>
                    <span className="mt-1 block text-xs font-bold text-slate-500">
                      {slot.duration || 60} min - {slot.type || "video"}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </section>

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

function formatSlotDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

type ContactMethodProps = {
  icon: string;
  label: string;
  value: string;
};

function ContactMethod({ icon, label, value }: ContactMethodProps) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-teal-700">
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
        <strong className="mt-1 block break-words text-sm font-bold text-slate-800">
          {value}
        </strong>
      </span>
    </div>
  );
}
