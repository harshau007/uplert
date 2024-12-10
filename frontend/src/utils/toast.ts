import { toast } from "sonner";

const toastHistory: { [key: string]: number } = {};

export const showLimitedToast = (websiteUrl: string, statusCode: number) => {
  const now = Date.now();
  const twoMinutesAgo = now - 2 * 60 * 1000;

  // Clean up old entries
  Object.keys(toastHistory).forEach((key) => {
    if (toastHistory[key] < twoMinutesAgo) {
      delete toastHistory[key];
    }
  });

  // Count recent toasts for this website
  const recentToasts = Object.values(toastHistory).filter(
    (time) => time > twoMinutesAgo
  ).length;

  if (recentToasts < 2) {
    toast.error(`${websiteUrl} returned status ${statusCode}`, {
      description: "The website might be experiencing issues.",
    });
    toastHistory[`${websiteUrl}-${now}`] = now;
  }
};
