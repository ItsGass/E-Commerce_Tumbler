<?php

namespace App\Models;

use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $product_id
 * @property string $name
 * @property string|null $color_hex
 * @property string|null $texture_path
 * @property string|null $glb_path
 * @property int $sort_order
 * @property bool $is_default
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Product $product
 */
#[Fillable(['product_id', 'name', 'color_hex', 'texture_path', 'glb_path', 'sort_order', 'is_default'])]
class ProductVariant extends Model
{
    /** @use HasFactory<ProductVariantFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_default' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getTextureUrlAttribute(): ?string
    {
        return $this->texture_path ? asset('storage/'.$this->texture_path) : null;
    }

    public function getGlbUrlAttribute(): ?string
    {
        return $this->glb_path ? asset('storage/'.$this->glb_path) : null;
    }
}
