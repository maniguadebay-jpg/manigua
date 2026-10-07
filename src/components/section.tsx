'use client';
import React from 'react';
import Link from 'next/link';

interface SectionProps {
  children?: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ children, className }) => {
  return (
    <section className={`mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 ${className ?? ''}`}>
      {children}
    </section>
  );
};

export { Section };

interface SectionHeadingProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  accent?: string;
  action?: React.ReactNode;
  className?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ eyebrow, title, description, accent, action }) => {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p
            className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.28em]"
            style={{ color: accent ?? '#FF6A1A' }}
          >
            {eyebrow}
          </p>
        )}
        {title && (
          <h2 className="font-display text-3xl uppercase leading-none text-cream md:text-4xl">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream-mute">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export { SectionHeading };

interface ViewAllLinkProps {
  href: string;
  label: string;
}

const ViewAllLink: React.FC<ViewAllLinkProps> = ({ href, label }) => {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400"
    >
      {label}
    </Link>
  );
};

export { ViewAllLink };