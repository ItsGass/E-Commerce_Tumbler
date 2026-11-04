<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $code
 * @property int|null $user_id
 * @property OrderStatus $status
 * @property int $subtotal
 * @property int $shipping_cost
 * @property int $total
 * @property string $buyer_name
 * @property string $buyer_email
 * @property string $buyer_phone
 * @property string $buyer_street
 * @property string $buyer_city
 * @property string $buyer_province
 * @property string $buyer_postal_code
 * @property Carbon|null $paid_at
 * @property Carbon|null $shipped_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $cancelled_at
 * @property string|null $cancellation_reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User|null $user
 * @property-read Collection<int, OrderItem> $items
 */
#[Fillable([
    'code', 'user_id', 'status', 'subtotal', 'shipping_cost', 'total',
    'buyer_name', 'buyer_email', 'buyer_phone', 'buyer_street', 'buyer_city',
    'buyer_province', 'buyer_postal_code', 'paid_at', 'shipped_at',
    'completed_at', 'cancelled_at', 'cancellation_reason',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'subtotal' => 'integer',
            'shipping_cost' => 'integer',
            'total' => 'integer',
            'paid_at' => 'datetime',
            'shipped_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function canTransitionTo(string $newStatus): bool
    {
        return $this->status->canTransitionTo($newStatus);
    }

    public function restoresStockOnCancel(): bool
    {
        return $this->status->restoresStockOnCancel();
    }
}
