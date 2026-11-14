/**
 * One source of truth for the storefront navigation.
 *
 * The footer, the desktop dropdowns and the mobile accordions all read from
 * this file, so a label or destination only ever changes in one place.
 *
 * Every `href` is a root-relative path. Inertia's `<Link>` keeps the current
 * host, which means the same code works on localhost, a LAN IP or production.
 */

export interface NavigationLink {
    label: string;
    href: string;
}

export interface NavigationGroup {
    key: 'shop' | 'support' | 'company';
    label: string;
    links: NavigationLink[];
}

export const NAVIGATION_GROUPS: NavigationGroup[] = [
    {
        key: 'shop',
        label: 'Shop',
        links: [
            { label: 'All Products', href: '/products' },
            { label: 'New Arrivals', href: '/products?sort=new' },
            { label: 'Best Sellers', href: '/products?sort=popular' },
            { label: 'Gift Cards', href: '/gift-cards' },
        ],
    },
    {
        key: 'support',
        label: 'Support',
        links: [
            { label: 'Track Order', href: '/track' },
            { label: 'Shipping Info', href: '/shipping' },
            { label: 'Returns & Exchanges', href: '/returns' },
            { label: 'Contact Us', href: '/contact' },
        ],
    },
    {
        key: 'company',
        label: 'Company',
        links: [
            { label: 'About Us', href: '/about' },
            { label: 'Sustainability', href: '/sustainability' },
            { label: 'Careers', href: '/careers' },
            { label: 'Press', href: '/press' },
        ],
    },
];

export const LEGAL_LINKS: NavigationLink[] = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
];

/**
 * Match an `/products?sort=...` style href against the current Inertia URL.
 *
 * Paths must match exactly. A link without a query is active only when the
 * current URL carries no `sort` value, so "All Products" and "New Arrivals"
 * never highlight together.
 */
export function isNavigationLinkActive(href: string, currentUrl: string): boolean {
    const [hrefPath, hrefQuery = ''] = href.split('?');
    const [currentPath, currentQuery = ''] = currentUrl.split('?');

    if (hrefPath !== currentPath) {
        return false;
    }

    const actual = new URLSearchParams(currentQuery);

    if (!hrefQuery) {
        return !actual.has('sort');
    }

    const expected = new URLSearchParams(hrefQuery);

    return [...expected].every(([key, value]) => actual.get(key) === value);
}

/**
 * A dropdown trigger is active when the current path belongs to any of its
 * links (for example `/products?sort=popular` keeps "Shop" highlighted).
 */
export function isNavigationGroupActive(group: NavigationGroup, currentUrl: string): boolean {
    const currentPath = currentUrl.split('?')[0];

    return group.links.some((link) => link.href.split('?')[0] === currentPath);
}
