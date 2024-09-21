import dynamic from "next/dynamic";
import { Toaster } from "sonner";

const DynamicMonitorsContent = dynamic(
  () => import("@/components/MonitorsContent"),
  { ssr: false }
);

export default function MonitorsPage() {
  return (
    <>
      <DynamicMonitorsContent />
      <Toaster />
    </>
  );
}
