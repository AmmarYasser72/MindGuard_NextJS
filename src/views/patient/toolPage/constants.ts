export const panelClass =
  "rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5";
export const fieldClass = "grid gap-2 text-sm font-bold text-slate-700";
export const inputClass =
  "min-h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100";
export const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-violet-100";
export const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white shadow-sm shadow-violet-950/10 transition hover:bg-[#4f46e5] focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:bg-slate-300";

export const moodChoices = [
  { icon: "\u{1F620}", label: "Very Low", value: 1 },
  { icon: "\u{1F622}", label: "Low", value: 2 },
  { icon: "\u{1F610}", label: "Balanced", value: 3 },
  { icon: "\u{1F60A}", label: "Good", value: 4 },
  { icon: "\u{1F60D}", label: "Excellent", value: 5 },
];

export const exerciseLibrary = {
  Cardio: [
    {
      id: "cardio-jumping-jacks",
      title: "Jumping Jacks",
      subtitle: "Full-body cardio burst to raise your energy.",
      durationLabel: "45 sec",
      durationSeconds: 45,
      steps: [
        "Stand tall with feet together and hands by your sides.",
        "Jump feet apart while lifting arms overhead.",
        "Return to the starting position with soft knees.",
      ],
    },
    {
      id: "cardio-high-knees",
      title: "High Knees",
      subtitle: "Boost heart rate and coordination in place.",
      durationLabel: "40 sec",
      durationSeconds: 40,
      steps: [
        "Run in place and drive one knee up at a time.",
        "Keep your chest lifted and core engaged.",
        "Pump your arms to maintain rhythm.",
      ],
    },
    {
      id: "cardio-mountain-climbers",
      title: "Mountain Climbers",
      subtitle: "Quick core-focused cardio with steady breathing.",
      durationLabel: "30 sec",
      durationSeconds: 30,
      steps: [
        "Start in a high plank with wrists under shoulders.",
        "Drive one knee toward your chest, then switch.",
        "Move smoothly without letting hips bounce too high.",
      ],
    },
    {
      id: "cardio-skater-steps",
      title: "Skater Steps",
      subtitle: "Side-to-side movement for balance and endurance.",
      durationLabel: "50 sec",
      durationSeconds: 50,
      steps: [
        "Step or hop to one side and sweep the other leg behind.",
        "Land softly and shift your weight with control.",
        "Keep alternating at a comfortable pace.",
      ],
    },
    {
      id: "cardio-shadow-boxing",
      title: "Shadow Boxing",
      subtitle: "Fast upper-body cardio with a confidence boost.",
      durationLabel: "60 sec",
      durationSeconds: 60,
      steps: [
        "Stand in a relaxed split stance with hands up.",
        "Throw light jabs and crosses while pivoting gently.",
        "Stay loose in the shoulders and keep breathing.",
      ],
    },
    {
      id: "cardio-butt-kicks",
      title: "Butt Kicks",
      subtitle: "Light jogging pattern to warm up the legs.",
      durationLabel: "35 sec",
      durationSeconds: 35,
      steps: [
        "Jog in place and bring heels toward your glutes.",
        "Keep the movement light and springy.",
        "Swing your arms naturally to stay relaxed.",
      ],
    },
  ],
  "Strength Training": [
    {
      id: "strength-bodyweight-squats",
      title: "Bodyweight Squats",
      subtitle: "Foundational lower-body strength for daily movement.",
      durationLabel: "12 reps",
      durationSeconds: 45,
      steps: [
        "Stand with feet about hip-width apart.",
        "Sit back and down while keeping your chest open.",
        "Press through your heels to stand tall again.",
      ],
    },
    {
      id: "strength-wall-pushups",
      title: "Wall Pushups",
      subtitle: "Accessible upper-body work with low joint stress.",
      durationLabel: "10 reps",
      durationSeconds: 40,
      steps: [
        "Place hands on a wall slightly wider than shoulders.",
        "Bend elbows and bring your chest toward the wall.",
        "Push back with steady control.",
      ],
    },
    {
      id: "strength-glute-bridges",
      title: "Glute Bridges",
      subtitle: "Activate hips and support your lower back.",
      durationLabel: "12 reps",
      durationSeconds: 45,
      steps: [
        "Lie on your back with knees bent and feet grounded.",
        "Lift hips until your body forms a gentle line.",
        "Pause at the top before lowering slowly.",
      ],
    },
    {
      id: "strength-chair-dips",
      title: "Chair Dips",
      subtitle: "Triceps-focused movement using a stable chair.",
      durationLabel: "8 reps",
      durationSeconds: 35,
      steps: [
        "Sit at the edge of a sturdy chair and place hands beside hips.",
        "Slide forward and bend elbows to lower gently.",
        "Press upward without locking your elbows.",
      ],
    },
    {
      id: "strength-calf-raises",
      title: "Calf Raises",
      subtitle: "Simple lower-leg work for balance and stability.",
      durationLabel: "15 reps",
      durationSeconds: 30,
      steps: [
        "Stand tall and hold a wall or chair if needed.",
        "Lift onto the balls of your feet.",
        "Lower with control and repeat smoothly.",
      ],
    },
    {
      id: "strength-plank-hold",
      title: "Plank Hold",
      subtitle: "Core stability practice with quiet, steady effort.",
      durationLabel: "30 sec",
      durationSeconds: 30,
      steps: [
        "Set up on forearms or straight arms in a long line.",
        "Brace your core and keep your neck neutral.",
        "Hold steady while breathing slowly.",
      ],
    },
  ],
  "Yoga & Flexibility": [
    {
      id: "yoga-cat-cow",
      title: "Cat-Cow Flow",
      subtitle: "Gentle spinal movement to release tension.",
      durationLabel: "60 sec",
      durationSeconds: 60,
      steps: [
        "Begin on hands and knees with a neutral spine.",
        "Arch your back gently as you inhale.",
        "Round your spine softly as you exhale.",
      ],
    },
    {
      id: "yoga-childs-pose",
      title: "Child's Pose",
      subtitle: "Reset the breath and relax the back body.",
      durationLabel: "45 sec",
      durationSeconds: 45,
      steps: [
        "Kneel and send your hips back toward your heels.",
        "Reach your arms forward or rest them by your sides.",
        "Let each exhale soften your shoulders.",
      ],
    },
    {
      id: "yoga-seated-fold",
      title: "Seated Forward Fold",
      subtitle: "Slow hamstring stretch with a calming pace.",
      durationLabel: "40 sec",
      durationSeconds: 40,
      steps: [
        "Sit with legs extended and spine tall.",
        "Hinge forward from the hips without forcing depth.",
        "Rest where your breath still feels easy.",
      ],
    },
    {
      id: "yoga-low-lunge",
      title: "Low Lunge",
      subtitle: "Open the hips and counter long periods of sitting.",
      durationLabel: "35 sec each side",
      durationSeconds: 35,
      steps: [
        "Step one foot forward and lower the back knee.",
        "Shift forward until you feel a gentle stretch in the hip.",
        "Keep the chest lifted and shoulders relaxed.",
      ],
    },
    {
      id: "yoga-standing-side-bend",
      title: "Standing Side Bend",
      subtitle: "Lengthen the rib cage and wake up posture.",
      durationLabel: "30 sec each side",
      durationSeconds: 30,
      steps: [
        "Stand tall and reach one arm overhead.",
        "Lean softly to the opposite side.",
        "Return to center and switch sides.",
      ],
    },
    {
      id: "yoga-supine-twist",
      title: "Supine Twist",
      subtitle: "Easy spinal rotation to wind down gently.",
      durationLabel: "40 sec each side",
      durationSeconds: 40,
      steps: [
        "Lie on your back and hug one knee in.",
        "Guide it across your body while keeping shoulders heavy.",
        "Breathe slowly, then repeat on the other side.",
      ],
    },
  ],
  Walking: [
    {
      id: "walking-easy-stroll",
      title: "Easy Stroll",
      subtitle: "Low-pressure walk to reset your mind.",
      durationLabel: "3 min",
      durationSeconds: 45,
      steps: [
        "Start at a comfortable pace and let your arms swing naturally.",
        "Relax your jaw and shoulders as you move.",
        "Notice one helpful thought before you finish.",
      ],
    },
    {
      id: "walking-brisk-interval",
      title: "Brisk Interval Walk",
      subtitle: "Alternate a little speed with easy recovery.",
      durationLabel: "4 min",
      durationSeconds: 60,
      steps: [
        "Walk briskly for a short push.",
        "Ease your pace and recover with calm breathing.",
        "Repeat the pattern while keeping posture tall.",
      ],
    },
    {
      id: "walking-posture-walk",
      title: "Posture Reset Walk",
      subtitle: "Focus on alignment while staying gently active.",
      durationLabel: "2 min",
      durationSeconds: 40,
      steps: [
        "Walk with your eyes forward and chest open.",
        "Keep your steps even and light.",
        "Use each exhale to release neck tension.",
      ],
    },
    {
      id: "walking-mindful-steps",
      title: "Mindful Steps",
      subtitle: "Turn a short walk into a grounding exercise.",
      durationLabel: "3 min",
      durationSeconds: 50,
      steps: [
        "Notice how each foot meets the ground.",
        "Match your pace to a calm, steady breath.",
        "Let passing thoughts move on without chasing them.",
      ],
    },
    {
      id: "walking-cooldown-loop",
      title: "Cooldown Loop",
      subtitle: "Gentle finish after a more active session.",
      durationLabel: "2 min",
      durationSeconds: 35,
      steps: [
        "Slow your pace little by little.",
        "Shake out your hands and soften your shoulders.",
        "Finish with one deeper breath before stopping.",
      ],
    },
  ],
} as const;

export type ExerciseCategory = keyof typeof exerciseLibrary;
export type ExerciseDefinition =
  (typeof exerciseLibrary)[ExerciseCategory][number];
