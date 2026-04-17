const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFacebookAPI() {
  try {
    const settings = await prisma.appSetting.findMany();
    const pageIdSetting = settings.find(s => s.key === "FACEBOOK_PAGE_ID");
    const accessTokenSetting = settings.find(s => s.key === "FACEBOOK_ACCESS_TOKEN");

    const pageId = pageIdSetting?.value;
    const accessToken = accessTokenSetting?.value;

    if (!pageId || !accessToken) {
      console.log('Error: No Facebook credentials found in DB.');
      return;
    }

    console.log(`Using Page ID: ${pageId}`);
    
    // Explicitly add 'video' field or 'source' to fetch videos if they are different from 'full_picture'
    // Actually fields: id,message,created_time,full_picture,permalink_url,attachments{subattachments,media_type,media,url}
    const url = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,message,created_time,full_picture,permalink_url,attachments{subattachments,type,media,url}&limit=10&access_token=${accessToken}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.log('Facebook API Error:', data.error);
      return;
    }

    console.log(`\nFound ${data.data.length} posts.`);
    
    data.data.slice(0, 3).forEach((post, i) => {
      console.log(`\n--- POST ${i + 1} ---`);
      console.log(`Date: ${post.created_time}`);
      console.log(`Message: ${post.message ? post.message.substring(0, 100).replace(/\\n/g, ' ') + '...' : 'No message'}`);
      console.log(`ID: ${post.id}`);
      
      const images = [];
      if (post.full_picture) images.push(post.full_picture);
      
      if (post.attachments?.data?.[0]?.subattachments?.data) {
        post.attachments.data[0].subattachments.data.forEach((sub) => {
          if (sub.media?.image?.src && !images.includes(sub.media.image.src)) {
            images.push(sub.media.image.src);
          }
        });
      }
      console.log(`Images parsed: ${images.length}`);
    });

  } catch (error) {
    console.error('Fetch error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFacebookAPI();
