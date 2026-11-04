<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'color_hex' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'texture' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png', 'extensions:jpg,jpeg,png', 'max:5120'],
            'glb' => ['nullable', 'file', 'mimetypes:model/gltf-binary', 'extensions:glb', 'max:10240'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_default' => ['boolean'],
        ];
    }
}
