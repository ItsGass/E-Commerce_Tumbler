<?php

use Inertia\Testing\AssertableInertia as Assert;

test('unknown api path answers with a json 404 instead of the spa shell', function () {
    $response = $this->getJson('/api/does-not-exist');

    $response->assertNotFound();
    $response->assertExactJson(['message' => 'Not found']);
    $response->assertHeader('content-type', 'application/json');
});

test('unknown api path answers with json even without an accept header', function () {
    $response = $this->get('/api/does-not-exist');

    $response->assertNotFound();
    $response->assertExactJson(['message' => 'Not found']);
    $response->assertHeader('content-type', 'application/json');
});

test('the api prefix itself answers with a json 404', function () {
    $response = $this->get('/api');

    $response->assertNotFound();
    $response->assertExactJson(['message' => 'Not found']);
});

test('unknown spa paths answer with the 404 page instead of the home shell', function () {
    $response = $this->get('/totally-unknown-spa-path');

    $response->assertNotFound();
    $response->assertHeader('content-type', 'text/html; charset=UTF-8');
    $response->assertInertia(fn (Assert $page) => $page->component('errors/404'));
});
