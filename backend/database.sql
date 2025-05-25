
-- Create database
CREATE DATABASE IF NOT EXISTS support_app;
USE support_app;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    sr_no VARCHAR(10) PRIMARY KEY,
    ckt VARCHAR(50) UNIQUE NOT NULL,
    cust_name VARCHAR(100) NOT NULL,
    address TEXT,
    email_id VARCHAR(100),
    contact_name VARCHAR(100),
    comm_date VARCHAR(20),
    usable_ip_address VARCHAR(20),
    backup VARCHAR(10),
    device VARCHAR(50),
    bandwidth VARCHAR(20),
    remarks TEXT,
    pop_name VARCHAR(50),
    nas_ip_1 VARCHAR(20),
    switch_ip_1 VARCHAR(20),
    port_no_1 VARCHAR(20),
    vlan_id_1 VARCHAR(10),
    primary_pop VARCHAR(10),
    pop_name_2 VARCHAR(50),
    nas_ip_2 VARCHAR(20),
    switch_ip_2 VARCHAR(20),
    port_no_2 VARCHAR(20),
    vlan_id_2 VARCHAR(10),
    subnet_mask VARCHAR(20),
    gateway VARCHAR(20),
    sales_person VARCHAR(50),
    testing_fe VARCHAR(50),
    mrtg VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    lead_ckt VARCHAR(50) NOT NULL,
    ip_address VARCHAR(20),
    connectivity ENUM('Stable', 'Unstable', 'Unknown') DEFAULT 'Unknown',
    assigned_date DATETIME NOT NULL,
    due_date DATETIME NOT NULL,
    case_remarks TEXT,
    status ENUM('Pending', 'Overdue', 'Completed', 'OnHold') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    INDEX idx_lead_ckt (lead_ckt),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (username, password_hash, full_name, role) 
VALUES ('admin', '$2b$10$rQ8K1QqZ4H4j4H4j4H4j4OzY8YjY8YjY8YjY8YjY8YjY8YjY8YjY8', 'Administrator', 'admin');
