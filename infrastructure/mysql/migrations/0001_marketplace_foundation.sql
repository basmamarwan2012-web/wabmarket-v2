CREATE TABLE `accounts` (
  `id` varchar(36) NOT NULL,
  `firebase_uid` varchar(128) NOT NULL,
  `email` varchar(320) NULL,
  `display_name` varchar(255) NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `accounts_pk` PRIMARY KEY (`id`),
  CONSTRAINT `accounts_firebase_uid_uq` UNIQUE (`firebase_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint

CREATE TABLE `owned_domains` (
  `id` varchar(36) NOT NULL,
  `account_id` varchar(36) NOT NULL,
  `normalized_hostname` varchar(253) NOT NULL,
  `status` enum('opportunity','active','sold','expired','archived') NOT NULL DEFAULT 'active',
  `ownership_confirmed` boolean NOT NULL DEFAULT false,
  `ownership_confirmed_at` timestamp(3) NULL,
  `ownership_confirmed_by_firebase_uid` varchar(128) NULL,
  `ownership_evidence_reference` varchar(2048) NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `owned_domains_pk` PRIMARY KEY (`id`),
  CONSTRAINT `owned_domains_account_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `owned_domains_account_hostname_uq` UNIQUE (`account_id`, `normalized_hostname`),
  CONSTRAINT `owned_domains_id_account_uq` UNIQUE (`id`, `account_id`),
  CONSTRAINT `owned_domains_ownership_ck` CHECK (
    (`ownership_confirmed` = false AND `ownership_confirmed_at` IS NULL AND `ownership_confirmed_by_firebase_uid` IS NULL)
    OR
    (`ownership_confirmed` = true AND `ownership_confirmed_at` IS NOT NULL AND `ownership_confirmed_by_firebase_uid` IS NOT NULL)
  ),
  INDEX `owned_domains_account_idx` (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint

CREATE TABLE `domain_assets` (
  `id` varchar(36) NOT NULL,
  `account_id` varchar(36) NOT NULL,
  `owned_domain_id` varchar(36) NOT NULL,
  `kind` enum('LOGO','FAVICON','OPEN_GRAPH_IMAGE') NOT NULL,
  `storage_key` varchar(1024) NOT NULL,
  `public_reference` varchar(2048) NULL,
  `mime_type` varchar(255) NOT NULL,
  `byte_size` bigint unsigned NOT NULL,
  `checksum` varchar(128) NOT NULL,
  `status` enum('PENDING','AVAILABLE') NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `domain_assets_pk` PRIMARY KEY (`id`),
  CONSTRAINT `domain_assets_account_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `domain_assets_owned_domain_account_fk` FOREIGN KEY (`owned_domain_id`, `account_id`) REFERENCES `owned_domains` (`id`, `account_id`) ON DELETE CASCADE,
  CONSTRAINT `domain_assets_storage_key_uq` UNIQUE (`storage_key`),
  CONSTRAINT `domain_assets_byte_size_ck` CHECK (`byte_size` >= 0),
  INDEX `domain_assets_account_domain_idx` (`account_id`, `owned_domain_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint

CREATE TABLE `domain_preparations` (
  `id` varchar(36) NOT NULL,
  `owned_domain_id` varchar(36) NOT NULL,
  `hostname` varchar(253) NOT NULL,
  `ownership_confirmed` boolean NOT NULL DEFAULT false,
  `readiness` enum('NOT_READY','READY_FOR_MARKETPLACE','READY_FOR_MARKETING') NOT NULL,
  `asking_price` decimal(18,2) NULL,
  `currency` varchar(3) NULL,
  `external_sales_url` varchar(2048) NULL,
  `cta_configured` boolean NOT NULL DEFAULT false,
  `description` text NULL,
  `landing_page_reference` varchar(2048) NULL,
  `logo_asset_id` varchar(36) NULL,
  `favicon_asset_id` varchar(36) NULL,
  `open_graph_asset_id` varchar(36) NULL,
  `source_opportunity_id` varchar(256) NULL,
  `preparation_snapshot` json NOT NULL,
  `generation_snapshot` json NOT NULL,
  `landing_page_snapshot` json NOT NULL,
  `version` int unsigned NOT NULL DEFAULT 1,
  `created_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `domain_preparations_pk` PRIMARY KEY (`id`),
  CONSTRAINT `domain_preparations_owned_domain_uq` UNIQUE (`owned_domain_id`),
  CONSTRAINT `domain_preparations_owned_domain_fk` FOREIGN KEY (`owned_domain_id`) REFERENCES `owned_domains` (`id`) ON DELETE CASCADE,
  CONSTRAINT `domain_preparations_logo_asset_fk` FOREIGN KEY (`logo_asset_id`) REFERENCES `domain_assets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `domain_preparations_favicon_asset_fk` FOREIGN KEY (`favicon_asset_id`) REFERENCES `domain_assets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `domain_preparations_open_graph_asset_fk` FOREIGN KEY (`open_graph_asset_id`) REFERENCES `domain_assets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `domain_preparations_version_ck` CHECK (`version` >= 1),
  CONSTRAINT `domain_preparations_asking_price_ck` CHECK (`asking_price` IS NULL OR `asking_price` > 0),
  INDEX `domain_preparations_readiness_idx` (`readiness`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint

CREATE TABLE `marketplace_listings` (
  `listing_id` varchar(72) NOT NULL,
  `owned_domain_id` varchar(36) NOT NULL,
  `preparation_id` varchar(36) NOT NULL,
  `normalized_hostname` varchar(253) NOT NULL,
  `published_hostname` varchar(253) NULL,
  `publication_state` enum('DRAFT','PUBLISHED','UNPUBLISHED') NOT NULL DEFAULT 'DRAFT',
  `eligibility_state` enum('NOT_ELIGIBLE','ELIGIBLE_WITH_PLACEHOLDERS','ELIGIBLE') NOT NULL,
  `eligibility_reasons` json NOT NULL,
  `display_name` varchar(253) NOT NULL,
  `asking_price` decimal(18,2) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `description` text NOT NULL,
  `landing_page_reference` varchar(2048) NULL,
  `external_sales_url` varchar(2048) NOT NULL,
  `external_sales_cta_label` varchar(255) NOT NULL,
  `public_snapshot` json NOT NULL,
  `landing_page_snapshot` json NOT NULL,
  `version` int unsigned NOT NULL DEFAULT 1,
  `published_at` timestamp(3) NULL,
  `unpublished_at` timestamp(3) NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `marketplace_listings_pk` PRIMARY KEY (`listing_id`),
  CONSTRAINT `marketplace_listings_owned_domain_uq` UNIQUE (`owned_domain_id`),
  CONSTRAINT `marketplace_listings_published_hostname_uq` UNIQUE (`published_hostname`),
  CONSTRAINT `marketplace_listings_owned_domain_fk` FOREIGN KEY (`owned_domain_id`) REFERENCES `owned_domains` (`id`) ON DELETE CASCADE,
  CONSTRAINT `marketplace_listings_preparation_fk` FOREIGN KEY (`preparation_id`) REFERENCES `domain_preparations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `marketplace_listings_version_ck` CHECK (`version` >= 1),
  CONSTRAINT `marketplace_listings_price_ck` CHECK (`asking_price` > 0),
  CONSTRAINT `marketplace_listings_publication_ck` CHECK (
    (`publication_state` = 'PUBLISHED' AND `eligibility_state` = 'ELIGIBLE' AND `published_hostname` = `normalized_hostname` AND `landing_page_reference` IS NOT NULL AND `published_at` IS NOT NULL AND `unpublished_at` IS NULL)
    OR
    (`publication_state` <> 'PUBLISHED' AND `published_hostname` IS NULL)
  ),
  INDEX `marketplace_listings_state_hostname_idx` (`publication_state`, `normalized_hostname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
