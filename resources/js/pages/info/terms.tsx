'use client';

import { Link } from '@inertiajs/react';
import { InfoCard, InfoPage, InfoSection } from '@/components/info/InfoPage';

export default function TermsInfo() {
    return (
        <InfoPage
            title="Terms of Service"
            description="The rules for using the Tumbler Shop demo. No real sale, payment, shipment, or refund takes place."
            intro="These terms cover a demonstration storefront. Nothing on this site is a real offer to sell, and no order creates a contract of sale."
            eyebrow="Legal"
            demoNote
            aside={
                <InfoCard title="The core rule">
                    <p>
                        Treat every order as a rehearsal. Do not send real money
                        and do not expect a parcel.
                    </p>
                </InfoCard>
            }
        >
            <InfoSection title="Demo use only">
                <p>
                    Tumbler Shop is provided to demonstrate a shopping flow. You
                    may browse, register a demo account, place sample orders, and
                    track them. You may not use the demo to sell goods, collect
                    payment, or misrepresent the catalog as a real shop.
                </p>
            </InfoSection>

            <InfoSection title="No real transaction">
                <ul>
                    <li>No payment is captured or charged.</li>
                    <li>No product is reserved, packed, or delivered.</li>
                    <li>No refund or exchange is processed.</li>
                    <li>Prices and stock counts are sample data.</li>
                </ul>
            </InfoSection>

            <InfoSection title="Accounts">
                <p>
                    Keep demo credentials separate from passwords you use
                    elsewhere. The operator may reset or remove accounts and
                    orders without notice.
                </p>
            </InfoSection>

            <InfoSection title="Availability and warranties">
                <p>
                    The demo is provided “as is”, without warranties of
                    availability, accuracy, or fitness for a particular purpose.
                    Features may change or disappear.
                </p>
            </InfoSection>

            <InfoSection title="Related pages">
                <p>
                    Read the <Link href="/privacy">privacy policy</Link> and{' '}
                    <Link href="/cookies">cookie policy</Link>, or check the{' '}
                    <Link href="/shipping">shipping</Link> and{' '}
                    <Link href="/returns">returns</Link> demo notes.
                </p>
            </InfoSection>
        </InfoPage>
    );
}
