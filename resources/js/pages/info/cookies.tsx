'use client';

import { Link } from '@inertiajs/react';
import { InfoCard, InfoPage, InfoSection } from '@/components/info/InfoPage';

export default function CookiesInfo() {
    return (
        <InfoPage
            title="Cookie Policy"
            description="The cookies and local storage used by the Tumbler Shop demo: session, CSRF protection, and the saved theme."
            intro="The demo keeps signed-in sessions working, protects forms from cross-site requests, and remembers your light or dark theme."
            eyebrow="Legal"
            demoNote
            aside={
                <InfoCard title="No tracking cookies">
                    <p>
                        There are no advertising or analytics cookies in this
                        demo. Clearing site data signs you out and resets the
                        theme preference.
                    </p>
                </InfoCard>
            }
        >
            <InfoSection title="Cookies used">
                <ul>
                    <li>
                        A session cookie that identifies your signed-in demo
                        session.
                    </li>
                    <li>
                        An <code>XSRF-TOKEN</code> cookie used to protect form
                        submissions from cross-site requests.
                    </li>
                </ul>
            </InfoSection>

            <InfoSection title="Local storage">
                <p>
                    The key <code>tumbler-theme</code> stores your choice of
                    light, dark, or system theme. It stays in your browser and is
                    not sent to the server.
                </p>
            </InfoSection>

            <InfoSection title="Third-party requests">
                <p>
                    Fonts are requested from Google Fonts. Your browser contacts
                    Google when loading the display and body typefaces. No other
                    third-party scripts are added by the demo itself.
                </p>
            </InfoSection>

            <InfoSection title="Managing cookies">
                <p>
                    You can clear these cookies and local storage in your browser
                    settings at any time. Doing so signs you out of the demo and
                    returns the theme to its default.
                </p>
                <p>
                    See also the <Link href="/privacy">privacy policy</Link> and{' '}
                    <Link href="/terms">terms of service</Link>.
                </p>
            </InfoSection>
        </InfoPage>
    );
}
