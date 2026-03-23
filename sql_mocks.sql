-- Inserción de Eventos de Prueba
INSERT INTO public.events (title, description, type, event_date, event_time, location_or_link, visibility, community_id, creator_id)
SELECT 
  'Masterclass En Vivo #' || generate_series(1, 5),
  'Una clase increíble y práctica con los últimos descubrimientos.',
  'Virtual (Zoom)',
  '2026-04-15',
  '20:00',
  'https://zoom.us/j/123456789',
  'Público',
  c.id,
  c.creator_id
FROM public.communities c
LIMIT 5;

-- Inserción de Feed Posts de Prueba
INSERT INTO public.feed_posts (community_id, author_id, content, likes)
SELECT 
  c.id,
  c.creator_id,
  '¡Hola a todos! Bienvenidos a nuestra comunidad. 🚀',
  15
FROM public.communities c
LIMIT 5;
