import app from "./app.js";
import { connectDatabase } from "./config/database.js";
const port = process.env.PORT??3000
const startServer = async () => {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Server will run on port ${port}`);
  });
};

startServer();