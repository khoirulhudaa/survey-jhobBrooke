import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
// import { Loading02Icon } from 'hugeicons/react'; // Import ikon loading dari hugeicons-react
import './App.css';
import { Loading02Icon } from 'hugeicons-react';

// Komponen Halaman Terima Kasih
const Private = () => {

  const [surveys, setSurveys] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil data survei dari server
    axios.get('https://api-survey-jhon-brooke.vercel.app/api/surveys')
      .then(res => {
        setSurveys(res.data);
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

  if (loading) {
    return <div className="container2">Memuat data...</div>;
  }

  return (
    <div className="container3">
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
            // Membuat array timeTaken berdasarkan questionId (0-9)
            const timeTakenArray = Array(10).fill('-'); // Default '-' jika tidak ada jawaban
            survey.responses.forEach((response) => {
              const qId = parseInt(response.questionId);
              timeTakenArray[qId] = response.timeTaken;
            });

            return (
              <tr key={survey._id}>
                <td>{index + 1}. {survey.name}</td>
                <td>{survey.profession}</td>
                {timeTakenArray.map((time, index) => (
                  <td key={index}>{formatTime(time)} dtk</td> // Terapkan formatTime di sini
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Komponen Halaman Terima Kasih
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

// Komponen Utama App
function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9));
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [isFormStarted, setIsFormStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State untuk loading
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

    setIsLoading(true); // Mulai loading
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
      setIsLoading(false); // Selesai loading, baik sukses atau gagal
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
            disabled={!answer || isLoading} // Disable tombol saat loading atau belum ada jawaban
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
}

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