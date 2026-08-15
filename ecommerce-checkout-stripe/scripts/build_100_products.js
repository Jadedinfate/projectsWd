const fs = require('fs');
const path = require('path');

async function build100Products() {
  console.log('🔄 Fetching 100 products from DripDrop Attire Shopify API...');
  const res = await fetch('https://dripdropattire.com/products.json?limit=100');
  const data = await res.json();
  
  const rawProducts = data.products || [];
  console.log(`📦 Received ${rawProducts.length} raw products.`);

  const formattedProducts = rawProducts.map((p) => {
    const image_url = p.images && p.images.length > 0 ? p.images[0].src : '';
    const origPrice = parseFloat(p.variants && p.variants[0] ? p.variants[0].price : '2500');
    
    let usdDollars = Math.round((origPrice / 100) * 1.1);
    if (usdDollars < 12) usdDollars = 12.99;
    if (usdDollars > 180) usdDollars = 179.99;
    const price_cents = Math.round(usdDollars * 100);

    let cleanDesc = (p.body_html || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanDesc || cleanDesc.length < 10) {
      cleanDesc = `Rare vintage ${p.title}. 100% Genuine streetwear thrift piece. Condition 9/10. Ships in 24hrs.`;
    } else if (cleanDesc.length > 180) {
      cleanDesc = cleanDesc.substring(0, 177) + '...';
    }

    return {
      name: p.title.trim(),
      description: cleanDesc,
      price_cents: price_cents,
      stock_qty: Math.floor(Math.random() * 5) + 1,
      image_url: image_url
    };
  }).filter(p => p.image_url);

  console.log(`✅ Formatted ${formattedProducts.length} products with valid images.`);

  const seedFileContent = `require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/db/connection');
const { randomUUID: uuidv4 } = require('crypto');

const products = ${JSON.stringify(formattedProducts, null, 2)}.map(p => ({
  id: uuidv4(),
  ...p
}));

async function runSeed() {
  await db.seedProducts(products);
  console.log('✨ Seed process complete!');
  process.exit(0);
}

runSeed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
`;

  const seedPath = path.join(__dirname, 'seed.js');
  fs.writeFileSync(seedPath, seedFileContent, 'utf-8');
  console.log(`💾 Successfully updated ${seedPath} with 100 products!`);
}

build100Products().catch(console.error);
