'use client';

import { Link } from '@inertiajs/react';
import { InfoCard, InfoPage, InfoSection } from '@/components/info/InfoPage';

export default function CareersInfo() {
    return (
        <InfoPage
            title="Careers"
            description="There are no open positions at Tumbler Shop. This is a demo storefront, not a hiring page."
            intro="Tumbler Shop is a demo project, so there are no roles to apply for right now."
            eyebrow="Company"
            demoNote
            aside={
                <InfoCard title="Stay in touch">
                    <p>
                        The <Link href="/contact">contact page</Link> lists the
                        demo email address. It is a placeholder and is not
                        monitored.
                    </p>
                </InfoCard>
            }
        >
            <InfoSection title="No open positions in this demo">
                <p>
                    This page is intentionally empty of listings. No department
                    is hiring, no application is reviewed, and no CV is stored.
                </p>
                <p>
                    If this were a real shop, this page would list the role, the
                    location, the working arrangement, and how to apply. It does
                    not pretend to do that today.
                </p>
            </InfoSection>

            <InfoSection title="What you can explore instead">
                <p>
                    Browse the <Link href="/products">product catalog</Link>, try
                    the <Link href="/track">order tracking demo</Link>, or read
                    how the shop describes its{' '}
                    <Link href="/sustainability">materials</Link>.
                </p>
            </InfoSection>
        </InfoPage>
    );
}
