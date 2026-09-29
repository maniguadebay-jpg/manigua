# public/assets — dépôt de glisser-déposer (Rocker.new)

Déposez ici les fichiers externes, ils deviennent immédiatement accessibles sur le site :

| Dossier        | Contenu                     | URL publique                  |
|----------------|-----------------------------|-------------------------------|
| `images/`      | pochettes, photos artistes  | `/assets/images/pochette.jpg` |
| `audio/`       | morceaux MP3 / WAV          | `/assets/audio/titre.mp3`     |
| `clips/`       | vidéos MP4                  | `/assets/clips/clip.mp4`      |
| `icons/`       | icônes SVG / PNG            | `/assets/icons/logo.svg`      |

Deux façons d'appeler un fichier déposé :

| Cas | URL à utiliser |
|-----|----------------|
| Après le build / en développement | `/assets/audio/teranga.mp3` |
| Fichier ajouté tout de suite, sans rebuild | `/api/media/audio/teranga.mp3` |

Exemple concret :
1. Glissez `teranga.mp3` dans `public/assets/audio/`.
2. Dans le back-office → **Publier un morceau**, renseignez l'URL audio :
   `/assets/audio/teranga.mp3`.
3. Le lecteur persistant joue le fichier immédiatement.

Pour la production, remplacez ces chemins par des URLs signées
(Supabase Storage, Cloudflare R2 ou Cloudinary) : aucun autre changement de code.
