'use client';

import { Link, useForm, usePage } from '@inertiajs/react';
import { InfoCard, InfoPage, InfoSection } from '@/components/info/InfoPage';
import { cn } from '@/lib/utils';

import type { PageProps } from '@inertiajs/core';

interface ContactPageProps extends PageProps {
    flash?: {
        contact_sent?: boolean;
    };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactInfo() {
    const { flash } = usePage<ContactPageProps>().props;
    const form = useForm({
        name: '',
        email: '',
        message: '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.clearErrors();

        const errors: Record<string, string> = {};

        if (form.data.name.trim().length < 2) {
            errors.name = 'Enter at least 2 characters.';
        }

        if (!EMAIL_PATTERN.test(form.data.email.trim())) {
            errors.email = 'Enter a valid email address.';
        }

        if (form.data.message.trim().length < 10) {
            errors.message = 'Add a little more detail (at least 10 characters).';
        }

        if (Object.keys(errors).length > 0) {
            form.setError(errors);
            return;
        }

        form.post('/contact', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <InfoPage
            title="Contact Us"
            description="Demo contact details and a sample contact form for Tumbler Shop. Messages are validated but never sent or stored."
            intro="These contact details belong to a demo shop. The form checks your input on both the browser and the server, then confirms that nothing was actually sent."
            eyebrow="Support"
            demoNote
            aside={
                <>
                    <InfoCard title="Demo contact details">
                        <p>
                            <a href="mailto:hello@tumblershop.test">
                                hello@tumblershop.test
                            </a>
                        </p>
                        <p>+62 21 0000 0000 (placeholder)</p>
                        <p>
                            Jl. Contoh Demo No. 1
                            <br />
                            Jakarta 10000, Indonesia
                        </p>
                        <p>
                            This inbox and phone number are not monitored.
                        </p>
                    </InfoCard>

                    <InfoCard title="Other demo pages">
                        <ul className="list-disc space-y-1.5 pl-5">
                            <li>
                                <Link href="/track">Track a demo order</Link>
                            </li>
                            <li>
                                <Link href="/shipping">
                                    Shipping information
                                </Link>
                            </li>
                            <li>
                                <Link href="/returns">
                                    Returns &amp; exchanges
                                </Link>
                            </li>
                        </ul>
                    </InfoCard>
                </>
            }
        >
            <InfoSection title="Send a demo message">
                <p>
                    Use the form to see client and server validation at work.
                    Submitting does not create a ticket, send an email, or save
                    anything to the database.
                </p>

                {flash?.contact_sent && (
                    <div
                        className="rounded-card border border-success/30 bg-success-tint px-5 py-4 text-success"
                        role="status"
                    >
                        <p className="font-medium">
                            Demo only — your message was not sent.
                        </p>
                        <p className="mt-1 text-sm">
                            The form was accepted and then discarded. Nothing
                            was stored.
                        </p>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5" noValidate>
                    <div>
                        <label
                            htmlFor="contact-name"
                            className="mb-1 block text-sm font-medium text-ink"
                        >
                            Name
                        </label>
                        <input
                            id="contact-name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            minLength={2}
                            maxLength={80}
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            className={cn(
                                'field',
                                form.errors.name && 'border-danger',
                            )}
                            aria-invalid={Boolean(form.errors.name)}
                            aria-describedby={
                                form.errors.name ? 'contact-name-error' : undefined
                            }
                        />
                        {form.errors.name && (
                            <p
                                id="contact-name-error"
                                className="mt-1 text-sm text-danger"
                            >
                                {form.errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="contact-email"
                            className="mb-1 block text-sm font-medium text-ink"
                        >
                            Email
                        </label>
                        <input
                            id="contact-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            maxLength={255}
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                            className={cn(
                                'field',
                                form.errors.email && 'border-danger',
                            )}
                            aria-invalid={Boolean(form.errors.email)}
                            aria-describedby={
                                form.errors.email
                                    ? 'contact-email-error'
                                    : undefined
                            }
                        />
                        {form.errors.email && (
                            <p
                                id="contact-email-error"
                                className="mt-1 text-sm text-danger"
                            >
                                {form.errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="contact-message"
                            className="mb-1 block text-sm font-medium text-ink"
                        >
                            Message
                        </label>
                        <textarea
                            id="contact-message"
                            name="message"
                            required
                            minLength={10}
                            maxLength={2000}
                            rows={6}
                            value={form.data.message}
                            onChange={(event) =>
                                form.setData('message', event.target.value)
                            }
                            className={cn(
                                'field resize-y',
                                form.errors.message && 'border-danger',
                            )}
                            aria-invalid={Boolean(form.errors.message)}
                            aria-describedby={
                                form.errors.message
                                    ? 'contact-message-error'
                                    : undefined
                            }
                        />
                        {form.errors.message && (
                            <p
                                id="contact-message-error"
                                className="mt-1 text-sm text-danger"
                            >
                                {form.errors.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={form.processing}
                    >
                        {form.processing ? 'Checking…' : 'Send demo message'}
                    </button>
                </form>
            </InfoSection>
        </InfoPage>
    );
}
