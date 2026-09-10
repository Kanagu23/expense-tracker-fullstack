import express from "express";
import expenseRouter from "./routes/expense.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/expenses", expenseRouter);

export default app;