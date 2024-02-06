import express from "express";
import transactionRoutes from "./routes/transactionRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/transactions", transactionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
