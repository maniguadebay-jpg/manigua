import Link from "next/link";
import { count } from "drizzle-orm";
import type { Metadata } from "next";
import { db } from "@/db";
import { favorites, playEvents, profiles } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { getSiteStats } from "@/lib/queries";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";
import { AmbianceSwitch, SqlViewer } from "@/components/projet-widgets";
import { ArrowRightIcon, CompassIcon, DiscIcon, MicIcon, SparkIcon, QueueIcon } from "@/components/icons";
import { formatCompactNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Architecture & base de données du projet",
  description:
    "Le socle technique de Maniguadebaby : modèle de données PostgreSQL/Supabase, script SQL complet en un clic, plan d'hébergement, nom de domaine et identité visuelle.",
};

const CORE_TABLES = [
  {
    name: "profiles",
    ddl: "id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY\nemail TEXT UNIQUE NOT NULL\nrole TEXT DEFAULT 'fan' CHECK (role IN ('fan','admin'))\ncreated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())",
    added:
      "Trigger Supabase handle_new_user() : le profil est créé automatiquement à l'inscription. Ajouts optionnels : display_name, avatar_url, city, phone, bio, is_verified.",
  },
  {
    name: "artists",
    ddl: "id UUID DEFAULT gen_random_uuid() PRIMARY KEY\nname TEXT NOT NULL\nbio TEXT\navatar_url TEXT\ncreated_at TIMESTAMPTZ",
    added:
      "slug unique (SEO), cover_url lu par l'application (alias d'avatar_url), bannière, couleur d'accent de la fiche, réseaux sociaux, followers et auditeurs mensuels.",
  },
  {
    name: "genres",
    ddl: "id SERIAL PRIMARY KEY\nname TEXT UNIQUE NOT NULL\nslug TEXT UNIQUE NOT NULL",
    added:
      "description, emoji et dégradé de deux couleurs : ce sont eux qui habillent les tuiles de la page Découverte.",
  },
  {
    name: "tracks",
    ddl: "id UUID DEFAULT gen_random_uuid() PRIMARY KEY\ntitle TEXT NOT NULL\naudio_url TEXT NOT NULL\nduration INT -- secondes\ncover_url TEXT\nartist_id UUID REFERENCES artists ON DELETE CASCADE\ngenre_id INT REFERENCES genres ON DELETE SET NULL",
    added:
      "slug, album_id, plays/likes, release_date, drapeaux featured·trending·explicit, position de piste. Un trigger synchronise duration ↔ duration_seconds pour ne casser aucun client.",
  },
  {
    name: "favorites",
    ddl: "id UUID DEFAULT gen_random_uuid() PRIMARY KEY\nuser_id UUID REFERENCES profiles ON DELETE CASCADE\ntrack_id UUID REFERENCES tracks ON DELETE CASCADE\nUNIQUE(user_id, track_id)",
    added:
      "Extension V1 : visitor_id + item_type/item_id. Un cœur posé avant inscription est conservé puis fusionné dans le compte (merge_visitor_favorites), et le même mécanisme couvre artistes, albums, clips et articles.",
  },
];

const STACK = [
  {
    name: "Next.js 16 (App Router)",
    role: "Frontend & rendu serveur",
    detail: "Pages SEO (fiches artistes, articles), navigation sans rechargement, lecteur audio jamais interrompu.",
    accent: "#FF6A1A",
    status: "En place",
  },
  {
    name: "Node.js — API Routes",
    role: "Backend métier",
    detail: "Authentification signée HMAC, CRUD admin générique, favoris, compteur d'écoutes, newsletter.",
    accent: "#12B877",
    status: "En place",
  },
  {
    name: "PostgreSQL + Drizzle ORM",
    role: "Base de données",
    detail: "Schéma typé, migrations reproductibles, requêtes relationnelles (artistes → albums → morceaux).",
    accent: "#FFC53D",
    status: "En place",
  },
  {
    name: "Supabase (cible production)",
    role: "Base hébergée + Auth + Storage",
    detail: "Le script SQL fourni crée exactement ce modèle : UUID, RLS, buckets audio/covers, vues métier.",
    accent: "#34D399",
    status: "Script prêt",
  },
  {
    name: "Cloudinary / S3 / R2",
    role: "Stockage des médias",
    detail: "MP3 et MP4 servis en streaming progressif avec URLs signées, pochettes transformées à la volée.",
    accent: "#C084FC",
    status: "V1.1",
  },
  {
    name: "Mobile Money (V2)",
    role: "Monétisation",
    detail: "Tables subscriptions, payments et royalty_ledger déjà créées : Wave, Orange, MTN MoMo, Moov.",
    accent: "#60A5FA",
    status: "Socle prêt",
  },
];

const TABLES = [
  {
    name: "profiles",
    tag: "V1",
    summary: "Comptes fan / artiste / admin. Le champ role pilote les droits d\'accès.",
    columns: [
      ["id", "uuid PK → auth.users"],
      ["email", "citext unique"],
      ["password_hash", "text (scrypt)"],
      ["display_name", "text"],
      ["role", "enum fan·artist·admin"],
      ["avatar_url", "text"],
      ["city / country", "text"],
      ["created_at", "timestamptz"],
    ],
  },
  {
    name: "artists",
    tag: "V1",
    summary: "Fiches artistes créées par l'admin en V1, puis par l'artiste lui-même en V2.",
    columns: [
      ["id", "uuid PK"],
      ["name / slug", "text unique"],
      ["bio", "text"],
      ["cover_url / banner_url", "text"],
      ["accent", "text (couleur fiche)"],
      ["verified", "boolean"],
      ["followers", "integer"],
      ["monthly_listeners", "integer"],
      ["instagram / youtube / tiktok", "text"],
    ],
  },
  {
    name: "tracks",
    tag: "V1",
    summary: "Le cœur du lecteur : URL audio, durée, compteurs d'écoute et de likes.",
    columns: [
      ["id", "uuid PK"],
      ["title / slug", "text unique"],
      ["artist_id", "FK → artists"],
      ["album_id", "FK → albums (null)"],
      ["genre_id", "FK → genres (null)"],
      ["audio_url", "text (URL signée)"],
      ["duration_seconds", "integer"],
      ["plays / likes", "integer"],
      ["featured / trending / explicit", "boolean"],
      ["release_date", "date"],
    ],
  },
  {
    name: "favorites",
    tag: "V1",
    summary: "Le cœur « J'aime » : rattaché au profil connecté ou au visiteur anonyme, fusionné au login.",
    columns: [
      ["id", "uuid PK"],
      ["user_id", "uuid FK → profiles"],
      ["track_id / item_id", "uuid FK → tracks"],
      ["unique", "(user_id, track_id)"],
      ["visitor_id", "text (cœurs anonymes)"],
      ["item_type", "track·artist·album·video·article"],
    ],
  },
  {
    name: "play_events",
    tag: "V1",
    summary: "Historique d\'écoute : alimente « reprendre la lecture » et le calcul des royalties en V2.",
    columns: [
      ["id", "bigserial PK"],
      ["user_id / visitor_id", "uuid · text"],
      ["track_id", "uuid FK → tracks"],
      ["seconds", "integer"],
      ["source", "web · mobile · embed"],
      ["played_at", "timestamptz"],
    ],
  },
  {
    name: "albums / playlist_tracks",
    tag: "V1",
    summary: "Discographie et listes de lecture éditoriales ou créées par les fans.",
    columns: [
      ["albums.id / artist_id", "uuid · FK"],
      ["albums.title / slug / cover_url", "text"],
      ["albums.album_type", "enum album·ep·single·mixtape·live"],
      ["playlist_tracks.playlist_id", "FK → playlists"],
      ["playlist_tracks.track_id", "FK → tracks"],
      ["playlist_tracks.position", "integer"],
    ],
  },
  {
    name: "genres / videos / banners",
    tag: "V1",
    summary: "Filtres de découverte, clips et carrousel de la page d'accueil.",
    columns: [
      ["genres.name / slug / emoji", "text"],
      ["genres.color_from / color_to", "text"],
      ["videos.video_url / thumbnail_url", "text"],
      ["videos.views / duration_seconds", "integer"],
      ["banners.title / subtitle / tag", "text"],
      ["banners.track_id", "FK → tracks"],
      ["banners.active / position", "boolean · integer"],
    ],
  },
  {
    name: "articles / newsletter_signups",
    tag: "V1",
    summary: "Blog SEO (sorties, interviews, charts) et collecte d'emails pour la sélection du vendredi.",
    columns: [
      ["articles.title / slug", "text unique"],
      ["articles.excerpt / content", "text"],
      ["articles.category / author", "text"],
      ["articles.status", "enum draft·published·archived"],
      ["articles.published_at / views", "timestamptz · integer"],
      ["newsletter_signups.email", "citext unique"],
    ],
  },
  {
    name: "subscriptions / payments / royalty_ledger",
    tag: "V2",
    summary: "Socle de monétisation déjà créé : abonnements Premium et paiements Mobile Money.",
    columns: [
      ["subscription_plans.price_xof", "integer (FCFA)"],
      ["subscriptions.status", "enum active·expired·cancelled"],
      ["subscriptions.expires_at", "timestamptz"],
      ["payments.provider", "enum wave·orange·mtn·moov·card"],
      ["payments.amount_xof / status", "integer · enum"],
      ["royalty_ledger.artist_id / amount_xof", "FK · integer"],
    ],
  },
];

const HOSTING = [
  ["Nom de domaine", "www.maniguadebaby.com — déjà réservé ✓", "acquis", "À pointer vers Vercel : CNAME → cname.vercel-dns.com"],
  ["Frontend Next.js", "Vercel (Hobby au départ, Pro dès la monétisation)", "0 → 12 000 FCFA / mois", "Déploiement Git, CDN, SSL automatique"],
  ["Base + Auth + Storage", "Supabase (Free 500 Mo, puis Pro 8 Go)", "0 → 15 000 FCFA / mois", "Script SQL fourni, RLS activée"],
  ["Médias lourds (MP3/MP4)", "Cloudflare R2 ou Cloudinary", "≈ 2 500 FCFA / 100 Go", "Zéro frais de bande passante sortante sur R2"],
  ["Emails transactionnels", "Resend / Brevo (offre gratuite 3 000/mois)", "0 FCFA", "Newsletter du vendredi, réinitialisation MDP"],
  ["Analytics", "Vercel Analytics + table play_events", "0 FCFA", "Statistiques déjà présentes au back-office"],
];

const WEEK_PLAN = [
  { day: "Jour 1", title: "Environnement & base de données", status: "Fait", detail: "Next.js + Drizzle + PostgreSQL opérationnels, 14 tables créées et poussées, script Supabase prêt." },
  { day: "Jour 2", title: "Modèle de données complet", status: "Fait", detail: "profiles, artists, albums, tracks, videos, playlists, articles, banners, favorites, play_events + socle V2." },
  { day: "Jour 3", title: "Maquette de la page d\'accueil", status: "Fait", detail: "Carrousel héro Ken Burns, ticker du Top 10, chart, nouveautés, genres, artistes, clips, actus, feuille de route." },
  { day: "Jour 4", title: "Lecteur audio persistant", status: "Fait", detail: "Barre fixe inter-pages, waveform cliquable, file d'attente, shuffle/repeat, Media Session, reprise après rechargement." },
  { day: "Jour 5", title: "Test de lecture depuis la base", status: "Fait", detail: "24 morceaux réels lus en streaming depuis la table tracks, compteur d'écoutes incrémenté à chaque lecture." },
  { day: "Semaine 2", title: "Back-office & comptes fans", status: "Fait", detail: "CRUD admin sur 8 entités, inscription/connexion fan, favoris synchronisés, historique d'écoute." },
  { day: "Semaine 3", title: "Médias cloud + nom de domaine", status: "À lancer", detail: "Bascule des MP3/MP4 vers R2 ou Cloudinary, achat du domaine, mise en production Vercel + Supabase." },
];

export default async function ProjetPage() {
  await ensureSeeded().catch(() => false);
  const [stats, profileCount, favoriteCount, playCount] = await Promise.all([
    getSiteStats(),
    db.select({ value: count() }).from(profiles),
    db.select({ value: count() }).from(favorites),
    db.select({ value: count() }).from(playEvents),
  ]);

  const live = [
    { label: "Tables actives", value: 14, Icon: QueueIcon },
    { label: "Morceaux en base", value: stats.tracks, Icon: DiscIcon },
    { label: "Profils créés", value: Number(profileCount[0]?.value ?? 0), Icon: MicIcon },
    { label: "Événements d\'écoute", value: Number(playCount[0]?.value ?? 0), Icon: SparkIcon },
  ];

  return (
    <>
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_15%_0%,rgba(18,184,119,0.22),transparent_60%),radial-gradient(70%_100%_at_85%_10%,rgba(255,106,26,0.2),transparent_60%)]" />
        <div className="wax-pattern pointer-events-none absolute inset-0 opacity-[0.12]" />
        <Section className="relative py-14 md:py-20">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-baobab-400">
            <CompassIcon width={14} height={14} /> Dossier technique
          </p>
          <h1 className="mt-4 max-w-5xl font-display text-[clamp(2.4rem,6.6vw,5rem)] uppercase leading-[0.88] text-cream">
            Architecture & base de données
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-cream-dim md:text-lg">
            Le moteur caché de Maniguadebaby : vos cinq tables UUID (profiles, artists, genres, tracks, favorites)
            comme noyau, un catalogue complet greffé autour, et un socle de monétisation déjà créé pour basculer
            vers les espaces artistes et les paiements Mobile Money sans tout réécrire. Cette page documente le schéma,
            fournit le <strong className="text-cream">script SQL complet en un clic</strong> et tranche les questions de
            domaine, d'hébergement et d'ambiance visuelle.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {live.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-ink-900/70 p-5">
                <item.Icon width={18} height={18} className="text-mango-500" />
                <p className="mt-3 font-display text-3xl uppercase leading-none text-cream">
                  <CountUp value={item.value} />
                </p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cream-mute">{item.label}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Modèle conceptuel */}
      <Section className="py-14 md:py-18">
        <Reveal>
          <SectionHeading
            eyebrow="Modèle conceptuel"
            title="Quatre tables, tout le reste en découle"
            description="Le noyau demandé : profiles, artists, tracks et favorites — reliés par clés étrangères, entourés du catalogue complet."
            accent="#FF6A1A"
          />
        </Reveal>

        <Reveal>
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
            {[
              {
                name: "profiles",
                color: "#12B877",
                rows: ["id uuid PK → auth.users", "email citext unique", "role fan·artist·admin", "created_at timestamptz"],
              },
              {
                name: "favorites",
                color: "#FF6A1A",
                rows: ["id uuid PK", "user_id uuid → profiles", "track_id uuid → tracks", "unique(user_id, track_id)"],
              },
              {
                name: "tracks",
                color: "#FFC53D",
                rows: ["id uuid PK", "title / audio_url", "duration int (secondes)", "artist_id uuid → artists", "genre_id int → genres"],
              },
            ].map((table, index) => (
              <div key={table.name} className="flex items-center gap-4">
                <div
                  className="w-full overflow-hidden rounded-2xl border bg-ink-900/80"
                  style={{ borderColor: `${table.color}55` }}
                >
                  <div className="flex items-center justify-between px-4 py-3" style={{ background: `${table.color}1f` }}>
                    <span className="font-mono text-sm font-bold" style={{ color: table.color }}>
                      {table.name}
                    </span>
                    <span className="rounded-full bg-ink-950/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-cream-mute">
                      table
                    </span>
                  </div>
                  <ul className="divide-y divide-white/5">
                    {table.rows.map((row) => (
                      <li key={row} className="px-4 py-2 font-mono text-[12px] text-cream-dim">
                        {row}
                      </li>
                    ))}
                  </ul>
                </div>
                {index < 2 && (
                  <span className="hidden shrink-0 font-display text-2xl text-cream-mute lg:block" aria-hidden="true">
                    ←
                  </span>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <p className="mt-6 max-w-4xl text-sm leading-relaxed text-cream-mute">
            Lecture du schéma : un <span className="text-baobab-400">profil</span> possède plusieurs{" "}
            <span className="text-mango-400">favoris</span>, chaque favori pointe vers un{" "}
            <span className="text-gold-400">morceau</span> (ou un artiste, un album, un clip, un article), et chaque
            morceau appartient à un artiste. Un visiteur sans compte reçoit un <code className="font-mono text-cream-dim">visitor_id</code>{" "}
            en cookie : ses favoris sont fusionnés automatiquement dans son compte le jour où il s'inscrit.
          </p>
        </Reveal>
      </Section>

      {/* Vos cinq tables */}
      <Section className="py-10 md:py-14">
        <Reveal>
          <SectionHeading
            eyebrow="Modèle retenu"
            title="Vos cinq tables, adoptées telles quelles"
            description="profiles, artists, genres, tracks et favorites forment le noyau exact du projet : UUID partout, genres en SERIAL, contrainte UNIQUE(user_id, track_id). Tout le reste du catalogue se greffe dessus sans les modifier."
            accent="#12B877"
          />
        </Reveal>
        <div className="grid gap-4 lg:grid-cols-2">
          {CORE_TABLES.map((table, index) => (
            <Reveal key={table.name} delay={Math.min(index, 5) * 45}>
              <article className="h-full overflow-hidden rounded-2xl border border-baobab-500/25 bg-ink-900/70 transition duration-500 hover:-translate-y-1 hover:border-baobab-500/60">
                <div className="flex items-center gap-3 border-b border-white/8 bg-baobab-500/8 px-5 py-3">
                  <span className="font-mono text-sm font-bold text-baobab-400">{table.name}</span>
                  <span className="ml-auto rounded-full bg-ink-950/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-cream-mute">
                    table {index + 1} / 5
                  </span>
                </div>
                <pre className="hide-scrollbar overflow-x-auto px-5 py-4 font-mono text-[11.5px] leading-[1.7] text-cream-dim">
                  <code>{table.ddl}</code>
                </pre>
                <p className="border-t border-white/8 px-5 py-4 text-[12.5px] leading-relaxed text-cream-mute">
                  <span className="font-bold uppercase tracking-[0.14em] text-mango-400">Côté Maniguadebaby · </span>
                  {table.added}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Script SQL */}
      <Section className="py-10 md:py-14">
        <Reveal>
          <SectionHeading
            eyebrow="Livrable prêt à exécuter"
            title="Le script SQL complet, en un clic"
            description="Copiez-collez dans Supabase > SQL Editor > Run, ou exécutez psql -f. Le script crée tables, enums, index, triggers, vues métier, politiques RLS et buckets de stockage."
            accent="#12B877"
          />
        </Reveal>
        <Reveal>
          <SqlViewer src="/sql/maniguadebaby-v1.sql" filename="maniguadebaby-v1.sql" />
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { step: "01", title: "Créer le projet", text: "Supabase > New project (région Europe de l'Ouest ou Afrique du Sud selon la latence visée)." },
              { step: "02", title: "Exécuter le script", text: "SQL Editor > coller maniguadebaby-v1.sql > Run. Aucune table existante n'est écrasée (if not exists)." },
              { step: "03", title: "Brancher l'app", text: "Renseigner DATABASE_URL (connexion poolée) puis pousser le schéma Drizzle : npx drizzle-kit push." },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-white/10 bg-ink-900/60 p-5">
                <span className="font-display text-2xl text-mango-500">{item.step}</span>
                <h3 className="mt-2 font-heading text-base font-extrabold text-cream">{item.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-cream-dim">{item.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* Détail des tables */}
      <Section className="py-10 md:py-14">
        <Reveal>
          <SectionHeading eyebrow="Dictionnaire de données" title="Toutes les tables, champ par champ" accent="#FFC53D" />
        </Reveal>
        <div className="grid gap-4 lg:grid-cols-2">
          {TABLES.map((table, index) => (
            <Reveal key={table.name} delay={Math.min(index, 6) * 40}>
              <article className="h-full overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 transition duration-500 hover:-translate-y-1 hover:border-mango-500/40">
                <div className="flex items-center gap-3 border-b border-white/8 px-5 py-3.5">
                  <span className="font-mono text-sm font-bold text-cream">{table.name}</span>
                  <span
                    className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                      table.tag === "V1" ? "bg-mango-500/15 text-mango-400" : "bg-baobab-500/15 text-baobab-400"
                    }`}
                  >
                    {table.tag}
                  </span>
                </div>
                <p className="px-5 pt-4 text-[13px] leading-relaxed text-cream-dim">{table.summary}</p>
                <ul className="grid gap-x-6 gap-y-1 px-5 py-4 sm:grid-cols-2">
                  {table.columns.map(([column, type]) => (
                    <li key={column} className="flex items-baseline justify-between gap-3 border-b border-white/5 py-1.5">
                      <span className="font-mono text-[12px] text-cream">{column}</span>
                      <span className="font-mono text-[11px] text-cream-mute">{type}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Pile technique */}
      <Section className="py-10 md:py-14">
        <Reveal>
          <SectionHeading eyebrow="Choix techniques validés" title="La pile, et pourquoi" accent="#FF6A1A" />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STACK.map((item, index) => (
            <Reveal key={item.name} delay={index * 45}>
              <article
                className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 p-6 transition duration-500 hover:-translate-y-1 hover:border-white/25"
                style={{ boxShadow: `inset 3px 0 0 0 ${item.accent}` }}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-extrabold text-cream">{item.name}</h3>
                  <span className="ml-auto rounded-full border border-white/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cream-mute">
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: item.accent }}>
                  {item.role}
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-cream-dim">{item.detail}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Domaine & hébergement */}
      <Section className="py-10 md:py-14">
        <Reveal>
          <SectionHeading
            eyebrow="Question 1 — domaine & hébergement"
            title="Où vit la plateforme"
            description="Le domaine www.maniguadebaby.com est réservé et câblé dans les métadonnées du site (Open Graph, sitemap, canonical). Pour la mise en ligne : pointer le CNAME vers Vercel, puis brancher Supabase via les variables d'environnement."
            accent="#12B877"
          />
        </Reveal>
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
            <div className="hide-scrollbar overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    {["Poste", "Recommandation", "Budget estimé", "Pourquoi"].map((head) => (
                      <th key={head} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOSTING.map(([poste, reco, budget, why]) => (
                    <tr key={poste} className="border-b border-white/5 transition hover:bg-white/[0.04]">
                      <td className="px-5 py-4 font-heading text-sm font-bold text-cream">{poste}</td>
                      <td className="px-5 py-4 text-[13px] text-cream-dim">{reco}</td>
                      <td className="px-5 py-4 font-mono text-[13px] text-gold-300">{budget}</td>
                      <td className="px-5 py-4 text-[13px] text-cream-mute">{why}</td>
                    </tr>
                  ))}
                  <tr className="bg-mango-500/8">
                    <td className="px-5 py-4 font-heading text-sm font-extrabold text-cream">Total de lancement</td>
                    <td className="px-5 py-4 text-[13px] text-cream-dim">Vercel Hobby + Supabase Free + R2</td>
                    <td className="px-5 py-4 font-mono text-sm font-bold text-mango-400">≈ 10 000 FCFA le 1ᵉʳ mois</td>
                    <td className="px-5 py-4 text-[13px] text-cream-mute">Puis ≈ 30 000 FCFA/mois en vitesse de croisière</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { title: "Mise en ligne en 4 étapes", text: "1. Acheter le domaine · 2. Importer le projet sur Vercel · 3. Créer la base Supabase et exécuter le script · 4. Renseigner DATABASE_URL, AUTH_SECRET, ADMIN_PASSWORD." },
              { title: "Sécurité dès le premier jour", text: "Mots de passe hachés scrypt, cookies httpOnly signés HMAC, Row Level Security sur toutes les tables, URLs audio signées et expirantes." },
              { title: "Prêt pour la V2", text: "Les tables d'abonnement, de paiement et de royalties existent déjà : il ne restera qu'à brancher les APIs Wave, Orange, MTN et Moov." },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-ink-900/60 p-5">
                <h3 className="font-heading text-base font-extrabold text-cream">{card.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-cream-dim">{card.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* Ambiance visuelle */}
      <Section className="py-10 md:py-14">
        <Reveal>
          <SectionHeading
            eyebrow="Question 3 — ambiance visuelle"
            title="Mode sombre, assumé"
            description="Les plateformes de référence (Spotify, Audiomack, Boomplay) sont sombres : les pochettes ressortent, la lecture de nuit en maquis est confortable et l'économie de batterie est réelle sur les téléphones d'entrée de gamme. Basculez l'aperçu pour comparer."
            accent="#FFC53D"
          />
        </Reveal>
        <Reveal>
          <AmbianceSwitch />
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6">
              <h3 className="font-heading text-base font-extrabold uppercase tracking-[0.14em] text-cream">Palette retenue</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ["Orange ivoire", "#FF6A1A"],
                  ["Or", "#FFC53D"],
                  ["Vert baobab", "#12B877"],
                  ["Charbon", "#08060A"],
                  ["Surface", "#16101A"],
                  ["Crème", "#FDF4EA"],
                ].map(([label, hex]) => (
                  <div key={hex} className="flex items-center gap-2.5">
                    <span className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-white/15" style={{ background: hex }} />
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold text-cream">{label}</span>
                      <span className="block font-mono text-[11px] text-cream-mute">{hex}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6">
              <h3 className="font-heading text-base font-extrabold uppercase tracking-[0.14em] text-cream">Typographie</h3>
              <p className="mt-4 font-display text-4xl uppercase leading-none text-cream">Anton — Titres</p>
              <p className="mt-3 font-heading text-2xl font-extrabold text-cream">Bricolage Grotesque — Interface</p>
              <p className="mt-3 text-base text-cream-dim">
                Manrope — Textes courants, lisible même en petite taille sur mobile et sur les connexions lentes.
              </p>
              <p className="mt-4 text-[12px] leading-relaxed text-cream-mute">
                Trois polices chargées en variable fonts, sous-ensembles latins uniquement : moins de 90 Ko au total.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Planning */}
      <Section className="py-10 md:py-16">
        <Reveal>
          <SectionHeading eyebrow="Question 2 — planning semaine 1" title="Ce qui est déjà livré" accent="#FF6A1A" />
        </Reveal>
        <div className="space-y-3">
          {WEEK_PLAN.map((item, index) => (
            <Reveal key={item.day} delay={index * 45}>
              <article className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-ink-900/60 p-5 transition duration-500 hover:-translate-y-0.5 hover:border-white/25 sm:flex-row sm:items-center">
                <span className="w-28 shrink-0 font-display text-sm uppercase tracking-[0.14em] text-mango-500">
                  {item.day}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-base font-extrabold text-cream">{item.title}</span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-cream-dim">{item.detail}</span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                    item.status === "Fait" ?"bg-baobab-500/15 text-baobab-400" :"bg-gold-400/15 text-gold-300"
                  }`}
                >
                  {item.status}
                </span>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-ink-850 to-ink-900 p-7 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl uppercase leading-none text-cream sm:text-3xl">
                Prochaine brique : les médias dans le cloud
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-cream-dim">
                {formatCompactNumber(stats.tracks)} morceaux et {stats.videos} clips sont déjà servis en streaming.
                L'étape suivante consiste à héberger vos propres fichiers (MP3/MP4) sur R2 ou Cloudinary, puis à brancher
                le nom de domaine définitif.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-ink-950 transition hover:scale-[1.03]"
              >
                Ouvrir le back-office <ArrowRightIcon width={15} height={15} />
              </Link>
              <Link
                href="/connexion"
                className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-cream transition hover:border-baobab-500/60 hover:text-baobab-400"
              >
                Créer un compte fan
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
