import app from "./app";
import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";
async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`app is running on: http://localhost:${PORT}`);
  });
}

startServer();
