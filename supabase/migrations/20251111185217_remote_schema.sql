


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kitchen_members" (
    "kitchen_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" character varying(20) NOT NULL,
    CONSTRAINT "kitchen_members_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['owner'::character varying, 'viewer'::character varying])::"text"[])))
);


ALTER TABLE "public"."kitchen_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kitchens" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "type" character varying(20) NOT NULL,
    "owner_user_id" "uuid" NOT NULL,
    "color" character varying(7) DEFAULT '#f9f9f9'::character varying,
    "invite_token" character varying(255),
    "invite_expires_at" timestamp with time zone,
    "invite_role" character varying(20),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "kitchens_invite_role_check" CHECK ((("invite_role")::"text" = ANY ((ARRAY['owner'::character varying, 'viewer'::character varying])::"text"[]))),
    CONSTRAINT "kitchens_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['personal'::character varying, 'shared'::character varying])::"text"[])))
);


ALTER TABLE "public"."kitchens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" character varying(50) NOT NULL,
    "title" character varying(255) NOT NULL,
    "body" "text",
    "kitchen_id" "uuid",
    "recipe_id" "uuid",
    "action_url" "text",
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notifications_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['recipe_change_request'::character varying, 'info'::character varying, 'system'::character varying])::"text"[])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recipe_categories" (
    "recipe_id" "uuid" NOT NULL,
    "category_id" "uuid" NOT NULL
);


ALTER TABLE "public"."recipe_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recipe_ingredients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "recipe_id" "uuid" NOT NULL,
    "ingredient" character varying(255) NOT NULL,
    "quantity" numeric(10,2),
    "unit" character varying(50)
);


ALTER TABLE "public"."recipe_ingredients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recipes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "kitchen_id" "uuid" NOT NULL,
    "author_user_id" "uuid" NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."recipes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "username" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "password_hash" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kitchen_members"
    ADD CONSTRAINT "kitchen_members_pkey" PRIMARY KEY ("kitchen_id", "user_id");



ALTER TABLE ONLY "public"."kitchens"
    ADD CONSTRAINT "kitchens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipe_categories"
    ADD CONSTRAINT "recipe_categories_pkey" PRIMARY KEY ("recipe_id", "category_id");



ALTER TABLE ONLY "public"."recipe_ingredients"
    ADD CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE INDEX "idx_kitchen_members_user" ON "public"."kitchen_members" USING "btree" ("user_id");



CREATE INDEX "idx_kitchens_owner" ON "public"."kitchens" USING "btree" ("owner_user_id");



CREATE INDEX "idx_notifications_read" ON "public"."notifications" USING "btree" ("is_read");



CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_recipe_categories_category" ON "public"."recipe_categories" USING "btree" ("category_id");



CREATE INDEX "idx_recipe_ingredients_recipe" ON "public"."recipe_ingredients" USING "btree" ("recipe_id");



CREATE INDEX "idx_recipes_author" ON "public"."recipes" USING "btree" ("author_user_id");



CREATE INDEX "idx_recipes_kitchen" ON "public"."recipes" USING "btree" ("kitchen_id");



ALTER TABLE ONLY "public"."kitchen_members"
    ADD CONSTRAINT "kitchen_members_kitchen_id_fkey" FOREIGN KEY ("kitchen_id") REFERENCES "public"."kitchens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kitchen_members"
    ADD CONSTRAINT "kitchen_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kitchens"
    ADD CONSTRAINT "kitchens_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_kitchen_id_fkey" FOREIGN KEY ("kitchen_id") REFERENCES "public"."kitchens"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipe_categories"
    ADD CONSTRAINT "recipe_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipe_categories"
    ADD CONSTRAINT "recipe_categories_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipe_ingredients"
    ADD CONSTRAINT "recipe_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_kitchen_id_fkey" FOREIGN KEY ("kitchen_id") REFERENCES "public"."kitchens"("id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."kitchen_members" TO "anon";
GRANT ALL ON TABLE "public"."kitchen_members" TO "authenticated";
GRANT ALL ON TABLE "public"."kitchen_members" TO "service_role";



GRANT ALL ON TABLE "public"."kitchens" TO "anon";
GRANT ALL ON TABLE "public"."kitchens" TO "authenticated";
GRANT ALL ON TABLE "public"."kitchens" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."recipe_categories" TO "anon";
GRANT ALL ON TABLE "public"."recipe_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."recipe_categories" TO "service_role";



GRANT ALL ON TABLE "public"."recipe_ingredients" TO "anon";
GRANT ALL ON TABLE "public"."recipe_ingredients" TO "authenticated";
GRANT ALL ON TABLE "public"."recipe_ingredients" TO "service_role";



GRANT ALL ON TABLE "public"."recipes" TO "anon";
GRANT ALL ON TABLE "public"."recipes" TO "authenticated";
GRANT ALL ON TABLE "public"."recipes" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































