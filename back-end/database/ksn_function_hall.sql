create database KSN_FUNCTION_HALL;
use KSN_FUNCTION_HALL;
CREATE TABLE ksn_function_hall_admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100) ,
  password VARCHAR(255),
  username VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO ksn_function_hall_admins
(name, email, username, password)
VALUES
(
  'Admin',
  'admin@ksn.com',
  'ksnadmin',
  '$2b$10$vPVqb8c8tHOUhjUv906KfOTH3c9G0KqDRuT3nEsCkb8OejKC8WlAi'
);
CREATE TABLE ksn_function_hall_customer_details (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) ,
    alternate_phone VARCHAR(15),
    email VARCHAR(255),
    address TEXT,
    -- Store file names/paths for documents
    aadhar_customer_path VARCHAR(255) ,
    aadhar_bride_path VARCHAR(255),
    aadhar_groom_path VARCHAR(255),
    wedding_card_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE ksn_function_hall_referrals (
    referral_id INT AUTO_INCREMENT PRIMARY KEY,
    referral_name VARCHAR(255),
    referral_mobileno VARCHAR(20),
    referral_email VARCHAR(255),
    status ENUM('PENDING','PAID') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ksn_function_hall_referral_payment (
    referralpayment_id INT AUTO_INCREMENT PRIMARY KEY,
    referral_id INT NOT NULL,
    booking_id INT NOT NULL,
    referral_amount DECIMAL(10,2) NOT NULL,
    referral_payment_method ENUM('RAZORPAY','PHONEPE','CASH') NOT NULL,
    referral_payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (referral_id) REFERENCES ksn_function_hall_referrals(referral_id),
    FOREIGN KEY (booking_id) REFERENCES ksn_function_hall_bookings(booking_id)
);
CREATE TABLE ksn_function_hall_bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    referral_id INT,
    category VARCHAR(50) NOT NULL,
    hall VARCHAR(50) NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration DECIMAL(5,2), 
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    gross_total_before_discount DECIMAL(10,2),
    fixed_charges_total DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    hall_charge DECIMAL(10,2),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    balance_due_date datetime ,
    onhold_at datetime,
    booking_status	enum('Booking','INPROGRESS','ADVANCE','CANCELLED','ONHOLD','CLOSED'),
    onhold_reason VARCHAR(255) ,
    FOREIGN KEY (customer_id) REFERENCES ksn_function_hall_customer_details(customer_id),
    FOREIGN KEY (referral_id) REFERENCES ksn_function_hall_referrals(referral_id)
);

CREATE TABLE ksn_function_hall_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE ksn_function_hall_timeslots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    slot_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE ksn_function_hall_halls (
    hall_id INT AUTO_INCREMENT PRIMARY KEY,
    hall_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE ksn_function_hall_prices (
    rule_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    hall_name VARCHAR(100) NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    base_price_per_hour DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    advance_percent DECIMAL(5,2) DEFAULT 0,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE ksn_function_hall_fixed_charges (
    charges_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    charges_name VARCHAR(150),
    charges_value DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES ksn_function_hall_categories(category_id)
);
CREATE TABLE ksn_function_hall_utility_costs (
    utility_id INT AUTO_INCREMENT PRIMARY KEY,
    utility_name VARCHAR(50) NOT NULL,
    category_id INT NOT NULL,
    price_per_hour DECIMAL(10,2) NOT NULL,
    default_hours INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES ksn_function_hall_categories(category_id)
);
CREATE TABLE ksn_function_hall_employee(
    emp_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_name VARCHAR(100) NOT NULL,
    emp_email VARCHAR(100) UNIQUE NOT NULL,
    emp_phone VARCHAR(20),
    emp_role VARCHAR(50),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(100) NOT NULL, 
    login_count INT DEFAULT 0,
    last_login TIMESTAMP NULL DEFAULT NULL,
    last_logout TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE ksn_function_hall_contacts (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mobile VARCHAR(20),
    subject VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE ksn_function_hall_staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(15),
    salary DECIMAL(10,2),
    join_date DATE,
    status VARCHAR(20) DEFAULT 'Active',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ksn_function_hall_vendors (
    vendor_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_category VARCHAR(255) NOT NULL,  -- e.g., Catering, Decoration, etc.
    vendor_address VARCHAR(500),
    phone VARCHAR(10),
    email VARCHAR(255),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ksn_function_hall_services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    service_description TEXT,
    vendor_id INT NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES ksn_function_hall_vendors(vendor_id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
CREATE TABLE ksn_function_hall_terms_conditions (
    terms_id INT AUTO_INCREMENT PRIMARY KEY,
    terms_text_en TEXT NOT NULL,
    terms_text_te TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE ksn_function_hall_payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    payment_type ENUM('ADVANCE','BALANCE','FULL') NOT NULL,
    payment_method ENUM('RAZORPAY','PHONEPE','CASH') NOT NULL,

    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL,
    balance_amount DECIMAL(10,2) NOT NULL,
    gateway_order_id VARCHAR(100),
    gateway_payment_id VARCHAR(100),
    gateway_signature VARCHAR(255),
    balance_paid_amount decimal(10,2) default 0.00,
    balance_paid_date datetime,
    balance_paid_status enum('clear','pending'),
    balance_paid_method ENUM('RAZORPAY','PHONEPE','CASH'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES ksn_function_hall_bookings(booking_id)
);
CREATE TABLE ksn_function_hall_cancellation_rules (
    rule_id INT AUTO_INCREMENT PRIMARY KEY,
    days INT NOT NULL,
    penalty_percent DECIMAL(5,2) NOT NULL,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE ksn_function_hall_cancellation_payments (
    cancellation_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    payment_id INT NOT NULL,
    penalty_amount DECIMAL(10,2) NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    penalty_percent DECIMAL(5,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
	final_amount DECIMAL(10,2) NOT NULL,
    cancellation_paid_method ENUM('RAZORPAY','PHONEPE','CASH'),
    cancelled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES ksn_function_hall_bookings(booking_id),
    FOREIGN KEY (payment_id) REFERENCES ksn_function_hall_payments(payment_id)
);
CREATE TABLE ksn_function_hall_electricity_bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,  
    current_previous_reading_image VARCHAR(255),  
    current_after_reading_image VARCHAR(255),     
    current_previous_units DECIMAL(10,2) NOT NULL,
    current_after_current_units DECIMAL(10,2) NOT NULL,
    current_per_unit_cost DECIMAL(10,2) NOT NULL, 
    currnet_total_amount Decimal(10,2) NOT NULL,
    generator_previous_reading_image VARCHAR(255),
    generator_after_reading_image VARCHAR(255),
    generator_previous_units DECIMAL(10,2) NOT NULL,
    generator_after_units DECIMAL(10,2) NOT NULL,
    generator_per_unit_cost DECIMAL(10,2) NOT NULL,
	generator_total_amount Decimal(10,2) Not Null,
    grand_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES ksn_function_hall_bookings(booking_id)
);
CREATE TABLE ksn_function_hall_refunds (
    refund_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    referralpayment_id int,
    total_amount DECIMAL(10,2) NOT NULL,
    refundable_amount DECIMAL(10,2) NOT NULL,
    electricity_bill DECIMAL(10,2) NOT NULL,
    generator_bill DECIMAL(10,2) NOT NULL,
    settlement_type ENUM('REFUND','COLLECT','SETTLED') NOT NULL,
    settlement_amount DECIMAL(10,2) NOT NULL,
    payment_mode ENUM('CASH','UPI'),
    proof_image VARCHAR(255) ,
    final_amount DECIMAL(10,2),
    adjustable_amount DECIMAL(10,2) NOT NULL,
	referral_amount DECIMAL(10,2),
    refunded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	total_bill_amount DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (booking_id)
        REFERENCES ksn_function_hall_bookings(booking_id),
	FOREIGN KEY (referralpayment_id)
        REFERENCES ksn_function_hall_referral_payment(referralpayment_id)
);
CREATE TABLE ksn_function_hall_gallery (
    gallery_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    stage ENUM('PREFUNCTION', 'FUNCTION', 'POSTFUNCTION') NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id)
        REFERENCES ksn_function_hall_bookings(booking_id)
        ON DELETE CASCADE
);
CREATE TABLE ksn_function_hall_bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    bill_category ENUM(
        'SECURITY',
        'CLEANING',
        'ELECTRICITY',
        'PLUMBING',
        'OTHER'
    ) NOT NULL,
    bill_description VARCHAR(255),
    bill_photo VARCHAR(255),    
    bill_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id)
        REFERENCES ksn_function_hall_bookings(booking_id)
);
CREATE TABLE ksn_function_hall_bill_payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM(
        'CASH',
        'UPI'
    ),
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id)
        REFERENCES ksn_function_hall_bills(bill_id)
);
CREATE TABLE ksn_function_hall_maintenance_bills (
    maintenance_bill_id INT AUTO_INCREMENT PRIMARY KEY,
    maintenance_bill_name VARCHAR(255) NOT NULL,
    maintenance_bill_photo VARCHAR(500),
    maintenance_bill_amount DECIMAL(10,2) NOT NULL,
    maintenance_bill_description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE ksn_function_hall_maintenance_payments (
    maintenance_payment_id INT AUTO_INCREMENT PRIMARY KEY,
    maintenance_bill_id INT NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'upi') DEFAULT 'cash',
    payment_status ENUM('paid', 'pending') DEFAULT 'pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (maintenance_bill_id)
        REFERENCES ksn_function_hall_maintenance_bills(maintenance_bill_id)
);


