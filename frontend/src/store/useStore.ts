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

type RunningWebsite = {
  siteId: string;
  projectId: string;
  url: string;
  interval: string;
  status: string | null;
};

type State = {
  websites: Website[];
  addWebsite: (url: string, interval: string) => string;
  updateWebsiteCheck: (id: string, check: Check) => void;
  removeWebsite: (id: string) => void;
  pauseWebsite: (id: string) => void;
  resumeWebsite: (id: string) => void;
  syncRunningWebsites: (runningWebsites: RunningWebsite[]) => void;
  pauseAllWebsites: () => void;
  resumeAllWebsites: () => void;
  getWebsiteById: (id: string) => Website | undefined;
  deleteWebsite: (id: string) => void;
};

export const useStore = create<State>((set, get) => ({
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
          ? { ...website, checks: [check, ...website.checks].slice(0, 1000) }
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
  syncRunningWebsites: (runningWebsites) =>
    set((state) => {
      const updatedWebsites = state.websites.map((website) => {
        const runningWebsite = runningWebsites.find(
          (rw) => rw.projectId === website.id
        );
        if (runningWebsite) {
          return {
            ...website,
            isActive: runningWebsite.status === null,
            interval: runningWebsite.interval,
          };
        }
        return website;
      });

      const newWebsites = runningWebsites
        .filter((rw) => !state.websites.some((w) => w.id === rw.projectId))
        .map((rw) => ({
          id: rw.projectId,
          url: rw.url,
          interval: rw.interval,
          checks: [],
          isActive: rw.status === null,
        }));

      return {
        websites: [...updatedWebsites, ...newWebsites],
      };
    }),
  pauseAllWebsites: () =>
    set((state) => ({
      websites: state.websites.map((website) => ({
        ...website,
        isActive: false,
      })),
    })),
  resumeAllWebsites: () =>
    set((state) => ({
      websites: state.websites.map((website) => ({
        ...website,
        isActive: true,
      })),
    })),
  getWebsiteById: (id) => {
    return get().websites.find((website) => website.id === id);
  },
  deleteWebsite: (id) =>
    set((state) => ({
      websites: state.websites.filter((website) => website.id !== id),
    })),
}));
