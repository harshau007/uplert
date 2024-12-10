import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

type Downtime = {
  startTime: string;
  endTime: string | null;
  duration: number;
};

type Website = {
  id: string;
  url: string;
  responseTime: number;
  statusCode: number;
  isActive: boolean;
  downtime: Downtime[];
};

type State = {
  websites: Website[];
  addWebsite: (url: string, interval: string) => string;
  updateWebsite: (id: string, data: Partial<Website>) => void;
  removeWebsite: (id: string) => void;
  stopMonitoring: (id: string) => void;
  addDowntime: (id: string, startTime: string) => void;
  updateDowntime: (id: string, endTime: string) => void;
};

export const useStore = create<State>((set) => ({
  websites: [],
  addWebsite: (url, interval) => {
    const id = uuidv4();
    set((state) => ({
      websites: [
        ...state.websites,
        {
          id,
          url,
          responseTime: 0,
          statusCode: 0,
          isActive: false,
          downtime: [],
        },
      ],
    }));
    return id;
  },
  updateWebsite: (id, data) =>
    set((state) => ({
      websites: state.websites.map((website) =>
        website.id === id ? { ...website, ...data } : website
      ),
    })),
  removeWebsite: (id) =>
    set((state) => ({
      websites: state.websites.filter((website) => website.id !== id),
    })),
  stopMonitoring: (id) =>
    set((state) => ({
      websites: state.websites.map((website) =>
        website.id === id ? { ...website, isActive: false } : website
      ),
    })),
  addDowntime: (id, startTime) =>
    set((state) => ({
      websites: state.websites.map((website) =>
        website.id === id
          ? {
              ...website,
              downtime: [
                ...website.downtime,
                { startTime, endTime: null, duration: 0 },
              ],
            }
          : website
      ),
    })),
  updateDowntime: (id, endTime) =>
    set((state) => ({
      websites: state.websites.map((website) =>
        website.id === id
          ? {
              ...website,
              downtime: website.downtime.map((dt, index) =>
                index === website.downtime.length - 1 && dt.endTime === null
                  ? {
                      ...dt,
                      endTime,
                      duration:
                        (new Date(endTime).getTime() -
                          new Date(dt.startTime).getTime()) /
                        60000,
                    }
                  : dt
              ),
            }
          : website
      ),
    })),
}));
