<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreDemandeEssaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'string', 'max:255', 'email'],
            'pays' => ['required', 'string', Rule::in([
                "Côte d'Ivoire",
                'Cameroun',
                'Burkina Faso',
                'Sénégal',
                'Gabon',
            ])],
            'date_essai' => ['required', 'date', 'after_or_equal:today'],
            'website' => ['prohibited'],
            'started_at' => ['required', 'integer'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom est obligatoire (100 caractères maximum).',
            'nom.max' => 'Le nom est obligatoire (100 caractères maximum).',
            'prenom.required' => 'Le prénom est obligatoire (100 caractères maximum).',
            'prenom.max' => 'Le prénom est obligatoire (100 caractères maximum).',
            'email.email' => 'Indiquez une adresse e-mail valide.',
            'email.max' => 'Indiquez une adresse e-mail valide.',
            'pays.required' => 'Choisissez un pays dans la liste.',
            'pays.in' => 'Choisissez un pays dans la liste.',
            'date_essai.required' => 'La date d’essai souhaitée est obligatoire.',
            'date_essai.date' => 'La date d’essai souhaitée est obligatoire.',
            'date_essai.after_or_equal' => 'Choisissez une date à partir d’aujourd’hui.',
            'website.prohibited' => 'La demande a été refusée. Rechargez la page puis réessayez.',
            'started_at.required' => 'La demande a été refusée. Rechargez la page puis réessayez.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $startedAt = (int) $this->input('started_at', 0);
            $elapsed = $startedAt > 0 ? (int) round(microtime(true) * 1000) - $startedAt : 0;

            if ($elapsed < 2000 || $elapsed > 2 * 60 * 60 * 1000) {
                $validator->errors()->add(
                    'started_at',
                    'La demande a été refusée. Rechargez la page puis réessayez.',
                );
            }
        });
    }

    protected function failedValidation(Validator $validator): void
    {
        $errors = $validator->errors();
        $status = $errors->has('website') || $errors->has('started_at') ? 400 : 422;

        throw new HttpResponseException(response()->json([
            'ok' => false,
            'message' => $status === 400
                ? 'La demande a été refusée. Rechargez la page puis réessayez.'
                : 'Certains champs sont invalides.',
            'errors' => $errors->toArray(),
        ], $status));
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nom' => trim((string) $this->input('nom', '')),
            'prenom' => trim((string) $this->input('prenom', '')),
            'email' => trim((string) $this->input('email', '')),
            'pays' => trim((string) $this->input('pays', '')),
            'website' => trim((string) $this->input('website', '')),
        ]);

        if ($this->input('email') === '') {
            $this->merge(['email' => null]);
        }

        if ($this->input('website') === '') {
            $this->request->remove('website');
        }
    }
}
