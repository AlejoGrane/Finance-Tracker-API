
CREATE DATABASE IF NOT EXISTS finance_tracker;
USE finance_tracker;

-- Usuarios
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gastos
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  category ENUM('Groceries', 'Leisure', 'Electronics', 'Utilities', 'Clothing', 'Health', 'Others') NOT NULL,
  description VARCHAR(255),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ahorros
CREATE TABLE savings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inversiones
CREATE TABLE investments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  category ENUM('Stock', 'Bond', 'Mutual Funds', 'ETF', 'Real State', 'Term Deposit', 'Others') NOT NULL,
  return_rate DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
