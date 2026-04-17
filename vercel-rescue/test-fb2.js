const TOKEN = "EAANPnHFlcPoBRE9AccuZBACSbYYeZBZCJ78Tb1kcM0DFfMY9BIZBo2jjeGQBm7lXQn0sN6OloP79ixTEyVyDz8Le3nMugktH4D7YtGVNrU6edTAj11fxH75tfZBqiBPZAEvdwZAma9d0jmBf13iVvW91evcbkVU9B0ofmTP8ZCkp6Lpn4n06aIhQutJCjpta4BT70m7lVklPDxxX77PihZCW7t2qyAuxbXd5zwarXx4GqEpwIj3EqZCjJf6uDfXGl41SdBiJtLthl2Wp3bTuk3393rVvLh2QZDZD";

async function test() {
  // Test: token type check
  console.log("=== Debug Token Info ===");
  const url = `https://graph.facebook.com/debug_token?input_token=${TOKEN}&access_token=${TOKEN}`;
  const r = await fetch(url);
  const d = await r.json();
  console.log(JSON.stringify(d, null, 2));

  // Si es User Token, obtener el Page Token real
  console.log("\n=== Intentar obtener Page Token desde /me/accounts ===");
  const url2 = `https://graph.facebook.com/v19.0/me/accounts?access_token=${TOKEN}`;
  const r2 = await fetch(url2);
  const d2 = await r2.json();
  console.log(JSON.stringify(d2, null, 2));

  // Si /me/accounts da data vacía, veamos si /me es una página
  console.log("\n=== Verificar si /me es Page con más campos ===");
  const url3 = `https://graph.facebook.com/v19.0/me?fields=id,name,category,fan_count,posts.limit(3){message,created_time,full_picture}&access_token=${TOKEN}`;
  const r3 = await fetch(url3);
  const d3 = await r3.json();
  console.log(JSON.stringify(d3, null, 2));
}

test();
