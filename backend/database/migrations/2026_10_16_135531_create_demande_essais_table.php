<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes_essai', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->string('email', 255)->nullable();
            $table->string('pays', 50);
            $table->date('date_essai');
            $table->timestamp('date_envoi');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes_essai');
    }
};
