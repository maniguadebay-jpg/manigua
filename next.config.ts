import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Origines autorisées pour le serveur de développement.
   * Les previews de l'environnement d'agent sont servies derrière un proxy
   * (https://<port>-<sandbox>.e2b.app) : sans cette liste, `next dev` bloque les
   * requêtes cross-origin vers /_next/* et le HMR.
   */
  allowedDevOrigins: ["*.e2b.app", "*.e2b.dev", "*.arena.ai"],
};

export default nextConfig;
