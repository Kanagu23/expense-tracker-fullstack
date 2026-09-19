import app from "./app.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./config/database.js";

const port = process.env.PORT ?? 3000;

const startServer = async () => {
  await connectDatabase();

  const server = app.listen(port, () => {
    console.log(`Server will run on port ${port}`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");

    server.close(async () => {
      await disconnectDatabase();
      console.log("MongoDB disconnected");
      process.exit(0);
    });
  });
};

startServer();