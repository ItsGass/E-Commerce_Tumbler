<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isAdmin = $user && $user->isAdmin();

        $data = [
            'id' => $this->id,
            'code' => $this->code,
            'status' => $this->status->value,
            'subtotal' => $this->subtotal,
            'shipping_cost' => $this->shipping_cost,
            'total' => $this->total,
            'buyer' => [
                'name' => $this->buyer_name,
                'email' => $this->buyer_email,
                'phone' => $this->buyer_phone,
                'street' => $this->buyer_street,
                'city' => $this->buyer_city,
                'province' => $this->buyer_province,
                'postal_code' => $this->buyer_postal_code,
            ],
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'paid_at' => $this->paid_at?->toISOString(),
            'shipped_at' => $this->shipped_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'cancellation_reason' => $this->cancellation_reason,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];

        // Only show user_id to admins
        if ($isAdmin) {
            $data['user_id'] = $this->user_id;
        }

        return $data;
    }
}
