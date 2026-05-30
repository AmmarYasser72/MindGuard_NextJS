export function dashboardGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function nameFromEmail(email: string) {
  const name = email.split("@")[0].split(".")[0] || "Patient";
  return name.charAt(0).toUpperCase() + name.slice(1);
}
