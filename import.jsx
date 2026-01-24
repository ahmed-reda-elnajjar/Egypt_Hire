import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Globe, 
  Briefcase, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  ChevronRight, 
  LayoutDashboard, 
  Plus, 
  Users, 
  Trash2, 
  Eye,
  ArrowLeft,
  X,
  Languages,
  Filter,
  Check,
  Send,
  Loader2,
  Lock,
  Download
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'egy-recruit-pro';

// --- Constants ---
const LANGUAGES = ['Arabic', 'English', 'French', 'Spanish', 'German', 'Italian'];
const LOCATIONS = ['Cairo', 'New Cairo', '6th of October', 'Alexandria', 'Maadi', 'Remote'];
const EXPERIENCE_LEVELS = ['Entry Level', '1-2 Years', '3-5 Years', 'Expert/Team Lead'];
const SHIFTS = ['Day Shift', 'Night Shift', 'Rotational'];

const INITIAL_JOBS = [
  {
    title: "English Account Advisor",
    language: "English",
    location: "New Cairo",
    salary: "12,000 - 15,000 EGP",
    shift: "Rotational",
    experience: "Entry Level",
    company: "Global Connect BPO",
    description: "Handle inbound calls for a major US telecom provider. Must have C1 English level.",
    benefits: "Medical insurance, Transportation, Quarterly bonuses",
    postedAt: Date.now()
  },
  {
    title: "French Customer Support",
    language: "French",
    location: "6th of October",
    salary: "20,000 - 25,000 EGP",
    shift: "Day Shift",
    experience: "1-2 Years",
    company: "EuroTech Hub",
    description: "Provide technical assistance to French-speaking customers regarding software issues.",
    benefits: "Hybrid work model, High commission, Social insurance",
    postedAt: Date.now() - 86400000
  },
  {
    title: "Arabic Customer Service",
    language: "Arabic",
    location: "Alexandria",
    salary: "6,000 - 8,000 EGP",
    shift: "Night Shift",
    experience: "Entry Level",
    company: "Local Solutions",
    description: "Helping local customers with their e-commerce orders.",
    benefits: "Work from home options, Monthly incentives",
    postedAt: Date.now() - 172800000
  }
];

// --- Main App Component ---
export default function App() {
  const [view, setView] = useState('home'); // home, jobs, details, apply, matched, admin
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [lastApplication, setLastApplication] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    language: '',
    location: '',
    experience: ''
  });

  // --- Firebase Initialization ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- Real-time Data Listeners ---
  useEffect(() => {
    if (!user) return;

    const jobsRef = collection(db, 'artifacts', appId, 'public', 'data', 'jobs');
    const applicantsRef = collection(db, 'artifacts', appId, 'public', 'data', 'applicants');

    const unsubscribeJobs = onSnapshot(jobsRef, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobsData);
      
      // Seed initial data if empty
      if (jobsData.length === 0) {
        INITIAL_JOBS.forEach(job => addDoc(jobsRef, job));
      }
      setLoading(false);
    }, (err) => console.error("Jobs fetch error:", err));

    const unsubscribeApplicants = onSnapshot(applicantsRef, (snapshot) => {
      const applicantsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplicants(applicantsData);
    }, (err) => console.error("Applicants fetch error:", err));

    return () => {
      unsubscribeJobs();
      unsubscribeApplicants();
    };
  }, [user]);

  // --- Matching Logic ---
  const getMatches = (appData) => {
    return jobs
      .map(job => {
        let score = 0;
        if (job.language === appData.language) score += 50;
        if (job.location === appData.preferredLocation) score += 30;
        if (job.experience === appData.experience) score += 20;
        return { ...job, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  // --- Handlers ---
  const handleApply = async (formData) => {
    const submission = {
      ...formData,
      appliedAt: Date.now(),
      status: 'Pending',
      jobId: selectedJob?.id || 'General'
    };
    
    const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'applicants'), submission);
    setLastApplication({ ...submission, id: docRef.id });
    setView('matched');
  };

  const updateJobStatus = async (appId, newStatus) => {
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'applicants', appId);
    await updateDoc(docRef, { status: newStatus });
  };

  const addJob = async (jobData) => {
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'jobs'), {
      ...jobData,
      postedAt: Date.now()
    });
  };

  const deleteJob = async (id) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'jobs', id));
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      return (!filters.language || job.language === filters.language) &&
             (!filters.location || job.location === filters.location) &&
             (!filters.experience || job.experience === filters.experience);
    });
  }, [jobs, filters]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Languages size={24} />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-800 tracking-tight">Egypt</span>
              <span className="text-xl font-light text-blue-600">Hire</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setView('home')} className={`text-sm font-medium ${view === 'home' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>Home</button>
            <button onClick={() => setView('jobs')} className={`text-sm font-medium ${view === 'jobs' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>Browse Jobs</button>
            <button onClick={() => { setSelectedJob(null); setView('apply'); }} className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">Apply Now</button>
            <button 
              onClick={() => isAdmin ? setView('admin') : setShowAdminLogin(true)} 
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isAdmin ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <LayoutDashboard size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'home' && <HomeView setView={setView} />}
        {view === 'jobs' && <JobsListView 
          jobs={filteredJobs} 
          filters={filters} 
          setFilters={setFilters} 
          setView={setView} 
          setSelectedJob={setSelectedJob} 
        />}
        {view === 'details' && <JobDetailsView job={selectedJob} setView={setView} />}
        {view === 'apply' && <ApplicationForm job={selectedJob} onSubmit={handleApply} setView={setView} />}
        {view === 'matched' && <MatchedJobsView matches={getMatches(lastApplication)} setView={setView} setSelectedJob={setSelectedJob} />}
        {view === 'admin' && <AdminDashboard 
          jobs={jobs} 
          applicants={applicants} 
          onAddJob={addJob} 
          onDeleteJob={deleteJob}
          onUpdateStatus={updateJobStatus}
        />}
      </main>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-bold">Recruiter Access</h2>
              <p className="text-gray-500 text-sm mt-2">Enter your password to access the dashboard</p>
            </div>
            <input 
              type="password"
              placeholder="Admin Password"
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && adminPassword === 'admin123' && (setIsAdmin(true), setShowAdminLogin(false), setView('admin'))}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowAdminLogin(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (adminPassword === 'admin123') {
                    setIsAdmin(true);
                    setShowAdminLogin(false);
                    setView('admin');
                  } else {
                    alert('Incorrect password. Use: admin123');
                  }
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Languages size={18} />
              </div>
              <span className="text-lg font-bold">EgyptHire</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Connecting talented Egyptians with top-tier international call center opportunities. Specialized in multilingual recruitment since 2018.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="hover:text-blue-600 cursor-pointer" onClick={() => setView('jobs')}>All Jobs</li>
              <li className="hover:text-blue-600 cursor-pointer" onClick={() => setView('apply')}>Apply Now</li>
              <li className="hover:text-blue-600 cursor-pointer">Privacy Policy</li>
              <li className="hover:text-blue-600 cursor-pointer">Terms of Service</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact HR</h4>
            <p className="text-sm text-gray-500 mb-1">Maadi, Cairo, Egypt</p>
            <p className="text-sm text-gray-500 mb-1">+20 123 456 7890</p>
            <p className="text-sm text-gray-500">hr@egyhire.com</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-50 text-center text-gray-400 text-xs">
          © 2024 EgyptHire Recruitment. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// --- Views Components ---

function HomeView({ setView }) {
  return (
    <div className="space-y-20 py-10">
      <section className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Find Your Next <span className="text-blue-600">Call Center</span> Job in Egypt
        </h1>
        <p className="text-xl text-gray-500 mb-10 leading-relaxed">
          The fastest way to get hired. We connect Arabic, English, French, and Spanish speakers with premium global companies in Cairo and Alexandria.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => setView('jobs')}
            className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:translate-y-[-2px]"
          >
            Browse Vacancies
          </button>
          <button 
            onClick={() => setView('apply')}
            className="w-full sm:w-auto px-10 py-4 bg-white text-gray-800 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:border-blue-200 transition-all hover:bg-blue-50"
          >
            Quick Apply
          </button>
        </div>
        
        <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-60 grayscale">
          <div className="flex items-center gap-2 font-bold text-gray-400 text-lg uppercase tracking-widest"><Globe size={20} /> Concentrix</div>
          <div className="flex items-center gap-2 font-bold text-gray-400 text-lg uppercase tracking-widest"><Globe size={20} /> Teleperformance</div>
          <div className="flex items-center gap-2 font-bold text-gray-400 text-lg uppercase tracking-widest"><Globe size={20} /> Sutherland</div>
          <div className="flex items-center gap-2 font-bold text-gray-400 text-lg uppercase tracking-widest"><Globe size={20} /> Majorel</div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        {[
          { icon: <Globe />, title: "Language Focus", desc: "Specialized roles for speakers of Arabic, English, French, Spanish, and German." },
          { icon: <CheckCircle />, title: "Fast-Track Hiring", desc: "Our direct connection with HR means you get interviews within 48 hours." },
          { icon: <MapPin />, title: "Premium Locations", desc: "Work in the best hubs: Maadi, New Cairo, 6th October, or from home." }
        ].map((feat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-blue-100 transition-colors shadow-sm hover:shadow-md">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              {React.cloneElement(feat.icon, { size: 28 })}
            </div>
            <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
            <p className="text-gray-500 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function JobsListView({ jobs, filters, setFilters, setView, setSelectedJob }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Language</label>
            <select 
              value={filters.language}
              onChange={(e) => setFilters({...filters, language: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              <option value="">All Languages</option>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Location</label>
            <select 
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              <option value="">All Locations</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Experience</label>
            <select 
              value={filters.experience}
              onChange={(e) => setFilters({...filters, experience: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              <option value="">Any Experience</option>
              {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <button 
          onClick={() => setFilters({ language: '', location: '', experience: '' })}
          className="text-blue-600 font-bold px-6 py-3 hover:bg-blue-50 rounded-xl transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(job => (
          <div key={job.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all flex flex-col group">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase">
                {job.language}
              </span>
              <span className="text-gray-400 text-xs">
                {new Date(job.postedAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition-colors">{job.title}</h3>
            <p className="text-gray-400 text-sm font-medium mb-6 flex items-center gap-1">
              <Briefcase size={14} /> {job.company}
            </p>
            
            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin size={16} className="text-gray-400" /> {job.location}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <DollarSign size={16} className="text-gray-400" /> {job.salary}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Clock size={16} className="text-gray-400" /> {job.shift}
              </div>
            </div>

            <button 
              onClick={() => { setSelectedJob(job); setView('details'); }}
              className="w-full py-3 bg-gray-50 text-gray-700 font-bold rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center gap-2"
            >
              View Details <ChevronRight size={18} />
            </button>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">No jobs match your current filters.</p>
            <button onClick={() => setFilters({ language: '', location: '', experience: '' })} className="mt-2 text-blue-600 underline">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

function JobDetailsView({ job, setView }) {
  if (!job) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => setView('jobs')}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors"
      >
        <ArrowLeft size={20} /> Back to Listings
      </button>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-50 overflow-hidden border border-gray-50">
        <div className="bg-blue-600 p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="bg-white/20 text-white backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                {job.language} Specialization
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{job.title}</h1>
              <p className="text-blue-100 text-lg flex items-center gap-2">
                <Briefcase size={20} /> {job.company}
              </p>
            </div>
            <button 
              onClick={() => setView('apply')}
              className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl shadow-blue-800/20"
            >
              Apply Now
            </button>
          </div>
        </div>

        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-10">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Briefcase className="text-blue-600" size={24} /> Job Description
              </h3>
              <p className="text-gray-600 leading-loose whitespace-pre-line text-lg">
                {job.description}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="text-blue-600" size={24} /> Benefits
              </h3>
              <p className="text-gray-600 leading-loose whitespace-pre-line text-lg">
                {job.benefits}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <h4 className="font-bold text-sm text-gray-400 uppercase mb-4 tracking-widest">Job Overview</h4>
              <div className="space-y-4">
                {[
                  { label: "Location", value: job.location, icon: <MapPin size={18} /> },
                  { label: "Salary", value: job.salary, icon: <DollarSign size={18} /> },
                  { label: "Working Hours", value: job.shift, icon: <Clock size={18} /> },
                  { label: "Experience", value: job.experience, icon: <Briefcase size={18} /> }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-blue-600 mt-1">{item.icon}</div>
                    <div>
                      <div className="text-xs font-bold text-gray-400">{item.label}</div>
                      <div className="font-bold text-gray-800">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplicationForm({ job, onSubmit, setView }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    whatsapp: '',
    email: '',
    language: job?.language || '',
    experience: 'Entry Level',
    preferredLocation: job?.location || 'Cairo',
    cvLink: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-blue-50 border border-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6">
          <button onClick={() => setView('home')} className="text-gray-400 hover:text-gray-600 transition-colors"><X /></button>
        </div>

        <div className="mb-10">
          <h2 className="text-3xl font-extrabold mb-2">Apply for Opportunities</h2>
          <p className="text-gray-500">
            {job ? `Applying for: ${job.title}` : "Join our talent pool to get matched with the best jobs."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">Full Name</label>
              <input 
                required
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all"
                placeholder="Ahmed Mohamed"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">Email Address</label>
              <input 
                required
                type="email"
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all"
                placeholder="ahmed@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">Phone Number</label>
              <input 
                required
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all"
                placeholder="012XXXXXXXX"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">WhatsApp Number</label>
              <input 
                required
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all"
                placeholder="012XXXXXXXX"
                value={formData.whatsapp}
                onChange={e => setFormData({...formData, whatsapp: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">Language Skill</label>
              <select 
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all"
                value={formData.language}
                onChange={e => setFormData({...formData, language: e.target.value})}
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">Experience Level</label>
              <select 
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all"
                value={formData.experience}
                onChange={e => setFormData({...formData, experience: e.target.value})}
              >
                {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600 ml-1">Link to your CV (Google Drive/Dropbox)</label>
            <input 
              required
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all"
              placeholder="https://drive.google.com/..."
              value={formData.cvLink}
              onChange={e => setFormData({...formData, cvLink: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-bold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50 mt-10"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={24} />}
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}

function MatchedJobsView({ matches, setView, setSelectedJob }) {
  return (
    <div className="max-w-4xl mx-auto py-10 text-center">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
        <Check size={48} />
      </div>
      <h2 className="text-4xl font-extrabold mb-4">Application Submitted!</h2>
      <p className="text-xl text-gray-500 mb-12">Based on your skills, our smart engine matched you with these top roles:</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {matches.map(job => (
          <div key={job.id} className="bg-white p-6 rounded-3xl border-2 border-blue-50 shadow-lg hover:border-blue-500 transition-all">
            <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded mb-3 inline-block">
              {job.score}% MATCH
            </div>
            <h3 className="font-bold text-lg mb-1">{job.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{job.company}</p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs text-gray-600"><MapPin size={12}/> {job.location}</div>
              <div className="flex items-center gap-2 text-xs text-gray-600"><DollarSign size={12}/> {job.salary}</div>
            </div>
            <button 
              onClick={() => { setSelectedJob(job); setView('details'); }}
              className="w-full py-2 text-blue-600 border border-blue-600 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all"
            >
              Learn More
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setView('home')}
        className="mt-16 text-gray-500 font-bold hover:text-blue-600 transition-colors"
      >
        Return to Home
      </button>
    </div>
  );
}

function AdminDashboard({ jobs, applicants, onAddJob, onDeleteJob, onUpdateStatus }) {
  const [tab, setTab] = useState('applicants'); // applicants, jobs
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '', language: 'English', location: 'Cairo', salary: '', 
    shift: 'Day Shift', experience: 'Entry Level', company: '', 
    description: '', benefits: ''
  });

  const [applicantFilter, setApplicantFilter] = useState({
    language: '',
    status: ''
  });

  const filteredApplicants = useMemo(() => {
    return applicants.filter(a => {
      return (!applicantFilter.language || a.language === applicantFilter.language) &&
             (!applicantFilter.status || a.status === applicantFilter.status);
    });
  }, [applicants, applicantFilter]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-gray-500">Manage your pipeline and open vacancies</p>
        </div>
        <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
          <button 
            onClick={() => setTab('applicants')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${tab === 'applicants' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Applicants ({applicants.length})
          </button>
          <button 
            onClick={() => setTab('jobs')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${tab === 'jobs' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Manage Jobs ({jobs.length})
          </button>
        </div>
      </div>

      {tab === 'applicants' ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-wrap gap-4 items-center">
            <h3 className="font-bold text-lg mr-auto">Recent Candidates</h3>
            <select 
              value={applicantFilter.language}
              onChange={e => setApplicantFilter({...applicantFilter, language: e.target.value})}
              className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Languages</option>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select 
              value={applicantFilter.status}
              onChange={e => setApplicantFilter({...applicantFilter, status: e.target.value})}
              className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                  <th className="px-8 py-4">Applicant</th>
                  <th className="px-8 py-4">Language / Exp</th>
                  <th className="px-8 py-4">Contact</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredApplicants.map(app => (
                  <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900">{app.fullName}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-tight">Preferred: {app.preferredLocation}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-bold">{app.language}</span>
                        <span className="text-sm text-gray-600">{app.experience}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm">{app.phone}</div>
                      <div className="text-xs text-gray-400">{app.email}</div>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        value={app.status}
                        onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border-none outline-none cursor-pointer ${
                          app.status === 'Accepted' ? 'bg-green-100 text-green-700' : 
                          app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <a href={app.cvLink} target="_blank" className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="View CV">
                          <Eye size={18} />
                        </a>
                        <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Contact via WhatsApp">
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApplicants.length === 0 && (
              <div className="py-20 text-center text-gray-400">
                No candidates found with these filters.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg">Active Job Postings</h3>
            <button 
              onClick={() => setIsAddingJob(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"
            >
              <Plus size={20} /> New Vacancy
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map(job => (
              <div key={job.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-blue-600 font-bold text-sm">{job.language}</span>
                    <button 
                      onClick={() => onDeleteJob(job.id)}
                      className="text-red-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h4 className="font-bold text-xl mb-1">{job.title}</h4>
                  <p className="text-gray-400 text-sm mb-4">{job.company}</p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50 text-xs text-gray-500">
                  <span>{job.location}</span>
                  <span>{applicants.filter(a => a.jobId === job.id).length} Applicants</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {isAddingJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Post New Job</h2>
              <button onClick={() => setIsAddingJob(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Job Title</label>
                <input 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newJob.title}
                  onChange={e => setNewJob({...newJob, title: e.target.value})}
                  placeholder="e.g. English Customer Support"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Company Name</label>
                <input 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newJob.company}
                  onChange={e => setNewJob({...newJob, company: e.target.value})}
                  placeholder="e.g. Teleperformance"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Language</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none"
                  value={newJob.language}
                  onChange={e => setNewJob({...newJob, language: e.target.value})}
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Location</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none"
                  value={newJob.location}
                  onChange={e => setNewJob({...newJob, location: e.target.value})}
                >
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Salary Range</label>
                <input 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newJob.salary}
                  onChange={e => setNewJob({...newJob, salary: e.target.value})}
                  placeholder="e.g. 10k - 12k EGP"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Shift</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none"
                  value={newJob.shift}
                  onChange={e => setNewJob({...newJob, shift: e.target.value})}
                >
                  {SHIFTS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Full Description</label>
                <textarea 
                  className="w-full h-32 px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newJob.description}
                  onChange={e => setNewJob({...newJob, description: e.target.value})}
                  placeholder="Responsibilities and requirements..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Benefits</label>
                <textarea 
                  className="w-full h-24 px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newJob.benefits}
                  onChange={e => setNewJob({...newJob, benefits: e.target.value})}
                  placeholder="Insurances, bonuses, etc..."
                />
              </div>
            </div>

            <button 
              onClick={() => { onAddJob(newJob); setIsAddingJob(false); }}
              className="w-full mt-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all"
            >
              Confirm and Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
