import { create } from 'zustand';
import { roomService } from '@/services/api/rooms';
import { wsService } from '@/services/websocket/client';
import type { Room, RoomParticipant, RoomState } from '@/types/api';
import type { WebSocketMessage } from '@/types/websocket';

interface RoomStoreState {
  // Current room
  currentRoom: Room | null;
  participants: RoomParticipant[];
  isInRoom: boolean;

  // Room lists
  myRooms: Room[];
  activeRooms: Room[];

  // Loading states
  isLoading: boolean;
  isJoining: boolean;
  isCreating: boolean;
  error: string | null;

  // WebSocket cleanup function
  wsCleanup: (() => void) | null;

  // Actions
  createRoom: (
    name: string,
    timerDuration: number,
    breakDuration: number
  ) => Promise<Room>;
  joinRoom: (roomCode: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  updateRoomState: (state: RoomState) => Promise<void>;
  fetchMyRooms: () => Promise<void>;
  fetchActiveRooms: () => Promise<void>;
  fetchParticipants: () => Promise<void>;
  setCurrentRoom: (room: Room | null) => void;
  updateState: (state: RoomState) => void;
  addParticipant: (participant: RoomParticipant) => void;
  removeParticipant: (userId: number) => void;
  clearError: () => void;
  cleanup: () => void;
  handleWebSocketMessage: (message: WebSocketMessage) => void;
}

export const useRoomStore = create<RoomStoreState>((set, get) => ({
  currentRoom: null,
  participants: [],
  isInRoom: false,
  myRooms: [],
  activeRooms: [],
  isLoading: false,
  isJoining: false,
  isCreating: false,
  error: null,
  wsCleanup: null,

  createRoom: async (name, timerDuration, breakDuration) => {
    set({ isCreating: true, error: null });
    try {
      const room = await roomService.create({
        name,
        timer_duration: timerDuration,
        break_duration: breakDuration,
      });
      set({ isCreating: false });
      return room;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create room';
      set({ error: message, isCreating: false });
      throw error;
    }
  },

  joinRoom: async (roomCode) => {
    set({ isJoining: true, error: null });
    try {
      const room = await roomService.join(roomCode);
      const participants = await roomService.getParticipants(room.id);

      // Connect to WebSocket
      await wsService.connect(room.id);

      // Set up message handler
      const removeHandler = wsService.addMessageHandler((message) => {
        get().handleWebSocketMessage(message);
      });

      set({
        currentRoom: room,
        participants,
        isInRoom: true,
        isJoining: false,
        wsCleanup: removeHandler,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to join room';
      set({ error: message, isJoining: false });
      throw error;
    }
  },

  leaveRoom: async () => {
    const { currentRoom, wsCleanup } = get();
    if (!currentRoom) return;

    try {
      await roomService.leave(currentRoom.id);
    } catch (error) {
      console.error('Failed to leave room:', error);
    }

    // Clean up WebSocket
    if (wsCleanup) {
      wsCleanup();
    }
    wsService.disconnect();

    set({
      currentRoom: null,
      participants: [],
      isInRoom: false,
      wsCleanup: null,
    });
  },

  updateRoomState: async (state) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    try {
      const updatedRoom = await roomService.updateState(currentRoom.id, state);
      set({ currentRoom: updatedRoom });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update room state';
      set({ error: message });
      throw error;
    }
  },

  fetchMyRooms: async () => {
    set({ isLoading: true });
    try {
      const rooms = await roomService.getMy();
      set({ myRooms: rooms, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch my rooms:', error);
      set({ isLoading: false });
    }
  },

  fetchActiveRooms: async () => {
    set({ isLoading: true });
    try {
      const rooms = await roomService.getActive();
      set({ activeRooms: rooms, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch active rooms:', error);
      set({ isLoading: false });
    }
  },

  fetchParticipants: async () => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    try {
      const participants = await roomService.getParticipants(currentRoom.id);
      set({ participants });
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    }
  },

  setCurrentRoom: (room) => set({ currentRoom: room }),

  updateState: (state) => {
    const { currentRoom } = get();
    if (currentRoom) {
      set({
        currentRoom: {
          ...currentRoom,
          current_state: state,
          timer_started_at:
            state === 'running' ? new Date().toISOString() : null,
        },
      });
    }
  },

  addParticipant: (participant) => {
    set((state) => ({
      participants: [...state.participants, participant],
    }));
  },

  removeParticipant: (userId) => {
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== userId),
    }));
  },

  clearError: () => set({ error: null }),

  cleanup: () => {
    const { wsCleanup } = get();
    if (wsCleanup) {
      wsCleanup();
    }
    wsService.disconnect();
    set({
      currentRoom: null,
      participants: [],
      isInRoom: false,
      wsCleanup: null,
    });
  },

  // Internal method for handling WebSocket messages
  handleWebSocketMessage: (message: WebSocketMessage) => {
    switch (message.type) {
      case 'room_state': {
        const payload = message.payload as {
          state: RoomState;
          timer_started_at: string | null;
        };
        const { currentRoom } = get();
        if (currentRoom) {
          set({
            currentRoom: {
              ...currentRoom,
              current_state: payload.state,
              timer_started_at: payload.timer_started_at,
            },
          });
        }
        break;
      }
      case 'participant_joined': {
        const payload = message.payload as {
          user_id: number;
          username: string;
        };
        get().addParticipant({
          id: payload.user_id,
          username: payload.username,
          avatar_url: null,
          joined_at: new Date().toISOString(),
        });
        break;
      }
      case 'participant_left': {
        const payload = message.payload as { user_id: number };
        get().removeParticipant(payload.user_id);
        break;
      }
      case 'session_completed': {
        // Handle session completion notification
        break;
      }
    }
  },
}));
