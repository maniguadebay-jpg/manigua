import type { ReactNode } from "react";

export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-ink-950">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_20%_0%,#1d1521_0%,#0f0b10_55%,#08060a_100%)]" />
        <div className="absolute inset-0 grain opacity-30" />
      </div>
      {children}
    </div>
  );
}
