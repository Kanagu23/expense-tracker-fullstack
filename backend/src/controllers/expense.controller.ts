import type { Request, Response } from "express";

export const expensesHandler = (req: Request, res: Response) => {
  res.status(201).json({
    message: "Expense endpoint reached"
  });
};