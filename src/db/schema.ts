// Drizzle ORM schema — mirrors maniguadebaby-v1.sql
// Using 'any' typed table objects for compatibility with placeholder db
// Replace with actual drizzle-orm schema when connecting to real database

export const profiles = {
  id: 'id',
  email: 'email',
  role: 'role',
  passwordHash: 'password_hash',
  displayName: 'display_name',
  avatarUrl: 'avatar_url',
  city: 'city',
  bio: 'bio',
  createdAt: 'created_at',
} as any;

export const artists = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  bio: 'bio',
  coverUrl: 'cover_url',
  bannerUrl: 'banner_url',
  accent: 'accent',
  verified: 'verified',
  followers: 'followers',
  monthlyListeners: 'monthly_listeners',
  instagram: 'instagram',
  youtube: 'youtube',
  tiktok: 'tiktok',
  createdAt: 'created_at',
} as any;

export const genres = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  emoji: 'emoji',
  description: 'description',
  colorFrom: 'color_from',
  colorTo: 'color_to',
} as any;

export const tracks = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  artistId: 'artist_id',
  albumId: 'album_id',
  genreId: 'genre_id',
  audioUrl: 'audio_url',
  coverUrl: 'cover_url',
  durationSeconds: 'duration_seconds',
  plays: 'plays',
  likes: 'likes',
  releaseDate: 'release_date',
  featured: 'featured',
  trending: 'trending',
  createdAt: 'created_at',
} as any;

export const albums = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  artistId: 'artist_id',
  coverUrl: 'cover_url',
  albumType: 'album_type',
  releaseDate: 'release_date',
  description: 'description',
  createdAt: 'created_at',
} as any;

export const videos = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  artistId: 'artist_id',
  videoUrl: 'video_url',
  thumbnailUrl: 'thumbnail_url',
  views: 'views',
  featured: 'featured',
  durationSeconds: 'duration_seconds',
  createdAt: 'created_at',
} as any;

export const playlists = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  description: 'description',
  coverUrl: 'cover_url',
  createdAt: 'created_at',
} as any;

export const playlistTracks = {
  playlistId: 'playlist_id',
  trackId: 'track_id',
  position: 'position',
} as any;

export const articles = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  excerpt: 'excerpt',
  content: 'content',
  category: 'category',
  author: 'author',
  coverUrl: 'cover_url',
  status: 'status',
  publishedAt: 'published_at',
  views: 'views',
  createdAt: 'created_at',
} as any;

export const banners = {
  id: 'id',
  title: 'title',
  subtitle: 'subtitle',
  imageUrl: 'image_url',
  linkUrl: 'link_url',
  active: 'active',
  position: 'position',
  createdAt: 'created_at',
} as any;

export const newsletterSignups = {
  id: 'id',
  email: 'email',
  createdAt: 'created_at',
} as any;

export const favorites = {
  id: 'id',
  userId: 'user_id',
  visitorId: 'visitor_id',
  itemType: 'item_type',
  itemId: 'item_id',
  trackId: 'track_id',
  createdAt: 'created_at',
} as any;

export const playEvents = {
  id: 'id',
  userId: 'user_id',
  visitorId: 'visitor_id',
  trackId: 'track_id',
  seconds: 'seconds',
  source: 'source',
  playedAt: 'played_at',
} as any;

export const contactMessages = {
  id: 'id',
  kind: 'kind',
  name: 'name',
  email: 'email',
  organization: 'organization',
  phone: 'phone',
  artist: 'artist',
  eventDate: 'event_date',
  budget: 'budget',
  message: 'message',
  status: 'status',
  createdAt: 'created_at',
} as any;