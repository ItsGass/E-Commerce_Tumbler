<?php

namespace App\Models;

use App\Enums\Role;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property Role $role
 * @property string|null $phone
 * @property string|null $street
 * @property string|null $city
 * @property string|null $province
 * @property string|null $postal_code
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read bool $profile_complete
 * @property-read Collection<int, Order> $orders
 */
#[Fillable(['name', 'email', 'password', 'role', 'phone', 'street', 'city', 'province', 'postal_code'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => Role::class,
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function getProfileCompleteAttribute(): bool
    {
        return filled($this->name)
            && filled($this->email)
            && filled($this->phone)
            && filled($this->street)
            && filled($this->city)
            && filled($this->province)
            && filled($this->postal_code);
    }

    public function isAdmin(): bool
    {
        return $this->role->canAdmin();
    }

    public function isSuperAdmin(): bool
    {
        return $this->role->canSuperAdmin();
    }
}
