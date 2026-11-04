export type User = {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'super_admin';
    phone?: string;
    street?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    profile_complete: boolean;
    abilities: {
        can_admin: boolean;
        can_super_admin: boolean;
        profile_complete: boolean;
    };
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};
