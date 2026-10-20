CREATE DATABASE IF NOT EXISTS inventory_dashboard;
USE inventory_dashboard;

-- Products managed by the owner
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    local_stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Most recently synchronized POS stock
CREATE TABLE IF NOT EXISTS pos_stock (
    sku VARCHAR(64) PRIMARY KEY,
    quantity INT NOT NULL,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample products
INSERT INTO products
    (sku, name, category, price, local_stock)
VALUES
    ('CASE001', 'iPhone 16 Case', 'Cases', 15.99, 20),
    ('CHG001', 'USB-C Charger', 'Chargers', 24.99, 12),
    ('CAB001', 'USB-C Cable', 'Cables', 9.99, 30);

-- Simulated POS stock for initial testing
INSERT INTO pos_stock (sku, quantity)
VALUES
    ('CASE001', 18),
    ('CHG001', 12),
    ('CAB001', 25);