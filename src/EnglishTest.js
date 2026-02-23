import React, { useState, useEffect } from "react";
import { Award, Clock, Headphones, CheckCircle } from "lucide-react";
import { POOL_A, POOL_B, POOL_C, POOL_D, POOL_E, POOL_F } from "./questions";

const getRandomItems = (array, count) => {
  if (!array || array.length === 0) return [];
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// ================= TIMER =================
const Timer = ({ duration, onTimeUp, isRunning = true }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft === 0) {
      onTimeUp();
      return;
    }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isRunning, onTimeUp]);

  return (
    <div className={`font-mono font-bold flex items-center gap-2 ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-purple-600"}`}>
      <Clock size={18}/>
      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
    </div>
  );
};

// ================= MCQ STAGE (Grammar & Vocab) =================
const MCQStage = ({ questions, onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);

  if (!questions || questions.length === 0) {
    return <div className="p-10 text-center text-slate-500 font-bold">Loading Questions...</div>;
  }
  const currentQuestion = questions[current];
  
  if (!currentQuestion) return <div className="p-10 text-center font-bold">Loading...</div>;

  const handleAnswer = (opt) => {
    const isCorrect = opt === currentQuestion.correct;
    let newScore = score + (isCorrect ? 1 : 0);
    setScore(newScore);

    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
    } else {
      const percentage = (newScore / questions.length) * 100;
      onComplete(percentage);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-slate-800">Part 1: Grammar & Vocab</h3>
        <div className="flex items-center gap-4 bg-purple-50 p-2 pr-4 rounded-xl border border-purple-100">
            <Timer key={current} duration={30} onTimeUp={() => handleAnswer(null)} />
            <span className="bg-purple-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md">
              {current + 1} / {questions.length}
            </span>
        </div>
      </div>
      
      <div className="bg-slate-50 p-8 rounded-[2rem] mb-8 border border-slate-100 min-h-[120px] flex items-center justify-center text-center shadow-inner relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1.5 bg-purple-200"></div>
         <p className="text-2xl font-bold text-slate-800 leading-relaxed">{currentQuestion.q}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options && currentQuestion.options.map((opt, i) => (
          <button 
            key={i} 
            onClick={() => handleAnswer(opt)} 
            className="p-5 rounded-2xl border-2 border-slate-100 hover:border-purple-400 hover:bg-purple-50 transition-all text-left font-bold text-slate-700 bg-white shadow-sm hover:shadow-md active:scale-[0.99] text-lg group"
          >
            <span className="inline-block w-8 h-8 bg-slate-100 text-slate-500 group-hover:bg-purple-200 group-hover:text-purple-700 text-center leading-8 rounded-full mr-3 text-sm transition-colors">{String.fromCharCode(65 + i)}</span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// ================= LISTENING STAGE (New) =================
const LISTENING_QUESTIONS = [
  { id: 1, q: "What is the main topic of the conversation?", options: ["Customer complaint", "New product launch", "Sales strategy", "Team building"], correct: "New product launch" },
  { id: 2, q: "When is the deadline for the project?", options: ["Next Monday", "This Friday", "Tomorrow", "Next month"], correct: "This Friday" },
  { id: 3, q: "Who is responsible for the marketing materials?", options: ["Sarah", "John", "The Manager", "The Client"], correct: "Sarah" }
];

const ListeningStage = ({ onComplete }) => {
  const [answers, setAnswers] = useState({});
  
  // هنا رابط لملف صوتي تجريبي، تقدر تغيره لاحقاً
  const AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 

  const handleSelect = (qIndex, option) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  const handleSubmit = () => {
    let score = 0;
    LISTENING_QUESTIONS.forEach((q, i) => {
      if (answers[i] === q.correct) score++;
    });
    const percentage = (score / LISTENING_QUESTIONS.length) * 100;
    onComplete({ score: percentage, feedback: "Listening evaluation complete." });
  };

  const allAnswered = Object.keys(answers).length === LISTENING_QUESTIONS.length;

  return (
    <div className="max-w-3xl mx-auto w-full animate-in fade-in zoom-in duration-300 text-left">
      <div className="mb-8 border-b border-slate-100 pb-6 text-center">
        <h3 className="text-3xl font-black text-slate-800 mb-2 flex items-center justify-center gap-3">
          <Headphones className="text-purple-600" size={32}/> Part 2: Listening
        </h3>
        <p className="text-slate-500 font-bold">Listen to the audio and answer the questions below.</p>
      </div>

      {/* Audio Player */}
      <div className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100 mb-10 shadow-sm flex flex-col items-center">
        <audio controls className="w-full max-w-md outline-none rounded-full" controlsList="nodownload">
          <source src={AUDIO_URL} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {LISTENING_QUESTIONS.map((q, i) => (
          <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <p className="text-lg font-black text-slate-800 mb-4">{i + 1}. {q.q}</p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {q.options.map((opt, j) => {
                 const isSelected = answers[i] === opt;
                 return (
                   <button
                     key={j}
                     onClick={() => handleSelect(i, opt)}
                     className={`p-4 rounded-2xl border-2 font-bold text-left transition-all flex items-center justify-between ${
                       isSelected 
                       ? "border-purple-500 bg-purple-50 text-purple-700" 
                       : "border-slate-100 hover:border-purple-300 hover:bg-slate-50 text-slate-600"
                     }`}
                   >
                     {opt}
                     {isSelected && <CheckCircle size={18} className="text-purple-600"/>}
                   </button>
                 );
               })}
             </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <button 
          onClick={handleSubmit} 
          disabled={!allAnswered}
          className="bg-purple-600 text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {allAnswered ? "Submit Test" : "Answer all questions to submit"}
        </button>
      </div>
    </div>
  );
};

// ================= MAIN COMPONENT =================
export default function EnglishTest({ onBack, onFinish }) {
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [stage, setStage] = useState(0); 
  const [mcqScore, setMcqScore] = useState(0);
  const [listeningResult, setListeningResult] = useState(null);

  useEffect(() => {
    // تجميع الأسئلة العشوائية لقسم الجرامر
    const all = [...(POOL_A||[]), ...(POOL_B||[]), ...(POOL_C||[]), ...(POOL_D||[]), ...(POOL_E||[]), ...(POOL_F||[])];
    if (all.length > 0) {
        setMcqQuestions(getRandomItems(all, 10)); // 10 أسئلة مثلاً
    } else {
        setMcqQuestions([{q:"Demo MCQ Question (Please check questions.js)", options:["A","B"], correct:"A"}]);
    }
  }, []);

  if (stage === 2) {
    // حساب النتيجة النهائية: 50% جرامر + 50% استماع
    const totalScore = Math.round((mcqScore * 0.5) + (listeningResult.score * 0.5));
    
    let level = "A1";
    if(totalScore >= 90) level = "C2"; 
    else if(totalScore >= 80) level = "C1"; 
    else if(totalScore >= 65) level = "B2"; 
    else if(totalScore >= 50) level = "B1"; 
    else if(totalScore >= 30) level = "A2";

    return (
      <div className="max-w-xl mx-auto p-10 bg-white rounded-[3rem] shadow-2xl text-center mt-8 animate-in zoom-in duration-500 border-2 border-purple-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-purple-600"></div>
        <Award className="w-24 h-24 text-yellow-400 mx-auto mb-8 drop-shadow-xl"/>
        <h1 className="text-5xl font-black text-slate-800 mb-3 leading-tight">Result: {level}</h1>
        <p className="text-purple-600 font-black mb-10 text-3xl">Total Score: {totalScore}%</p>
        
        <div className="grid grid-cols-2 gap-4 mb-10">
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Grammar</p>
              <p className="text-2xl font-black text-slate-700">{Math.round(mcqScore)}%</p>
           </div>
           <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Listening</p>
              <p className="text-2xl font-black text-purple-700">{Math.round(listeningResult.score)}%</p>
           </div>
        </div>

        <button 
            onClick={() => onFinish(level)} 
            className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black text-xl hover:bg-purple-600 transition-all shadow-xl active:scale-95"
        >
            Save & Return
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-4xl bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-slate-100 relative">
        <button onClick={onBack} className="absolute top-8 left-8 text-gray-400 hover:text-purple-600 transition flex items-center gap-2 font-bold bg-gray-50 px-4 py-2 rounded-xl">
            ← Back
        </button>
        
        <div className="mt-10">
          {stage === 0 && <MCQStage questions={mcqQuestions} onComplete={(s) => { setMcqScore(s); setStage(1); }} />}
          {stage === 1 && <ListeningStage onComplete={(res) => { setListeningResult(res); setStage(2); }} />}
        </div>
      </div>
    </div>
  );
}