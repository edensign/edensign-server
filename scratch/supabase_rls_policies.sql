-- =============================================================================
-- EdenSign - Supabase Row Level Security (RLS) Policies
-- Run AFTER supabase_schema.sql in Supabase SQL Editor
-- =============================================================================
-- NOTE: The Express server uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
-- These policies apply to direct browser/client calls using the ANON key.
-- =============================================================================

-- Helper: get the role from user JWT metadata
-- Supabase stores custom claims in auth.users.raw_user_meta_data
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'role'),
        (auth.jwt() ->> 'role')
    );
$$;

-- Helper: get current user id as integer (from JWT sub)
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS integer
LANGUAGE sql
STABLE
AS $$
    SELECT CAST(auth.uid()::text AS integer);
$$;

-- =============================================================================
-- Enable RLS on all tables
-- =============================================================================
ALTER TABLE users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer               ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE address                ENABLE ROW LEVEL SECURITY;
ALTER TABLE images                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenity                ENABLE ROW LEVEL SECURITY;
ALTER TABLE service                ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_employee         ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_service_image    ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_seeker             ENABLE ROW LEVEL SECURITY;
ALTER TABLE product                ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_image          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ad             ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_inventory_product ENABLE ROW LEVEL SECURITY;
ALTER TABLE review                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflow               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item             ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_us             ENABLE ROW LEVEL SECURITY;
ALTER TABLE country                ENABLE ROW LEVEL SECURITY;
ALTER TABLE state                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE city                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy                ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USERS TABLE POLICIES
-- =============================================================================

-- Admin: full access
CREATE POLICY "admin_users_all" ON users
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

-- Sales Executive: can only read their own profile
CREATE POLICY "sales_exec_users_self" ON users
    FOR SELECT
    USING (
        get_user_role() = 'sales_executive'
        AND id = get_current_user_id()
    );

-- =============================================================================
-- SALON TABLE POLICIES
-- =============================================================================

-- Admin: full access
CREATE POLICY "admin_salon_all" ON salon
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

-- Sales Executive: can read salons they created OR were referred by them
CREATE POLICY "sales_exec_salon_select" ON salon
    FOR SELECT
    USING (
        get_user_role() = 'sales_executive'
        AND (
            created_by  = get_current_user_id()
            OR referral_by = get_current_user_id()
        )
    );

-- Sales Executive: can insert new salons (created_by auto-set server-side)
CREATE POLICY "sales_exec_salon_insert" ON salon
    FOR INSERT
    WITH CHECK (get_user_role() = 'sales_executive');

-- Sales Executive: can update only salons they created (NOT referred ones)
CREATE POLICY "sales_exec_salon_update" ON salon
    FOR UPDATE
    USING (
        get_user_role() = 'sales_executive'
        AND created_by = get_current_user_id()
    )
    WITH CHECK (
        get_user_role() = 'sales_executive'
        AND created_by = get_current_user_id()
    );

-- Public: anyone can view active salons (for website/mobile)
CREATE POLICY "public_salon_select" ON salon
    FOR SELECT
    USING (status = 'active');

-- =============================================================================
-- SERVICE TABLE POLICIES (public read, admin write)
-- =============================================================================
CREATE POLICY "admin_service_all" ON service
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "public_service_select" ON service
    FOR SELECT
    USING (status = 'active');

-- =============================================================================
-- PRODUCT TABLE POLICIES
-- =============================================================================
CREATE POLICY "admin_product_all" ON product
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "public_product_select" ON product
    FOR SELECT
    USING (status = 'active');

-- =============================================================================
-- REVIEW TABLE POLICIES
-- =============================================================================
CREATE POLICY "admin_review_all" ON review
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "public_review_select" ON review
    FOR SELECT
    USING (true);

CREATE POLICY "customer_review_insert" ON review
    FOR INSERT
    WITH CHECK (true);

-- =============================================================================
-- BANNER & OFFER (public read, admin write)
-- =============================================================================
CREATE POLICY "admin_banner_all" ON banner
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "public_banner_select" ON banner
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "admin_offer_all" ON offer
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "public_offer_select" ON offer
    FOR SELECT
    USING (is_active = true);

-- =============================================================================
-- CITY, STATE, COUNTRY (public read, admin write)
-- =============================================================================
CREATE POLICY "admin_city_all"    ON city    FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "admin_state_all"   ON state   FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "admin_country_all" ON country FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "public_city_select"    ON city    FOR SELECT USING (true);
CREATE POLICY "public_state_select"   ON state   FOR SELECT USING (true);
CREATE POLICY "public_country_select" ON country FOR SELECT USING (true);

-- =============================================================================
-- ACADEMY (public read for active, admin write)
-- =============================================================================
CREATE POLICY "admin_academy_all" ON academy
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "public_academy_select" ON academy
    FOR SELECT
    USING (status = 'active');

-- =============================================================================
-- CONTACT US (anyone can insert, admin reads)
-- =============================================================================
CREATE POLICY "public_contact_insert" ON contact_us
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "admin_contact_select" ON contact_us
    FOR SELECT
    USING (get_user_role() = 'admin');

-- =============================================================================
-- PRODUCT AD (public read for active, admin write)
-- =============================================================================
CREATE POLICY "admin_product_ad_all" ON product_ad
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "public_product_ad_select" ON product_ad
    FOR SELECT
    USING (status = 'active');

-- =============================================================================
-- ADDRESS (admin full, public read)
-- =============================================================================
CREATE POLICY "admin_address_all" ON address
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "public_address_select" ON address
    FOR SELECT
    USING (true);

-- =============================================================================
-- IMAGES (admin full, public read)
-- =============================================================================
CREATE POLICY "admin_images_all" ON images
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "public_images_select" ON images
    FOR SELECT
    USING (true);

-- =============================================================================
-- AMENITY (admin full, authenticated read)
-- =============================================================================
CREATE POLICY "admin_amenity_all" ON amenity
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "auth_amenity_select" ON amenity
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- =============================================================================
-- CASHFLOW (admin full, sales exec reads own salon's)
-- =============================================================================
CREATE POLICY "admin_cashflow_all" ON cashflow
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

-- =============================================================================
-- APPOINTMENT (admin full, authenticated)
-- =============================================================================
CREATE POLICY "admin_appointment_all" ON appointment
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "auth_appointment_insert" ON appointment
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "customer_appointment_select" ON appointment
    FOR SELECT
    USING (customer_id = get_current_user_id() OR get_user_role() IN ('admin','salon'));

-- =============================================================================
-- CUSTOMER (admin full, self read)
-- =============================================================================
CREATE POLICY "admin_customer_all" ON customer
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "public_customer_insert" ON customer
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "customer_self_select" ON customer
    FOR SELECT
    USING (id = get_current_user_id());

-- =============================================================================
-- ORDER & ORDER ITEM (customer owns, admin full)
-- =============================================================================
CREATE POLICY "admin_order_all" ON "order"
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "customer_order_select" ON "order"
    FOR SELECT
    USING (customer_id = get_current_user_id());

CREATE POLICY "customer_order_insert" ON "order"
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "admin_order_item_all" ON order_item
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

-- =============================================================================
-- REMAINING TABLES (admin full access only)
-- =============================================================================
CREATE POLICY "admin_skill_all"              ON skill                  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "admin_salon_employee_all"     ON salon_employee          FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "admin_salon_svc_img_all"      ON salon_service_image     FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "admin_job_seeker_all"         ON job_seeker              FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "admin_product_image_all"      ON product_image           FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "admin_salon_inventory_all"    ON salon_inventory_product FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

-- Sales exec can view their salon's inventory
CREATE POLICY "sales_exec_inventory_select"  ON salon_inventory_product
    FOR SELECT
    USING (
        get_user_role() = 'sales_executive'
        AND salon_id IN (
            SELECT id FROM salon
            WHERE created_by = get_current_user_id()
               OR referral_by = get_current_user_id()
        )
    );

-- Salon employee - authenticated users can read
CREATE POLICY "public_salon_employee_select" ON salon_employee
    FOR SELECT
    USING (true);

-- Public can read product images
CREATE POLICY "public_product_image_select" ON product_image
    FOR SELECT
    USING (true);

-- Skill - authenticated read
CREATE POLICY "auth_skill_select" ON skill
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
