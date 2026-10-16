<?php

use App\Http\Controllers\Api\DemandeEssaiController;
use Illuminate\Support\Facades\Route;

Route::post('/demandes', [DemandeEssaiController::class, 'store']);
