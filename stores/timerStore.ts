import { create } from 'zustand';
import { sessionService } from '@/services/api/sessions';
import type { Session, SessionStats } from '@/types/api';
import * as Notifications from 'expo-notifications';

interface TimerState {
  // Timer state
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number; // seconds
  totalDuration: number; // seconds
  sessionType: 'focus' | 'break';

  // Current session
  currentSession: Session | null;
  selectedTagId: string | null;
  isStartingSession: boolean;

  // Stats (from last fetch)
  stats: SessionStats;
  isLoadingStats: boolean;

  // Actions
  startTimer: (durationMinutes: number, tagId?: string) => Promise<void>;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => Promise<void>;
  completeTimer: () => Promise<void>;
  tick: () => void;
  setSessionType: (type: 'focus' | 'break') => void;
  setTagId: (tagId: string | null) => void;
  fetchStats: () => Promise<void>;
  resetTimer: () => void;
}

const DEFAULT_STATS: SessionStats = {
  total_focus_minutes: 0,
  total_focus_hours: 0,
  weekly_sessions: 0,
  monthly_sessions: 0,
  current_streak: 0,
  longest_streak: 0,
  level: 1,
  xp: 0,
};

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  isPaused: false,
  timeRemaining: 25 * 60, // 25 minutes default
  totalDuration: 25 * 60,
  sessionType: 'focus',
  currentSession: null,
  selectedTagId: null,
  isStartingSession: false,
  stats: DEFAULT_STATS,
  isLoadingStats: false,

  startTimer: async (durationMinutes, tagId) => {
    set({ isStartingSession: true });
    try {
      // Cancel all active sessions (local + any server-side active sessions)
      const { currentSession } = get();

      // First cancel local session if exists
      if (currentSession) {
        try {
          await sessionService.cancel(currentSession.id);
        } catch {
          // Ignore errors
        }
      }

      // Then get and cancel any other active sessions from server
      try {
        const activeSessions = await sessionService.getActive();
        for (const session of activeSessions) {
          try {
            await sessionService.cancel(session.id);
          } catch {
            // Ignore individual cancel errors
          }
        }
      } catch {
        // Ignore errors fetching active sessions
      }

      const session = await sessionService.start({
        planned_duration: durationMinutes,
        session_type: get().sessionType,
        tag_id: tagId,
      });

      const totalSeconds = durationMinutes * 60;
      set({
        isRunning: true,
        isPaused: false,
        timeRemaining: totalSeconds,
        totalDuration: totalSeconds,
        currentSession: session,
        selectedTagId: tagId || null,
        isStartingSession: false,
      });

      // Schedule notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title:
            get().sessionType === 'focus'
              ? 'Focus Session Complete!'
              : 'Break Time Over!',
          body: 'Great job! Your timer has finished.',
          sound: true,
        },
        trigger: { seconds: totalSeconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
      });
    } catch (error) {
      set({ isStartingSession: false });
      throw error;
    }
  },

  pauseTimer: () => set({ isPaused: true }),

  resumeTimer: () => set({ isPaused: false }),

  stopTimer: async () => {
    const { currentSession } = get();
    if (currentSession) {
      try {
        await sessionService.cancel(currentSession.id);
      } catch {
        // Ignore errors when canceling
      }
    }
    set({
      isRunning: false,
      isPaused: false,
      currentSession: null,
      timeRemaining: get().totalDuration,
    });
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  completeTimer: async () => {
    const { currentSession } = get();
    if (currentSession) {
      try {
        await sessionService.complete(currentSession.id);
        // Fetch updated stats after completion
        await get().fetchStats();
      } catch {
        // Ignore errors
      }
    }
    set({
      isRunning: false,
      isPaused: false,
      currentSession: null,
    });
  },

  tick: () => {
    const { timeRemaining, isRunning, isPaused } = get();
    if (isRunning && !isPaused && timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 });
    } else if (isRunning && timeRemaining === 0) {
      get().completeTimer();
    }
  },

  setSessionType: (type) => {
    set({
      sessionType: type,
      timeRemaining: type === 'focus' ? 25 * 60 : 5 * 60,
      totalDuration: type === 'focus' ? 25 * 60 : 5 * 60,
    });
  },

  setTagId: (tagId) => set({ selectedTagId: tagId }),

  fetchStats: async () => {
    set({ isLoadingStats: true });
    try {
      const stats = await sessionService.getStats();
      set({ stats, isLoadingStats: false });
    } catch {
      set({ isLoadingStats: false });
    }
  },

  resetTimer: () => {
    const duration = get().sessionType === 'focus' ? 25 * 60 : 5 * 60;
    set({
      isRunning: false,
      isPaused: false,
      timeRemaining: duration,
      totalDuration: duration,
      currentSession: null,
    });
  },
}));
