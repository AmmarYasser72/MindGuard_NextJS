export const wellnessMetrics = [
  { icon: "heart", label: "Mental Health", value: "75%", color: "#ec4899", bg: "#fce7f3" },
  { icon: "moon", label: "Sleep", value: "7.5h", color: "#8b5cf6", bg: "#f3e8ff" },
  { icon: "dumbbell", label: "Exercise", value: "30m", color: "#10b981", bg: "#d1fae5" },
  { icon: "sparkles", label: "Mindfulness", value: "15m", color: "#3b82f6", bg: "#dbeafe" },
];

export const moodOptions = [
  { emoji: "😢", label: "Low" },
  { emoji: "😔", label: "Low" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😊", label: "Excellent" },
];

export const quickActions = [
  { icon: "wind", label: "Breathing", path: "/breathing", color: "#3b82f6", bg: "#dbeafe" },
  { icon: "book-open", label: "Journal", path: "/journal", color: "#ec4899", bg: "#fce7f3" },
  { icon: "dumbbell", label: "Exercise", path: "/exercise", color: "#10b981", bg: "#d1fae5" },
  { icon: "moon", label: "Sleep Log", path: "/sleep-log", color: "#8b5cf6", bg: "#f3e8ff" },
];

export const weeklyMood = [
  { day: "Mon", value: 0.6 },
  { day: "Tue", value: 0.75 },
  { day: "Wed", value: 0.7 },
  { day: "Thu", value: 0.8 },
  { day: "Fri", value: 0.65 },
  { day: "Sat", value: 0.85 },
  { day: "Sun", value: 0.78 },
];

export const dailyGoals = [
  { title: "Water Intake", progress: 0.75, current: "6", target: "8 glasses" },
  { title: "Meditation", progress: 0.5, current: "10", target: "20 min" },
  { title: "Steps", progress: 0.6, current: "6k", target: "10k steps" },
];

export const recentActivities = [
  { title: "Completed breathing exercise", time: "2 hours ago", icon: "check-circle", color: "#10b981" },
  { title: "Logged mood entry", time: "5 hours ago", icon: "heart", color: "#ec4899" },
  { title: "Meditation session completed", time: "Yesterday", icon: "sparkles", color: "#8b5cf6" },
];

export const patientNotifications = [
  {
    id: "notif-heart-rate",
    title: "Heart rate update",
    message: "Your resting heart rate reached 96 bpm this afternoon. Take a short breathing break and recheck in 15 minutes.",
    time: "5 min ago",
    icon: "activity",
    color: "#ef4444",
    bg: "#fee2e2",
    category: "Vitals",
    value: "96 bpm",
    unread: true,
  },
  {
    id: "notif-sleep",
    title: "Sleep tracking synced",
    message: "Last night you logged 7h 32m of sleep. Your sleep consistency is improving this week.",
    time: "42 min ago",
    icon: "moon",
    color: "#8b5cf6",
    bg: "#f3e8ff",
    category: "Sleep",
    value: "7h 32m",
    unread: true,
  },
  {
    id: "notif-exercise",
    title: "Health track progress",
    message: "You completed 6k of your 10k step goal. A 20 minute walk will keep you on pace today.",
    time: "1 hour ago",
    icon: "dumbbell",
    color: "#10b981",
    bg: "#d1fae5",
    category: "Activity",
    value: "60%",
    unread: true,
  },
  {
    id: "notif-mood",
    title: "Mood check-in reminder",
    message: "You have not recorded your mood today yet. A quick check-in helps your doctor follow your progress.",
    time: "Today",
    icon: "heart",
    color: "#ec4899",
    bg: "#fce7f3",
    category: "Care plan",
    value: "Pending",
    unread: false,
  },
];

export const toolPages = {
  "/breathing": {
    title: "Breathing Exercises",
    headerTitle: "Deep Breathing",
    headerSubtitle: "Take control of your breath to reduce stress",
    icon: "wind",
    color: "#3b82f6",
    bg: "#dbeafe",
    sections: [
      {
        title: "Choose an Exercise",
        type: "list",
        items: [
          { title: "4-7-8 Breathing", subtitle: "Inhale for 4 seconds, hold for 7, exhale for 8", meta: "4 minutes", icon: "timer", toast: "4-7-8 Breathing exercise - Coming soon" },
          { title: "Box Breathing", subtitle: "Equal time for inhale, hold, exhale, hold", meta: "5 minutes", icon: "square", toast: "Box Breathing exercise - Coming soon" },
          { title: "Diaphragmatic Breathing", subtitle: "Deep belly breathing for relaxation", meta: "3 minutes", icon: "accessibility", toast: "Diaphragmatic Breathing exercise - Coming soon" },
        ],
      },
      {
        title: "Your Progress",
        type: "stats",
        items: [
          { label: "This Week", value: "5 sessions", color: "#6366f1" },
          { label: "Streak", value: "3 days", color: "#10b981" },
        ],
      },
    ],
  },
  "/journal": {
    title: "Journal",
    headerTitle: "Daily Reflections",
    headerSubtitle: "Express your thoughts and track your mood",
    icon: "book-open",
    color: "#8b5cf6",
    bg: "#f3e8ff",
    actions: [
      { title: "New Entry", icon: "edit", color: "#6366f1", toast: "New journal entry - Coming soon" },
      { title: "Mood Check", icon: "smile", color: "#8b5cf6", toast: "Mood check-in - Coming soon" },
    ],
    sections: [
      {
        title: "Recent Entries",
        type: "journal",
        items: [
          { date: "Today", title: "A peaceful morning", preview: "Started the day with meditation and felt more centered...", mood: "😊" },
          { date: "Yesterday", title: "Reflections on work", preview: "The meeting went well but I felt a bit anxious about...", mood: "😐" },
          { date: "2 days ago", title: "Grateful moments", preview: "Counting my blessings today - good health, loving family...", mood: "😄" },
        ],
      },
      {
        title: "Your Journal Stats",
        type: "stats",
        items: [
          { label: "This Week", value: "4 entries", color: "#6366f1" },
          { label: "Streak", value: "7 days", color: "#10b981" },
          { label: "Avg Mood", value: "7.2/10", color: "#f59e0b" },
          { label: "Total", value: "23 entries", color: "#ec4899" },
        ],
      },
    ],
  },
  "/exercise": {
    title: "Exercise",
    headerTitle: "Physical Activity",
    headerSubtitle: "Stay active and boost your mental health",
    icon: "dumbbell",
    color: "#10b981",
    bg: "#d1fae5",
    actions: [
      { title: "Start Workout", icon: "play", color: "#10b981", toast: "Start workout - Coming soon" },
      { title: "Log Activity", icon: "plus", color: "#6366f1", toast: "Log activity - Coming soon" },
    ],
    sections: [
      {
        title: "Exercise Categories",
        type: "list",
        items: [
          { title: "Cardio", subtitle: "Running, cycling, swimming", meta: "5 exercises", icon: "footprints", toast: "Cardio exercises - Coming soon" },
          { title: "Strength Training", subtitle: "Build muscle and strength", meta: "8 exercises", icon: "dumbbell", toast: "Strength training exercises - Coming soon" },
          { title: "Yoga & Flexibility", subtitle: "Improve flexibility and mindfulness", meta: "6 exercises", icon: "sparkles", toast: "Yoga exercises - Coming soon" },
          { title: "Walking", subtitle: "Simple daily walks for mental clarity", meta: "3 exercises", icon: "person-standing", toast: "Walking exercises - Coming soon" },
        ],
      },
      {
        title: "Today's Progress",
        type: "stats",
        items: [
          { label: "Active Minutes", value: "25 min", color: "#10b981" },
          { label: "Calories", value: "180 kcal", color: "#f59e0b" },
          { label: "Goal", value: "30 min", color: "#6366f1" },
          { label: "Streak", value: "5 days", color: "#8b5cf6" },
        ],
      },
      {
        title: "This Week",
        type: "days",
        days: ["M", "T", "W", "T", "F", "S", "S"],
        active: 5,
      },
    ],
  },
  "/sleep-log": {
    title: "Sleep Log",
    headerTitle: "Sleep Tracking",
    headerSubtitle: "Monitor your sleep patterns for better rest",
    icon: "moon",
    color: "#ec4899",
    bg: "#fce7f3",
    actions: [
      { title: "Log Sleep", icon: "plus", color: "#6366f1", toast: "Log sleep entry - Coming soon" },
      { title: "Sleep Tips", icon: "lightbulb", color: "#8b5cf6", toast: "Sleep tips - Coming soon" },
    ],
    sections: [
      {
        title: "Last Night's Sleep",
        type: "stats",
        items: [
          { label: "Duration", value: "7h 32m", color: "#6366f1" },
          { label: "Quality", value: "Good", color: "#10b981" },
          { label: "Bedtime", value: "10:30 PM", color: "#8b5cf6" },
          { label: "Wake up", value: "6:02 AM", color: "#f59e0b" },
        ],
      },
      {
        title: "Sleep History",
        type: "sleep",
        items: [
          { date: "Today", duration: "7h 32m", quality: "Good", bedtime: "10:30 PM" },
          { date: "Yesterday", duration: "6h 45m", quality: "Fair", bedtime: "11:15 PM" },
          { date: "2 days ago", duration: "8h 10m", quality: "Excellent", bedtime: "10:00 PM" },
        ],
      },
      {
        title: "This Week",
        type: "stats",
        items: [
          { label: "Average", value: "7h 15m", color: "#6366f1" },
          { label: "Best Night", value: "8h 10m", color: "#10b981" },
          { label: "Consistency", value: "85%", color: "#f59e0b" },
          { label: "Goal Met", value: "5/7 days", color: "#8b5cf6" },
        ],
      },
    ],
  },
  "/daily-goals": {
    title: "Daily Goals",
    headerTitle: "Your Daily Goals",
    headerSubtitle: "Track your progress and stay motivated",
    icon: "check-circle",
    color: "#10b981",
    bg: "#d1fae5",
    sections: [
      {
        title: "Today's Progress",
        type: "stats",
        items: [
          { label: "Completed", value: "3/5", color: "#10b981" },
          { label: "In Progress", value: "1/5", color: "#f59e0b" },
          { label: "Remaining", value: "1/5", color: "#6366f1" },
          { label: "Success Rate", value: "85%", color: "#8b5cf6" },
        ],
      },
      {
        title: "Today's Goals",
        type: "goals",
        items: [
          { title: "Morning Meditation", description: "10 minutes of mindfulness practice", progress: 1, status: "Done", time: "7:00 AM", color: "#10b981" },
          { title: "Drink 8 Glasses of Water", description: "Stay hydrated throughout the day", progress: 0.75, status: "In Progress", time: "All day", color: "#f59e0b" },
          { title: "Evening Walk", description: "30 minutes of light exercise", progress: 1, status: "Done", time: "6:00 PM", color: "#10b981" },
          { title: "Journal Entry", description: "Write about your day and feelings", progress: 0, status: "Pending", time: "9:00 PM", color: "#6366f1" },
          { title: "Read for 20 Minutes", description: "Relax with a good book before bed", progress: 0.5, status: "In Progress", time: "8:30 PM", color: "#f59e0b" },
        ],
      },
      {
        title: "Goal Categories",
        type: "stats",
        items: [
          { label: "Health", value: "3 goals", color: "#6366f1" },
          { label: "Mindfulness", value: "2 goals", color: "#8b5cf6" },
          { label: "Learning", value: "1 goal", color: "#ec4899" },
          { label: "Social", value: "0 goals", color: "#3b82f6" },
        ],
      },
    ],
  },
  "/recent-activity": {
    title: "Recent Activity",
    headerTitle: "Your Activity History",
    headerSubtitle: "Track your mental health journey",
    icon: "history",
    color: "#3b82f6",
    bg: "#dbeafe",
    sections: [
      {
        title: "Activity Summary",
        type: "stats",
        items: [
          { label: "This Week", value: "12 activities", color: "#6366f1" },
          { label: "This Month", value: "48 activities", color: "#10b981" },
          { label: "Most Active", value: "Journaling", color: "#8b5cf6" },
          { label: "Streak", value: "7 days", color: "#f59e0b" },
        ],
      },
      {
        title: "Recent Activities",
        type: "activity",
        items: [
          { title: "Completed Breathing Exercise", subtitle: "4-7-8 Breathing - 4 minutes", time: "2 hours ago", icon: "wind", color: "#6366f1" },
          { title: "Journal Entry Added", subtitle: "Daily reflection - Mood: 😊", time: "5 hours ago", icon: "book-open", color: "#8b5cf6" },
          { title: "Exercise Session Completed", subtitle: "Evening walk - 30 minutes", time: "Yesterday", icon: "dumbbell", color: "#10b981" },
          { title: "Sleep Log Updated", subtitle: "7h 32m sleep - Quality: Good", time: "Yesterday", icon: "moon", color: "#ec4899" },
          { title: "Goal Achieved", subtitle: "Morning meditation completed", time: "2 days ago", icon: "check-circle", color: "#6366f1" },
          { title: "Mood Check Completed", subtitle: "Feeling positive and energized", time: "2 days ago", icon: "smile", color: "#f59e0b" },
          { title: "Started New Goal", subtitle: "Read for 20 minutes daily", time: "3 days ago", icon: "flag", color: "#3b82f6" },
          { title: "Breathing Exercise", subtitle: "Box breathing - 5 minutes", time: "3 days ago", icon: "wind", color: "#6366f1" },
          { title: "Journal Entry Added", subtitle: "Weekly reflection and planning", time: "4 days ago", icon: "book-open", color: "#8b5cf6" },
          { title: "Exercise Session", subtitle: "Yoga practice - 25 minutes", time: "4 days ago", icon: "sparkles", color: "#10b981" },
        ],
      },
      {
        title: "Activity Breakdown",
        type: "breakdown",
        items: [
          { label: "Breathing", value: "8 sessions", progress: 0.33, color: "#6366f1" },
          { label: "Journal", value: "6 entries", progress: 0.25, color: "#8b5cf6" },
          { label: "Exercise", value: "5 sessions", progress: 0.21, color: "#10b981" },
          { label: "Sleep", value: "4 logs", progress: 0.17, color: "#ec4899" },
          { label: "Goals", value: "2 completed", progress: 0.04, color: "#3b82f6" },
        ],
      },
    ],
  },
};
