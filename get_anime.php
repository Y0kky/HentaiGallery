<?php
// api/get_anime.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Параметры пагинации
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
$offset = ($page - 1) * $limit;

// ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ (замените на свои данные)
try {
    $db = new PDO('mysql:host=localhost;dbname=anime_db', 'root', '');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec("set names utf8");
} catch(PDOException $e) {
    // Если база не работает, возвращаем тестовые данные
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка БД: ' . $e->getMessage(),
        'data' => generateTestData($page, $limit)
    ]);
    exit;
}

// Получаем общее количество
$totalStmt = $db->query("SELECT COUNT(*) FROM anime_girls");
$total = $totalStmt->fetchColumn();

// Получаем данные с пагинацией
$stmt = $db->prepare("SELECT * FROM anime_girls LIMIT :limit OFFSET :offset");
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$totalPages = ceil($total / $limit);

echo json_encode([
    'success' => true,
    'data' => $data,
    'pagination' => [
        'current_page' => $page,
        'per_page' => $limit,
        'total' => $total,
        'total_pages' => $totalPages,
        'has_next' => $page < $totalPages,
        'has_prev' => $page > 1
    ]
]);

// Функция для генерации тестовых данных (если нет БД)
function generateTestData($page, $limit) {
    $offset = ($page - 1) * $limit;
    $data = [];
    
    for ($i = $offset + 1; $i <= $offset + $limit && $i <= 100; $i++) {
        $data[] = [
            'id' => $i,
            'name' => "Тестовая девушка #{$i}",
            'anime' => "Тестовое аниме #" . rand(1, 20),
            'image_url' => "https://via.placeholder.com/300x400?text=Girl+{$i}",
            'popularity' => rand(1, 1000)
        ];
    }
    
    return $data;
}
?>