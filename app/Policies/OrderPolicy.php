<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        // Admin can view all orders
        if ($user->isAdmin()) {
            return true;
        }

        // User can view their own orders
        return $order->user_id === $user->id;
    }

    public function updateStatus(User $user, Order $order): bool
    {
        return $user->isAdmin();
    }

    public function markPaid(User $user, Order $order): bool
    {
        return $user->isAdmin();
    }

    public function cancel(User $user, Order $order): bool
    {
        // Admin can cancel any order
        if ($user->isAdmin()) {
            return true;
        }

        // User can cancel their own order if allowed by status
        if ($order->user_id === $user->id) {
            return $order->restoresStockOnCancel();
        }

        return false;
    }
}
