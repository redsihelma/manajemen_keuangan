import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment'; // Tambahkan import untuk moment
import TransactionList from './../Dashboard/TransactionList';
import { useAuth } from './../../contexts/AuthContext';
import { getAllTransactions, deleteTransaction, updateTransaction } from './../../services/service';
import ProfitLossChart from './ProfitLossChart';

const FinancialReport: React.FC = () => {
    const [selectedType, setSelectedType] = useState<string>('all');
    const [editingId, setEditingId] = useState<number | null>(null);
    const navigate = useNavigate();
    const { logout } = useAuth();
    const currentDate = moment();

    const [selectedStartDate, setSelectedStartDate] = useState<moment.Moment | null>(currentDate);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filterType, setFilterType] = useState<string>('daily');
    const [selectedEndDate, setSelectedEndDate] = useState<moment.Moment | null>(moment());
    const [editedTransaction, setEditedTransaction] = useState<any>({
        description: '',
        amount: 0,
        category: localStorage.getItem('lastTransactionType') || 'pemasukan',
        date: currentDate.format('YYYY-MM-DD HH:mm:ss')
    });
    const filteredTransactions = useMemo(() => {
        switch (filterType) {
            case 'daily':
                return transactions.filter(transaction => {
                    const transactionDate = moment(transaction.date);
                    return transactionDate.isSame(selectedStartDate, 'day');
                }).filter(transaction => selectedType === 'all' || transaction.category === selectedType); // Memfilter transaksi berdasarkan jenis transaksi yang dipilih
            case 'weekly':
                return transactions.filter(transaction => {
                    const transactionDate = moment(transaction.date);
                    return transactionDate.isBetween(selectedStartDate, selectedEndDate, 'day', '[]');
                }).filter(transaction => selectedType === 'all' || transaction.category === selectedType); // Memfilter transaksi berdasarkan jenis transaksi yang dipilih
            case 'monthly':
                return transactions.filter(transaction => {
                    const transactionDate = moment(transaction.date);
                    return selectedStartDate && transactionDate.month() === selectedStartDate!.month();
                }).filter(transaction => selectedType === 'all' || transaction.category === selectedType); // Memfilter transaksi berdasarkan jenis transaksi yang dipilih
            case 'yearly':
                return transactions.filter(transaction => {
                    const transactionDate = moment(transaction.date);
                    return selectedStartDate && transactionDate.year() === selectedStartDate!.year();
                }).filter(transaction => selectedType === 'all' || transaction.category === selectedType); // Memfilter transaksi berdasarkan jenis transaksi yang dipilih
            default:
                return transactions.filter(transaction => selectedType === 'all' || transaction.category === selectedType); // Memfilter transaksi berdasarkan jenis transaksi yang dipilih
        }
    }, [transactions, filterType, selectedStartDate, selectedEndDate, selectedType]);



    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const data = await getAllTransactions();
                data.sort((a: any, b: any) => moment(b.date).diff(moment(a.date)));
                setTransactions(data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        fetchTransactions();
    }, []);

    const handleUpdate = async () => {
        try {
            if (!editedTransaction.description || !editedTransaction.amount || !editedTransaction.category || !editedTransaction.date) {
                alert('Please fill in all fields');
                return;
            }

            // Format tanggal yang dipilih menjadi format yang sesuai dengan database
            const formattedDate = moment(editedTransaction.date).format('YYYY-MM-DD HH:mm:ss');
            const updatedTransaction = { ...editedTransaction, date: formattedDate };

            console.log('Updating transaction:', updatedTransaction);

            await updateTransaction(editingId!, updatedTransaction);
            const updatedData = await getAllTransactions();
            updatedData.sort((a: any, b: any) => moment(b.date).diff(moment(a.date)));
            setTransactions(updatedData);
            setEditingId(null);
        } catch (error) {
            console.error('Error updating transaction:', error);
            alert('Failed to update transaction. Please try again.');
        }
    };


    const handleEdit = (id: number) => {
        setEditingId(id);
        const transactionToEdit = transactions.find(transaction => transaction.id === id);
        if (transactionToEdit) {
            // Tanggal dari transaksi yang diedit harus diubah menjadi format yang sesuai sebelum ditetapkan pada state editedTransaction
            const editedDate = moment(transactionToEdit.date).format('YYYY-MM-DD HH:mm:ss');
            setEditedTransaction({ ...transactionToEdit, date: editedDate });
        }
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
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedTransaction({ ...editedTransaction, [name]: value });
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterType(event.target.value);
        setSelectedStartDate(null);
        setSelectedEndDate(null);
    };

    const renderDatePicker = () => {
        switch (filterType) {
            case 'daily':
                return (
                    <DatePicker
                        selected={selectedStartDate?.toDate()}
                        onChange={(date: Date | null) => setSelectedStartDate(date ? moment(date) : null)}
                        dateFormat="dd/MM/yyyy"
                        className="p-2 border rounded"
                    />
                );
            case 'weekly':
                return (
                    <div className="flex">
                        <DatePicker
                            selected={selectedStartDate?.toDate()}
                            onChange={(date: Date | null) => setSelectedStartDate(date ? moment(date) : null)}
                            dateFormat="dd/MM/yyyy"
                            className="p-2 border rounded mr-2"
                            selectsStart
                            startDate={selectedStartDate?.toDate()}
                            endDate={selectedEndDate?.toDate()}
                            placeholderText="Start Date"
                        />
                        <DatePicker
                            selected={selectedEndDate?.toDate()}
                            onChange={(date: Date | null) => setSelectedEndDate(date ? moment(date) : null)}
                            dateFormat="dd/MM/yyyy"
                            className="p-2 border rounded"
                            selectsEnd
                            startDate={selectedStartDate?.toDate()}
                            endDate={selectedEndDate?.toDate()}
                            minDate={selectedStartDate?.toDate()}
                            placeholderText="End Date"
                        />
                    </div>
                );
            case 'monthly':
                return (
                    <DatePicker
                        selected={selectedStartDate?.toDate()}
                        onChange={(date: Date | null) => setSelectedStartDate(date ? moment(date) : null)}
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                        className="p-2 border rounded"
                    />
                );
            case 'yearly':
                return (
                    <DatePicker
                        selected={selectedStartDate?.toDate()}
                        onChange={(date: Date | null) => setSelectedStartDate(date ? moment(date) : null)}
                        showYearPicker
                        dateFormat="yyyy"
                        className="p-2 border rounded"
                    />
                );
            default:
                return null;
        }
    };

    const totalPemasukan = filteredTransactions.reduce((total, transaction) => {
        if (transaction.category === 'Pemasukan') {
            return total + transaction.amount;
        }
        return total;
    }, 0);

    const totalPengeluaran = filteredTransactions.reduce((total, transaction) => {
        if (transaction.category === 'Pengeluaran') {
            return total + transaction.amount;
        }
        return total;
    }, 0);

    const renderDailyTable = () => {
        // Filter transactions based on selected start date
        const filteredTransactionsByDay = filteredTransactions.filter(transaction =>
            moment(transaction.date).isSame(selectedStartDate, 'day')
        );
        const hasil = totalPemasukan - totalPengeluaran;

        // Render table for daily transactions
        return (
            <table className="w-full border-collapse border border-gray-300 mt-4">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Date</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2">Category</th>
                        <th className="border p-2">Amount</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransactionsByDay.map(transaction => (
                        <tr key={transaction.id} className="hover:bg-gray-100">
                            <td className="border p-2">
                                {editingId === transaction.id ? (
                                    <input type="datetime-local" name="date" value={editedTransaction.date} onChange={handleChange} required className="p-1 border border-gray-300" />
                                ) : (
                                    transaction.date || '---'
                                )}
                            </td>

                            <td className="border p-2">
                                {editingId === transaction.id ? (
                                    <input type="text" name="description" value={editedTransaction.description} onChange={handleChange} placeholder="Description" required className="p-1 border border-gray-300" />
                                ) : (
                                    transaction.description || '---'
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
                                    <input type="text" name="amount" value={editedTransaction.amount} onChange={handleChange} placeholder="Amount" required className="p-1 border border-gray-300" />
                                ) : (
                                    transaction.amount.toLocaleString('en-US') || '---'
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
                    <tr className="bg-gray-200">
                        <td className="border p-2">Hasil</td>
                        <td className="border p-2">{hasil >= 0 ? `${hasil.toLocaleString()}` : `-${Math.abs(hasil).toLocaleString()}`}</td>
                        <td className="border p-2">{hasil >= 0 ? 'untung' : 'rugi'}</td>
                        <td className="border p-2"></td>
                        <td className="border p-2"></td>
                    </tr>
                </tbody>
            </table>
        );
    };


    const renderWeeklyTable = () => {
        const startDate = selectedStartDate ?? moment();
        const weeklyData: Record<string, { totalPemasukan: number; totalPengeluaran: number; hasil: number }> = {};

        let currentDate = startDate.clone().startOf('week');
        const endDate = startDate.clone().endOf('week');

        while (currentDate.isSameOrBefore(endDate, 'day')) {
            const filteredTransactionsByDay = filteredTransactions.filter(transaction =>
                moment(transaction.date).isSame(currentDate, 'day')
            );

            const totalPemasukan = filteredTransactionsByDay.reduce((total, transaction) => {
                return transaction.category === 'Pemasukan' ? total + transaction.amount : total;
            }, 0);

            const totalPengeluaran = filteredTransactionsByDay.reduce((total, transaction) => {
                return transaction.category === 'Pengeluaran' ? total + transaction.amount : total;
            }, 0);

            const hasil = totalPemasukan - totalPengeluaran;

            weeklyData[currentDate.format('YYYY-MM-DD')] = {
                totalPemasukan,
                totalPengeluaran,
                hasil
            };

            // Lanjutkan ke hari berikutnya
            currentDate = currentDate.clone().add(1, 'day');
        }
        const hasil = totalPemasukan - totalPengeluaran;

        // Render tabel weekly
        return (
            <table className="w-full border-collapse border border-gray-300 mt-4">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Date</th>
                        <th className="border p-2">Total Pemasukan</th>
                        <th className="border p-2">Total Pengeluaran</th>
                        <th className="border p-2">Hasil</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(weeklyData).map(([date, data]) => (
                        <tr key={date} className="hover:bg-gray-200">
                            <td className="border p-2">{moment(date).format('DD/MM/yyyy')}</td>
                            <td className="border p-2">{data.totalPemasukan.toLocaleString()}</td>
                            <td className="border p-2">{data.totalPengeluaran.toLocaleString()}</td>
                            <td className="border p-2">{data.hasil.toLocaleString()}</td>
                        </tr>
                    ))}
                    <tr className="bg-gray-200">
                        <td className="border p-2">Hasil</td>
                        <td className="border p-2">{hasil >= 0 ? `${hasil.toLocaleString()}` : `-${Math.abs(hasil).toLocaleString()}`}</td>
                        <td className="border p-2">{hasil >= 0 ? 'untung' : 'rugi'}</td>
                        <td className="border p-2"></td>
                    </tr>
                </tbody>
            </table>
        );
    };


    const renderMonthlyTable = () => {
        // Filter transactions based on selected month and year
        const selectedMonthYearTransactions = filteredTransactions.filter(transaction =>
            moment(transaction.date).isSame(selectedStartDate, 'month')
        );

        // Inisialisasi tanggal awal dan akhir untuk iterasi dalam bulan yang dipilih
        const startDate = selectedStartDate?.clone().startOf('month');
        const endDate = selectedStartDate?.clone().endOf('month');

        // Inisialisasi objek untuk menyimpan hasil (profit/loss) per hari dan total pemasukan dan pengeluaran
        const dailyResults: Record<string, { hasil: string; totalPemasukan: string; totalPengeluaran: string }> = {};

        // Pengecekan apakah startDate dan endDate nullish menggunakan nullish coalescing
        if (startDate && endDate) {
            // Iterasi melalui setiap hari dalam bulan yang dipilih
            let currentDate = startDate.clone();
            while (currentDate.isSameOrBefore(endDate, 'day')) {
                // Filter transaksi untuk hari tertentu
                const transactionsForDay = selectedMonthYearTransactions.filter(transaction =>
                    moment(transaction.date).isSame(currentDate, 'day')
                );

                // Hitung total pemasukan dan pengeluaran untuk hari tersebut
                let totalPemasukan = 0;
                let totalPengeluaran = 0;
                transactionsForDay.forEach(transaction => {
                    if (transaction.category === 'Pemasukan') {
                        totalPemasukan += transaction.amount;
                    } else if (transaction.category === 'Pengeluaran') {
                        totalPengeluaran += transaction.amount;
                    }
                });

                // Hitung hasil (profit/loss) per hari
                const hasil = (totalPemasukan - totalPengeluaran).toLocaleString();
                const formattedPemasukan = totalPemasukan.toLocaleString();
                const formattedPengeluaran = totalPengeluaran.toLocaleString();

                // Simpan data per hari dalam objek dailyResults
                dailyResults[currentDate.format('YYYY-MM-DD')] = {
                    hasil,
                    totalPemasukan: formattedPemasukan,
                    totalPengeluaran: formattedPengeluaran
                };

                // Lanjut ke hari berikutnya
                currentDate = currentDate.clone().add(1, 'day');
            }
        }
        const hasil = totalPemasukan - totalPengeluaran;

        // Render tabel dengan data per hari, total pemasukan, total pengeluaran, dan hasil per hari
        return (
            <table className="w-full border-collapse border border-gray-300 mt-4">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Date</th>
                        <th className="border p-2">Total Pemasukan</th>
                        <th className="border p-2">Total Pengeluaran</th>
                        <th className="border p-2">Hasil</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(dailyResults).map(([date, { hasil, totalPemasukan, totalPengeluaran }]) => (
                        <tr key={date} className="hover:bg-gray-200">
                            <td className="border p-2">{moment(date).format('DD/MM/yyyy')}</td>
                            <td className="border p-2">{totalPemasukan}</td>
                            <td className="border p-2">{totalPengeluaran}</td>
                            <td className="border p-2">{hasil}</td>
                        </tr>
                    ))}
                    <tr className="bg-gray-200">
                        <td className="border p-2">Hasil</td>
                        <td className="border p-2">{hasil >= 0 ? `${hasil.toLocaleString()}` : `-${Math.abs(hasil).toLocaleString()}`}</td>
                        <td className="border p-2">{hasil >= 0 ? 'untung' : 'rugi'}</td>
                        <td className="border p-2"></td>
                    </tr>
                </tbody>
            </table>
        );
    };



    const renderYearlyTable = () => {
        // Filter transactions based on selected year
        const selectedYearTransactions = filteredTransactions.filter(transaction => moment(transaction.date).year() === selectedStartDate?.year());

        // Inisialisasi objek untuk menyimpan total pemasukan, total pengeluaran, dan hasil per tahun
        const yearlyData: { [key: string]: { totalPemasukan: number; totalPengeluaran: number; hasil: number } } = {};

        // Hitung total pemasukan, total pengeluaran, dan hasil per tahun
        selectedYearTransactions.forEach(transaction => {
            const monthYear = moment(transaction.date).format('MMMM');
            if (!yearlyData[monthYear]) {
                yearlyData[monthYear] = {
                    totalPemasukan: 0,
                    totalPengeluaran: 0,
                    hasil: 0
                };
            }

            if (transaction.category === 'Pemasukan') {
                yearlyData[monthYear].totalPemasukan += transaction.amount;
            } else if (transaction.category === 'Pengeluaran') {
                yearlyData[monthYear].totalPengeluaran += transaction.amount;
            }
        });
        const hasil = totalPemasukan - totalPengeluaran;

        // Render tabel yearly
        return (
            <table className="w-full border-collapse border border-gray-300 mt-4">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Month</th>
                        <th className="border p-2">Total Pemasukan</th>
                        <th className="border p-2">Total Pengeluaran</th>
                        <th className="border p-2">Hasil</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(yearlyData).map(([monthYear, data]) => (
                        <tr key={monthYear} className="hover:bg-gray-200">
                            <td className="border p-2">{monthYear}</td>
                            <td className="border p-2">{data.totalPemasukan.toLocaleString()}</td>
                            <td className="border p-2">{data.totalPengeluaran.toLocaleString()}</td>
                            <td className="border p-2">{(data.totalPemasukan - data.totalPengeluaran).toLocaleString()}</td>
                        </tr>
                    ))}
                    <tr className="bg-gray-200">
                        <td className="border p-2">Hasil</td>
                        <td className="border p-2">{hasil >= 0 ? `${hasil.toLocaleString()}` : `-${Math.abs(hasil).toLocaleString()}`}</td>
                        <td className="border p-2">{hasil >= 0 ? 'untung' : 'rugi'}</td>
                        <td className="border p-2"></td>
                    </tr>
                </tbody>
            </table>
        );
    };

    const [pemasukanClicked, setPemasukanClicked] = useState<boolean>(false); // Tambah state untuk melacak apakah tombol Pemasukan diklik
    const [pengeluaranClicked, setPengeluaranClicked] = useState<boolean>(false); // Tambah state untuk melacak apakah tombol Pemasukan diklik


    // Fungsi untuk menangani klik tombol Pemasukan
    const handlePemasukanClick = () => {
        if (!pemasukanClicked) {
            setSelectedType('Pemasukan'); // Menetapkan jenis transaksi yang dipilih menjadi 'Pemasukan'
            setPemasukanClicked(true); // Menetapkan state pemasukanClicked menjadi true
        } else {
            setSelectedType('all'); // Kembali menetapkan jenis transaksi yang dipilih menjadi 'all' (semua)
            setPemasukanClicked(false); // Menetapkan state pemasukanClicked menjadi false
        }
    };

    const handlePengeluaranClick = () => {
        if (!pengeluaranClicked) {
            setSelectedType('Pengeluaran'); // Menetapkan jenis transaksi yang dipilih menjadi 'Pengeluaran'
            setPengeluaranClicked(true); // Menetapkan state pengeluaranClicked menjadi true
        } else {
            setSelectedType('all'); // Kembali menetapkan jenis transaksi yang dipilih menjadi 'all' (semua)
            setPengeluaranClicked(false); // Menetapkan state pengeluaranClicked menjadi false
        }
    };



    return (
        <div className="flex flex-col h-screen">
            <header className="bg-blue-500 text-white p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <h1 className="text-xl font-semibold mr-4">My Finance App</h1>
                    <nav>
                        <ul className="flex items-center">
                            <li><Link to="/dashboard" className="px-4 py-2 text-white hover:bg-blue-600 rounded">Dashboard</Link></li>
                            <li><Link to="/financial-report" className="px-4 py-2 text-white hover:bg-blue-600 rounded">Finance Report</Link></li>
                        </ul>
                    </nav>
                </div>
                <button onClick={handleLogout} className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 focus:outline-none">Logout</button>
            </header>
            <div className="container mx-auto p-4 flex-grow">
                <h2 className="text-2xl font-semibold mb-4">Finance Report</h2>
                <div className="flex justify-end mb-4">
                    <button
                        className={`mx-2 px-4 py-2 bg-blue-500 text-white rounded focus:outline-none ${selectedType === 'Pemasukan' ? 'opacity-1000' : 'opacity-50'}`}
                        onClick={handlePemasukanClick}
                    >
                        Pemasukan
                    </button>
                    <button
                        className={`mx-2 px-4 py-2 bg-red-500 text-white rounded focus:outline-none ${selectedType === 'Pengeluaran' ? 'opacity-100' : 'opacity-50'}`}
                        onClick={handlePengeluaranClick}
                    >
                        Pengeluaran
                    </button>
                </div>
                <div className="flex justify-between mb-4">
                    <div className="w-1/3">
                        <select className="p-2 border rounded" value={filterType} onChange={handleFilterChange}>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div className="w-1/3">
                        {renderDatePicker()}
                    </div>
                </div>
                {filterType === 'daily' && renderDailyTable()}
                {filterType === 'weekly' && renderWeeklyTable()}
                {filterType === 'monthly' && renderMonthlyTable()}
                {filterType === 'yearly' && renderYearlyTable()}
                <ProfitLossChart
                    filterType={filterType}
                    selectedStartDate={selectedStartDate || null}
                    selectedEndDate={selectedEndDate || null}
                />

            </div>
        </div>
    );
};
export default FinancialReport;