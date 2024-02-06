import axios from "axios";

const API_URL = "http://localhost:5000/api/transactions";


export const getAllTransactions = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createTransaction = async (transaction: any) => {
  const response = await axios.post(API_URL, transaction);
  return response.data;
};

export const updateTransaction = async (id: number, transaction: any) => {
  const response = await axios.put(`${API_URL}/${id}`, transaction);
  return response.data;
};

export const deleteTransaction = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
