// Obtener las páginas a las que tiene acceso este token
const TOKEN = "EAANPnHFlcPoBRE9AccuZBACSbYYeZBZCJ78Tb1kcM0DFfMY9BIZBo2jjeGQBm7lXQn0sN6OloP79ixTEyVyDz8Le3nMugktH4D7YtGVNrU6edTAj11fxH75tfZBqiBPZAEvdwZAma9d0jmBf13iVvW91evcbkVU9B0ofmTP8ZCkp6Lpn4n06aIhQutJCjpta4BT70m7lVklPDxxX77PihZCW7t2qyAuxbXd5zwarXx4GqEpwIj3EqZCjJf6uDfXGl41SdBiJtLthl2Wp3bTuk3393rVvLh2QZDZD";

async function findPages() {
  // Primero: ver info del token
  const debugUrl = `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${TOKEN}`;
  console.log("=== Consultando identidad del token ===");
  
  try {
    const res1 = await fetch(debugUrl);
    const data1 = await res1.json();
    console.log("Token pertenece a:", JSON.stringify(data1, null, 2));
  } catch(e) {
    console.error("Error consultando /me:", e.message);
  }

  // Segundo: ver páginas accesibles
  const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token&access_token=${TOKEN}`;
  console.log("\n=== Buscando páginas accesibles ===");

  try {
    const res2 = await fetch(pagesUrl);
    const data2 = await res2.json();
    
    if (data2.data && data2.data.length > 0) {
      console.log("Páginas encontradas:");
      data2.data.forEach(page => {
        console.log(`  📄 Nombre: ${page.name}`);
        console.log(`     ID: ${page.id}`);
        console.log(`     Token (primeros 30 chars): ${page.access_token?.substring(0, 30)}...`);
        console.log("");
      });
    } else {
      console.log("Respuesta:", JSON.stringify(data2, null, 2));
      console.log("\n⚠ Este token podría ser un Page Token directamente (no User Token).");
      console.log("Si es un Page Token, intentando traer posts directamente...\n");

      // Intentar traer posts con el token directamente como si fuera un page token
      const postsUrl = `https://graph.facebook.com/v19.0/me/posts?fields=id,message,created_time,full_picture&limit=3&access_token=${TOKEN}`;
      const res3 = await fetch(postsUrl);
      const data3 = await res3.json();
      console.log("Posts directos:", JSON.stringify(data3, null, 2));
    }
  } catch(e) {
    console.error("Error:", e.message);
  }
}

findPages();
