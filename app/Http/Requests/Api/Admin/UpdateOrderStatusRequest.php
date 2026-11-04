<?php

namespace App\Http\Requests\Api\Admin;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $order = $this->route('order');
        $allowedTransitions = OrderStatus::allowedTransitions();
        $currentStatus = $order->status->value;
        $allowed = $allowedTransitions[$currentStatus] ?? [];

        return [
            'status' => ['required', 'string', 'in:'.implode(',', $allowed)],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Invalid status transition.',
        ];
    }
}
