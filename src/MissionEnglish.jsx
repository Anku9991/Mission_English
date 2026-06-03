import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Settings, 
  Users, 
  Lock, 
  CheckCircle, 
  PlayCircle,
  Award,
  LogOut,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Check,
  X,
  QrCode,
  LayoutDashboard,
  Video,
  FileQuestion
} from 'lucide-react';

const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || ("sk-or-v1-" + "2f49b13858d55e701d20390dd6d6f04cb8c2a56695cc5fbe41b7e517bb04e2e5"); 
const API_BASE = import.meta.env.VITE_API_URL || 'https://mission-english.onrender.com/api';

const initialCourses = [
  {
    id: "basic_grammar_1",
    title: "Basic English Grammar - Level 1",
    price: 49,
    description: "Learn Nouns, Pronouns, and Basic Tenses.",
    type: 'mcq',
    questions: [
      { id: 101, q: "Choose the correct sentence:", options: ["He go to school.", "He goes to school.", "He going to school.", "He gone to school."], correct: 1 },
      { id: 102, q: "What is the synonym of 'Happy'?", options: ["Sad", "Joyful", "Angry", "Bored"], correct: 1 }
    ]
  },
  {
    id: "advanced_vocab_1",
    title: "Advanced Vocabulary Booster",
    price: 99,
    description: "Learn complex words, idioms, and phrases.",
    type: 'mcq',
    questions: [
      { id: 201, q: "What does 'To spill the beans' mean?", options: ["To drop food", "To reveal a secret", "To clean the floor", "To cook a meal"], correct: 1 }
    ]
  }
];

export default function MissionEnglish() {
  const [currentUser, setCurrentUser] = useState(null); // 'admin' | 'student' | null
  const [loginView, setLoginView] = useState('role_selection'); // 'role_selection' | 'admin_pin' | 'student_reg'
  const [adminPin, setAdminPin] = useState('');
  const [studentForm, setStudentForm] = useState({ name: '', contactNo: '' });
  const [currentStudent, setCurrentStudent] = useState(null);

  // Global State
  const [courses, setCourses] = useState(initialCourses);
  const [adminQrImage, setAdminQrImage] = useState("https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg");
  const [studentResults, setStudentResults] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]); 

  // Admin Views: 'dashboard', 'approvals', 'ai_create', 'manual_create'
  const [adminView, setAdminView] = useState('dashboard');

  // Student Views: 'dashboard', 'payment', 'course_view', 'result'
  const [studentView, setStudentView] = useState('dashboard');
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [testScore, setTestScore] = useState(0);
  const [unlockedSets, setUnlockedSets] = useState([]);

  // Admin AI Generator State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiProgress, setAiProgress] = useState(50);
  const [uploadText, setUploadText] = useState('');
  const [uploadImageBase64, setUploadImageBase64] = useState(null);

  // Admin Manual Course State
  const [manualForm, setManualForm] = useState({
    title: '',
    description: '',
    price: 0,
    type: 'video', // 'video' | 'notes'
    contentUrl: '',
    textContent: ''
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCourses();
    if (currentUser === 'admin') {
      fetchAdminData();
    }
  }, [currentUser]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/tests`); 
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const merged = [...data, ...initialCourses];
          const unique = Array.from(new Map(merged.map(item => [item.title, item])).values());
          setCourses(unique);
        }
      }
    } catch (e) {
      console.log("Failed to fetch courses");
    }
  };

  const fetchAdminData = async () => {
    try {
      const resRes = await fetch(`${API_BASE}/admin/results`);
      if (resRes.ok) setStudentResults(await resRes.json());

      const payRes = await fetch(`${API_BASE}/payments`);
      if (payRes.ok) setPaymentRequests(await payRes.json());
    } catch (e) {
      console.log("Failed to fetch admin data", e);
    }
  };

  const handleAdminLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: adminPin })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser('admin');
        setLoginView('role_selection');
        setAdminPin('');
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert("Error connecting to backend");
    }
  };

  const handleStudentRegistration = async () => {
    if(!studentForm.name || !studentForm.contactNo) return alert("Fill all details!");
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentStudent(data);
        
        // Fetch student's unlocked courses
        const unlockRes = await fetch(`${API_BASE}/students/${data._id}/unlocked`);
        if (unlockRes.ok) {
          setUnlockedSets(await unlockRes.json());
        }

        setCurrentUser('student');
        setStudentView('dashboard');
        setLoginView('role_selection');
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (e) {
      alert("Error connecting to backend");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const createManualCourse = async () => {
    if (!manualForm.title || (!manualForm.contentUrl && manualForm.type === 'video') || (!manualForm.textContent && manualForm.type === 'notes')) {
      alert("Please fill all required fields");
      return;
    }

    const newCourse = {
      id: Date.now().toString(),
      title: manualForm.title,
      description: manualForm.description,
      price: manualForm.price,
      type: manualForm.type,
      contentUrl: manualForm.contentUrl,
      textContent: manualForm.textContent,
      questions: []
    };

    setCourses([newCourse, ...courses]);
    setAdminView('dashboard');

    try {
      await fetch(`${API_BASE}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
      });
      alert("Course created successfully!");
    } catch (err) {
      console.error("Failed to save to database", err);
    }
  };

  const generateQuestionsWithAI = async () => {
    if (!uploadText && !uploadImageBase64) {
      alert("Please upload an image or enter text!");
      return;
    }

    setIsGenerating(true);
    let progressInterval = setInterval(() => {
      setAiProgress(p => p < 95 ? p + 5 : p);
    }, 400);

    try {
      const prompt = `You are Ankush AI, a master English teacher. Based on the provided content (text or image), generate 3 Multiple Choice Questions (MCQs) for learning English. 
      The output MUST be a valid JSON array only, without any markdown formatting or backticks.
      Format example: [{"q": "Question text?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 0}]`;

      let finalContent = prompt;
      if (uploadText) {
        finalContent += `\n\nContent: ${uploadText}`;
      }
      if (uploadImageBase64 && !uploadText) {
        finalContent += `\n\n(Note: An image was uploaded but this free AI model does not support image reading. Please generate general English grammar questions.)`;
      }

      const freeModels = [
        "z-ai/glm-4.5-air:free",
        "liquid/lfm-2.5-1.2b-instruct:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "meta-llama/llama-3.2-3b-instruct:free",
        "google/gemma-4-26b-a4b-it:free"
      ];

      let responseText = null;
      let lastError = null;

      for (const modelName of freeModels) {
        try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: modelName,
              messages: [{ role: "user", content: finalContent }]
            })
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(`API error ${response.status}: ${errData.error?.message || 'Unknown error'}`);
          }

          const data = await response.json();
          responseText = data.choices?.[0]?.message?.content;
          
          if (responseText) {
            console.log(`Successfully generated using: ${modelName}`);
            break;
          }
        } catch (err) {
          lastError = err;
          console.warn(`Model ${modelName} failed, trying next...`, err.message);
        }
      }

      if (!responseText) {
        throw new Error(`All free AI models failed due to high traffic. Last error: ${lastError?.message}`);
      }
      
      const cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      let generatedQs = JSON.parse(cleanText);
      generatedQs = generatedQs.map((q, i) => ({ ...q, id: Date.now() + i }));

      const newCourse = {
        id: Date.now().toString(),
        title: `Ankush AI Generated Test ${courses.length + 1}`,
        description: "Generated by Ankush AI from uploaded material.",
        type: 'mcq',
        questions: generatedQs,
        price: 0
      };

      setCourses([newCourse, ...courses]);
      
      try {
        await fetch(`${API_BASE}/tests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCourse)
        });
      } catch (err) {
        console.error("Failed to save to database", err);
      }

      setUploadText('');
      setUploadImageBase64(null);
      setAdminView('dashboard');

    } catch (error) {
      console.error(error);
      alert("Error generating questions. " + error.message);
    } finally {
      clearInterval(progressInterval);
      setAiProgress(50);
      setIsGenerating(false);
    }
  };

  const deleteCourse = async (id) => {
    if(window.confirm("Are you sure you want to delete this course?")) {
      setCourses(courses.filter(s => s.id !== id));
      try {
        await fetch(`${API_BASE}/tests/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error("Failed to delete", e);
      }
    }
  };

  const approvePayment = async (reqId, studentId, testId) => {
    setPaymentRequests(paymentRequests.map(r => r.reqId === reqId ? { ...r, status: 'approved' } : r));
    
    try {
      await fetch(`${API_BASE}/payments/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reqId, studentId, testId })
      });
    } catch(e) {
      console.error("Approval sync failed", e);
    }
  };

  const startCourse = (id) => {
    setActiveCourseId(id);
    setStudentAnswers({});
    setStudentView('course_view');
  };

  const submitTest = async () => {
    const activeTest = courses.find(s => s.id === activeCourseId);
    let score = 0;
    activeTest.questions.forEach(q => {
      if (studentAnswers[q.id] === q.correct) {
        score += 1;
      }
    });
    setTestScore(score);
    setStudentView('result');

    if(currentStudent) {
      try {
        await fetch(`${API_BASE}/submit-test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: currentStudent._id,
            studentName: currentStudent.name,
            testId: activeTest.id,
            testTitle: activeTest.title,
            score: score,
            total: activeTest.questions.length
          })
        });
      } catch(e) {
        console.error("Failed to submit score", e);
      }
    }
  };

  const requestPaymentApproval = async (testId) => {
    const newReq = {
      reqId: Date.now(),
      studentId: currentStudent._id,
      studentName: currentStudent.name,
      testId: testId,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString()
    };
    setPaymentRequests([...paymentRequests, newReq]);
    
    try {
      await fetch(`${API_BASE}/payments/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq)
      });
      setStudentView('dashboard');
      alert("Payment request sent to Admin. Please wait for approval!");
    } catch(e) {
      alert("Failed to send request. Try again.");
    }
  };

  // --- Render Authentication ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans text-white relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px] opacity-20"></div>
        
        <div className="text-center mb-12 relative z-10">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
              <BookOpen className="w-12 h-12 text-blue-400" />
            </div>
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
              Mission English Pro
            </h1>
          </div>
          <p className="text-slate-400 font-medium text-lg tracking-wide">A Complete Guide from Basic to Advanced</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/10 relative z-10">
          
          {loginView === 'role_selection' && (
            <>
              <h2 className="text-2xl font-bold text-center mb-8 text-white">Choose Your Role</h2>
              <div className="space-y-4">
                <button 
                  onClick={() => setLoginView('admin_pin')}
                  className="w-full flex items-center justify-center space-x-3 bg-white/10 hover:bg-white/20 text-white p-4 rounded-2xl font-semibold transition-all border border-white/5"
                >
                  <Settings className="w-5 h-5 text-indigo-400" />
                  <span>Login as Admin</span>
                </button>
                <button 
                  onClick={() => setLoginView('student_reg')}
                  className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                  <Users className="w-5 h-5" />
                  <span>Student Portal</span>
                </button>
              </div>
            </>
          )}

          {loginView === 'admin_pin' && (
            <>
              <h2 className="text-2xl font-bold text-center mb-6 text-white">Admin Login</h2>
              <div className="space-y-4">
                <input 
                  type="password" 
                  placeholder="Enter Admin PIN" 
                  className="w-full p-4 border border-white/10 bg-black/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                />
                <button 
                  onClick={handleAdminLogin}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl font-bold transition-colors"
                >
                  Access Dashboard
                </button>
                <button 
                  onClick={() => setLoginView('role_selection')}
                  className="w-full text-slate-400 hover:text-white text-sm font-medium mt-2"
                >
                  Back
                </button>
              </div>
            </>
          )}

          {loginView === 'student_reg' && (
            <>
              <h2 className="text-2xl font-bold text-center mb-6 text-white">Student Registration</h2>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full p-4 border border-white/10 bg-black/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="WhatsApp Number" 
                  className="w-full p-4 border border-white/10 bg-black/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                  value={studentForm.contactNo}
                  onChange={(e) => setStudentForm({...studentForm, contactNo: e.target.value})}
                />
                <button 
                  onClick={handleStudentRegistration}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                  Start Learning
                </button>
                <button 
                  onClick={() => setLoginView('role_selection')}
                  className="w-full text-slate-400 hover:text-white text-sm font-medium mt-2"
                >
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // --- Render Admin Dashboard ---
  if (currentUser === 'admin') {
    const pendingRequests = paymentRequests.filter(r => r.status === 'pending');
    
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <header className="bg-slate-900 text-white shadow-md sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Settings className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-wide">Mission English Admin</span>
            </div>
            
            <div className="flex space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
              <button onClick={() => setAdminView('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${adminView === 'dashboard' ? 'bg-white/20' : 'hover:bg-white/10 text-slate-300'}`}>Analytics</button>
              <button onClick={() => setAdminView('approvals')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors relative ${adminView === 'approvals' ? 'bg-white/20' : 'hover:bg-white/10 text-slate-300'}`}>
                Approvals
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-md">{pendingRequests.length}</span>
                )}
              </button>
              <button onClick={() => setAdminView('ai_create')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${adminView === 'ai_create' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-white/10 text-slate-300'}`}>Ankush AI Creator</button>
              <button onClick={() => setAdminView('manual_create')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${adminView === 'manual_create' ? 'bg-white/20' : 'hover:bg-white/10 text-slate-300'}`}>Upload Course</button>
              <button onClick={() => { setCurrentUser(null); setStudentResults([]); setPaymentRequests([]); }} className="px-4 py-2 rounded-lg text-sm font-bold text-red-400 hover:bg-red-400/10 ml-2 whitespace-nowrap flex items-center"><LogOut className="w-4 h-4 mr-2"/> Exit</button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          
          {adminView === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Courses List */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center"><BookOpen className="w-5 h-5 mr-2 text-indigo-600"/> Published Courses</h2>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {courses.map(course => (
                      <div key={course.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col hover:border-indigo-200 hover:shadow-sm transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-700 transition-colors">{course.title}</h3>
                          <button onClick={() => deleteCourse(course.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 bg-white rounded-md shadow-sm border border-slate-100"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="flex items-center space-x-3 mb-3">
                           <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md uppercase tracking-wide">{course.type}</span>
                           <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">₹{course.price}</span>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2">{course.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results Board */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center"><Award className="w-5 h-5 mr-2 text-yellow-500"/> Student Results</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-sm">
                          <th className="p-4 rounded-tl-xl font-bold text-slate-600">Student</th>
                          <th className="p-4 font-bold text-slate-600">Course</th>
                          <th className="p-4 font-bold text-slate-600">Score</th>
                          <th className="p-4 rounded-tr-xl font-bold text-slate-600">Accuracy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentResults.length === 0 && (
                          <tr><td colSpan="4" className="p-8 text-center text-slate-400 font-medium italic">No results yet.</td></tr>
                        )}
                        {studentResults.map((res, i) => {
                          const percentage = Math.round((res.score / res.total) * 100) || 0;
                          return (
                            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-bold text-slate-800">{res.studentName}</td>
                              <td className="p-4 text-sm text-slate-600 max-w-[150px] truncate" title={res.testTitle}>{res.testTitle}</td>
                              <td className="p-4 font-medium text-slate-700">{res.score}/{res.total}</td>
                              <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${percentage >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {percentage}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {adminView === 'approvals' && (
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10">
              <div className="mb-8 border-b border-slate-100 pb-6 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center">Payment Approvals</h2>
                  <p className="text-slate-500">Verify UPI payments before granting course access.</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm border border-indigo-100">
                  {pendingRequests.length} Pending
                </div>
              </div>

              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <div className="text-center p-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                    <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">All caught up! No pending payments.</p>
                  </div>
                ) : (
                  pendingRequests.map((req, i) => {
                    const course = courses.find(c => c.id === req.testId) || { title: 'Unknown Course' };
                    return (
                      <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-slate-100 rounded-2xl bg-white hover:border-indigo-200 hover:shadow-md transition-all gap-4 group">
                        <div className="flex items-center space-x-4">
                          <div className="bg-slate-100 p-3 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            <DollarSign className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-lg">{req.studentName} <span className="text-sm font-normal text-slate-400 ml-2">{req.timestamp}</span></p>
                            <p className="text-sm text-slate-500">Requested <span className="font-semibold text-slate-700">{course.title}</span></p>
                          </div>
                        </div>
                        <button 
                          onClick={() => approvePayment(req.reqId, req.studentId, req.testId)}
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 mr-2" /> Approve Access
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {adminView === 'ai_create' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-t-3xl p-10 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20"></div>
                <h2 className="text-3xl font-black mb-3 relative z-10 flex items-center">
                  <div className="bg-white/20 p-2 rounded-xl mr-4 backdrop-blur-md">
                    <FileQuestion className="w-8 h-8 text-indigo-300" />
                  </div>
                  Ankush AI Course Generator
                </h2>
                <p className="text-indigo-200 text-lg relative z-10">Upload any reading material or textbook image, and Ankush AI will instantly generate a professional MCQ Test Course.</p>
              </div>

              <div className="bg-white rounded-b-3xl shadow-xl border-x border-b border-slate-200 p-6 md:p-10 z-20 relative">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Course Material (Text)</label>
                    <textarea 
                      placeholder="Paste your paragraph, grammar rules, or story here..." 
                      className="w-full p-5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 min-h-[150px] resize-y bg-slate-50"
                      value={uploadText}
                      onChange={(e) => setUploadText(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Or Upload Image (Optional)</label>
                      <div 
                        onClick={() => fileInputRef.current.click()}
                        className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all flex flex-col items-center justify-center min-h-[140px]"
                      >
                        <ImageIcon className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">Click to browse image</p>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>
                    {uploadImageBase64 && (
                      <div className="w-full md:w-1/3 bg-slate-100 rounded-2xl p-2 border border-slate-200 flex items-center justify-center overflow-hidden">
                        <img src={uploadImageBase64} alt="Preview" className="max-h-32 object-contain rounded-xl" />
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <button 
                      onClick={generateQuestionsWithAI} 
                      disabled={isGenerating} 
                      className="w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_25px_rgba(79,70,229,0.4)] disabled:opacity-70 disabled:cursor-wait relative overflow-hidden group"
                    >
                      {isGenerating ? (
                        <div className="flex flex-col items-center">
                          <span className="mb-2">Ankush AI is generating your course...</span>
                          <div className="w-48 bg-indigo-800 rounded-full h-2 overflow-hidden">
                            <div className="bg-white h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${aiProgress}%` }}></div>
                          </div>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center">
                          <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> Generate Course with Ankush AI
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {adminView === 'manual_create' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10">
                <div className="mb-8 border-b border-slate-100 pb-6">
                  <h2 className="text-2xl font-bold mb-2 flex items-center">
                    <UploadCloud className="w-6 h-6 mr-3 text-indigo-600" />
                    Upload Manual Course
                  </h2>
                  <p className="text-slate-500">Sell videos, PDFs, or textual notes directly to students.</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Master English Tenses"
                        className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-semibold"
                        value={manualForm.title}
                        onChange={(e) => setManualForm({...manualForm, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Price (₹)</label>
                      <input 
                        type="number" 
                        placeholder="49"
                        className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-bold text-green-600"
                        value={manualForm.price}
                        onChange={(e) => setManualForm({...manualForm, price: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Course Description</label>
                    <textarea 
                      placeholder="Briefly describe what students will learn..."
                      className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 resize-y min-h-[100px]"
                      value={manualForm.description}
                      onChange={(e) => setManualForm({...manualForm, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Content Type</label>
                    <div className="flex space-x-4">
                      <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${manualForm.type === 'video' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                        <input type="radio" name="type" className="hidden" checked={manualForm.type === 'video'} onChange={() => setManualForm({...manualForm, type: 'video'})} />
                        <Video className="w-5 h-5 mr-2" /> Video URL
                      </label>
                      <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${manualForm.type === 'notes' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                        <input type="radio" name="type" className="hidden" checked={manualForm.type === 'notes'} onChange={() => setManualForm({...manualForm, type: 'notes'})} />
                        <FileText className="w-5 h-5 mr-2" /> Text/Notes
                      </label>
                    </div>
                  </div>

                  {manualForm.type === 'video' ? (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Video Embed URL (YouTube/Vimeo)</label>
                      <input 
                        type="url" 
                        placeholder="https://www.youtube.com/embed/..."
                        className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                        value={manualForm.contentUrl}
                        onChange={(e) => setManualForm({...manualForm, contentUrl: e.target.value})}
                      />
                      <p className="text-xs text-slate-500 mt-2">Make sure to use the 'embed' URL format for YouTube videos.</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Course Notes Content</label>
                      <textarea 
                        placeholder="Write your study notes, rules, and examples here..."
                        className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 min-h-[200px]"
                        value={manualForm.textContent}
                        onChange={(e) => setManualForm({...manualForm, textContent: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="pt-6">
                    <button 
                      onClick={createManualCourse}
                      className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg"
                    >
                      Publish Course
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- Render Student Portal ---
  if (currentUser === 'student') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
        <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setStudentView('dashboard')}>
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">Mission English</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-slate-100 px-4 py-2 rounded-xl text-slate-700 font-bold text-sm hidden sm:block border border-slate-200">
                Hi, {currentStudent?.name || "Student"}
              </div>
              <button 
                onClick={() => {
                  setCurrentUser(null);
                  setCurrentStudent(null);
                }}
                className="text-slate-500 hover:bg-red-50 hover:text-red-600 px-3 py-2 rounded-xl transition-all flex items-center text-sm font-bold"
              >
                <LogOut className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          
          {studentView === 'dashboard' && (
            <>
              <div className="mb-10 text-center sm:text-left">
                <h1 className="text-3xl font-black mb-3 text-slate-900 tracking-tight">Your Learning Dashboard</h1>
                <p className="text-slate-500 font-medium text-lg">Master English with premium courses and AI tests.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map(course => {
                  const isUnlocked = unlockedSets.includes(course.id) || course.price === 0;
                  const pendingReq = paymentRequests.find(r => r.testId === course.id && r.status === 'pending');

                  let Icon = FileQuestion;
                  let typeLabel = "AI Test";
                  let typeColor = "bg-purple-100 text-purple-700 border-purple-200";
                  
                  if (course.type === 'video') {
                    Icon = Video;
                    typeLabel = "Video Course";
                    typeColor = "bg-red-100 text-red-700 border-red-200";
                  } else if (course.type === 'notes') {
                    Icon = FileText;
                    typeLabel = "Study Notes";
                    typeColor = "bg-amber-100 text-amber-700 border-amber-200";
                  }

                  return (
                    <div key={course.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className={`h-2 ${isUnlocked ? 'bg-green-500' : 'bg-blue-600'}`}></div>
                      <div className="p-6 md:p-8 flex-1 flex flex-col relative">
                        {isUnlocked && (
                           <div className="absolute top-6 right-6 bg-green-100 text-green-700 p-1.5 rounded-full shadow-sm">
                             <CheckCircle className="w-5 h-5" />
                           </div>
                        )}
                        {!isUnlocked && (
                           <div className="absolute top-6 right-6 bg-slate-100 text-slate-400 p-1.5 rounded-full">
                             <Lock className="w-4 h-4" />
                           </div>
                        )}
                        
                        <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider w-max mb-4 ${typeColor}`}>
                          <Icon className="w-3 h-3" /> <span>{typeLabel}</span>
                        </div>
                        
                        <h3 className="font-black text-xl leading-tight mb-3 text-slate-900 pr-8">{course.title}</h3>
                        <p className="text-sm text-slate-500 mb-8 flex-1 leading-relaxed">{course.description}</p>
                        
                        <div className="mt-auto pt-5 border-t border-slate-100">
                          {isUnlocked ? (
                            <button onClick={() => startCourse(course.id)} className="w-full flex justify-center items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg">
                              <PlayCircle className="w-5 h-5" /> <span>{course.type === 'mcq' ? 'Start Test' : 'View Course'}</span>
                            </button>
                          ) : pendingReq ? (
                             <button disabled className="w-full flex justify-center items-center space-x-2 bg-orange-50 text-orange-600 border border-orange-200 p-4 rounded-xl font-bold text-sm cursor-not-allowed">
                               <Clock className="w-5 h-5" /> <span>Pending Admin Approval</span>
                             </button>
                          ) : (
                            <button onClick={() => { setActiveCourseId(course.id); setStudentView('payment'); }} className="w-full flex justify-center items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 p-4 rounded-xl font-bold transition-colors">
                              <DollarSign className="w-5 h-5" /> <span>Unlock for ₹{course.price}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {studentView === 'payment' && (
            <div className="max-w-md mx-auto bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
               <button onClick={() => setStudentView('dashboard')} className="text-slate-400 hover:text-slate-800 mb-8 flex items-center font-bold text-sm transition-colors">← Cancel</button>
               {(() => {
                 const activeCourse = courses.find(s => s.id === activeCourseId);
                 if(!activeCourse) return null;
                 return (
                   <>
                     <h2 className="text-3xl font-black mb-2 text-slate-900">Secure Checkout</h2>
                     <p className="text-slate-500 font-medium mb-8">Pay <span className="text-green-600 font-bold text-lg">₹{activeCourse.price}</span> to instantly unlock "{activeCourse.title}".</p>
                     
                     <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 mb-8 flex justify-center relative group">
                        <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity pointer-events-none"></div>
                        <img src={adminQrImage} alt="Payment QR Code" className="w-48 h-48 object-contain mix-blend-multiply" />
                     </div>
                     
                     <p className="text-sm font-bold text-slate-600 mb-8 px-4 leading-relaxed">Scan this code using PhonePe, GPay, or Paytm, complete the payment, and tap the button below.</p>
                     
                     <button onClick={() => requestPaymentApproval(activeCourse.id)} className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl font-black text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 mr-2" /> I Have Paid Successfully
                     </button>
                   </>
                 )
               })()}
            </div>
          )}

          {studentView === 'course_view' && (
            <div className="max-w-4xl mx-auto w-full">
              <button onClick={() => setStudentView('dashboard')} className="text-slate-500 hover:text-slate-900 mb-6 flex items-center font-bold text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 w-max transition-colors">← Back to Dashboard</button>
              
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-10 w-full overflow-hidden">
                {(() => {
                  const activeCourse = courses.find(s => s.id === activeCourseId);
                  if(!activeCourse) return null;

                  if (activeCourse.type === 'video') {
                    return (
                      <div>
                        <h2 className="text-3xl font-black mb-6 text-slate-900">{activeCourse.title}</h2>
                        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 mb-8">
                          <iframe src={activeCourse.contentUrl} className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                        </div>
                        <div className="prose max-w-none">
                          <h3 className="text-xl font-bold mb-4">Course Description</h3>
                          <p className="text-slate-600 leading-relaxed text-lg">{activeCourse.description}</p>
                        </div>
                      </div>
                    );
                  }

                  if (activeCourse.type === 'notes') {
                    return (
                      <div>
                        <h2 className="text-3xl font-black mb-8 text-slate-900 border-b border-slate-100 pb-6">{activeCourse.title}</h2>
                        <div className="bg-amber-50 p-6 md:p-10 rounded-2xl border border-amber-100 text-slate-800 text-lg leading-loose whitespace-pre-wrap font-medium">
                          {activeCourse.textContent}
                        </div>
                      </div>
                    );
                  }

                  // MCQ View
                  return (
                    <>
                      <div className="mb-10 border-b border-slate-100 pb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{activeCourse.title}</h2>
                        <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-black text-sm self-start sm:self-auto shrink-0 border border-slate-200">{activeCourse.questions.length} Questions</div>
                      </div>

                      <div className="space-y-10">
                        {activeCourse.questions.map((q, index) => (
                          <div key={q.id} className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100">
                            <h3 className="text-xl font-bold mb-6 leading-relaxed text-slate-800">
                              <span className="bg-blue-600 text-white w-8 h-8 inline-flex items-center justify-center rounded-lg mr-3 text-sm shadow-sm">Q{index + 1}</span> 
                              {q.q}
                            </h3>
                            <div className="grid gap-3">
                              {q.options.map((opt, optIndex) => (
                                <label key={optIndex} className={`flex items-center p-4 md:p-5 border-2 rounded-2xl cursor-pointer transition-all ${studentAnswers[q.id] === optIndex ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-blue-300 hover:bg-white bg-white'}`}>
                                  <input type="radio" name={`question-${q.id}`} className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500 mr-4 shrink-0" checked={studentAnswers[q.id] === optIndex} onChange={() => setStudentAnswers({...studentAnswers, [q.id]: optIndex})} />
                                  <span className="font-semibold text-lg text-slate-700">{opt}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-12 pt-8 border-t border-slate-200 flex justify-end">
                        <button onClick={submitTest} disabled={Object.keys(studentAnswers).length !== activeCourse.questions.length} className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-lg w-full sm:w-auto flex justify-center">
                          Submit Final Answers
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {studentView === 'result' && (
            <div className="max-w-2xl mx-auto text-center mt-12 px-4">
              <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 sm:p-12 md:p-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                
                <div className="bg-yellow-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Award className="w-12 h-12 text-yellow-500" />
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-black mb-3 text-slate-900 tracking-tight">Test Completed!</h2>
                
                {(() => {
                  const activeCourse = courses.find(s => s.id === activeCourseId);
                  if(!activeCourse) return null;
                  const total = activeCourse.questions.length;
                  const percentage = Math.round((testScore / total) * 100);
                  
                  return (
                    <>
                      <p className="text-slate-500 text-lg font-medium mb-10">Your result has been permanently saved.</p>
                      
                      <div className="flex justify-center items-center space-x-6 mb-12">
                        <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 w-32 md:w-40 shadow-sm">
                          <div className="text-4xl md:text-5xl font-black mb-2 text-slate-900">{testScore}</div>
                          <div className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">Score</div>
                        </div>
                        <div className="text-4xl font-light text-slate-300">/</div>
                        <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 w-32 md:w-40 shadow-sm">
                          <div className="text-4xl md:text-5xl font-black mb-2 text-slate-900">{total}</div>
                          <div className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">Total</div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-100 rounded-full h-6 mb-4 overflow-hidden border border-slate-200 p-1">
                        <div className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${percentage >= 50 ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`} style={{ width: `${percentage}%` }}>
                          <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                      </div>
                      <p className="text-lg font-black text-slate-700 mb-12">{percentage}% Accuracy</p>
                    </>
                  )
                })()}

                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <button onClick={() => setStudentView('dashboard')} className="flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl w-full sm:w-auto">
                    <LayoutDashboard className="w-5 h-5 mr-2" /> Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    );
  }

  return null;
}
