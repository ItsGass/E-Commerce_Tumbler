'use client';

import { Link } from '@inertiajs/react';
import { InfoCard, InfoPage, InfoSection } from '@/components/info/InfoPage';

export default function PressInfo() {
    return (
        <InfoPage
            title="Press Kit"
            description="A short press kit for the Tumbler Shop demo: brand description, logo usage notes, and a placeholder press contact."
            intro="Everything needed to describe this demo accurately: what it is, how the name and mark may be used, and who to ask."
            eyebrow="Company"
            demoNote
            aside={
                <InfoCard title="Press contact">
                    <p>
                        <a href="mailto:press@tumblershop.test">
                            press@tumblershop.test
                        </a>
                    </p>
                    <p>Placeholder address, not monitored.</p>
                </InfoCard>
            }
        >
            <InfoSection title="Brand description">
                <p>
                    Tumbler Shop is a demo storefront for drinkware. It shows a
                    catalog with 3D previews, live demo stock, a sample cart and
                    checkout, and public order tracking.
                </p>
                <p>
                    Short description: “Tumbler Shop is a demo drinkware store
                    built to demonstrate a complete shopping flow.”
                </p>
            </InfoSection>

            <InfoSection title="Logo usage">
                <ul>
                    <li>
                        Use the round terracotta mark with the star tumbler
                        outline, or the full “Tumbler Shop” wordmark.
                    </li>
                    <li>
                        Keep clear space around the mark equal to the height of
                        its inner symbol.
                    </li>
                    <li>
                        Do not stretch, recolour, add effects, or place the mark
                        on a busy photo.
                    </li>
                    <li>
                        Use the light or dark version that keeps contrast on the
                        background.
                    </li>
                </ul>
            </InfoSection>

            <InfoSection title="What this kit does not include">
                <p>
                    There are no real press mentions, awards, founder profiles,
                    or downloadable media pack behind this page. The demo does
                    not invent coverage.
                </p>
            </InfoSection>

            <InfoSection title="More context">
                <p>
                    Read the <Link href="/about">about page</Link> for the demo
                    scope, or use the <Link href="/contact">contact page</Link>{' '}
                    for the general demo details.
                </p>
            </InfoSection>
        </InfoPage>
    );
}
