const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { PORT } = require('./src/config/env');

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

startServer();
