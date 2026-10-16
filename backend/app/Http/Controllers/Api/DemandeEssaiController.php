<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDemandeEssaiRequest;
use App\Models\DemandeEssai;
use Illuminate\Http\JsonResponse;

class DemandeEssaiController extends Controller
{
    public function store(StoreDemandeEssaiRequest $request): JsonResponse
    {
        $demande = DemandeEssai::create([
            ...$request->safe()->only(['nom', 'prenom', 'email', 'pays', 'date_essai']),
            'date_envoi' => now(),
        ]);

        return response()->json([
            'ok' => true,
            'message' => 'Votre demande d’essai a bien été enregistrée. Un conseiller vous recontactera pour confirmer le rendez-vous.',
            'demande' => [
                'id' => $demande->id,
                'date_envoi' => $demande->date_envoi?->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
            ],
        ]);
    }
}
