# MindGuard Next.js Frontend

MindGuard is a Next.js-based mental health support interface for patients and doctors. The application includes onboarding, authentication, patient wellness dashboards, analytics views, guided wellness tools, a NOVA chat experience, and doctor monitoring screens.

This repository contains the frontend application built with Next.js App Router, TypeScript, and Tailwind CSS.

## Features

- Patient and doctor authentication flows
- Backend-connected authentication against the local NestJS API
- Patient dashboard with mood tracking, wellness metrics, goals, and recent activity
- Analytics screens for mood, stress, anxiety, sleep, and depression insights
- Patient chat with backend history bootstrap, Socket.IO streaming, and local fallback support
- Doctor dashboard with patient monitoring, sessions, and care workflow screens
- Reusable UI primitives, icons, charts, cards, modals, and toast notifications
- Responsive mobile-first layouts with a bottom navigation experience

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Fetch API
- Socket.IO Client

## Project Structure

```text
app/
  (auth)/                         App Router auth routes
  doctor-dashboard/               Doctor dashboard route
  patient-dashboard/              Patient dashboard route
  patient-chat/[email]/           Patient chat route
  layout.tsx                      Root layout
  page.tsx                        App entry route
src/
  components/
    auth/                         Authentication form components
    common/                       Shared UI primitives, icons, charts, modal, toast
    doctor/                       Doctor-specific reusable components
    patient/                      Patient-specific reusable cards and layouts
  data/                           Static dashboard, analytics, onboarding, and doctor data
  hooks/                          Auth and navigation hooks
  providers/                      Auth and toast providers
  services/                       API, auth, chat, session, socket, and storage services
  types/                          Shared TypeScript types
  utils/                          Shared helper utilities
  views/                          Route-level client views
public/
  assets/                         Static images and icons
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
git clone https://github.com/AmmarYasser72/MindGuard_NextJS
cd MindGuard_NextJS
npm install
```

### Development

```bash
npm run dev
```

The Next.js development server runs on:

```text
http://localhost:4000
```

The frontend expects the NestJS backend to run locally on:

```text
http://localhost:3000
```

For local development, keep frontend HTTP calls on `/api` and Socket.IO on `/socket.io` so Next.js can rewrite both to the NestJS server. This avoids changing backend CORS or endpoint behavior. If your NestJS backend uses another port, set this in `.env.local`:

```text
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
BACKEND_PROXY_TARGET=http://localhost:3000
```

The frontend does not call the AI server directly. The NestJS backend should be configured with its own AI service URL that points to the local AI backend, commonly:

```text
AI_SERVICE_URL=http://localhost:8000
```

### Production Build

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

## Available Scripts

```text
npm run dev        Start the local Next.js development server on port 4000
npm run build      Create a production build
npm run start      Start the production server on port 4000
npm run lint       Run ESLint across the project
```

## Environment Variables

Create `.env.local` when needed:

```text
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_BASE_URL=
BACKEND_PROXY_TARGET=http://localhost:3000
```

## Demo Accounts

```text
Patient: patient@demo.com / demo123
Doctor:  doctor@demo.com  / demo123
```

## License

Graduation project by Ammar Yasser.
