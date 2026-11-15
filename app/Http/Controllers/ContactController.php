<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    /**
     * Validate the demo contact form and confirm it without sending or
     * storing anything. No table and no mail integration is involved.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:80'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        return back()->with('contact_sent', true);
    }
}
