'use client';

import { Link } from '@inertiajs/react';
import { InfoCard, InfoPage, InfoSection } from '@/components/info/InfoPage';

export default function GiftCardsInfo() {
    return (
        <InfoPage
            title="Gift Cards"
            description="Gift cards are not available in the Tumbler Shop demo. There is no code, balance, or purchase flow."
            intro="Gift cards are coming later. This demo does not sell them, issue codes, or track balances, so there is nothing to buy here yet."
            eyebrow="Shop"
            demoNote
            aside={
                <InfoCard title="Shop the demo instead">
                    <p>
                        Browse the catalog and place a sample order to see the
                        full checkout flow.
                    </p>
                    <p>
                        <Link href="/products">Browse all products</Link>
                    </p>
                </InfoCard>
            }
        >
            <InfoSection title="Coming soon — not built yet">
                <p>
                    The application has no gift-card feature. No codes are
                    generated, no balances are stored, and the checkout does not
                    accept a gift-card field.
                </p>
                <p>
                    This page will describe real denominations and expiry rules
                    only when that feature exists.
                </p>
            </InfoSection>

            <InfoSection title="What you can do today">
                <ul>
                    <li>
                        <Link href="/products">Browse the catalog</Link> and
                        preview products in 3D.
                    </li>
                    <li>
                        Complete a demo checkout and track the sample order.
                    </li>
                    <li>
                        Read the <Link href="/shipping">shipping</Link> and{' '}
                        <Link href="/returns">returns</Link> demo policies.
                    </li>
                </ul>
            </InfoSection>
        </InfoPage>
    );
}
