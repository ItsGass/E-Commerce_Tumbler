<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Processing = 'processing';
    case Shipped = 'shipped';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public static function allowedTransitions(): array
    {
        return [
            self::Pending->value => [self::Paid->value, self::Cancelled->value],
            self::Paid->value => [self::Processing->value, self::Cancelled->value],
            self::Processing->value => [self::Shipped->value, self::Cancelled->value],
            self::Shipped->value => [self::Completed->value],
            self::Completed->value => [],
            self::Cancelled->value => [],
        ];
    }

    public static function statusesThatRestoreStock(): array
    {
        return [
            self::Pending->value,
            self::Paid->value,
            self::Processing->value,
        ];
    }

    public function canTransitionTo(string $newStatus): bool
    {
        return in_array($newStatus, self::allowedTransitions()[$this->value] ?? []);
    }

    public function restoresStockOnCancel(): bool
    {
        return in_array($this->value, self::statusesThatRestoreStock());
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
