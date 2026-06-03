import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  UploadCloud, 
  Settings, 
  Users, 
  LogOut, 
  CheckCircle, 
  Lock, 
  PlayCircle, 
  Award,
  RefreshCw,
  CreditCard,
  FileText,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Check,
  X,
  QrCode,
  LayoutDashboard
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const initialMcqSets = [
  {
    id: 1,
    title: "Basic English Grammar - Level 1",
    price: 49,
    description: "Learn Nouns, Pronouns, and Basic Tenses.",
    questions: [
      { id: 101, q: "Choose the correct sentence:", options: ["He go to school.", "He goes to school.", "He going to school.", "He gone to school."], correct: 1 },
      { id: 102, q: "What is the synonym of 'Happy'?", options: ["Sad", "Joyful", "Angry", "Bored"], correct: 1 }
    ]
  },
  {
    id: 2,
    title: "Advanced Vocabulary Booster",
    price: 99,
    description: "Learn complex words, idioms, and phrases.",
    questions: [
      { id: 201, q: "What does 'To spill the beans' mean?", options: ["To drop food", "To reveal a secret", "To clean the floor", "To cook a meal"], correct: 1 }
    ]
  }
];

export default function MissionEnglishApp() {
  const [currentUser, setCurrentUser] = useState(null); // 'admin' | 'student' | null
  const [loginView, setLoginView] = useState('role_selection'); // 'role_selection' | 'admin_pin' | 'student_reg'
  const [adminPinInput, setAdminPinInput] = useState('');
  const [studentForm, setStudentForm] = useState({ name: '', contactNo: '' });
  const [currentStudent, setCurrentStudent] = useState(null);

  // App Global State
  const [mcqSets, setMcqSets] = useState(initialMcqSets);
  const [adminQrImage, setAdminQrImage] = useState("https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg");
  const [paymentRequests, setPaymentRequests] = useState([]); 
  const [unlockedSets, setUnlockedSets] = useState([1]); 
  
  // Backend Data
  const [studentResults, setStudentResults] = useState([]);

  // Student UI State
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [activeTestId, setActiveTestId] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [testScore, setTestScore] = useState(0);

  // Admin UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [newPrice, setNewPrice] = useState(50);
  const [uploadText, setUploadText] = useState("");
  const [uploadImageBase64, setUploadImageBase64] = useState(null);
  
  const fileInputRef = useRef(null);
  const qrInputRef = useRef(null);

  useEffect(() => {
    if (currentUser === 'admin') {
      fetchAdminResults();
    }
  }, [currentUser]);

  const fetchAdminResults = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/results`);
      const data = await res.json();
      if(res.ok) setStudentResults(data);
    } catch (e) {
      console.error("Failed to fetch results", e);
    }
  };

  const handleAdminLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: adminPinInput })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser('admin');
        setLoginView('role_selection');
        setAdminPinInput('');
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
        setCurrentUser('student');
        setCurrentView('dashboard');
        setLoginView('role_selection');
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (e) {
      alert("Error connecting to backend");
    }
  };

  const generateQuestionsWithAI = async () => {
    if (!uploadText && !uploadImageBase64) {
      alert("Please upload an image or enter text!");
      return;
    }
    if (!apiKey) {
      alert("Gemini API Key is missing. Please add it to your .env file.");
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `You are an English teacher. Based on the provided content (text or image), generate 3 Multiple Choice Questions (MCQs) for learning English. 
      The output MUST be a valid JSON array only, without any markdown formatting or backticks.
      Format example: [{"q": "Question text?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 0}]`;

      let parts = [{ text: prompt }];

      if (uploadImageBase64) {
        const base64Data = uploadImageBase64.split(',')[1];
        const mimeType = uploadImageBase64.split(';')[0].split(':')[1];
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      }

      if (uploadText) {
        parts.push({ text: `Content: ${uploadText}` });
      }

      const payload = {
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) throw new Error("No response from API");

      let generatedQs = JSON.parse(responseText);
      
      generatedQs = generatedQs.map((q, i) => ({ ...q, id: Date.now() + i }));

      const newSet = {
        id: Date.now(),
        title: `AI Generated Test - ${new Date().toLocaleTimeString()}`,
        price: newPrice,
        description: "Generated by Gemini AI from uploaded material.",
        questions: generatedQs
      };

      setMcqSets([newSet, ...mcqSets]);
      alert("AI successfully generated MCQs!");
      
      setUploadText("");
      setUploadImageBase64(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
      
    } catch (error) {
      console.error("AI Error:", error);
      alert("Error generating MCQs. Please check the console or try again.");
    } finally {
      setIsGenerating(false);
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

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminQrImage(reader.result);
        alert("QR Code updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApprovePayment = (reqId, testId) => {
    setPaymentRequests(prev => prev.map(req => req.reqId === reqId ? { ...req, status: 'approved' } : req));
    if (!unlockedSets.includes(testId)) {
      setUnlockedSets(prev => [...prev, testId]);
    }
  };

  const handleRejectPayment = (reqId) => {
    setPaymentRequests(prev => prev.filter(req => req.reqId !== reqId));
  };

  const startTest = (id) => {
    setActiveTestId(id);
    setStudentAnswers({});
    setCurrentView('test');
  };

  const submitTest = async () => {
    const activeTest = mcqSets.find(s => s.id === activeTestId);
    if(!activeTest) return;

    let marks = 0;
    activeTest.questions.forEach(q => {
      if (studentAnswers[q.id] === q.correct) {
        marks += 1;
      }
    });
    setTestScore(marks);
    setCurrentView('result');

    // Submit to backend
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
            score: marks,
            total: activeTest.questions.length
          })
        });
      } catch (e) {
        console.error("Failed to submit score", e);
      }
    }
  };

  const requestPaymentApproval = (testId) => {
    const newReq = {
      reqId: Date.now(),
      testId: testId,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString()
    };
    setPaymentRequests([...paymentRequests, newReq]);
    setCurrentView('dashboard');
    alert("Payment request sent to Admin. Please wait for approval!");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BookOpen className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-extrabold tracking-tight">Mission English</h1>
          </div>
          <p className="text-slate-500 font-medium">A Complete Guide from Basic to Advanced</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
          
          {loginView === 'role_selection' && (
            <>
              <h2 className="text-2xl font-bold text-center mb-8">Choose Your Role</h2>
              <div className="space-y-4">
                <button 
                  onClick={() => setLoginView('admin_pin')}
                  className="w-full flex items-center justify-center space-x-3 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-semibold transition-all shadow-md"
                >
                  <Settings className="w-5 h-5" />
                  <span>Login as Admin</span>
                </button>
                <button 
                  onClick={() => setLoginView('student_reg')}
                  className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-semibold transition-all shadow-md"
                >
                  <Users className="w-5 h-5" />
                  <span>Student Portal</span>
                </button>
              </div>
            </>
          )}

          {loginView === 'admin_pin' && (
            <>
              <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
              <input 
                type="password" 
                placeholder="Enter Admin PIN" 
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              />
              <button 
                onClick={handleAdminLogin}
                className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 mb-4"
              >
                Login
              </button>
              <button onClick={() => setLoginView('role_selection')} className="w-full text-slate-500 font-semibold hover:text-slate-700">Go Back</button>
            </>
          )}

          {loginView === 'student_reg' && (
            <>
              <h2 className="text-2xl font-bold text-center mb-6">Student Registration</h2>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={studentForm.name}
                onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <input 
                type="text" 
                placeholder="Contact Number" 
                value={studentForm.contactNo}
                onChange={(e) => setStudentForm({...studentForm, contactNo: e.target.value})}
                className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <button 
                onClick={handleStudentRegistration}
                className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 mb-4"
              >
                Enter Portal
              </button>
              <button onClick={() => setLoginView('role_selection')} className="w-full text-slate-500 font-semibold hover:text-slate-700">Go Back</button>
            </>
          )}

        </div>
      </div>
    );
  }

  if (currentUser === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
        <div className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col">
          <div className="flex items-center space-x-2 mb-10">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold">Mission English</span>
          </div>
          
          <div className="flex flex-col space-y-2 flex-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Admin Menu</div>
            <div className="flex items-center space-x-3 text-blue-400 bg-slate-800 p-3 rounded-lg cursor-pointer">
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </div>
          </div>

          <button 
            onClick={() => {
              setCurrentUser(null);
              setStudentResults([]);
            }}
            className="flex items-center space-x-3 text-slate-400 hover:text-red-400 p-3 mt-auto transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-slate-500">Generate AI MCQs and monitor student performance.</p>
            </div>
            <button onClick={fetchAdminResults} className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Data</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <UploadCloud className="w-5 h-5 mr-2 text-indigo-600"/> 
                Gemini AI MCQ Generator
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Upload Image (Optional)</label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                  {uploadImageBase64 && <img src={uploadImageBase64} alt="Preview" className="h-20 object-contain mt-2 rounded border" />}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Or Paste English Text Here</label>
                  <textarea rows={3} value={uploadText} onChange={(e) => setUploadText(e.target.value)} placeholder="Enter text..." className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"></textarea>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Set Price (₹)</label>
                    <input type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <button onClick={generateQuestionsWithAI} disabled={isGenerating} className="flex-1 mt-6 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center h-10">
                    {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Generate AI MCQs"}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 flex flex-col">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <QrCode className="w-5 h-5 mr-2 text-blue-600"/> 
                  Your Payment QR Code
                </h2>
                <div className="flex items-center space-x-4">
                  <img src={adminQrImage} alt="Admin QR" className="w-24 h-24 border rounded-lg object-contain bg-slate-50" />
                  <div>
                    <label className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold cursor-pointer hover:bg-blue-200 transition-colors text-sm">
                      Upload New QR
                      <input type="file" accept="image/*" ref={qrInputRef} onChange={handleQrUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-500"/> 
                  Pending Payment Requests
                </h2>
                {paymentRequests.filter(r => r.status === 'pending').length === 0 ? (
                  <p className="text-slate-500 text-sm">No pending requests.</p>
                ) : (
                  <div className="space-y-3">
                    {paymentRequests.filter(r => r.status === 'pending').map((req) => {
                      const testInfo = mcqSets.find(t => t.id === req.testId);
                      return (
                        <div key={req.reqId} className="flex items-center justify-between p-3 border border-orange-100 bg-orange-50 rounded-lg">
                          <div>
                            <p className="font-bold text-sm text-slate-800">Student requested access</p>
                            <p className="text-xs text-slate-500">Test: {testInfo?.title} (₹{testInfo?.price})</p>
                          </div>
                          <div className="flex space-x-2">
                            <button onClick={() => handleApprovePayment(req.reqId, req.testId)} className="p-2 bg-green-500 text-white rounded hover:bg-green-600"><Check className="w-4 h-4" /></button>
                            <button onClick={() => handleRejectPayment(req.reqId)} className="p-2 bg-red-500 text-white rounded hover:bg-red-600"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full overflow-hidden mb-8">
             <h2 className="text-xl font-bold mb-6 flex items-center"><Award className="w-5 h-5 mr-2 text-yellow-500"/> Student Results Board</h2>
             <div className="w-full overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50 text-slate-600 text-sm">
                     <th className="p-4 rounded-tl-lg font-semibold whitespace-nowrap">Student Name</th>
                     <th className="p-4 font-semibold whitespace-nowrap">Test Taken</th>
                     <th className="p-4 font-semibold whitespace-nowrap">Score</th>
                     <th className="p-4 rounded-tr-lg font-semibold whitespace-nowrap">Date</th>
                   </tr>
                 </thead>
                 <tbody>
                   {studentResults.length === 0 && (
                     <tr><td colSpan="4" className="p-4 text-center text-slate-500">No results found on backend.</td></tr>
                   )}
                   {studentResults.map(res => (
                     <tr key={res._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                       <td className="p-4 font-bold text-slate-800">{res.studentName}</td>
                       <td className="p-4 text-slate-600">{res.testTitle}</td>
                       <td className="p-4 font-semibold text-blue-600">{res.score} / {res.total}</td>
                       <td className="p-4 text-slate-400 text-sm">{new Date(res.date).toLocaleString()}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser === 'student') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold">Mission English</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 px-3 py-1.5 rounded-full text-blue-700 font-medium text-sm border border-blue-100 hidden sm:block">
                Welcome, {currentStudent?.name || "Student"}!
              </div>
              <button 
                onClick={() => {
                  setCurrentUser(null);
                  setCurrentStudent(null);
                }}
                className="text-slate-500 hover:text-red-500 transition-colors flex items-center text-sm font-semibold"
              >
                <LogOut className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Available Courses & Tests</h1>
                <p className="text-slate-500">Choose your tests and start practicing.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mcqSets.map(set => {
                  const isUnlocked = unlockedSets.includes(set.id) || set.price === 0;
                  const pendingReq = paymentRequests.find(r => r.testId === set.id && r.status === 'pending');

                  return (
                    <div key={set.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                      <div className={`h-2 ${isUnlocked ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-lg leading-tight pr-2">{set.title}</h3>
                          {isUnlocked ? <CheckCircle className="w-6 h-6 text-green-500 shrink-0" /> : <Lock className="w-6 h-6 text-slate-300 shrink-0" />}
                        </div>
                        <p className="text-sm text-slate-500 mb-6 flex-1">{set.description}</p>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-auto pt-4 border-t border-slate-100 gap-4">
                          <div className="text-sm font-medium text-slate-500">{set.questions.length} Questions</div>
                          
                          {isUnlocked ? (
                            <button onClick={() => startTest(set.id)} className="w-full sm:w-auto flex justify-center items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
                              <PlayCircle className="w-4 h-4" /> <span>Start Test</span>
                            </button>
                          ) : pendingReq ? (
                             <button disabled className="w-full sm:w-auto flex justify-center items-center space-x-1 bg-orange-100 text-orange-700 px-3 py-2 rounded-lg font-semibold text-xs cursor-not-allowed">
                               <Clock className="w-4 h-4" /> <span>Pending Approval</span>
                             </button>
                          ) : (
                            <button onClick={() => { setActiveTestId(set.id); setCurrentView('payment'); }} className="w-full sm:w-auto flex justify-center items-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
                              <DollarSign className="w-4 h-4" /> <span>Buy ₹{set.price}</span>
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

          {/* Payment View */}
          {currentView === 'payment' && (
            <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
               <button onClick={() => setCurrentView('dashboard')} className="text-slate-500 hover:text-slate-800 mb-6 flex items-center font-medium text-sm">← Go Back</button>
               {(() => {
                 const activeTest = mcqSets.find(s => s.id === activeTestId);
                 if(!activeTest) return null;
                 return (
                   <>
                     <h2 className="text-2xl font-bold mb-2">Make Payment</h2>
                     <p className="text-slate-500 mb-6">Pay ₹{activeTest.price} to unlock "{activeTest.title}".</p>
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex justify-center">
                        <img src={adminQrImage} alt="Payment QR Code" className="w-48 h-48 object-contain" />
                     </div>
                     <p className="text-sm font-medium text-slate-600 mb-6">Please scan and complete the payment using your UPI app, then click below.</p>
                     <button onClick={() => requestPaymentApproval(activeTest.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold transition-colors shadow-sm">I Have Paid</button>
                   </>
                 )
               })()}
            </div>
          )}

          {/* Test View */}
          {currentView === 'test' && (
            <div className="max-w-3xl mx-auto w-full">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 md:p-8 w-full">
                {(() => {
                  const activeTest = mcqSets.find(s => s.id === activeTestId);
                  if(!activeTest) return null;

                  return (
                    <>
                      <div className="mb-8 border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <h2 className="text-xl sm:text-2xl font-bold">{activeTest.title}</h2>
                        <div className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full font-bold text-sm self-start sm:self-auto shrink-0">{activeTest.questions.length} Questions</div>
                      </div>

                      <div className="space-y-8 sm:space-y-10">
                        {activeTest.questions.map((q, index) => (
                          <div key={q.id}>
                            <h3 className="text-lg font-semibold mb-4 leading-relaxed">
                              <span className="text-blue-600 mr-2">Q{index + 1}.</span> {q.q}
                            </h3>
                            <div className="grid gap-3">
                              {q.options.map((opt, optIndex) => (
                                <label key={optIndex} className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${studentAnswers[q.id] === optIndex ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
                                  <input type="radio" name={`question-${q.id}`} className="w-5 h-5 mt-0.5 text-blue-600 border-slate-300 focus:ring-blue-500 mr-4 shrink-0" checked={studentAnswers[q.id] === optIndex} onChange={() => setStudentAnswers({...studentAnswers, [q.id]: optIndex})} />
                                  <span className="font-medium">{opt}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                        <button onClick={submitTest} disabled={Object.keys(studentAnswers).length !== activeTest.questions.length} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold text-lg transition-colors shadow-sm w-full sm:w-auto">
                          Submit Test
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Result View */}
          {currentView === 'result' && (
            <div className="max-w-2xl mx-auto text-center mt-10 px-4">
              <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 sm:p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                <Award className="w-20 h-20 sm:w-24 sm:h-24 text-yellow-400 mx-auto mb-6" />
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Test Completed!</h2>
                
                {(() => {
                  const activeTest = mcqSets.find(s => s.id === activeTestId);
                  if(!activeTest) return null;
                  const total = activeTest.questions.length;
                  const percentage = Math.round((testScore / total) * 100);
                  
                  return (
                    <>
                      <p className="text-slate-500 text-base sm:text-lg mb-8">Your Result has been submitted to the Admin.</p>
                      
                      <div className="flex justify-center items-center space-x-4 md:space-x-6 mb-10">
                        <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 w-24 sm:w-28 md:w-32">
                          <div className="text-3xl md:text-4xl font-black mb-1">{testScore}</div>
                          <div className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider">Marks</div>
                        </div>
                        <div className="text-3xl font-light text-slate-300">/</div>
                        <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 w-24 sm:w-28 md:w-32">
                          <div className="text-3xl md:text-4xl font-black mb-1">{total}</div>
                          <div className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider">Total</div>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-4 mb-2">
                        <div className={`h-4 rounded-full transition-all duration-1000 ${percentage >= 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <p className="text-sm font-bold text-slate-600 mb-10">{percentage}% Accuracy</p>
                    </>
                  )
                })()}

                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <button onClick={() => startTest(activeTestId)} className="flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-colors w-full sm:w-auto">
                    <RefreshCw className="w-5 h-5" /> <span>Try Again</span>
                  </button>
                  <button onClick={() => setCurrentView('dashboard')} className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm w-full sm:w-auto">
                    <BookOpen className="w-5 h-5" /> <span>More Tests</span>
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