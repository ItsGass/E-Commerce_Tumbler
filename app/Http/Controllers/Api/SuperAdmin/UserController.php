<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SuperAdmin\ChangeUserRoleRequest;
use App\Http\Requests\Api\SuperAdmin\StoreUserRequest;
use App\Http\Requests\Api\SuperAdmin\UpdateUserRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        $perPage = min($request->integer('per_page', 20), 50);
        $users = $query->paginate($perPage)->withQueryString();

        return new UserCollection($users);
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'street' => $request->street,
            'city' => $request->city,
            'province' => $request->province,
            'postal_code' => $request->postal_code,
            'email_verified_at' => now(),
        ]);

        return (new UserResource($user))
            ->response()
            ->setStatusCode(201);
    }

    public function show(User $user)
    {
        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $user->update($request->validated());

        return new UserResource($user);
    }

    public function destroy(User $user)
    {
        $currentUser = request()->user();

        // Cannot delete self
        if ($currentUser->id === $user->id) {
            return response()->json([
                'message' => 'You cannot delete yourself',
            ], 422);
        }

        // Cannot delete last super admin
        if ($user->role->value === 'super_admin') {
            $superAdminCount = User::where('role', 'super_admin')->count();
            if ($superAdminCount <= 1) {
                return response()->json([
                    'message' => 'Cannot delete the last super admin',
                ], 422);
            }
        }

        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }

    public function changeRole(ChangeUserRoleRequest $request, User $user)
    {
        $currentUser = request()->user();

        // Cannot change own role
        if ($currentUser->id === $user->id) {
            return response()->json([
                'message' => 'You cannot change your own role',
            ], 422);
        }

        // Cannot demote last super admin
        if ($user->role->value === 'super_admin' && $request->role !== 'super_admin') {
            $superAdminCount = User::where('role', 'super_admin')->count();
            if ($superAdminCount <= 1) {
                return response()->json([
                    'message' => 'Cannot demote the last super admin',
                ], 422);
            }
        }

        $user->update(['role' => $request->role]);

        return new UserResource($user);
    }
}
