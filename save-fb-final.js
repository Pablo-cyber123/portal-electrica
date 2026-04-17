require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function save() {
  try {
    // Guardar Page ID real
    await prisma.appSetting.upsert({
      where: { key: 'FACEBOOK_PAGE_ID' },
      create: { key: 'FACEBOOK_PAGE_ID', value: '276364919505715' },
      update: { value: '276364919505715' }
    });

    // Guardar Page Token (NO User Token)
    await prisma.appSetting.upsert({
      where: { key: 'FACEBOOK_ACCESS_TOKEN' },
      create: { key: 'FACEBOOK_ACCESS_TOKEN', value: 'EAANPnHFlcPoBRGKOdatlkPtbdcRVulvhzagZAMYlv6tr1XyazjOytojkRYoe23I8vG8aPKr0sl9G4eIskZBddRZCsV3pUWabZB6OSZCHrQYoVmacTwnZAaqyWzWoGAYVtEXj3X2n9uBVBFqyKymyQ2ehBK3vogyDUHEQwpnguF5vYr12tV3B40goZAzJsDj1Tya2Pe70ZCkZBnsZCO3yU35F2tXJtOoyaOWw00U4PsMZB4ZD' },
      update: { value: 'EAANPnHFlcPoBRGKOdatlkPtbdcRVulvhzagZAMYlv6tr1XyazjOytojkRYoe23I8vG8aPKr0sl9G4eIskZBddRZCsV3pUWabZB6OSZCHrQYoVmacTwnZAaqyWzWoGAYVtEXj3X2n9uBVBFqyKymyQ2ehBK3vogyDUHEQwpnguF5vYr12tV3B40goZAzJsDj1Tya2Pe70ZCkZBnsZCO3yU35F2tXJtOoyaOWw00U4PsMZB4ZD' }
    });

    console.log('✅ Page ID y Page Token guardados exitosamente!');
    console.log('   Page ID: 276364919505715');
    console.log('   Page Name: Ingeniería Eléctrica UTS');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}

save();
