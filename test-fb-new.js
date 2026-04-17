const TOKEN = "EAANPnHFlcPoBRE9AccuZBACSbYYeZBZCJ78Tb1kcM0DFfMY9BIZBo2jjeGQBm7lXQn0sN6OloP79ixTEyVyDz8Le3nMugktH4D7YtGVNrU6edTAj11fxH75tfZBqiBPZAEvdwZAma9d0jmBf13iVvW91evcbkVU9B0ofmTP8ZCkp6Lpn4n06aIhQutJCjpta4BT70m7lVklPDxxX77PihZCW7t2qyAuxbXd5zwarXx4GqEpwIj3EqZCjJf6uDfXGl41SdBiJtLthl2Wp3bTuk3393rVvLh2QZDZD";

async function testFacebookAPI() {
  try {
    const url = `https://graph.facebook.com/v19.0/me/posts?fields=id,message,created_time,full_picture,permalink_url,attachments{subattachments,type,media,url}&limit=10&access_token=${TOKEN}`;
    
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
      console.log(`Message: ${post.message ? post.message.substring(0, 100).replace(/\n/g, ' ') + '...' : 'No message'}`);
      console.log(`ID: ${post.id}`);
    });

  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testFacebookAPI();
