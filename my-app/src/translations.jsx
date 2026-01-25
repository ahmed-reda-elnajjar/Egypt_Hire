import React, { useState, useEffect, useMemo } from 'react';

// 1. استدعاءات الأيقونات
import { 
  Search, MapPin, Globe, Briefcase, Clock, 
  DollarSign, CheckCircle, ChevronRight, 
  LayoutDashboard, Plus, Users, Trash2, 
  Eye, ArrowLeft, X, Languages, Filter, 
  Check, Send, Loader2, Lock, Download, Star,
  Zap
} from 'lucide-react';

// 2. استدعاءات فايربيس
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  doc, updateDoc, deleteDoc, query, where 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, 
  signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';

// ---------------------------------------------------------
// 3. إعدادات التشغيل (تم التصحيح هنا ليعمل بدون أخطاء)
// ---------------------------------------------------------

// تعريف إعدادات وهمية لتشغيل الواجهة
const firebaseConfig = { 
  apiKey: "demo-api-key", 
  authDomain: "demo-app.firebaseapp.com", 
  projectId: "demo-project" 
}; 

// تعريف المتغيرات مباشرة بدلاً من البحث عنها
const appId = "egy-recruit-pro";
const __initial_auth_token = "demo-token";

// تهيئة التطبيق مع حماية (Try/Catch) لمنع توقف الموقع
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.log("Running in Offline/Demo Mode");
}

// ---------------------------------------------------------
// 4. البيانات والترجمات
// ---------------------------------------------------------
const translations = {
  en: {
    navHome: "Home", navJobs: "Find Job", navApply: "Apply Now",
    heroTitle: "Find Your Next Call Center Job in Egypt",
    heroSub: "The fastest way to get hired. We connect Arabic, English, French, and Spanish speakers with premium global companies.",
    browseBtn: "Find Job", quickApplyBtn: "Quick Apply",
    langFocus: "Language Focus", langFocusDesc: "Specialized roles for speakers of Arabic, English, French, Spanish, and German.",
    fastTrack: "Fast-Track Hiring", fastTrackDesc: "Our direct connection with HR means you get interviews within 48 hours.",
    premiumLoc: "Premium Locations", premiumLocDesc: "Work in the best hubs: Maadi, New Cairo, 6th October, or from home.",
    filterLang: "Language", filterLoc: "Location", filterExp: "Experience", experienceNeeded: "Experience Needed",
    allLangs: "All Languages", allLocs: "All Locations", anyExp: "Any Experience",
    reset: "Reset", jobsCount: "Jobs Found", viewDetails: "View Details",
    jobOverview: "Job Overview", salary: "Salary", shift: "Shift", benefits: "Benefits", description: "Job Description",
    applyForJob: "Apply for this Job", fullName: "Full Name", email: "Email Address", phone: "Phone Number", whatsapp: "WhatsApp Number",
    cvLink: "Link to your CV (Drive/Dropbox)", submitApp: "Submit Application", appSubmitted: "Application Submitted!",
    smartMatch: "Based on your skills, our smart engine matched you with these top roles:",
    adminTitle: "Recruiter Dashboard", adminSub: "Manage your pipeline and open vacancies", applicants: "Applicants",
    manageJobs: "Manage Jobs", newVacancy: "New Vacancy", backToList: "Back to Listings",
    loginTitle: "Recruiter Access", loginSub: "Enter your password to access the dashboard", cancel: "Cancel", login: "Login",
    status: "Status", actions: "Actions", currency: "EGP", bonus: "Bonus"
  },
  ar: {
    navHome: "الرئيسية", navJobs: "ابحث عن وظيفة", navApply: "قدم الآن",
    heroTitle: "ابحث عن وظيفتك القادمة في الكول سنتر بمصر",
    heroSub: "أسرع وسيلة للتوظيف. نربط المتحدثين بالعربية، الإنجليزية، الفرنسية، والإسبانية بكبرى الشركات العالمية.",
    browseBtn: "ابحث عن وظيفة", quickApplyBtn: "تقديم سريع",
    langFocus: "التركيز على اللغات", langFocusDesc: "وظائف متخصصة لمتحدثي العربية، الإنجليزية، الفرنسية، الإسبانية والألمانية.",
    fastTrack: "توظيف سريع", fastTrackDesc: "تواصلنا المباشر مع الموارد البشرية يعني حصولك على مقابلة خلال 48 ساعة.",
    premiumLoc: "مواقع ممتازة", premiumLocDesc: "اعمل في أفضل المناطق: المعادي، التجمع، أكتوبر، أو من المنزل.",
    filterLang: "اللغة", filterLoc: "الموقع", filterExp: "الخبرة", experienceNeeded: "الخبرة المطلوبة",
    allLangs: "كل اللغات", allLocs: "كل المواقع", anyExp: "أي خبرة",
    reset: "إعادة تعيين", jobsCount: "وظيفة متاحة", viewDetails: "عرض التفاصيل",
    jobOverview: "تفاصيل الوظيفة", salary: "الراتب", shift: "الوردية", benefits: "المميزات", description: "الوصف الوظيفي",
    applyForJob: "قدم على هذه الوظيفة", fullName: "الاسم بالكامل", email: "البريد الإلكتروني", phone: "رقم الهاتف", whatsapp: "رقم الواتساب",
    cvLink: "رابط السيرة الذاتية (درايف/دروب بوكس)", submitApp: "إرسال الطلب", appSubmitted: "تم إرسال الطلب بنجاح!",
    smartMatch: "بناءً على مهاراتك، محركنا الذكي اختار لك هذه الوظائف:",
    adminTitle: "لوحة تحكم المسؤول", adminSub: "إدارة المرشحين والوظائف المتاحة", applicants: "المتقدمين",
    manageJobs: "إدارة الوظائف", newVacancy: "وظيفة جديدة", backToList: "العودة للوظائف",
    loginTitle: "دخول المسؤول", loginSub: "أدخل كلمة المرور للوصول إلى لوحة التحكم", cancel: "إلغاء", login: "دخول",
    status: "الحالة", actions: "الإجراءات", currency: "جنيه", bonus: "بونص"
  }
};

const LANGUAGES = ['Arabic', 'English', 'French', 'Spanish', 'German', 'Italian', 'Portuguese', 'Turkish', 'Greek'];
const LOCATIONS = ['Cairo', 'New Cairo', '6th of October', 'Alexandria', 'Maadi', 'Nasr City', 'Heliopolis', 'Sheraton', 'Abbasiya', 'Downtown Cairo', 'Remote'];
const EXPERIENCE_LEVELS = ['Entry Level', '6 Months+', '1 Year+', '1.5 Years+', '2 Years+', '3 Years+', '5 Years+', 'Expert/Team Lead'];

const INITIAL_JOBS = [
  { id: '1', title: "US Account Telesales Agent", language: "English", location: "Nasr City", salary: "13,000 {currency} + {bonus}", shift: "Fixed", experience: "Entry Level", company: "TTC", description: "US Campaign sales.", benefits: "Paid Training.", postedAt: Date.now() },
  { id: '2', title: "UK Account Telesales Agent", language: "English", location: "Nasr City", salary: "13,000 {currency} + {bonus}", shift: "Fixed", experience: "Entry Level", company: "TTC", description: "UK Campaign sales.", benefits: "Paid Training.", postedAt: Date.now() },
  { id: '3', title: "Appointment Setter US", language: "English", location: "Maadi", salary: "417 USD + {bonus}", shift: "Fixed", experience: "6 Months+", company: "Ultatell", description: "C1 English and cold calling experience.", benefits: "Medical and Social.", postedAt: Date.now() },
  { id: '4', title: "SDR English", language: "English", location: "Nasr City", salary: "20,000 - 30,000 {currency}", shift: "Fixed", experience: "6 Months+", company: "BUZZ", description: "Sales Development Representative.", benefits: "KPIs.", postedAt: Date.now() },
  { id: '5', title: "SDR Alexandria", language: "English", location: "Alexandria", salary: "15,000 - 30,000 {currency}", shift: "Fixed", experience: "1.5 Years+", company: "BUZZ Alex", description: "Cold calling specialist.", benefits: "WFH 3 months.", postedAt: Date.now() },
  { id: '6', title: "Senior Telesales Arabic", language: "Arabic", location: "Nasr City", salary: "Negotiable", shift: "Fixed", experience: "5 Years+", company: "BUZZ", description: "Senior role for Arabic accounts.", benefits: "Annual profit sharing.", postedAt: Date.now() },
  { id: '7', title: "B2B English Setter", language: "English", location: "Alexandria", salary: "14,000 {currency} + {bonus}", shift: "Fixed", experience: "1 Year+", company: "Holvrine", description: "B2+/C1 English.", benefits: "Transportation.", postedAt: Date.now() },
  { id: '8', title: "Customer Support TP", language: "English", location: "New Cairo", salary: "18,000 {currency} Net", shift: "Rotational", experience: "Entry Level", company: "Teleperformance", description: "5th Settlement site.", benefits: "Door-to-door.", postedAt: Date.now() },
  { id: '9', title: "Telesales Opener", language: "English", location: "Nasr City", salary: "15,000 {currency} + {bonus}", shift: "Fixed", experience: "3 Months+", company: "Creative Basket", description: "Travel Industry experience.", benefits: "USD Commissions.", postedAt: Date.now() },
  { id: '10', title: "French Support", language: "French", location: "Maadi", salary: "34,000 {currency} Gross", shift: "Rotational", experience: "Entry Level", company: "IntouchCX", description: "Fluent French.", benefits: "Transportation.", postedAt: Date.now() },
  { id: '11', title: "Spanish Support", language: "Spanish", location: "Maadi", salary: "30,000 {currency} Gross", shift: "Rotational", experience: "6 Months+", company: "IntouchCX", description: "B2 Spanish level.", benefits: "Medical Insurance.", postedAt: Date.now() },
  { id: '12', title: "Debt Settlement Agent", language: "English", location: "Nasr City", salary: "17,500 {currency} Net", shift: "Fixed", experience: "Entry Level", company: "ABS CLA", description: "B2+ level.", benefits: "Social Insurance.", postedAt: Date.now() },
  { id: '13', title: "HR Recruiter", language: "English", location: "Abbasiya", salary: "15,000 {currency} + {bonus}", shift: "Fixed", experience: "1 Year+", company: "Aces", description: "Mass recruitment background.", benefits: "Career growth.", postedAt: Date.now() },
  { id: '14', title: "Medical Receptionist", language: "Arabic", location: "New Cairo", salary: "12,000 {currency}", shift: "Rotational", experience: "Entry Level", company: "Health Clinic", description: "Fluent Arabic. Female only.", benefits: "Discounts.", postedAt: Date.now() }
];

// ---------------------------------------------------------
// 5. المكون الرئيسي
// ---------------------------------------------------------
export default function App() {
  const [lang, setLang] = useState('ar');
  const [view, setView] = useState('home'); 
  const [jobs, setJobs] = useState(INITIAL_JOBS); 
  const [applicants, setApplicants] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const t = (key) => translations[lang][key] || key;

  const formatSalary = (salaryStr) => {
    if (!salaryStr) return '';
    return salaryStr
      .replace(/{currency}/g, t('currency'))
      .replace(/{bonus}/g, t('bonus'))
      .replace(/جنيه/g, t('currency'))
      .replace(/حوافز/g, t('bonus'))
      .replace(/بونص/g, t('bonus'));
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // محاولة الاتصال بفايربيس بشكل آمن
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (auth) {
           await signInAnonymously(auth);
        }
      } catch (err) { console.log("Demo Mode - Auth Skipped"); }
    };
    initAuth();
    
    // محاولة جلب البيانات، وإذا فشلت نستخدم البيانات المحلية
    if (db) {
        try {
            const jobsRef = collection(db, 'artifacts', appId, 'public', 'data', 'jobs');
            onSnapshot(jobsRef, (snapshot) => {
              const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              if (jobsData.length > 0) setJobs(jobsData);
            }, (err) => console.log("Using Local Data"));
        } catch (e) {
            console.log("Using Local Data (No DB Connection)");
        }
    }
  }, []);

  const handleApply = async (formData) => {
    setLoading(true);
    // محاكاة عملية التقديم
    setTimeout(() => {
        const submission = { ...formData, id: Date.now(), appliedAt: Date.now(), status: 'Pending', jobId: selectedJob?.id || 'General' };
        setApplicants([...applicants, submission]);
        setLoading(false);
        setView('matched');
    }, 1500);
  };

  if (loading && view !== 'apply') return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 ${lang === 'ar' ? 'font-arabic text-right' : 'text-left'}`}>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg"><Languages size={24} /></div>
            <div className="hidden sm:block font-bold">EgyptHire</div>
          </div>
          <div className="flex items-center gap-2 md:gap-8">
            <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100"><Globe size={14} /> {lang === 'en' ? 'العربية' : 'English'}</button>
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => setView('home')} className={`text-sm font-bold transition-colors ${view === 'home' ? 'text-blue-600' : 'text-gray-500'}`}>{t('navHome')}</button>
              <button onClick={() => setView('jobs')} className={`text-sm font-bold transition-colors ${view === 'jobs' ? 'text-blue-600' : 'text-gray-500'}`}>{t('navJobs')}</button>
              <button onClick={() => { setSelectedJob(null); setView('apply'); }} className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg">Apply</button>
            </div>
            <button onClick={() => isAdmin ? setView('admin') : setShowAdminLogin(true)} className="p-2 text-gray-400 hover:text-blue-600"><LayoutDashboard size={20} /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'home' && <HomeView setView={setView} t={t} />}
        {view === 'jobs' && <JobsListView jobs={jobs} setView={setView} setSelectedJob={setSelectedJob} t={t} lang={lang} formatSalary={formatSalary} />}
        {view === 'details' && <JobDetailsView job={selectedJob} setView={setView} t={t} formatSalary={formatSalary} lang={lang} />}
        {view === 'apply' && <ApplicationForm job={selectedJob} onSubmit={handleApply} setView={setView} t={t} />}
        {view === 'matched' && <MatchedJobsView matches={jobs.slice(0, 3)} setView={setView} setSelectedJob={setSelectedJob} t={t} formatSalary={formatSalary} lang={lang} />}
        {view === 'admin' && <AdminDashboard jobs={jobs} applicants={applicants} t={t} onUpdateStatus={(id, s) => { const updated = applicants.map(a => a.id === id ? {...a, status: s} : a); setApplicants(updated); }} onDeleteJob={(id) => setJobs(jobs.filter(j => j.id !== id))} />}
      </main>

      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-sm w-full text-center shadow-2xl border border-gray-100">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600"><Lock size={32} /></div>
            <h2 className="text-2xl font-extrabold mb-1">{t('loginTitle')}</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">{t('loginSub')}</p>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl mb-4 text-center focus:border-blue-500 outline-none transition-all" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && adminPassword === 'admin123' && (setIsAdmin(true), setShowAdminLogin(false), setView('admin'))} />
            <div className="flex gap-3">
              <button onClick={() => setShowAdminLogin(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">{t('cancel')}</button>
              <button onClick={() => { if(adminPassword === 'admin123') { setIsAdmin(true); setShowAdminLogin(false); setView('admin'); } else { alert('Incorrect password. Hint: admin123'); } }} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">{t('login')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HomeView({ setView, t }) {
  return (
    <div className="space-y-12 md:space-y-20 py-6 md:py-10">
      <section className="text-center max-w-4xl mx-auto px-4">
        <div className="inline-block px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 border border-blue-100">Premium Recruitment Agency</div>
        
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold mb-6 md:mb-8 leading-tight text-gray-900 tracking-tight">
          {t('heroTitle')}
        </h1>
        
        <p className="text-sm md:text-xl text-gray-500 mb-10 md:mb-12 leading-relaxed max-w-2xl mx-auto">
          {t('heroSub')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
          <button onClick={() => setView('jobs')} className="flex items-center justify-center gap-3 px-8 md:px-12 py-4 md:py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
            <Search size={22} />
            {t('browseBtn')}
          </button>
          <button onClick={() => setView('apply')} className="flex items-center justify-center gap-3 px-8 md:px-12 py-4 md:py-5 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-bold text-lg hover:border-blue-200 hover:bg-blue-50 active:scale-95 transition-all">
            <Zap size={22} className="text-orange-400 fill-orange-400" />
            {t('quickApplyBtn')}
          </button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 md:gap-8 px-4">
        <FeatureCard icon={<Globe />} title={t('langFocus')} desc={t('langFocusDesc')} />
        <FeatureCard icon={<CheckCircle />} title={t('fastTrack')} desc={t('fastTrackDesc')} />
        <FeatureCard icon={<MapPin />} title={t('premiumLoc')} desc={t('premiumLocDesc')} />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 hover:shadow-2xl transition-all duration-300">
      <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 text-blue-600 rounded-[1rem] flex items-center justify-center mb-6">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-800 tracking-tight">{title}</h3>
      <p className="text-sm md:text-base text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function JobsListView({ jobs, setView, setSelectedJob, t, lang, formatSalary }) {
  const [filter, setFilter] = useState({ lang: '', loc: '', exp: '' });
  const filtered = useMemo(() => jobs.filter(j => 
    (!filter.lang || (j.language && j.language.includes(filter.lang))) && 
    (!filter.loc || (j.location && j.location.includes(filter.loc))) && 
    (!filter.exp || (j.experience && j.experience.includes(filter.exp)))
  ), [jobs, filter]);

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full flex-1 flex flex-wrap gap-3">
          <select className="flex-1 min-w-[120px] px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border-none rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-600 text-sm" onChange={e => setFilter({...filter, lang: e.target.value})} value={filter.lang}>
            <option value="">{t('allLangs')}</option>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select className="flex-1 min-w-[120px] px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border-none rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-600 text-sm" onChange={e => setFilter({...filter, loc: e.target.value})} value={filter.loc}>
            <option value="">{t('allLocs')}</option>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3">
          <div className="bg-blue-600 text-white px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl font-bold shadow-lg flex items-center gap-2 whitespace-nowrap">
             <span className="text-base">{filtered.length}</span>
             <span className="text-[10px] uppercase tracking-wider">{t('jobsCount')}</span>
          </div>
          <button onClick={() => setFilter({lang: '', loc: '', exp: ''})} className="text-gray-500 font-bold px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-sm">{t('reset')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-2">
        {filtered.map(job => (
          <div key={job.id} className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col hover:shadow-2xl transition-all transform hover:-translate-y-1 group">
            <div className="flex justify-between mb-4">
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-extrabold uppercase tracking-widest border border-blue-100">{job.language}</span>
            </div>
            
            <h3 onClick={() => { setSelectedJob(job); setView('details'); }} className="text-xl md:text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors tracking-tight cursor-pointer hover:underline decoration-2 underline-offset-4 line-clamp-2 min-h-[3rem] md:min-h-0">
              {job.title}
            </h3>
            
            <p className="text-gray-400 text-xs md:text-sm font-bold mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" /> {job.company}
            </p>
            
            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100"><MapPin size={16} className="text-blue-500" /> {job.location}</div>
              <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100"><DollarSign size={16} className="text-green-500" /> {formatSalary(job.salary)}</div>
              <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100"><Briefcase size={16} className="text-purple-500" /> {job.experience}</div>
            </div>
            
            <button onClick={() => { setSelectedJob(job); setView('details'); }} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-blue-600 shadow-xl transition-all flex items-center justify-center gap-2 text-sm">
              {t('viewDetails')} <ChevronRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function JobDetailsView({ job, setView, t, formatSalary, lang }) {
  if (!job) return null;
  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 px-2 animate-in slide-in-from-bottom-10 duration-500">
      <button onClick={() => setView('jobs')} className="flex items-center gap-2 text-gray-500 font-bold hover:text-blue-600 transition-colors"><ArrowLeft size={18}/> {t('backToList')}</button>
      <div className="bg-white rounded-3xl md:rounded-[3rem] overflow-hidden border border-gray-100 shadow-2xl">
        <div className="bg-blue-600 p-8 md:p-12 text-white">
          <span className="bg-white/20 text-white backdrop-blur-md px-3 py-1 rounded-full text-[10px] md:text-xs font-extrabold uppercase mb-4 inline-block border border-white/20 shadow-sm">{job.language} Specialization</span>
          <h1 className="text-2xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">{job.title}</h1>
          <p className="text-blue-50 text-lg md:text-xl flex items-center gap-2 font-medium"><Briefcase size={20}/> {job.company}</p>
        </div>
        <div className="p-8 md:p-12 grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-10">
            <div><h3 className="font-extrabold text-xl md:text-2xl mb-4 flex items-center gap-3"><div className="w-1 h-6 bg-blue-600 rounded-full" /> {t('description')}</h3><p className="text-gray-600 leading-relaxed text-base md:text-lg whitespace-pre-line">{job.description}</p></div>
            <div><h3 className="font-extrabold text-xl md:text-2xl mb-4 flex items-center gap-3"><div className="w-1 h-6 bg-green-500 rounded-full" /> {t('benefits')}</h3><p className="text-gray-600 leading-relaxed text-base md:text-lg whitespace-pre-line">{job.benefits}</p></div>
          </div>
          <div className="bg-gray-50 p-6 md:p-8 rounded-2xl md:rounded-[2rem] h-fit space-y-5 md:space-y-6 border border-gray-100 text-right">
            <div className="font-extrabold text-[10px] text-gray-400 uppercase tracking-widest mb-2">{t('jobOverview')}</div>
            <DetailItem label={t('filterLoc')} value={job.location} icon={<MapPin size={18} className="text-blue-500"/>} />
            <DetailItem label={t('salary')} value={formatSalary(job.salary)} icon={<DollarSign size={18} className="text-green-500"/>} />
            <DetailItem label={t('experienceNeeded')} value={job.experience} icon={<Briefcase size={18} className="text-purple-500"/>} />
            <DetailItem label={t('shift')} value={job.shift} icon={<Clock size={18} className="text-orange-500"/>} />
            <button onClick={() => setView('apply')} className="w-full py-4 md:py-5 bg-blue-600 text-white rounded-xl md:rounded-[1.5rem] font-extrabold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-6"><Send size={20} /> {t('navApply')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon }) {
  return <div className="flex gap-3 md:gap-4"><div className="mt-1">{icon}</div><div><div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</div><div className="font-extrabold text-gray-800 text-base md:text-lg leading-tight">{value}</div></div></div>;
}

function ApplicationForm({ onSubmit, t, job }) {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', whatsapp: '', cvLink: '', language: job?.language || '' });
  const [submitting, setSubmitting] = useState(false);
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-gray-100 px-4 animate-in zoom-in duration-500">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">{t('navApply')}</h2>
      <p className="text-gray-500 mb-8 md:mb-10 text-sm md:text-lg font-medium">{job ? `For: ${job.title} @ ${job.company}` : "Join our talent network"}</p>
      <form onSubmit={async e => { e.preventDefault(); setSubmitting(true); await onSubmit(formData); setSubmitting(false); }} className="space-y-6 md:space-y-8">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8"><Input label={t('fullName')} placeholder="Ahmed Mohamed" value={formData.fullName} onChange={v => setFormData({...formData, fullName: v})} required /><Input label={t('email')} type="email" placeholder="ahmed@example.com" value={formData.email} onChange={v => setFormData({...formData, email: v})} required /><Input label={t('phone')} placeholder="012XXXXXXXX" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} required /><Input label={t('whatsapp')} placeholder="012XXXXXXXX" value={formData.whatsapp} onChange={v => setFormData({...formData, whatsapp: v})} required /></div>
        <div className="space-y-2"><label className="text-sm font-extrabold text-gray-600 ml-1">{t('filterLang')}</label><select className="w-full px-5 md:px-6 py-3 md:py-4 bg-gray-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-gray-700" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} required><option value="">{t('allLangs')}</option>{LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
        <Input label={t('cvLink')} placeholder="https://drive.google.com/..." value={formData.cvLink} onChange={v => setFormData({...formData, cvLink: v})} required />
        <button disabled={submitting} className="w-full py-5 md:py-6 bg-blue-600 text-white rounded-xl md:rounded-[2rem] font-extrabold text-lg md:text-xl shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 disabled:opacity-50">{submitting ? <Loader2 className="animate-spin" /> : <Send size={24}/>}{t('submitApp')}</button>
      </form>
    </div>
  );
}

function Input({ label, onChange, ...props }) {
  return <div className="space-y-2"><label className="text-sm font-extrabold text-gray-600 ml-1">{label}</label><input className="w-full px-5 md:px-6 py-3 md:py-4 bg-gray-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-gray-700 placeholder-gray-300" onChange={e => onChange(e.target.value)} {...props} /></div>;
}

function MatchedJobsView({ matches, setView, t, setSelectedJob, formatSalary, lang }) {
  return (
    <div className="text-center py-12 md:py-20 max-w-5xl mx-auto px-4">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10 shadow-inner animate-bounce"><Check size={40} strokeWidth={3}/></div>
      <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">{t('appSubmitted')}</h2>
      <p className="text-base md:text-xl text-gray-500 mb-12 md:mb-16 font-medium max-w-2xl mx-auto">{t('smartMatch')}</p>
      <div className="grid md:grid-cols-3 gap-6 md:gap-8 text-left">
        {matches.map(job => (
          <div key={job.id} className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-blue-50 shadow-2xl shadow-blue-50/50 hover:border-blue-500 transition-all group">
            <div className="bg-blue-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full mb-4 inline-block tracking-widest shadow-sm">98% MATCH</div>
            <h3 onClick={() => { setSelectedJob(job); setView('details'); }} className="font-extrabold text-lg md:text-xl mb-1 group-hover:text-blue-600 transition-colors cursor-pointer">{job.title}</h3>
            <p className="text-gray-400 text-xs md:text-sm font-bold mb-6">{job.company}</p>
            <div className="space-y-2 md:space-y-3 mb-6 md:mb-8 text-xs md:text-sm">
              <div className="flex items-center gap-2 font-bold text-gray-500"><MapPin size={14}/> {job.location}</div>
              <div className="flex items-center gap-2 font-bold text-gray-500"><DollarSign size={14}/> {formatSalary(job.salary)}</div>
            </div>
            <button onClick={() => { setSelectedJob(job); setView('details'); }} className="w-full py-3 text-blue-600 border-2 border-blue-50 font-extrabold text-sm rounded-xl md:rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">{t('viewDetails')}</button>
          </div>
        ))}
      </div>
      <button onClick={() => setView('home')} className="mt-16 md:mt-20 font-extrabold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest text-[10px] md:text-xs underline decoration-2 underline-offset-8">Return to Dashboard</button>
    </div>
  );
}

function AdminDashboard({ applicants, t, onUpdateStatus, jobs, onDeleteJob }) {
  const [tab, setTab] = useState('applicants');
  return (
    <div className="space-y-10 md:space-y-12 animate-in fade-in duration-700 px-2 md:px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div><h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">{t('adminTitle')}</h1><p className="text-xs md:text-base text-gray-500 font-medium">{t('adminSub')}</p></div>
        <div className="flex bg-white p-1 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto">
          <button onClick={() => setTab('applicants')} className={`flex-1 md:flex-none px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-[1rem] font-extrabold text-[10px] md:text-sm transition-all ${tab === 'applicants' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}>{t('applicants')} ({applicants.length})</button>
          <button onClick={() => setTab('jobs')} className={`flex-1 md:flex-none px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-[1rem] font-extrabold text-[10px] md:text-sm transition-all ${tab === 'jobs' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}>{t('manageJobs')} ({jobs.length})</button>
        </div>
      </div>
      {tab === 'applicants' ? (
        <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50 border-b border-gray-100"><tr className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest"><th className="px-6 md:px-10 py-4 md:py-5">Candidate</th><th className="px-6 md:px-10 py-4 md:py-5">Langs</th><th className="px-6 md:px-10 py-4 md:py-5">{t('status')}</th><th className="px-6 md:px-10 py-4 md:py-5 text-right">{t('actions')}</th></tr></thead><tbody className="divide-y divide-gray-50">{applicants.map(app => (
            <tr key={app.id} className="hover:bg-blue-50/20 transition-colors">
              <td className="px-6 md:px-10 py-6 md:py-8"><div className="font-extrabold text-gray-900 text-sm md:text-lg">{app.fullName}</div><div className="text-xs text-gray-500">{app.email}</div></td>
              <td className="px-6 md:px-10 py-6 md:py-8"><span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-lg text-[10px] md:text-xs font-extrabold">{app.language}</span></td>
              <td className="px-6 md:px-10 py-6 md:py-8"><select value={app.status} onChange={e => onUpdateStatus(app.id, e.target.value)} className={`px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-extrabold border-none ${app.status === 'Accepted' ? 'bg-green-100 text-green-700' : app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}><option value="Pending">Pending</option><option value="Accepted">Accepted</option><option value="Rejected">Rejected</option></select></td>
              <td className="px-6 md:px-10 py-6 md:py-8 text-right"><a href={app.cvLink} target="_blank" className="p-2 inline-block bg-blue-50 text-blue-600 rounded-lg"><Eye size={18}/></a></td>
            </tr>))}
          </tbody></table></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">{jobs.map(job => (<div key={job.id} className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-xl group relative overflow-hidden"><div className="relative z-10"><div className="flex justify-between items-start mb-4 md:mb-6"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] md:text-xs font-extrabold">{job.language}</span><button onClick={() => onDeleteJob(job.id)} className="p-2 text-red-300 hover:text-red-500"><Trash2 size={18}/></button></div><h4 className="font-extrabold text-base md:text-xl mb-1">{job.title}</h4><p className="text-gray-400 text-xs md:text-sm font-bold mb-4">{job.company}</p><div className="pt-4 md:pt-6 border-t border-gray-50 flex justify-between text-[8px] md:text-[10px] font-extrabold text-gray-400 uppercase tracking-widest"><span>{job.location}</span><span>{new Date(job.postedAt).toLocaleDateString()}</span></div></div></div>))}</div>
      )}
    </div>
  );
}