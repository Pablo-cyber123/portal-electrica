const USER_TOKEN = "EAANPnHFlcPoBRE9AccuZBACSbYYeZBZCJ78Tb1kcM0DFfMY9BIZBo2jjeGQBm7lXQn0sN6OloP79ixTEyVyDz8Le3nMugktH4D7YtGVNrU6edTAj11fxH75tfZBqiBPZAEvdwZAma9d0jmBf13iVvW91evcbkVU9B0ofmTP8ZCkp6Lpn4n06aIhQutJCjpta4BT70m7lVklPDxxX77PihZCW7t2qyAuxbXd5zwarXx4GqEpwIj3EqZCjJf6uDfXGl41SdBiJtLthl2Wp3bTuk3393rVvLh2QZDZD";
const PAGE_ID = "276364919505715";

async function getPageToken() {
  // Método 1: Solicitar access_token de la página directamente
  console.log("=== Método 1: GET /{page_id}?fields=access_token ===");
  const url1 = `https://graph.facebook.com/v19.0/${PAGE_ID}?fields=access_token,name&access_token=${USER_TOKEN}`;
  const r1 = await fetch(url1);
  const d1 = await r1.json();
  console.log(JSON.stringify(d1, null, 2));

  if (d1.access_token) {
    console.log("\n✅ ¡PAGE TOKEN OBTENIDO!");
    console.log("Page Token:", d1.access_token);
    
    // Verificar que funciona con los posts
    console.log("\n=== Probando posts con Page Token ===");
    const url2 = `https://graph.facebook.com/v19.0/${PAGE_ID}/posts?fields=id,message,created_time,full_picture,permalink_url&limit=5&access_token=${d1.access_token}`;
    const r2 = await fetch(url2);
    const d2 = await r2.json();
    console.log(JSON.stringify(d2, null, 2));
  } else {
    console.log("\n❌ No se pudo obtener Page Token por Método 1");
    
    // Método 2: Intentar con v21.0
    console.log("\n=== Método 2: v21.0 ===");
    const url3 = `https://graph.facebook.com/v21.0/${PAGE_ID}?fields=access_token,name&access_token=${USER_TOKEN}`;
    const r3 = await fetch(url3);
    const d3 = await r3.json();
    console.log(JSON.stringify(d3, null, 2));

    if (d3.access_token) {
      console.log("\n✅ ¡PAGE TOKEN OBTENIDO con v21!");
      console.log("Page Token:", d3.access_token);
    }
  }
}

getPageToken();
