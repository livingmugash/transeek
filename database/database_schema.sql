-- This schema is for reference. Django's `migrate` command will create these tables.

CREATE TABLE `translator_app_customuser` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `trial_count` int NOT NULL,
  `is_premium` tinyint(1) NOT NULL,
  `subscription_end_date` date DEFAULT NULL,
  `paystack_customer_code` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
);

CREATE TABLE `translator_app_subscription` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan` varchar(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paystack_reference` varchar(100) NOT NULL,
  `start_date` datetime(6) NOT NULL,
  `end_date` datetime(6) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `translator_app_subscription_user_id_fk_translator_app_customuser_id` (`user_id`),
  CONSTRAINT `translator_app_subscription_user_id_fk_translator_app_customuser_id` FOREIGN KEY (`user_id`) REFERENCES `translator_app_customuser` (`id`)
);
