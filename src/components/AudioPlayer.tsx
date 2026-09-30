'use client';
import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

interface Track {
  id: string;
  title: string;
  artistName?: string;
  audioUrl?: string;
  coverUrl?: string;
  durationSeconds?: number;
}

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

interface PlayerContextValue extends PlayerState {
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  currentTrack: Track | null;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  return useContext(PlayerContext);
}

export const AudioPlayerProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
    audio.volume = 0.8;
    audioRef.current = audio;

    const onTimeUpdate = () => setState((s) => ({ ...s, currentTime: audio.currentTime }));
    const onDurationChange = () => setState((s) => ({ ...s, duration: audio.duration || 0 }));
    const onEnded = () => setState((s) => {
      const next = s.currentIndex + 1;
      if (next < s.queue.length) {
        const nextTrack = s.queue[next];
        if (nextTrack.audioUrl) {
          audio.src = nextTrack.audioUrl;
          audio.play().catch(() => {});
        }
        return { ...s, currentIndex: next, isPlaying: true };
      }
      return { ...s, isPlaying: false };
    });

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []);

  const play = useCallback((track: Track, queue?: Track[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newQueue = queue ?? [track];
    const idx = newQueue.findIndex((t) => t.id === track.id);
    if (track.audioUrl) {
      audio.src = track.audioUrl;
      audio.play().catch(() => {});
    }
    setState((s) => ({ ...s, queue: newQueue, currentIndex: idx >= 0 ? idx : 0, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
    setState((s) => ({ ...s, isPlaying: true }));
  }, []);

  const next = useCallback(() => {
    setState((s) => {
      const nextIdx = s.currentIndex + 1;
      if (nextIdx >= s.queue.length) return s;
      const track = s.queue[nextIdx];
      if (audioRef.current && track.audioUrl) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.play().catch(() => {});
      }
      return { ...s, currentIndex: nextIdx, isPlaying: true };
    });
  }, []);

  const prev = useCallback(() => {
    setState((s) => {
      const prevIdx = s.currentIndex - 1;
      if (prevIdx < 0) return s;
      const track = s.queue[prevIdx];
      if (audioRef.current && track.audioUrl) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.play().catch(() => {});
      }
      return { ...s, currentIndex: prevIdx, isPlaying: true };
    });
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    setState((s) => ({ ...s, currentTime: time }));
  }, []);

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) audioRef.current.volume = v;
    setState((s) => ({ ...s, volume: v }));
  }, []);

  const currentTrack = state.currentIndex >= 0 ? state.queue[state.currentIndex] ?? null : null;

  return (
    <PlayerContext.Provider value={{ ...state, play, pause, resume, next, prev, seek, setVolume, currentTrack }}>
      {children}
    </PlayerContext.Provider>
  );
};

const AudioPlayer: React.FC = () => {
  const player = usePlayer();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !player || !player.currentTrack) return null;

  const { currentTrack, isPlaying, currentTime, duration, volume, pause, resume, next, prev, seek, setVolume } = player;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-ink-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-xl items-center gap-4 px-4 py-3 md:gap-6 md:px-6">
        {currentTrack.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentTrack.coverUrl} alt={currentTrack.title} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-bold text-cream">{currentTrack.title}</p>
          <p className="truncate text-xs text-cream-mute">{currentTrack.artistName}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] tabular-nums text-cream-mute">
              {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer accent-mango-500"
            />
            <span className="text-[10px] tabular-nums text-cream-mute">
              {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button onClick={prev} className="text-cream-mute transition hover:text-cream" aria-label="Précédent">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </button>
          <button
            onClick={isPlaying ? pause : resume}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-mango-500 text-ink-950 transition hover:bg-mango-400"
            aria-label={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? (
              <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button onClick={next} className="text-cream-mute transition hover:text-cream" aria-label="Suivant">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/></svg>
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="hidden h-1 w-20 cursor-pointer accent-mango-500 md:block"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;