import { create } from 'zustand';
import { DeadlineEvent } from '@/types';

interface EventState {
  events: DeadlineEvent[];
  searchQuery: string;
  filterCategory: string;
  filterStatus: string;
  setEvents: (events: DeadlineEvent[]) => void;
  setSearchQuery: (q: string) => void;
  setFilterCategory: (c: string) => void;
  setFilterStatus: (s: string) => void;
  filteredEvents: () => DeadlineEvent[];
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  searchQuery: '',
  filterCategory: 'all',
  filterStatus: 'all',
  setEvents: (events) => set({ events }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  filteredEvents: () => {
    const { events, searchQuery, filterCategory, filterStatus } = get();
    return events.filter((e) => {
      const matchSearch = e.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchCat =
        filterCategory === 'all' || e.category === filterCategory;
      const matchStatus =
        filterStatus === 'all' || e.status === filterStatus;
      return matchSearch && matchCat && matchStatus;
    });
  },
}));
