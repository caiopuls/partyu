-- Preenche imagens de exemplo para eventos que ainda não possuem banner
-- Usa imagens livres do Unsplash apenas como placeholders de desenvolvimento
UPDATE events
SET 
  banner_url = COALESCE(banner_url, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600'),
  featured_image_url = COALESCE(featured_image_url, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600'),
  image_urls = CASE 
    WHEN (image_urls IS NULL OR image_urls = '[]'::jsonb)
    THEN jsonb_build_array(
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600',
      'https://images.unsplash.com/photo-1511578314322-379bfdc9f71e?w=1600',
      'https://images.unsplash.com/photo-1464375117522-1311d6c0b716?w=1600'
    )
    ELSE image_urls
  END
WHERE status = 'active';


