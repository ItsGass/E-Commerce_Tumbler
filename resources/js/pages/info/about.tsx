'use client';

import { Link } from '@inertiajs/react';
import { InfoCard, InfoPage, InfoSection } from '@/components/info/InfoPage';

export default function AboutInfo() {
    return (
        <InfoPage
            title="About Tumbler Shop"
            description="Tumbler Shop is a demo storefront for browsing drinkware with 3D previews, honest stock counts, and a sample checkout."
            intro="Tumbler Shop is a small demo storefront for everyday drinkware. Everything here exists to show the shopping flow, not to sell a real product."
            eyebrow="Company"
            demoNote
            aside={
                <InfoCard title="What you can try">
                    <ul className="list-disc space-y-1.5 pl-5">
                        <li>Browse the catalog and preview a colour in 3D.</li>
                        <li>Add items to the cart and complete demo checkout.</li>
                        <li>Track the sample order with its code.</li>
                    </ul>
                    <p>
                        <Link href="/products">Open the catalog</Link>
                    </p>
                </InfoCard>
            }
        >
            <InfoSection title="What this shop is">
                <p>
                    This is a demonstration application built around Indonesian
                    rupiah pricing and a warm, café-inspired palette. Product
                    names, descriptions, and photos are sample content used to
                    exercise the catalog, cart, checkout, and order-tracking
                    screens.
                </p>
            </InfoSection>

            <InfoSection title="How the demo behaves">
                <p>
                    Products come from a local database with real stock counts,
                    so adding an item changes what other visitors can add.
                    Checkout records a demo order, and the tracking page reads
                    back the same order.
                </p>
                <p>
                    Payment is mocked. No card is charged, no shipping label is
                    created, and no message from the contact form is delivered.
                </p>
            </InfoSection>

            <InfoSection title="What we do not claim">
                <p>
                    There are no real stores, awards, press mentions, or
                    certifications behind this project. Copy on the{' '}
                    <Link href="/sustainability">sustainability page</Link>{' '}
                    explains the same limit in detail.
                </p>
            </InfoSection>

            <InfoSection title="Questions">
                <p>
                    The <Link href="/contact">contact page</Link> lists demo
                    details and a form that validates input without sending it.
                </p>
            </InfoSection>
        </InfoPage>
    );
}
