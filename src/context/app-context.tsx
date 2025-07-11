import React, { createContext, useContext, useEffect, useState } from "react";
import { DailyRoutine, ThemeMode, TodoItem, UserDetails } from "@/types";
import {
  getDefaultAppState,
  loadAppState,
  saveApiKey,
  clearApiKey,
  saveRoutine,
  saveThemeMode,
  saveUserDetails,
  updateTodoItem,
  deleteRoutine,
} from "@/lib/storage";
import { setTheme, initializeTheme } from "@/lib/theme";

interface AppContextProps {
  userDetails: UserDetails | null;
  apiKey: string | null;
  routines: DailyRoutine[];
  currentRoutine: DailyRoutine | null;
  isOnboarded: boolean;
  themeMode: ThemeMode;
  selectedProvider: string;
  setUserDetails: (details: UserDetails | null) => void;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  generateRoutine: (routine: DailyRoutine) => void;
  setCurrentRoutine: (routine: DailyRoutine) => void;
  updateTodoStatus: (routineId: string, todoId: string, completed: boolean) => void;
  toggleTheme: () => void;
  setSelectedProvider: (provider: string) => void;
  deleteAllTodos: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppState] = useState(() => {
    const savedState = loadAppState();
    return savedState || getDefaultAppState();
  });

  const [selectedProvider, setSelectedProviderState] = useState<string>('gemini');

  useEffect(() => {
    initializeTheme();
    setTheme(appState.themeMode);
  }, []);

  const handleSetUserDetails = (details: UserDetails | null) => {
    saveUserDetails(details);
    setAppState((prev) => ({
      ...prev,
      userDetails: details,
      isOnboarded: true,
    }));
  };

  const handleSetApiKey = (key: string) => {
    saveApiKey(key);
    setAppState((prev) => ({
      ...prev,
      apiKey: key,
    }));
  };

  const handleClearApiKey = () => {
    clearApiKey();
    setAppState((prev) => ({
      ...prev,
      apiKey: null,
    }));
  };

  const handleGenerateRoutine = (routine: DailyRoutine) => {
    saveRoutine(routine);
    setAppState((prev) => {
      const existingRoutineIndex = prev.routines.findIndex(
        (r) => r.id === routine.id
      );

      let updatedRoutines;
      if (existingRoutineIndex >= 0) {
        updatedRoutines = [...prev.routines];
        updatedRoutines[existingRoutineIndex] = routine;
      } else {
        updatedRoutines = [...prev.routines, routine];
      }

      return {
        ...prev,
        routines: updatedRoutines,
        currentRoutine: routine,
      };
    });
  };

  const handleUpdateTodoStatus = (
    routineId: string,
    todoId: string,
    completed: boolean
  ) => {
    setAppState((prev) => {
      const routineIndex = prev.routines.findIndex((r) => r.id === routineId);
      if (routineIndex < 0) return prev;

      const routine = prev.routines[routineIndex];
      const todoIndex = routine.todos.findIndex((t) => t.id === todoId);
      if (todoIndex < 0) return prev;

      const updatedTodo: TodoItem = {
        ...routine.todos[todoIndex],
        completed,
      };

      const updatedTodos = [...routine.todos];
      updatedTodos[todoIndex] = updatedTodo;

      const updatedRoutine: DailyRoutine = {
        ...routine,
        todos: updatedTodos,
      };

      const updatedRoutines = [...prev.routines];
      updatedRoutines[routineIndex] = updatedRoutine;

      // Also update in storage
      updateTodoItem(routineId, updatedTodo);

      return {
        ...prev,
        routines: updatedRoutines,
        currentRoutine:
          prev.currentRoutine?.id === routineId
            ? updatedRoutine
            : prev.currentRoutine,
      };
    });
  };

  const handleSetCurrentRoutine = (routine: DailyRoutine) => {
    setAppState((prev) => ({
      ...prev,
      currentRoutine: routine,
    }));
  };

  const handleToggleTheme = () => {
    const newTheme: ThemeMode = appState.themeMode === "dark" ? "light" : "dark";
    setTheme(newTheme);
    saveThemeMode(newTheme);
    setAppState((prev) => ({
      ...prev,
      themeMode: newTheme,
    }));
  };

  const handleSetSelectedProvider = (provider: string) => {
    setSelectedProviderState(provider);
  };

  const handleDeleteAllTodos = () => {
    setAppState((prev) => {
      if (!prev.currentRoutine) return prev;
      // Remove the current routine from the routines list
      const updatedRoutines = prev.routines.filter(r => r.id !== prev.currentRoutine!.id);
      // Remove from storage as well
      deleteRoutine(prev.currentRoutine.id);
      return {
        ...prev,
        routines: updatedRoutines,
        currentRoutine: null,
      };
    });
  };

  const value: AppContextProps = {
    ...appState,
    selectedProvider,
    setUserDetails: handleSetUserDetails,
    setApiKey: handleSetApiKey,
    clearApiKey: handleClearApiKey,
    generateRoutine: handleGenerateRoutine,
    setCurrentRoutine: handleSetCurrentRoutine,
    updateTodoStatus: handleUpdateTodoStatus,
    toggleTheme: handleToggleTheme,
    setSelectedProvider: handleSetSelectedProvider,
    deleteAllTodos: handleDeleteAllTodos,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};