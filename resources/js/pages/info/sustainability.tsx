'use client';

import { InfoCard, InfoPage, InfoSection } from '@/components/info/InfoPage';

export default function SustainabilityInfo() {
    return (
        <InfoPage
            title="Materials & Sustainability"
            description="What the Tumbler Shop demo can and cannot claim about materials, recycling, and sustainability."
            intro="This page describes the materials named in the sample catalog and is explicit about the claims the demo cannot support."
            eyebrow="Company"
            demoNote
            aside={
                <InfoCard title="The honest version">
                    <p>
                        No certificate, recycled percentage, carbon figure, or
                        audit result is attached to this demo. If those become
                        real, they belong here with a source and a date.
                    </p>
                </InfoCard>
            }
        >
            <InfoSection title="Materials in the sample catalog">
                <p>
                    The seeded products describe common drinkware materials:
                    stainless steel bodies, ceramic coatings, copper vacuum
                    flasks, glass tumblers, and insulated sports bottles. Those
                    descriptions are sample copy for the catalog, not
                    certificates of origin.
                </p>
                <p>
                    The product pages list care notes such as hand washing and
                    avoiding abrasive cleaners. Follow the care note on a real
                    product if you own one.
                </p>
            </InfoSection>

            <InfoSection title="What the demo does not claim">
                <ul>
                    <li>No recycled-content percentage is verified.</li>
                    <li>No fair-labour or environmental certification exists.</li>
                    <li>No carbon-offset or tree-planting programme is running.</li>
                    <li>No supplier audit, factory list, or award is attached.</li>
                </ul>
            </InfoSection>

            <InfoSection title="Sensible defaults">
                <p>
                    Reusable drinkware can replace single-use cups, and keeping
                    a bottle for years avoids repeated purchases. Those are
                    general ideas, not measured savings from this demo.
                </p>
                <p>
                    Care advice in the catalog — hand wash, air dry, do not
                    microwave — is there to make a tumbler last longer.
                </p>
            </InfoSection>

            <InfoSection title="Improving this page">
                <p>
                    When real material data exists, add the supplier, the
                    standard, the measured value, and the date checked. Until
                    then, the demo keeps this page free of unverifiable claims.
                </p>
            </InfoSection>
        </InfoPage>
    );
}
