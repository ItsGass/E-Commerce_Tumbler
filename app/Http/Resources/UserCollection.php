<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        // The paginator already adds `links` and `meta`; returning our own
        // `meta` made array_merge_recursive turn every shared key into an
        // array (current_page: [1, 1], path: [url, url]).
        return [
            'data' => parent::toArray($request),
        ];
    }
}
