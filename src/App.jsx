import axios from 'axios';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'; // Import necessary Chart.js components
import { Loading02Icon, Xls01Icon } from 'hugeicons-react';
import { React, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2'; // Import Bar from react-chartjs-2
import { Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx'; // Add this line to import the xlsx library
import './App.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Private = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('https://api-survey-jhon-brooke.vercel.app/api/surveys')
      .then((res) => {
        setSurveys(res.data);
        console.log(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatTime = (time) => {
    if (time === '-') return time;
    return parseFloat(time).toFixed(1);
  };

  const calculateAverageTimeTaken = () => {
    const totalTimeTaken = Array(10).fill(0);
    const countResponses = Array(10).fill(0);

    surveys.forEach((survey) => {
      const timeTakenArray = Array(10).fill('-');
      survey.responses.forEach((response) => {
        const qId = parseInt(response.questionId);
        timeTakenArray[qId] = response.timeTaken;
      });

      timeTakenArray.forEach((time, index) => {
        if (time !== '-') {
          totalTimeTaken[index] += parseFloat(time);
          countResponses[index] += 1;
        }
      });
    });

    return totalTimeTaken.map((total, index) =>
      countResponses[index] > 0 ? (total / countResponses[index]).toFixed(1) : '-'
    );
  };

  const calculateAverageAnswer = () => {
    const totalAnswer = Array(10).fill(0);
    const countResponses = Array(10).fill(0);

    surveys.forEach((survey) => {
      const answerArray = Array(10).fill('-');
      survey.responses.forEach((response) => {
        const qId = parseInt(response.questionId);
        answerArray[qId] = response.answer;
      });

      answerArray.forEach((answer, index) => {
        if (answer !== '-') {
          totalAnswer[index] += parseFloat(answer);
          countResponses[index] += 1;
        }
      });
    });

    return totalAnswer.map((total, index) =>
      countResponses[index] > 0 ? (total / countResponses[index]).toFixed(1) : '-'
    );
  };

  const avgTimeTaken = surveys.length > 0 ? calculateAverageTimeTaken() : Array(10).fill('-');
  const avgAnswer = surveys.length > 0 ? calculateAverageAnswer() : Array(10).fill('-');

  // Data for Bar Chart (Average Time Taken)
  const timeTakenChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10'],
    datasets: [
      {
        label: 'Rata-rata Waktu (detik)',
        data: avgTimeTaken.map((val) => (val === '-' ? 0 : parseFloat(val))),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Data for Bar Chart (Average Answer)
  const answerChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10'],
    datasets: [
      {
        label: 'Rata-rata Nilai',
        data: avgAnswer.map((val) => (val === '-' ? 0 : parseFloat(val))),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart Options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

 // Fungsi untuk export ke Excel
  const exportToExcel = () => {
    // Membuat data untuk Excel
    const exportData = surveys.map((survey, index) => {
      const answer = Array(10).fill('-');
      const timeTakenArray = Array(10).fill('-');

      survey.responses.forEach((response) => {
        const qId = parseInt(response.questionId);
        answer[qId] = parseFloat(response.answer) || 0;
        timeTakenArray[qId] = parseFloat(response.timeTaken) || 0;
      });

      return {
        Responden: `R${index + 1}`,
        Q1: answer[0] !== '-' ? answer[0] : '-',
        Q2: answer[1] !== '-' ? answer[1] : '-',
        Q3: answer[2] !== '-' ? answer[2] : '-',
        Q4: answer[3] !== '-' ? answer[3] : '-',
        Q5: answer[4] !== '-' ? answer[4] : '-',
        Q6: answer[5] !== '-' ? answer[5] : '-',
        Q7: answer[6] !== '-' ? answer[6] : '-',
        Q8: answer[7] !== '-' ? answer[7] : '-',
        Q9: answer[8] !== '-' ? answer[8] : '-',
        Q10: answer[9] !== '-' ? answer[9] : '-',
      };
    });

    // Membuat worksheet dari data
    const ws = XLSX.utils.json_to_sheet(exportData, { skipHeader: true });

    // Menambahkan header secara manual
    const headers = [
      ['Responden', 'Skor asli', '', '', '', '', '', '', '', '', ''], // Row 1: Judul "Skor asli"
      ['', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10'], // Row 2: Kolom Q1-Q10
    ];

    // Menambahkan header ke worksheet
    XLSX.utils.sheet_add_aoa(ws, headers, { origin: 'A1' });

    // Menambahkan data di bawah header
    XLSX.utils.sheet_add_json(ws, exportData, { origin: 'A3', skipHeader: true });

    // Mengatur lebar kolom
    ws['!cols'] = [
      { wch: 15 }, // Responden
      { wch: 10 }, // Q1
      { wch: 10 }, // Q2
      { wch: 10 }, // Q3
      { wch: 10 }, // Q4
      { wch: 10 }, // Q5
      { wch: 10 }, // Q6
      { wch: 10 }, // Q7
      { wch: 10 }, // Q8
      { wch: 10 }, // Q9
      { wch: 10 }, // Q10
    ];

    // Mengatur merge cell untuk "Skor asli"
    ws['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 10 } }, // Merge kolom B1 hingga K1 untuk "Skor asli"
    ];

    // Mengatur alignment menjadi center untuk semua sel
    const range = XLSX.utils.decode_range(ws['!ref']); // Mendapatkan range seluruh worksheet
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = { c: C, r: R };
        const cellRef = XLSX.utils.encode_cell(cellAddress);

        // Jika sel ada isinya
        if (!ws[cellRef]) continue;

        // Tambahkan properti style untuk alignment center
        ws[cellRef].s = {
          alignment: {
            horizontal: 'center',
            vertical: 'center',
          },
        };
      }
    }

    // Membuat workbook dan menambahkan worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Survey Results');

    // Export file
    XLSX.writeFile(wb, `Survey_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  
  if (loading) {
    return <div className="container2">Memuat data...</div>;
  }

  return (
    <div className="container3">
      <h3>Responden: {surveys.length} orang</h3>

      <div className='line'></div>

      <div className="wrap-chart">
        {/* Bar Chart for Average Time Taken */}
        <div className='child-chart'>
          <h4 className="title2">Grafik Rata-rata Waktu</h4>
          <div style={{ width: '88%', height: '88%', margin: '0 auto 40px' }}>
            <Bar
              data={timeTakenChartData}
              options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Rata-rata Waktu per Pertanyaan' } } }}
            />
          </div>
        </div>
        <div className='child-chart'>
          {/* Bar Chart for Average Answer */}
          <h4 className="title2">Grafik Rata-rata Nilai</h4>
          <div style={{ width: '88%', height: '88%', margin: '0 auto 40px' }}>
            <Bar
              data={answerChartData}
              options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Rata-rata Nilai per Pertanyaan' } } }}
            />
          </div>
        </div>
      </div>

      {/* <div className='line'></div> */}

      <h4 className="title">Waktu (AVG)</h4>
      <table className="survey-table">
        <thead>
          <tr>
            <th>Q1</th>
            <th>Q2</th>
            <th>Q3</th>
            <th>Q4</th>
            <th>Q5</th>
            <th>Q6</th>
            <th>Q7</th>
            <th>Q8</th>
            <th>Q9</th>
            <th>Q10</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Q1: {avgTimeTaken[0]} dtk</td>
            <td>Q2: {avgTimeTaken[1]} dtk</td>
            <td>Q3: {avgTimeTaken[2]} dtk</td>
            <td>Q4: {avgTimeTaken[3]} dtk</td>
            <td>Q5: {avgTimeTaken[4]} dtk</td>
            <td>Q6: {avgTimeTaken[5]} dtk</td>
            <td>Q7: {avgTimeTaken[6]} dtk</td>
            <td>Q8: {avgTimeTaken[7]} dtk</td>
            <td>Q9: {avgTimeTaken[8]} dtk</td>
            <td>Q10: {avgTimeTaken[9]} dtk</td>
          </tr>
        </tbody>
      </table>

      <h4 className="title">Nilai Rata-rata</h4>
      <table className="survey-table">
        <thead>
          <tr>
            <th>Q1</th>
            <th>Q2</th>
            <th>Q3</th>
            <th>Q4</th>
            <th>Q5</th>
            <th>Q6</th>
            <th>Q7</th>
            <th>Q8</th>
            <th>Q9</th>
            <th>Q10</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Q1: {avgAnswer[0]}</td>
            <td>Q2: {avgAnswer[1]}</td>
            <td>Q3: {avgAnswer[2]}</td>
            <td>Q4: {avgAnswer[3]}</td>
            <td>Q5: {avgAnswer[4]}</td>
            <td>Q6: {avgAnswer[5]}</td>
            <td>Q7: {avgAnswer[6]}</td>
            <td>Q8: {avgAnswer[7]}</td>
            <td>Q9: {avgAnswer[8]}</td>
            <td>Q10: {avgAnswer[9]}</td>
          </tr>
        </tbody>
      </table>

      <div className='wrap-title'>
        <h4>Data lengkap</h4>
        <button 
          onClick={exportToExcel}
          style={{
            padding: '10px 10px 6px 10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          <Xls01Icon />
        </button>
      </div>

      <table className="survey-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Q1</th>
            <th>Q2</th>
            <th>Q3</th>
            <th>Q4</th>
            <th>Q5</th>
            <th>Q6</th>
            <th>Q7</th>
            <th>Q8</th>
            <th>Q9</th>
            <th>Q10</th>
            <th>(A)</th>
            <th>(S)</th>
          </tr>
        </thead>
        <tbody>
          {surveys.map((survey, index) => {
            const answer = Array(10).fill('-');
            survey.responses.forEach((response) => {
              const qId = parseInt(response.questionId);
              answer[qId] = parseFloat(response.answer) || 0;
            });

            const timeTakenArray = Array(10).fill('-');
            survey.responses.forEach((response) => {
              const qId = parseInt(response.questionId);
              timeTakenArray[qId] = parseFloat(response.timeTaken) || 0;
            });

            // Hitung rata-rata jawaban
            const validAnswers = answer.filter(a => typeof a === 'number');
            const averageAnswer = validAnswers.length > 0 ? (validAnswers.reduce((a, b) => a + b, 0) / validAnswers.length).toFixed(2) : '-';

            // Hitung rata-rata waktu
            const validTimes = timeTakenArray.filter(t => typeof t === 'number');
            const averageTime = validTimes.length > 0 ? (validTimes.reduce((a, b) => a + b, 0) / validTimes.length).toFixed(2) : '-';

            return (
              <tr key={survey._id}>
                <td>{survey.name} <br /> ({survey.profession})</td>
                {timeTakenArray.map((time, i) => (
                  <td style={{ textAlign: 'center' }} key={i}>
                    ({answer[i]}) <br /> {formatTime(time)} dtk
                  </td>
                ))}
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{averageAnswer}</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{averageTime}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

    </div>
  );
};

// Komponen Halaman Terima Kasih (tidak diubah)
const ThankYouPage = () => {
  return (
    <div className="container">
      <div className="form-container">
        <h2>Terima Kasih!</h2>
        <p>Survey Anda telah selesai. Terima kasih atas partisipasinya!</p>
      </div>
    </div>
  );
};

// Komponen Utama App (tidak diubah)
function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9));
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [isFormStarted, setIsFormStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('https://api-survey-jhon-brooke.vercel.app/api/questions')
      .then(res => setQuestions(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleStart = (e) => {
    e.preventDefault();
    if (name.trim() && profession.trim()) {
      setIsFormStarted(true);
      setStartTime(Date.now());
    } else {
      alert('Tolong isi nama dan profesi anda');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!answer) {
      alert('Silakan pilih salah satu jawaban sebelum melanjutkan!');
      return;
    }

    setIsLoading(true);
    const timeTaken = (Date.now() - startTime) / 1000;

    try {
      await axios.post('https://api-survey-jhon-brooke.vercel.app/api/submit', {
        userId,
        name,
        profession,
        questionId: currentQuestion,
        answer,
        timeTaken
      });

      console.log(`Pertanyaan ${currentQuestion + 1} - ${timeTaken} detik`);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setAnswer('');
        setStartTime(Date.now());
      } else {
        navigate('/thank-you');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (questions.length === 0) return <div className='container2'>Tunggu sebentar...</div>;

  if (!isFormStarted) {
    return (
      <div className="container">
        <div className="form-container">
          <h2>System Usability Scale - SIGEO</h2>
          <form onSubmit={handleStart}>
            <div className="input-group">
              <label htmlFor="name">Nama:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Masukan nama anda"
              />
            </div>
            <div className="input-group">
              <label htmlFor="profession">Profesi:</label>
              <input
                type="text"
                id="profession"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                required
                placeholder="contoh: Mahasiswa"
              />
            </div>
            <button type="submit">Mulai Survey</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="form-container">
        <h2>System Usability SIGEO</h2>
        <p>Nama: {name} | Profesi: {profession}</p>
        <p>Jumlah pertanyaan 1-10</p>
        <div className='border'></div>
        <div className="scale">1 = Sangat Tidak Setuju</div>
        <div className="scale">2 = Tidak Setuju</div>
        <div className="scale">3 = Netral</div>
        <div className="scale">4 = Setuju</div>
        <div className="scale">5 = Sangat Setuju</div>
        <form onSubmit={handleSubmit}>
          <div className="question-card">
            <p>{currentQuestion + 1}. {questions[currentQuestion].text}</p>
            <div className="radio-group">
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value}>
                  <input
                    type="radio"
                    value={value}
                    checked={answer === value.toString()}
                    onChange={(e) => setAnswer(e.target.value)}
                    required
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className={!answer || isLoading ? 'bg-disabled' : ''}
            disabled={!answer || isLoading}
          >
            {isLoading ? (
              <>
                <Loading02Icon className="spin" size={20} />
                <p className='wait'>Menunggu</p>
              </>
            ) : (
              currentQuestion === questions.length - 1 ? 'Selesai' : 'Simpan'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Komponen Router Utama
function MainApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/private/results" element={<Private />} />
      </Routes>
    </Router>
  );
}

export default MainApp;