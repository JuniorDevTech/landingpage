<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nom', 'prenom', 'email', 'pays', 'date_essai', 'date_envoi'])]
class DemandeEssai extends Model
{
    protected $table = 'demandes_essai';

    protected function casts(): array
    {
        return [
            'date_essai' => 'date',
            'date_envoi' => 'datetime',
        ];
    }
}
