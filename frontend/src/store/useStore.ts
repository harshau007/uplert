import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

type Check = {
  timestamp: string;
  responseTime: number;
  statusCode: number;
};

type Website = {
  id: string;
  url: string;
  interval: string;
  checks: Check[];
  isActive: boolean;
};

type State = {
  websites: Website[];
  addWebsite: (url: string, interval: string) => string;
  updateWebsiteCheck: (id: string, check: Check) => void;
  removeWebsite: (id: string) => void;
  pauseWebsite: (id: string) => void;
  resumeWebsite: (id: string) => void;
};

export const useStore = create<State>((set) => ({
  websites: [],
  addWebsite: (url, interval) => {
    const id = uuidv4();
    set((state) => ({
      websites: [
        ...state.websites,
        { id, url, interval, checks: [], isActive: true },
      ],
    }));
    return id;
  },
  updateWebsiteCheck: (id, check) =>
    set((state) => ({
      websites: state.websites.map((website) =>
        website.id === id
          ? { ...website, checks: [...website.checks, check].slice(-1000) }
          : website
      ),
    })),
  removeWebsite: (id) =>
    set((state) => ({
      websites: state.websites.filter((website) => website.id !== id),
    })),
  pauseWebsite: (id) =>
    set((state) => ({
      websites: state.websites.map((website) =>
        website.id === id ? { ...website, isActive: false } : website
      ),
    })),
  resumeWebsite: (id) =>
    set((state) => ({
      websites: state.websites.map((website) =>
        website.id === id ? { ...website, isActive: true } : website
      ),
    })),
}));
