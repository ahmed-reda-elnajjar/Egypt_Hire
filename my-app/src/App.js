import React, { useEffect, useState } from "react"; // حذفت useRef غير المستخدم
import { motion, AnimatePresence } from "framer-motion";
import { 
  Languages, MapPin, Search, Briefcase, Zap, ArrowLeft, Send, Loader2,
  Globe, Instagram, Linkedin, Phone, Mail, DollarSign, Clock, Plus, Eye, EyeOff, Lock, 
  CheckCircle, Trash2, Edit3, User, Upload, LayoutGrid, Mic, StopCircle, GraduationCap, 
  Users, RotateCcw, ExternalLink, FileText, Download, LogIn, LogOut, X, Save 
} from "lucide-react"; // حذفت LayoutDashboard و Copy لأنهم كانوا بيعملوا مشاكل

// تأكد أن ملف الترجمة موجود في نفس المجلد
import { translations } from "./translations";

// إعدادات فايربيس
import { db, auth } from "./firebase"; 
import { 
  collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy 
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

// إعدادات Cloudinary
const CLOUD_NAME = "dvefx5ts8"; 
const UPLOAD_PRESET = "w1cmaa5s"; 

// --- (تصحيح الخطأ) تعريف مكون الكارت هنا ---
function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div whileHover={{ y: -10 }} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">{icon}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-gray-500 font-medium">{desc}</p>
    </motion.div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { y: -12, transition: { duration: 0.3, ease: "easeOut" } }
};

export default function App() {
  const [lang, setLang] = useState("en"); 
  const [view, setView] = useState("home"); 
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({ language: "all", location: "all" });
  
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // حماية الكود لو الترجمة مش موجودة
  const t = translations[lang] || translations['en'];

  useEffect(() => {
    const savedUser = localStorage.getItem("egyptHireUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    signInAnonymously(auth).catch(console.error);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setJobs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const filteredJobs = jobs.filter(job => {
    if (view === "recommended" && currentUser) {
      return job.language?.toLowerCase().includes(currentUser.language?.toLowerCase()) || 
             currentUser.language === "all";
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
      alert(lang === "ar" ? "تم التحديث" : "Updated successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={`min-h-screen bg-[#f8f9fa] text-gray-900 ${lang === "ar" ? "font-sans text-right" : "text-left font-sans"}`}>
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white p-4 border-b sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("home")}>
              <span className="font-bold text-2xl tracking-tight text-slate-800 hidden md:block">EgyptHire</span>
              <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm"><Briefcase size={22}/></div>
            </div>
            <div className="hidden md:flex gap-6 text-sm font-bold text-gray-500">
              <button onClick={() => setView("home")} className={view === "home" ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600"}>{t.nav.home}</button>
              <button onClick={() => setView("jobs")} className={view === "jobs" ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600"}>{t.nav.jobs}</button>
              {currentUser && (
                <button onClick={() => setView("recommended")} className={view === "recommended" ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600"}>{t.nav.recommended}</button>
              )}
            </div>
          </div>
          <div className="flex gap-2 md:gap-4 items-center">
            <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="text-blue-600 bg-blue-50 px-3 md:px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
              <Globe size={16}/> {lang === "en" ? "العربية" : "English"}
            </button>
            
            {!currentUser ? (
              <motion.button 
                whileHover={{ scale: 1.1, color: "#2563eb" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setView("login")} 
                className="text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full"
                title={t.nav.login}
              >
                 <LogIn size={24} />
              </motion.button>
            ) : (
               <motion.div 
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => setShowProfileModal(true)}
                 className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer shadow-lg hover:bg-blue-700 transition-colors border-2 border-blue-100"
               >
                  {currentUser.name.charAt(0).toUpperCase()}
               </motion.div>
            )}

            <motion.button 
              whileHover={{ scale: 1.1, color: "#2563eb" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setView("admin")} 
              className="text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full"
              title={t.nav.admin}
            >
               <LayoutGrid size={24} />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence mode="wait">
        {showProfileModal && currentUser && (
           <UserProfileModal 
              user={currentUser} 
              onClose={() => setShowProfileModal(false)} 
              onLogout={handleLogout}
              onUpdate={handleUpdateProfile}
              t={t}
              lang={lang}
           />
        )}

        <motion.main 
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto px-4 py-8 min-h-[70vh]"
        >
          {view === "home" && <HomeView setView={setView} onFastApply={handleFastApply} t={t} />}
          {view === "jobs" && <JobsListView jobs={filteredJobs} filters={filters} setFilters={setFilters} onViewDetails={(j) => { setSelectedJob(j); setView("details"); }} t={t} />}
          {view === "recommended" && <RecommendedJobsView jobs={filteredJobs} user={currentUser} onViewDetails={(j) => { setSelectedJob(j); setView("details"); }} t={t} />}
          {view === "details" && <JobDetailsView job={selectedJob} onBack={() => setView("jobs")} onApply={() => setView("apply")} t={t} />}
          {view === "apply" && <ApplicationPage job={selectedJob} onBack={() => setView("details")} user={currentUser} t={t} lang={lang} />}
          {view === "login" && <LoginView onLogin={(user) => { setCurrentUser(user); setView("recommended"); }} t={t} lang={lang} />}
          
          {view === "admin" && <AdminPanelView jobs={jobs} onViewJob={(jobId) => {
             const job = jobs.find(j => j.id === jobId);
             if (job) { setSelectedJob(job); setView("details"); }
             else { alert("Error"); }
          }} t={t} />}
        </motion.main>
      </AnimatePresence>

      <Footer setView={setView} t={t} />
    </div>
  );
}

// --- Components ---

function UserProfileModal({ user, onClose, onLogout, onUpdate, t, lang }) {
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative"
      >
        <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X size={20}/></button>
        
        <div className="bg-blue-600 p-8 text-center text-white">
           <div className="w-24 h-24 bg-white text-blue-600 rounded-full flex items-center justify-center text-4xl font-black mx-auto mb-4 shadow-lg border-4 border-blue-100">
              {user.name.charAt(0).toUpperCase()}
           </div>
           <h2 className="text-2xl font-black">{isEditing ? t.profile.edit : user.name}</h2>
           {!isEditing && <p className="opacity-80 font-bold dir-ltr">{user.email}</p>}
        </div>

        <div className={`p-8 space-y-6 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
           {isEditing ? (
             <div className="space-y-4">
                <AdminField label="Name" value={editForm.name} onChange={(v) => setEditForm({...editForm, name: v})} placeholder="Name" />
                <AdminField label={t.profile.phone} value={editForm.phone} onChange={(v) => setEditForm({...editForm, phone: v})} placeholder="Phone" />
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400">{t.profile.language}</label>
                      <select value={editForm.language} onChange={(e) => setEditForm({...editForm, language: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl font-bold border-none outline-none">
                         {["English", "German", "French", "Italian", "Spanish"].map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400">{t.profile.experience}</label>
                      <select value={editForm.experience} onChange={(e) => setEditForm({...editForm, experience: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl font-bold border-none outline-none">
                         {["No Experience", "Less than 1 year", "1 Year", "2 Years", "3 Years", "4 Years", "5+ Years"].map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                   </div>
                </div>
                <button onClick={handleSave} className="w-full bg-green-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-all">
                   <Save size={18}/> {t.profile.save}
                </button>
             </div>
           ) : (
             <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                   <span className="font-bold text-slate-800">{user.phone}</span>
                   <span className="text-gray-400 text-sm"><Phone size={16} className="inline mx-1"/> {t.profile.phone}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                   <span className="font-bold text-slate-800">{user.language}</span>
                   <span className="text-gray-400 text-sm"><Languages size={16} className="inline mx-1"/> {t.profile.language}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                   <span className="font-bold text-slate-800">{user.experience}</span>
                   <span className="text-gray-400 text-sm"><Briefcase size={16} className="inline mx-1"/> {t.profile.experience}</span>
                </div>
                
                {user.cvUrl && (
                   <a href={user.cvUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-blue-600 font-bold bg-blue-50 p-4 rounded-2xl hover:bg-blue-100 transition-all">
                      <FileText size={18}/> View CV
                   </a>
                )}

                <button onClick={() => setIsEditing(true)} className="w-full bg-slate-800 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all">
                   <Edit3 size={18}/> {t.profile.edit}
                </button>
             </div>
           )}

           <div className="border-t border-gray-100 pt-6 mt-4">
              <button onClick={onLogout} className="w-full text-red-500 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 transition-all">
                 <LogOut size={18}/> {t.profile.logout}
              </button>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function HomeView({ setView, onFastApply, t }) {
  return (
    <div className="text-center py-20 space-y-12">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          {t.home.badge}
        </div>
        <h1 className="text-5xl md:text-7xl font-black leading-tight text-slate-900">
          {t.home.hero}
        </h1>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-6 pt-4">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setView("jobs")} 
          className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-bold text-xl shadow-xl flex items-center gap-3"
        >
          {t.home.searchBtn} <Search size={22}/>
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onFastApply}
          className="bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-bold text-xl border border-gray-100 shadow-sm flex items-center gap-3"
        >
          {t.home.fastApply} <Zap size={22} className="text-orange-400 fill-orange-400"/>
        </motion.button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
         <FeatureCard icon={<Languages size={32}/>} title={t.home.features.languages.title} desc={t.home.features.languages.desc} />
         <FeatureCard icon={<CheckCircle size={32}/>} title={t.home.features.fast.title} desc={t.home.features.fast.desc} />
         <FeatureCard icon={<MapPin size={32}/>} title={t.home.features.locations.title} desc={t.home.features.locations.desc} />
      </div>
    </div>
  );
}

function LoginView({ onLogin, t, lang }) {
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
      <div className={`bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-50 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
        <h2 className="text-4xl font-black mb-2 text-slate-800 text-center">{t.nav.login}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ApplyField label="Full Name" icon={<User size={18}/>} placeholder="Ahmed Mohamed" onChange={v => setFormData({...formData, name: v})}/>
              <ApplyField label="Email" icon={<Mail size={18}/>} placeholder="ahmed@example.com" onChange={v => setFormData({...formData, email: v})}/>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ApplyField label={t.profile.phone} icon={<Phone size={18}/>} placeholder="01xxxxxxxxx" onChange={v => setFormData({...formData, phone: v})}/>
              <ApplyField label="WhatsApp" icon={<Phone size={18}/>} placeholder="01xxxxxxxxx" onChange={()=>{}}/> 
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <ApplySelect label={t.profile.language} icon={<Languages size={18}/>} options={["English", "German", "French", "Italian", "Spanish"]} onChange={v => setFormData({...formData, language: v})}/>
             <ApplySelect label={t.profile.experience} icon={<Briefcase size={18}/>} options={["No Experience", "Less than 1 year", "1 Year", "2 Years", "3 Years", "4 Years", "5+ Years"]} onChange={v => setFormData({...formData, experience: v})}/>
           </div>

           <div className="space-y-2">
             <label className="block text-xs font-black text-gray-400 uppercase mx-2 tracking-wide">{t.apply.cvLink || "CV Link"}</label>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="https://drive.google.com/..." 
                  className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border border-transparent focus:bg-white focus:border-blue-200 transition-all text-sm"
                  onChange={e => setFormData({...formData, cvUrl: e.target.value})}
                />
                <div className="relative">
                   <input type="file" id="cv-quick" className="hidden" accept=".pdf,.doc" onChange={e => setCvFile(e.target.files[0])} />
                   <label htmlFor="cv-quick" className={`h-full px-4 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${cvFile ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                      {cvFile ? <CheckCircle size={20}/> : <Upload size={20}/>}
                   </label>
                </div>
             </div>
           </div>

           <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-xl shadow-xl flex items-center justify-center gap-2 mt-4 hover:bg-blue-700 transition-all">
             {loading ? <Loader2 className="animate-spin"/> : <><Send size={20} className={lang === 'ar' ? "rotate-180" : ""}/> Submit</>}
           </button>
        </form>
      </div>
    </div>
  );
}

function RecommendedJobsView({ jobs, user, onViewDetails, t }) {
  return (
    <div className="space-y-8 animate-in fade-in">
       <div className="bg-blue-600 text-white p-8 rounded-[3rem] shadow-xl text-center relative overflow-hidden">
          <div className="relative z-10">
             <h2 className="text-3xl font-black mb-2">Hello, {user.name.split(" ")[0]}! 🚀</h2>
             <p className="opacity-90 font-bold">{t.profile.experience}: {user.experience} • {t.profile.language}: {user.language}</p>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600 to-blue-400 opacity-50"></div>
       </div>

       {jobs.length > 0 ? (
         <JobsListView jobs={jobs} filters={{language: "all", location: "all"}} setFilters={()=>{}} onViewDetails={onViewDetails} hideFilters={true} t={t} />
       ) : (
         <div className="text-center py-20 text-gray-400 font-bold">
            No recommended jobs found.
         </div>
       )}
    </div>
  );
}

function JobsListView({ jobs, filters, setFilters, onViewDetails, hideFilters = false, t }) {
  return (
    <div className="space-y-10">
      {!hideFilters && (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
           <div className="flex gap-4 items-center flex-1">
              <select 
                value={filters.language}
                onChange={(e) => setFilters(p => ({...p, language: e.target.value}))} 
                className="bg-gray-50 p-4 rounded-2xl border-none font-bold text-gray-500 outline-none cursor-pointer hover:bg-gray-100 w-full md:w-auto"
              >
                <option value="all">{t.jobs.allLanguages}</option>
                <option value="English">English</option>
                <option value="German">German</option>
              </select>
              <select 
                value={filters.location}
                onChange={(e) => setFilters(p => ({...p, location: e.target.value}))} 
                className="bg-gray-50 p-4 rounded-2xl border-none font-bold text-gray-500 outline-none cursor-pointer hover:bg-gray-100 w-full md:w-auto"
              >
                <option value="all">{t.jobs.allLocations}</option>
                <option value="Maadi">Maadi</option>
                <option value="Nasr City">Nasr City</option>
              </select>

              <button 
                onClick={() => setFilters({ language: "all", location: "all" })}
                className="flex items-center gap-1 text-gray-400 hover:text-red-500 font-bold text-sm transition-colors mr-2 w-full md:w-auto justify-center"
                title={t.jobs.reset}
              >
                <RotateCcw size={16} /> {t.jobs.reset}
              </button>
           </div>
           <span className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold w-full md:w-auto text-center mt-4 md:mt-0">{jobs.length} {t.jobs.available}</span>
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
            className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-xl flex flex-col items-center text-center group"
          >
            <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 self-end tracking-widest">{job.language}</span>
            <h3 
              onClick={() => onViewDetails(job)}
              className="text-2xl font-black mb-1 cursor-pointer hover:text-blue-600 transition-colors"
            >
              {job.title}
            </h3>
            <p className="text-gray-400 font-bold mb-6">{job.company}</p>
            <div className="w-full space-y-2 mb-8">
              <JobInfoRow icon={<MapPin size={18} className="text-blue-500"/>} label={job.location} />
              <JobInfoRow icon={<DollarSign size={18} className="text-green-500"/>} label={job.salary} />
            </div>
            <button onClick={() => onViewDetails(job)} className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all">
              {t.jobs.details} <ArrowLeft size={20} className={document.documentElement.dir === 'rtl' ? "rotate-180" : ""}/>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function JobDetailsView({ job, onBack, onApply, t }) {
  if (!job) return null;
  return (
    <div className="max-w-5xl mx-auto py-10 animate-in fade-in zoom-in duration-300">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-400 font-bold hover:text-blue-600 transition-colors">
        <ArrowLeft size={20} className={document.documentElement.dir === 'rtl' ? "rotate-180" : ""}/> {t.backSearch}
      </button>

      <div className="bg-white rounded-[3.5rem] overflow-hidden shadow-2xl border border-gray-50">
        <div className="bg-blue-600 p-12 text-white relative">
          <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest absolute top-10 left-10">
            {job.language} {t.specialization}
          </span>
          <h1 className="text-4xl md:text-6xl font-black mt-10 leading-tight">{job.title}</h1>
          <p className="text-xl font-bold opacity-90 mt-2 flex items-center gap-2">
            {job.company} <Briefcase size={22}/>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 p-12 gap-12">
          <div className="h-fit">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200 border border-gray-50 text-center relative">
              <p className="text-gray-400 text-xs font-bold mb-8">{t.jobs.details}</p>
              <div className="space-y-8">
                <DetailStat icon={<MapPin className="text-blue-600"/>} title={t.location} value={job.location} />
                <DetailStat icon={<DollarSign className="text-green-600"/>} title={t.salary} value={job.salary} />
                <DetailStat icon={<Briefcase className="text-purple-600"/>} title={t.expReq} value={job.experience} />
                <DetailStat icon={<Clock className="text-orange-600"/>} title={t.shift} value={job.shift} />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={onApply} 
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 flex items-center justify-center gap-2 mt-10 hover:bg-blue-700 transition-colors"
              >
                <Send size={20} className={document.documentElement.dir === 'rtl' ? "rotate-180 -mt-1" : "-mt-1"}/> {t.apply.title}
              </motion.button>
            </div>
          </div>

          <div className={`lg:col-span-2 space-y-12 ${document.documentElement.dir === 'rtl' ? 'text-right' : 'text-left'}`}>
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                <h3 className="text-3xl font-black text-slate-800">{t.jobDesc}</h3>
              </div>
              <p className="text-gray-500 text-xl leading-relaxed whitespace-pre-line font-medium">{job.description}</p>
            </section>
            
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-orange-500 rounded-full"></div>
                <h3 className="text-3xl font-black text-slate-800">{t.requirements}</h3>
              </div>
              <p className="text-gray-500 text-xl leading-relaxed whitespace-pre-line font-medium">{job.requirements}</p>
            </section>

            {job.benefits && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-8 bg-green-500 rounded-full"></div>
                  <h3 className="text-3xl font-black text-slate-800">{t.benefits}</h3>
                </div>
                <p className="text-gray-500 text-xl leading-relaxed whitespace-pre-line font-medium">{job.benefits}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPanelView({ jobs, onViewJob, t }) {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [activeTab, setActiveTab] = useState("jobs");
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]); 
  
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", company: "", location: "", language: "", salary: "", description: "", requirements: "", benefits: "", experience: "", shift: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuth && activeTab === "applications") {
      const q = query(collection(db, "applications"), orderBy("appliedAt", "desc"));
      const unsub = onSnapshot(q, (snapshot) => {
        setApplications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }
    if (isAuth && activeTab === "users") {
      const q = query(collection(db, "users"), orderBy("joinedAt", "desc"));
      const unsub = onSnapshot(q, (snapshot) => {
        setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }
  }, [isAuth, activeTab]);

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
      alert(t.successMsg);
    } catch (e) { alert(e.message); }
    setLoading(false);
  };

  if (!isAuth) return (
    <div className="flex justify-center items-center py-20 px-4">
      <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl border border-gray-50 w-full max-w-md text-center">
        <Lock className="mx-auto mb-6 text-gray-300" size={48}/>
        <h2 className="text-2xl font-bold mb-8">{t.admin.login}</h2>
        <div className="relative mb-6">
           <input type={showPass ? "text" : "password"} onChange={(e)=>setPass(e.target.value)} className="w-full bg-blue-50/30 p-5 rounded-2xl text-center font-bold outline-none border border-blue-50 focus:border-blue-500 transition-all" placeholder="******"/>
           <button onClick={()=>setShowPass(!showPass)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{showPass ? <EyeOff size={22}/> : <Eye size={22}/>}</button>
        </div>
        <button onClick={() => pass === "negrootech" ? setIsAuth(true) : alert("Wrong Password")} className="w-full bg-[#0f172a] text-white py-5 rounded-2xl font-bold shadow-xl">{t.nav.login}</button>
      </div>
    </div>
  );

  return (
    <div className="py-10 space-y-10">
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-10 px-4">
        <button onClick={() => setActiveTab("jobs")} className={`px-8 py-4 rounded-2xl font-bold transition-all ${activeTab === "jobs" ? "bg-blue-600 text-white shadow-lg" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
           {t.admin.jobsTab}
        </button>
        <button onClick={() => setActiveTab("applications")} className={`px-8 py-4 rounded-2xl font-bold transition-all ${activeTab === "applications" ? "bg-blue-600 text-white shadow-lg" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
           {t.admin.applicationsTab} ({applications.length})
        </button>
        <button onClick={() => setActiveTab("users")} className={`px-8 py-4 rounded-2xl font-bold transition-all ${activeTab === "users" ? "bg-blue-600 text-white shadow-lg" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
           {t.admin.usersTab} ({users.length})
        </button>
      </div>

      {activeTab === "jobs" && (
        <div className={`space-y-16 animate-in fade-in px-4 ${document.documentElement.dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-gray-50">
            <h2 className="text-3xl font-black mb-10 flex items-center justify-center gap-3">
              {editingId ? t.admin.editJob : t.admin.addJob} <Plus className="bg-black text-white rounded-lg p-1.5" size={32}/>
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
              <textarea value={form.description} placeholder={t.jobDesc} className="w-full bg-gray-50 p-5 rounded-2xl h-32 outline-none font-bold shadow-sm border border-gray-100" onChange={e => setForm({...form, description: e.target.value})}/>
              <textarea value={form.requirements} placeholder={t.requirements} className="w-full bg-gray-50 p-5 rounded-2xl h-32 outline-none font-bold shadow-sm border border-gray-100" onChange={e => setForm({...form, requirements: e.target.value})}/>
              <button disabled={loading} onClick={saveJob} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-xl flex justify-center items-center gap-3 shadow-xl">
                {loading ? <Loader2 className="animate-spin"/> : <Plus size={24}/>} {editingId ? t.admin.save : t.admin.postJob}
              </button>
            </div>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            <h3 className="text-2xl font-bold mb-6 mr-4">{t.admin.jobsTab}</h3>
            {jobs.map(j => (
              <div key={j.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex justify-between items-center">
                <div className="flex gap-2">
                  <button onClick={() => {setEditingId(j.id); setForm(j); window.scrollTo({top:0, behavior:"smooth"});}} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={20}/></button>
                  <button onClick={async () => window.confirm(t.confirmDelete) && await deleteDoc(doc(db, "jobs", j.id))} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20}/></button>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-800">{j.title}</h4>
                  <p className="text-gray-400 font-bold text-sm">{j.company} • {j.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "applications" && (
        <div className={`max-w-6xl mx-auto animate-in fade-in px-4 ${document.documentElement.dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          {applications.length === 0 ? (
            <div className="text-center text-gray-400 font-bold py-20">{t.noData}</div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
               {applications.map(app => (
                 <div key={app.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 relative group hover:shadow-xl transition-all">
                    <div className="absolute top-8 left-8">
                       <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold">{app.status || "New"}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-8">
                       
                       <div 
                          onClick={() => onViewJob(app.jobId)}
                          className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-3xl transition-all group/profile"
                       >
                           <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl group-hover/profile:bg-blue-600 group-hover/profile:text-white transition-colors">
                              {app.name.charAt(0)}
                           </div>
                           <div>
                              <h3 className="text-2xl font-black text-slate-800 group-hover/profile:text-blue-600 transition-colors underline-offset-4 group-hover/profile:underline">
                                {app.name}
                              </h3>
                              <p className="text-sm font-bold text-blue-600 mt-1 flex items-center gap-1 group-hover/profile:text-blue-700">
                                 {app.jobTitle} <ExternalLink size={14} className="mb-0.5"/>
                              </p>
                           </div>
                       </div>

                       <div className="flex-1 space-y-2 mx-4">
                          <p className="text-gray-400 font-bold flex items-center gap-2"><Phone size={16}/> {app.phone}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                             <span>{t.expReq}: {app.experience}</span>
                             <span>•</span>
                             <span>{t.gender}: {app.gender}</span>
                          </div>
                       </div>
                       
                       <div className="w-full md:w-1/3 flex flex-col gap-4">
                            <div className="bg-gray-50 p-4 rounded-3xl flex flex-col items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 uppercase">Audio</span>
                                {app.audioUrl ? (
                                    <audio controls src={app.audioUrl} className="w-full h-10" />
                                ) : (
                                    <span className="text-red-400 text-xs font-bold">No Audio</span>
                                )}
                            </div>
                            {app.cvUrl && (
                                <a href={app.cvUrl} target="_blank" rel="noreferrer" className="bg-blue-600 text-white p-3 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-blue-700 transition-colors">
                                    <Download size={18}/> {t.viewCV}
                                </a>
                            )}
                       </div>
                       
                       <button onClick={async () => window.confirm(t.confirmDelete) && await deleteDoc(doc(db, "applications", app.id))} className="text-red-300 hover:text-red-500 transition-colors">
                          <Trash2 size={24} />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      )}

      {/* --- Registered Users Tab --- */}
      {activeTab === "users" && (
        <div className={`max-w-6xl mx-auto animate-in fade-in px-4 ${document.documentElement.dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          {users.length === 0 ? (
            <div className="text-center text-gray-400 font-bold py-20">{t.noData}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {users.map(user => (
                 <div key={user.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                       <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                          {user.name.charAt(0)}
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-slate-800">{user.name}</h3>
                          <p className="text-sm font-bold text-gray-400 flex items-center gap-1"><Mail size={14}/> {user.email}</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm font-bold text-gray-600">
                       <div className="bg-gray-50 p-2 rounded-xl text-center">📱 {user.phone}</div>
                       <div className="bg-gray-50 p-2 rounded-xl text-center">🌍 {user.language}</div>
                       <div className="col-span-2 bg-gray-50 p-2 rounded-xl text-center">💼 {user.experience}</div>
                    </div>
                    {user.cvUrl && (
                        <a href={user.cvUrl} target="_blank" rel="noreferrer" className="bg-purple-50 text-purple-600 p-3 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-purple-100 transition-colors mt-2">
                           <FileText size={18}/> {t.viewCV}
                        </a>
                    )}
                    <button onClick={async () => window.confirm(t.confirmDelete) && await deleteDoc(doc(db, "users", user.id))} className="text-red-300 text-xs self-end mt-2 hover:text-red-500">{t.delete}</button>
                 </div>
               ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ApplicationPage({ job, onBack, user, t, lang }) {
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
    gender: "", 
    status: "", 
    experience: user?.experience || ""
  });

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
    if (!formData.name || !formData.phone || !formData.gender || !formData.status || !formData.experience || !audioUrl) {
      alert("Missing Data");
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

      await addDoc(collection(db, "applications"), {
        ...formData,
        jobTitle: job.title,
        jobId: job.id,
        audioUrl: publicAudioUrl, 
        cvUrl: publicCvUrl,
        appliedAt: serverTimestamp(),
      });
      setSuccess(true);
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  if (success) return (
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="py-20 text-center bg-white rounded-[3rem] shadow-xl p-12 max-w-lg mx-auto border border-gray-50 mx-4">
      <CheckCircle size={60} className="text-green-500 mx-auto mb-6"/>
      <h2 className="text-3xl font-black mb-4 text-slate-800">{t.successMsg}</h2>
      <p className="text-gray-400 font-bold mb-8 italic">{t.hrContact}</p>
      <button onClick={() => window.location.reload()} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100">{t.backHome}</button>
    </motion.div>
  );

  return (
    <div className="max-w-3xl mx-auto py-10 animate-in slide-in-from-bottom-6 px-4">
      <button onClick={onBack} className="mb-6 font-bold text-gray-400 flex items-center gap-2 hover:text-blue-600 transition-all">
        <ArrowLeft size={18} className={document.documentElement.dir === 'rtl' ? "rotate-180" : ""}/> {t.backSearch}
      </button>
      <div className={`bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-gray-100 ${document.documentElement.dir === 'rtl' ? 'text-right' : 'text-left'}`}>
        <h2 className="text-3xl font-black mb-12 text-center text-slate-900">{t.applyJob}</h2>
        
        <form onSubmit={handleApply} className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ApplyField label={t.fullName} icon={<User size={20}/>} placeholder="Ahmed Mohamed" value={formData.name} onChange={v => setFormData({...formData, name: v})}/>
              <ApplyField label={t.phone} icon={<Phone size={20}/>} placeholder="01xxxxxxxxx" value={formData.phone} onChange={v => setFormData({...formData, phone: v})}/>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ApplySelect label={t.status} icon={<GraduationCap size={20}/>} options={[t.student, t.grad, t.dropout]} onChange={v => setFormData({...formData, status: v})}/>
              <ApplySelect label={t.gender} icon={<Users size={20}/>} options={[t.male, t.female]} onChange={v => setFormData({...formData, gender: v})}/>
           </div>

           <ApplySelect label={t.experience} icon={<Briefcase size={20}/>} value={formData.experience} options={[t.noExp, t.lessYear, t.oneYear, t.twoYears, t.threeYears, t.fourYears, t.fivePlus]} onChange={v => setFormData({...formData, experience: v})}/>

           <div className="relative group">
               <input 
                  type="file" 
                  id="cv-upload" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvFile(e.target.files[0])}
               />
               <label htmlFor="cv-upload" className={`border-2 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${cvFile ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50/50 hover:bg-blue-50'}`}>
                  {cvFile ? (
                      <>
                        <CheckCircle className="text-green-500 mb-3" size={36}/>
                        <p className="font-bold text-green-700">{cvFile.name}</p>
                      </>
                  ) : (
                      <>
                        <Upload className="text-gray-400 mb-3 group-hover:text-blue-500" size={36}/>
                        <p className="font-bold text-gray-500 group-hover:text-blue-600">
                           {user?.cvUrl ? t.cvLink : t.uploadCV}
                        </p>
                      </>
                  )}
               </label>
           </div>

           <div className="bg-blue-50/30 p-8 rounded-[2rem] border border-blue-100 text-center space-y-6">
            <label className="text-lg font-black text-blue-900 block">{t.recordAudio}</label>
            <div className="flex flex-col items-center gap-6">
              {!audioUrl ? (
                <>
                  {isRecording && <div className="text-3xl font-black text-red-500 animate-pulse font-mono">{formatTime(recordingTime)}</div>}
                  <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all shadow-2xl ${isRecording ? 'bg-red-500 animate-pulse shadow-red-200' : 'bg-blue-600 shadow-blue-300 hover:scale-105'}`}>
                    {isRecording ? <StopCircle size={40}/> : <Mic size={40}/>}
                  </button>
                </>
              ) : (
                <div className="w-full space-y-4 animate-in fade-in duration-500">
                  <audio src={audioUrl} controls className="w-full rounded-full shadow-sm" />
                  <button type="button" onClick={()=>{setAudioUrl(null); setRecordingTime(0);}} className="text-red-500 text-sm font-bold underline flex items-center gap-1 mx-auto hover:text-red-700">
                    <Trash2 size={16}/> {t.reset}
                  </button>
                </div>
              )}
            </div>
          </div>

           <motion.button 
             whileTap={{ scale: 0.95 }} 
             type="submit" 
             disabled={loading} 
             className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-bold text-2xl flex justify-center items-center gap-3 shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:shadow-none"
           >
             {loading ? <Loader2 className="animate-spin"/> : <><Send size={28} className={document.documentElement.dir === 'rtl' ? "rotate-180 -mt-1" : "-mt-1"}/> {t.submit}</>}
           </motion.button>
        </form>
      </div>
    </div>
  );
}

// --- Helper Components ---
function JobInfoRow({ icon, label }) {
  return <div className="bg-gray-50 p-3 rounded-2xl flex items-center justify-center gap-2 text-gray-600 font-bold text-sm shadow-sm">{icon} {label}</div>;
}
function DetailStat({ icon, title, value }) {
  return <div className="flex flex-col items-center">
    <div className="flex justify-center mb-1">{icon}</div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
    <p className="text-xl font-black text-slate-800 leading-tight">{value}</p>
  </div>;
}
function ApplyField({ label, icon, placeholder, onChange, value }) {
  return (
    <div className="space-y-2 text-right">
      <label className="block text-xs font-black text-gray-400 uppercase mr-2 tracking-wide">{label} *</label>
      <div className="relative">
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        <input required defaultValue={value} className="w-full bg-gray-50 p-5 pr-14 rounded-3xl font-bold outline-none border border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all text-right shadow-sm placeholder:text-gray-300" placeholder={placeholder} onChange={e => onChange(e.target.value)}/>
      </div>
    </div>
  );
}
function ApplySelect({ label, icon, options, onChange, value }) {
  return (
    <div className="space-y-2 text-right">
      <label className="block text-xs font-black text-gray-400 uppercase mr-2 tracking-wide">{label} *</label>
      <div className="relative">
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        <select required defaultValue={value} className="w-full bg-gray-50 p-5 pr-14 rounded-3xl font-bold outline-none border border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm text-right appearance-none cursor-pointer text-gray-600" onChange={e => onChange(e.target.value)}>
          <option value="">Select Option</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
}
function AdminField({ label, placeholder, value, onChange }) {
  return <div className="space-y-2 text-right">
    <label className="block text-sm font-bold text-gray-400 mr-2 uppercase tracking-wide">{label}</label>
    <input className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold text-right shadow-sm border border-gray-100 focus:ring-2 focus:ring-blue-500" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}/>
  </div>;
}

function Footer({ setView, t }) {
  return (
    <footer className="bg-white border-t py-16 mt-20">
      <div className={`max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 font-bold text-slate-800 ${document.documentElement.dir === 'rtl' ? 'text-right' : 'text-left'}`}>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-center shadow-sm">
             <Mail className="text-blue-600 mb-2" size={26}/>
             <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-black">{t.email}</span>
             <p className="text-slate-800 break-all text-center">a7mdelnagar297@gmail.com</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-center shadow-sm">
             <Phone className="text-blue-600 mb-2" size={26}/>
             <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-black">{t.phone}</span>
             <p className="text-slate-800" dir="ltr">01099119352</p>
          </motion.div>
        </div>
        <div className="flex flex-col items-center md:items-end space-y-4">
           <div className="flex items-center gap-2 text-3xl font-black">EgyptHire <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm shadow-blue-200"><Briefcase size={22}/></div></div>
           <p className="text-gray-400 text-sm font-medium">We connect talents with top companies.</p>
           <div className="flex gap-4 text-gray-400">
              {[Globe, Instagram, Linkedin].map((Icon, i) => (
                <motion.div key={i} whileHover={{ y:-5, color: "#2563eb" }} className="cursor-pointer transition-colors"><Icon size={22}/></motion.div>
              ))}
           </div>
           <div className="flex gap-6 text-[10px] text-gray-300 uppercase tracking-widest pt-4">
              <button onClick={() => setView("home")} className="hover:text-blue-600 transition-colors">{t.navHome}</button>
              <button onClick={() => setView("jobs")} className="hover:text-blue-600 transition-colors">{t.navJobs}</button>
              <button onClick={() => setView("admin")} className="hover:text-blue-600 transition-colors">{t.navAdmin}</button>
           </div>
        </div>
      </div>
    </footer>
  );
}