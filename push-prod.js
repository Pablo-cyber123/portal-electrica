require('dotenv').config({ path: '.env.production' });
const { execSync } = require('child_process');
try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log("Database pushed successfully!");
} catch (e) {
  console.error("Error pushing DB", e.message);
  process.exit(1);
}
