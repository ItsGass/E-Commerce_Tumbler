<?php

namespace App\Http\Requests\Api\SuperAdmin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class ChangeUserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $targetUser = $this->route('user');
        $currentUser = $this->user();

        // Cannot demote/delete self - handled in controller/policy
        // Cannot remove last super admin - handled in controller

        return [
            'role' => ['required', 'string', 'in:user,admin,super_admin'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) use ($targetUser, $currentUser) {
            // Prevent self-demotion
            if ($targetUser->id === $currentUser->id) {
                $validator->errors()->add('role', 'You cannot change your own role.');
            }

            // Prevent demoting the last super admin
            if ($targetUser->role->value === 'super_admin' && $this->role !== 'super_admin') {
                $superAdminCount = User::where('role', 'super_admin')->count();
                if ($superAdminCount <= 1) {
                    $validator->errors()->add('role', 'Cannot demote the last super admin.');
                }
            }
        });
    }
}
