'use client';

import { Link } from '@inertiajs/react';
import { InfoCard, InfoPage, InfoSection } from '@/components/info/InfoPage';

export default function ReturnsInfo() {
    return (
        <InfoPage
            title="Returns & Exchanges"
            description="The Tumbler Shop demo return policy: sample rules, no real return shipping, and no refunds because no payment is taken."
            intro="Returns and exchanges are not processed in this demo. This page explains what the demo does instead, so nothing here reads like a real refund promise."
            eyebrow="Support"
            demoNote
            aside={
                <InfoCard title="Cancelling a demo order">
                    <p>
                        An administrator can cancel an order before it ships.
                        When the order was still Pending, Paid, or Processing,
                        its stock is returned to the catalog.
                    </p>
                    <p>
                        Delivered orders cannot be cancelled in the demo. This
                        mirrors the status rules in the admin panel.
                    </p>
                </InfoCard>
            }
        >
            <InfoSection title="No returns are processed">
                <p>
                    There is no return form, no return label, and no return
                    address in this demo. No item is sent back and no inspection
                    happens.
                </p>
            </InfoSection>

            <InfoSection title="No refunds">
                <p>
                    Checkout is a mock flow. No card, wallet, or bank transfer is
                    charged, so there is nothing to refund. Amounts shown on an
                    order are sample figures in Indonesian rupiah.
                </p>
            </InfoSection>

            <InfoSection title="What the demo does support">
                <ul>
                    <li>
                        Cancelling an order from the admin panel while it is
                        Pending, Paid, or Processing.
                    </li>
                    <li>
                        Returning that order&apos;s stock to the product page
                        when it is cancelled.
                    </li>
                    <li>
                        Checking the current status on the{' '}
                        <Link href="/track">tracking page</Link>.
                    </li>
                </ul>
            </InfoSection>

            <InfoSection title="Damaged or wrong item">
                <p>
                    Because nothing is shipped, this situation cannot occur
                    here. In a real shop this is where the contact window and
                    photo requirements would go.
                </p>
            </InfoSection>

            <InfoSection title="Still have a question?">
                <p>
                    The <Link href="/contact">contact page</Link> has the demo
                    details and a form that validates input but does not send
                    anything.
                </p>
            </InfoSection>
        </InfoPage>
    );
}
