'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { useThemeStore, type ThemePreference } from '@/stores/useThemeStore';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const LABELS: Record<ThemePreference, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3.5" />
      <path
        strokeLinecap="round"
        d="M12 2.75v2M12 19.25v2M4.75 12h-2M21.25 12h-2M5.46 5.46 6.87 6.87M17.13 17.13l1.41 1.41M18.54 5.46l-1.41 1.41M6.87 17.13l-1.41 1.41"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 14.15A8.25 8.25 0 0 1 9.85 3.75a8.25 8.25 0 1 0 10.4 10.4Z"
      />
    </svg>
  );
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect x="3" y="4.5" width="18" height="12" rx="2" />
      <path strokeLinecap="round" d="M8.5 20h7M12 16.5V20" />
    </svg>
  );
}

function ThemeIcon({ preference, className }: { preference: ThemePreference; className?: string }) {
  if (preference === 'dark') {
    return <MoonIcon className={className} />;
  }

  if (preference === 'system') {
    return <MonitorIcon className={className} />;
  }

  return <SunIcon className={className} />;
}

interface ThemeToggleProps {
  /**
   * `popover` is the compact 44px trigger for the desktop header; `row` is the
   * full-width trigger used inside the mobile navigation.
   */
  variant?: 'popover' | 'row';
  className?: string;
}

export function ThemeToggle({ variant = 'popover', className }: ThemeToggleProps) {
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();

  const label = LABELS[preference];

  const close = (returnFocus = false) => {
    setIsOpen(false);

    if (returnFocus) {
      triggerRef.current?.focus();
    }
  };

  const choose = (next: ThemePreference) => {
    setPreference(next);
    close(true);
  };

  // Close on a click outside the trigger/menu.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  // Move focus into the menu so the arrow keys and Esc work immediately.
  useEffect(() => {
    if (isOpen) {
      itemRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const focusItem = (index: number) => {
    const items = itemRefs.current.filter((item): item is HTMLButtonElement => item !== null);

    if (items.length === 0) {
      return;
    }

    const next = (index + items.length) % items.length;
    items[next]?.focus();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const activeIndex = itemRefs.current.findIndex((item) => item === document.activeElement);
      focusItem(activeIndex + (event.key === 'ArrowDown' ? 1 : -1));
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
        className={cn(
          'inline-flex h-11 items-center rounded-full border border-hairline bg-surface text-ink transition-colors hover:border-accent hover:text-accent',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page',
          variant === 'popover' ? 'w-11 justify-center' : 'w-full justify-start gap-2.5 px-4',
        )}
        aria-label={`Theme: ${label}. ${isOpen ? 'Close theme menu' : 'Change theme'}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        title={`Theme: ${label}`}
      >
        <ThemeIcon preference={preference} className="h-5 w-5 shrink-0" />
        {variant === 'row' && (
          <>
            <span className="text-sm font-medium">Theme: {label}</span>
            <svg
              className="ml-auto h-4 w-4 shrink-0 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label="Theme"
          onKeyDown={handleMenuKeyDown}
          className={cn(
            'absolute z-50 mt-2 rounded-2xl border border-hairline bg-surface p-1 shadow-soft',
            variant === 'row' ? 'inset-x-0' : 'right-0 w-48',
          )}
        >
          {OPTIONS.map((option, index) => {
            const isChecked = preference === option.value;

            return (
              <button
                key={option.value}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={isChecked}
                tabIndex={-1}
                onClick={() => choose(option.value)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  isChecked ? 'bg-panel font-medium text-ink' : 'text-ink hover:bg-panel',
                )}
              >
                <ThemeIcon preference={option.value} className="h-4 w-4 shrink-0 text-muted" />
                <span>{option.label}</span>
                {isChecked && (
                  <svg
                    className="ml-auto h-4 w-4 shrink-0 text-accent"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
