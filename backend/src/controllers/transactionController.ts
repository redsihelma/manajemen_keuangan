import { Request, Response } from "express";
import db from "../database";
import { Transaction } from "../models/Transaction";

// Mendapatkan semua transaksi
export const getAllTransactions = (req: Request, res: Response) => {
  const sql = "SELECT * FROM transactions";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching transactions:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json(results);
  });
};

// Menambahkan transaksi baru
export const createTransaction = (req: Request, res: Response) => {
  const newTransaction: Transaction = req.body;

  // Lakukan validasi data transaksi jika diperlukan

  const sql = "INSERT INTO transactions SET ?";
  db.query(sql, newTransaction, (err, result) => {
    if (err) {
      console.error("Error creating transaction:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.status(201).json({ message: "Transaction created successfully" });
  });
};

// Memperbarui transaksi
export const updateTransaction = (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedTransaction: Transaction = req.body;
  const sql = "UPDATE transactions SET ? WHERE id = ?";
  db.query(sql, [updatedTransaction, id], (err, result) => {
    if (err) {
      console.error("Error updating transaction:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json({ message: "Transaction updated successfully" });
  });
};

// Menghapus transaksi
export const deleteTransaction = (req: Request, res: Response) => {
  const { id } = req.params;
  const sql = "DELETE FROM transactions WHERE id = ?";
  db.query(sql, id, (err, result) => {
    if (err) {
      console.error("Error deleting transaction:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json({ message: "Transaction deleted successfully" });
  });
};
