'use client';

import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InfoPageProps {
    /** Document title, also rendered as the single page h1. */
    title: string;
    /** Meta description for the page. */
    description: string;
    /** One short paragraph under the hero title. */
    intro: string;
    eyebrow?: string;
    /** Show the "Demo content" badge on policy-style pages. */
    demoNote?: boolean;
    /** Optional side card column, hidden from the reading column. */
    aside?: ReactNode;
    children: ReactNode;
}

/**
 * Shared shell for the static storefront pages: a hero title, a readable
 * 65-75ch body column, and an optional side card. Content is passed as
 * children so every page stays a plain, reviewable composition.
 */
export function InfoPage({
    title,
    description,
    intro,
    eyebrow = 'Tumbler Shop',
    demoNote = false,
    aside,
    children,
}: InfoPageProps) {
    return (
        <div className="bg-page">
            <Head title={title}>
                <meta name="description" content={description} />
            </Head>

            <section className="border-b border-hairline bg-panel/40">
                <div className="container-page py-12 lg:py-16">
                    <p className="eyebrow">{eyebrow}</p>
                    <h1 className="mt-3 max-w-3xl text-ink">{title}</h1>
                    <p className="mt-4 max-w-[70ch] text-lg text-muted">
                        {intro}
                    </p>
                    {demoNote && (
                        <p className="badge badge-warning mt-6">
                            Demo content — no real orders, payments or messages
                        </p>
                    )}
                </div>
            </section>

            <section className="py-12 lg:py-16">
                <div
                    className={cn(
                        'container-page gap-10 lg:gap-14',
                        aside
                            ? 'lg:grid lg:grid-cols-[minmax(0,70ch)_minmax(16rem,1fr)] lg:items-start'
                            : 'max-w-[75ch]',
                    )}
                >
                    <div className="space-y-8">{children}</div>
                    {aside && (
                        <aside className="space-y-5" aria-label="Page details">
                            {aside}
                        </aside>
                    )}
                </div>
            </section>
        </div>
    );
}

interface InfoSectionProps {
    title: string;
    children: ReactNode;
}

/** A titled block inside the reading column. */
export function InfoSection({ title, children }: InfoSectionProps) {
    return (
        <section className="space-y-3">
            <h2 className="text-2xl text-ink">{title}</h2>
            <div className="space-y-3 text-base leading-relaxed text-muted [&_a]:font-medium [&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/40 [&_a]:underline-offset-4 hover:[&_a]:text-accent-hover [&_p]:max-w-[70ch] [&_ul]:max-w-[70ch] [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
                {children}
            </div>
        </section>
    );
}

interface InfoCardProps {
    title: string;
    children: ReactNode;
}

/** Small Warm Cafe card for side notes and next-step links. */
export function InfoCard({ title, children }: InfoCardProps) {
    return (
        <div className="rounded-card border border-hairline bg-surface p-6 shadow-card">
            <h2 className="text-lg text-ink">{title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted [&_a]:font-medium [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-accent-hover">
                {children}
            </div>
        </div>
    );
}
