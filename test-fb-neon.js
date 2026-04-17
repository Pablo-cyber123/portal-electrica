const { Client } = require('pg');

async function checkDB() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    const res = await client.query("SELECT key, value FROM \"AppSetting\" WHERE key IN ('FACEBOOK_PAGE_ID', 'FACEBOOK_ACCESS_TOKEN')");
    
    let pageId = null;
    let token = null;

    res.rows.forEach(row => {
      if (row.key === 'FACEBOOK_PAGE_ID') pageId = row.value;
      if (row.key === 'FACEBOOK_ACCESS_TOKEN') token = row.value;
    });

    console.log("DB Page ID:", pageId);
    console.log("DB Token exists:", !!token);

    if (token) {
      const url = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,message,created_time&limit=3&access_token=${token}`;
      console.log("Fetching FB API...");
      const fbRes = await fetch(url);
      const fbData = await fbRes.json();
      
      if (fbData.error) {
         console.log("FB FETCH ERROR:", fbData.error);
      } else {
         console.log("FB POSTS FOUND:", fbData.data.length);
         fbData.data.forEach(p => {
            console.log(`- ${p.created_time}: ${p.message?.substring(0, 30)}...`);
         });
      }
    }
  } catch (err) {
    console.error("DB connection error:", err);
  } finally {
    await client.end();
  }
}

checkDB();
