# Backend API - Landing Page Horizon GT

Backend Node.js avec Express et SQLite pour gérer les demandes d'essai.

## Installation

```bash
cd server
npm install
```

## Démarrage

```bash
npm start
```

Le serveur démarre sur le port 3000 par défaut.

## Endpoints

### POST /api/submit
Enregistre une nouvelle demande d'essai.

**Corps de la requête :**
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean@example.com",
  "pays": "Cameroun",
  "date_essai": "2026-10-20",
  "started_at": 1729096800000
}
```

**Réponse :**
```json
{
  "ok": true,
  "message": "Votre demande d'essai a bien été enregistrée..."
}
```

### GET /api/demandes
Récupère toutes les demandes d'essai (optionnel, pour admin).

## Base de données

La base de données SQLite est créée automatiquement dans `server/database.sqlite`.

**Schéma :**
- `id`: Clé primaire auto-incrémentée
- `nom`: Nom du demandeur (obligatoire)
- `prenom`: Prénom du demandeur (obligatoire)
- `email`: Email (facultatif)
- `pays`: Pays (obligatoire)
- `date_essai`: Date souhaitée (obligatoire)
- `date_envoi`: Date d'envoi de la demande

## Validation

- Protection honeypot (champ `website`)
- Validation du temps de remplissage (entre 2 secondes et 2 heures)
- Validation des champs obligatoires
- Validation de l'email si fourni
- Validation de la date (doit être future ou aujourd'hui)
- Pays autorisés : Côte d'Ivoire, Cameroun, Burkina Faso, Sénégal, Gabon
