<?php

namespace App\Http\Requests\Api\Checkout;

use Illuminate\Foundation\Http\FormRequest;

class GuestCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'buyer' => ['required', 'array'],
            'buyer.name' => ['required', 'string', 'max:255'],
            'buyer.email' => ['required', 'string', 'email', 'max:255'],
            'buyer.phone' => ['required', 'string', 'max:20'],
            'buyer.street' => ['required', 'string', 'max:255'],
            'buyer.city' => ['required', 'string', 'max:100'],
            'buyer.province' => ['required', 'string', 'max:100'],
            'buyer.postal_code' => ['required', 'string', 'max:10'],
        ];
    }
}
