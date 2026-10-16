import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Pays autorisés
const PAYS_AUTORISES = [
  "Côte d'Ivoire",
  'Cameroun',
  'Burkina Faso',
  'Sénégal',
  'Gabon',
];

// Initialisation de la base de données SQLite
async function initDb() {
  const db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS demandes_essai (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT,
      pays TEXT NOT NULL,
      date_essai TEXT NOT NULL,
      date_envoi TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

let db;
initDb().then(database => {
  db = database;
  console.log('Base de données initialisée');
}).catch(err => {
  console.error('Erreur d\'initialisation de la base de données:', err);
});

// Validation des données
function validateData(data) {
  const errors = {};
  const len = (value) => value ? value.length : 0;

  // Honeypot check
  const website = (data.website || '').trim();
  const startedAt = parseInt(data.started_at || 0);
  const nowMs = Date.now();
  const elapsedMs = startedAt > 0 ? (nowMs - startedAt) : 0;

  if (website !== '' || elapsedMs < 2000 || elapsedMs > 2 * 60 * 60 * 1000) {
    return {
      valid: false,
      honeypot: true,
      message: 'La demande a été refusée. Rechargez la page puis réessayez.'
    };
  }

  const nom = (data.nom || '').trim();
  const prenom = (data.prenom || '').trim();
  const email = (data.email || '').trim();
  const pays = (data.pays || '').trim();
  const dateEssai = (data.date_essai || '').trim();

  if (nom === '' || len(nom) > 100) {
    errors.nom = 'Le nom est obligatoire (100 caractères maximum).';
  }
  if (prenom === '' || len(prenom) > 100) {
    errors.prenom = 'Le prénom est obligatoire (100 caractères maximum).';
  }
  if (email !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (len(email) > 255 || !emailRegex.test(email)) {
      errors.email = 'Indiquez une adresse e-mail valide.';
    }
  }
  if (!PAYS_AUTORISES.includes(pays)) {
    errors.pays = 'Choisissez un pays dans la liste.';
  }

  const aujourdhui = new Date().toISOString().split('T')[0];
  const dateValide = new Date(dateEssai);
  const dateValideStr = dateValide.toISOString().split('T')[0];

  if (dateEssai === '' || isNaN(dateValide.getTime()) || dateValideStr !== dateEssai) {
    errors.date_essai = 'La date d\'essai souhaitée est obligatoire.';
  } else if (dateEssai < aujourdhui) {
    errors.date_essai = 'Choisissez une date à partir d\'aujourd\'hui.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      valid: false,
      errors,
      message: 'Certains champs sont invalides.'
    };
  }

  return {
    valid: true,
    data: { nom, prenom, email, pays, date_essai: dateEssai }
  };
}

// Endpoint API pour les demandes d'essai
app.post('/api/submit', async (req, res) => {
  try {
    const validation = validateData(req.body);

    if (!validation.valid) {
      if (validation.honeypot) {
        return res.status(400).json({
          ok: false,
          message: validation.message
        });
      }
      return res.status(422).json({
        ok: false,
        message: validation.message,
        errors: validation.errors
      });
    }

    const { nom, prenom, email, pays, date_essai } = validation.data;

    await db.run(
      'INSERT INTO demandes_essai (nom, prenom, email, pays, date_essai, date_envoi) VALUES (?, ?, ?, ?, ?, datetime("now"))',
      [nom, prenom, email || null, pays, date_essai]
    );

    res.json({
      ok: true,
      message: 'Votre demande d\'essai a bien été enregistrée. Un conseiller vous recontactera pour confirmer le rendez-vous.'
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      ok: false,
      message: 'Enregistrement impossible pour le moment. Réessayez plus tard.'
    });
  }
});

// Endpoint pour lister les demandes (optionnel, pour admin)
app.get('/api/demandes', async (req, res) => {
  try {
    const demandes = await db.all('SELECT * FROM demandes_essai ORDER BY date_envoi DESC');
    res.json(demandes);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      ok: false,
      message: 'Erreur lors de la récupération des demandes.'
    });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}/api/submit`);
});
