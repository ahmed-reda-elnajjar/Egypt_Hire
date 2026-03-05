import React from "react";
import { motion } from "framer-motion";
import { BookOpen, PlayCircle, Download, CheckCircle, ArrowLeft } from "lucide-react";

// نفس الألوان عشان نحافظ على شكل الموقع
const themeColors = {
  mainBg: "rgb(250, 227, 255)", 
  glassBg: "rgba(255, 255, 255, 0.39)", 
  glassCardBg: "rgba(255, 255, 255, 0.47)", 
  glassFormBg: "rgba(255, 255, 255, 0.51)", 
  accentPurple: "#5E1181", 
  accentPink: "#E4405F",
};

export default function EnglishCourse({ setView }) {
  
  // داتا وهمية للدروس (تقدر تعدلها براحتك بعدين)
  const lessons = [
    { id: 1, title: "Introduction to Call Center English", duration: "10 mins", status: "completed" },
    { id: 2, title: "Common Customer Service Phrases", duration: "15 mins", status: "locked" },
    { id: 3, title: "Handling Angry Customers", duration: "20 mins", status: "locked" },
    { id: 4, title: "American Accent Basics", duration: "25 mins", status: "locked" },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in zoom-in duration-300 px-4">
      
      {/* زرار الرجوع */}
      <button onClick={() => setView("home")} className="mb-6 flex items-center gap-2 text-gray-500 font-bold hover:text-purple-700 transition-colors">
        <ArrowLeft size={20} /> Back to Home
      </button>

      {/* الهيدر بتاع الكورس */}
      <div className="rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/40 backdrop-blur-md mb-10" style={{ backgroundColor: themeColors.accentPurple }}>
        <div className="p-12 text-white relative">
          <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest absolute top-10 left-10 flex items-center gap-2">
            <BookOpen size={14}/> Free Course
          </span>
          <h1 className="text-4xl md:text-6xl font-black mt-10 leading-tight">Peaky Scouts English Mastery</h1>
          <p className="text-xl font-bold opacity-90 mt-2">
            Level up your English to get hired faster!
          </p>
        </div>
      </div>

      {/* محتوى الكورس */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* قسم الفيديو الرئيسي */}
        <div className="lg:col-span-2 space-y-6">
           <div className="p-4 rounded-[2.5rem] shadow-xl border border-white/40 backdrop-blur-sm" style={{ backgroundColor: themeColors.glassFormBg }}>
              {/* مكان الفيديو (تقدر تحط iframe بتاع يوتيوب هنا) */}
              <div className="w-full aspect-video bg-slate-900 rounded-[2rem] flex flex-col items-center justify-center text-white relative overflow-hidden group cursor-pointer shadow-inner">
                 <PlayCircle size={64} className="text-white/80 group-hover:scale-110 group-hover:text-white transition-all duration-300" />
                 <p className="mt-4 font-bold text-gray-400">Lesson 1: Introduction</p>
                 <div className="absolute inset-0 bg-purple-900/20 group-hover:bg-transparent transition-all"></div>
              </div>
              <div className="p-6">
                 <h2 className="text-2xl font-black mb-2" style={{ color: themeColors.accentPurple }}>Lesson 1: Introduction to Call Center English</h2>
                 <p className="text-gray-600 font-medium leading-relaxed">In this lesson, you will learn the absolute basics of introducing yourself professionally over the phone.</p>
              </div>
           </div>
        </div>

        {/* قائمة الدروس والماتيريال */}
        <div className="space-y-6">
           {/* قائمة الفيديوهات */}
           <div className="p-8 rounded-[2.5rem] shadow-xl border border-white/40 backdrop-blur-sm" style={{ backgroundColor: themeColors.glassCardBg }}>
              <h3 className="text-xl font-black mb-6" style={{ color: themeColors.accentPurple }}>Course Content</h3>
              <div className="space-y-4">
                 {lessons.map((lesson) => (
                    <div key={lesson.id} className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${lesson.status === 'completed' ? 'bg-white/80 border-green-200 cursor-pointer' : 'bg-white/40 border-white/20 cursor-not-allowed opacity-70'}`}>
                       <div>
                          <p className={`font-bold text-sm ${lesson.status === 'completed' ? 'text-slate-800' : 'text-gray-500'}`}>{lesson.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{lesson.duration}</p>
                       </div>
                       {lesson.status === 'completed' ? <PlayCircle size={20} className="text-green-500"/> : <Lock size={20} className="text-gray-400"/>}
                    </div>
                 ))}
              </div>
           </div>

           {/* زرار تحميل الماتيريال */}
           <motion.button 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.95 }}
             className="w-full text-white py-5 rounded-[2rem] font-bold text-lg shadow-lg flex items-center justify-center gap-3 hover:opacity-90 transition-colors"
             style={{ backgroundColor: themeColors.accentPink }}
           >
             <Download size={22} /> Download PDF Materials
           </motion.button>
        </div>

      </div>
    </div>
  );
}

// أيكون القفل عشان لو درس مقفول
function Lock(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
}