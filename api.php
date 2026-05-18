<?php
// ============================================================
//  PRECIOSYA — api.php
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
    echo json_encode(['error'=>'Error BD: '.$e->getMessage()]); exit;
}

$usuarioId = isset($_SESSION['usuario_id']) ? (int)$_SESSION['usuario_id'] : null;

// ── GET ──────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $accion = $_GET['accion'] ?? '';

    if ($accion === '' || $accion === 'productos') {
        $stmt = $pdo->query("SELECT * FROM productos ORDER BY id ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['products' => array_map(function($p) {
            return [
                'id'           => (int)$p['id'],
                'title'        => $p['nombre'],
                'description'  => $p['descripcion'],
                'category'     => $p['categoria'],
                'thumbnail'    => $p['imagen'] ?: 'img/logo2.png',
                'allergens'    => $p['alergenos']     ? explode(',', $p['alergenos'])     : [],
                'noDisponible' => $p['no_disponible'] ? explode(',', $p['no_disponible']) : [],
                'preciosFijos' => [
                    'Mercadona' => (float)$p['precio_mercadona'],
                    'Carrefour' => (float)$p['precio_carrefour'],
                    'Dia'       => (float)$p['precio_dia'],
                    'Lidl'      => (float)$p['precio_lidl'],
                ]
            ];
        }, $rows)]);
        exit;
    }

    if ($accion === 'favoritos') {
        if (!$usuarioId) { echo json_encode(['favoritos'=>[]]); exit; }
        $stmt = $pdo->prepare("SELECT producto_id FROM favoritos WHERE usuario_id=?");
        $stmt->execute([$usuarioId]);
        echo json_encode(['favoritos' => array_map('intval', array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'producto_id'))]);
        exit;
    }

    if ($accion === 'carrito') {
        if (!$usuarioId) { echo json_encode(['carrito'=>[]]); exit; }
        $stmt = $pdo->prepare("SELECT producto_id, cantidad FROM carrito WHERE usuario_id=?");
        $stmt->execute([$usuarioId]);
        echo json_encode(['carrito' => array_map(function($r) {
            return ['producto_id'=>(int)$r['producto_id'], 'cantidad'=>(int)$r['cantidad']];
        }, $stmt->fetchAll(PDO::FETCH_ASSOC))]);
        exit;
    }

    echo json_encode(['error'=>'Acción no reconocida.']); exit;
}

// ── POST ─────────────────────────────────────────────────────
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$accion = $body['accion'] ?? '';

if ($accion === 'favorito_toggle') {
    if (!$usuarioId) { echo json_encode(['ok'=>false,'error'=>'No autenticado.']); exit; }
    $prodId = (int)($body['producto_id'] ?? 0);
    $stmt = $pdo->prepare("SELECT id FROM favoritos WHERE usuario_id=? AND producto_id=?");
    $stmt->execute([$usuarioId, $prodId]);
    if ($stmt->fetch()) {
        $pdo->prepare("DELETE FROM favoritos WHERE usuario_id=? AND producto_id=?")->execute([$usuarioId,$prodId]);
        echo json_encode(['ok'=>true,'accion'=>'quitado']);
    } else {
        $pdo->prepare("INSERT INTO favoritos (usuario_id,producto_id) VALUES (?,?)")->execute([$usuarioId,$prodId]);
        echo json_encode(['ok'=>true,'accion'=>'añadido']);
    }
    exit;
}

if ($accion === 'favoritos_sync') {
    if (!$usuarioId) { echo json_encode(['ok'=>false]); exit; }
    foreach (($body['ids'] ?? []) as $pid) {
        $pdo->prepare("INSERT IGNORE INTO favoritos (usuario_id,producto_id) VALUES (?,?)")->execute([$usuarioId,(int)$pid]);
    }
    echo json_encode(['ok'=>true]); exit;
}

if ($accion === 'carrito_add') {
    if (!$usuarioId) { echo json_encode(['ok'=>false,'error'=>'No autenticado.']); exit; }
    $prodId   = (int)($body['producto_id'] ?? 0);
    $cantidad = (int)($body['cantidad']    ?? 1);
    $pdo->prepare("INSERT INTO carrito (usuario_id,producto_id,cantidad) VALUES (?,?,?) ON DUPLICATE KEY UPDATE cantidad=cantidad+?")->execute([$usuarioId,$prodId,$cantidad,$cantidad]);
    echo json_encode(['ok'=>true]); exit;
}

if ($accion === 'carrito_cantidad') {
    if (!$usuarioId) { echo json_encode(['ok'=>false]); exit; }
    $pdo->prepare("UPDATE carrito SET cantidad=? WHERE usuario_id=? AND producto_id=?")->execute([(int)($body['cantidad']??1),$usuarioId,(int)($body['producto_id']??0)]);
    echo json_encode(['ok'=>true]); exit;
}

if ($accion === 'carrito_remove') {
    if (!$usuarioId) { echo json_encode(['ok'=>false]); exit; }
    $pdo->prepare("DELETE FROM carrito WHERE usuario_id=? AND producto_id=?")->execute([$usuarioId,(int)($body['producto_id']??0)]);
    echo json_encode(['ok'=>true]); exit;
}

if ($accion === 'carrito_sync') {
    if (!$usuarioId) { echo json_encode(['ok'=>false]); exit; }
    foreach (($body['items'] ?? []) as $item) {
        $pid = (int)($item['producto_id']??0); $qty = (int)($item['cantidad']??1);
        $pdo->prepare("INSERT INTO carrito (usuario_id,producto_id,cantidad) VALUES (?,?,?) ON DUPLICATE KEY UPDATE cantidad=cantidad+?")->execute([$usuarioId,$pid,$qty,$qty]);
    }
    echo json_encode(['ok'=>true]); exit;
}

if ($accion === 'producto_guardar') {
    if (($_SESSION['rol']??'')!=='admin') { echo json_encode(['ok'=>false,'error'=>'Sin permiso.']); exit; }
    $id=$body['id']??(int)0; $nombre=trim($body['nombre']??'');
    if (!$nombre) { echo json_encode(['ok'=>false,'error'=>'Nombre obligatorio.']); exit; }
    $campos = [$nombre,trim($body['descripcion']??''),trim($body['categoria']??''),(float)($body['precio_mercadona']??0),(float)($body['precio_carrefour']??0),(float)($body['precio_dia']??0),(float)($body['precio_lidl']??0),trim($body['imagen']??''),trim($body['alergenos']??''),trim($body['no_disponible']??'')];
    if ($id) {
        $campos[]=(int)$id;
        $pdo->prepare("UPDATE productos SET nombre=?,descripcion=?,categoria=?,precio_mercadona=?,precio_carrefour=?,precio_dia=?,precio_lidl=?,imagen=?,alergenos=?,no_disponible=? WHERE id=?")->execute($campos);
        echo json_encode(['ok'=>true,'id'=>(int)$id]);
    } else {
        $pdo->prepare("INSERT INTO productos (nombre,descripcion,categoria,precio_mercadona,precio_carrefour,precio_dia,precio_lidl,imagen,alergenos,no_disponible) VALUES (?,?,?,?,?,?,?,?,?,?)")->execute($campos);
        echo json_encode(['ok'=>true,'id'=>(int)$pdo->lastInsertId()]);
    }
    exit;
}

if ($accion === 'producto_eliminar') {
    if (($_SESSION['rol']??'')!=='admin') { echo json_encode(['ok'=>false,'error'=>'Sin permiso.']); exit; }
    $pdo->prepare("DELETE FROM productos WHERE id=?")->execute([(int)($body['id']??0)]);
    echo json_encode(['ok'=>true]); exit;
}

echo json_encode(['ok'=>false,'error'=>'Acción no reconocida.']);