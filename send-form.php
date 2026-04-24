<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'message' => 'Nepodporovaná metoda.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function clean_input(string $value): string
{
    return trim(str_replace(["\r", "\n"], ' ', $value));
}

$name = clean_input($_POST['name'] ?? '');
$phone = clean_input($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');
$location = clean_input($_POST['location'] ?? '');
$objectType = clean_input($_POST['object_type'] ?? '');
$projectStage = clean_input($_POST['project_stage'] ?? '');
$solutions = array_values(array_filter(array_map(
    static fn($value) => clean_input((string) $value),
    is_array($_POST['solutions'] ?? null) ? $_POST['solutions'] : []
)));
$message = trim($_POST['message'] ?? '');

if ($name === '' || $phone === '' || $email === '' || $location === '' || $objectType === '' || $projectStage === '' || $message === '' || $solutions === []) {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => 'Doplňte prosím všechna povinná pole.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => 'Zadejte prosím platný e-mail.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$to = 'info@smartport.cz';
$subject = 'SMARTPORT poptávka realizace';
$body = implode("\n", [
    'Jméno a příjmení: ' . $name,
    'Telefon: ' . $phone,
    'E-mail: ' . $email,
    'Lokalita realizace: ' . $location,
    'Typ objektu: ' . $objectType,
    'Fáze projektu: ' . $projectStage,
    'Co chce klient řešit: ' . implode(', ', $solutions),
    '',
    'Zpráva a zadání projektu:',
    $message
]);

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: SMARTPORT web <info@smartport.cz>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion()
];

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = mail($to, $encodedSubject, $body, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Poptávku se nepodařilo odeslat. Zkuste to prosím znovu později.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'ok' => true,
    'message' => 'Poptávka byla odeslána.'
], JSON_UNESCAPED_UNICODE);
