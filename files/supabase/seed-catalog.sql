-- Demo catalogue: 10 products per category (40 total including the 4 schema.sql rows).
-- Sample prices are placeholders; replace them with actual prices before selling.

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80'
WHERE name = 'Handloom Cotton Shirt' AND category = 'Shirts' AND COALESCE(image_url, '') = '';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=700&q=80'
WHERE name = 'Block-Print Kurta' AND category = 'Kurtas' AND COALESCE(image_url, '') = '';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80'
WHERE name = 'Straight Fit Denim' AND category = 'Denim' AND COALESCE(image_url, '') = '';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80'
WHERE name = 'Everyday Crew Tee' AND category = 'T-shirts' AND COALESCE(image_url, '') = '';

WITH seed(name, category, price, description, image_url) AS (
  VALUES
    ('Linen Band-Collar Shirt','Shirts',1799,'Airy linen-cotton shirt with a relaxed band collar.','https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=700&q=80'),
    ('Everyday Oxford Shirt','Shirts',1599,'Soft cotton Oxford shirt for easy everyday dressing.','https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=80'),
    ('Relaxed Chambray Shirt','Shirts',1699,'Lightweight chambray with a comfortable relaxed fit.','https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=700&q=80'),
    ('Textured Cotton Shirt','Shirts',1399,'Textured breathable cotton for warm-weather days.','https://images.unsplash.com/photo-1618354691229-88d47f285158?auto=format&fit=crop&w=700&q=80'),
    ('Striped Summer Shirt','Shirts',1499,'A crisp stripe and easy fit for sunny afternoons.','https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80'),
    ('Indigo Handloom Shirt','Shirts',1899,'Characterful indigo cotton with a handloom feel.','https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=700&q=80'),
    ('Soft Poplin Shirt','Shirts',1299,'Smooth lightweight poplin with a clean finish.','https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=700&q=80'),
    ('Natural Linen Shirt','Shirts',2199,'A breathable linen blend that softens with wear.','https://images.unsplash.com/photo-1618354691438-25bc04584c23?auto=format&fit=crop&w=700&q=80'),
    ('Weekend Resort Shirt','Shirts',1799,'An easy-going statement shirt for weekends away.','https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=700&q=80'),

    ('Chikankari Kurta','Kurtas',2499,'Delicate chikankari-inspired detail on soft cotton.','https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=700&q=80'),
    ('Handloom Everyday Kurta','Kurtas',1799,'A breathable handloom kurta made for everyday wear.','https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=700&q=80'),
    ('Indigo Dabu Kurta','Kurtas',2299,'Deep indigo tones with an artisan-inspired print.','https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=700&q=80'),
    ('Cotton Straight Kurta','Kurtas',1599,'A versatile straight-cut kurta in soft cotton.','https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=700&q=80'),
    ('Ajrakh Print Kurta','Kurtas',2599,'A bold traditional print reimagined for today.','https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=700&q=80'),
    ('Festive Chanderi Kurta','Kurtas',2999,'A light festive layer with an elegant, easy drape.','https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=700&q=80'),
    ('Pastel Lucknowi Kurta','Kurtas',2799,'Soft pastel cotton with fine embroidered detailing.','https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=700&q=80'),
    ('Striped Linen Kurta','Kurtas',1899,'Cool linen-blend stripes in a relaxed silhouette.','https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=700&q=80'),
    ('Artisan Print Kurta','Kurtas',2199,'An expressive print on breathable everyday cotton.','https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=700&q=80'),

    ('Relaxed Indigo Jeans','Denim',2399,'Relaxed indigo jeans that soften with every wash.','https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80'),
    ('Classic Slim Denim','Denim',2299,'A clean slim fit with comfortable everyday stretch.','https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=80'),
    ('Wide-Leg Blue Jeans','Denim',2499,'Easy wide-leg denim with a high-rise waist.','https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=700&q=80'),
    ('Everyday Black Denim','Denim',2199,'A versatile black wash for day-to-night dressing.','https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80'),
    ('Vintage Wash Denim','Denim',2599,'A lived-in wash with a comfortable vintage feel.','https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=700&q=80'),
    ('Tapered Fit Jeans','Denim',2299,'A neat tapered shape with room to move.','https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=700&q=80'),
    ('Raw Indigo Jeans','Denim',2799,'Rich raw-indigo denim with a timeless straight fit.','https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=700&q=80'),
    ('Easy Straight Jeans','Denim',2399,'An easy straight-leg cut for everyday rotation.','https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=700&q=80'),
    ('Light Wash Denim','Denim',2299,'A relaxed light wash made for casual days.','https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=700&q=80'),

    ('Pocket Tee','T-shirts',799,'A soft everyday tee with a clean chest pocket.','https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80'),
    ('Heavyweight Cotton Tee','T-shirts',999,'A substantial cotton tee with a premium hand-feel.','https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=700&q=80'),
    ('Essential White Tee','T-shirts',699,'The dependable soft cotton tee you reach for daily.','https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=700&q=80'),
    ('Relaxed Fit Tee','T-shirts',799,'An easy relaxed fit for laid-back everyday wear.','https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=700&q=80'),
    ('Organic Cotton Tee','T-shirts',899,'A breathable cotton tee with an easy, soft finish.','https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=700&q=80'),
    ('Ribbed Crew Tee','T-shirts',849,'A softly textured crew neck with a modern fit.','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80'),
    ('Classic Stripe Tee','T-shirts',899,'A timeless stripe in an easy cotton jersey.','https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&q=80'),
    ('Graphic Everyday Tee','T-shirts',999,'A playful graphic on a comfortable cotton base.','https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=700&q=80'),
    ('Linen Blend Tee','T-shirts',1099,'A light linen-cotton blend for warm-weather comfort.','https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=700&q=80')
)
INSERT INTO products (name, category, price, description, image_url)
SELECT s.name, s.category, s.price, s.description, s.image_url
FROM seed s
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE p.name = s.name AND p.category = s.category
);
