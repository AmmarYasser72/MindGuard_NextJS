export const analyticsTabs = [
  { key: "mood", title: "Mood Analytics", label: "Mood", icon: "smile", color: "#10b981" },
  { key: "stress", title: "Stress Monitor", label: "Stress", icon: "triangle-alert", color: "#f59e0b" },
  { key: "sleep", title: "Sleep Analytics", label: "Sleep", icon: "moon", color: "#8b5cf6" },
  { key: "depression", title: "Depression", label: "Depression", icon: "brain", color: "#ef4444" },
  { key: "anxiety", title: "Anxiety", label: "Anxiety", icon: "brain-circuit", color: "#f59e0b" },
];

export const moodInsights = [
  "Your mood improved 15% this week compared to last week",
  "You tend to feel happiest in the morning (6 AM - 12 PM)",
  "Weekends show consistently higher mood scores",
  "Your check-in streak of 12 days is your best this month",
  "Mood patterns suggest good sleep quality correlates with better mood",
];

export const moodBars = [
  { time: "10:08", mood: 5, emoji: "\u{1F60D}" },
  { time: "12:10", mood: 1, emoji: "\u{1F620}" },
  { time: "14:40", mood: 4, emoji: "\u{1F60A}" },
  { time: "18:30", mood: 2, emoji: "\u{1F622}" },
  { time: "20:10", mood: 3, emoji: "\u{1F610}" },
];

export const stressAnalytics = {
  title: "Stress Monitor",
  subtitle: "Track and manage your stress levels",
  timeframe: "Today",
  current: {
    title: "Current Stress Level",
    gradient: ["#f59e0b", "#d97706"],
    metrics: [
      { icon: "heart", label: "Heart Rate", value: "67 BPM" },
      { gauge: true, value: "4", label: "out of 10" },
      { icon: "clock", label: "Duration", value: "14 min" },
    ],
    badge: "Low",
  },
  chart: {
    title: "Stress Patterns",
    tag: "Hourly",
    data: [3, 5, 4, 7, 6, 4],
    color: "#f59e0b",
    labels: ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
    description: "Mid-afternoon shows the highest pressure. Relief sessions are working best after 3 PM.",
  },
  triggers: [
    { name: "Work Meetings", percentage: 50, color: "#ef4444" },
    { name: "Social Media", percentage: 38, color: "#dc2626" },
    { name: "News Content", percentage: 27, color: "#ef4444" },
    { name: "Traffic/Commute", percentage: 18, color: "#ef4444" },
  ],
  techniquesTitle: "Stress Relief Techniques",
  techniques: [
    { name: "4-7-8 Breathing", description: "Inhale for 4, hold for 7, exhale for 8", duration: "5 min", effectiveness: "90%", icon: "star" },
    { name: "Progressive Relaxation", description: "Tense and relax muscle groups", duration: "10 min", effectiveness: "78%", icon: "circle-dot" },
    { name: "Mindful Meditation", description: "Focus on present moment awareness", duration: "15 min", effectiveness: "85%", icon: "info" },
    { name: "Quick Body Scan", description: "Rapid tension release technique", duration: "10 min", effectiveness: "70%", icon: "star" },
  ],
  progress: [
    { icon: "trending-down", value: "-18%", label: "Avg Stress", color: "#10b981" },
    { icon: "check-circle", value: "14", label: "Relief Sessions", color: "#3b82f6" },
    { icon: "flag", value: "52%", label: "Goal Progress", color: "#8b5cf6" },
    { icon: "calendar", value: "6", label: "Stress Free Days", color: "#f59e0b" },
  ],
  crisis: {
    title: "Feeling Overwhelmed?",
    subtitle: "Access immediate calm, or get support.",
    gradient: ["#ef4444", "#dc2626"],
    primary: "Quick Relief",
    secondary: "Crisis Support",
    primaryAction: { type: "navigate", path: "/breathing" },
    secondaryAction: { type: "navigate", path: "/patient-chat/support@mindguard.app" },
  },
};

export const anxietyAnalytics = {
  title: "Anxiety Monitor",
  subtitle: "Track and manage your anxiety levels",
  timeframe: "Today",
  current: {
    title: "Current Anxiety Level",
    gradient: ["#f59e0b", "#d97706"],
    metrics: [
      { icon: "heart", label: "Heart Rate", value: "89 BPM" },
      { gauge: true, value: "7", label: "out of 10" },
      { icon: "clock", label: "Episode", value: "8 min" },
    ],
    badge: "Moderate",
  },
  chart: {
    title: "Anxiety Patterns",
    tag: "Hourly",
    data: [6, 7, 5, 8, 7, 4],
    color: "#f59e0b",
    labels: ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
    description: "Your anxiety tends to peak around the middle of the day, then settles after evening routines.",
  },
  triggers: [
    { name: "Social Situations", percentage: 65, color: "#f59e0b" },
    { name: "Work Deadlines", percentage: 58, color: "#d97706" },
    { name: "Health Concerns", percentage: 42, color: "#b45309" },
    { name: "Financial Stress", percentage: 35, color: "#92400e" },
  ],
  techniquesTitle: "Breathing Exercises",
  techniques: [
    { name: "4-7-8 Breathing", description: "Inhale 4, hold 7, exhale 8", duration: "5 min", effectiveness: "95%", icon: "wind" },
    { name: "Box Breathing", description: "Equal count inhale, hold, exhale, hold", duration: "4 min", effectiveness: "88%", icon: "square" },
    { name: "Diaphragmatic Breathing", description: "Deep belly breathing technique", duration: "6 min", effectiveness: "82%", icon: "sparkles" },
    { name: "Coherent Breathing", description: "Slow, steady 5-count breathing", duration: "5 min", effectiveness: "75%", icon: "waves" },
  ],
  secondaryTechniquesTitle: "Relaxation Techniques",
  secondaryTechniques: [
    { name: "Progressive Muscle Relaxation", description: "Tense and release muscle groups", duration: "15 min", effectiveness: "85%", icon: "accessibility" },
    { name: "Guided Meditation", description: "Mindfulness and awareness practice", duration: "20 min", effectiveness: "78%", icon: "sparkles" },
    { name: "Visualization", description: "Calm imagery and peaceful scenes", duration: "10 min", effectiveness: "72%", icon: "mountain" },
  ],
  progress: [
    { icon: "trending-down", value: "-12%", label: "Avg Anxiety", color: "#10b981" },
    { icon: "wind", value: "18", label: "Breathing Sessions", color: "#3b82f6" },
    { icon: "flag", value: "68%", label: "Goal Progress", color: "#8b5cf6" },
    { icon: "calendar", value: "4", label: "Calm Days", color: "#f59e0b" },
  ],
  crisis: {
    title: "Feeling Overwhelmed?",
    subtitle: "Access immediate calm, or get support.",
    gradient: ["#f59e0b", "#d97706"],
    primary: "Quick Calm",
    secondary: "Crisis Support",
    primaryAction: { type: "navigate", path: "/breathing" },
    secondaryAction: { type: "navigate", path: "/patient-chat/support@mindguard.app" },
  },
};

export const sleepAnalytics = {
  summary: [
    { icon: "moon", label: "Sleep Duration", value: "7h 32m" },
    { icon: "star", label: "Sleep Quality", value: "85%" },
    { icon: "timer", label: "Time to Sleep", value: "12 min" },
  ],
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  chart: [75, 80, 78, 86, 82, 90, 85],
  energy: [62, 68, 70, 76, 72, 84, 80],
  legend: [
    { label: "Sleep Quality", color: "#8b5cf6" },
    { label: "Energy Level", color: "#06b6d4" },
  ],
  stages: [
    { stage: "Deep Sleep", duration: "1h 45m", percentage: "23%", color: "#1e40af" },
    { stage: "REM Sleep", duration: "1h 32m", percentage: "20%", color: "#7c3aed" },
    { stage: "Light Sleep", duration: "4h 15m", percentage: "57%", color: "#8b5cf6" },
    { stage: "Awake", duration: "0m", percentage: "0%", color: "#ef4444" },
  ],
  tips: [
    { title: "Consistent Sleep Schedule", description: "Go to bed and wake up at the same time every day", icon: "clock" },
    { title: "Limit Screen Time", description: "Avoid screens 1 hour before bedtime", icon: "smartphone" },
    { title: "Create Sleep Environment", description: "Keep bedroom cool, dark, and quiet", icon: "bed" },
    { title: "Relaxation Routine", description: "Practice meditation or gentle stretching", icon: "sparkles" },
  ],
  goals: [
    { goal: "Sleep Duration", current: 7.5, target: 8, unit: "hours" },
    { goal: "Sleep Quality", current: 85, target: 90, unit: "%" },
    { goal: "Bedtime Consistency", current: 6, target: 7, unit: "days" },
    { goal: "Screen-Free Time", current: 45, target: 60, unit: "minutes" },
  ],
};

export const depressionAnalytics = {
  timeframe: "Last 7 days",
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  severityData: [7, 6, 5, 6, 5, 4, 3],
  strategies: [
    { name: "Physical Exercise", effectiveness: "85%", description: "Regular physical activity boosts mood", icon: "dumbbell" },
    { name: "Social Connection", effectiveness: "78%", description: "Spending time with loved ones", icon: "users" },
    { name: "Mindfulness Practice", effectiveness: "72%", description: "Meditation and breathing exercises", icon: "sparkles" },
    { name: "Creative Activities", effectiveness: "68%", description: "Art, music, or writing therapy", icon: "palette" },
  ],
  correlations: [
    { factor: "Sleep Quality", value: "-0.75", text: "Strong negative correlation", color: "#8b5cf6" },
    { factor: "Physical Activity", value: "-0.68", text: "Moderate negative correlation", color: "#10b981" },
    { factor: "Social Interaction", value: "-0.72", text: "Strong negative correlation", color: "#3b82f6" },
    { factor: "Stress Levels", value: "+0.85", text: "Strong positive correlation", color: "#f59e0b" },
  ],
  support: [
    { title: "Therapy Sessions", icon: "brain", color: "#3b82f6" },
    { title: "Medication Review", icon: "pill", color: "#10b981" },
    { title: "Support Group", icon: "users", color: "#8b5cf6" },
  ],
};
