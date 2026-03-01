# 🎉 Chirper - Gen Z Micro-Blogging Platform

A bold, playful, and gamified micro-blogging platform designed for Gen Z with vibrant aesthetics, micro-interactions, and engaging features.

## ✨ Features

### Core Functionality
- **Authentication**: Login and registration with bio support
- **Feed**: Infinite scroll timeline with chirps (tweets)
- **Chirps**: Create, like, retweet, and comment on chirps
- **Profile**: View and edit user profiles with stats
- **Explore**: Discover trending topics
- **Notifications**: See interactions from other users

### Gamification Elements
- **XP System**: Earn experience points for actions
- **Levels**: Progress through levels based on XP
- **Streaks**: Track daily activity with fire icons
- **Badges**: Unlock achievements for milestones

### Design Features
- **Dark-First Theme**: Vibrant purple, coral, blue, and lime gradients
- **Glassmorphism**: Translucent surfaces with backdrop blur
- **Micro-Animations**: Playful interactions with Motion (Framer Motion)
- **Rounded Typography**: Fredoka for headers, DM Sans for body
- **Mobile-First**: Optimized for mobile with bottom navigation

## 🎨 Design System

### Colors
- **Primary**: Electric Purple (#A78BFA)
- **Secondary**: Coral Pink (#FB7185)
- **Accent**: Electric Blue (#60A5FA)
- **Success**: Lime Green (#84CC16) for streaks
- **Background**: Deep Purple (#0F0A1E)

### Components
- ChirpCard with nested retweets
- ChirpComposer with circular character counter
- UserAvatar with level badges and streak indicators
- BottomNav with active state animations
- Loading skeletons with shimmer effects
- Achievement notifications

## 🚀 Mock Data

The app uses mock data services that simulate the provided API structure:
- `/auth/*` - Authentication endpoints
- `/users/*` - User management
- `/tweets/*` - Chirp CRUD operations
- `/feed` - Infinite scroll feed with cursor pagination

## 📱 Screens

1. **Auth Screen**: Login/Register with smooth transitions
2. **Feed Screen**: Main timeline with infinite scroll
3. **Chirp Detail**: Single chirp view with comment thread
4. **Profile Screen**: User stats, XP, level, streak, and badges
5. **Explore Screen**: Trending topics and search
6. **Notifications Screen**: Activity feed

## 🎮 Gamification

- **+10 XP** for creating a chirp
- **+5 XP** for commenting
- **Level up** every 500 XP
- **Daily streaks** for consistent activity
- **Badges** for achievements (First Chirp, Early Bird, etc.)

## 🛠️ Tech Stack

- React with TypeScript
- React Router (Data Mode)
- Motion (Framer Motion) for animations
- Tailwind CSS v4
- Lucide React for icons
- Sonner for toast notifications
- date-fns for date formatting

## 📝 Notes

This is a frontend-only demo with mock data. To connect to a real backend, replace the mock data services in `/src/app/services/mockData.ts` with actual API calls to the endpoints described in the project overview.
