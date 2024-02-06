import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { getAllTransactions, deleteTransaction, updateTransaction } from '../../services/service';
import '../../csstailwind.css';

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const currentDate = moment();
  const [editedTransaction, setEditedTransaction] = useState<any>({
    description: '',
    amount: 0,
    category: localStorage.getItem('lastTransactionType') || 'pemasukan',
    date: currentDate.format('YYYY-MM-DD HH:mm:ss') 
  });

  const [selectedType, setSelectedType] = useState<string>('all');
  const [pemasukanClicked, setPemasukanClicked] = useState<boolean>(false); // Tambah state untuk melacak apakah tombol Pemasukan diklik
  const [pengeluaranClicked, setPengeluaranClicked] = useState<boolean>(false); // Tambah state untuk melacak apakah tombol Pemasukan diklik

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data: any[] = await getAllTransactions(); // Tambahkan tipe data 'any[]' untuk variabel data
        data.sort((a: any, b: any) => moment(b.date).diff(moment(a.date)));

        // Filter data untuk hanya transaksi hari ini jika tidak ada jenis transaksi yang dipilih
        let filteredTransactions = data.filter((transaction: any) => { // Tambahkan tipe data 'any' untuk parameter transaction
          const transactionDate = moment(transaction.date);
          return transactionDate.isSame(moment().startOf('day'), 'day');
        });

        if (selectedType === 'pemasukan') {
          filteredTransactions = filteredTransactions.filter((transaction: any) => transaction.category === 'Pemasukan'); // Tambahkan tipe data 'any' untuk parameter transaction
        } else if (selectedType === 'pengeluaran') {
          filteredTransactions = filteredTransactions.filter((transaction: any) => transaction.category === 'Pengeluaran'); // Tambahkan tipe data 'any' untuk parameter transaction
        }

        setTransactions(filteredTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [selectedType]);


  // Fungsi untuk menangani klik tombol Pemasukan
  const handlePemasukanClick = () => {
    if (!pemasukanClicked) {
      setSelectedType('pemasukan');
      setPemasukanClicked(true); // Setel state pemasukanClicked menjadi true saat tombol diklik pertama kali
    } else {
      setSelectedType('all'); // Kembalikan ke mode semua transaksi saat tombol diklik kedua kali
      setPemasukanClicked(false); // Setel state pemasukanClicked menjadi false saat tombol diklik kembali
    }
  };

  const handlePengeluaranClick = () => {
    if (!pengeluaranClicked) {
      setSelectedType('pengeluaran');
      setPengeluaranClicked(true); // Setel state pemasukanClicked menjadi true saat tombol diklik pertama kali
    } else {
      setSelectedType('all'); // Kembalikan ke mode semua transaksi saat tombol diklik kedua kali
      setPengeluaranClicked(false); // Setel state pemasukanClicked menjadi false saat tombol diklik kembali
    }
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    const transactionToEdit = transactions.find(transaction => transaction.id === id);
    if (transactionToEdit) {
      // Ganti format tanggal menjadi format yang sesuai untuk input tanggal lokal
      const formattedDate = moment(transactionToEdit.date).format('YYYY-MM-DDTHH:mm');
      setEditedTransaction({ ...transactionToEdit, date: formattedDate });
    }
  };

  const handleUpdate = async () => {
    try {
      if (!editedTransaction.description || !editedTransaction.amount || !editedTransaction.category || !editedTransaction.date) {
        alert('Please fill in all fields');
        return;
      }

      const transactionToEdit = transactions.find(transaction => transaction.id === editingId);
      if (!transactionToEdit) {
        alert('Transaction not found');
        return;
      }

      const updatedTransaction = { ...editedTransaction };
      // Ubah format tanggal menjadi format yang sesuai untuk penyimpanan di database
      updatedTransaction.date = moment(updatedTransaction.date).format('YYYY-MM-DD HH:mm:ss');

      console.log('Updating transaction:', updatedTransaction);

      await updateTransaction(editingId!, updatedTransaction);

      // Dapatkan kembali data transaksi setelah pembaruan berhasil
      const updatedData = await getAllTransactions();
      updatedData.sort((a: any, b: any) => moment(b.date).diff(moment(a.date)));

      // Filter data untuk hanya menampilkan transaksi hari ini
      let filteredTransactions = updatedData.filter((transaction: any) => {
        const transactionDate = moment(transaction.date);
        return transactionDate.isSame(moment().startOf('day'), 'day');
      });

      // Tampilkan transaksi sesuai dengan jenis yang dipilih
      if (selectedType === 'pemasukan') {
        filteredTransactions = filteredTransactions.filter((transaction: any) => transaction.category === 'Pemasukan');
      } else if (selectedType === 'pengeluaran') {
        filteredTransactions = filteredTransactions.filter((transaction: any) => transaction.category === 'Pengeluaran');
      }

      setTransactions(filteredTransactions);
      setEditingId(null);
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction. Please try again.');
    }
  };



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedTransaction({ ...editedTransaction, [name]: value });
  };

  const handleDelete = async (id: number) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this transaction?');
      if (!confirmed) return;

      await deleteTransaction(id);
      setTransactions(transactions.filter(transaction => transaction.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  const totalPemasukan = transactions.reduce((total, transaction) => {
    if (transaction.category === 'Pemasukan') {
      return total + transaction.amount;
    }
    return total;
  }, 0);

  const totalPengeluaran = transactions.reduce((total, transaction) => {
    if (transaction.category === 'Pengeluaran') {
      return total + transaction.amount;
    }
    return total;
  }, 0);

  const hasil = totalPemasukan - totalPengeluaran;

  return (
    <div className="overflow-x-auto">
      {/* Tombol untuk memilih jenis transaksi */}
      <div className="flex justify-end mb-4">
        <button
          className={`mx-2 px-4 py-2 bg-blue-500 text-white rounded focus:outline-none ${selectedType === 'pemasukan' ? 'opacity-100' : 'opacity-50'}`}
          onClick={handlePemasukanClick}
        >
          Pemasukan
        </button>
        <button
          className={`mx-2 px-4 py-2 bg-red-500 text-white rounded focus:outline-none ${selectedType === 'pengeluaran' ? 'opacity-100' : 'opacity-50'}`}
          onClick={handlePengeluaranClick}
        >
          Pengeluaran
        </button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Description</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id} className="hover:bg-gray-100">
              <td className="border p-2">
                {editingId === transaction.id ? (
                  <input type="text" name="description" value={editedTransaction.description} onChange={handleChange} placeholder="Description" required className="p-1 border border-gray-300" />
                ) : (
                  transaction.description || '---'
                )}
              </td>
              <td className="border p-2">
                {editingId === transaction.id ? (
                  <input type="text" name="amount" value={editedTransaction.amount} onChange={handleChange} placeholder="Amount" required className="p-1 border border-gray-300" />
                ) : (
                  transaction.amount.toLocaleString('en-US') || '---'
                )}
              </td>
              <td className="border p-2">
                {editingId === transaction.id ? (
                  <input type="text" name="category" value={editedTransaction.category} onChange={handleChange} placeholder="Category" required className="p-1 border border-gray-300" />
                ) : (
                  transaction.category || '---'
                )}
              </td>
              <td className="border p-2">
                {editingId === transaction.id ? (
                  <input type="datetime-local" name="date" value={editedTransaction.date} onChange={handleChange} required className="p-1 border border-gray-300" />
                ) : (
                  transaction.date || '---'
                )}
              </td>
              <td className="border p-2">
                {editingId === transaction.id ? (
                  <div>
                    <button onClick={handleUpdate} className="bg-blue-500 text-white p-1 border border-blue-600 rounded hover:bg-blue-600 focus:outline-none">Save</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-300 text-gray-700 p-1 border border-gray-400 rounded hover:bg-gray-400 focus:outline-none">Cancel</button>
                  </div>
                ) : (
                  <div>
                    <button onClick={() => handleEdit(transaction.id)} className="px-2 py-1 bg-blue-500 text-white rounded mr-2">Edit</button>
                    <button onClick={() => handleDelete(transaction.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td className="border p-2" colSpan={5}>No transactions available</td>
            </tr>
          )}
          <tr className="bg-gray-200">
            <td className="border p-2">Total Pemasukan</td>
            <td className="border p-2">{totalPemasukan.toLocaleString()}</td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
          </tr>
          <tr className="bg-gray-200">
            <td className="border p-2">Total Pengeluaran</td>
            <td className="border p-2">{totalPengeluaran.toLocaleString()}</td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
          </tr>
          <tr className="bg-gray-200">
            <td className="border p-2">Hasil</td>
            <td className="border p-2">{hasil >= 0 ? `${hasil.toLocaleString()}` : `-${Math.abs(hasil).toLocaleString()}`}</td>
            <td className="border p-2">{hasil >= 0 ? 'untung' : 'rugi'}</td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;