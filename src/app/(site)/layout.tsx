import type { ReactNode } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { AudioPlayerProvider } from "../../components/AudioPlayer";
import AudioPlayer from "../../components/AudioPlayer";
import { FavoritesProvider } from "../../components/favorites-provider";
import { WhatsAppFloat } from "../../components/whatsapp-float";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <AudioPlayerProvider>
      <FavoritesProvider>
        <div className="relative flex min-h-screen flex-col pb-[78px] md:pb-[92px]">
          <div className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#2A2110_0%,#12100A_45%,#0B0906_100%)]" />
            <div className="absolute inset-0 opacity-[0.35] grain" />
          </div>
          <SiteHeader />
          <main className="flex-1 pt-[76px]">{children}</main>
          <SiteFooter />
          <AudioPlayer />
          <WhatsAppFloat />
        </div>
      </FavoritesProvider>
    </AudioPlayerProvider>
  );
}
