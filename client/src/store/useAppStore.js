import { create } from 'zustand';
import { api } from '../api/client';

export const useAppStore = create((set, get) => ({
  profiles: [],
  events: [],
  currentProfileId: null,
  viewTimezone: 'America/New_York',
  loading: false, // initial app load
  refreshing: false, // background event refetch
  initialized: false, // has the first load completed (success or fail)
  error: null,

  setViewTimezone: (tz) => set({ viewTimezone: tz }),
  setCurrentProfileId: (id) => set({ currentProfileId: id }),
  clearError: () => set({ error: null }),

  async init() {
    set({ loading: true, error: null });
    try {
      const profiles = await api.listProfiles();
      set({
        profiles,
        currentProfileId: profiles[0]?.id || profiles[0]?._id || get().currentProfileId,
      });
      await get().refreshEvents();
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  async refreshEvents() {
    set({ refreshing: true });
    try {
      const res = await api.listEvents();
      set({ events: Array.isArray(res) ? res : res.items ?? [], error: null });
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ refreshing: false });
    }
  },

  async addProfile(name) {
    const profile = await api.createProfile({ name });
    set((state) => ({
      profiles: [...state.profiles, profile],
      currentProfileId: state.currentProfileId || profile._id,
    }));
    return profile;
  },


  async createEvent(payload) {
    await api.createEvent(payload);
    await get().refreshEvents().catch(() => {});
  },

  async updateEvent(id, payload) {
    await api.updateEvent(id, payload);
    await get().refreshEvents().catch(() => {});
  },
}));
