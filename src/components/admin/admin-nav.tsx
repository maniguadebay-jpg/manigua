'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DiscIcon, MicIcon, VideoIcon, NewsIcon, QueueIcon, DashboardIcon, UserIcon } from '../icons';

const NAV_ITEMS = [
  { href: '/admin', label: 'Tableau de bord', Icon: DashboardIcon, exact: true },
  { href: '/admin/tracks', label: 'Morceaux', Icon: DiscIcon },
  { href: '/admin/artists', label: 'Artistes', Icon: MicIcon },
  { href: '/admin/albums', label: 'Albums', Icon: DiscIcon },
  { href: '/admin/videos', label: 'Clips', Icon: VideoIcon },
  { href: '/admin/articles', label: 'Articles', Icon: NewsIcon },
  { href: '/admin/playlists', label: 'Playlists', Icon: QueueIcon },
  { href: '/admin/genres', label: 'Genres', Icon: DiscIcon },
  { href: '/admin/banners', label: 'Bannières', Icon: DiscIcon },
  { href: '/admin/publier', label: 'Publier', Icon: DiscIcon },
];

interface AdminNavProps {
  userName?: string;
}

export const AdminNav: React.FC<AdminNavProps> = ({ userName }) => {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  };

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-white/10 bg-ink-950/80 lg:h-screen lg:w-60 lg:border-b-0 lg:border-r lg:sticky lg:top-0">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <Link href="/" className="font-display text-lg uppercase text-cream hover:text-mango-400 transition">
          Maniguadebaby
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.12em] transition ${
                isActive(item.href, item.exact)
                  ? 'bg-mango-500/15 text-mango-400' :'text-cream-dim hover:bg-white/5 hover:text-cream'
              }`}
            >
              <item.Icon width={15} height={15} />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mango-500/20">
            <UserIcon width={14} height={14} className="text-mango-400" />
          </div>
          <span className="min-w-0 flex-1 truncate text-[12px] text-cream-dim">{userName ?? 'Admin'}</span>
          <button
            onClick={handleLogout}
            className="text-[11px] font-bold uppercase tracking-widest text-cream-mute transition hover:text-red-400"
          >
            Quitter
          </button>
        </div>
      </div>
    </aside>
  );
};
