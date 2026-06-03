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

// Schemas
const studentSchema = new mongoose.Schema({
  name: String,
  contactNo: String,
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

// Register/Login Student
app.post('/api/register', async (req, res) => {
  try {
    const { name, contactNo } = req.body;
    if(!name || !contactNo) return res.status(400).json({ error: 'Name and contact required' });

    let student = await Student.findOne({ contactNo, name });
    if (!student) {
      student = new Student({ name, contactNo });
      await student.save();
    }
    res.status(200).json(student);
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

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
