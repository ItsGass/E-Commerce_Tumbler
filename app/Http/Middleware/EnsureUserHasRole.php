<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * @param  string  ...$roles  Comma-separated middleware arguments arrive as
     *                            one parameter each (`role:admin,super_admin`).
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $wantsJson = $request->is('api') || $request->is('api/*') || $request->expectsJson();

        if (! $user) {
            return $wantsJson
                ? response()->json(['message' => 'Unauthenticated.'], 401)
                : redirect()->route('login');
        }

        if (! in_array($user->role->value, $roles, true)) {
            return $wantsJson
                ? response()->json(['message' => 'Forbidden.'], 403)
                : Inertia::render('errors/403')->toResponse($request)->setStatusCode(403);
        }

        return $next($request);
    }
}
