import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getAllTransactions } from '../../services/service';
import moment from 'moment';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Props = {
  filterType: string;
  selectedStartDate: moment.Moment | null;
  selectedEndDate: moment.Moment | null;
};

const ProfitLossChart: React.FC<Props> = ({ filterType, selectedStartDate, selectedEndDate }) => {
  const [data, setData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  }>({
    labels: [],
    datasets: [
      {
        label: 'Profit/Rugi',
        data: [],
        backgroundColor: '',
      },
    ],
  });

  useEffect(() => {    
    const fetchData = async () => {
      try {
        const transactions: any[] = await getAllTransactions();
        let labels: string[] = [];
        let profit: number[] = [];
        let loss: number[] = [];

        if (filterType === 'daily') {
          // Jika filterType adalah 'daily', tidak menampilkan chart
          setData({
            labels: [],
            datasets: [],
          });
          return;
        }

        // Jika filterType adalah 'weekly'
        if (filterType === 'weekly') {
          if (!selectedStartDate || !selectedEndDate) return;

          let currentDate = moment(selectedStartDate);
          const endDate = moment(selectedEndDate);
          while (currentDate.isSameOrBefore(endDate)) {
            labels.push(currentDate.format('DD/MM/YYYY'));
            const transactionsAtDay = transactions.filter((transaction: any) => moment(transaction.date).isSame(currentDate, 'day'));
            const dailyProfit = transactionsAtDay.reduce((total: number, transaction: any) => {
              return transaction.category === 'Pemasukan' ? total + transaction.amount : total;
            }, 0);
            const dailyLoss = transactionsAtDay.reduce((total: number, transaction: any) => {
              return transaction.category !== 'Pemasukan' ? total + transaction.amount : total;
            }, 0);
            profit.push(dailyProfit);
            loss.push(dailyLoss);
            currentDate = currentDate.add(1, 'day');
          }
        }

        // Jika filterType adalah 'monthly'
        if (filterType === 'monthly') {
          const startDateOfMonth = moment(selectedStartDate).startOf('month');
          const endDateOfMonth = moment(selectedStartDate).endOf('month');

          let currentDate = moment(startDateOfMonth);
          while (currentDate.isSameOrBefore(endDateOfMonth, 'day')) {
            labels.push(currentDate.format('DD/MM/YYYY'));
            const transactionsAtDay = transactions.filter((transaction: any) => moment(transaction.date).isSame(currentDate, 'day'));
            const dailyProfit = transactionsAtDay.reduce((total: number, transaction: any) => {
              return transaction.category === 'Pemasukan' ? total + transaction.amount : total;
            }, 0);
            const dailyLoss = transactionsAtDay.reduce((total: number, transaction: any) => {
              return transaction.category !== 'Pemasukan' ? total + transaction.amount : total;
            }, 0);
            profit.push(dailyProfit);
            loss.push(dailyLoss);
            currentDate = currentDate.add(1, 'day');
          }
        }

        // Jika filterType adalah 'yearly'
        if (filterType === 'yearly') {
          for (let i = 0; i < 12; i++) {
            const startDateOfMonth = moment(selectedStartDate).startOf('year').month(i);
            const endDateOfMonth = moment(selectedStartDate).endOf('year').month(i);

            let currentDate = moment(startDateOfMonth);
            while (currentDate.isSameOrBefore(endDateOfMonth, 'month')) {
              const transactionsAtDay = transactions.filter((transaction: any) => moment(transaction.date).isSame(currentDate, 'month'));
              const dailyProfit = transactionsAtDay.reduce((total: number, transaction: any) => {
                return transaction.category === 'Pemasukan' ? total + transaction.amount : total;
              }, 0);
              const dailyLoss = transactionsAtDay.reduce((total: number, transaction: any) => {
                return transaction.category !== 'Pemasukan' ? total + transaction.amount : total;
              }, 0);
              profit.push(dailyProfit);
              loss.push(dailyLoss);
              currentDate = currentDate.add(1, 'month');
            }
            // Tambahkan label bulan dalam format singkat (Jan, Feb, dst.)
            labels.push(startDateOfMonth.format('MMM'));
          }
        }

        // Menghitung total pemasukan dan pengeluaran untuk setiap bulan
        for (let i = 0; i < labels.length; i++) {
          const transactionsAtMonth = transactions.filter((transaction: any) => moment(transaction.date).format('MMM') === labels[i]);
          const totalProfit: number = transactionsAtMonth.reduce((total: number, transaction: any) => {
            return transaction.category === 'Pemasukan' ? total + transaction.amount : total;
          }, 0);
          const totalLoss: number = transactionsAtMonth.reduce((total: number, transaction: any) => {
            return transaction.category !== 'Pemasukan' ? total + transaction.amount : total;
          }, 0);
          profit.push(totalProfit);
          loss.push(totalLoss);
        }

       // Menghitung hasil (untung/rugi) untuk setiap bulan
const results: number[] = profit.map((profit: number, index: number) => profit - loss[index]);
const untung: number[] = results.map((result: number) => result >= 0 ? result : 0); // Hanya nilai positif untuk "Untung"
const rugi: number[] = results.map((result: number) => result < 0 ? result : 0); // Hanya nilai negatif (dikonversi menjadi positif) untuk "Rugi"

setData({
  labels,
  datasets: [
    {
      label: 'Untung',
      data: untung, // Hanya nilai positif untuk "Untung"
      backgroundColor: 'rgba(54, 162, 235, 1)', // Warna biru untuk "Untung"
    },
    {
      label: 'Rugi',
      data: rugi, // Hanya nilai negatif (dikonversi menjadi positif) untuk "Rugi"
      backgroundColor: 'rgba(255, 99, 132, 1)', // Warna merah untuk "Rugi"
    },
  ],
});   
    

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [filterType, selectedStartDate, selectedEndDate]);

  return (
    <div>
      {filterType !== 'daily' && (
        <Bar
        data={data}
        options={{
          maintainAspectRatio: false, // Chart tidak mempertahankan rasio aspek
          responsive: true, // Chart merespons perubahan ukuran
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Amount',
              },
              ticks: {
                callback: (value) => {
                  return value.toLocaleString(); // Mengubah nilai menjadi format koma
                },
              },
            },
          },
        }}
        style={{ height: '400px', width: '100%' }} // Atur tinggi chart secara eksplisit
      />      
      )}
    </div>
  );
};

export default ProfitLossChart;