import express from "express";
import {
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController";

const router = express.Router();

router.get("/:id", getAllTransactions); // Mendapatkan semua transaksi
router.post("/:id", createTransaction); // Menambahkan transaksi baru
router.put("/:id", updateTransaction); // Memperbarui transaksi
router.delete("/:id", deleteTransaction); // Menghapus transaksi

export default router;
