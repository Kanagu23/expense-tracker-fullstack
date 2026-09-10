import app from "../app.js";
import { expensesHandler } from "../controllers/expense.controller.js";

app.post("/api/expenses",expensesHandler)