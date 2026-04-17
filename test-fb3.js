const TOKEN = "EAANPnHFlcPoBRE9AccuZBACSbYYeZBZCJ78Tb1kcM0DFfMY9BIZBo2jjeGQBm7lXQn0sN6OloP79ixTEyVyDz8Le3nMugktH4D7YtGVNrU6edTAj11fxH75tfZBqiBPZAEvdwZAma9d0jmBf13iVvW91evcbkVU9B0ofmTP8ZCkp6Lpn4n06aIhQutJCjpta4BT70m7lVklPDxxX77PihZCW7t2qyAuxbXd5zwarXx4GqEpwIj3EqZCjJf6uDfXGl41SdBiJtLthl2Wp3bTuk3393rVvLh2QZDZD";

// La página REAL según los granular_scopes
const REAL_PAGE_ID = "276364919505715";

async function test() {
  // Test con el Page ID real
  console.log("=== Test: Posts de la página REAL (276364919505715) ===");
  const url1 = `https://graph.facebook.com/v19.0/${REAL_PAGE_ID}/posts?fields=id,message,created_time,full_picture,permalink_url&limit=5&access_token=${TOKEN}`;
  const r1 = await fetch(url1);
  const d1 = await r1.json();
  console.log(JSON.stringify(d1, null, 2));

  // Info de la página real
  console.log("\n=== Info de la página real ===");
  const url2 = `https://graph.facebook.com/v19.0/${REAL_PAGE_ID}?fields=id,name&access_token=${TOKEN}`;
  const r2 = await fetch(url2);
  const d2 = await r2.json();
  console.log(JSON.stringify(d2, null, 2));

  // Feed
  console.log("\n=== Feed de la página real ===");
  const url3 = `https://graph.facebook.com/v19.0/${REAL_PAGE_ID}/feed?fields=id,message,created_time,full_picture&limit=5&access_token=${TOKEN}`;
  const r3 = await fetch(url3);
  const d3 = await r3.json();
  console.log(JSON.stringify(d3, null, 2));
}

test();
