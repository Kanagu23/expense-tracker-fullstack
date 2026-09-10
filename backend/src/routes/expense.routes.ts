import { Router } from "express";
import { expensesHandler } from "../controllers/expense.controller.js";

const expenseRouter = Router();

expenseRouter.post("/", expensesHandler);

export default expenseRouter;