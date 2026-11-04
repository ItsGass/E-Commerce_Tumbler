<?php

namespace App\Enums;

enum Role: string
{
    case User = 'user';
    case Admin = 'admin';
    case SuperAdmin = 'super_admin';

    public function canAdmin(): bool
    {
        return $this === self::Admin || $this === self::SuperAdmin;
    }

    public function canSuperAdmin(): bool
    {
        return $this === self::SuperAdmin;
    }

    public function isUser(): bool
    {
        return $this === self::User;
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
