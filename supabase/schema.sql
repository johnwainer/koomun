-- ==========================================
-- KOOMUN PLATFORM: SUPABASE SCHEMA & SEED
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. TABLES CREATION (WiPE OLD ONES)
-- ==========================================

DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.direct_messages CASCADE;
DROP TABLE IF EXISTS public.feed_comments CASCADE;
DROP TABLE IF EXISTS public.feed_posts CASCADE;
DROP TABLE IF EXISTS public.content_items CASCADE;
DROP TABLE IF EXISTS public.content_modules CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.communities CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Delete all existing authentication users cleanly
DELETE FROM auth.users;

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'creator', 'admin', 'super_admin')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'elite')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last4 TEXT NOT NULL,
  brand TEXT NOT NULL,
  exp_month INTEGER NOT NULL,
  exp_year INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT 'category',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_tier TEXT DEFAULT 'Gratis',
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, community_id)
);

CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('Virtual (Zoom)', 'Presencial')),
  event_date TEXT NOT NULL,
  event_time TEXT NOT NULL,
  location_or_link TEXT,
  visibility TEXT DEFAULT 'Público',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.content_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  cover_image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.content_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.content_modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('VIDEO', 'NATIVE', 'PDF')),
  platform TEXT CHECK (platform IN ('youtube', 'vimeo', 'koomun') OR platform IS NULL),
  media_url TEXT,
  duration_string TEXT,
  is_secure BOOLEAN DEFAULT FALSE,
  access_level TEXT DEFAULT 'Muestra Gratis' CHECK (access_level IN ('Muestra Gratis', 'Premium', 'Pago Especial')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.feed_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.feed_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.direct_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('like', 'comment', 'mention', 'system')),
  action_text TEXT NOT NULL,
  target_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. AUTOMATION & TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON public.communities FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_feed_posts_updated_at BEFORE UPDATE ON public.feed_posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view profiles, only owners can update their own
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Payment Methods: Only owners can view/update/delete
CREATE POLICY "Users can view own payment methods." ON public.payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payment methods." ON public.payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payment methods." ON public.payment_methods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own payment methods." ON public.payment_methods FOR DELETE USING (auth.uid() = user_id);

-- Categories: Anyone can view, Super Admin can mutate (Managed in API bypassing RLS anyway, but good for reads)
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);

-- Communities: Anyone can view published, only creators can update
CREATE POLICY "Communities are viewable by everyone." ON public.communities FOR SELECT USING (is_published = true OR auth.uid() = creator_id);
CREATE POLICY "Creators can insert communities." ON public.communities FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update their communities." ON public.communities FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete their communities." ON public.communities FOR DELETE USING (auth.uid() = creator_id);

-- Members: Viewable by everyone, Users can join/leave
CREATE POLICY "Members are viewable by everyone." ON public.members FOR SELECT USING (true);
CREATE POLICY "Users can join communities." ON public.members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave communities." ON public.members FOR DELETE USING (auth.uid() = user_id);

-- Feed Posts: Anyone can view, Authors can insert/update/delete
CREATE POLICY "Feed posts are viewable by everyone." ON public.feed_posts FOR SELECT USING (true);
CREATE POLICY "Authors can create posts." ON public.feed_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts." ON public.feed_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own posts." ON public.feed_posts FOR DELETE USING (auth.uid() = author_id);

-- Content Modules: Anyone can view, Creators can manage
CREATE POLICY "Content modules are viewable by everyone." ON public.content_modules FOR SELECT USING (true);
CREATE POLICY "Creators can manage content modules." ON public.content_modules FOR ALL USING (
   EXISTS (SELECT 1 FROM public.communities WHERE id = content_modules.community_id AND creator_id = auth.uid())
) WITH CHECK (
   EXISTS (SELECT 1 FROM public.communities WHERE id = content_modules.community_id AND creator_id = auth.uid())
);

-- Content Items: Anyone can view, Creators can manage
CREATE POLICY "Content items are viewable by everyone." ON public.content_items FOR SELECT USING (true);
CREATE POLICY "Creators can manage content items." ON public.content_items FOR ALL USING (
   EXISTS (
     SELECT 1 FROM public.content_modules cm
     JOIN public.communities c ON c.id = cm.community_id
     WHERE cm.id = content_items.module_id AND c.creator_id = auth.uid()
   )
) WITH CHECK (
   EXISTS (
     SELECT 1 FROM public.content_modules cm
     JOIN public.communities c ON c.id = cm.community_id
     WHERE cm.id = content_items.module_id AND c.creator_id = auth.uid()
   )
);

-- ==========================================
-- 4. MASSIVE DEMO DATA GENERATION (PL/pgSQL)
-- ==========================================

DO $$
DECLARE
  -- Dictionary arrays
  first_names TEXT[] := ARRAY['Esteban', 'Valeria', 'Carlos', 'Sofia', 'Andrea', 'Juan', 'Miguel', 'Laura', 'Diego', 'Ana', 'Luis', 'Pedro', 'Maria', 'Jorge', 'Lucia', 'Daniela', 'Camila', 'Andres', 'Felipe', 'Santiago', 'Valentina', 'Isabella', 'Mateo', 'Leonardo'];
  last_names TEXT[] := ARRAY['G.', 'L.', 'M.', 'R.', 'P.', 'S.', 'T.', 'F.', 'C.', 'D.'];
  subjects TEXT[] := ARRAY['SaaS', 'UI/UX', 'Marketing', 'Ventas B2B', 'Copywriting', 'Desarrollo Web', 'Inteligencia Artificial', 'Cripto', 'Productividad', 'Finanzas', 'Fitness', 'Fotografía', 'SEO', 'Ads', 'Bienes Raíces'];
  adjectives TEXT[] := ARRAY['Elite', 'Hackers', 'Pro', 'Masters', 'Builders', 'Academy', 'Club', 'VIP', 'Network', 'Lab', 'Camp', 'Hub'];
  gifs TEXT[] := ARRAY[
    'https://media.giphy.com/media/l41lFw057lAJQMwg0/giphy.gif',
    'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif',
    'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    'https://media.giphy.com/media/3oKIPEqDGUULpEU0aQ/giphy.gif',
    'https://media.giphy.com/media/QvBoMEcQ7DQXK/giphy.gif',
    'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
    'https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif',
    'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif'
  ];
  brands TEXT[] := ARRAY['Visa', 'Mastercard', 'Amex'];
  
  -- State variables
  creators UUID[] := ARRAY[]::UUID[];
  users UUID[] := ARRAY[]::UUID[];
  all_uids UUID[] := ARRAY[]::UUID[];
  comms UUID[] := ARRAY[]::UUID[];
  cats UUID[] := ARRAY[]::UUID[];
  
  new_uid UUID;
  new_comm_id UUID;
  new_cat_id UUID;
  new_mod_id UUID;
  new_post_id UUID;
  
  rand_first TEXT;
  rand_last TEXT;
  rand_name TEXT;
  rand_email TEXT;
  rand_role TEXT;
  rand_plan TEXT;
  
  i INT;
  j INT;
BEGIN
  -- Las cuentas (incluso johnwainer) deben crearse limpiamente usando la UI (/register)
  -- para que Supabase GoTrue Engine genere internamente la tabla auth.identities sin crasheos.
  
  -- Solo dejaremos aquí el loop simulado de la comunidad.

  -- 1. GENERATE 24 USERS (20 Creators, 4 Regular Users)
  FOR i IN 1..24 LOOP
    new_uid := uuid_generate_v4();
    rand_first := first_names[1 + floor(random() * array_length(first_names, 1))];
    rand_last := last_names[1 + floor(random() * array_length(last_names, 1))];
    rand_name := rand_first || ' ' || rand_last;
    rand_email := 'user' || i || '_' || floor(random() * 1000)::text || '@koomun.demo';
    
    -- Determine role/plan
    IF i <= 10 THEN
      rand_role := 'creator'; rand_plan := 'free';
    ELSIF i <= 20 THEN
      rand_role := 'creator'; rand_plan := 'elite';
    ELSE
      rand_role := 'user'; rand_plan := 'free';
    END IF;

    -- Insert into Auth
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
    VALUES (new_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', rand_email, crypt('koomun123', gen_salt('bf')), NOW(), 
    json_build_object('full_name', rand_name, 'username', 'usr_' || i || '_' || floor(random()*1000)), NOW(), NOW());

    -- Build lists
    IF rand_role = 'creator' THEN creators := array_append(creators, new_uid);
    ELSE users := array_append(users, new_uid); END IF;
    all_uids := array_append(all_uids, new_uid);

    -- Force update roles and append avatar (Trigger creates them as free user initially)
    UPDATE public.profiles SET 
      role = rand_role, 
      plan = rand_plan, 
      avatar_url = 'https://i.pravatar.cc/150?u=' || new_uid, 
      bio = 'Bio of ' || rand_name 
    WHERE id = new_uid;

    -- Generate exactly 2 payment methods per user
    INSERT INTO public.payment_methods (user_id, last4, brand, exp_month, exp_year, is_default)
    VALUES 
    (new_uid, lpad(floor(random()*9999)::text, 4, '0'), brands[1 + floor(random() * 3)], floor(random()*12)+1, 2026 + floor(random()*5), true),
    (new_uid, lpad(floor(random()*9999)::text, 4, '0'), brands[1 + floor(random() * 3)], floor(random()*12)+1, 2026 + floor(random()*5), false);
  END LOOP;

  -- 1.5. GENERATE CATEGORIES FROM SUBJECTS ARRAY
  FOR i IN 1..array_length(subjects, 1) LOOP
    new_cat_id := uuid_generate_v4();
    cats := array_append(cats, new_cat_id);
    INSERT INTO public.categories (id, name, slug) 
    VALUES (new_cat_id, subjects[i], lower(replace(subjects[i], ' ', '-')));
  END LOOP;

  -- 2. GENERATE 100 COMMUNITIES (Distribute across the 20 creators)
  FOR i IN 1..100 LOOP
    new_comm_id := uuid_generate_v4();
    comms := array_append(comms, new_comm_id);
    
    INSERT INTO public.communities (id, creator_id, title, description, category_id, price_tier, cover_image_url, is_published)
    VALUES (
      new_comm_id, 
      creators[1 + floor(random() * array_length(creators, 1))],
      subjects[1 + floor(random() * array_length(subjects, 1))] || ' ' || adjectives[1 + floor(random() * array_length(adjectives, 1))],
      'Una comunidad exclusiva para llevar tus habilidades al siguiente nivel con mentores Elite.',
      cats[1 + floor(random() * array_length(cats, 1))],
      '$' || (floor(random()*9) + 1) || '0/mo',
      gifs[1 + floor(random() * array_length(gifs, 1))],
      true
    );

    -- Creator automatically gets admin role
    INSERT INTO public.members (user_id, community_id, role) 
    SELECT creator_id, id, 'admin' FROM public.communities WHERE id = new_comm_id;

    -- Inject 1 Event per community
    INSERT INTO public.events (community_id, creator_id, title, description, type, event_date, event_time, location_or_link, visibility)
    SELECT id, creator_id, 'Masterclass Env Vivo', 'Únete a la charla mensual.', 'Virtual (Zoom)', '15 Octubre 2026', '19:00 (GMT-5)', 'https://zoom.us/demo', 'Exclusivo Miembros'
    FROM public.communities WHERE id = new_comm_id;

    -- Inject Content Modules & Items
    new_mod_id := uuid_generate_v4();
    INSERT INTO public.content_modules (id, community_id, title, order_index) VALUES (new_mod_id, new_comm_id, 'Módulo 1: Fundamentos', 1);
    
    INSERT INTO public.content_items (module_id, title, type, platform, media_url, duration_string, is_secure, access_level, order_index) VALUES 
    (new_mod_id, 'Bienvenida', 'VIDEO', 'youtube', 'https://youtube.com/watch', '10:00', false, 'Muestra Gratis', 1),
    (new_mod_id, 'Material de Apoyo', 'PDF', null, 'https://example.com/doc.pdf', 'Pdf', true, 'Premium', 2);

    -- Inject 1 Feed Post per Community
    new_post_id := uuid_generate_v4();
    INSERT INTO public.feed_posts (id, community_id, author_id, content, likes_count)
    SELECT new_post_id, new_comm_id, creator_id, '¡Bienvenidos a todos a la nueva era de nuestra academia! Dejen sus dudas aquí.', 15
    FROM public.communities WHERE id = new_comm_id;

    -- Random Comment on the post by some random user
    INSERT INTO public.feed_comments (post_id, author_id, content) VALUES (new_post_id, users[1 + floor(random() * array_length(users, 1))], '¡Excelente! Muy emocionado de empezar.');
  END LOOP;

  -- 3. MASSIVE MEMBERSHIP JOIN (Regular users joining communities)
  -- 4 users join ~15 random communities each
  FOR i IN 1..array_length(users, 1) LOOP
    FOR j IN 1..15 LOOP
      BEGIN
        INSERT INTO public.members (user_id, community_id, role)
        VALUES (users[i], comms[1 + floor(random() * array_length(comms, 1))], 'member');
      EXCEPTION WHEN unique_violation THEN
        -- Safely ignore if user already joined this random community
      END;
    END LOOP;
  END LOOP;

  -- 4. GENERATE 50 CHAT MESSAGES
  FOR i IN 1..50 LOOP
    INSERT INTO public.direct_messages (sender_id, receiver_id, content, is_read)
    VALUES (
      all_uids[1 + floor(random() * array_length(all_uids, 1))],
      all_uids[1 + floor(random() * array_length(all_uids, 1))],
      'Este es un mensaje de prueba ' || i || ' generado por el seed script.',
      (random() > 0.5)
    );
  END LOOP;

  -- 5. GENERATE 30 NOTIFICATIONS
  FOR i IN 1..30 LOOP
    INSERT INTO public.notifications (user_id, actor_id, type, action_text, target_text, is_read)
    VALUES (
      all_uids[1 + floor(random() * array_length(all_uids, 1))],
      all_uids[1 + floor(random() * array_length(all_uids, 1))],
      CASE floor(random()*4) WHEN 0 THEN 'like' WHEN 1 THEN 'comment' WHEN 2 THEN 'mention' ELSE 'system' END,
      'ha interactuado contigo',
      'Tu post reciente en la comunidad.',
      (random() > 0.5)
    );
  END LOOP;

END $$;

CREATE TABLE public.lesson_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id, user_id)
);

ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own lesson notes" 
ON public.lesson_notes 
FOR ALL USING (auth.uid() = user_id);

