-- Electronics Category (ID: 1)
INSERT INTO Product (ProductName, SellerId, MRP, CategoryId, Stock, Brand, ImageUrl) VALUES
('iPhone 14 Pro', 1, 129900.00, 1, 50, 'Apple', 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-14-pro-model-unselect-gallery-2-202209?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1660753617559'),
('MacBook Pro M2', 1, 199900.00, 1, 30, 'Apple', 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mbp-14-spacegray-select-202301?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1671304673229'),
('Samsung QLED 4K TV', 1, 89990.00, 1, 20, 'Samsung', 'https://images.samsung.com/is/image/samsung/p6pim/in/qa55q80bakxxl/gallery/in-qled-q80b-qa55q80bakxxl-531163033?$684_547_PNG$'),
('Sony WH-1000XM4', 1, 29990.00, 1, 40, 'Sony', 'https://www.sony.co.in/image/5d02da5df552836db894cead8a68f5f3?fmt=pjpeg&wid=660&bgcolor=FFFFFF&bgc=FFFFFF'),
('iPad Air', 1, 54900.00, 1, 35, 'Apple', 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-air-select-wifi-blue-202203?wid=940&hei=1112&fmt=png-alpha&.v=1645065732688');

-- Clothing Category (ID: 2)
INSERT INTO Product (ProductName, SellerId, MRP, CategoryId, Stock, Brand, ImageUrl) VALUES
('Men\'s Classic Fit Shirt', 2, 2499.00, 2, 100, 'Ralph Lauren', 'https://www.rlmedia.io/is/image/PoloGSI/s7-1240091_lifestyle?$rl_df_pdp_5_7_lif$'),
('Women\'s Summer Dress', 2, 1999.00, 2, 80, 'Zara', 'https://static.zara.net/photos///2023/V/0/1/p/2731/042/712/2/w/563/2731042712_2_1_1.jpg?ts=1679910534791'),
('Men\'s Denim Jeans', 2, 3499.00, 2, 75, 'Levi\'s', 'https://lsco.scene7.com/is/image/lsco/A18940000-dynamic1-pdp?fmt=jpeg&qlt=70,1&op_sharpen=0&resMode=sharp2&op_usm=0.8,1,10,0&fit=crop,0&wid=600&hei=800'),
('Women\'s Formal Blazer', 2, 4999.00, 2, 40, 'H&M', 'https://lp2.hm.com/hmgoepprod?set=quality%5B79%5D%2Csource%5B%2F51%2F7c%2F517c0f6489c196c0f0d40c3c31359ad32db87e33.jpg%5D%2Corigin%5Bdam%5D%2Ccategory%5B%5D%2Ctype%5BLOOKBOOK%5D%2Cres%5Bm%5D%2Chmver%5B1%5D&call=url[file:/product/main]'),
('Sports Track Suit', 2, 3999.00, 2, 60, 'Nike', 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/7c1a9f4e-84f7-4706-8358-7c9dc8c86961/dri-fit-academy-mens-knit-soccer-tracksuit-6xPgXJ.png');

-- Books Category (ID: 3)
INSERT INTO Product (ProductName, SellerId, MRP, CategoryId, Stock, Brand, ImageUrl) VALUES
('The Psychology of Money', 3, 399.00, 3, 100, 'Harriman House', 'https://m.media-amazon.com/images/I/71g2ednj0JL._AC_UY327_FMwebp_QL65_.jpg'),
('Atomic Habits', 3, 499.00, 3, 120, 'Random House', 'https://m.media-amazon.com/images/I/91bYsX41DVL._AC_UY327_FMwebp_QL65_.jpg'),
('Rich Dad Poor Dad', 3, 299.00, 3, 150, 'Plata Publishing', 'https://m.media-amazon.com/images/I/81bsw6fnUiL._AC_UY327_FMwebp_QL65_.jpg'),
('1984', 3, 199.00, 3, 80, 'Penguin', 'https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UY327_FMwebp_QL65_.jpg'),
('The Alchemist', 3, 249.00, 3, 90, 'HarperCollins', 'https://m.media-amazon.com/images/I/71aFt4+OTOL._AC_UY327_FMwebp_QL65_.jpg');

-- Home & Kitchen Category (ID: 4)
INSERT INTO Product (ProductName, SellerId, MRP, CategoryId, Stock, Brand, ImageUrl) VALUES
('Smart Coffee Maker', 4, 12999.00, 4, 30, 'Philips', 'https://m.media-amazon.com/images/I/71IdKRXs8+L._SL1500_.jpg'),
('Air Fryer', 4, 8999.00, 4, 45, 'Instant Pot', 'https://m.media-amazon.com/images/I/71+8uTMDRFL._SL1500_.jpg'),
('Robot Vacuum Cleaner', 4, 29999.00, 4, 25, 'iRobot', 'https://m.media-amazon.com/images/I/61E8RWSXSmL._SL1500_.jpg'),
('Stand Mixer', 4, 24999.00, 4, 20, 'KitchenAid', 'https://m.media-amazon.com/images/I/61g+qpgeBGL._SL1500_.jpg'),
('Smart Refrigerator', 4, 89999.00, 4, 15, 'Samsung', 'https://m.media-amazon.com/images/I/71Tl49HY+qL._SL1500_.jpg');

-- Beauty & Personal Care Category (ID: 5)
INSERT INTO Product (ProductName, SellerId, MRP, CategoryId, Stock, Brand, ImageUrl) VALUES
('Face Serum', 5, 1299.00, 5, 100, 'The Ordinary', 'https://m.media-amazon.com/images/I/51w7zjdinNL._SL1500_.jpg'),
('Hair Dryer', 5, 39999.00, 5, 30, 'Dyson', 'https://m.media-amazon.com/images/I/61MY+1yGXVL._SL1500_.jpg'),
('Perfume Set', 5, 5999.00, 5, 50, 'Calvin Klein', 'https://m.media-amazon.com/images/I/71llS6ZI+tL._SL1500_.jpg'),
('Electric Toothbrush', 5, 2999.00, 5, 60, 'Oral-B', 'https://m.media-amazon.com/images/I/61Iw2NvZYhL._SL1500_.jpg'),
('Skincare Kit', 5, 3499.00, 5, 40, 'Neutrogena', 'https://m.media-amazon.com/images/I/71E0BxWFkZL._SL1500_.jpg');
