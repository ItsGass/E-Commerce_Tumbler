'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    isNavigationGroupActive,
    isNavigationLinkActive,
    type NavigationGroup,
} from '@/config/navigation';
import { cn } from '@/lib/utils';

interface NavigationDropdownProps {
    group: NavigationGroup;
    className?: string;
}

/**
 * One desktop header dropdown. It reads its links from the shared navigation
 * config, so the header and the footer can never drift apart.
 *
 * The menu is absolutely positioned inside the trigger wrapper: opening it
 * never changes the header height and it cannot be clipped by the sticky
 * header, which has no overflow rules.
 */
export function NavigationDropdown({
    group,
    className,
}: NavigationDropdownProps) {
    const { url } = usePage();
    const [isOpen, setIsOpen] = useState(false);
    const [pendingFocus, setPendingFocus] = useState<'first' | 'last' | null>(
        null,
    );
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
    const menuId = useId();
    const canHoverRef = useRef(false);
    const openedByHoverRef = useRef(false);

    const isGroupActive = isNavigationGroupActive(group, url);

    // Hover only applies to devices with a real pointer. Touch devices always
    // need the explicit click/accordion path.
    useEffect(() => {
        canHoverRef.current =
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    }, []);

    // Any completed Inertia visit closes the menu.
    useEffect(() => {
        setIsOpen(false);
        setPendingFocus(null);
        openedByHoverRef.current = false;
    }, [url]);

    // Close when the pointer or the focus lands outside both trigger and menu.
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const isInside = (target: EventTarget | null) =>
            target instanceof Node && rootRef.current?.contains(target);

        const handlePointerDown = (event: PointerEvent) => {
            if (!isInside(event.target)) {
                openedByHoverRef.current = false;
                setIsOpen(false);
            }
        };

        const handleFocusIn = (event: FocusEvent) => {
            if (!isInside(event.target)) {
                openedByHoverRef.current = false;
                setIsOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('focusin', handleFocusIn);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('focusin', handleFocusIn);
        };
    }, [isOpen]);

    // Focus the first/last item only after React has rendered the open menu.
    useEffect(() => {
        if (!isOpen || pendingFocus === null) {
            return;
        }

        const items = itemRefs.current.filter(
            (item): item is HTMLAnchorElement => item !== null,
        );

        const target =
            pendingFocus === 'first' ? items[0] : items[items.length - 1];

        target?.focus();
        setPendingFocus(null);
    }, [isOpen, pendingFocus]);

    const close = (returnFocus = false) => {
        setIsOpen(false);
        setPendingFocus(null);
        openedByHoverRef.current = false;

        if (returnFocus) {
            triggerRef.current?.focus();
        }
    };

    const open = (focus: 'first' | 'last') => {
        setIsOpen(true);
        setPendingFocus(focus);
    };

    const moveFocus = (direction: 1 | -1) => {
        const items = itemRefs.current.filter(
            (item): item is HTMLAnchorElement => item !== null,
        );

        if (items.length === 0) {
            return;
        }

        const current = items.indexOf(
            document.activeElement as HTMLAnchorElement,
        );
        const next = (current + direction + items.length) % items.length;

        items[next]?.focus();
    };

    const handleRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape' && isOpen) {
            event.preventDefault();
            close(true);
            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();

            if (!isOpen) {
                open(event.key === 'ArrowDown' ? 'first' : 'last');
            } else {
                moveFocus(event.key === 'ArrowDown' ? 1 : -1);
            }
        }
    };

    const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();

            if (isOpen) {
                close(true);
            } else {
                open('first');
            }
        }
    };

    return (
        <div
            ref={rootRef}
            className={cn('relative', className)}
            onKeyDown={handleRootKeyDown}
            onMouseEnter={() => {
                if (canHoverRef.current && !isOpen) {
                    openedByHoverRef.current = true;
                    setIsOpen(true);
                }
            }}
            onMouseLeave={() => {
                if (
                    canHoverRef.current &&
                    !rootRef.current?.contains(document.activeElement)
                ) {
                    openedByHoverRef.current = false;
                    setIsOpen(false);
                }
            }}
        >
            <button
                ref={triggerRef}
                type="button"
                onClick={(event) => {
                    // A pointer click and a keyboard-triggered click both land
                    // here; only the explicit keydown path steals focus.
                    event.preventDefault();

                    // Hover already opened it, so the first click confirms it
                    // instead of instantly closing it again.
                    if (openedByHoverRef.current) {
                        openedByHoverRef.current = false;
                        return;
                    }

                    setIsOpen((open) => !open);
                }}
                onKeyDown={handleTriggerKeyDown}
                className={cn(
                    'flex items-center gap-1 rounded-full px-1 py-2 text-sm font-medium transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page',
                    isGroupActive ? 'text-accent' : 'text-muted hover:text-ink',
                )}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-controls={menuId}
            >
                {group.label}
                <svg
                    className={cn(
                        'h-4 w-4 shrink-0 transition-transform duration-150',
                        isOpen && 'rotate-180',
                    )}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-1/2 z-50 w-60 -translate-x-1/2 pt-3">
                    {/* The padding above the card is a transparent hover bridge:
              it keeps the pointer inside the wrapper while it travels from the
              trigger to the menu, so hover-opened menus stay open. */}
                    <div
                        id={menuId}
                        role="menu"
                        aria-label={group.label}
                        className="rounded-[20px] border border-hairline bg-surface p-2 shadow-soft"
                    >
                        {group.links.map((link, index) => {
                            const active = isNavigationLinkActive(
                                link.href,
                                url,
                            );

                            return (
                                <Link
                                    key={link.href}
                                    ref={(element) => {
                                        itemRefs.current[index] =
                                            element as HTMLAnchorElement | null;
                                    }}
                                    href={link.href}
                                    role="menuitem"
                                    tabIndex={-1}
                                    aria-current={active ? 'page' : undefined}
                                    onClick={() => close()}
                                    className={cn(
                                        'flex min-h-10 items-center rounded-xl px-3 py-2 text-sm transition-colors',
                                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                                        active
                                            ? 'bg-panel font-medium text-accent'
                                            : 'text-ink hover:bg-panel',
                                    )}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
