import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import { createTransaction } from '../../services/service';
import moment from 'moment';
import 'moment/locale/id';

moment.locale('id');

interface TransactionFormData {
  description: string;
  amount: string;
  category: string;
  date: string;
}

const TransactionForm: React.FC<{ isOpen: boolean; closeModal: () => void }> = ({ isOpen, closeModal }) => {
  const currentDate = moment();
  const [formData, setFormData] = useState<TransactionFormData>({
    description: '',
    amount: '',
    category: localStorage.getItem('lastTransactionCategory') || 'Pemasukan',
    date: currentDate.format('YYYY-MM-DD HH:mm')
  });

  useEffect(() => {
    const savedIsOpen = localStorage.getItem('isTransactionFormOpen');
    if (savedIsOpen === 'true') {
      isOpen && closeModal();
    }
  }, [isOpen, closeModal]);
  useEffect(() => {
    const lastTransactionCategory = localStorage.getItem('lastTransactionCategory');
    if (lastTransactionCategory) {
      setFormData((prevData) => ({ ...prevData, category: lastTransactionCategory }));
    }
  }, []);

  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const handleCategoryChange = (category: string) => {
    setFormData({ ...formData, category });
    localStorage.setItem('lastTransactionCategory', category);
  };

  const handleAmountChange = (amount: string) => {
    const cleanedAmount = amount.replace(/[^\d.]/g, '');
    let formattedAmount = cleanedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const decimalIndex = formattedAmount.indexOf('.');
    if (decimalIndex !== -1) {
      const decimalPortion = formattedAmount.slice(decimalIndex + 1);
      if (decimalPortion.length === 1) {
        formattedAmount += '00';
      }
    }

    setFormData(prevData => ({ ...prevData, amount: formattedAmount }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    if (name === 'amount') {
      handleAmountChange(value);
    } else if (name === 'date') {
      const selectedDate = moment(value, 'YYYY-MM-DDTHH:mm'); // Format input datetime-local
      const adjustedDate = selectedDate.format('YYYY-MM-DD HH:mm:ss');
  
      setFormData((prevData) => ({ ...prevData, date: adjustedDate }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };
  

  const handleFocusChange = () => {
    if (amountInputRef.current) {
      amountInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!formData.description.trim() || !formData.category.trim() || !formData.amount.trim() || !formData.date.trim()) {
        alert('Please fill in all fields');
        return;
      }
  
      const transactionData = {
        description: formData.description,
        amount: parseFloat(formData.amount.replace(',', '')), // Konversi amount menjadi number dan hapus koma
        category: formData.category,
        date: formData.date
      };
  
      await createTransaction(transactionData);
      setFormData({
        description: '',
        amount: '',
        category: localStorage.getItem('lastTransactionCategory') || 'Pemasukan',
        date: moment().format('YYYY-MM-DDTHH:mm') // Gunakan tanggal saat ini dengan format yang sesuai
      });
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save transaction. Please try again.');
    }
  };
  

  const handleFixedExpenseSelect = () => {
    const fixedExpenseFormData = {
      description: 'Gaji',
      amount: '50,000',
      category: 'Pengeluaran',
      date: formData.date,
    };

    localStorage.setItem('transactionFormData', JSON.stringify(fixedExpenseFormData));

    setFormData({ ...fixedExpenseFormData, category: formData.category });
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={closeModal} className="modal" contentLabel="Transaction Modal" style={{
      content: { width: '32%', height: 'fit-content', margin: 'auto', marginTop: '3%', backgroundColor: 'rgb(255 255 255)' }, overlay: {
        backgroundColor: 'rgb(131 131 131 / 34%)',
      },
    }}>
      <div className="modal-content p-4 rounded">
        <button onClick={closeModal} className="close-btn">×</button>
        <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
          <div className="mb-4 flex justify-between">
            <button
              type="button"
              className={`p-2 rounded focus:outline-none ${formData.category === 'Pemasukan' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
              onClick={() => handleCategoryChange('Pemasukan')}
            >
              Pemasukan
            </button>
            <button
              type="button"
              className={`p-2 rounded focus:outline-none ${formData.category === 'Pengeluaran' ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'}`}
              onClick={() => handleCategoryChange('Pengeluaran')}
            >
              Pengeluaran
            </button>
          </div>
          <div className="mb-4 relative flex">
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              required
              ref={descriptionInputRef}
              className="w-full p-2 border border-gray-300 rounded pr-8"
            />
            {formData.category === 'Pengeluaran' && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button
                  type="button"
                  className="focus:outline-none"
                  onClick={handleFixedExpenseSelect}
                >
                  <svg
                    className="h-6 w-6 text-gray-400 hover:text-gray-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 5.293a1 1 0 011.414 0L10 6.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414zM6 8a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-8a1 1 0 00-1-1H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="mb-4">
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              onFocus={handleFocusChange}
              placeholder="Amount"
              required
              ref={amountInputRef}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={closeModal} className="mr-2 bg-gray-500 text-white px-4 py-2 rounded focus:outline-none">Cancel</button>
            <button
              type="submit"
              className={` ${formData.category === 'Pemasukan' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'} text-white px-4 py-2 rounded focus:outline-none focus:shadow-outline`}
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TransactionForm;