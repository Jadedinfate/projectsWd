require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/db/connection');
const { v4: uuidv4 } = require('uuid');

const products = [
  {
    "name": "Vintage 90s Cotton Field Pure Leather A-2 Flight Bomber Jacket Military Patch Sherpa Collar, Distressed (XL)",
    "description": "RARE VINTAGE JACKET Fit Size Size: XL (L:27 |C :54) In Inches 100% Genuine Leather | RARE Product Condition: 07/10 —Distressed vintage patina Premium Thrifted Piece, Distressed ...",
    "price_cents": 12100,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/AB78C6C9-0262-4E35-AEE5-43B3D515A08B.jpg?v=1786794544"
  },
  {
    "name": "Burberry London Zip-Up Hoodie – Black (M)",
    "description": "RARE VINTAGE Fit Size : M (L:25 |C :44) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 4800,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/1E4E277C-5ED5-411F-8308-0F85CDC16010.jpg?v=1786794543"
  },
  {
    "name": "Champion Reverse Weave Navy Pullover Hoodie (S)",
    "description": "RARE VINTAGE Fit Size : S (L:24 |C :44) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1700,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/C9BC21FD-EB87-45D7-89D9-2D11BBE41540.jpg?v=1786794475"
  },
  {
    "name": "The North Face Summit Series Insulated Jacket (2XL)",
    "description": "RARE VINTAGE Fit Size Size:2Xl (L:29|C :52) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3300,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/D00BCE87-476F-4D04-85EC-C875FE88579C.jpg?v=1786794479"
  },
  {
    "name": "Pure Leather Jacket Tan Shearling (Detechable Collar)  (M/L)",
    "description": "RARE VINTAGE JACKET Fit Size Size: M/L (L:26 |C :46) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 ...",
    "price_cents": 8500,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/72B1E5F5-C008-414A-AC13-59E96B6A0751.jpg?v=1786794421"
  },
  {
    "name": "The North Face Gore-Tex Hooded Rain Jacket (L)",
    "description": "RARE VINTAGE Fit Size Size: L (L:30|C :46) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3600,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/81924F4C-4ED0-41F7-8DC3-3BD5B257B6BC.jpg?v=1786794382"
  },
  {
    "name": "Camp David Blue “CD25/01” Sailing Team San (2XL)",
    "description": "RARE VINTAGE Fit Size Size:2XL (L:30|C :52) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 2700,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/71A53914-8A8C-4519-ADE5-5F1341E7DD48.jpg?v=1786794298"
  },
  {
    "name": "Polo by Ralph Lauren Beige Crewneck Sweatshirt (L)",
    "description": "RARE VINTAGE Fit Size : L (L:27 |C :50) In Inches 100% Genuine | RARE Product Condition: 9/10 (Have Marks)— Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 4600,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/37142373-3C47-41F3-A5C0-EC9027186A90.jpg?v=1786794297"
  },
  {
    "name": "Underair Sukajan Souvenir Jacket(M)",
    "description": "RARE VINTAGE Fit Size Size:M (L:26|C :46) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3400,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/D894D879-453C-4DA6-9A11-A1E3394D9C2D.jpg?v=1786794172"
  },
  {
    "name": "Polo by Ralph Lauren Classic Polo (2XL)",
    "description": "RARE VINTAGE Fit Size Size: 2XL (L:28|C :49) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1500,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/21A2A0CD-3A8F-481C-85B6-5418368D8B9B.jpg?v=1786794029"
  },
  {
    "name": "Vintage Alpinestars T-Jaws WP Armoured Motorcycle Racing Jacket Padded (S/M)",
    "description": "RARE VINTAGE Fit Size : S/M (L:25 |C :43) In Inches 100% Genuine | RARE Product Condition: 10/10 (Padded)— Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days Vintag...",
    "price_cents": 16900,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/DEBDBD91-D5D6-4778-9C1E-0638E84B5FAD.jpg?v=1786794061"
  },
  {
    "name": "The North Face Gore-Tex Summit Series Pink & Black Hooded Jacket – Women’s (M)",
    "description": "RARE VINTAGE Fit Size : M (L:26 |C :45) In Inches 100% Genuine | RARE Product Condition: 8/10 (Have Marks) — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 2700,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/2BDA07D0-0261-4B99-B851-13472DD62984.jpg?v=1786793764"
  },
  {
    "name": "MLB Chicago Cubs Embroidered Bear Logo Blue Hoodie (S)",
    "description": "RARE VINTAGE Fit Size : S (L:24 |C :45) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1800,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/30FB94D4-C408-4A95-94CC-ABAAF346CB81.jpg?v=1786793598"
  },
  {
    "name": "BMW Motorrad SMR World Superbike Team Polo Shirt (L)",
    "description": "RARE VINTAGE Fit Size Size: L (L:30|C :42) In Inches 100% Genuine | RARE Product Condition:8/10 Faded Have marks— Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1500,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/17AB1C13-256C-4AD8-AD35-4259EC7619C2.jpg?v=1786793447"
  },
  {
    "name": "Team Racing Premium Original Leather Racing Jacket (L/XL)",
    "description": "RARE VINTAGE JACKET Fit Size Size: L/XL (L:28 |C :46) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Patches applied in house to hide de...",
    "price_cents": 3900,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/C9C67BD7-788D-4495-BA6E-F313951A137F.jpg?v=1786793376"
  },
  {
    "name": "Vintage Oakley Archive Map Print Fur Hood Technical Parka Jacket (XL)",
    "description": "RARE VINTAGE Fit Size Size:XL (L:32|C :52) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days Vintage Oakle...",
    "price_cents": 17999,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/178A4F74-0618-463D-9A7F-BC7668FCA005.jpg?v=1786793333"
  },
  {
    "name": "Much More Road Trip Graphic Short  (XL)",
    "description": "RARE VINTAGE Fit Size Size:XL (L:30|C :50) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1700,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/D83A08DF-24E1-4133-9698-4BA013A8A0D3.jpg?v=1786793094"
  },
  {
    "name": "Vintage Belstaff Cream Genuine Leather 4-Pocket Motorcycle Field Jacket (L)",
    "description": "RARE VINTAGE JACKET Fit Size Size: L (L:29 |C :46) In Inches 100% Genuine Leather | RARE Product Condition: 09/10 — Premium Thrifted Piece, Have minnor mark Ships in 24 Hours | ...",
    "price_cents": 14500,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/B3F203C3-5899-40EA-AC62-FB8114EB273A.jpg?v=1786792960"
  },
  {
    "name": "Under Armour Storm Fleece Full-Zip Hoodie (L)",
    "description": "RARE VINTAGE Fit Size Size: L (L:29|C :46) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1800,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/588B3D29-D489-4844-B329-408203BCDA57.jpg?v=1786792982"
  },
  {
    "name": "Starter NBA Orlando Magic Quarter-Zip Jacket  (M)",
    "description": "RARE VINTAGE Fit Size Size:M (L:24|C :50) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 2800,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/84232BC8-F2AE-4B06-9977-7BBD5ABF5022.jpg?v=1786792734"
  },
  {
    "name": "Polo Ralph Lauren Estate Rib Quarter (3XL/4XL)",
    "description": "RARE VINTAGE Fit Size Size:3XL/4XL (L:33|C :66) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 2400,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/FAED3A7B-40BF-4BB6-A7EF-07C1A64AE4C6.jpg?v=1786792546"
  },
  {
    "name": "Picasso Art Colourblock Leather Jacket (XL)",
    "description": "RARE VINTAGE JACKET Fit Size Size: XL (L:28 |C :52) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 D...",
    "price_cents": 3600,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/EBA3524D-8A52-4FC8-A398-BAC30046618B.jpg?v=1786792398"
  },
  {
    "name": "Gap Harrington Jacket (XL)",
    "description": "RARE VINTAGE Fit Size Size:XL (L:25 |C :52) In Inches 100% Genuine | RARE Product Condition:8/10 Have marks— Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 2400,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/28C21810-4213-4A57-88E7-93C2307336FE.jpg?v=1786792376"
  },
  {
    "name": "Nike Big Swoosh Off-White Windbreaker Jacket (L)",
    "description": "RARE VINTAGE Fit Size : L (L:28 |C :49) In Inches 100% Genuine | RARE Product Condition: 9/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3600,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/C0C2D3B4-A04A-4D4D-B82B-718590B453A9.jpg?v=1786792360"
  },
  {
    "name": "MLB New York Mets Hooded Windbreaker (M)",
    "description": "RARE VINTAGE Fit Size Size:M (L:26|C :44) In Inches 100% Genuine | RARE Product Condition:8/10 Faded pocket cut— Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1200,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/6169F3E6-2FF1-4B36-8EF9-10C4AE7AD6EC.jpg?v=1786792225"
  },
  {
    "name": "Spec Tee Art & Design Bomber Jacket(M)",
    "description": "RARE VINTAGE Fit Size Size: M(L:26|C :44) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1500,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/6B330EC9-C61E-499E-99F9-F945F4E8942C.jpg?v=1786792134"
  },
  {
    "name": "Adidas Colorblock Polo Shirt (XL)",
    "description": "RARE VINTAGE Fit Size Size:XL (L:30|C : 46) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1300,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/C2034188-8828-4FA6-B146-E7BDECFE0671.jpg?v=1786791875"
  },
  {
    "name": "Triumph Motorcycles Premium Leather Racing Jacket (M)",
    "description": "RARE VINTAGE JACKET Fit Size Size: M (L:25 |C :50) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece, Have space for pads Ships in 24 Hours...",
    "price_cents": 10900,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/BC1DA9D8-5611-4EB7-9E1E-F0AA47ADB7FA.jpg?v=1786791686"
  },
  {
    "name": "Air Jordan “Paul Pierce” Dri-Fit Red Long Sleeve Shirt  Vintage Basketball (XL)",
    "description": "RARE VINTAGE Fit Size : XL (L:29 |C :47) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1900,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/A77D8600-9A13-4E52-ABC7-2C8C6BDBC12C.jpg?v=1786790878"
  },
  {
    "name": "Tommy Hilfiger Navy Crewneck Sweatshirt – Vintage Fit (M)",
    "description": "RARE VINTAGE Fit Size : M (L:28 |C :45) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 2700,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/9D94A99C-EBC1-4FB1-8D14-683AF0D73C9C.jpg?v=1786790707"
  },
  {
    "name": "Super Premium Original Leather Jacket (S)",
    "description": "RARE VINTAGE JACKET Fit Size Size: S (L:25 |C :42) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 6100,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/3FB28964-EBE7-4DB3-8591-77B7468B65A0.jpg?v=1786790625"
  },
  {
    "name": "Polo Ralph Lauren Navy Zip-Up Hoodie w/ Pony Logo  (M)",
    "description": "RARE VINTAGE Fit Size : M (L:26 |C :44) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3400,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/5B1B1A18-BA40-4C4F-89CB-928B8B37CCD7.jpg?v=1786790509"
  },
  {
    "name": "Rab Pertex Shield Grey Waterproof Hooded Shell Jacket – Men’s (M)",
    "description": "RARE VINTAGE Fit Size : M (L:28 |C :42) In Inches 100% Genuine | RARE Product, No Tag Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 2400,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/D57AE500-5DA7-43E0-BCF9-2498D47C64AA.jpg?v=1786790397"
  },
  {
    "name": "Roots Canada “Lake Louise” Black Zip-Up Hoodie (L)",
    "description": "RARE VINTAGE Fit Size : L (L:27 |C :47) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1700,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/48E1A3AF-EAC8-494F-96C7-35FF9F053ED9.jpg?v=1786790225"
  },
  {
    "name": "MLB Washington “W” Navy & Red Varsity Jacket (L)",
    "description": "RARE VINTAGE Fit Size : L (L:27 |C :49) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1800,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/ECAB14AD-9DBC-4F11-84BC-2883F8E747F9.jpg?v=1786787721"
  },
  {
    "name": "The North Face Denali Fleece Jacket – Purple/Lavender Colorblock – Women’s (XL/2XL)",
    "description": "RARE VINTAGE Fit Size : XL/2XL (L:28 |C :56) In Inches 100% Genuine | RARE Product Condition: 9/10 (Have Minor Hole)— Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 ...",
    "price_cents": 2400,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/44C4590A-C28C-447B-B6F4-773864A10893.jpg?v=1786787390"
  },
  {
    "name": "Oakland Athletics MLB Varsity Bomber Jacket (M)",
    "description": "RARE VINTAGE Fit Size : M (L:26 |C :44) In Inches 100% Genuine | RARE Product Condition: 6/10 (Have Many Marks)— Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1200,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/DFBB5C11-E13D-471C-8730-F64C6E766662.jpg?v=1786787182"
  },
  {
    "name": "The North Face 550 Down Black Puffer Jacket w/ Hood Women’s (L)",
    "description": "RARE VINTAGE Fit Size : L (L:24|C :46) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 9100,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/B414B4CE-79F1-48A7-B22C-35B6AA179FA1.jpg?v=1786786981"
  },
  {
    "name": "Patagonia Women’s Teal Quilted Nano Puff Style Hooded Jacket Women’s (XS)",
    "description": "RARE VINTAGE Fit Size : XS (L:24 |C :38) In Inches 100% Genuine | RARE Product Condition: 9/10 (Have Mark)— Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3900,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/8399BD67-0F39-487C-9721-41A73486E0E8.jpg?v=1786786829"
  },
  {
    "name": "Phenix Vintage Cream Hooded Track Jacket w/ Plaid Fleece Lining – PH Taped Sleeves (2XL)",
    "description": "RARE VINTAGE Fit Size : 2XL (L:30 |C :52) In Inches 100% Genuine | RARE Product Condition: 9/10 (Have Marks ) — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 5400,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/B9B09BB8-6DC3-41F6-A4FC-A97E77AC7EB8.jpg?v=1786786198"
  },
  {
    "name": "A-1 Genuine Premium Original Leather Jacket (2XL/3XL)",
    "description": "RARE VINTAGE JACKET Fit Size Size: 2XL/3XL (L:28 |C :56) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in ...",
    "price_cents": 1800,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/03794A63-2587-435B-9119-3B7A3C6A7892.jpg?v=1786794348"
  },
  {
    "name": "Nautica Premium Original Leather Jacket (M)",
    "description": "RARE VINTAGE JACKET Fit Size Size: M (L:25 |C :48) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1800,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/869E1C1B-EA84-4E87-B2E0-D2DBE89FFED0.jpg?v=1786794265"
  },
  {
    "name": "Luella Premium Original Leather Jacket Women’s (XS)",
    "description": "RARE VINTAGE JACKET Fit Size Size: XS (L:21 |C :34) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3600,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/3D77AFE6-21A2-41A2-BC1B-452664FF68E8.jpg?v=1786794149"
  },
  {
    "name": "Kenneth Cole Premium Original Leather Jacket (XL)",
    "description": "RARE VINTAGE JACKET Fit Size Size: XL (L:27 |C :50) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3000,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/BFE731C2-182B-4636-B5C9-AEF49451C283.jpg?v=1786794082"
  },
  {
    "name": "Harro Kombi Black/Red Leather Racing Jacket (XS)",
    "description": "RARE VINTAGE JACKET Fit Size Size: XS (L:25 |C :36) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3600,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/B210E8F4-1AF5-43A7-A45E-C2F0620851DA.jpg?v=1786794004"
  },
  {
    "name": "Roman’s Premium Original Leather Jacket (2XL)",
    "description": "RARE VINTAGE JACKET Fit Size Size: 2XL (L:27 |C :56) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 ...",
    "price_cents": 1600,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/528A535F-EBFB-4013-8D50-6B4EF4EF6438.jpg?v=1786793916"
  },
  {
    "name": "Greg Bell Premium Original Suede Leather Jacket (M)",
    "description": "RARE VINTAGE JACKET Fit Size Size: M (L:25 |C :48) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3300,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/0F93BBBD-57BC-4BBB-AB1A-6201BEB32FE2.jpg?v=1786793826"
  },
  {
    "name": "Network Premium Original Leather Jacket (M)",
    "description": "RARE VINTAGE JACKET Fit Size Size: M (L:23 |C :44) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1500,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/2435DDCC-012E-42B8-BAC9-FAE3EBF0ED84.jpg?v=1786793761"
  },
  {
    "name": "Black Leather Racer Jacket with White Stripes (XL)",
    "description": "RARE VINTAGE JACKET Fit Size Size: XL (L:26 |C :48) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 D...",
    "price_cents": 8500,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/FC75C0D7-641B-4889-9484-28948372DC06.jpg?v=1786793643"
  },
  {
    "name": "Icon Hooligan Spaztyk Mesh Racing Jacket (PADDED) (XL)",
    "description": "RARE VINTAGE JACKET Fit Size Size: XL (L:28 |C :48) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days Ligh...",
    "price_cents": 6700,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/36BDC159-5B1E-4B81-A474-9B22C119AF0C.jpg?v=1786793526"
  },
  {
    "name": "Super Premium Original Leather Jacket (S)",
    "description": "RARE VINTAGE JACKET Fit Size Size: S (L:24 |C :42) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 2200,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/FE4C3E1F-1D2C-417E-83ED-169BD82EEF2F.jpg?v=1786793314"
  },
  {
    "name": "Super Premium Original Leather Jacket (M)",
    "description": "RARE VINTAGE JACKET Fit Size Size: M (L:25 |C :50) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 2800,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/145E9410-4CD1-4772-AE64-99D65780BD9C.jpg?v=1786793245"
  },
  {
    "name": "Gaudi Premium Original Leather Vest (XL)",
    "description": "RARE VINTAGE JACKET Fit Size Size: XL (L:27 |C :48) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 4600,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/9D0E36EA-C71D-4E37-89E5-DD8CB3DB69E9.jpg?v=1786793165"
  },
  {
    "name": "Genuine Premium Original Leather Vest (XL/2XL)",
    "description": "RARE VINTAGE JACKET Fit Size Size: XL/2XL(L:29 |C :52) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-...",
    "price_cents": 1800,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/70154CD9-19A2-4688-9517-3C1AFDC6FC7F.jpg?v=1786793068"
  },
  {
    "name": "BLL Real Leather Biker Jacket (S)",
    "description": "RARE VINTAGE JACKET Fit Size Size: S (L:23 |C :40) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Da...",
    "price_cents": 6100,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/7D7AC681-D26A-4DF1-98DA-668B8062D963.jpg?v=1786792862"
  },
  {
    "name": "Vintage Koi Fish Embroidered Track Jacket (XL)",
    "description": "RARE VINTAGE Fit Size Size:XL (L:27|C :48) In Inches 100% Genuine | RARE Product Condition:9/10 Faded— Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1900,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/D9867F3B-F0E8-47ED-90B0-60444862E1B1.jpg?v=1786791978"
  },
  {
    "name": "Super Premium Original Leather Jacket (L)",
    "description": "RARE VINTAGE JACKET Fit Size Size: L (L:24 |C :46) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 4200,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/5B9FD5E4-CF6E-438D-B618-4321BCC1D537.jpg?v=1786792317"
  },
  {
    "name": "Super Premium Premium Leather Jacket (Xl)",
    "description": "RARE VINTAGE JACKET Fit Size Size: XL (L:30 |C :50) In Inches 100% Genuine Leather | RARE Product Condition: 08/10 — Premium Thrifted Piece, Have mark Ships in 24 Hours | Delive...",
    "price_cents": 1800,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/8BB3DFA2-FF6B-4FBF-BB08-69D8D3B4AE9E.jpg?v=1786792232"
  },
  {
    "name": "Hunters Run Premium Original Leather Jacket (M)",
    "description": "RARE VINTAGE JACKET Fit Size Size: M (L:26 |C :48) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3300,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/C85E5A56-AA86-49CF-B130-AEFB491135B8.jpg?v=1786792167"
  },
  {
    "name": "The Best Linea Esse Biker Jacket (S)",
    "description": "RARE VINTAGE JACKET Fit Size Size: S (L:21 |C :44) In Inches 100% Genuine Leather | RARE Product Condition: 08/10 — Premium Thrifted Piece, Leather Distressed Ships in 24 Hours ...",
    "price_cents": 5400,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/E93BB390-8513-4C9C-99D7-3562C906BE1B.jpg?v=1786792078"
  },
  {
    "name": "USA Eagles Landing Leather Jacket (L/XL)",
    "description": "RARE VINTAGE JACKET Fit Size Size: L/XL (L:27 |C :52) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5...",
    "price_cents": 6100,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/89190D19-DEB2-4271-A080-66A340719F8F.jpg?v=1786791978"
  },
  {
    "name": "Street One Premium Original Leather Jacket (S)",
    "description": "RARE VINTAGE JACKET Fit Size Size: S (L:23 |C :40) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1800,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/CF73F852-F25F-46D9-9B9F-F49D457085B7.jpg?v=1786791893"
  },
  {
    "name": "Plonner Wear Premium Original Leather Jacket (S)",
    "description": "RARE VINTAGE JACKET Fit Size Size: S (L:23 |C :40) In Inches 100% Genuine Leather | RARE Product Condition: 08/10 — Premium Thrifted Piece,Have mark Ships in 24 Hours | Delivery...",
    "price_cents": 1800,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/AECFFDCF-2DE3-4615-885C-AFDB36D89E0E.jpg?v=1786791821"
  },
  {
    "name": "Super Premium Original Leather Jacket (S)",
    "description": "RARE VINTAGE JACKET Fit Size Size: S (L:21 |C :40) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1900,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/CDAFE81F-B29B-417F-A46E-40DA0DD0AE97.jpg?v=1786791753"
  },
  {
    "name": "Vera-Pelle Premium Original Leather Jacket (XL)",
    "description": "RARE VINTAGE JACKET Fit Size Size: XL (L:28 |C :52) In Inches 100% Genuine Leather | RARE Product Condition: 07/10 — Premium Thrifted Piece, Leather Distressed Ships in 24 Hours...",
    "price_cents": 1800,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/E869CEE0-77AD-47B9-A559-D4AB82CE9F09.jpg?v=1786791544"
  },
  {
    "name": "Lizane Spain Premium Original Leather Jacket (S/M)",
    "description": "RARE VINTAGE JACKET Fit Size Size: S/M (L:25.5 |C :44) In Inches 100% Genuine Leather | RARE Product Condition: 09/10 — Premium Thrifted Piece, Have minnor marls Ships in 24 Hou...",
    "price_cents": 2400,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/C322E969-1B39-4F63-BDC6-C74CF123C7DA.jpg?v=1786791419"
  },
  {
    "name": "Territoire Sharks Racing Jacket  Padded (XL)",
    "description": "RARE VINTAGE JACKET Fit Size Size: XL (L:27 |C :52) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 D...",
    "price_cents": 6700,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/65565280-96B2-40F5-8964-33CB69952214.jpg?v=1786791324"
  },
  {
    "name": "Hibou Racing Leather Jacket Padded (L)",
    "description": "RARE VINTAGE JACKET Fit Size Size: L (L:26 |C :48) In Inches 100% Genuine Leather | RARE Product Condition: 08/10 — Premium Thrifted Piece, Have minnor cut &amp; Leather panit D...",
    "price_cents": 4000,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/393A3A10-E09B-466A-B0F4-ACADCA26C850.jpg?v=1786791156"
  },
  {
    "name": "Danier Premium Original Leather Jacket (Xl)",
    "description": "RARE VINTAGE JACKET Fit Size Size: XL (L:28 |C :52) In Inches 100% Genuine Leather | RARE Product Condition: 09/10 — Premium Thrifted Piece , Zipp broken Ships in 24 Hours | Del...",
    "price_cents": 3000,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/75412564-3A6D-4A30-AB8C-1849D64AADC9.jpg?v=1786791040"
  },
  {
    "name": "Gap Premium Original Leather Jacket (Xl)",
    "description": "RARE VINTAGE JACKET Fit Size Size: Xl (L:28 |C :48) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3000,
    "stock_qty": 3,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/BAAC9D96-F4CA-4ED1-8909-F9446D656F07.jpg?v=1786790966"
  },
  {
    "name": "First Genuine Leather Distressed Biker Jacket (M)",
    "description": "RARE VINTAGE JACKET Fit Size Size: M (L:24 |C :48) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Da...",
    "price_cents": 7900,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/6D690407-6727-4161-B0D8-62D1854F9699.jpg?v=1786790886"
  },
  {
    "name": "Identity Premium Original Leather Jacket (S)",
    "description": "RARE VINTAGE JACKET Fit Size Size: S (L:24 |C :41) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1600,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/9DFEECCB-EFD3-45A5-AEBD-1CC40785E7F5.jpg?v=1786790810"
  },
  {
    "name": "Super Premium Original Leather Jacket (XL/2XL)",
    "description": "RARE VINTAGE JACKET Fit Size Size: XL/2XL (L:27 |C :55) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4...",
    "price_cents": 2100,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/52006179-19A1-445D-B5EF-99894B234A17.jpg?v=1786790713"
  },
  {
    "name": "Woodpecker Premium Original Leather Jacket (2Xl)",
    "description": "RARE VINTAGE JACKET Fit Size Size: 2XL (L:30 |C :53) In Inches 100% Genuine Leather | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 ...",
    "price_cents": 1800,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/17A5D57F-8237-4C0B-A73C-255C7513629A.jpg?v=1786790546"
  },
  {
    "name": "Lacoste Oxford Button-Up Shirt  (2Xl)",
    "description": "RARE VINTAGE Fit Size Size:2Xl (L:31|C :52) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1800,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/DEC19737-FC86-44C3-A1E6-D7DD984AED75.jpg?v=1786710925"
  },
  {
    "name": "Adidas Originals 3-Stripe Sleeve Logo Sweatshirt Black (M)",
    "description": "RARE VINTAGE Fit Size : M (L:29 |C :42) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1700,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/2A8D5447-AE77-463C-B689-13BB9EC61CE0.jpg?v=1786710968"
  },
  {
    "name": "Tommy Sport Spell-Out Red Full-Zip Jacket – Navy Lined (3XL)",
    "description": "RARE VINTAGE Fit Size : 3XL (L:30 |C :58) In Inches 100% Genuine | RARE Product Condition: 9/10 (Have Mark) — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3300,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/607554DD-765D-4739-9382-0E3DCA4D5841.jpg?v=1786711113"
  },
  {
    "name": "Superdry Company Commodity Edition Khaki Moto-Style Jacket (L)",
    "description": "RARE VINTAGE Fit Size : L (L:27 |C :46) In Inches 100% Genuine | RARE Product Condition: 9/10 (Have Marks)— Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1700,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/32D6C62B-7A70-4BD6-A89F-C7A81DC4DFB7.jpg?v=1786710644"
  },
  {
    "name": "Vintage 2000s Chase Authentics M&M’s Racing Team NASCAR Embroidered Jacket (M)",
    "description": "RARE VINTAGE Fit Size : M (L:25 |C :45) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days Rare 2000s Chase...",
    "price_cents": 17999,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/D63063B4-F7D1-4B1D-928E-FAD49D4F862D.jpg?v=1786710796"
  },
  {
    "name": "Husqvarna Motorcycles Nuda 900 Zip Hoodie (S)",
    "description": "RARE VINTAGE Fit Size Size:S (L:25 |C :41) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1500,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/21CA56B7-C8CB-44C7-91D6-230FCB4562BE.jpg?v=1786710491"
  },
  {
    "name": "Tommy Hilfiger Crest Logo Shirt – White (XS)",
    "description": "RARE VINTAGE Fit Size Size: Xs (L:27|C :37) In Inches 100% Genuine | RARE Product Condition:7/10 Have mark— Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1299,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/D27BFBDA-12BA-4450-944D-01EA1B3B6135.jpg?v=1786709836"
  },
  {
    "name": "Mercedes-Benz Track Jacket Red Windbreaker (XL)",
    "description": "RARE VINTAGE Fit Size : XL (L:29 |C :48) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 4500,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/6553F27F-EF9D-43E0-B14A-45BBBA1C01CB.jpg?v=1786709842"
  },
  {
    "name": "Forever 21 Black Suede Fringe Moto Vest with Rose Embroidery women’s (S)",
    "description": "RARE VINTAGE Fit Size : S (L:22 |C :36) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3100,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/C7D9D671-8A86-4AB8-A131-BB326C8930AD.jpg?v=1786709931"
  },
  {
    "name": "Lacoste Long Sleeve Polo Mustard Yellow (L)",
    "description": "RARE VINTAGE Fit Size : L (L:30 |C :42) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1700,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/66D58CCE-541D-438A-B114-BE2B46D85D94.jpg?v=1786709964"
  },
  {
    "name": "Kappa Sporting Centese Jacket – Kappa Sporting Centese Football Track Jacket Navy/Blue (S)",
    "description": "RARE VINTAGE Fit Size : S (L:26 |C :40) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1700,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/50CE0B26-7C86-4674-9BB1-FF31A215F84E.jpg?v=1786710068"
  },
  {
    "name": "Hilfiger Denim Navy Zip-Up Track Jacket – Mesh Lined (XL/2XL)",
    "description": "RARE VINTAGE Fit Size : XL/2XL (L:28 |C :50) In Inches 100% Genuine | RARE Product Condition: 09/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 2400,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/7B9C595F-4E77-44E1-A814-D50A3037D828.jpg?v=1786710091"
  },
  {
    "name": "Tommy Hilfiger Oxford Button-Up Shirt (L/XL)",
    "description": "RARE VINTAGE Fit Size Size: L/Xl (L:28|C :48) In Inches 100% Genuine | RARE Product Condition:8/10 Have marks— Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1300,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/4F4ADC29-AC0F-4997-B734-73E03AD8E197.jpg?v=1786710136"
  },
  {
    "name": "Adidas Z.N.E. Tech Fleece Hooded Zip-Up Jacket – Ice Blue  (M)",
    "description": "RARE VINTAGE Fit Size : M (L:24 |C :42) In Inches 100% Genuine | RARE Product Condition: 9/10 (Have Mark)— Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 2200,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/F908BF25-80E7-4EAE-9923-030A3A70BC52.jpg?v=1786710221"
  },
  {
    "name": "Puma Classic Full Zip Track Jacket Navy  (L)",
    "description": "RARE VINTAGE Fit Size : XL/2XL (L:28 |C :56) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1500,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/C65B9D91-7545-4C05-89A4-5192B05783B5.jpg?v=1786710304"
  },
  {
    "name": "Polo Ralph Lauren Pants (W:35) (L:39)",
    "description": "RARE VINTAGE Fit Size: (Waist: 35\" | Length: 39”) In Inches 100% Original | RARE Product Fit: Classic Straight Fit Condition: 08/10 Have a mark ,faded - Premium Thrifted Piece S...",
    "price_cents": 1600,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/2469B1B8-B8DB-4599-8BC6-32E7FD7A4672.jpg?v=1786710394"
  },
  {
    "name": "Umbro Official England Full-Zip Track Jacket National Team Crest (M)",
    "description": "RARE VINTAGE Fit Size : M (L:26 |C :44) In Inches 100% Genuine | RARE Product Condition: 9/10 (Thread Coming Out)— Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1700,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/47D32A6E-B850-48AE-98DD-DE7C4C62FBBF.jpg?v=1786710405"
  },
  {
    "name": "Dickies Classic Work Jacket (L)",
    "description": "RARE VINTAGE Fit Size Size: L (L:26|C :47) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3600,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/7D4D5B3E-B0FA-4FB9-9CBB-BFAFB2ECF56A.jpg?v=1786710415"
  },
  {
    "name": "Columbia Omni-Heat Mint Green Hooded Puffer Women's Jacket  (M)",
    "description": "RARE VINTAGE Fit Size Size: M (L:28 |C :44) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3000,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/02177C06-D71E-465E-B1B8-A64B14711CFD.jpg?v=1786711126"
  },
  {
    "name": "Big Train Osaka Camo Tie-Dye Field Jacket – Multi-Pocket Utility Style (XL)",
    "description": "RARE VINTAGE Fit Size : XL (L:28 |C :48) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3100,
    "stock_qty": 1,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/0426D4A8-7D84-4496-B608-1D51D16216B2.jpg?v=1786709757"
  },
  {
    "name": "MarcBrown Outdoor Clothes Multi-Pocket Utility Vest Khaki  (M)",
    "description": "RARE VINTAGE Fit Size : M (L:25 |C :44) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1700,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/6E60A6BE-2F90-44D5-B2EF-5722D04AA150.jpg?v=1786709654"
  },
  {
    "name": "Las Vegas Raiders NFL Primark Graphic T-Shirt Black Size  (2XL)",
    "description": "RARE VINTAGE Fit Size : 2XL (L:31 |C :52) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1800,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/373FC665-9990-4C8F-9580-F79A606FA53B.jpg?v=1786709551"
  },
  {
    "name": "Jordan Jumpman Sweatpants (W:30) (L:38)",
    "description": "RARE VINTAGE Fit Size: (Waist: 30\" | Length: 38”) In Inches 100% Original | RARE Product Fit: Classic Straight Fit Condition: 07/10 Have a cut- Premium Thrifted Piece Ships in 2...",
    "price_cents": 1299,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/DE8D088C-9363-45E0-A9EF-D0E4A1D7ACC2.jpg?v=1786709581"
  },
  {
    "name": "Adidas Originals Multicolor Logo Hoodie (S)",
    "description": "RARE VINTAGE Fit Size Size:S (L:24|C :44) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 1600,
    "stock_qty": 5,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/BCC14BD2-AB09-415F-930A-FEBA2C8C436C.jpg?v=1786709508"
  },
  {
    "name": "Adidas Cargo Joggers (W:33) (L:38.5)",
    "description": "RARE VINTAGE Fit Size: (Waist: 33\" | Length: 38.5”) In Inches 100% Original | RARE Product Fit: Classic Straight Fit Condition: 08/10 - Premium Thrifted Piece Ships in 24 Hours ...",
    "price_cents": 1299,
    "stock_qty": 4,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/4C2D9E62-9D45-4B36-A2C4-C1662C88248D.jpg?v=1786709381"
  },
  {
    "name": "The North Face Fleece Full-Zip Jacket (XL)",
    "description": "RARE VINTAGE Fit Size Size:XL (L:29|C :48) In Inches 100% Genuine | RARE Product Condition: 10/10 — Premium Thrifted Piece Ships in 24 Hours | Delivery in 4-5 Days",
    "price_cents": 3000,
    "stock_qty": 2,
    "image_url": "https://cdn.shopify.com/s/files/1/0623/1683/9017/files/1C99FB02-4626-4E69-824A-9622090178DE.jpg?v=1786709383"
  }
].map(p => ({
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
