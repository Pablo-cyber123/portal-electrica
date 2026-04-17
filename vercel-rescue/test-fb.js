const TOKEN = "EAANPnHFlcPoBRE9AccuZBACSbYYeZBZCJ78Tb1kcM0DFfMY9BIZBo2jjeGQBm7lXQn0sN6OloP79ixTEyVyDz8Le3nMugktH4D7YtGVNrU6edTAj11fxH75tfZBqiBPZAEvdwZAma9d0jmBf13iVvW91evcbkVU9B0ofmTP8ZCkp6Lpn4n06aIhQutJCjpta4BT70m7lVklPDxxX77PihZCW7t2qyAuxbXd5zwarXx4GqEpwIj3EqZCjJf6uDfXGl41SdBiJtLthl2Wp3bTuk3393rVvLh2QZDZD";
const PAGE_ID = "962556096175574";

async function test() {
  // Test 1: Publicaciones usando Page ID explícito
  console.log("=== Test 1: GET /{page_id}/posts ===");
  const url1 = `https://graph.facebook.com/v19.0/${PAGE_ID}/posts?fields=id,message,created_time,full_picture&limit=5&access_token=${TOKEN}`;
  const r1 = await fetch(url1);
  const d1 = await r1.json();
  console.log(JSON.stringify(d1, null, 2));

  // Test 2: Feed en vez de Posts
  console.log("\n=== Test 2: GET /{page_id}/feed ===");
  const url2 = `https://graph.facebook.com/v19.0/${PAGE_ID}/feed?fields=id,message,created_time,full_picture&limit=5&access_token=${TOKEN}`;
  const r2 = await fetch(url2);
  const d2 = await r2.json();
  console.log(JSON.stringify(d2, null, 2));

  // Test 3: Published posts
  console.log("\n=== Test 3: GET /{page_id}/published_posts ===");
  const url3 = `https://graph.facebook.com/v19.0/${PAGE_ID}/published_posts?fields=id,message,created_time,full_picture&limit=5&access_token=${TOKEN}`;
  const r3 = await fetch(url3);
  const d3 = await r3.json();
  console.log(JSON.stringify(d3, null, 2));

  // Test 4: Verificar permisos del token
  console.log("\n=== Test 4: Debug Token permissions ===");
  const url4 = `https://graph.facebook.com/v19.0/me/permissions?access_token=${TOKEN}`;
  const r4 = await fetch(url4);
  const d4 = await r4.json();
  console.log(JSON.stringify(d4, null, 2));
}

test();
