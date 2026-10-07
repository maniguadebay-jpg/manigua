'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface FavoritesContextValue {
  favorites: Set<string>;
  toggle: (itemType: string, itemId: string) => void;
  isFavorite: (itemType: string, itemId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: new Set(),
  toggle: () => {},
  isFavorite: () => false,
});

export function useFavorites() {
  return useContext(FavoritesContext);
}

export const FavoritesProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/favorites')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.favorites)) {
          setFavorites(new Set(data.favorites.map((f: any) => `${f.itemType}:${f.itemId}`)));
        }
      })
      .catch(() => {});
  }, []);

  const toggle = useCallback((itemType: string, itemId: string) => {
    const key = `${itemType}:${itemId}`;
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemType, itemId }),
        }).catch(() => {});
      } else {
        next.add(key);
        fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemType, itemId }),
        }).catch(() => {});
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (itemType: string, itemId: string) => favorites.has(`${itemType}:${itemId}`),
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
