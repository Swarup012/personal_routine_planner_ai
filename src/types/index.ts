// Type definitions for the application
export interface UserDetails {
  name: string;
  age: number;
  occupation: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  timeFrame: string;
  createdAt: string;
}

export interface DailyRoutine {
  id: string;
  date: string;
  description: string;
  todos: TodoItem[];
}

export type ThemeMode = "light" | "dark";

export interface AppState {
  userDetails: UserDetails | null;
  apiKey: string | null;
  routines: DailyRoutine[];
  currentRoutine: DailyRoutine | null;
  isOnboarded: boolean;
  themeMode: ThemeMode;
}