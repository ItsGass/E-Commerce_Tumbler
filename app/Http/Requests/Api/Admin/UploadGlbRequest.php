<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UploadGlbRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'glb' => ['required', 'file', 'mimetypes:model/gltf-binary', 'extensions:glb', 'max:10240'], // 10MB max
        ];
    }
}
