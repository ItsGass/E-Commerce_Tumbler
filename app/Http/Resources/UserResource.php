<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $currentUser = $request->user();
        $isSelf = $currentUser && $currentUser->id === $this->id;
        $isAdmin = $currentUser && $currentUser->isAdmin();

        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role->value,
            'profile_complete' => $this->profile_complete,
            'abilities' => [
                'can_admin' => $this->isAdmin(),
                'can_super_admin' => $this->isSuperAdmin(),
                'profile_complete' => $this->profile_complete,
            ],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];

        // Show profile fields to self or admin
        if ($isSelf || $isAdmin) {
            $data['phone'] = $this->phone;
            $data['street'] = $this->street;
            $data['city'] = $this->city;
            $data['province'] = $this->province;
            $data['postal_code'] = $this->postal_code;
        }

        return $data;
    }
}
