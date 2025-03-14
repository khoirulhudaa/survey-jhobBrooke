import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import { Loading02Icon } from 'hugeicons-react';

// Komponen Halaman Private (Hasil Survei)
const Private = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil data survei dari server
    axios.get('https://api-survey-jhon-brooke.vercel.app/api/surveys')
      .then(res => {
        setSurveys(res.data);
        console.log(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Fungsi untuk mengubah nilai waktu sedikit
  const formatTime = (time) => {
    if (time === '-') return time; // Jika '-', biarkan tetap '-'
    return parseFloat(time).toFixed(1); // Bulatkan ke 1 desimal
  };

  // Fungsi untuk menghitung rata-rata timeTaken untuk setiap pertanyaan (Q1-Q10)
  const calculateAverageTimeTaken = () => {
    const totalTimeTaken = Array(10).fill(0); // Total waktu untuk Q1-Q10
    const countResponses = Array(10).fill(0); // Jumlah responden yang menjawab Q1-Q10

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

    const averageTimeTaken = totalTimeTaken.map((total, index) => {
      return countResponses[index] > 0 ? (total / countResponses[index]).toFixed(1) : '-';
    });

    return averageTimeTaken;
  };

  // Fungsi untuk menghitung rata-rata answer untuk setiap pertanyaan (Q1-Q10)
  const calculateAverageAnswer = () => {
    const totalAnswer = Array(10).fill(0); // Total jawaban untuk Q1-Q10
    const countResponses = Array(10).fill(0); // Jumlah responden yang menjawab Q1-Q10

    surveys.forEach((survey) => {
      const answerArray = Array(10).fill('-');
      survey.responses.forEach((response) => {
        const qId = parseInt(response.questionId);
        answerArray[qId] = response.answer;
      });

      answerArray.forEach((answer, index) => {
        if (answer !== '-') {
          totalAnswer[index] += parseFloat(answer); // Pastikan answer adalah angka
          countResponses[index] += 1;
        }
      });
    });

    const averageAnswer = totalAnswer.map((total, index) => {
      return countResponses[index] > 0 ? (total / countResponses[index]).toFixed(1) : '-';
    });

    return averageAnswer;
  };

  // Hitung rata-rata hanya jika data sudah ada
  const avgTimeTaken = surveys.length > 0 ? calculateAverageTimeTaken() : Array(10).fill('-');
  const avgAnswer = surveys.length > 0 ? calculateAverageAnswer() : Array(10).fill('-');

  if (loading) {
    return <div className="container2">Memuat data...</div>;
  }

  return (
    <div className="container3">
      <h3>Responden: {surveys.length} orang</h3>

      <div className='line'></div>

      <h4 className='title'>Waktu</h4>
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

      <h4 className='title'>Nilai</h4>
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

      <h4 className='title'>Data</h4>
      <table className="survey-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Profesi</th>
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
          {surveys.map((survey, index) => {
            const answer = Array(10).fill('-');
            survey.responses.forEach((response) => {
              const qId = parseInt(response.questionId);
              answer[qId] = response.answer;
            });

            const timeTakenArray = Array(10).fill('-');
            survey.responses.forEach((response) => {
              const qId = parseInt(response.questionId);
              timeTakenArray[qId] = response.timeTaken;
            });

            return (
              <tr key={survey._id}>
                <td>{index + 1}. {survey.name}</td>
                <td>{survey.profession}</td>
                {timeTakenArray.map((time, index) => (
                  <td style={{ textAlign: 'center' }} key={index}>
                    ({answer[index]}) <br /> {formatTime(time)} dtk
                  </td>
                ))}
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