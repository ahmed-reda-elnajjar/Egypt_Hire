import React, { useEffect, useState } from "react";

// === التعديل هنا: استدعاء useScroll و useTransform للحركة الديناميكية ===
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
  Languages, MapPin, Search, Briefcase, Zap, ArrowLeft, Send, Loader2,
  Globe, Instagram, Linkedin, Phone, Mail, DollarSign, Clock, Plus, Eye, EyeOff, Lock, 
  CheckCircle, Trash2, Edit3, User, Upload, LayoutGrid, Mic, StopCircle, GraduationCap, 
  Users, RotateCcw, ExternalLink, FileText, Download, LogIn, LogOut, X, Save, Calendar,
  Facebook, Video 
} from "lucide-react";

// استدعاء اللوجو
import logoImg from "./logo192.png";

// === استدعاء صورة الخلفية من ملفات المشروع ===
import avatar from "./avatar.png"; 
import AVA from "./AVA.png";

// استدعاء ملف الكورس الخارجي
import EnglishCourse from "./EnglishCourse";

// Firebase Config
import { db, auth } from "./firebase"; 
import { 
  collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy 
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

// Cloudinary Config
const CLOUD_NAME = "dvefx5ts8"; 
const UPLOAD_PRESET = "w1cmaa5s"; 

// === التعديل هنا: تحديث الألوان لتتناسب مع ألوان الصورة المستوحاة (اللون الوردي والأزرق الفضائي) ===
// --- الإعدادات اللونية للوضع الليلي ---
const themeColors = {
  // التعديل هنا: مزيج متدرج من الألوان الفضائية (أسود، بنفسجي داكن، وأزرق غامق)
  mainBgGradient: "linear-gradient(135deg, #49307c 0%, #634b97 40%, #a786c1 70%, #ac9bcc 100%)",
  glassBg: "rgba(15, 10, 25, 0.35)", 
  glassCardBg: "rgba(10, 6, 16, 0.71)", 
  glassFormBg: "rgba(30, 20, 50, 0.4)", 
  accentPurple: "#c184ff", 
  accentPink: "#FF6FA1", 
  applyBtn: "#1e7ede" 
};

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(196,141,255,0.15)" }} 
      className="p-10 rounded-[3rem] shadow-2xl border border-white/5 flex flex-col items-center text-center backdrop-blur-sm"
      style={{ backgroundColor: themeColors.glassCardBg }}
    >
      <div className="w-16 h-16 bg-white/5 text-[#C48DFF] rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">{icon}</div>
      <h3 className="text-2xl font-bold mb-4" style={{ color: themeColors.accentPurple }}>{title}</h3>
      <p className="text-gray-300 font-medium">{desc}</p>
    </motion.div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { y: -12, transition: { duration: 0.3, ease: "easeOut" } }
};

export default function App() {
  const [view, setView] = useState("home"); 
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({ language: "all", location: "all" });
  
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [uniqueLocations, setUniqueLocations] = useState([]);
  const [uniqueLanguages, setUniqueLanguages] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("egyptHireUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    signInAnonymously(auth).catch(console.error);
    document.documentElement.dir = "ltr";
  }, []);

  useEffect(() => {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetchedJobs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setJobs(fetchedJobs);
      setLoading(false);

      const locs = [...new Set(fetchedJobs.map(j => j.location?.trim()).filter(Boolean))];
      const langs = [...new Set(fetchedJobs.map(j => j.language?.trim()).filter(Boolean))];
      setUniqueLocations(locs);
      setUniqueLanguages(langs);
    });
    return () => unsub();
  }, []);

  const filteredJobs = jobs.filter(job => {
    if (view === "recommended" && currentUser) {
      const userLang = currentUser.language?.toLowerCase().trim();
      const jobLang = job.language?.toLowerCase().trim();
      return currentUser.language === "all" || (jobLang && jobLang.includes(userLang));
    }
    const langMatch = filters.language === "all" || job.language?.toLowerCase().includes(filters.language.toLowerCase());
    const locMatch = filters.location === "all" || job.location?.toLowerCase().includes(filters.location.toLowerCase());
    return langMatch && locMatch;
  });

  const handleFastApply = () => {
    if (currentUser) {
      setView("recommended");
    } else {
      setView("login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("egyptHireUser");
    setCurrentUser(null);
    setShowProfileModal(false);
    setView("home");
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      const userRef = doc(db, "users", currentUser.id);
      await updateDoc(userRef, updatedData);
      const newUser = { ...currentUser, ...updatedData };
      setCurrentUser(newUser);
      localStorage.setItem("egyptHireUser", JSON.stringify(newUser));
      alert("Updated successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: themeColors.mainBgGradient }}>
        <Loader2 size={60} className="animate-spin text-[#C48DFF]" />
        <p className="font-bold text-lg animate-pulse" style={{ color: themeColors.accentPurple }}>Loading Jobs...</p>
      </div>
    );
  }

  return (
    // === التعديل هنا: تطبيق الخلفية الملونة المستوحاة على كامل الصفحة ===
    <div className="min-h-screen text-white font-sans text-left transition-all duration-500" style={{ background: themeColors.mainBgGradient }}>
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 border-b border-white/5 sticky top-0 z-50 shadow-xl backdrop-blur-2xl"
        style={{ backgroundColor: themeColors.glassBg }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("home")}>
              <img src={logoImg} alt="PEAKY SCOUTS" className="h-12 object-contain" />
            </div>
            <div className="hidden md:flex gap-6 text-sm font-bold text-gray-300">
              <button onClick={() => setView("home")} className={view === "home" ? "border-b-2 pb-1 text-white" : "hover:text-white transition-colors"} style={{ borderColor: view === "home" ? themeColors.accentPurple : "transparent" }}>Home</button>
              <button onClick={() => setView("jobs")} className={view === "jobs" ? "border-b-2 pb-1 text-white" : "hover:text-white transition-colors"} style={{ borderColor: view === "jobs" ? themeColors.accentPurple : "transparent" }}>Find Jobs</button>
             
              {currentUser && (
                <button onClick={() => setView("recommended")} className={view === "recommended" ? "border-b-2 pb-1 text-white" : "hover:text-white transition-colors"} style={{ borderColor: view === "recommended" ? themeColors.accentPurple : "transparent" }}>Recommended</button>
              )}
            </div>
          </div>
          <div className="flex gap-2 md:gap-4 items-center">
            {!currentUser ? (
              <motion.button whileHover={{ scale: 1.1, color: themeColors.accentPurple }} whileTap={{ scale: 0.9 }} onClick={() => setView("login")} className="text-gray-300 hover:text-white transition-colors p-2 rounded-full" title="Login"><LogIn size={24} /></motion.button>
            ) : (
               <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setShowProfileModal(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-900 font-bold cursor-pointer shadow-lg transition-colors border-2 border-[#C48DFF]/50" style={{ backgroundColor: themeColors.accentPurple }}>{currentUser.name.charAt(0).toUpperCase()}</motion.div>
            )}
            <motion.button whileHover={{ scale: 1.1, color: themeColors.accentPurple }} whileTap={{ scale: 0.9 }} onClick={() => setView("admin")} className="text-gray-300 hover:text-white transition-colors p-2 rounded-full" title="Admin Panel"><LayoutGrid size={24} /></motion.button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence mode="wait">
        {showProfileModal && currentUser && (
           <UserProfileModal user={currentUser} onClose={() => setShowProfileModal(false)} onLogout={handleLogout} onUpdate={handleUpdateProfile}/>
        )}
        <motion.main key={view} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="max-w-7xl mx-auto px-4 py-8 min-h-[70vh]">
          {view === "home" && <HomeView setView={setView} onFastApply={handleFastApply} />}
         
          {view === "jobs" && <JobsListView jobs={filteredJobs} filters={filters} setFilters={setFilters} onViewDetails={(j) => { setSelectedJob(j); setView("details"); }} locations={uniqueLocations} languages={uniqueLanguages} />}
          {view === "recommended" && <RecommendedJobsView jobs={filteredJobs} user={currentUser} onViewDetails={(j) => { setSelectedJob(j); setView("details"); }} />}
          {view === "details" && <JobDetailsView job={selectedJob} onBack={() => setView("jobs")} onApply={() => setView("apply")} />}
          {view === "apply" && <ApplicationPage job={selectedJob} onBack={() => setView("details")} user={currentUser} />}
          {view === "login" && <LoginView onLogin={(user) => { setCurrentUser(user); setView("recommended"); }} availableLanguages={uniqueLanguages} />}
          {view === "admin" && <AdminPanelView jobs={jobs} onViewJob={(jobId) => { const job = jobs.find(j => j.id === jobId); if (job) { setSelectedJob(job); setView("details"); } else { alert("Error"); } }} />}
        </motion.main>
      </AnimatePresence>
      <Footer setView={setView} />
    </div>
  );
}

// --- Components ---

function UserProfileModal({ user, onClose, onLogout, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    phone: user.phone,
    email: user.email,
    language: user.language,
    experience: user.experience
  });

  const handleSave = () => {
    onUpdate(editForm);
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative backdrop-blur-2xl border border-white/10"
        style={{ backgroundColor: themeColors.glassCardBg }}
      >
        <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"><X size={20}/></button>
        
        <div className="p-8 text-center bg-white/5 border-b border-white/10">
           <div className="w-24 h-24 bg-white/10 text-[#C48DFF] rounded-full flex items-center justify-center text-4xl font-black mx-auto mb-4 shadow-lg border-2 border-white/20">
              {user.name.charAt(0).toUpperCase()}
           </div>
           <h2 className="text-2xl font-black text-white">{isEditing ? "Edit Profile" : user.name}</h2>
           {!isEditing && <p className="text-gray-400 font-bold">{user.email}</p>}
        </div>

        <div className="p-8 space-y-6 text-left">
           {isEditing ? (
             <div className="space-y-4">
                <AdminField label="Full Name" value={editForm.name} onChange={(v) => setEditForm({...editForm, name: v})} placeholder="Name" />
                <AdminField label="Phone" value={editForm.phone} onChange={(v) => setEditForm({...editForm, phone: v})} placeholder="Phone" />
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Language</label>
                      <select value={editForm.language} onChange={(e) => setEditForm({...editForm, language: e.target.value})} className="w-full bg-white/5 p-4 rounded-xl font-bold border border-white/10 text-white outline-none focus:border-[#C48DFF]">
                         {["English", "German", "French", "Italian", "Spanish"].map(l => <option className="bg-gray-900" key={l} value={l}>{l}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Experience</label>
                      <select value={editForm.experience} onChange={(e) => setEditForm({...editForm, experience: e.target.value})} className="w-full bg-white/5 p-4 rounded-xl font-bold border border-white/10 text-white outline-none focus:border-[#C48DFF]">
                         {["No Experience", "Less than 1 year", "1 Year", "2 Years", "3 Years", "4 Years", "5+ Years"].map(e => <option className="bg-gray-900" key={e} value={e}>{e}</option>)}
                      </select>
                   </div>
                </div>
                <button onClick={handleSave} className="w-full bg-green-500/20 text-green-400 border border-green-500/50 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-500 hover:text-gray-900 transition-all">
                   <Save size={18}/> Save Changes
                </button>
             </div>
           ) : (
             <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl">
                   <span className="font-bold text-white">{user.phone}</span>
                   <span className="text-gray-400 text-sm"><Phone size={16} className="inline mx-1"/> Phone</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl">
                   <span className="font-bold text-white">{user.language}</span>
                   <span className="text-gray-400 text-sm"><Languages size={16} className="inline mx-1"/> Language</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl">
                   <span className="font-bold text-white">{user.experience}</span>
                   <span className="text-gray-400 text-sm"><Briefcase size={16} className="inline mx-1"/> Experience</span>
                </div>
                
                {user.cvUrl && (
                   <a href={user.cvUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-gray-900 font-bold p-4 rounded-2xl hover:opacity-90 transition-all" style={{ backgroundColor: themeColors.accentPurple }}>
                      <FileText size={18}/> View CV
                   </a>
                )}

                <button onClick={() => setIsEditing(true)} className="w-full bg-white/10 border border-white/20 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
                   <Edit3 size={18}/> Edit Profile
                </button>
             </div>
           )}

           <div className="border-t border-white/10 pt-6 mt-4">
              <button onClick={onLogout} className="w-full text-red-400 bg-red-500/10 border border-red-500/20 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all">
                 <LogOut size={18}/> Logout
              </button>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
// ===== السماعة اللي هتتحط فوق الروبوت =====

function HomeView({ setView, onFastApply }) {
  const isPlaying = React.useRef(false);
  const hasPlayedOnce = React.useRef(false); // عشان نضمن إنه يشتغل مرة واحدة بس في الحياة

  useEffect(() => {
    const playAudio = () => {
      // لو الصوت شغال حالياً، أو لو اشتغل قبل كده خلاص متعملش حاجة
      if (isPlaying.current || hasPlayedOnce.current) return;

      const audio = new Audio(process.env.PUBLIC_URL + "/welcome.mp3");
      audio.volume = 0.7;

      audio.onplay = () => {
        isPlaying.current = true;
        hasPlayedOnce.current = true; // سجل إنه خلاص اشتغل
      };
      
      audio.onended = () => {
        isPlaying.current = false;
      };

      audio.onerror = () => {
        isPlaying.current = false;
      };

      audio.play().catch((e) => console.log("Audio blocked by browser", e));
    };

    // 1️⃣ لو ضغط على أي مكان في الصفحة العادية
    const handleGlobalClick = () => playAudio();
    window.addEventListener("click", handleGlobalClick);

    // 2️⃣ الخدعة: لو ضغط جوه الـ iframe بتاع الروبوت
    const handleIframeClick = () => {
      setTimeout(() => {
        if (document.activeElement && document.activeElement.tagName === "IFRAME") {
          playAudio();
        }
      }, 0);
    };
    window.addEventListener("blur", handleIframeClick);

    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("blur", handleIframeClick);
    };
  }, []);

  return (
    <div className="space-y-16 text-center w-full">

      {/* ===== Hero Section ===== */}
      <div
        className="relative flex flex-col overflow-hidden w-screen shadow-2xl border-b border-white/5"
        style={{
          background: "rgba(10,5,20,0.3)",
          backdropFilter: "blur(8px)",
          marginLeft: "calc(-50vw + 50%)",
          marginRight: "calc(-50vw + 50%)",
          marginTop: "-2rem",
        }}
      >
        {/* ===== الروبوت 3D ===== */}
        <div
          className="w-full h-[55vh] md:h-[70vh] relative z-0"
          style={{ overflow: "hidden" }}
        >
          {/* iframe حر تماماً عشان يتفاعل مع الماوس */}
          <iframe
            src="https://my.spline.design/nexbotrobotcharacterconcept-sSaWP0eAxb1Ymk4UjUrJVSNp/"
            frameBorder="0"
            title="NEXBOT Robot"
            className="w-full h-full relative z-0"
            style={{ border: "none" }}
          />

          {/* ===== زر Fast Apply ===== */}
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: "0 0 20px rgba(255,111,161,0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation(); // عشان الزرار يعمل وظيفته
              onFastApply();
            }}
            className="absolute bottom-3 right-3 z-30 bg-[#160a2b]/80 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold shadow-xl flex items-center gap-2 border border-white/10"
          >
            Fast Apply
            <Zap size={18} className="text-[#FF6FA1] fill-[#FF6FA1]" />
          </motion.button>

          
        </div>

        {/* ===== الكلام والأزرار ===== */}
        <div className="relative z-20 w-full flex flex-col items-center text-center px-6 py-12 md:py-16">

          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-10"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(196,141,255,0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView("jobs")}
              className="text-gray-900 px-10 py-5 rounded-[2rem] font-bold text-xl flex items-center gap-3 transition-all"
              style={{ backgroundColor: themeColors.accentPurple }}
            >
              Find Jobs <Search size={22} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onFastApply}
              className="bg-black/20 backdrop-blur-md text-white px-10 py-5 rounded-[2rem] font-bold text-xl border border-white/20 shadow-xl flex items-center gap-3 transition-all"
            >
              Fast Apply
              <Zap size={22} className="text-[#FF6FA1] fill-[#FF6FA1]" />
            </motion.button>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-black leading-tight text-white drop-shadow-[0_4px_15px_rgba(0,0,0,1)] max-w-4xl"
            
          >
            Find your next{" "}
            <motion.span
              style={{ color: themeColors.accentPurple }}
              
            >
              Call Center
            </motion.span>{" "}
            Job in Egypt
          </motion.h1>
        </div>
      </div>

      {/* ===== Feature Cards ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 px-4 relative z-20">
        <FeatureCard
          icon={<Languages size={32} />}
          title="Language Focus"
          desc="Jobs for English, German, & French speakers."
        />
        <FeatureCard
          icon={<CheckCircle size={32} />}
          title="Fast Hiring"
          desc="Get hired within 48 hours."
        />
        <FeatureCard
          icon={<MapPin size={32} />}
          title="Great Locations"
          desc="Maadi, Nasr City, New Cairo, & more."
        />
      </div>

    </div>
  );
}

function LoginView({ onLogin }) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", language: "", experience: "", cvUrl: "" });
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
       let uploadedCvUrl = formData.cvUrl;
       if (cvFile) {
        const cvData = new FormData();
        cvData.append("file", cvFile);
        cvData.append("upload_preset", UPLOAD_PRESET);
        cvData.append("cloud_name", CLOUD_NAME);
        cvData.append("resource_type", "auto"); 
        const cvRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: "POST", body: cvData });
        const cvJson = await cvRes.json();
        if (cvJson.error) throw new Error(cvJson.error.message);
        uploadedCvUrl = cvJson.secure_url;
      }
      
      const userData = { ...formData, cvUrl: uploadedCvUrl, joinedAt: serverTimestamp() };
      
      const docRef = await addDoc(collection(db, "users"), userData);
      const userWithId = { ...userData, id: docRef.id };
      localStorage.setItem("egyptHireUser", JSON.stringify(userWithId));
      onLogin(userWithId);
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="p-10 rounded-[3rem] shadow-2xl border border-white/5 text-left backdrop-blur-xl" style={{ backgroundColor: themeColors.glassFormBg }}>
        <h2 className="text-4xl font-black mb-2 text-center" style={{ color: themeColors.accentPurple }}>Login / Register</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ApplyField label="Full Name" icon={<User size={18}/>} placeholder="Ahmed Mohamed" onChange={v => setFormData({...formData, name: v})}/>
              <ApplyField label="Email" icon={<Mail size={18}/>} placeholder="ahmed@example.com" onChange={v => setFormData({...formData, email: v})}/>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ApplyField label="Phone" icon={<Phone size={18}/>} placeholder="01xxxxxxxxx" onChange={v => setFormData({...formData, phone: v})}/>
              <ApplyField label="WhatsApp" icon={<Phone size={18}/>} placeholder="01xxxxxxxxx" onChange={()=>{}}/> 
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <ApplySelect label="Language" icon={<Languages size={18}/>} options={["English", "German", "French", "Italian", "Spanish"]} onChange={v => setFormData({...formData, language: v})} />
             <ApplySelect label="Experience" icon={<Briefcase size={18}/>} options={["No Experience", "Less than 1 year", "1 Year", "2 Years", "3 Years", "4 Years", "5+ Years"]} onChange={v => setFormData({...formData, experience: v})} />
           </div>

           <div className="space-y-2">
             <label className="block text-xs font-black text-gray-400 uppercase mx-2 tracking-wide">CV Link</label>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="https://drive.google.com/..." 
                  className="w-full bg-white/5 p-4 rounded-2xl font-bold outline-none border border-white/5 focus:border-[#C48DFF] transition-all text-sm shadow-sm text-white placeholder:text-gray-500"
                  onChange={e => setFormData({...formData, cvUrl: e.target.value})}
                />
                <div className="relative">
                   <input type="file" id="cv-quick" className="hidden" accept=".pdf,.doc" onChange={e => setCvFile(e.target.files[0])} />
                   <label htmlFor="cv-quick" className={`h-full px-4 rounded-2xl flex items-center justify-center cursor-pointer transition-all border border-white/10 ${cvFile ? 'bg-[#FF6FA1]/20 text-[#FF6FA1] border-[#FF6FA1]/50' : 'bg-white/5 text-[#C48DFF] hover:bg-white/10'}`}>
                      {cvFile ? <CheckCircle size={20}/> : <Upload size={20}/>}
                   </label>
                </div>
             </div>
           </div>

           <button disabled={loading} className="w-full text-gray-900 py-4 rounded-2xl font-bold text-xl shadow-lg flex items-center justify-center gap-2 mt-4 hover:opacity-90 transition-all" style={{ backgroundColor: themeColors.accentPurple }}>
             {loading ? <Loader2 className="animate-spin"/> : <><Send size={20} /> Submit</>}
           </button>
        </form>
      </div>
    </div>
  );
}

function RecommendedJobsView({ jobs, user, onViewDetails }) {
  return (
    <div className="space-y-8 animate-in fade-in">
       <div className="text-gray-900 p-8 rounded-[3rem] shadow-xl text-center relative overflow-hidden" style={{ backgroundColor: themeColors.accentPurple }}>
          <div className="relative z-10">
             <h2 className="text-3xl font-black mb-2">Hello, {user.name.split(" ")[0]}! 🚀</h2>
             <p className="opacity-90 font-bold">Experience: {user.experience} • Language: {user.language}</p>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-white/20 opacity-50"></div>
       </div>

       {jobs.length > 0 ? (
         <JobsListView jobs={jobs} filters={{language: "all", location: "all"}} setFilters={()=>{}} onViewDetails={onViewDetails} hideFilters={true} />
       ) : (
         <div className="text-center py-20 text-gray-400 font-bold">
            No recommended jobs found.
         </div>
       )}
    </div>
  );
}

function JobsListView({ jobs, filters, setFilters, onViewDetails, hideFilters = false, locations = [], languages = [] }) {
  return (
    <div className="space-y-10">
      {!hideFilters && (
        <div className="p-6 rounded-[2.5rem] shadow-lg border border-white/5 flex flex-wrap gap-4 items-center justify-between backdrop-blur-xl" style={{ backgroundColor: themeColors.glassCardBg }}>
           <div className="flex gap-4 items-center flex-1">
             
              <select 
                value={filters.language}
                onChange={(e) => setFilters(p => ({...p, language: e.target.value}))} 
                className="bg-white/5 border border-white/10 text-white p-4 rounded-2xl font-bold outline-none cursor-pointer hover:bg-white/10 w-full md:w-auto shadow-sm focus:border-[#C48DFF] transition-all"
              >
                <option value="all" className="bg-gray-900">All Languages</option>
                {languages.map(lang => (
                   <option key={lang} value={lang} className="bg-gray-900">{lang}</option>
                ))}
              </select>

              <select 
                value={filters.location}
                onChange={(e) => setFilters(p => ({...p, location: e.target.value}))} 
                className="bg-white/5 border border-white/10 text-white p-4 rounded-2xl font-bold outline-none cursor-pointer hover:bg-white/10 w-full md:w-auto shadow-sm focus:border-[#C48DFF] transition-all"
              >
                <option value="all" className="bg-gray-900">All Locations</option>
                {locations.map(loc => (
                   <option key={loc} value={loc} className="bg-gray-900">{loc}</option>
                ))}
              </select>

              <button 
                onClick={() => setFilters({ language: "all", location: "all" })}
                className="flex items-center gap-1 text-gray-400 hover:text-[#FF6FA1] font-bold text-sm transition-colors mr-2 w-full md:w-auto justify-center"
                title="Reset"
              >
                <RotateCcw size={16} /> Reset
              </button>
           </div>
           <span className="text-gray-900 px-6 py-2.5 rounded-2xl font-bold w-full md:w-auto text-center mt-4 md:mt-0 shadow-md" style={{ backgroundColor: themeColors.accentPurple }}>{jobs.length} Jobs Available</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {jobs.map((job) => (
          <motion.div 
            key={job.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="p-8 rounded-[3rem] border border-white/5 shadow-xl flex flex-col items-center text-center group backdrop-blur-md"
            style={{ backgroundColor: themeColors.glassCardBg }}
          >
            <span className="bg-white/5 border border-white/5 text-[#C48DFF] px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 self-end tracking-widest shadow-inner">{job.language}</span>
            <h3 
              onClick={() => onViewDetails(job)}
              className="text-2xl font-black mb-1 cursor-pointer transition-colors text-white group-hover:text-[#C48DFF]"
            >
              {job.title}
            </h3>
            <p className="text-gray-400 font-bold mb-6">{job.company}</p>
            <div className="w-full space-y-2 mb-8">
              <JobInfoRow icon={<MapPin size={18} style={{ color: themeColors.accentPurple }}/>} label={job.location} />
              <JobInfoRow icon={<DollarSign size={18} className="text-green-400"/>} label={job.salary} />
            </div>
            <button onClick={() => onViewDetails(job)} className="w-full text-gray-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md" style={{ backgroundColor: themeColors.accentPurple }}>
              View Details <ArrowLeft size={20} className="rotate-180"/>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function JobDetailsView({ job, onBack, onApply }) {
  if (!job) return null;
  return (
    <div className="max-w-5xl mx-auto py-10 animate-in fade-in zoom-in duration-300">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-400 font-bold hover:text-[#C48DFF] transition-colors">
        <ArrowLeft size={20} /> Back to Search
      </button>

      <div className="rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/5 backdrop-blur-xl bg-gray-900/50">
        <div className="p-12 text-gray-900 relative" style={{ backgroundColor: themeColors.accentPurple }}>
          <span className="bg-black/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest absolute top-10 left-10">
            {job.language} Specialization
          </span>
          <h1 className="text-4xl md:text-6xl font-black mt-10 leading-tight text-white">{job.title}</h1>
          <p className="text-xl font-bold text-gray-900/80 mt-2 flex items-center gap-2">
            {job.company} <Briefcase size={22}/>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 p-12 gap-12">
          <div className="h-fit">
            <div className="p-8 rounded-[2.5rem] shadow-xl border border-white/5 text-center relative backdrop-blur-md" style={{ backgroundColor: themeColors.glassFormBg }}>
              <p className="text-gray-400 text-xs font-bold mb-8 tracking-widest">JOB OVERVIEW</p>
              <div className="space-y-8">
                <DetailStat icon={<MapPin color={themeColors.accentPurple}/>} title="Location" value={job.location} />
                <DetailStat icon={<DollarSign className="text-green-400"/>} title="Salary" value={job.salary} />
                <DetailStat icon={<Briefcase color={themeColors.accentPurple}/>} title="Experience" value={job.experience} />
                <DetailStat icon={<Clock className="text-[#FF6FA1]"/>} title="Shift" value={job.shift} />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={onApply} 
                className="w-full text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 mt-10 hover:opacity-90 transition-colors border border-white/5"
                style={{ backgroundColor: themeColors.applyBtn }} 
              >
                <Send size={20} className="-mt-1"/> Apply Now
              </motion.button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-12 text-left">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: themeColors.accentPurple }}></div>
                <h3 className="text-3xl font-black text-white">Job Description</h3>
              </div>
              <p className="text-gray-300 text-xl leading-relaxed whitespace-pre-line font-medium">{job.description}</p>
            </section>
            
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-[#FF6FA1] rounded-full"></div>
                <h3 className="text-3xl font-black text-white">Requirements</h3>
              </div>
              <p className="text-gray-300 text-xl leading-relaxed whitespace-pre-line font-medium">{job.requirements}</p>
            </section>

            {job.benefits && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-8 bg-green-400 rounded-full"></div>
                  <h3 className="text-3xl font-black text-white">Benefits</h3>
                </div>
                <p className="text-gray-300 text-xl leading-relaxed whitespace-pre-line font-medium">{job.benefits}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPanelView({ jobs, onViewJob }) {
  const [isAuth, setIsAuth] = useState(false); 
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  
  const [unlockedTabs, setUnlockedTabs] = useState(["recruiter_apps"]); 
  const [activeTab, setActiveTab] = useState(null); 
  
  const [pendingTab, setPendingTab] = useState(null);
  const [secPass, setSecPass] = useState("");
  const [showSecPass, setShowSecPass] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [hideRecruiterApps, setHideRecruiterApps] = useState(false);

  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]); 
  
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", company: "", location: "", language: "", salary: "", description: "", requirements: "", benefits: "", experience: "", shift: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuth) {
      const qApps = query(collection(db, "applications"), orderBy("appliedAt", "desc"));
      const unsubApps = onSnapshot(qApps, (snapshot) => {
        setApplications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      
      const qUsers = query(collection(db, "users"), orderBy("joinedAt", "desc"));
      const unsubUsers = onSnapshot(qUsers, (snapshot) => {
        setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      
      return () => { unsubApps(); unsubUsers(); };
    }
  }, [isAuth]);

  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  const handleRateEnglish = async (appId, level) => {
    try {
      const appRef = doc(db, "applications", appId);
      await updateDoc(appRef, { englishLevel: level });
    } catch (err) {
      alert("Error updating level: " + err.message);
    }
  };

  const handleAppStatus = async (appId, newStatus) => {
    try {
      const appRef = doc(db, "applications", appId);
      await updateDoc(appRef, { status: newStatus });
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const saveJob = async () => {
    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "jobs", editingId), form);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "jobs"), { ...form, createdAt: serverTimestamp() });
      }
      setForm({ title: "", company: "", location: "", language: "", salary: "", description: "", requirements: "", benefits: "", experience: "", shift: "" });
      alert("Job Saved Successfully");
    } catch (e) { alert(e.message); }
    setLoading(false);
  };

  const handleTabClick = (tabName) => {
    if (unlockedTabs.includes(tabName)) {
      setActiveTab(tabName);
      setPendingTab(null);
    } else {
      setPendingTab(tabName);
      setSecPass(""); 
    }
  };

  const handleUnlockTab = () => {
    if (secPass === "scoutech") {
      setUnlockedTabs(prev => [...prev, pendingTab]);
      setActiveTab(pendingTab);
      setPendingTab(null);
      setSecPass("");
    } else if (pendingTab === "jobs" && secPass === "samaltman") {
      setUnlockedTabs(prev => [...prev, "jobs"]);
      setActiveTab(pendingTab);
      setPendingTab(null);
      setSecPass("");
    } else if ((pendingTab === "applications" || pendingTab === "users") && secPass === "rayan") {
      setUnlockedTabs(prev => [...prev, "applications", "users"]);
      setActiveTab(pendingTab);
      setPendingTab(null);
      setSecPass("");
    } else {
      alert("Wrong Password");
    }
  };

  if (!isAuth) return (
    <div className="flex justify-center items-center py-20 px-4">
      <div className="p-10 md:p-12 rounded-[3rem] shadow-2xl border border-white/5 w-full max-w-md text-center backdrop-blur-xl" style={{ backgroundColor: themeColors.glassCardBg }}>
        <Lock className="mx-auto mb-6 text-[#C48DFF]" size={48}/>
        <h2 className="text-2xl font-bold mb-8 text-white">Admin Login</h2>
        <div className="relative mb-6">
           <input 
             type={showPass ? "text" : "password"} 
             onChange={(e)=>setPass(e.target.value)} 
             onKeyDown={(e) => e.key === 'Enter' && (pass === "scoutech" ? setIsAuth(true) : alert("Wrong Password"))}
             className="w-full bg-white/5 p-5 rounded-2xl text-center font-bold outline-none border border-white/5 focus:bg-white/10 focus:border-[#C48DFF] transition-all shadow-sm text-white placeholder:text-gray-500" 
             placeholder="******"
           />
           <button onClick={()=>setShowPass(!showPass)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">{showPass ? <EyeOff size={22}/> : <Eye size={22}/>}</button>
        </div>
        <button 
           onClick={() => {
             if (pass === "scoutech") {
                setIsAuth(true);
             } else {
                alert("Wrong Password");
             }
           }} 
           className="w-full text-gray-900 py-5 rounded-2xl font-bold shadow-xl hover:opacity-90 transition-all" 
           style={{ backgroundColor: themeColors.accentPurple }}
        >
          Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="py-10 space-y-10">
      
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-10 px-4 flex-wrap">
        <button 
           onClick={() => handleTabClick("jobs")} 
           className={`px-8 py-4 rounded-2xl font-bold transition-all shadow-lg border ${activeTab === "jobs" && !pendingTab ? "text-gray-900 border-transparent" : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"}`} 
           style={{ backgroundColor: activeTab === "jobs" && !pendingTab ? themeColors.accentPurple : "" }}
        >
           Manage Jobs
        </button>
        
        <button 
           onClick={() => handleTabClick("applications")} 
           className={`px-8 py-4 rounded-2xl font-bold transition-all shadow-lg border ${activeTab === "applications" || pendingTab === "applications" ? "text-gray-900 border-transparent" : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"}`} 
           style={{ backgroundColor: activeTab === "applications" || pendingTab === "applications" ? themeColors.accentPurple : "" }}
        >
           Applications ({applications.length})
        </button>
        
        <button 
           onClick={() => handleTabClick("recruiter_apps")} 
           className={`px-8 py-4 rounded-2xl font-bold transition-all shadow-lg border ${activeTab === "recruiter_apps" && !pendingTab ? "text-gray-900 border-transparent" : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"}`} 
           style={{ backgroundColor: activeTab === "recruiter_apps" && !pendingTab ? themeColors.accentPurple : "" }}
        >
           Recruiter Apps ({applications.filter(a => a.hrRecruiterName && a.hrRecruiterName.trim() !== "").length})
        </button>

        <button 
           onClick={() => handleTabClick("users")} 
           className={`px-8 py-4 rounded-2xl font-bold transition-all shadow-lg border ${activeTab === "users" || pendingTab === "users" ? "text-gray-900 border-transparent" : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"}`} 
           style={{ backgroundColor: activeTab === "users" || pendingTab === "users" ? themeColors.accentPurple : "" }}
        >
           Users ({users.length})
        </button>
      </div>

      {pendingTab && (
        <div className="flex justify-center items-center py-10 px-4 animate-in zoom-in duration-300">
          <div className="p-10 md:p-12 rounded-[3rem] shadow-2xl border border-white/5 w-full max-w-md text-center backdrop-blur-xl" style={{ backgroundColor: themeColors.glassCardBg }}>
            <Lock className="mx-auto mb-6 text-[#C48DFF]" size={48}/>
            <h2 className="text-2xl font-bold mb-2 text-white">Secure Section</h2>
            <p className="text-gray-400 mb-8 font-medium">
               Password required to open {
                  pendingTab === "jobs" ? "Manage Jobs" : 
                  pendingTab === "applications" ? "Applications" : 
                  "Users"
               }
            </p>
            
            <div className="relative mb-6">
               <input 
                 type={showSecPass ? "text" : "password"} 
                 value={secPass}
                 onChange={(e)=>setSecPass(e.target.value)} 
                 onKeyDown={(e) => e.key === 'Enter' && handleUnlockTab()}
                 className="w-full bg-white/5 p-5 rounded-2xl text-center font-bold outline-none border border-white/5 focus:bg-white/10 focus:border-[#C48DFF] transition-all shadow-sm text-white placeholder:text-gray-500" 
                 placeholder="******"
               />
               <button onClick={()=>setShowSecPass(!showSecPass)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">{showSecPass ? <EyeOff size={22}/> : <Eye size={22}/>}</button>
            </div>
            
            <button 
               onClick={handleUnlockTab} 
               className="w-full text-gray-900 py-5 rounded-2xl font-bold shadow-xl hover:opacity-90 transition-all" 
               style={{ backgroundColor: themeColors.accentPurple }}
            >
               Unlock Tab
            </button>
          </div>
        </div>
      )}

      {!pendingTab && activeTab === null && (
        <div className="text-center py-20 animate-in fade-in">
           <Lock className="mx-auto mb-6 text-gray-500" size={60}/>
           <h2 className="text-3xl font-black mb-4 text-white">Welcome to Admin Dashboard</h2>
           <p className="text-gray-400 font-bold">Please select a tab from above to continue.</p>
        </div>
      )}

      {!pendingTab && activeTab === "jobs" && (
        <div className="space-y-16 animate-in fade-in px-4 text-left">
          <div className="max-w-2xl mx-auto p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-white/5 backdrop-blur-xl" style={{ backgroundColor: themeColors.glassCardBg }}>
            <h2 className="text-3xl font-black mb-10 flex items-center justify-center gap-3 text-white">
              {editingId ? "Edit Job" : "Add New Job"} <Plus className="text-gray-900 rounded-lg p-1.5" size={32} style={{ backgroundColor: themeColors.accentPurple }}/>
            </h2>
            <div className="space-y-6">
              <AdminField label="Job Title" value={form.title} placeholder="e.g. Sales Expert" onChange={v => setForm({...form, title: v})}/>
              <AdminField label="Company" value={form.company} placeholder="e.g. Concentrix" onChange={v => setForm({...form, company: v})}/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminField label="Location" value={form.location} placeholder="Maadi" onChange={v => setForm({...form, location: v})}/>
                <AdminField label="Language" value={form.language} placeholder="German" onChange={v => setForm({...form, language: v})}/>
              </div>
              <AdminField label="Salary" value={form.salary} placeholder="13,000 EGP" onChange={v => setForm({...form, salary: v})}/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminField label="Experience" value={form.experience} placeholder="Entry Level" onChange={v => setForm({...form, experience: v})}/>
                <AdminField label="Shift" value={form.shift} placeholder="Fixed" onChange={v => setForm({...form, shift: v})}/>
              </div>
              <textarea value={form.description} placeholder="Job Description" className="w-full bg-white/5 p-5 rounded-2xl h-32 outline-none font-bold shadow-sm border border-white/5 focus:border-[#C48DFF] text-white placeholder:text-gray-500 transition-all" onChange={e => setForm({...form, description: e.target.value})}/>
              <textarea value={form.requirements} placeholder="Requirements" className="w-full bg-white/5 p-5 rounded-2xl h-32 outline-none font-bold shadow-sm border border-white/5 focus:border-[#C48DFF] text-white placeholder:text-gray-500 transition-all" onChange={e => setForm({...form, requirements: e.target.value})}/>
              <button disabled={loading} onClick={saveJob} className="w-full text-gray-900 py-5 rounded-2xl font-bold text-xl flex justify-center items-center gap-3 shadow-xl hover:opacity-90 transition-all" style={{ backgroundColor: themeColors.accentPurple }}>
                {loading ? <Loader2 className="animate-spin"/> : <Plus size={24}/>} {editingId ? "Save Changes" : "Post Job"}
              </button>
            </div>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            <h3 className="text-2xl font-bold mb-6 mr-4 text-white">Active Jobs</h3>
            {jobs.map(j => (
              <div key={j.id} className="p-6 rounded-3xl shadow-sm border border-white/5 flex justify-between items-center backdrop-blur-sm" style={{ backgroundColor: themeColors.glassCardBg }}>
                <div className="flex gap-2">
                  <button onClick={() => {setEditingId(j.id); setForm(j); window.scrollTo({top:0, behavior:"smooth"});}} className="p-3 bg-white/5 text-[#C48DFF] border border-white/5 rounded-2xl hover:bg-[#C48DFF] hover:text-gray-900 transition-all"><Edit3 size={20}/></button>
                  <button onClick={async () => window.confirm("Are you sure?") && await deleteDoc(doc(db, "jobs", j.id))} className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20}/></button>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-lg text-white">{j.title}</h4>
                  <p className="text-gray-400 font-bold text-sm">{j.company} • {j.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!pendingTab && (activeTab === "applications" || activeTab === "recruiter_apps") && (
        <div className="max-w-6xl mx-auto animate-in fade-in px-4 text-left">
          
          {activeTab === "recruiter_apps" && (
            <div className="mb-8 relative max-w-2xl mx-auto">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C48DFF]"><Search size={22}/></div>
               <input 
                 type="text" 
                 placeholder="Search Recruiter Name or Phone..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-white/5 p-4 pl-12 rounded-2xl font-bold outline-none border border-white/5 shadow-sm focus:border-[#C48DFF] transition-all text-white placeholder:text-gray-500 backdrop-blur-md"
               />
            </div>
          )}

          {activeTab === "applications" && (
            <div className="mb-6 flex justify-end">
               <button 
                 onClick={() => setHideRecruiterApps(!hideRecruiterApps)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm border ${hideRecruiterApps ? 'bg-[#C48DFF]/10 text-[#C48DFF] border-[#C48DFF]/30' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'}`}
               >
                 {hideRecruiterApps ? <EyeOff size={18} /> : <Eye size={18} />}
                 {hideRecruiterApps ? "Show Recruiter Apps" : "Hide Recruiter Apps"}
               </button>
            </div>
          )}

          {(() => {
             let displayedApps = applications;

             if (activeTab === "recruiter_apps") {
                displayedApps = applications.filter(app => app.hrRecruiterName && app.hrRecruiterName.trim() !== "");
                if (searchQuery.trim() !== "") {
                   const query = searchQuery.toLowerCase();
                   displayedApps = displayedApps.filter(app => 
                     (app.hrRecruiterName && app.hrRecruiterName.toLowerCase().includes(query)) ||
                     (app.phone && app.phone.includes(query))
                   );
                }
             } else if (activeTab === "applications") {
                if (hideRecruiterApps) {
                   displayedApps = applications.filter(app => !app.hrRecruiterName || app.hrRecruiterName.trim() === "");
                }
             }
             
             if (displayedApps.length === 0) {
               return <div className="text-center text-gray-500 font-bold py-20">No matching applications found.</div>;
             }
             
             return (
               <div className="grid grid-cols-1 gap-6">
                  {displayedApps.map(app => (
                    <div key={app.id} className="p-8 rounded-[2.5rem] shadow-sm border border-white/5 relative group hover:shadow-xl transition-all backdrop-blur-md" style={{ backgroundColor: themeColors.glassCardBg }}>
                       <div className="absolute top-8 right-8">
                          {app.englishLevel ? (
                            <span className={`px-4 py-2 rounded-xl text-white font-bold text-sm shadow-md ${
                              ["C1", "C2"].includes(app.englishLevel) ? "bg-green-500 text-gray-900" :
                              ["B1", "B2"].includes(app.englishLevel) ? "bg-[#C48DFF] text-gray-900" : "bg-orange-400 text-gray-900"
                            }`}>
                              Level: {app.englishLevel}
                            </span>
                          ) : (
                            <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-gray-400 font-bold text-sm">Not Rated</span>
                          )}
                       </div>

                       <div className="absolute top-8 left-8">
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border ${
                             app.status === 'Accepted' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                             app.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                             'bg-[#C48DFF]/20 text-[#C48DFF] border-[#C48DFF]/30'
                          }`}>
                             {app.status || "New"}
                          </span>
                       </div>
                       
                       <div className="flex flex-col md:flex-row md:items-center gap-8 mt-8">
                          
                          <div 
                             onClick={() => onViewJob(app.jobId)}
                             className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-2 rounded-3xl transition-all group/profile"
                          >
                              <div className="w-16 h-16 rounded-full flex items-center justify-center text-gray-900 font-bold text-2xl transition-colors shadow-md" style={{ backgroundColor: themeColors.accentPurple }}>
                                 {app.name.charAt(0)}
                              </div>
                              <div>
                                 <h3 className="text-2xl font-black transition-colors underline-offset-4 group-hover/profile:underline text-white">
                                   {app.name}
                                 </h3>
                                 <p className="text-sm font-bold mt-1 flex items-center gap-1" style={{ color: themeColors.accentPink }}>
                                    {app.jobTitle} <ExternalLink size={14} className="mb-0.5"/>
                                 </p>
                              </div>
                          </div>

                          <div className="flex-1 space-y-2 mx-4">
                             <p className="text-gray-300 font-bold flex items-center gap-2"><Phone size={16} className="text-[#C48DFF]"/> {app.phone}</p>
                             <div className="flex gap-4 mt-2 text-sm text-gray-400 flex-wrap">
                                 {app.age && <span>Age: {app.age}</span>}
                                 {app.age && <span>•</span>}
                                 <span>Exp: {app.experience}</span>
                                 <span>•</span>
                                 <span>Gender: {app.gender}</span>
                             </div>
                             {app.hrRecruiterName && (
                                <div className="mt-2 text-sm font-bold flex items-center gap-1" style={{ color: themeColors.accentPink }}>
                                   <User size={14}/> Recruiter: {app.hrRecruiterName}
                                </div>
                             )}
                          </div>
                          
                          <div className="w-full md:w-1/3 flex flex-col gap-4">
                               <div className="bg-white/5 border border-white/5 p-4 rounded-3xl flex flex-col items-center gap-2 shadow-sm">
                                   <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Evaluation</span>
                                   {app.audioUrl ? (
                                       <>
                                         <audio controls src={app.audioUrl} className="w-full h-10 invert opacity-90" />
                                         <div className="w-full flex items-center gap-2 mt-2">
                                           <Languages size={16} className="text-[#C48DFF]"/>
                                           <select 
                                             disabled={activeTab === "recruiter_apps"}
                                             className={`w-full p-2 rounded-xl text-sm font-bold border border-white/5 outline-none transition-all shadow-sm ${
                                               activeTab === "recruiter_apps" 
                                               ? "bg-transparent text-gray-500 cursor-not-allowed" 
                                               : "bg-white/5 text-white cursor-pointer focus:border-[#C48DFF]"
                                             }`}
                                             value={app.englishLevel || ""}
                                             onChange={(e) => handleRateEnglish(app.id, e.target.value)}
                                           >
                                             <option className="bg-gray-900" value="" disabled>Rate Level...</option>
                                             <option className="bg-gray-900" value="A1">A1 (Beginner)</option>
                                             <option className="bg-gray-900" value="A2">A2 (Elementary)</option>
                                             <option className="bg-gray-900" value="B1">B1 (Intermediate)</option>
                                             <option className="bg-gray-900" value="B2">B2 (Upper Interm.)</option>
                                             <option className="bg-gray-900" value="C1">C1 (Advanced)</option>
                                             <option className="bg-gray-900" value="C2">C2 (Fluent)</option>
                                           </select>
                                         </div>
                                       </>
                                   ) : (
                                       <span className="text-red-400 text-xs font-bold mb-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/10">No Audio</span>
                                   )}
                                   
                                   <div className="w-full flex items-center gap-2 mt-1">
                                     <CheckCircle size={16} className={
                                        app.status === 'Accepted' ? 'text-green-400' :
                                        app.status === 'Rejected' ? 'text-red-400' : 'text-gray-500'
                                     }/>
                                     <select 
                                       disabled={activeTab === "recruiter_apps"}
                                       className={`w-full p-2 rounded-xl text-sm font-bold border border-white/5 outline-none transition-all shadow-sm ${
                                         activeTab === "recruiter_apps" ? "cursor-not-allowed opacity-70 bg-transparent" : "cursor-pointer focus:border-[#C48DFF]"
                                       } ${
                                         app.status === 'Accepted' ? 'bg-green-500/20 text-green-300 border-green-500/50' :
                                         app.status === 'Rejected' ? 'bg-red-500/20 text-red-300 border-red-500/50' :
                                         'bg-white/5 text-white'
                                       }`}
                                       value={app.status || "New"}
                                       onChange={(e) => handleAppStatus(app.id, e.target.value)}
                                     >
                                       <option className="bg-gray-900" value="New">Status: New</option>
                                       <option className="bg-gray-900" value="Accepted">Accepted</option>
                                       <option className="bg-gray-900" value="Rejected">Rejected</option>
                                     </select>
                                   </div>

                               </div>
                               {app.cvUrl && (
                                   <a href={app.cvUrl} target="_blank" rel="noreferrer" className="text-gray-900 p-3 rounded-2xl flex items-center justify-center gap-2 font-bold hover:opacity-90 transition-colors shadow-md" style={{ backgroundColor: themeColors.accentPurple }}>
                                       <Download size={18}/> View CV
                                   </a>
                               )}
                          </div>
                          
                          {activeTab === "applications" && (
                            <button onClick={async () => window.confirm("Are you sure?") && await deleteDoc(doc(db, "applications", app.id))} className="text-red-400 hover:text-red-300 transition-colors bg-white/5 p-3 rounded-xl border border-white/5 hover:border-red-400/50">
                               <Trash2 size={20} />
                            </button>
                          )}

                       </div>
                    </div>
                  ))}
               </div>
             );
          })()}
        </div>
      )}

      {!pendingTab && activeTab === "users" && (
        <div className="max-w-6xl mx-auto animate-in fade-in px-4 text-left">
          {users.length === 0 ? (
            <div className="text-center text-gray-500 font-bold py-20">No data found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {users.map(user => (
                 <div key={user.id} className="p-8 rounded-[2.5rem] shadow-sm border border-white/5 flex flex-col gap-4 backdrop-blur-md" style={{ backgroundColor: themeColors.glassCardBg }}>
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-full flex items-center justify-center text-gray-900 font-bold text-xl shadow-md" style={{ backgroundColor: themeColors.accentPurple }}>
                          {user.name.charAt(0)}
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-white">{user.name}</h3>
                          <p className="text-sm font-bold text-gray-400 flex items-center gap-1"><Mail size={14} className="text-[#FF6FA1]"/> {user.email}</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm font-bold text-gray-300 mt-2">
                       <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center shadow-sm">📱 {user.phone}</div>
                       <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center shadow-sm">🌍 {user.language}</div>
                       <div className="col-span-2 bg-white/5 border border-white/5 p-2 rounded-xl text-center shadow-sm">💼 {user.experience}</div>
                    </div>
                    {user.cvUrl && (
                        <a href={user.cvUrl} target="_blank" rel="noreferrer" className="bg-[#C48DFF]/10 text-[#C48DFF] border border-[#C48DFF]/20 p-3 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-[#C48DFF]/20 transition-all shadow-sm mt-2">
                           <FileText size={18}/> View CV
                        </a>
                    )}
                    <button onClick={async () => window.confirm("Are you sure?") && await deleteDoc(doc(db, "users", user.id))} className="text-red-400 text-xs self-end mt-2 hover:text-red-300 underline underline-offset-4">Delete User</button>
                 </div>
               ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ApplicationPage({ job, onBack, user }) {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0); 
  const mediaRecorder = React.useRef(null);
  const audioChunks = React.useRef([]);
  const timerRef = React.useRef(null); 
  const [cvFile, setCvFile] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || "", 
    phone: user?.phone || "", 
    age: "", 
    gender: "", 
    status: "", 
    experience: user?.experience || "",
    hrRecruiterName: "" 
  });

  const scriptUrl = "https://script.google.com/macros/s/AKfycbyFMRbyZSjyp8pXTymYBm2zhw_uoEhbXUEvm4CbxE7o9Fxs2Nf-3aovgry-Qa-DDHf8/exec";

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        clearInterval(timerRef.current); 
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 119) { 
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) { alert("Mic required"); }
  };

  const stopRecording = () => { if(mediaRecorder.current) mediaRecorder.current.stop(); setIsRecording(false); };
  
  const handleApply = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.age || !formData.gender || !formData.status || !formData.experience || !audioUrl) {
      alert("Missing Data / تأكد من إدخال جميع البيانات بما فيها العمر والصوت");
      return;
    }
    setLoading(true);
    
    try {
      let publicAudioUrl = "";
      let publicCvUrl = user?.cvUrl || "";

      if (audioUrl) {
        const audioBlob = await fetch(audioUrl).then(r => r.blob());
        const data = new FormData();
        data.append("file", audioBlob);
        data.append("upload_preset", UPLOAD_PRESET); 
        data.append("cloud_name", CLOUD_NAME);
        data.append("resource_type", "video");

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: "POST", body: data });
        const file = await res.json();
        if (file.error) throw new Error(file.error.message);
        publicAudioUrl = file.secure_url;
      }

      if (cvFile) {
        const cvData = new FormData();
        cvData.append("file", cvFile);
        cvData.append("upload_preset", UPLOAD_PRESET);
        cvData.append("cloud_name", CLOUD_NAME);
        cvData.append("resource_type", "auto"); 

        const cvRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: "POST", body: cvData });
        const cvJson = await cvRes.json();
        if (cvJson.error) throw new Error(cvJson.error.message);
        publicCvUrl = cvJson.secure_url;
      }

      const sheetData = new FormData();
      sheetData.append('name', formData.name);
      sheetData.append('phone', formData.phone);
      sheetData.append('age', formData.age); 
      sheetData.append('education', formData.status);
      sheetData.append('gender', formData.gender);
      sheetData.append('experience', formData.experience);
      sheetData.append('jobTitle', job.title);
      sheetData.append('company', job.company);
      sheetData.append('cvUrl', publicCvUrl);
      sheetData.append('audioUrl', publicAudioUrl);
      sheetData.append('hrRecruiterName', formData.hrRecruiterName); 

      // 1. إرسال البيانات لجوجل شيت بدون انتظار
      fetch(scriptUrl, { method: 'POST', body: sheetData, mode: 'no-cors' }).catch(e => console.error(e));
      
      // 2. إظهار رسالة النجاح فوراً للمستخدم
      setSuccess(true);
      setLoading(false);

      // 3. محاولة الإرسال لفايربيس في الخلفية 
      addDoc(collection(db, "applications"), {
        ...formData,
        jobTitle: job.title,
        jobId: job.id,
        audioUrl: publicAudioUrl, 
        cvUrl: publicCvUrl,
        appliedAt: serverTimestamp(),
      }).catch(err => console.log("Firebase is paused"));

    } catch (err) { 
      alert(err.message); 
      setLoading(false);
    }
  };

  if (success) return (
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="py-20 text-center rounded-[3rem] shadow-xl p-12 max-w-lg mx-auto border border-white/5 backdrop-blur-md" style={{ backgroundColor: themeColors.glassFormBg }}>
      <CheckCircle size={60} className="text-green-400 mx-auto mb-6 drop-shadow-md"/>
      <h2 className="text-3xl font-black mb-4 text-white">Application Sent Successfully!</h2>
      <p className="text-gray-300 font-bold mb-8 italic">Our HR team will contact you soon.</p>
      <button onClick={() => window.location.reload()} className="w-full text-white py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all" style={{ backgroundColor: themeColors.applyBtn }}>Back to Home</button>
    </motion.div>
  );

  return (
    <div className="max-w-3xl mx-auto py-10 animate-in slide-in-from-bottom-6 px-4">
      <button onClick={onBack} className="mb-6 font-bold text-gray-400 flex items-center gap-2 hover:text-white transition-all">
        <ArrowLeft size={18} /> Back to Search
      </button>
      <div className="rounded-[3rem] shadow-2xl p-8 md:p-12 border border-white/5 text-left backdrop-blur-md" style={{ backgroundColor: themeColors.glassFormBg }}>
        <h2 className="text-3xl font-black mb-12 text-center" style={{ color: themeColors.accentPurple }}>Apply for this Job</h2>
        
        <form onSubmit={handleApply} className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ApplyField label="Full Name" icon={<User size={20}/>} placeholder="Ahmed Mohamed" value={formData.name} onChange={v => setFormData({...formData, name: v})}/>
              <ApplyField label="Phone" icon={<Phone size={20}/>} placeholder="01xxxxxxxxx" value={formData.phone} type="tel" onChange={v => setFormData({...formData, phone: v})}/>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ApplySelect label="Education Status" icon={<GraduationCap size={20}/>} options={["Student", "Graduate", "Drop-out"]} onChange={v => setFormData({...formData, status: v})} />
              <ApplySelect label="Gender" icon={<Users size={20}/>} options={["Male", "Female"]} onChange={v => setFormData({...formData, gender: v})} />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <ApplySelect label="Experience" icon={<Briefcase size={20}/>} value={formData.experience} options={["No Experience", "Less than 1 year", "1 Year", "2 Years", "3 Years", "4 Years", "5+ Years"]} onChange={v => setFormData({...formData, experience: v})} />
             <ApplyField label="Age" icon={<Calendar size={20}/>} placeholder="e.g. 25" value={formData.age} type="number" onChange={v => setFormData({...formData, age: v})}/>
           </div>

           <div className="space-y-2 text-left">
              <label className="block text-xs font-black text-gray-400 uppercase mr-2 tracking-wide">HR Recruiter Name (Optional)</label>
              <div className="relative">
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500"><User size={20}/></div>
                <input 
                  type="text" 
                  value={formData.hrRecruiterName}
                  placeholder="e.g. Sara Ahmed" 
                  className="w-full bg-white/5 p-5 pr-14 rounded-3xl font-bold outline-none border border-white/5 focus:bg-white/10 focus:border-[#C48DFF] transition-all text-left shadow-sm text-white placeholder:text-gray-500" 
                  onChange={e => setFormData({...formData, hrRecruiterName: e.target.value})}
                />
              </div>
            </div>

           <div className="relative group">
               <input 
                 type="file" 
                 id="cv-upload" 
                 className="hidden" 
                 accept=".pdf,.doc,.docx"
                 onChange={(e) => setCvFile(e.target.files[0])}
               />
               <label htmlFor="cv-upload" className={`border-2 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${cvFile ? 'border-green-400 bg-green-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                 {cvFile ? (
                     <>
                       <CheckCircle className="text-green-400 mb-3" size={36}/>
                       <p className="font-bold text-green-300">{cvFile.name}</p>
                     </>
                 ) : (
                     <>
                       <Upload className="text-[#C48DFF] mb-3 group-hover:scale-110 transition-transform" size={36}/>
                       <p className="font-bold text-gray-300">
                          {user?.cvUrl ? "CV Link via Google Drive is saved" : "Upload CV File (Optional)"}
                       </p>
                     </>
                 )}
               </label>
           </div>

           <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-center space-y-6 shadow-sm">
            <label className="text-lg font-black block text-[#FF6FA1]">Introduce yourself and record a 2-minute record to determine your level</label>
            <div className="flex flex-col items-center gap-6">
              {!audioUrl ? (
                <>
                  {isRecording && <div className="text-3xl font-black text-red-500 animate-pulse font-mono drop-shadow-md">{formatTime(recordingTime)}</div>}
                  <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`w-24 h-24 rounded-full flex items-center justify-center text-gray-900 transition-all shadow-[0_0_20px_rgba(196,141,255,0.4)] ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.6)]' : 'hover:scale-105'}`} style={{ backgroundColor: isRecording ? "" : themeColors.accentPurple }}>
                    {isRecording ? <StopCircle size={40}/> : <Mic size={40}/>}
                  </button>
                </>
              ) : (
                <div className="w-full space-y-4 animate-in fade-in duration-500">
                  {/* فلتر invert بيعكس ألوان المشغل عشان يليق مع الدارك مود */}
                  <audio src={audioUrl} controls className="w-full rounded-full shadow-sm outline-none invert opacity-90" />
                  <button type="button" onClick={()=>{setAudioUrl(null); setRecordingTime(0);}} className="text-red-400 text-sm font-bold underline flex items-center gap-1 mx-auto hover:text-red-300">
                    <Trash2 size={16}/> Reset
                  </button>
                </div>
              )}
            </div>
          </div>

           <motion.button 
             whileTap={{ scale: 0.95 }} 
             type="submit" 
             disabled={loading} 
             className="w-full text-white py-5 rounded-[2rem] font-bold text-2xl flex justify-center items-center gap-3 shadow-[0_10px_30px_rgba(50,150,255,0.3)] hover:shadow-[0_10px_40px_rgba(50,150,255,0.5)] hover:opacity-90 transition-all disabled:bg-gray-700 disabled:shadow-none"
             style={{ backgroundColor: themeColors.applyBtn }} 
           >
             {loading ? <Loader2 className="animate-spin"/> : <><Send size={28} className="-mt-1"/> Submit Application</>}
           </motion.button>
        </form>
      </div>
    </div>
  );
}

// --- Helper Components ---
function JobInfoRow({ icon, label }) {
  return <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center justify-center gap-2 text-gray-300 font-bold text-sm shadow-sm">{icon} {label}</div>;
}
function DetailStat({ icon, title, value }) {
  return <div className="flex flex-col items-center">
    <div className="flex justify-center mb-1">{icon}</div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
    <p className="text-xl font-black text-white leading-tight">{value}</p>
  </div>;
}

function ApplyField({ label, icon, placeholder, onChange, value, type = "text" }) {
  return (
    <div className="space-y-2 text-left">
      <label className="block text-xs font-black text-gray-400 uppercase mr-2 tracking-wide">{label} *</label>
      <div className="relative">
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>
        <input type={type} required defaultValue={value} className="w-full bg-white/5 p-5 pr-14 rounded-3xl font-bold outline-none border border-white/5 focus:bg-white/10 focus:border-[#C48DFF] transition-all text-left shadow-sm text-white placeholder:text-gray-500" placeholder={placeholder} onChange={e => onChange(e.target.value)}/>
      </div>
    </div>
  );
}

function ApplySelect({ label, icon, options, onChange, value }) {
  return (
    <div className="space-y-2 text-left">
      <label className="block text-xs font-black text-gray-400 uppercase mr-2 tracking-wide">{label} *</label>
      <div className="relative">
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>
        <select required defaultValue={value} className="w-full bg-white/5 p-5 pr-14 rounded-3xl font-bold outline-none border border-white/5 focus:bg-white/10 focus:border-[#C48DFF] transition-all shadow-sm text-left appearance-none cursor-pointer text-white" onChange={e => onChange(e.target.value)}>
          <option className="bg-gray-900" value="">Select Option</option>
          {options.map(o => <option className="bg-gray-900" key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
}

function AdminField({ label, placeholder, value, onChange }) {
  return (
    <div className="space-y-2 text-left">
      <label className="block text-sm font-bold text-gray-400 mr-2 uppercase tracking-wide">{label}</label>
      <input className="w-full bg-white/5 p-4 rounded-2xl outline-none font-bold text-left shadow-sm border border-white/5 focus:border-[#C48DFF] text-white placeholder:text-gray-600 transition-all" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}/>
    </div>
  );
}


function Footer({ setView }) {
  return (
    <footer className="radial-footer py-16 mt-20 border-t border-white/5 backdrop-blur-xl" style={{ backgroundColor: themeColors.glassBg }}>
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 font-bold text-white text-left">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 flex flex-col items-center shadow-sm">
             <Mail size={26} style={{ color: themeColors.accentPurple, marginBottom: "8px" }}/>
             <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-black">Email Support</span>
             <p className="text-gray-200 break-all text-center">peakyscouts@gmail.com</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 flex flex-col items-center shadow-sm">
             <Phone size={26} style={{ color: themeColors.accentPurple, marginBottom: "8px" }}/>
             <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-black">Phone / WhatsApp</span>
             <p className="text-gray-200">01097717120</p>
          </motion.div>
        </div>
        <div className="flex flex-col items-center md:items-end space-y-4">
           <div className="flex items-center gap-2 text-3xl font-black">
              <img src={logoImg} alt="PEAKY SCOUTS" className="h-16 object-contain mb-2 drop-shadow-lg" />
           </div>
           <p className="text-gray-400 text-sm font-medium">By order of the Peaky Scouts, we find the best jobs.</p>
           
           <div className="flex gap-4 text-gray-400">
             <motion.a href="https://www.facebook.com/peakyscouts" target="_blank" whileHover={{ y:-5, color: "#1877F2" }}><Facebook size={22}/></motion.a>
             <motion.a href="https://www.instagram.com/Peakyscouts" target="_blank" whileHover={{ y:-5, color: "#E4405F" }}><Instagram size={22}/></motion.a>
             <motion.a href="https://www.tiktok.com/@peakyscouts" target="_blank" whileHover={{ y:-5, color: "#FFFFFF" }}><Video size={22}/></motion.a>
             <motion.a href="https://www.linkedin.com/company/peakyscouts/" target="_blank" whileHover={{ y:-5, color: "#0A66C2" }}><Linkedin size={22}/></motion.a>
             <motion.a href="https://wa.me/201097717120" target="_blank" whileHover={{ y:-5, color: "#25D366" }}><Globe size={22}/></motion.a>
           </div>

           <div className="flex gap-6 text-[10px] text-gray-500 uppercase tracking-widest pt-4">
              <button onClick={() => setView("home")} className="hover:text-[#C48DFF] transition-colors">Home</button>
              <button onClick={() => setView("jobs")} className="hover:text-[#C48DFF] transition-colors">Jobs</button>
              <button onClick={() => setView("admin")} className="hover:text-[#C48DFF] transition-colors">Admin</button>
           </div>
        </div>
      </div>
    </footer>
  );
}