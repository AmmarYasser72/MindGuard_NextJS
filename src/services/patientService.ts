import { ensureArrayData, ensureArrayRecords } from "./apiResponse";
import { request } from "./apiClient";
import { getLocalBookedPatientRecordsForCurrentDoctor } from "./slotService";
import { mockDoctorPatientRecords } from "../data/mockDoctorPatients";
import { storage } from "./storage";
import type { ApiRecord } from "../types/api";
import type { DoctorPatient } from "../types/doctor";
import {
  mergePatientRecords,
  normalizePatientRecord,
  patientFields,
} from "./patientService.helpers";

export { normalizePatientRecord } from "./patientService.helpers";

function hiddenPatientsKey(doctorId: string) {
  return `doctor_hidden_patients_${doctorId}`;
}

function hiddenPatientIds(doctorId: string) {
  return new Set(storage.get<string[]>(hiddenPatientsKey(doctorId), []));
}

function visiblePatients(doctorId: string, patients: DoctorPatient[]) {
  const hiddenIds = hiddenPatientIds(doctorId);
  return patients.filter((patient) => !hiddenIds.has(patient.id));
}

export const patientService = {
  async getDoctorPatients(doctorId: string) {
    const bookedPatients = getLocalBookedPatientRecordsForCurrentDoctor();

    try {
      const response = await request(`/patients/doctor/${doctorId}`, {
        auth: true,
      });
      const records = ensureArrayData<ApiRecord>(response, "Doctor patients");

      if (!records.length) {
        return visiblePatients(
          doctorId,
          mergePatientRecords(
            bookedPatients,
            mockDoctorPatientRecords,
          ).map(normalizePatientRecord),
        );
      }

      const backendPatients = ensureArrayRecords(
        response,
        "Doctor patients",
        patientFields,
      );
      return visiblePatients(
        doctorId,
        mergePatientRecords(bookedPatients, backendPatients).map(
          normalizePatientRecord,
        ),
      );
    } catch {
      return visiblePatients(
        doctorId,
        mergePatientRecords(bookedPatients, mockDoctorPatientRecords).map(
          normalizePatientRecord,
        ),
      );
    }
  },

  hideDoctorPatient(doctorId: string, patient: DoctorPatient) {
    const hiddenIds = hiddenPatientIds(doctorId);
    hiddenIds.add(patient.id);
    storage.set(hiddenPatientsKey(doctorId), [...hiddenIds]);
  },
};
