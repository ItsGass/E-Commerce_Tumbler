'use client';

import { Link } from '@inertiajs/react';
import { InfoCard, InfoPage, InfoSection } from '@/components/info/InfoPage';

export default function ShippingInfo() {
    return (
        <InfoPage
            title="Shipping Information"
            description="How shipping works in the Tumbler Shop demo: sample processing steps and tracking, with no real parcels."
            intro="This page describes the demo shipping flow. Orders are simulated end to end, and no parcel is ever picked, packed, or shipped."
            eyebrow="Support"
            demoNote
            aside={
                <InfoCard title="Need to check an order?">
                    <p>
                        Every demo order gets a code at checkout. Enter it with
                        the email or phone on the order to see its status.
                    </p>
                    <p>
                        <Link href="/track">Track a demo order</Link>
                    </p>
                </InfoCard>
            }
        >
            <InfoSection title="How a demo order moves">
                <p>
                    Checkout creates a sample order and reserves the stock you
                    see on the product page. An administrator then moves it
                    through Pending, Paid, Processing, Shipped, and Completed,
                    or cancels it.
                </p>
                <p>
                    Those status changes are for practising the flow. There is
                    no warehouse queue and no delivery date attached to them.
                </p>
            </InfoSection>

            <InfoSection title="Processing time">
                <p>
                    No processing time is promised because nothing is
                    processed. In a real shop this section would hold the cut-off
                    times, handling window, and holiday schedule.
                </p>
            </InfoSection>

            <InfoSection title="Tracking">
                <p>
                    Open <Link href="/track">Track Order</Link> and use the order
                    code plus the email or phone entered at checkout. The page
                    shows the current demo status and the items on the order.
                </p>
            </InfoSection>

            <InfoSection title="Delivery and cost">
                <p>
                    Shipping cost is calculated in the demo checkout so the
                    totals look realistic, but no money is collected and no
                    courier is booked. Free-shipping thresholds shown at
                    checkout are demo rules only.
                </p>
            </InfoSection>

            <InfoSection title="Questions">
                <p>
                    Use the <Link href="/contact">contact page</Link> for
                    anything about this demo. Returns are covered on the{' '}
                    <Link href="/returns">returns page</Link>.
                </p>
            </InfoSection>
        </InfoPage>
    );
}
