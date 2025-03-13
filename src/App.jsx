import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'; // Import React Router
import './App.css';

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
  const navigate = useNavigate(); // Hook untuk navigasi

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
        // Arahkan ke halaman terima kasih setelah pertanyaan terakhir
        navigate('/thank-you');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (questions.length === 0) return <div>Tunggu sebentar...</div>;

  // Initial form for name and profession
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

  // Main survey form
  return (
    <div className="container">
      <div className="form-container">
        <h2>System Usability SIGEO</h2>
        <p>Nama: {name} | Profesi: {profession}</p>
        <p>Jumlah pertanyaan 1-10</p>
        <div className='border'></div>
        <div class="scale">1 = Sangat Tidak Setuju</div>
        <div class="scale">2 = Tidak Setuju</div>
        <div class="scale">3 = Netral</div>
        <div class="scale">4 = Setuju</div>
        <div class="scale">5 = Sangat Setuju</div>
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
          <button type="submit">
            {currentQuestion === questions.length - 1 ? 'Selesai' : 'Simpan'}
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
      </Routes>
    </Router>
  );
}

export default MainApp;