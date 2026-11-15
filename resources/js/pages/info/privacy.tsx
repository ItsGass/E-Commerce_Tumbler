'use client';

import { Link } from '@inertiajs/react';
import { InfoCard, InfoPage, InfoSection } from '@/components/info/InfoPage';

export default function PrivacyInfo() {
    return (
        <InfoPage
            title="Privacy Policy"
            description="How the Tumbler Shop demo handles account, order, and session data. This is a demo store, so do not enter real personal data."
            intro="This policy describes the demo database and session cookies. It is demo content, and it is deliberately short because the application collects very little."
            eyebrow="Legal"
            demoNote
            aside={
                <InfoCard title="Short version">
                    <p>
                        Use a throwaway email and do not enter a real address or
                        phone number. Demo data stays in this application&apos;s
                        database and is not sold or shared.
                    </p>
                </InfoCard>
            }
        >
            <InfoSection title="What is stored">
                <ul>
                    <li>
                        Account details you submit: name, email address, and a
                        hashed password.
                    </li>
                    <li>
                        Demo order details: buyer name, email, phone, address,
                        items, quantities, and totals.
                    </li>
                    <li>Session data that keeps you signed in.</li>
                </ul>
            </InfoSection>

            <InfoSection title="Why it is stored">
                <p>
                    Account data lets you sign in. Order data lets the tracking
                    page and the admin screens show the same sample order. Stock
                    counts change when a demo order is placed or cancelled.
                </p>
            </InfoSection>

            <InfoSection title="What is not done">
                <ul>
                    <li>No payment details are collected or stored.</li>
                    <li>No marketing email is sent from this demo.</li>
                    <li>No data is sold or shared with advertisers.</li>
                    <li>
                        No contact-form message is sent or stored; it is
                        validated and then discarded.
                    </li>
                </ul>
            </InfoSection>

            <InfoSection title="Removing demo data">
                <p>
                    The operator of this demo can clear the database and reset
                    the seeded catalog at any time. If you need a demo account
                    removed, use the{' '}
                    <Link href="/contact">contact page</Link> to ask.
                </p>
            </InfoSection>

            <InfoSection title="Related pages">
                <p>
                    See the <Link href="/terms">terms of service</Link> and the{' '}
                    <Link href="/cookies">cookie policy</Link> for the rest of
                    the demo rules.
                </p>
            </InfoSection>
        </InfoPage>
    );
}
