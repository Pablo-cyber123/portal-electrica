require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function save() {
  try {
    await prisma.appSetting.upsert({
      where: { key: 'FACEBOOK_ACCESS_TOKEN' },
      create: { key: 'FACEBOOK_ACCESS_TOKEN', value: 'EAANPnHFlcPoBRE9AccuZBACSbYYeZBZCJ78Tb1kcM0DFfMY9BIZBo2jjeGQBm7lXQn0sN6OloP79ixTEyVyDz8Le3nMugktH4D7YtGVNrU6edTAj11fxH75tfZBqiBPZAEvdwZAma9d0jmBf13iVvW91evcbkVU9B0ofmTP8ZCkp6Lpn4n06aIhQutJCjpta4BT70m7lVklPDxxX77PihZCW7t2qyAuxbXd5zwarXx4GqEpwIj3EqZCjJf6uDfXGl41SdBiJtLthl2Wp3bTuk3393rVvLh2QZDZD' },
      update: { value: 'EAANPnHFlcPoBRE9AccuZBACSbYYeZBZCJ78Tb1kcM0DFfMY9BIZBo2jjeGQBm7lXQn0sN6OloP79ixTEyVyDz8Le3nMugktH4D7YtGVNrU6edTAj11fxH75tfZBqiBPZAEvdwZAma9d0jmBf13iVvW91evcbkVU9B0ofmTP8ZCkp6Lpn4n06aIhQutJCjpta4BT70m7lVklPDxxX77PihZCW7t2qyAuxbXd5zwarXx4GqEpwIj3EqZCjJf6uDfXGl41SdBiJtLthl2Wp3bTuk3393rVvLh2QZDZD' }
    });
    console.log('Token guardado exitosamente en Postgres.');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}

save();
