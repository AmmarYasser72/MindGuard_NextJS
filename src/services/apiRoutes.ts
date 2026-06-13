export const apiRoutes = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  chats: {
    base: "/chats",
    allForCurrentUser: (userId: string) => `/chats/${encodeURIComponent(userId)}`,
    byId: (chatId: string) => `/chats/${chatId}`,
  },
  doctors: {
    base: "/doctors",
    byId: (doctorId: string) => `/doctors/${doctorId}`,
  },
  patients: {
    forDoctor: (doctorId: string) => `/patients/doctor/${doctorId}`,
  },
  readings: {
    patientMood: "/reading/patient/mood",
    patientMoodHistory: "/reading/patient/mood",
  },
  slots: {
    base: "/slots",
    byId: (slotId: string) => `/slots/${slotId}`,
    forDoctor: (doctorId: string) =>
      `/slots/doctor/${encodeURIComponent(doctorId)}`,
    my: "/slots/my",
    patientMine: "/slots/patient/my",
  },
};
