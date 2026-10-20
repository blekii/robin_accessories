<?php

class Product {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getAll() {
        $sql = "
            SELECT
                p.id,
                p.sku,
                p.name,
                p.category,
                p.price,
                p.local_stock,
                s.quantity AS pos_stock,
                s.synced_at AS pos_last_synced
            FROM products p
            LEFT JOIN pos_stock s ON p.sku = s.sku
            ORDER BY p.name
        ";

        $stmt = $this->db->query($sql);

        return $stmt->fetchAll();
    }
}