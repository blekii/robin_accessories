<?php

header('Content-Type: application/json; charset=utf-8');

try {
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../models/Product.php';

    $product = new Product($pdo);
    $products = $product->getAll();

    echo json_encode(['products' => $products]);

} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);

    echo json_encode([
        'error' => 'Unable to load products'
    ]);
}