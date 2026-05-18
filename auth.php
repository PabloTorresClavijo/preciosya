<?php
// ============================================================
//  PRECIOSYA — auth.php
// ============================================================

session_name('PRECIOSYA_SESS');
session_set_cookie_params([
    'lifetime' => 86400,
    'path'     => '/',
    'domain'   => '',
    'secure'   => false,
    'httponly'  => true,
    'samesite' => 'Lax'
]);
session_start();

// CORS — acepta cualquier origen de localhost
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: http://localhost');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// Conexión BD
$host = 'localhost'; $db = 'preciosya'; $user = 'root'; $pass = '';
try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['ok' => false, 'error' => 'Error BD: ' . $e->getMessage()]); exit;
}

// GET: comprobar sesión
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action === 'sesion') {
        if (isset($_SESSION['usuario_id'])) {
            $stmt = $pdo->prepare("SELECT id, nombre, email, rol FROM usuarios WHERE id = ?");
            $stmt->execute([$_SESSION['usuario_id']]);
            $u = $stmt->fetch(PDO::FETCH_ASSOC);
            echo $u ? json_encode(['logueado' => true, 'usuario' => $u]) : json_encode(['logueado' => false]);
        } else {
            echo json_encode(['logueado' => false]);
        }
    }
    exit;
}

$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $body['action'] ?? '';

// LOGIN
if ($action === 'login') {
    $email = trim($body['email'] ?? '');
    $pass2 = trim($body['password'] ?? '');
    if (!$email || !$pass2) { echo json_encode(['ok'=>false,'error'=>'Rellena todos los campos.']); exit; }

    $stmt = $pdo->prepare("SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $u = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$u || !password_verify($pass2, $u['password'])) {
        echo json_encode(['ok'=>false,'error'=>'Email o contraseña incorrectos.']); exit;
    }

    session_regenerate_id(true);
    $_SESSION['usuario_id'] = (int)$u['id'];
    $_SESSION['rol']        = $u['rol'];

    echo json_encode(['ok'=>true,'usuario'=>['id'=>(int)$u['id'],'nombre'=>$u['nombre'],'email'=>$u['email'],'rol'=>$u['rol']]]);
    exit;
}

// REGISTRO
if ($action === 'registro') {
    $nombre = trim($body['nombre'] ?? '');
    $email  = trim($body['email']  ?? '');
    $pass2  = trim($body['password'] ?? '');
    if (!$nombre||!$email||!$pass2) { echo json_encode(['ok'=>false,'error'=>'Rellena todos los campos.']); exit; }
    if (!filter_var($email,FILTER_VALIDATE_EMAIL)) { echo json_encode(['ok'=>false,'error'=>'Email no válido.']); exit; }
    if (strlen($pass2)<6) { echo json_encode(['ok'=>false,'error'=>'Mínimo 6 caracteres.']); exit; }

    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email=?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) { echo json_encode(['ok'=>false,'error'=>'Email ya registrado.']); exit; }

    $hash = password_hash($pass2, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO usuarios (nombre,email,password,rol) VALUES (?,?,?,'cliente')");
    $stmt->execute([$nombre,$email,$hash]);
    $id = (int)$pdo->lastInsertId();

    session_regenerate_id(true);
    $_SESSION['usuario_id'] = $id;
    $_SESSION['rol']        = 'cliente';

    echo json_encode(['ok'=>true,'usuario'=>['id'=>$id,'nombre'=>$nombre,'email'=>$email,'rol'=>'cliente']]);
    exit;
}

// LOGOUT
if ($action === 'logout') {
    $_SESSION = [];
    setcookie(session_name(), '', time()-42000, '/');
    session_destroy();
    echo json_encode(['ok'=>true]);
    exit;
}

echo json_encode(['ok'=>false,'error'=>'Acción no reconocida.']);