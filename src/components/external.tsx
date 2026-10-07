'use client';
import React, { useEffect } from 'react';

interface HtmlBlockProps {
  /** Extrait HTML exporté (Figma, outil no-code, CMS…). */
  html?: string;
  /** CSS associé, injecté de façon isolée. */
  css?: string;
  /** Identifiant du bloc, utilisé pour scoper les styles. */
  blockId?: string;
  className?: string;
}

const HtmlBlock: React.FC<HtmlBlockProps> = ({ html, css, blockId, className }) => {
  if (!html) {
    return (
      <div
        className={`rounded-2xl border border-dashed border-white/15 px-4 py-6 text-center text-[12px] text-cream-mute ${className ?? ''}`}
      >
        Aucun bloc HTML fourni.
      </div>
    );
  }
  return (
    <div className={className}>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <div data-block-id={blockId} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export { HtmlBlock };
