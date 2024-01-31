

CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" BIGSERIAL NOT NULL,
    "name" character varying(255) NOT NULL,
    "salary" numeric(10,2) NOT NULL DEFAULT '0.00',
    "position" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "password" character varying(255) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" boolean NOT NULL DEFAULT false,
    CONSTRAINT "PK_3c2bc72f03fd6b28f1be670b4b6" PRIMARY KEY ("id")
);

INSERT INTO "public"."employees" ("id", "name", "salary", "position", "email", "password", "created_at", "updated_at", "is_deleted") VALUES
(1, 'admin', '1000.00', 'admin', 'admin@admin.com', '$2a$05$2Gh2ruDg.1.dAr0c7AohRuP1KBa.pFJlBc21HD666SAfcSGCrDypO', '2021-01-01 00:00:00', '2021-01-01 00:00:00', false);