<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
    $data = $_POST;
}

$paysAutorises = [
    "Côte d'Ivoire",
    'Cameroun',
    'Burkina Faso',
    'Sénégal',
    'Gabon',
];

$website = trim((string) ($data['website'] ?? ''));
$startedAt = (int) ($data['started_at'] ?? 0);
$nowMs = (int) round(microtime(true) * 1000);
$elapsedMs = $startedAt > 0 ? ($nowMs - $startedAt) : 0;

if ($website !== '' || $elapsedMs < 2000 || $elapsedMs > 2 * 60 * 60 * 1000) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'La demande a été refusée. Rechargez la page puis réessayez.',
    ]);
    exit;
}

$nom = trim((string) ($data['nom'] ?? ''));
$prenom = trim((string) ($data['prenom'] ?? ''));
$email = trim((string) ($data['email'] ?? ''));
$pays = trim((string) ($data['pays'] ?? ''));
$dateEssai = trim((string) ($data['date_essai'] ?? ''));
$len = static fn(string $value): int => function_exists('mb_strlen')
    ? mb_strlen($value)
    : strlen($value);

$errors = [];

if ($nom === '' || $len($nom) > 100) {
    $errors['nom'] = 'Le nom est obligatoire (100 caractères maximum).';
}
if ($prenom === '' || $len($prenom) > 100) {
    $errors['prenom'] = 'Le prénom est obligatoire (100 caractères maximum).';
}
if ($email !== '') {
    if ($len($email) > 255 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Indiquez une adresse e-mail valide.';
    }
}
if (!in_array($pays, $paysAutorises, true)) {
    $errors['pays'] = 'Choisissez un pays dans la liste.';
}

$aujourdhui = (new DateTimeImmutable('today'))->format('Y-m-d');
$dateValide = DateTimeImmutable::createFromFormat('Y-m-d', $dateEssai);
if ($dateEssai === '' || !$dateValide || $dateValide->format('Y-m-d') !== $dateEssai) {
    $errors['date_essai'] = 'La date d’essai souhaitée est obligatoire.';
} elseif ($dateEssai < $aujourdhui) {
    $errors['date_essai'] = 'Choisissez une date à partir d’aujourd’hui.';
}

if ($errors) {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => 'Certains champs sont invalides.',
        'errors' => $errors,
    ]);
    exit;
}

$config = require __DIR__ . '/config.php';

try {
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $config['db_host'],
        $config['db_name'],
        $config['db_charset']
    );
    $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $sql = 'INSERT INTO demandes_essai (nom, prenom, email, pays, date_essai, date_envoi)
            VALUES (:nom, :prenom, :email, :pays, :date_essai, NOW())';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nom' => $nom,
        ':prenom' => $prenom,
        ':email' => $email === '' ? null : $email,
        ':pays' => $pays,
        ':date_essai' => $dateEssai,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Enregistrement impossible pour le moment. Réessayez plus tard.',
    ]);
    exit;
}

echo json_encode([
    'ok' => true,
    'message' => 'Votre demande d’essai a bien été enregistrée. Un conseiller vous recontactera pour confirmer le rendez-vous.',
]);
