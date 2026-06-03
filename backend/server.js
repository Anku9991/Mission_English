const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mission_english';
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas & Models

const courseSchema = new mongoose.Schema({
  id: String,
  title: String,
  price: Number,
  description: String,
  type: { type: String, default: 'mcq' }, // 'mcq' | 'video' | 'notes'
  contentUrl: String, // For Video URL or PDF URL
  textContent: String, // For Notes
  questions: [{
    id: Number,
    q: String,
    options: [String],
    correct: Number
  }],
  createdAt: { type: Date, default: Date.now }
});
const Course = mongoose.model('Course', courseSchema);

const paymentRequestSchema = new mongoose.Schema({
  reqId: Number,
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: String,
  testId: String,
  status: { type: String, default: 'pending' },
  timestamp: String
});
const PaymentRequest = mongoose.model('PaymentRequest', paymentRequestSchema);

const studentSchema = new mongoose.Schema({
  name: String,
  contactNo: String,
  unlockedCourses: [String],
  createdAt: { type: Date, default: Date.now }
});

const testResultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: String,
  testId: Number,
  testTitle: String,
  score: Number,
  total: Number,
  date: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);
const TestResult = mongoose.model('TestResult', testResultSchema);

// API Endpoints

app.get('/', (req, res) => res.send('Mission English Backend is Running!'));

// Courses (Previously Tests)
app.get('/api/tests', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tests', async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tests/:id', async (req, res) => {
  try {
    const updatedCourse = await Course.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tests/:id', async (req, res) => {
  try {
    await Course.findOneAndDelete({ id: req.params.id });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register/Login Student
app.post('/api/register', async (req, res) => {
  try {
    const { name, contactNo } = req.body;
    if(!name || !contactNo) return res.status(400).json({ error: 'Name and contact required' });

    let student = await Student.findOne({ contactNo, name });
    if (!student) {
      student = new Student({ name, contactNo, unlockedCourses: [] });
      await student.save();
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch Unlocked Courses for a student
app.get('/api/students/:id/unlocked', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.status(200).json(student ? student.unlockedCourses : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit Test
app.post('/api/submit-test', async (req, res) => {
  try {
    const { studentId, studentName, testId, testTitle, score, total } = req.body;
    const result = new TestResult({
      studentId,
      studentName,
      testId,
      testTitle,
      score,
      total
    });
    await result.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { pin } = req.body;
  if (pin === ADMIN_PIN) {
    res.status(200).json({ success: true, token: 'admin_token' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid PIN' });
  }
});

// Get All Results
app.get('/api/admin/results', async (req, res) => {
  try {
    const results = await TestResult.find().sort({ date: -1 });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payment Requests
app.get('/api/payments', async (req, res) => {
  try {
    const requests = await PaymentRequest.find({ status: 'pending' }).sort({ _id: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments/request', async (req, res) => {
  try {
    const reqData = new PaymentRequest(req.body);
    await reqData.save();
    res.status(201).json(reqData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments/approve', async (req, res) => {
  try {
    const { reqId, studentId, testId } = req.body;
    
    // Mark payment as approved
    await PaymentRequest.findOneAndUpdate({ reqId }, { status: 'approved' });
    
    // Unlock course for student
    const student = await Student.findById(studentId);
    if (student && !student.unlockedCourses.includes(testId)) {
      student.unlockedCourses.push(testId);
      await student.save();
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
