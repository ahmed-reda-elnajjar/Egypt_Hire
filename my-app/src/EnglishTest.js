import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Clock, Award, Mic, Square, Sparkles, Volume2 } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// استيراد بنوك الأسئلة
import { POOL_A, POOL_B, POOL_C, POOL_D, POOL_E, POOL_F } from "./questions";

// ✅ مفتاح API الخاص بك
const API_KEY = "AIzaSyASI0N-jpRlcfGAyMZeO5Kn2iWvgRUVGuo"; 
const genAI = new GoogleGenerativeAI(API_KEY);

// ==========================================
// 1. DATA & TOPICS (مواضيع المحادثة)
// ==========================================
const SPEAKING_TOPICS = [
  "Describe a memorable holiday you had.",
  "Talk about your favorite hobby and why you like it.",
  "Discuss the importance of learning a second language.",
  "Describe a person who has influenced you significantly.",
  "Talk about a goal you want to achieve in the future.",
  "Discuss the advantages and disadvantages of social media.",
  "Describe your hometown and what makes it special.",
  "Talk about a book or movie that changed your perspective.",
  "Discuss how technology has changed education.",
  "Describe a typical day in your life."
];

// دالة خلط واختيار
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// ==========================================
// 2. COMPONENTS
// ==========================================

const Timer = ({ duration, onTimeUp, isRunning = true }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft === 0) { onTimeUp(); return; }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isRunning]);
  return (
    <div className={`flex items-center gap-2 font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-blue-600'}`}>
      ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
    </div>
  );
};

// --- مرحلة الاختيار من متعدد ---
const MCQStage = ({ questions, onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = (opt) => {
    const isCorrect = opt === questions[current].correct;
    let newScore = score + (isCorrect ? 1 : 0);
    setScore(newScore);

    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
    } else {
      const percentage = (newScore / questions.length) * 100;
      onComplete(percentage); // نرسل النسبة المئوية
    }
  };

  return (
    <div className="animate-in fade-in space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-black capitalize text-slate-800">Part 1: General Knowledge</h3>
        <div className="flex items-center gap-3">
            <Timer key={current} duration={30} onTimeUp={() => handleAnswer(null)} />
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
              {current + 1} / {questions.length}
            </span>
        </div>
      </div>
      <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 min-h-[140px] flex items-center justify-center text-center">
        <p className="text-xl font-bold text-slate-800">{questions[current].q}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questions[current].options.map((opt, idx) => (
          <button key={idx} onClick={() => handleAnswer(opt)} className="p-5 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-left font-bold text-gray-600 text-lg shadow-sm">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- مرحلة المحادثة (الجديدة) ---
const SpeakingStage = ({ onComplete }) => {
  const [step, setStep] = useState("selection"); // selection, recording, analyzing
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    setTopics(getRandomItems(SPEAKING_TOPICS, 3));
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition. Please use Chrome.");
      return;
    }
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      setTranscript(prev => prev + finalTranscript);
    };

    recognitionRef.current.start();
  };

  const stopRecording = async () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
    setStep("analyzing");
    await analyzeSpeech();
  };

  const analyzeSpeech = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `
        Act as an English IELTS examiner.
        Topic: "${selectedTopic}"
        Student Transcript: "${transcript || "(Student remained silent)"}"
        
        Evaluate the student based on:
        1. Fluency & Coherence
        2. Lexical Resource (Vocabulary)
        3. Grammatical Range & Accuracy
        4. Pronunciation/Clarity (inferred from text)

        Return ONLY a raw JSON object:
        {
          "score": (number 0-100),
          "feedback": "2 sentences of constructive feedback.",
          "breakdown": { "fluency": 0-10, "vocab": 0-10, "grammar": 0-10, "clarity": 0-10 }
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonStr = text.replace(/```json|```/g, "").trim();
      const data = JSON.parse(jsonStr);
      
      onComplete(data); // إرجاع كائن التحليل الكامل

    } catch (error) {
      console.error("AI Error", error);
      onComplete({ score: 50, feedback: "Could not analyze speech. Network error.", breakdown: { fluency:5, vocab:5, grammar:5, clarity:5 } });
    }
  };

  // 1. شاشة اختيار الموضوع
  if (step === "selection") {
    return (
      <div className="animate-in fade-in text-center">
        <h3 className="text-2xl font-black text-slate-800 mb-6">Part 2: Speaking Assessment</h3>
        <p className="text-gray-500 mb-8">Choose a topic to talk about for 2 minutes.</p>
        <div className="grid gap-4">
          {topics.map((t, i) => (
            <button key={i} onClick={() => { setSelectedTopic(t); setStep("recording"); }} className="p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 text-left font-bold text-lg transition-all">
              🎙️ {t}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. شاشة التسجيل
  if (step === "recording") {
    return (
      <div className="animate-in fade-in text-center">
        <div className="bg-blue-50 p-6 rounded-2xl mb-6">
          <h4 className="text-sm font-bold text-gray-500 uppercase">Topic</h4>
          <p className="text-xl font-black text-blue-700 mt-2">{selectedTopic}</p>
        </div>

        <div className="flex justify-center mb-8">
           <Timer duration={120} onTimeUp={stopRecording} isRunning={isRecording} />
        </div>

        <div className="h-40 bg-gray-50 rounded-xl p-4 mb-6 overflow-y-auto text-left border border-gray-200">
            <p className="text-gray-500 text-sm italic mb-2">Transcript (Live):</p>
            <p className="text-gray-800 font-medium">{transcript}</p>
        </div>

        {!isRecording ? (
           <button onClick={startRecording} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 mx-auto shadow-lg hover:scale-105 transition-all">
             <Mic /> Start Speaking
           </button>
        ) : (
           <button onClick={stopRecording} className="flex items-center gap-2 bg-red-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-red-600 mx-auto shadow-lg animate-pulse">
             <Square size={20} fill="white" /> Stop & Submit
           </button>
        )}
      </div>
    );
  }

  // 3. شاشة التحليل
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Sparkles className="w-16 h-16 text-purple-500 animate-spin mb-4" />
      <h3 className="text-xl font-bold text-slate-700">AI is evaluating your speech...</h3>
      <p className="text-gray-400">Checking grammar, fluency, and vocabulary.</p>
    </div>
  );
};

// ==========================================
// 3. MAIN COMPONENT (الهيكل الرئيسي)
// ==========================================
export default function EnglishTest({ onFinish, onBack }) {
  const [loading, setLoading] = useState(true);
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [stage, setStage] = useState(0); // 0: MCQ, 1: Speaking, 2: Result
  
  // Results State
  const [mcqScore, setMcqScore] = useState(0);
  const [speakingResult, setSpeakingResult] = useState(null);

  useEffect(() => {
    const loadData = () => {
        // نأخذ عينة عشوائية من الأسئلة كما في السابق (20 سؤال)
        const allPools = [...POOL_A, ...POOL_B, ...POOL_C, ...POOL_D, ...POOL_E, ...POOL_F];
        const selected = getRandomItems(allPools, 20); // 20 MCQ questions
        setMcqQuestions(selected);
        setLoading(false);
    };
    setTimeout(loadData, 500);
  }, []);

  const handleMcqFinish = (scorePercentage) => {
    setMcqScore(scorePercentage);
    setStage(1); // انتقل لمرحلة المحادثة
  };

  const handleSpeakingFinish = (aiData) => {
    setSpeakingResult(aiData);
    setStage(2); // انتقل للنتيجة النهائية
  };

  // حساب النتيجة النهائية
  const calculateFinalLevel = () => {
    if (!speakingResult) return "A1";
    // الوزن: 60% للأسئلة و 40% للمحادثة
    const totalScore = (mcqScore * 0.6) + (speakingResult.score * 0.4);
    
    if (totalScore >= 90) return "C2";
    if (totalScore >= 80) return "C1";
    if (totalScore >= 65) return "B2";
    if (totalScore >= 50) return "B1";
    if (totalScore >= 30) return "A2";
    return "A1";
  };

  if (loading) return <div className="text-center py-20 font-bold text-xl">Loading Exam...</div>;

  // --- شاشة النتيجة النهائية ---
  if (stage === 2) {
    const level = calculateFinalLevel();
    const totalScore = Math.round((mcqScore * 0.6) + (speakingResult.score * 0.4));

    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center animate-in zoom-in">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100">
          <Award size={60} className="text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-slate-800 mb-2">Final Assessment</h2>
          
          <div className="bg-slate-50 p-8 rounded-[2rem] mb-6 border border-slate-100">
             <h3 className="text-8xl font-black text-blue-600 mb-2">{level}</h3>
             <p className="text-xl font-bold text-gray-400">Overall Score: {totalScore}%</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left mb-6">
            <div className="bg-blue-50 p-4 rounded-2xl">
                <span className="block text-xs font-bold text-gray-400 uppercase">MCQ Score</span>
                <span className="text-2xl font-black text-blue-700">{Math.round(mcqScore)}%</span>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl">
                <span className="block text-xs font-bold text-gray-400 uppercase">Speaking Score</span>
                <span className="text-2xl font-black text-purple-700">{speakingResult.score}%</span>
            </div>
          </div>

          {/* تفاصيل تقييم المحادثة */}
          <div className="bg-gray-50 p-6 rounded-2xl text-left mb-8 border border-gray-200">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Mic size={18} /> Speaking Feedback
            </h4>
            <p className="text-gray-600 text-sm mb-4 italic">"{speakingResult.feedback}"</p>
            
            <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="flex justify-between"><span>Fluency:</span> <span className="font-bold">{speakingResult.breakdown.fluency}/10</span></div>
                <div className="flex justify-between"><span>Vocabulary:</span> <span className="font-bold">{speakingResult.breakdown.vocab}/10</span></div>
                <div className="flex justify-between"><span>Grammar:</span> <span className="font-bold">{speakingResult.breakdown.grammar}/10</span></div>
                <div className="flex justify-between"><span>Clarity:</span> <span className="font-bold">{speakingResult.breakdown.clarity}/10</span></div>
            </div>
          </div>

          <button onClick={() => onFinish(level)} className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all">
            Save Result & Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="text-gray-400 font-bold hover:text-red-500 transition-colors">Exit Exam</button>
        {/* شريط التقدم */}
        <div className="flex gap-2">
          <div className={`h-2 w-16 rounded-full transition-all ${stage >= 0 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`h-2 w-16 rounded-full transition-all ${stage >= 1 ? 'bg-purple-600' : 'bg-gray-200'}`} />
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-gray-50 min-h-[500px]">
        {stage === 0 && (
          <MCQStage questions={mcqQuestions} onComplete={handleMcqFinish} />
        )}
        {stage === 1 && (
          <SpeakingStage onComplete={handleSpeakingFinish} />
        )}
      </div>
    </div>
  );
}