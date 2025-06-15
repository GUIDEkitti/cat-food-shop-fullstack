CREATE DATABASE catshop

USE catshop;

DROP TABLE IF EXISTS purchase_history;
DROP TABLE IF EXISTS product_logs;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT DEFAULT 1,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255),
    product_image LONGBLOB,
    product_price DECIMAL(10,2),
    product_type VARCHAR(50),
    description TEXT,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    quantity INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipping_address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE product_logs (
    product_log_id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT,
    product_id INT,
    action VARCHAR(50),
    quantity INT,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE purchase_history (
    purchase_history_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    quantity INT,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- roles
INSERT INTO roles (role_name) VALUES ('user'), ('seller'), ('admin');

-- users
INSERT INTO users (username, phone, password, role_id, approved) VALUES
('supannee', '0812345678', '1111', 1, TRUE),
('kitti', '0812345678', '1111', 1, TRUE),
('woraphon', '0822222222', '1111', 2, TRUE),
('drnat', '0833333333', '1111', 3, TRUE),
('instore_guest', '0000000000', 'N/A', 1, TRUE);

-- products
INSERT INTO products (product_name, product_image, product_price, product_type, description, stock) VALUES
('อาหารแมว Meow Mix', 'image1.jpg', 150.00, 'อาหาร', 'อาหารแมวรสปลาทะเลรวม', 100),
('ปลอกคอแมว', 'image2.jpg', 80.00, 'อุปกรณ์', 'ปลอกคอนุ่ม ใส่สบาย', 50),
('ทรายแมว', 'image3.jpg', 120.00, 'ของใช้', 'ทรายแมวกลิ่นลาเวนเดอร์', 70);

