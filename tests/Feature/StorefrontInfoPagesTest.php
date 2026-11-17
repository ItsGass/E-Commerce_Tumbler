<?php

use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

/*
|--------------------------------------------------------------------------
| Info pages
|--------------------------------------------------------------------------
|
| The eleven storefront info pages are static demo content. These tests bind
| each path to its Inertia component so a renamed page file or a moved route
| cannot silently fall through to another screen.
|
*/

test('every info page renders its Inertia component', function (string $path, string $component) {
    $this->get($path)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    'shipping' => ['/shipping', 'info/shipping'],
    'returns' => ['/returns', 'info/returns'],
    'contact' => ['/contact', 'info/contact'],
    'about' => ['/about', 'info/about'],
    'sustainability' => ['/sustainability', 'info/sustainability'],
    'careers' => ['/careers', 'info/careers'],
    'press' => ['/press', 'info/press'],
    'gift cards' => ['/gift-cards', 'info/gift-cards'],
    'privacy' => ['/privacy', 'info/privacy'],
    'terms' => ['/terms', 'info/terms'],
    'cookies' => ['/cookies', 'info/cookies'],
]);

test('an unknown storefront path renders the 404 page', function () {
    $this->get('/an-unknown-info-page')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page->component('errors/404'));
});

/*
|--------------------------------------------------------------------------
| Contact endpoint
|--------------------------------------------------------------------------
|
| The demo form validates on the server and confirms with a flash message.
| It deliberately has no table, no mailer and no queue job, so a successful
| request must not write a single row.
|
*/

test('the contact endpoint accepts a valid demo message and stores nothing', function () {
    $writes = [];

    DB::listen(function ($query) use (&$writes): void {
        if (preg_match('/^\s*(insert|update|delete|replace)\b/i', $query->sql)) {
            $writes[] = $query->sql;
        }
    });

    $this->from('/contact')
        ->post('/contact', [
            'name' => 'Demo Visitor',
            'email' => 'visitor@example.test',
            'message' => 'This is a demo message with enough detail to pass.',
        ])
        ->assertRedirect('/contact')
        ->assertSessionHas('contact_sent', true)
        ->assertSessionHasNoErrors();

    expect($writes)->toBe([]);
});

test('the contact endpoint rejects invalid input and stores nothing', function (array $payload, array $invalidFields) {
    $writes = [];

    DB::listen(function ($query) use (&$writes): void {
        if (preg_match('/^\s*(insert|update|delete|replace)\b/i', $query->sql)) {
            $writes[] = $query->sql;
        }
    });

    $this->from('/contact')
        ->post('/contact', $payload)
        ->assertRedirect('/contact')
        ->assertSessionHasErrors($invalidFields)
        ->assertSessionMissing('contact_sent');

    expect($writes)->toBe([]);
})->with([
    'nothing submitted' => [
        [],
        ['name', 'email', 'message'],
    ],
    'name too short' => [
        ['name' => 'A', 'email' => 'visitor@example.test', 'message' => 'A sufficiently long demo message.'],
        ['name'],
    ],
    'invalid email' => [
        ['name' => 'Demo Visitor', 'email' => 'not-an-email', 'message' => 'A sufficiently long demo message.'],
        ['email'],
    ],
    'message too short' => [
        ['name' => 'Demo Visitor', 'email' => 'visitor@example.test', 'message' => 'Too short'],
        ['message'],
    ],
]);
