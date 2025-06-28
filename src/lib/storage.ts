// Local storage utilities for persisting app state
import { AppState, DailyRoutine, ThemeMode, TodoItem, UserDetails } from "../types";

const APP_STORAGE_KEY = "routine-planner-app-state";

export function saveAppState(state: AppState): void {
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
}

export function loadAppState(): AppState | null {
  const storedState = localStorage.getItem(APP_STORAGE_KEY);
  if (!storedState) return null;
  
  try {
    return JSON.parse(storedState) as AppState;
  } catch (error) {
    console.error("Failed to parse app state from localStorage:", error);
    return null;
  }
}

export function saveUserDetails(userDetails: UserDetails): void {
  const appState = loadAppState() || getDefaultAppState();
  saveAppState({
    ...appState,
    userDetails,
    isOnboarded: !!userDetails,
  });
}

export function saveApiKey(apiKey: string): void {
  const appState = loadAppState() || getDefaultAppState();
  saveAppState({
    ...appState,
    apiKey,
  });
}

export function saveThemeMode(themeMode: ThemeMode): void {
  const appState = loadAppState() || getDefaultAppState();
  saveAppState({
    ...appState,
    themeMode,
  });
}

export function saveRoutine(routine: DailyRoutine): void {
  const appState = loadAppState() || getDefaultAppState();
  const existingRoutineIndex = appState.routines.findIndex(r => r.id === routine.id);
  
  if (existingRoutineIndex >= 0) {
    // Update existing routine
    const updatedRoutines = [...appState.routines];
    updatedRoutines[existingRoutineIndex] = routine;
    
    saveAppState({
      ...appState,
      routines: updatedRoutines,
      currentRoutine: routine,
    });
  } else {
    // Add new routine
    saveAppState({
      ...appState,
      routines: [...appState.routines, routine],
      currentRoutine: routine,
    });
  }
}

export function updateTodoItem(routineId: string, todoItem: TodoItem): void {
  const appState = loadAppState() || getDefaultAppState();
  const routineIndex = appState.routines.findIndex(r => r.id === routineId);
  
  if (routineIndex >= 0) {
    const routine = appState.routines[routineIndex];
    const todoIndex = routine.todos.findIndex(t => t.id === todoItem.id);
    
    if (todoIndex >= 0) {
      // Update existing todo
      const updatedTodos = [...routine.todos];
      updatedTodos[todoIndex] = todoItem;
      
      const updatedRoutine = {
        ...routine,
        todos: updatedTodos,
      };
      
      const updatedRoutines = [...appState.routines];
      updatedRoutines[routineIndex] = updatedRoutine;
      
      saveAppState({
        ...appState,
        routines: updatedRoutines,
        currentRoutine: routineId === appState.currentRoutine?.id ? updatedRoutine : appState.currentRoutine,
      });
    }
  }
}

export function getDefaultAppState(): AppState {
  return {
    userDetails: null,
    apiKey: null,
    routines: [],
    currentRoutine: null,
    isOnboarded: false,
    themeMode: "light",
  };
}