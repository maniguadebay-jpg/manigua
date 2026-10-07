export interface EntityConfig {
  labelSingular: string;
  labelPlural: string;
  description: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'url' | 'number' | 'date' | 'select' | 'boolean' | 'slug';
    required?: boolean;
    selectKey?: string;
  }>;
}

export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
  tracks: {
    labelSingular: 'Morceau',
    labelPlural: 'Morceaux',
    description: 'Catalogue audio : titres, artistes, albums, genres et statistiques.',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug' },
      { name: 'artistId', label: 'Artiste', type: 'select', selectKey: 'artists', required: true },
      { name: 'albumId', label: 'Album', type: 'select', selectKey: 'albums' },
      { name: 'genreId', label: 'Genre', type: 'select', selectKey: 'genres' },
      { name: 'audioUrl', label: 'URL audio', type: 'url', required: true },
      { name: 'coverUrl', label: 'URL pochette', type: 'url' },
      { name: 'durationSeconds', label: 'Durée (s)', type: 'number' },
      { name: 'releaseDate', label: 'Date de sortie', type: 'date' },
      { name: 'featured', label: 'Mis en avant', type: 'boolean' },
    ],
  },
  artists: {
    labelSingular: 'Artiste',
    labelPlural: 'Artistes',
    description: 'Fiches artistes : biographies, photos et réseaux sociaux.',
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug' },
      { name: 'bio', label: 'Biographie', type: 'textarea' },
      { name: 'coverUrl', label: 'URL photo', type: 'url' },
      { name: 'instagram', label: 'Instagram', type: 'url' },
      { name: 'youtube', label: 'YouTube', type: 'url' },
      { name: 'tiktok', label: 'TikTok', type: 'url' },
    ],
  },
  albums: {
    labelSingular: 'Album',
    labelPlural: 'Albums',
    description: 'Albums, EP, singles et mixtapes.',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug' },
      { name: 'artistId', label: 'Artiste', type: 'select', selectKey: 'artists', required: true },
      { name: 'coverUrl', label: 'URL pochette', type: 'url' },
      { name: 'releaseDate', label: 'Date de sortie', type: 'date' },
      { name: 'albumType', label: 'Type', type: 'select', selectKey: 'albumTypes' },
    ],
  },
  videos: {
    labelSingular: 'Clip',
    labelPlural: 'Clips',
    description: 'Clips officiels, freestyles et sessions live.',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug' },
      { name: 'artistId', label: 'Artiste', type: 'select', selectKey: 'artists', required: true },
      { name: 'videoUrl', label: 'URL vidéo', type: 'url', required: true },
      { name: 'thumbnailUrl', label: 'URL miniature', type: 'url' },
      { name: 'featured', label: 'Mis en avant', type: 'boolean' },
    ],
  },
  articles: {
    labelSingular: 'Article',
    labelPlural: 'Articles',
    description: 'Blog actualités : sorties, interviews, charts.',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug' },
      { name: 'category', label: 'Catégorie', type: 'text' },
      { name: 'excerpt', label: 'Extrait', type: 'textarea' },
      { name: 'content', label: 'Contenu', type: 'textarea' },
      { name: 'coverUrl', label: 'URL image', type: 'url' },
      { name: 'status', label: 'Statut', type: 'select', selectKey: 'articleStatuses' },
      { name: 'publishedAt', label: 'Date de publication', type: 'date' },
    ],
  },
  playlists: {
    labelSingular: 'Playlist',
    labelPlural: 'Playlists',
    description: 'Playlists éditoriales et sélections thématiques.',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'coverUrl', label: 'URL pochette', type: 'url' },
    ],
  },
  genres: {
    labelSingular: 'Genre',
    labelPlural: 'Genres',
    description: 'Genres musicaux : couper-décaler, afrobeats, mandingue…',
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug' },
      { name: 'emoji', label: 'Emoji', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  banners: {
    labelSingular: 'Bannière',
    labelPlural: 'Bannières',
    description: 'Carrousel de la page d\'accueil.',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'subtitle', label: 'Sous-titre', type: 'text' },
      { name: 'imageUrl', label: 'URL image', type: 'url', required: true },
      { name: 'linkUrl', label: 'URL lien', type: 'url' },
      { name: 'active', label: 'Actif', type: 'boolean' },
      { name: 'position', label: 'Position', type: 'number' },
    ],
  },
};

export const ENTITY_KEYS = Object.keys(ENTITY_CONFIGS);