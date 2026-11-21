# DishaSetu: Student Opportunity & Government Scheme Finder
## Complete Project Source Code for BCA College Project Report

> Generated on: 19 November 2026
> Total Files: 49

---

### File 1 of 49
**File Name:** package.json  
**File Path:** /package.json  
**Purpose:** Project metadata, dependency declarations, and scripts  

`json
{
  "name": "dishasetu",
  "version": "1.0.0",
  "description": "DishaSetu — Right Opportunity → Right Person → Right Time (Student Opportunities & Government Schemes Portal)",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seedData.js"
  },
  "keywords": [
    "dishasetu",
    "student-opportunities",
    "scholarships",
    "government-schemes",
    "hackathons",
    "competitions",
    "education"
  ],
  "author": "DishaSetu Team",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.3.2",
    "multer": "^2.3.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}

`

---

### File 2 of 49
**File Name:** server.js  
**File Path:** /server.js  
**Purpose:** Main application entry point, Express server, middleware, routes, and error handling  

`javascript
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const connectDB = require('./config/db');
const { initDeadlineCron } = require('./services/deadlineCron');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const savedRoutes = require('./routes/savedRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Core Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Block direct public static access to private verification proofs directory
app.use('/uploads/proofs', (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Access Denied. Verification proofs are private and accessible only via Admin Console.'
  });
});

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'DishaSetu — Right Opportunity → Right Person → Right Time',
    timestamp: new Date()
  });
});

// Fallback for API routes (404 Not Found)
app.use('/api/{*splat}', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route [${req.method} ${req.originalUrl}] not found.`
  });
});

// Fallback for SPA/Static routes -> send to index.html if file doesn't exist
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>  {
  console.log(`====================================================`);
  console.log(`✨ DishaSetu Server running on http://localhost:${PORT}`);
  console.log(`✨ Tagline: "Right Opportunity → Right Person → Right Time"`);
  console.log(`====================================================`);

  // Start Background Deadline Cron Scheduler
  initDeadlineCron();
});

`

---

### File 3 of 49
**File Name:** db.js  
**File Path:** /config/db.js  
**Purpose:** MongoDB Atlas connection configuration via Mongoose  

`javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dishasetu');
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

`

---

### File 4 of 49
**File Name:** deadlineCron.js  
**File Path:** /services/deadlineCron.js  
**Purpose:** Scheduled cron jobs for deadline monitoring and reminder notifications  

`javascript
const SavedItem = require('../models/SavedItem');
const Notification = require('../models/Notification');

let cronTimer = null;

async function checkDeadlines() {
  try {
    const now = new Date();
    const pendingItems = await SavedItem.find({
      reminderStatus: 'pending',
      reminderDate: { $lte: now }
    }).populate('opportunityId').populate('schemeId');

    for (const saved of pendingItems) {
      const item = saved.opportunityId || saved.schemeId;
      if (!item || item.status === 'CLOSED') {
        saved.reminderStatus = 'disabled';
        await saved.save();
        continue;
      }

      const isOpp = saved.itemType === 'Opportunity';
      const titleEn = item.title ? (item.title.en || item.title) : 'Saved Opportunity';
      const titleHi = item.title ? (item.title.hi || titleEn) : 'सहेजा गया अवसर';
      const targetUrl = isOpp ? `/opportunity-details.html?id=${item._id}` : `/scheme-details.html?id=${item._id}`;

      // Create In-App Notification
      await Notification.create({
        userId: saved.userId,
        title: {
          en: `⏰ Upcoming Deadline: ${titleEn}`,
          hi: `⏰ आगामी अंतिम तिथि: ${titleHi}`
        },
        message: {
          en: `The deadline for ${titleEn} is approaching soon. Apply now before it closes!`,
          hi: `${titleHi} की अंतिम तिथि जल्द समाप्त हो रही है। बंद होने से पहले अभी आवेदन करें!`
        },
        targetUrl
      });

      console.log(`[Deadline Alert Sent] User ${saved.userId} -> ${titleEn}`);

      saved.reminderStatus = 'sent';
      await saved.save();
    }
  } catch (error) {
    console.error('[Deadline Cron Error]:', error);
  }
}

function initDeadlineCron() {
  // Clear any existing timer to prevent duplicate intervals
  if (cronTimer) {
    clearInterval(cronTimer);
  }

  // Run once on startup
  checkDeadlines();
  // Check every 10 minutes
  cronTimer = setInterval(checkDeadlines, 10 * 60 * 1000);
  console.log('⏰ [DishaSetu Deadline Cron Service Initialized]');
}

module.exports = { initDeadlineCron, checkDeadlines };

`

---

### File 5 of 49
**File Name:** seedData.js  
**File Path:** /seedData.js  
**Purpose:** Database seeding script for initializing demo opportunities, schemes, and admin account  

`javascript
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Admin = require('./models/Admin');
const Opportunity = require('./models/Opportunity');
const Scheme = require('./models/Scheme');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/dishasetu';
    console.log(`[Seed Script] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('[Seed Script] Connected successfully.');

    const salt = await bcrypt.genSalt(10);

    // 1. Seed Main Admin Account (User + Admin collections)
    const adminEmail = 'shivamkumarmzp2@gmail.com';
    const adminPassword = 'Shakti@826';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, salt);

    let admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      admin = await Admin.create({
        name: 'DishaSetu Administrator',
        email: adminEmail,
        password: hashedAdminPassword,
        role: 'admin'
      });
      console.log(`[Seed] Admin Created in Admin collection: ${adminEmail}`);
    } else {
      admin.password = hashedAdminPassword;
      await admin.save();
    }

    // Also seed in User collection for seamless single-portal auth
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      await User.create({
        name: 'DishaSetu Administrator',
        email: adminEmail,
        password: hashedAdminPassword,
        role: 'admin',
        phone: '+91 98765 00000',
        education: 'Post Graduate',
        state: 'All India',
        category: 'General'
      });
      console.log(`[Seed] Admin Created in User collection: ${adminEmail}`);
    } else {
      adminUser.password = hashedAdminPassword;
      adminUser.role = 'admin';
      await adminUser.save();
    }

    // 2. Seed Quick Demo Admin Account: admin@dishasetu.in / Admin@123
    const demoAdminEmail = 'admin@dishasetu.in';
    const hashedDemoAdminPassword = await bcrypt.hash('Admin@123', salt);
    let demoAdminUser = await User.findOne({ email: demoAdminEmail });
    if (!demoAdminUser) {
      await User.create({
        name: 'Demo System Admin',
        email: demoAdminEmail,
        password: hashedDemoAdminPassword,
        role: 'admin',
        phone: '+91 98765 11111',
        education: 'Post Graduate',
        state: 'All India',
        category: 'General'
      });
      console.log(`[Seed] Quick Demo Admin Created: ${demoAdminEmail} (Pass: Admin@123)`);
    } else {
      demoAdminUser.password = hashedDemoAdminPassword;
      demoAdminUser.role = 'admin';
      await demoAdminUser.save();
    }

    // 3. Seed Student Test Profile: student.demo@dishasetu.in / Student@123
    const studentEmail = 'student.demo@dishasetu.in';
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      const hashedStudentPassword = await bcrypt.hash('Student@123', salt);
      student = await User.create({
        name: 'Rahul Verma',
        email: studentEmail,
        password: hashedStudentPassword,
        phone: '+91 98765 43210',
        role: 'student',
        age: 21,
        education: 'Graduate',
        state: 'Uttar Pradesh',
        category: 'General',
        languagePreference: 'en'
      });
      console.log(`[Seed] Demo Student Created: ${studentEmail} (Pass: Student@123)`);
    }

    // 4. Seed test opportunities & schemes if empty or for fresh test data
    await Opportunity.deleteMany({});
    await Scheme.deleteMany({});

    console.log('[Seed] Seeding realistic test student opportunities...');

    const demoOpportunities = [
      {
        title: {
          en: 'PM Higher Education Scholarship 2026',
          hi: 'प्रधानमंत्री उच्च शिक्षा छात्रवृत्ति 2026'
        },
        type: 'Scholarship',
        description: {
          en: 'Financial assistance for meritorious undergraduate and post-graduate students across recognized Indian universities.',
          hi: 'मान्यता प्राप्त भारतीय विश्वविद्यालयों के मेधावी स्नातक और स्नातकोत्तर छात्रों के लिए वित्तीय सहायता।'
        },
        eligibility: {
          minAge: 17,
          maxAge: 26,
          education: ['12th', 'Graduate', 'Post Graduate'],
          state: ['All India'],
          category: ['General', 'OBC', 'SC', 'ST', 'EWS'],
          details: {
            en: 'Must have secured 60%+ marks in Class 12 or Graduation. Family income < 8 LPA.',
            hi: 'कक्षा 12 या स्नातक में न्यूनतम 60% अंक। पारिवारिक आय 8 लाख से कम।'
          }
        },
        benefits: {
          en: '₹48,000 / Year financial aid directly into bank account.',
          hi: '₹48,000 / वर्ष वित्तीय सहायता सीधे बैंक खाते में।'
        },
        prizeAmount: '₹48,000 / Year',
        documents: {
          en: 'Marksheets, Income Certificate, Aadhar Card, Bank Passbook, Institute Bonafide.',
          hi: 'अंक पत्र, आय प्रमाण पत्र, आधार कार्ड, बैंक पासबुक, संस्थान बोनाफाइड।'
        },
        applicationProcess: {
          en: '1. Register on NSP Portal\n2. Fill online application form\n3. Upload documents\n4. College verification.',
          hi: '1. एनएसपी पोर्टल पर पंजीकरण करें\n2. आवेदन पत्र भरें\n3. दस्तावेज अपलोड करें\n4. कॉलेज सत्यापन।'
        },
        lastDate: new Date('2026-10-30'),
        status: 'OPEN',
        applyUrl: 'https://scholarships.gov.in',
        showInLatestUpdates: true
      },
      {
        title: {
          en: 'National Innovation Quiz Competition 2026',
          hi: 'राष्ट्रीय नवाचार प्रश्नोत्तरी प्रतियोगिता 2026'
        },
        type: 'Quiz Competition',
        description: {
          en: 'Nationwide online quiz competition testing general knowledge, science, and digital technology awareness.',
          hi: 'सामान्य ज्ञान, विज्ञान और डिजिटल तकनीक जागरूकता का परीक्षण करने वाली राष्ट्रव्यापी ऑनलाइन क्विज़ प्रतियोगिता।'
        },
        eligibility: {
          minAge: 14,
          maxAge: 30,
          education: ['10th', '12th', 'Graduate', 'Diploma', 'Any'],
          state: ['All India'],
          category: ['All'],
          details: {
            en: 'Open to all Indian students enrolled in schools or colleges.',
            hi: 'स्कूलों या कॉलेजों में नामांकित सभी भारतीय छात्रों के लिए खुला।'
          }
        },
        benefits: {
          en: '1st Prize: ₹50,000 cash prize + National Certificate.',
          hi: 'प्रथम पुरस्कार: ₹50,000 नकद पुरस्कार + राष्ट्रीय प्रमाण पत्र।'
        },
        prizeAmount: 'Prize ₹50,000',
        documents: {
          en: 'Student ID Card, Aadhar Card.',
          hi: 'छात्र पहचान पत्र, आधार कार्ड।'
        },
        applicationProcess: {
          en: '1. Register online\n2. Complete 20-min timed quiz round\n3. Top scorers advance to finals.',
          hi: '1. ऑनलाइन रजिस्टर करें\n2. 20 मिनट का क्विज़ पूरा करें\n3. शीर्ष प्रतिभागी फाइनल में जाएंगे।'
        },
        lastDate: new Date('2026-09-25'),
        status: 'CLOSING SOON',
        applyUrl: 'https://mygov.in',
        showInLatestUpdates: true
      },
      {
        title: {
          en: 'Smart India Hackathon 2026 - Coding Challenge',
          hi: 'स्मार्ट इंडिया हैकाथॉन 2026 - कोडिंग प्रतियोगिता'
        },
        type: 'Hackathon',
        description: {
          en: 'Premier national hackathon bringing student coders together to solve real-world government and industry problem statements.',
          hi: 'छात्र कोडर को वास्तविक सरकारी और औद्योगिक समस्याओं को हल करने के लिए एक साथ लाने वाला प्रमुख राष्ट्रीय हैकाथॉन।'
        },
        eligibility: {
          minAge: 18,
          maxAge: 28,
          education: ['Graduate', 'Post Graduate', 'Diploma'],
          state: ['All India'],
          category: ['All'],
          details: {
            en: 'Teams of 6 students (at least 1 female member required) from engineering and degree colleges.',
            hi: 'इंजीनियरिंग और डिग्री कॉलेजों के 6 छात्रों की टीम (कम से कम 1 महिला सदस्य अनिवार्य)।'
          }
        },
        benefits: {
          en: '₹1,00,000 per problem statement award + Incubation support.',
          hi: 'प्रति समस्या ₹1,00,000 का पुरस्कार + इंक्यूबेशन सहायता।'
        },
        prizeAmount: '₹1,00,000 / Problem',
        documents: {
          en: 'College ID, Project PPT Proposal, Team Registration Form.',
          hi: 'कॉलेज आईडी, प्रोजेक्ट पीपीटी प्रस्ताव, टीम पंजीकरण फॉर्म।'
        },
        applicationProcess: {
          en: '1. Form a team\n2. Submit PPT proposal on SIH portal\n3. College SPOC nomination.',
          hi: '1. टीम बनाएं\n2. एसआईएच पोर्टल पर प्रस्ताव जमा करें\n3. कॉलेज एसपीओसी नामांकन।'
        },
        lastDate: new Date('2026-11-15'),
        status: 'OPEN',
        applyUrl: 'https://sih.gov.in',
        showInLatestUpdates: true
      }
    ];

    await Opportunity.insertMany(demoOpportunities);
    console.log(`[Seed] Created ${demoOpportunities.length} Student Opportunities.`);

    const demoSchemes = [
      {
        title: {
          en: 'UP Free Smartphone & Tablet Distribution Scheme 2026',
          hi: 'यूपी मुफ्त स्मार्टफोन एवं टैबलेट वितरण योजना 2026'
        },
        sector: 'Education',
        governmentType: 'State',
        stateName: 'Uttar Pradesh',
        description: {
          en: 'Uttar Pradesh state government scheme providing free tablets and smartphones to post-graduate, graduate, and ITI students to foster digital literacy.',
          hi: 'डिजिटल साक्षरता को बढ़ावा देने के लिए उत्तर प्रदेश सरकार की योजना जिसके तहत स्नातकोत्तर, स्नातक और आईटीआई छात्रों को मुफ्त टैबलेट और स्मार्टफोन दिए जा रहे हैं।'
        },
        eligibility: {
          minAge: 18,
          maxAge: 30,
          education: ['Graduate', 'Post Graduate', 'Diploma', 'ITI'],
          category: ['General', 'OBC', 'SC', 'ST', 'EWS'],
          targetGroup: ['Students', 'Youth'],
          details: {
            en: 'Resident of Uttar Pradesh studying in recognized UP colleges/universities.',
            hi: 'उत्तर प्रदेश का निवासी जो यूपी के मान्यता प्राप्त कॉलेजों/विश्वविद्यालयों में पढ़ रहा हो।'
          }
        },
        benefits: {
          en: 'Free 5G Smartphone / Tablet pre-loaded with educational software.',
          hi: 'मुफ्त 5जी स्मार्टफोन / टैबलेट शैक्षिक सॉफ्टवेयर के साथ।'
        },
        documents: {
          en: 'Domicile Certificate of UP, College ID, Aadhar Card, Latest Marksheet.',
          hi: 'यूपी का निवास प्रमाण पत्र, कॉलेज आईडी, आधार कार्ड, नवीनतम अंक पत्र।'
        },
        applicationProcess: {
          en: '1. College submits student list on DigiShakti portal\n2. Verification by district administration\n3. Distribution at college campus.',
          hi: '1. कॉलेज डिगीशक्ति पोर्टल पर सूची प्रस्तुत करता है\n2. जिला प्रशासन द्वारा सत्यापन\n3. कॉलेज परिसर में वितरण।'
        },
        lastDate: new Date('2026-10-20'),
        status: 'OPEN',
        applyUrl: 'https://up.gov.in',
        showInLatestUpdates: true
      },
      {
        title: {
          en: 'PM Skill Development Scheme 4.0 (PMKVY)',
          hi: 'प्रधानमंत्री कौशल विकास योजना 4.0 (पीएमकेवीवाई)'
        },
        sector: 'Skill Development',
        governmentType: 'Central',
        stateName: 'All India',
        description: {
          en: 'Skill certification scheme aimed at enabling youth to take up industry-relevant skill training for better livelihoods.',
          hi: 'युवाओं को बेहतर आजीविका के लिए उद्योग-प्रासंगिक कौशल प्रशिक्षण लेने में सक्षम बनाने के उद्देश्य से कौशल प्रमाणन योजना।'
        },
        eligibility: {
          minAge: 15,
          maxAge: 45,
          education: ['10th', '12th', 'Graduate', 'Diploma', 'ITI', 'Any'],
          category: ['All'],
          targetGroup: ['Youth', 'Job Seekers'],
          details: {
            en: 'Indian citizens seeking skill enhancement or short-term training.',
            hi: 'कौशल वृद्धि या अल्पकालिक प्रशिक्षण की तलाश कर रहे भारतीय नागरिक।'
          }
        },
        benefits: {
          en: '100% Free Skill Training + Government Certificate + Job Placement Assistance.',
          hi: '100% मुफ्त कौशल प्रशिक्षण + सरकारी प्रमाण पत्र + रोजगार सहायता।'
        },
        documents: {
          en: 'Aadhar Card, Bank Account Details, Passport size Photo.',
          hi: 'आधार कार्ड, बैंक खाता विवरण, पासपोर्ट आकार की फोटो।'
        },
        applicationProcess: {
          en: '1. Visit nearest PMKVY Training Center or apply online\n2. Select job role\n3. Complete training & assessment.',
          hi: '1. निकटतम पीएमकेवीवाई केंद्र पर जाएं या ऑनलाइन आवेदन करें\n2. जॉब रोल चुनें\n3. प्रशिक्षण पूरा करें।'
        },
        lastDate: new Date('2026-12-31'),
        status: 'OPEN',
        applyUrl: 'https://pmkvyofficial.org',
        showInLatestUpdates: true
      }
    ];

    await Scheme.insertMany(demoSchemes);
    console.log(`[Seed] Created ${demoSchemes.length} Government Schemes.`);

    console.log('====================================================');
    console.log('✨ [Seed Complete] DishaSetu database successfully populated with test data!');
    console.log('====================================================');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();

`

---

### File 6 of 49
**File Name:** User.js  
**File Path:** /models/User.js  
**Purpose:** Mongoose schema for student users, profile data, and bcrypt authentication  

`javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'user', 'admin'],
    default: 'student'
  },
  // Student & User Profile Fields for Eligibility Finder
  age: {
    type: Number,
    min: 5,
    max: 100,
    default: null
  },
  education: {
    type: String,
    enum: ['10th', '12th', 'Graduate', 'Post Graduate', 'Diploma', 'PhD', 'ITI', 'Any', ''],
    default: 'Graduate'
  },
  state: {
    type: String,
    default: 'All India',
    trim: true
  },
  category: {
    type: String,
    enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minorities', 'Women', 'All', ''],
    default: 'General'
  },
  languagePreference: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);

`

---

### File 7 of 49
**File Name:** Admin.js  
**File Path:** /models/Admin.js  
**Purpose:** Mongoose schema for administrator credentials and permissions  

`javascript
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Admin name is required'],
    trim: true,
    default: 'Administrator'
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    default: 'admin',
    immutable: true
  },
  upiId: {
    type: String,
    default: 'dishasetu@upi',
    trim: true
  },
  businessName: {
    type: String,
    default: 'DishaSetu Portal',
    trim: true
  },
  bankAccount: {
    type: String,
    default: '',
    trim: true
  },
  bankIfsc: {
    type: String,
    default: '',
    trim: true
  },
  bankName: {
    type: String,
    default: '',
    trim: true
  },
  accountHolderName: {
    type: String,
    default: '',
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Admin', AdminSchema);

`

---

### File 8 of 49
**File Name:** Opportunity.js  
**File Path:** /models/Opportunity.js  
**Purpose:** Mongoose schema for student opportunities (scholarships, hackathons, competitions)  

`javascript
const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true, trim: true },
    hi: { type: String, default: '', trim: true }
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Scholarship',
      'GK / GS Competition',
      'Quiz Competition',
      'Essay Competition',
      'Competitive Exam',
      'Coding Competition',
      'Hackathon',
      'Skill Development Program',
      'Training Program',
      'Prize Opportunity',
      'Internship',
      'Other'
    ],
    default: 'Scholarship'
  },
  description: {
    en: { type: String, default: '', trim: true },
    hi: { type: String, default: '', trim: true }
  },
  eligibility: {
    minAge: { type: Number, default: 0 },
    maxAge: { type: Number, default: 100 },
    education: [{ type: String }],
    state: [{ type: String }],
    category: [{ type: String }],
    details: {
      en: { type: String, default: '' },
      hi: { type: String, default: '' }
    }
  },
  benefits: {
    en: { type: String, default: '' },
    hi: { type: String, default: '' }
  },
  prizeAmount: {
    type: String,
    default: ''
  },
  documents: {
    en: { type: String, default: '' },
    hi: { type: String, default: '' }
  },
  applicationProcess: {
    en: { type: String, default: '' },
    hi: { type: String, default: '' }
  },
  lastDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSING SOON', 'UPCOMING', 'CLOSED'],
    default: 'OPEN'
  },
  applyUrl: {
    type: String,
    required: [true, 'Official application link (applyUrl) is required'],
    trim: true
  },
  showInLatestUpdates: {
    type: Boolean,
    default: false
  },
  publicBannerImage: {
    type: String,
    default: '',
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

OpportunitySchema.index({ 'title.en': 'text', 'title.hi': 'text', 'description.en': 'text' });

module.exports = mongoose.model('Opportunity', OpportunitySchema);

`

---

### File 9 of 49
**File Name:** Scheme.js  
**File Path:** /models/Scheme.js  
**Purpose:** Mongoose schema for central and state government schemes  

`javascript
const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true, trim: true },
    hi: { type: String, default: '', trim: true }
  },
  sector: {
    type: String,
    required: true,
    enum: [
      'Education',
      'Employment',
      'Women',
      'Farmers',
      'Health',
      'Housing',
      'Skill Development',
      'Financial Assistance',
      'Social Welfare',
      'Other'
    ],
    default: 'Education'
  },
  governmentType: {
    type: String,
    enum: ['Central', 'State'],
    default: 'Central'
  },
  stateName: {
    type: String,
    default: 'All India',
    trim: true
  },
  description: {
    en: { type: String, default: '', trim: true },
    hi: { type: String, default: '', trim: true }
  },
  eligibility: {
    minAge: { type: Number, default: 0 },
    maxAge: { type: Number, default: 100 },
    education: [{ type: String }],
    category: [{ type: String }],
    targetGroup: [{ type: String }],
    details: {
      en: { type: String, default: '' },
      hi: { type: String, default: '' }
    }
  },
  benefits: {
    en: { type: String, default: '' },
    hi: { type: String, default: '' }
  },
  documents: {
    en: { type: String, default: '' },
    hi: { type: String, default: '' }
  },
  applicationProcess: {
    en: { type: String, default: '' },
    hi: { type: String, default: '' }
  },
  lastDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSING SOON', 'UPCOMING', 'CLOSED'],
    default: 'OPEN'
  },
  applyUrl: {
    type: String,
    required: [true, 'Official government scheme portal link is required'],
    trim: true
  },
  showInLatestUpdates: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

SchemeSchema.index({ 'title.en': 'text', 'title.hi': 'text', 'description.en': 'text' });

module.exports = mongoose.model('Scheme', SchemeSchema);

`

---

### File 10 of 49
**File Name:** Submission.js  
**File Path:** /models/Submission.js  
**Purpose:** Mongoose schema for student-submitted opportunities pending admin review  

`javascript
const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  categoryType: {
    type: String,
    enum: ['Opportunity', 'Government Scheme', 'Student Opportunity', 'student_opportunity', 'government_scheme'],
    default: 'Opportunity'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Scholarship',
      'Government Scheme',
      'GK / GS Competition',
      'Quiz Competition',
      'Essay Competition',
      'Competitive Exam',
      'Coding Competition',
      'Hackathon',
      'Skill Development Program',
      'Training Program',
      'Prize Opportunity',
      'Internship',
      'Other'
    ],
    default: 'Scholarship'
  },
  organization: {
    type: String,
    default: '',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  sourceUrl: {
    type: String,
    required: [true, 'Source URL / Verification link is required'],
    trim: true
  },
  proofUrl: {
    type: String,
    required: [true, 'Proof document / notification file is required'],
    trim: true
  },
  proofOriginalName: {
    type: String,
    default: ''
  },
  verificationImage: {
    type: String,
    default: ''
  },
  publicBannerImage: {
    type: String,
    default: ''
  },
  eligibility: {
    minAge: { type: Number, default: 0 },
    maxAge: { type: Number, default: 100 },
    education: [{ type: String }],
    state: [{ type: String, default: 'All India' }],
    category: [{ type: String, default: 'All' }],
    details: { type: String, default: '' }
  },
  benefits: {
    type: String,
    default: ''
  },
  lastDate: {
    type: Date,
    required: [true, 'Last application date is required']
  },
  applyUrl: {
    type: String,
    default: '',
    trim: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending Review', 'Under Review', 'Changes Requested', 'Approved', 'Rejected'],
    default: 'Pending Review'
  },
  adminFeedback: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  createdOpportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  createdSchemeId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

SubmissionSchema.index({ title: 'text', organization: 'text' });

module.exports = mongoose.model('Submission', SubmissionSchema);

`

---

### File 11 of 49
**File Name:** SavedItem.js  
**File Path:** /models/SavedItem.js  
**Purpose:** Mongoose schema for student bookmarks, saved opportunities, and reminders  

`javascript
const mongoose = require('mongoose');

const SavedItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemType: {
    type: String,
    enum: ['Opportunity', 'Scheme'],
    required: true
  },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    default: null
  },
  schemeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scheme',
    default: null
  },
  reminderPreference: {
    type: String,
    enum: ['7_days', '3_days', '1_day', 'deadline_day', 'none'],
    default: '3_days'
  },
  reminderDate: {
    type: Date,
    default: null
  },
  reminderStatus: {
    type: String,
    enum: ['pending', 'sent', 'disabled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure uniqueness per user per opportunity/scheme
SavedItemSchema.index({ userId: 1, opportunityId: 1 }, { unique: true, sparse: true });
SavedItemSchema.index({ userId: 1, schemeId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('SavedItem', SavedItemSchema);

`

---

### File 12 of 49
**File Name:** Notification.js  
**File Path:** /models/Notification.js  
**Purpose:** Mongoose schema for bilingual in-app notifications and alerts  

`javascript
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    en: { type: String, required: true },
    hi: { type: String, default: '' }
  },
  message: {
    en: { type: String, required: true },
    hi: { type: String, default: '' }
  },
  targetUrl: {
    type: String,
    default: '#'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);

`

---

### File 13 of 49
**File Name:** auth.js  
**File Path:** /middleware/auth.js  
**Purpose:** JWT token verification, cookie extraction, and role-based access control  

`javascript
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT from httpOnly cookie or Authorization header
 */
const verifyToken = (req, res, next) => {
  try {
    let token = null;

    // Check cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    // Fallback to Bearer token in header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.'
      });
    }

    const secret = process.env.JWT_SECRET || 'dishasetu_super_secret_jwt_key_2026_student_portal';
    const decoded = jwt.verify(token, secret);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or corrupted authentication token.'
    });
  }
};

/**
 * Middleware for Role-Based Access Control (RBAC)
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Authorized roles: [${allowedRoles.join(', ')}]. Your role: [${req.user.role}].`
      });
    }

    next();
  };
};

const adminOnly = requireRole('admin');

module.exports = {
  verifyToken,
  protect: verifyToken,
  requireRole,
  adminOnly
};

`

---

### File 14 of 49
**File Name:** upload.js  
**File Path:** /middleware/upload.js  
**Purpose:** Multer storage configuration separating private proofs and public banners  

`javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Separate upload directories for Private Proofs (Non-Public) vs Public Banners
const privateProofDir = process.env.PRIVATE_PROOF_DIR || path.join(__dirname, '..', 'private_uploads', 'proofs');
const publicBannerDir = process.env.PUBLIC_BANNER_DIR || path.join(__dirname, '..', 'public', 'uploads', 'banners');

if (!fs.existsSync(privateProofDir)) {
  fs.mkdirSync(privateProofDir, { recursive: true });
}
if (!fs.existsSync(publicBannerDir)) {
  fs.mkdirSync(publicBannerDir, { recursive: true });
}

// Storage configuration with separated destinations
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'proof' || file.fieldname === 'verificationImage') {
      cb(null, privateProofDir);
    } else {
      cb(null, publicBannerDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedBaseName}-${uniqueSuffix}${ext}`);
  }
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type (${ext}). Only PDF documents, JPG, JPEG, PNG, and WEBP image proofs are accepted.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB max file size limit
  }
});

const submissionUploads = upload.fields([
  { name: 'proof', maxCount: 1 },
  { name: 'verificationImage', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'publicBannerImage', maxCount: 1 }
]);

module.exports = upload;
module.exports.submissionUploads = submissionUploads;

`

---

### File 15 of 49
**File Name:** authRoutes.js  
**File Path:** /routes/authRoutes.js  
**Purpose:** Authentication and profile management API routes  

`javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public auth routes
router.post('/register', authController.registerUser);
router.post('/register-farmer', authController.registerFarmer);
router.post('/register-customer', authController.registerCustomer);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected user session routes
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;

`

---

### File 16 of 49
**File Name:** opportunityRoutes.js  
**File Path:** /routes/opportunityRoutes.js  
**Purpose:** Opportunity CRUD and filtering API routes  

`javascript
const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', opportunityController.getOpportunities);
router.get('/ticker', opportunityController.getLatestUpdatesTicker);
router.post('/check-eligibility', opportunityController.checkEligibility);
router.get('/:id', opportunityController.getOpportunityById);

// Protected Admin CRUD routes
router.post('/', protect, adminOnly, opportunityController.createOpportunity);
router.put('/:id', protect, adminOnly, opportunityController.updateOpportunity);
router.delete('/:id', protect, adminOnly, opportunityController.deleteOpportunity);

module.exports = router;

`

---

### File 17 of 49
**File Name:** schemeRoutes.js  
**File Path:** /routes/schemeRoutes.js  
**Purpose:** Government scheme retrieval and management API routes  

`javascript
const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/schemeController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', schemeController.getSchemes);
router.get('/:id', schemeController.getSchemeById);

// Protected Admin routes
router.post('/', protect, adminOnly, schemeController.createScheme);
router.put('/:id', protect, adminOnly, schemeController.updateScheme);
router.delete('/:id', protect, adminOnly, schemeController.deleteScheme);

module.exports = router;

`

---

### File 18 of 49
**File Name:** submissionRoutes.js  
**File Path:** /routes/submissionRoutes.js  
**Purpose:** Student opportunity submission and admin review API routes  

`javascript
const express = require('express');
const router = express.Router();
const { submissionUploads } = require('../middleware/upload');
const { verifyToken, adminOnly } = require('../middleware/auth');
const {
  createSubmission,
  getMySubmissions,
  getAllSubmissionsAdmin,
  getSubmissionById,
  updateSubmissionStatusAdmin,
  getProofFile
} = require('../controllers/submissionController');

// All submission routes require authentication
router.use(verifyToken);

// Student submission endpoints
router.post('/', submissionUploads, createSubmission);
router.get('/my', getMySubmissions);

// Admin review endpoints
router.get('/admin', adminOnly, getAllSubmissionsAdmin);
router.put('/admin/:id/status', adminOnly, updateSubmissionStatusAdmin);
router.get('/proof/:filename', adminOnly, getProofFile);

// Single submission details
router.get('/:id', getSubmissionById);

module.exports = router;

`

---

### File 19 of 49
**File Name:** savedRoutes.js  
**File Path:** /routes/savedRoutes.js  
**Purpose:** Saved opportunities and reminder scheduling API routes  

`javascript
const express = require('express');
const router = express.Router();
const savedItemController = require('../controllers/savedItemController');
const { protect } = require('../middleware/auth');

router.post('/', protect, savedItemController.saveItem);
router.get('/', protect, savedItemController.getUserSavedItems);
router.put('/:id/reminder', protect, savedItemController.updateReminder);
router.delete('/:id', protect, savedItemController.removeSavedItem);

module.exports = router;

`

---

### File 20 of 49
**File Name:** notificationRoutes.js  
**File Path:** /routes/notificationRoutes.js  
**Purpose:** In-app notification retrieval and read-status API routes  

`javascript
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, notificationController.getNotifications);
router.put('/read-all', protect, notificationController.markAllRead);

module.exports = router;

`

---

### File 21 of 49
**File Name:** adminRoutes.js  
**File Path:** /routes/adminRoutes.js  
**Purpose:** Admin analytics, statistics, and student management API routes  

`javascript
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRegisteredStudents,
  deleteStudent
} = require('../controllers/adminController');
const { verifyToken, adminOnly } = require('../middleware/auth');

// Protect all admin routes with authentication & admin role check
router.use(verifyToken, adminOnly);

// Dashboard stats endpoint
router.get('/dashboard-stats', getDashboardStats);

// Student directory endpoints
router.get('/students', getRegisteredStudents);
router.delete('/students/:id', deleteStudent);

module.exports = router;

`

---

### File 22 of 49
**File Name:** authController.js  
**File Path:** /controllers/authController.js  
**Purpose:** Student and admin registration, login, logout, and profile controller  

`javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Helper to sign JWT token
const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'dishasetu_super_secret_jwt_key_2026_student_portal';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// Helper to set httpOnly cookie
const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/**
 * @desc   Register a new Student / User
 * @route  POST /api/auth/register
 * @access Public
 */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, age, education, state, category } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const emailNormalized = email.toLowerCase().trim();

    // Check existing account across User and Admin models
    const existingUser = await User.findOne({ email: emailNormalized });
    const existingAdmin = await Admin.findOne({ email: emailNormalized });

    if (existingUser || existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: emailNormalized,
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role: 'student',
      age: age ? Number(age) : null,
      education: education || 'Graduate',
      state: state || 'All India',
      category: category || 'General'
    });

    const token = signToken({
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    });

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to DishaSetu.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        age: user.age,
        education: user.education,
        state: user.state,
        category: user.category,
        languagePreference: user.languagePreference
      }
    });
  } catch (error) {
    console.error('Register User Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.'
    });
  }
};

/**
 * Legacy Support: Register Farmer / Customer aliases
 */
exports.registerFarmer = async (req, res) => {
  return exports.registerUser(req, res);
};

exports.registerCustomer = async (req, res) => {
  return exports.registerUser(req, res);
};

/**
 * @desc   Login user
 * @route  POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    let user = null;

    // Check User model first
    user = await User.findOne({ email: emailNormalized });
    
    // Check Admin model if not found in User model
    if (!user) {
      user = await Admin.findOne({ email: emailNormalized });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email address.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.'
      });
    }

    const userRole = user.role || 'student';

    const token = signToken({
      id: user._id,
      role: userRole,
      email: user.email,
      name: user.name
    });

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userRole,
        phone: user.phone || '',
        age: user.age || null,
        education: user.education || 'Graduate',
        state: user.state || 'All India',
        category: user.category || 'General',
        languagePreference: user.languagePreference || 'en'
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
};

/**
 * @desc   Logout User
 * @route  POST /api/auth/logout
 * @access Public
 */
exports.logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  });
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

/**
 * @desc   Get Current User Session
 * @route  GET /api/auth/me
 * @access Private
 */
exports.getMe = async (req, res) => {
  try {
    const { id, role } = req.user;
    let user = await User.findById(id).select('-password');

    if (!user && role === 'admin') {
      user = await Admin.findById(id).select('-password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User session not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user session.'
    });
  }
};

/**
 * @desc   Update Profile
 * @route  PUT /api/auth/profile
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { name, phone, age, education, state, category, languagePreference } = req.body;

    let user = await User.findById(id);

    if (!user) {
      user = await Admin.findById(id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (age !== undefined && age !== null) user.age = Number(age);
    if (education) user.education = education;
    if (state) user.state = state.trim();
    if (category) user.category = category;
    if (languagePreference) user.languagePreference = languagePreference;

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: userObj
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile.'
    });
  }
};

`

---

### File 23 of 49
**File Name:** opportunityController.js  
**File Path:** /controllers/opportunityController.js  
**Purpose:** Opportunity listing, detail view, filtering, and admin CRUD controller  

`javascript
const Opportunity = require('../models/Opportunity');

/**
 * @desc   Get all opportunities with search and filtering
 * @route  GET /api/opportunities
 * @access Public
 */
exports.getOpportunities = async (req, res) => {
  try {
    const { search, type, education, state, category, age, status, latest, limit } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.hi': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } }
      ];
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (latest === 'true') {
      query.showInLatestUpdates = true;
    }

    if (education && education !== 'Any') {
      query.$or = [
        { 'eligibility.education': { $in: [education, 'Any', 'All'] } },
        { 'eligibility.education': { $size: 0 } }
      ];
    }

    if (state && state !== 'All India') {
      query.$or = [
        { 'eligibility.state': { $in: [state, 'All India', 'All'] } },
        { 'eligibility.state': { $size: 0 } }
      ];
    }

    if (category && category !== 'All') {
      query.$or = [
        { 'eligibility.category': { $in: [category, 'All', 'General'] } },
        { 'eligibility.category': { $size: 0 } }
      ];
    }

    if (age) {
      const userAge = Number(age);
      if (!isNaN(userAge)) {
        query['eligibility.minAge'] = { $lte: userAge };
        query['eligibility.maxAge'] = { $gte: userAge };
      }
    }

    let resultQuery = Opportunity.find(query).sort({ lastDate: 1, createdAt: -1 });

    if (limit) {
      resultQuery = resultQuery.limit(Number(limit));
    }

    const opportunities = await resultQuery;

    return res.status(200).json({
      success: true,
      count: opportunities.length,
      opportunities
    });
  } catch (error) {
    console.error('Get Opportunities Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching opportunities.'
    });
  }
};

/**
 * @desc   Get single opportunity by ID
 * @route  GET /api/opportunities/:id
 * @access Public
 */
exports.getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found.'
      });
    }

    return res.status(200).json({
      success: true,
      opportunity
    });
  } catch (error) {
    console.error('Get Opportunity Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching opportunity details.'
    });
  }
};

/**
 * @desc   Get Latest Updates Ticker items
 * @route  GET /api/opportunities/ticker
 * @access Public
 */
exports.getLatestUpdatesTicker = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ showInLatestUpdates: true, status: { $ne: 'CLOSED' } })
      .select('title type lastDate applyUrl status')
      .limit(10);

    return res.status(200).json({
      success: true,
      count: opportunities.length,
      items: opportunities
    });
  } catch (error) {
    console.error('Ticker Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching latest ticker items.'
    });
  }
};

/**
 * @desc   Evaluate Eligibility for Student Criteria
 * @route  POST /api/opportunities/check-eligibility
 * @access Public
 */
exports.checkEligibility = async (req, res) => {
  try {
    const { age, education, state, category } = req.body;
    const userAge = Number(age);

    const allOps = await Opportunity.find({ status: { $ne: 'CLOSED' } });

    const evaluated = allOps.map(op => {
      const criteria = {
        age: false,
        education: false,
        state: false,
        category: false
      };

      const reasons = [];

      // 1. Age Check
      if (!isNaN(userAge) && userAge > 0) {
        const min = op.eligibility.minAge || 0;
        const max = op.eligibility.maxAge || 100;
        if (userAge >= min && userAge <= max) {
          criteria.age = true;
        } else {
          reasons.push(`Required Age: ${min}–${max} (Your Age: ${userAge})`);
        }
      } else {
        criteria.age = true;
      }

      // 2. Education Check
      const edList = op.eligibility.education || [];
      if (edList.length === 0 || edList.includes('Any') || edList.includes('All') || edList.includes(education)) {
        criteria.education = true;
      } else {
        reasons.push(`Required Education: ${edList.join(', ')}`);
      }

      // 3. State Check
      const stList = op.eligibility.state || [];
      if (stList.length === 0 || stList.includes('All India') || stList.includes('All') || stList.includes(state)) {
        criteria.state = true;
      } else {
        reasons.push(`Required State: ${stList.join(', ')}`);
      }

      // 4. Category Check
      const catList = op.eligibility.category || [];
      if (catList.length === 0 || catList.includes('All') || catList.includes('General') || catList.includes(category)) {
        criteria.category = true;
      } else {
        reasons.push(`Required Category: ${catList.join(', ')}`);
      }

      const matchCount = Object.values(criteria).filter(Boolean).length;
      let status = 'NOT_ELIGIBLE';
      if (matchCount === 4) status = 'ELIGIBLE';
      else if (matchCount >= 2) status = 'LIKELY_ELIGIBLE';

      return {
        opportunity: op,
        status,
        matchCount,
        totalCriteria: 4,
        criteria,
        reasons
      };
    });

    // Sort by highest match score
    evaluated.sort((a, b) => b.matchCount - a.matchCount);

    return res.status(200).json({
      success: true,
      count: evaluated.length,
      results: evaluated
    });
  } catch (error) {
    console.error('Check Eligibility Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error evaluating eligibility.'
    });
  }
};

/**
 * Admin: Create Opportunity
 */
exports.createOpportunity = async (req, res) => {
  try {
    if (req.body.title && typeof req.body.title === 'string') {
      const cleanTitle = req.body.title.trim();
      req.body.title = { en: cleanTitle, hi: cleanTitle };
    }
    const opportunity = await Opportunity.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Opportunity created successfully!',
      opportunity
    });
  } catch (error) {
    console.error('Create Opportunity Error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error creating opportunity.'
    });
  }
};

/**
 * Admin: Update Opportunity
 */
exports.updateOpportunity = async (req, res) => {
  try {
    if (req.body.title && typeof req.body.title === 'string') {
      const cleanTitle = req.body.title.trim();
      req.body.title = { en: cleanTitle, hi: cleanTitle };
    }
    const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Opportunity updated successfully!',
      opportunity
    });
  } catch (error) {
    console.error('Update Opportunity Error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Delete Opportunity
 */
exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }
    return res.status(200).json({ success: true, message: 'Opportunity deleted successfully.' });
  } catch (error) {
    console.error('Delete Opportunity Error:', error);
    return res.status(500).json({ success: false, message: 'Error deleting opportunity.' });
  }
};

`

---

### File 24 of 49
**File Name:** schemeController.js  
**File Path:** /controllers/schemeController.js  
**Purpose:** Government scheme query, sector filter, and admin CRUD controller  

`javascript
const Scheme = require('../models/Scheme');

/**
 * @desc   Get all government schemes with filtering & search
 * @route  GET /api/schemes
 * @access Public
 */
exports.getSchemes = async (req, res) => {
  try {
    const { search, sector, governmentType, stateName, category, status, limit } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.hi': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } }
      ];
    }

    if (sector && sector !== 'All') {
      query.sector = sector;
    }

    if (governmentType && governmentType !== 'All') {
      query.governmentType = governmentType;
    }

    if (stateName && stateName !== 'All India') {
      query.$or = [
        { stateName: stateName },
        { stateName: 'All India' }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.$or = [
        { 'eligibility.category': { $in: [category, 'All', 'General'] } },
        { 'eligibility.category': { $size: 0 } }
      ];
    }

    let resultQuery = Scheme.find(query).sort({ createdAt: -1 });

    if (limit) {
      resultQuery = resultQuery.limit(Number(limit));
    }

    const schemes = await resultQuery;

    return res.status(200).json({
      success: true,
      count: schemes.length,
      schemes
    });
  } catch (error) {
    console.error('Get Schemes Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching government schemes.'
    });
  }
};

/**
 * @desc   Get single scheme by ID
 * @route  GET /api/schemes/:id
 * @access Public
 */
exports.getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Government scheme not found.'
      });
    }

    return res.status(200).json({
      success: true,
      scheme
    });
  } catch (error) {
    console.error('Get Scheme Details Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching scheme details.'
    });
  }
};

/**
 * Admin: Create Scheme
 */
exports.createScheme = async (req, res) => {
  try {
    const scheme = await Scheme.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Government scheme created successfully!',
      scheme
    });
  } catch (error) {
    console.error('Create Scheme Error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error creating scheme.'
    });
  }
};

/**
 * Admin: Update Scheme
 */
exports.updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Government scheme updated successfully!',
      scheme
    });
  } catch (error) {
    console.error('Update Scheme Error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Delete Scheme
 */
exports.deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }
    return res.status(200).json({ success: true, message: 'Government scheme deleted successfully.' });
  } catch (error) {
    console.error('Delete Scheme Error:', error);
    return res.status(500).json({ success: false, message: 'Error deleting scheme.' });
  }
};

`

---

### File 25 of 49
**File Name:** submissionController.js  
**File Path:** /controllers/submissionController.js  
**Purpose:** Student submission handling, file upload, admin approval, and proof streaming  

`javascript
const path = require('path');
const fs = require('fs');
const Submission = require('../models/Submission');
const Opportunity = require('../models/Opportunity');
const Scheme = require('../models/Scheme');
const Notification = require('../models/Notification');

/**
 * @desc    Submit a new student opportunity or government scheme with proof upload
 * @route   POST /api/submissions
 * @access  Private (Student / User)
 */
exports.createSubmission = async (req, res, next) => {
  try {
    const {
      title,
      categoryType,
      type,
      organization,
      description,
      sourceUrl,
      benefits,
      lastDate,
      applyUrl,
      minAge,
      maxAge,
      education,
      state,
      category,
      eligibilityDetails
    } = req.body;

    if (!title || !sourceUrl || !lastDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Title, Source URL, and Last Application Date.'
      });
    }

    // Extract uploaded verification proof and public banner files
    let proofFile = null;
    let bannerFile = null;

    if (req.files) {
      if (req.files.proof && req.files.proof[0]) proofFile = req.files.proof[0];
      else if (req.files.verificationImage && req.files.verificationImage[0]) proofFile = req.files.verificationImage[0];

      if (req.files.banner && req.files.banner[0]) bannerFile = req.files.banner[0];
      else if (req.files.publicBannerImage && req.files.publicBannerImage[0]) bannerFile = req.files.publicBannerImage[0];
    } else if (req.file) {
      proofFile = req.file;
    }

    if (!proofFile) {
      return res.status(400).json({
        success: false,
        message: 'Mandatory verification / proof document file is required.'
      });
    }

    // Private verification proof is served exclusively via protected API endpoint
    const proofUrl = `/api/submissions/proof/${proofFile.filename}`;
    const verificationImage = proofUrl;
    // Public banner is saved in static banners folder
    const publicBannerImage = bannerFile ? `/uploads/banners/${bannerFile.filename}` : '';

    // Parse array eligibility fields if passed as strings/JSON
    const parsedEducation = typeof education === 'string' ? JSON.parse(education || '[]') : (education || []);
    const parsedState = typeof state === 'string' ? JSON.parse(state || '[]') : (state || ['All India']);
    const parsedCategory = typeof category === 'string' ? JSON.parse(category || '[]') : (category || ['All']);

    // Normalize categoryType canonical value
    let normalizedCategoryType = 'Opportunity';
    if (categoryType === 'Government Scheme' || categoryType === 'government_scheme') {
      normalizedCategoryType = 'Government Scheme';
    } else {
      normalizedCategoryType = 'Opportunity';
    }

    const submission = await Submission.create({
      title,
      categoryType: normalizedCategoryType,
      type: type || 'Scholarship',
      organization: organization || '',
      description: description || '',
      sourceUrl,
      proofUrl,
      verificationImage,
      publicBannerImage,
      proofOriginalName: proofFile.originalname,
      eligibility: {
        minAge: Number(minAge) || 0,
        maxAge: Number(maxAge) || 100,
        education: parsedEducation,
        state: parsedState,
        category: parsedCategory,
        details: eligibilityDetails || ''
      },
      benefits: benefits || '',
      lastDate: new Date(lastDate),
      applyUrl: applyUrl || sourceUrl,
      submittedBy: req.user.id,
      status: 'Pending Review'
    });

    // Create student notification upon successful submission
    if (req.user && req.user.id) {
      try {
        const notifTitle = `Submission Received: ${title}`;
        const notifMsg = `Your opportunity submission "${title}" has been received and is pending admin verification.`;
        await Notification.create({
          userId: req.user.id,
          title: { en: notifTitle, hi: notifTitle },
          message: { en: notifMsg, hi: notifMsg },
          targetUrl: 'my-submissions.html'
        });
      } catch (notifErr) {
        console.warn('Could not create submission notification:', notifErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Opportunity submitted successfully! Our verification team will review your proof and public banner.',
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get submissions submitted by current logged-in student
 * @route   GET /api/submissions/my
 * @access  Private (Student / User)
 */
exports.getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ submittedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all submissions for Admin Review Console with status & search filters
 * @route   GET /api/submissions/admin
 * @access  Private (Admin Only)
 */
exports.getAllSubmissionsAdmin = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }

    const submissions = await Submission.find(query)
      .populate('submittedBy', 'name email role phone')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single submission by ID
 * @route   GET /api/submissions/:id
 * @access  Private
 */
exports.getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('submittedBy', 'name email role phone')
      .populate('reviewedBy', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.'
      });
    }

    // Check ownership or admin status
    if (req.user.role !== 'admin' && submission.submittedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update submission review status (Approve / Reject / Request Changes)
 * @route   PUT /api/submissions/admin/:id/status
 * @access  Private (Admin Only)
 */
exports.updateSubmissionStatusAdmin = async (req, res, next) => {
  try {
    const { status, adminFeedback } = req.body;

    const allowedStatuses = ['Pending Review', 'Under Review', 'Changes Requested', 'Approved', 'Rejected'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: [${allowedStatuses.join(', ')}]`
      });
    }

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.'
      });
    }

    submission.status = status;
    submission.adminFeedback = adminFeedback !== undefined ? adminFeedback : submission.adminFeedback;
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();

    // IF APPROVED: Automatically convert submission to official MongoDB Opportunity or Scheme record!
    if (status === 'Approved' && !submission.createdOpportunityId && !submission.createdSchemeId) {
      if (submission.categoryType === 'Government Scheme' || submission.type === 'Government Scheme') {
        // Create official Scheme
        const newScheme = await Scheme.create({
          title: { en: submission.title, hi: submission.title },
          sector: 'Social Welfare',
          governmentType: 'Central',
          stateName: submission.eligibility.state[0] || 'All India',
          description: { en: submission.description, hi: submission.description },
          eligibility: {
            minAge: submission.eligibility.minAge,
            maxAge: submission.eligibility.maxAge,
            education: submission.eligibility.education,
            category: submission.eligibility.category,
            details: { en: submission.eligibility.details, hi: submission.eligibility.details }
          },
          benefits: { en: submission.benefits, hi: submission.benefits },
          lastDate: submission.lastDate,
          status: 'OPEN',
          applyUrl: submission.applyUrl || submission.sourceUrl,
          showInLatestUpdates: true
        });
        submission.createdSchemeId = newScheme._id;
      } else {
        // Create official Opportunity with public banner image (private verification proof is NOT copied)
        const newOpp = await Opportunity.create({
          title: { en: submission.title, hi: submission.title },
          type: submission.type,
          description: { en: submission.description, hi: submission.description },
          eligibility: {
            minAge: submission.eligibility.minAge,
            maxAge: submission.eligibility.maxAge,
            education: submission.eligibility.education,
            state: submission.eligibility.state,
            category: submission.eligibility.category,
            details: { en: submission.eligibility.details, hi: submission.eligibility.details }
          },
          benefits: { en: submission.benefits, hi: submission.benefits },
          lastDate: submission.lastDate,
          status: 'OPEN',
          applyUrl: submission.applyUrl || submission.sourceUrl,
          publicBannerImage: submission.publicBannerImage || '',
          showInLatestUpdates: true
        });
        submission.createdOpportunityId = newOpp._id;
      }
    }

    await submission.save();

    // Create student notification
    if (submission.submittedBy) {
      try {
        const notifTitle = `Submission Status Update: ${submission.title}`;
        const notifMsg = `Your submitted opportunity "${submission.title}" has been updated to "${status}". ${adminFeedback ? 'Admin note: ' + adminFeedback : ''}`;
        await Notification.create({
          userId: submission.submittedBy,
          title: { en: notifTitle, hi: notifTitle },
          message: { en: notifMsg, hi: notifMsg },
          targetUrl: 'my-submissions.html'
        });
      } catch (notifErr) {
        console.warn('Could not create student notification:', notifErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Submission status updated to ${status}.`,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Stream private verification proof document securely (Admin Only)
 * @route   GET /api/submissions/proof/:filename
 * @access  Private (Admin Only)
 */
exports.getProofFile = async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename);
    const privateDir = process.env.PRIVATE_PROOF_DIR || path.join(__dirname, '..', 'private_uploads', 'proofs');
    const legacyDir = path.join(__dirname, '..', 'public', 'uploads', 'proofs');

    const primaryPath = path.join(privateDir, filename);
    const fallbackPath = path.join(legacyDir, filename);

    if (fs.existsSync(primaryPath)) {
      return res.sendFile(primaryPath);
    } else if (fs.existsSync(fallbackPath)) {
      return res.sendFile(fallbackPath);
    } else {
      return res.status(404).json({
        success: false,
        message: 'Verification proof document not found.'
      });
    }
  } catch (error) {
    next(error);
  }
};

`

---

### File 26 of 49
**File Name:** savedItemController.js  
**File Path:** /controllers/savedItemController.js  
**Purpose:** Bookmarking, deadline reminders, and saved list controller  

`javascript
const SavedItem = require('../models/SavedItem');
const Opportunity = require('../models/Opportunity');
const Scheme = require('../models/Scheme');

/**
 * Calculate reminderDate based on lastDate and preference
 */
function calculateReminderDate(lastDate, preference) {
  if (!lastDate || preference === 'none') return null;

  const deadline = new Date(lastDate);
  const reminder = new Date(deadline);

  if (preference === '7_days') reminder.setDate(deadline.getDate() - 7);
  else if (preference === '3_days') reminder.setDate(deadline.getDate() - 3);
  else if (preference === '1_day') reminder.setDate(deadline.getDate() - 1);
  else if (preference === 'deadline_day') reminder.setDate(deadline.getDate());

  return reminder;
}

/**
 * @desc   Save an Opportunity or Scheme with reminder preferences
 * @route  POST /api/saved
 * @access Private
 */
exports.saveItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemType, itemId, reminderPreference } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item type (Opportunity or Scheme) and item ID are required.'
      });
    }

    let lastDate = null;
    let opportunityId = null;
    let schemeId = null;

    if (itemType === 'Opportunity') {
      const opp = await Opportunity.findById(itemId);
      if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found.' });
      lastDate = opp.lastDate;
      opportunityId = itemId;
    } else if (itemType === 'Scheme') {
      const sch = await Scheme.findById(itemId);
      if (!sch) return res.status(404).json({ success: false, message: 'Scheme not found.' });
      lastDate = sch.lastDate;
      schemeId = itemId;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid itemType.' });
    }

    const pref = reminderPreference || '3_days';
    const reminderDate = calculateReminderDate(lastDate, pref);
    const reminderStatus = (pref === 'none') ? 'disabled' : 'pending';

    // Find existing saved record to update or create new
    let savedItem = null;
    if (opportunityId) {
      savedItem = await SavedItem.findOne({ userId, opportunityId });
    } else if (schemeId) {
      savedItem = await SavedItem.findOne({ userId, schemeId });
    }

    if (savedItem) {
      savedItem.reminderPreference = pref;
      savedItem.reminderDate = reminderDate;
      savedItem.reminderStatus = reminderStatus;
      await savedItem.save();
    } else {
      savedItem = await SavedItem.create({
        userId,
        itemType,
        opportunityId,
        schemeId,
        reminderPreference: pref,
        reminderDate,
        reminderStatus
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item saved successfully with reminder preference!',
      savedItem
    });
  } catch (error) {
    console.error('Save Item Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving opportunity.'
    });
  }
};

/**
 * @desc   Get all saved items for user
 * @route  GET /api/saved
 * @access Private
 */
exports.getUserSavedItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const savedItems = await SavedItem.find({ userId })
      .populate('opportunityId')
      .populate('schemeId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: savedItems.length,
      savedItems
    });
  } catch (error) {
    console.error('Get Saved Items Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching saved items.'
    });
  }
};

/**
 * @desc   Update reminder preference
 * @route  PUT /api/saved/:id/reminder
 * @access Private
 */
exports.updateReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reminderPreference } = req.body;

    const savedItem = await SavedItem.findOne({ _id: req.params.id, userId })
      .populate('opportunityId')
      .populate('schemeId');

    if (!savedItem) {
      return res.status(404).json({ success: false, message: 'Saved item not found.' });
    }

    const item = savedItem.opportunityId || savedItem.schemeId;
    const lastDate = item ? item.lastDate : null;

    savedItem.reminderPreference = reminderPreference;
    savedItem.reminderDate = calculateReminderDate(lastDate, reminderPreference);
    savedItem.reminderStatus = (reminderPreference === 'none') ? 'disabled' : 'pending';

    await savedItem.save();

    return res.status(200).json({
      success: true,
      message: 'Reminder preference updated successfully!',
      savedItem
    });
  } catch (error) {
    console.error('Update Reminder Error:', error);
    return res.status(500).json({ success: false, message: 'Error updating reminder.' });
  }
};

/**
 * @desc   Remove saved item
 * @route  DELETE /api/saved/:id
 * @access Private
 */
exports.removeSavedItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const savedItem = await SavedItem.findOneAndDelete({ _id: req.params.id, userId });

    if (!savedItem) {
      return res.status(404).json({ success: false, message: 'Saved item not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Item removed from saved list.'
    });
  } catch (error) {
    console.error('Remove Saved Item Error:', error);
    return res.status(500).json({ success: false, message: 'Error removing saved item.' });
  }
};

`

---

### File 27 of 49
**File Name:** notificationController.js  
**File Path:** /controllers/notificationController.js  
**Purpose:** User notifications and mark-as-read controller  

`javascript
const Notification = require('../models/Notification');

/**
 * Get User Notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching notifications.' });
  }
};

/**
 * Mark Notifications as Read
 */
exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    console.error('Mark Read Error:', error);
    return res.status(500).json({ success: false, message: 'Error updating notifications.' });
  }
};

`

---

### File 28 of 49
**File Name:** adminController.js  
**File Path:** /controllers/adminController.js  
**Purpose:** Admin dashboard analytics, system stats, and student directory controller  

`javascript
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Scheme = require('../models/Scheme');
const Submission = require('../models/Submission');

/**
 * @desc   Get DishaSetu Admin Dashboard Statistics
 * @route  GET /api/admin/dashboard-stats
 * @access Private (Admin)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalOpportunities,
      totalSchemes,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      activeOpportunities,
      activeSchemes
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['student', 'user'] } }),
      Opportunity.countDocuments(),
      Scheme.countDocuments(),
      Submission.countDocuments({ status: 'Pending Review' }),
      Submission.countDocuments({ status: 'Approved' }),
      Submission.countDocuments({ status: 'Rejected' }),
      Opportunity.countDocuments({ status: { $in: ['OPEN', 'CLOSING SOON'] } }),
      Scheme.countDocuments({ status: { $in: ['OPEN', 'CLOSING SOON'] } })
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalOpportunities,
        totalSchemes,
        pendingSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        activeOpportunities,
        activeSchemes,
        totalActive: activeOpportunities + activeSchemes
      }
    });
  } catch (error) {
    console.error('Admin Dashboard Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching admin dashboard stats.'
    });
  }
};

/**
 * @desc   Get all registered students (with search & education/state filters, passwords hidden)
 * @route  GET /api/admin/students
 * @access Private (Admin)
 */
exports.getRegisteredStudents = async (req, res) => {
  try {
    const { search, education, state, category } = req.query;
    let query = { role: { $in: ['student', 'user'] } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (education && education !== 'All') {
      query.education = education;
    }

    if (state && state !== 'All') {
      query.state = state;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    // Exclude password hash from query results for security
    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Populate submission counts for each student
    const studentsWithMeta = await Promise.all(
      students.map(async (student) => {
        const totalSubmissions = await Submission.countDocuments({ submittedBy: student._id });
        const approvedSubmissions = await Submission.countDocuments({ submittedBy: student._id, status: 'Approved' });
        return {
          ...student.toObject(),
          totalSubmissions,
          approvedSubmissions
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: studentsWithMeta.length,
      students: studentsWithMeta
    });
  } catch (error) {
    console.error('Admin Get Students Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving registered students.'
    });
  }
};

/**
 * @desc   Delete student account
 * @route  DELETE /api/admin/students/:id
 * @access Private (Admin)
 */
exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Student "${student.name}" account was removed successfully.`
    });
  } catch (error) {
    console.error('Admin Delete Student Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting student.'
    });
  }
};

`

---

### File 29 of 49
**File Name:** theme-nav.js  
**File Path:** /public/js/theme-nav.js  
**Purpose:** Global dynamic navigation bar, authentication state, and theme management  

`javascript
/**
 * DishaSetu — Shared Theme, Language Switcher & Navbar Module
 */

function getCurrentLanguage() {
  const saved = localStorage.getItem('dishasetu_lang');
  if (saved) return saved;

  // Browser language detection on first visit
  const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (navLang.includes('hi')) {
    return 'hi';
  }
  return 'en';
}

function setLanguage(lang) {
  localStorage.setItem('dishasetu_lang', lang);
  document.documentElement.lang = lang;
  if (lang === 'hi') {
    document.body.classList.add('lang-hi');
  } else {
    document.body.classList.remove('lang-hi');
  }

  // Update Language Switcher UI buttons
  const btnEn = document.getElementById('lang-btn-en');
  const btnHi = document.getElementById('lang-btn-hi');
  if (btnEn && btnHi) {
    if (lang === 'hi') {
      btnHi.classList.add('active');
      btnEn.classList.remove('active');
    } else {
      btnEn.classList.add('active');
      btnHi.classList.remove('active');
    }
  }

  // Translate static DOM elements with data-i18n attribute
  translateDOM(lang);
}

function translateDOM(lang) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && typeof t === 'function') {
      const translated = t(key, lang);
      if (el.tagName === 'INPUT' && el.type === 'submit') {
        el.value = translated;
      } else {
        el.innerText = translated;
      }
    }
  });
}

/**
 * Render Navbar with Official Brand Logo Image, Navigation Links, Notification Bell & Lang Switcher
 */
function renderNavbar() {
  const container = document.getElementById('navbar-placeholder');
  if (!container) return;

  const lang = getCurrentLanguage();
  const storedUserStr = localStorage.getItem('dishasetu_user');
  const user = storedUserStr ? JSON.parse(storedUserStr) : null;

  container.innerHTML = `
    <nav class="navbar">
      <div class="container navbar-inner">
        <!-- Logo with Official Logo Image -->
        <a href="index.html" class="brand-logo">
          <img src="assets/logo.png" alt="DishaSetu Logo" class="brand-logo-img" style="height: 44px; width: auto; object-fit: contain; filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.4));">
        </a>

        <!-- Mobile Menu Toggle Button -->
        <button class="mobile-nav-toggle" onclick="toggleMobileMenu()" aria-label="Toggle Navigation Menu">
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
        </button>

        <!-- Links -->
        <ul class="nav-links" id="main-nav-links">
          <li><a href="index.html" data-i18n="navHome">Home</a></li>
          <li><a href="opportunities.html" data-i18n="navOpportunities">Opportunities</a></li>
          <li><a href="schemes.html" data-i18n="navSchemes">Government Schemes</a></li>
          <li><a href="index.html#how-it-works" data-i18n="navHowItWorks">How It Works</a></li>
          ${user && user.role !== 'admin' ? `
            <li><a href="submit-opportunity.html" style="color: var(--primary-cyan); font-weight: 600;">+ Submit Opportunity</a></li>
            <li><a href="my-submissions.html">My Submissions</a></li>
            <li><a href="saved-opportunities.html" data-i18n="navSaved">Saved Items</a></li>
          ` : ''}
          ${user && user.role === 'admin' ? `
            <li><a href="admin-submissions.html" style="color: #4ade80; font-weight: 600;">Review Submissions</a></li>
            <li><a href="admin-students.html">Students Directory</a></li>
          ` : ''}
          ${user ? `<li><a href="${user.role === 'admin' ? 'admin-dashboard.html' : 'dashboard.html'}" data-i18n="navDashboard">Dashboard</a></li>` : ''}
        </ul>

        <!-- Right Controls -->
        <div class="nav-actions">
          <!-- Language Switcher -->
          <div class="lang-switcher" onclick="toggleLanguage()">
            <button id="lang-btn-en" class="lang-btn ${lang === 'en' ? 'active' : ''}">EN</button>
            <button id="lang-btn-hi" class="lang-btn ${lang === 'hi' ? 'active' : ''}">हिंदी</button>
          </div>

          <!-- Notification Bell -->
          ${user ? `
            <button class="notification-bell-btn" onclick="toggleNotificationDrawer()" aria-label="Notifications">
              🔔
              <span class="notification-badge" id="nav-unread-count" style="display:none;">0</span>
            </button>
          ` : ''}

          <!-- Auth Actions -->
          ${user ? `
            <span style="font-size: 0.88rem; color: var(--text-muted);">Hi, <strong>${user.name.split(' ')[0]}</strong></span>
            <button class="btn btn-outline" style="padding: 0.4rem 0.9rem; font-size: 0.85rem;" onclick="handleLogout()">Logout</button>
          ` : `
            <a href="login.html" class="btn btn-outline" style="padding: 0.4rem 0.9rem; font-size: 0.85rem;" data-i18n="navLogin">Login</a>
            <a href="register.html" class="btn btn-primary" style="padding: 0.4rem 0.9rem; font-size: 0.85rem;" data-i18n="navRegister">Register</a>
          `}
        </div>
      </div>
    </nav>
  `;

  // Initialize lang state
  setLanguage(lang);
}

function toggleMobileMenu() {
  const links = document.getElementById('main-nav-links');
  const toggle = document.querySelector('.mobile-nav-toggle');
  if (links) {
    links.classList.toggle('mobile-open');
  }
  if (toggle) {
    toggle.classList.toggle('is-active');
  }
}

function toggleLanguage() {
  const current = getCurrentLanguage();
  const next = current === 'en' ? 'hi' : 'en';
  setLanguage(next);
}

/**
 * Load Dynamic Sarkari Result Style Continuous Right -> Left Ticker
 */
async function loadTicker() {
  const placeholder = document.getElementById('ticker-placeholder');
  if (!placeholder) return;

  try {
    const res = await fetch('/api/opportunities/ticker');
    const data = await res.json();
    
    let rawItems = (data.success && data.items && data.items.length > 0) ? data.items : [];

    // Fallback sample items if database has fewer entries, guaranteeing full density
    const defaultSampleItems = [
      { _id: '', title: { en: 'PM Higher Education Scholarship 2026', hi: 'प्रधानमंत्री उच्च शिक्षा छात्रवृत्ति 2026' }, type: 'Scholarship' },
      { _id: '', title: { en: 'National Innovation Quiz Competition 2026', hi: 'राष्ट्रीय नवाचार प्रश्नोत्तरी 2026' }, type: 'Quiz' },
      { _id: '', title: { en: 'Smart India Hackathon 2026', hi: 'स्मार्ट इंडिया हैकाथॉन 2026' }, type: 'Hackathon' },
      { _id: '', title: { en: 'UP Free Smartphone & Tablet Scheme 2026', hi: 'यूपी स्मार्टफोन वितरण योजना 2026' }, type: 'Govt Scheme' },
      { _id: '', title: { en: 'PM Skill Development Program (PMKVY 4.0)', hi: 'पीएम कौशल विकास योजना' }, type: 'Skill Program' },
      { _id: '', title: { en: 'National Student Internship Scheme 2026', hi: 'राष्ट्रीय छात्र इंटर्नशिप योजना' }, type: 'Internship' },
      { _id: '', title: { en: 'AICTE Swanath Scholarship for Girls', hi: 'एआईसीटीई स्वनाथ छात्रवृत्ति' }, type: 'Scholarship' },
      { _id: '', title: { en: 'National AI & Coding Challenge 2026', hi: 'राष्ट्रीय एआई एवं कोडिंग चुनौती' }, type: 'Coding' }
    ];

    const displayItems = rawItems.length >= 4 ? rawItems : [...rawItems, ...defaultSampleItems];
    const lang = getCurrentLanguage();

    const tagColorClasses = ['tag-blue', 'tag-teal', 'tag-green', 'tag-purple', 'tag-orange', 'tag-red', 'tag-gold'];

    const renderItemsHtml = (itemsList) => {
      return itemsList.map((item, idx) => {
        const title = typeof item.title === 'object' ? getLocalized(item.title, lang) : item.title;
        const colorClass = tagColorClasses[idx % tagColorClasses.length];
        const linkUrl = item._id ? `opportunity-details.html?id=${item._id}` : `opportunities.html`;

        return `
          <a href="${linkUrl}" class="ticker-card ${colorClass}">
            <span class="ticker-tag-badge">${item.type || 'Opportunity'}</span>
            <span class="ticker-tag-title">${title}</span>
            <span class="ticker-tag-arrow">→</span>
          </a>
        `;
      }).join('');
    };

    const singleTrackHtml = renderItemsHtml(displayItems);

    placeholder.innerHTML = `
      <div class="ticker-container">
        <!-- Fixed Header Badge -->
        <div class="ticker-fixed-label">
          <span class="pulse-dot"></span>
          <span>LATEST OPPORTUNITIES</span>
        </div>

        <!-- Continuous Right -> Left Scroller Track -->
        <div class="ticker-track-wrapper">
          <div class="ticker-track">
            <div class="ticker-track-group">
              ${singleTrackHtml}
            </div>
            <!-- Duplicated Track for Seamless 100% Loop -->
            <div class="ticker-track-group" aria-hidden="true">
              ${singleTrackHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    translateDOM(lang);
  } catch (err) {
    console.error('Ticker Load Error:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  loadTicker();
});

`

---

### File 30 of 49
**File Name:** translations.js  
**File Path:** /public/js/translations.js  
**Purpose:** Bilingual translation dictionary (English & Hindi) and i18n switcher  

`javascript
/**
 * DishaSetu — Bilingual English + Hindi Translation Dictionary
 */

const TRANSLATIONS = {
  en: {
    // Brand & Taglines
    brandName: "DishaSetu",
    brandTagline: "Right Opportunity → Right Person → Right Time",
    brandSecondary: "Your Digital Guide to Opportunities & Government Schemes",
    
    // Nav Links
    navHome: "Home",
    navOpportunities: "Opportunities",
    navSchemes: "Government Schemes",
    navFindForMe: "Find for Me",
    navHowItWorks: "How It Works",
    navAbout: "About",
    navSaved: "Saved Items",
    navDashboard: "Dashboard",
    navLogin: "Login",
    navRegister: "Register",
    navLogout: "Logout",

    // Hero Section
    heroLabel: "Your Digital Guide to Opportunities",
    heroHeading: "Find What's Meant for You.",
    heroSubtext: "Discover scholarships, government schemes, competitions, exams, hackathons and skill programs — all in one place.",
    btnFindOpportunities: "Find Opportunities",
    btnGovernmentSchemes: "Government Schemes",

    // Ticker
    latestBadge: "LATEST",

    // Quick Finder
    finderTitle: "Find Opportunities For You",
    labelAge: "Age",
    labelEducation: "Education",
    labelState: "State",
    labelCategory: "Category",
    btnSearchNow: "Find Opportunities",

    // Sections
    exploreCategories: "Explore Opportunities",
    exploreSchemesTitle: "Schemes for a Stronger Tomorrow",
    exploreSchemesSubtext: "Discover Central and State Government schemes designed to support education, employment, health, housing, skills and more.",
    dontMissDeadline: "Don't Miss the Deadline",
    howItWorksTitle: "Your Journey to a Better Future",

    // How It Works Steps
    step1Title: "Tell Us About You",
    step1Desc: "Provide your age, education, state, and category.",
    step2Title: "We Find Matches",
    step2Desc: "DishaSetu scans opportunities relevant to your profile.",
    step3Title: "Check Eligibility",
    step3Desc: "Instantly see itemized pass/fail criteria.",
    step4Title: "Apply & Grow",
    step4Desc: "Direct links to official application portals.",

    // Badges & Buttons
    badgeOpen: "OPEN",
    badgeClosingSoon: "CLOSING SOON",
    badgeUpcoming: "UPCOMING",
    badgeClosed: "CLOSED",
    badgeSchemeCentral: "Central Scheme",
    badgeSchemeState: "State Scheme",
    btnViewDetails: "View Details",
    btnSave: "Save",
    btnSaved: "Saved",
    btnApplyNow: "Apply Now",
    btnManageReminder: "Manage Reminder",

    // Disclaimer
    govtDisclaimer: "This platform is an information and discovery portal. It is not an official government website. Always verify eligibility, dates and application details on the official website before applying.",

    // Eligibility Result
    eligibleStatus: "You're Eligible!",
    likelyStatus: "You May Be Eligible",
    notEligibleStatus: "Not Eligible",
    matchedCount: "Criteria Matched",

    // Toast Messages
    savedSuccess: "Saved successfully with deadline reminder!",
    alreadySaved: "Already in your saved list.",
    removedSuccess: "Item removed from saved list."
  },
  hi: {
    // Brand & Taglines
    brandName: "दिशासेतु",
    brandTagline: "सही अवसर → सही व्यक्ति → सही समय",
    brandSecondary: "अवसरों और सरकारी योजनाओं के लिए आपका डिजिटल मार्गदर्शक",

    // Nav Links
    navHome: "होम",
    navOpportunities: "अवसर खोजें",
    navSchemes: "सरकारी योजनाएँ",
    navFindForMe: "मेरे लिए खोजें",
    navHowItWorks: "यह कैसे काम करता है",
    navAbout: "हमारे बारे में",
    navSaved: "सहेजे गए अवसर",
    navDashboard: "डैशबोर्ड",
    navLogin: "लॉगिन",
    navRegister: "पंजीकरण",
    navLogout: "लॉगआउट",

    // Hero Section
    heroLabel: "अवसरों के लिए आपका डिजिटल मार्गदर्शक",
    heroHeading: "खोजें जो आपके लिए बना है।",
    heroSubtext: "छात्रवृत्ति, सरकारी योजनाएं, प्रतियोगिताएं, परीक्षाएं, हैकाथॉन और कौशल कार्यक्रम — सब एक ही स्थान पर।",
    btnFindOpportunities: "अवसर खोजें",
    btnGovernmentSchemes: "सरकारी योजनाएँ",

    // Ticker
    latestBadge: "नवीनतम",

    // Quick Finder
    finderTitle: "अपने लिए अवसर खोजें",
    labelAge: "आयु",
    labelEducation: "योग्यता",
    labelState: "राज्य",
    labelCategory: "वर्ग",
    btnSearchNow: "अवसर खोजें",

    // Sections
    exploreCategories: "विभिन्न अवसर देखें",
    exploreSchemesTitle: "सशक्त भविष्य के लिए योजनाएं",
    exploreSchemesSubtext: "शिक्षा, रोजगार, स्वास्थ्य, आवास और कौशल विकास के लिए केंद्र एवं राज्य सरकार की योजनाएं खोजें।",
    dontMissDeadline: "अंतिम तिथि न चूकें",
    howItWorksTitle: "बेहतर भविष्य की ओर आपकी यात्रा",

    // How It Works Steps
    step1Title: "अपने बारे में बताएं",
    step1Desc: "अपनी आयु, योग्यता, राज्य और श्रेणी चुनें।",
    step2Title: "हम अवसर खोजते हैं",
    step2Desc: "दिशासेतु आपकी प्रोफ़ाइल से मेल खाते अवसर दिखाता है।",
    step3Title: "पात्रता जांचें",
    step3Desc: "तुरंत जानें कि आप किन मानदंडों को पूरा करते हैं।",
    step4Title: "आवेदन करें और बढ़ें",
    step4Desc: "आधिकारिक सरकारी एवं अवसर पोर्टलों पर सीधा आवेदन करें।",

    // Badges & Buttons
    badgeOpen: "खुला है",
    badgeClosingSoon: "जल्द समाप्त होने वाला",
    badgeUpcoming: "आगामी",
    badgeClosed: "समाप्त",
    badgeSchemeCentral: "केंद्रीय योजना",
    badgeSchemeState: "राज्य योजना",
    btnViewDetails: "विवरण देखें",
    btnSave: "सहेजें",
    btnSaved: "सहेजा गया",
    btnApplyNow: "अभी आवेदन करें",
    btnManageReminder: "रिमाइंडर प्रबंधित करें",

    // Disclaimer
    govtDisclaimer: "यह प्लेटफॉर्म एक सूचना और अवसर खोज पोर्टल है। यह एक आधिकारिक सरकारी वेबसाइट नहीं है। आवेदन करने से पहले हमेशा आधिकारिक वेबसाइट पर पात्रता, तिथियों और विवरणों की पुष्टि करें।",

    // Eligibility Result
    eligibleStatus: "आप पात्र हैं!",
    likelyStatus: "आप पात्र हो सकते हैं",
    notEligibleStatus: "अपात्र",
    matchedCount: "मापदंड मिले",

    // Toast Messages
    savedSuccess: "सफलतापूर्वक सहेजा गया और रिमाइंडर सेट किया गया!",
    alreadySaved: "आपकी सहेजी गई सूची में पहले से मौजूद है।",
    removedSuccess: "सूची से हटा दिया गया।"
  }
};

/**
 * Dynamic Content Localizer with Graceful English Fallback
 */
function getLocalized(obj, lang = 'en') {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj['en'] || '';
}

/**
 * Translate static UI key
 */
function t(key, lang = 'en') {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  return dict[key] || TRANSLATIONS['en'][key] || key;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TRANSLATIONS, getLocalized, t };
}

`

---

### File 31 of 49
**File Name:** main.js  
**File Path:** /public/js/main.js  
**Purpose:** Continuous 3D orbit carousel animation, timeline scroll, and interactive glue  

`javascript
/**
 * DishaSetu — Main Client Glue & Core Interactivity
 */

// Logout handler
async function handleLogout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    localStorage.removeItem('dishasetu_user');
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Logout error:', err);
  }
}

// Scroll animation for How It Works timeline path
function initTimelineScrollAnimation() {
  const line = document.getElementById('timeline-active-line');
  const steps = document.querySelectorAll('.step-card');
  if (!line || steps.length === 0) return;

  window.addEventListener('scroll', () => {
    const rect = document.getElementById('how-it-works')?.getBoundingClientRect();
    if (!rect) return;

    const windowHeight = window.innerHeight;
    if (rect.top < windowHeight && rect.bottom > 0) {
      const progress = Math.min(100, Math.max(0, ((windowHeight - rect.top) / rect.height) * 100));
      line.style.width = `${progress}%`;

      steps.forEach((step, index) => {
        if (progress >= (index + 1) * 20) {
          step.classList.add('active');
        }
      });
    }
  });
}

// Continuous 3D Elliptical Orbit Carousel Animation
function initOrbitCarousel() {
  const cards = document.querySelectorAll('.orbit-card');
  const stage = document.querySelector('.hero-visual-stage');
  if (!cards || cards.length === 0) return;

  let currentAngle = 0;
  const speed = 0.35; // smooth rotation speed (deg per frame)
  let isHovered = false;

  if (stage) {
    stage.addEventListener('mouseenter', () => { isHovered = true; });
    stage.addEventListener('mouseleave', () => { isHovered = false; });
    stage.addEventListener('touchstart', () => { isHovered = true; }, { passive: true });
    stage.addEventListener('touchend', () => { isHovered = false; }, { passive: true });
  }

  function step() {
    if (!isHovered) {
      currentAngle = (currentAngle + speed) % 360;
    }

    const total = cards.length;
    const w = window.innerWidth;
    const isSmallMobile = w <= 390;
    const isMobile = w <= 640;
    const isTablet = w <= 992;
    
    // Scaled Elliptical Radius for 3D Orbit Carousel
    const radiusX = isSmallMobile ? 95 : (isMobile ? 115 : (isTablet ? 155 : 210));
    const radiusZ = isSmallMobile ? 50 : (isMobile ? 65 : (isTablet ? 90 : 130));
    const radiusY = isSmallMobile ? 12 : (isMobile ? 16 : (isTablet ? 22 : 32)); // 3D tilt angle

    cards.forEach((card, index) => {
      const angleDeg = currentAngle + (index * (360 / total));
      const angleRad = (angleDeg * Math.PI) / 180;

      const x = Math.sin(angleRad) * radiusX;
      const z = Math.cos(angleRad) * radiusZ;
      const y = -Math.cos(angleRad) * radiusY;

      // Normalize Z (0 = farthest back, 1 = closest front)
      const normZ = (z + radiusZ) / (2 * radiusZ);

      // 3D Scale: 0.70 (back) -> 1.12 (front)
      const scale = 0.70 + (normZ * 0.42);

      // Opacity: 0.45 (back) -> 1.0 (front)
      const opacity = 0.45 + (normZ * 0.55);

      // Z-Index based on Z depth
      const zIndex = Math.round((normZ * 100) + 10);

      // Front card highlight
      if (normZ > 0.88) {
        card.classList.add('is-front');
      } else {
        card.classList.remove('is-front');
      }

      card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
    });

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', () => {
  initTimelineScrollAnimation();
  initOrbitCarousel();
});

`

---

### File 32 of 49
**File Name:** eligibility.js  
**File Path:** /public/js/eligibility.js  
**Purpose:** Client-side student profile evaluation and opportunity matching engine  

`javascript
/**
 * DishaSetu — Quick Eligibility Finder & Visual Result Engine
 */

async function handleEligibilityCheck(event) {
  if (event) event.preventDefault();

  const age = document.getElementById('finder-age')?.value;
  const education = document.getElementById('finder-education')?.value;
  const state = document.getElementById('finder-state')?.value;
  const category = document.getElementById('finder-category')?.value;

  try {
    const res = await fetch('/api/opportunities/check-eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age, education, state, category })
    });

    const data = await res.json();
    if (!data.success) {
      alert('Error evaluating eligibility: ' + data.message);
      return;
    }

    renderEligibilityModal(data.results, { age, education, state, category });
  } catch (err) {
    console.error('Check Eligibility Fetch Error:', err);
  }
}

function renderEligibilityModal(results, queryParams) {
  let modal = document.getElementById('eligibility-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'eligibility-modal';
    modal.className = 'glass-panel';
    modal.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 90%; max-width: 750px; max-height: 85vh; overflow-y: auto;
      z-index: 2000; padding: 2rem; border-radius: var(--radius-lg);
      box-shadow: 0 0 50px rgba(6, 182, 212, 0.4);
    `;
    document.body.appendChild(modal);
  }

  let backdrop = document.getElementById('modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'modal-backdrop';
    backdrop.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px);
      z-index: 1999;
    `;
    backdrop.onclick = closeEligibilityModal;
    document.body.appendChild(backdrop);
  }

  const lang = getCurrentLanguage();
  const eligibleItems = results.filter(r => r.status === 'ELIGIBLE' || r.status === 'LIKELY_ELIGIBLE');

  modal.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
      <div>
        <h2 style="color: #fff; font-size: 1.5rem; margin-bottom: 0.2rem;">
          🎯 ${t('finderTitle', lang)}
        </h2>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin: 0;">
          Profile: Age ${queryParams.age || 'Any'}, ${queryParams.education}, ${queryParams.state}, ${queryParams.category}
        </p>
      </div>
      <button onclick="closeEligibilityModal()" style="background:none; border:none; color:#fff; font-size: 1.8rem; cursor:pointer;">×</button>
    </div>

    ${eligibleItems.length === 0 ? `
      <div style="text-align: center; padding: 2rem 0;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
        <h3 style="color: #fff;">No matching opportunities found</h3>
        <p style="color: var(--text-muted);">Try adjusting your qualification or age filter to see more results.</p>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${eligibleItems.slice(0, 5).map(item => {
          const title = getLocalized(item.opportunity.title, lang);
          const isEligible = item.status === 'ELIGIBLE';
          
          return `
            <div class="glass-card" style="padding: 1.2rem; border-left: 4px solid ${isEligible ? '#22c55e' : '#f59e0b'};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.5rem;">
                <div>
                  <span class="card-badge ${isEligible ? 'badge-open' : 'badge-closing'}">
                    ${isEligible ? '✓ ' + t('eligibleStatus', lang) : '⚠ ' + t('likelyStatus', lang)}
                  </span>
                  <h4 style="color: #fff; margin-top: 0.4rem; font-size: 1.1rem;">${title}</h4>
                </div>
                <span style="font-weight: 800; color: var(--primary-cyan); font-size: 0.9rem;">
                  ${item.matchCount}/4 ${t('matchedCount', lang)}
                </span>
              </div>

              <!-- Criteria Breakdown -->
              <div style="display: flex; gap: 0.8rem; flex-wrap: wrap; margin: 0.8rem 0; font-size: 0.82rem;">
                <span style="color: ${item.criteria.age ? '#4ade80' : '#f87171'}">Age ${item.criteria.age ? '✓' : '✕'}</span>
                <span style="color: ${item.criteria.education ? '#4ade80' : '#f87171'}">Education ${item.criteria.education ? '✓' : '✕'}</span>
                <span style="color: ${item.criteria.state ? '#4ade80' : '#f87171'}">State ${item.criteria.state ? '✓' : '✕'}</span>
                <span style="color: ${item.criteria.category ? '#4ade80' : '#f87171'}">Category ${item.criteria.category ? '✓' : '✕'}</span>
              </div>

              ${item.reasons.length > 0 ? `
                <p style="font-size: 0.8rem; color: #f87171; margin-bottom: 0.8rem;">
                  Note: ${item.reasons.join(' | ')}
                </p>
              ` : ''}

              <div style="display: flex; gap: 0.8rem; justify-content: flex-end;">
                <a href="opportunity-details.html?id=${item.opportunity._id}" class="btn btn-outline" style="padding: 0.4rem 0.9rem; font-size: 0.82rem;">
                  ${t('btnViewDetails', lang)} →
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;

  modal.style.display = 'block';
  backdrop.style.display = 'block';
}

function closeEligibilityModal() {
  const modal = document.getElementById('eligibility-modal');
  const backdrop = document.getElementById('modal-backdrop');
  if (modal) modal.style.display = 'none';
  if (backdrop) backdrop.style.display = 'none';
}

`

---

### File 33 of 49
**File Name:** notifications.js  
**File Path:** /public/js/notifications.js  
**Purpose:** Real-time in-app notification dropdown and polling client  

`javascript
/**
 * DishaSetu — Notification Bell & Drawer Panel Manager
 */

async function fetchNotifications() {
  const badge = document.getElementById('nav-unread-count');
  if (!badge) return;

  try {
    const res = await fetch('/api/notifications', { credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      if (data.unreadCount > 0) {
        badge.innerText = data.unreadCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (err) {
    console.error('Fetch Notifications Error:', err);
  }
}

async function toggleNotificationDrawer() {
  let drawer = document.getElementById('notification-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'notification-drawer';
    drawer.className = 'glass-panel';
    drawer.style.cssText = `
      position: fixed; top: 70px; right: 20px; width: 360px; max-height: 480px;
      overflow-y: auto; z-index: 1500; padding: 1.2rem; border-radius: var(--radius-md);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); display: none;
    `;
    document.body.appendChild(drawer);
  }

  if (drawer.style.display === 'block') {
    drawer.style.display = 'none';
    return;
  }

  const lang = getCurrentLanguage();

  try {
    const res = await fetch('/api/notifications', { credentials: 'include' });
    const data = await res.json();

    if (!data.success || !data.notifications || data.notifications.length === 0) {
      drawer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h4 style="color:#fff; margin:0;">🔔 Notifications</h4>
          <button onclick="toggleNotificationDrawer()" style="background:none; border:none; color:#fff; cursor:pointer;">×</button>
        </div>
        <p style="color:var(--text-muted); font-size:0.88rem; text-align:center; padding:1rem 0;">No active notifications.</p>
      `;
    } else {
      const listHtml = data.notifications.map(n => {
        const title = getLocalized(n.title, lang);
        const msg = getLocalized(n.message, lang);
        return `
          <div style="padding: 0.8rem 0; border-bottom: 1px solid var(--border-light);">
            <h5 style="color:#fff; font-size:0.92rem; margin-bottom:0.2rem;">${title}</h5>
            <p style="color:var(--text-muted); font-size:0.82rem; margin-bottom:0.4rem;">${msg}</p>
            ${n.targetUrl ? `<a href="${n.targetUrl}" class="btn btn-outline" style="padding:0.2rem 0.6rem; font-size:0.75rem;">Apply Now →</a>` : ''}
          </div>
        `;
      }).join('');

      drawer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h4 style="color:#fff; margin:0;">🔔 Notifications</h4>
          <button onclick="markAllNotificationsRead()" style="background:none; border:none; color:var(--primary-cyan); font-size:0.78rem; cursor:pointer;">Mark all read</button>
        </div>
        <div>${listHtml}</div>
      `;
    }

    drawer.style.display = 'block';
  } catch (err) {
    console.error('Open Notification Drawer Error:', err);
  }
}

async function markAllNotificationsRead() {
  try {
    await fetch('/api/notifications/read-all', { method: 'PUT', credentials: 'include' });
    const badge = document.getElementById('nav-unread-count');
    if (badge) badge.style.display = 'none';
    const drawer = document.getElementById('notification-drawer');
    if (drawer) drawer.style.display = 'none';
  } catch (err) {
    console.error('Mark Read Error:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchNotifications();
});

`

---

### File 34 of 49
**File Name:** reminders.js  
**File Path:** /public/js/reminders.js  
**Purpose:** Save & reminder modal handler for student bookmarking  

`javascript
/**
 * DishaSetu — Save Bookmarking & Smart Deadline Reminder Dialog Module
 */

function openSaveReminderModal(itemType, itemId) {
  const userStr = localStorage.getItem('dishasetu_user');
  if (!userStr) {
    alert('Please login to save opportunities and set deadline reminders.');
    window.location.href = 'login.html';
    return;
  }

  let modal = document.getElementById('reminder-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'reminder-modal';
    modal.className = 'glass-panel';
    modal.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 90%; max-width: 420px; z-index: 2200; padding: 1.8rem;
      border-radius: var(--radius-md); box-shadow: 0 0 40px rgba(6, 182, 212, 0.3);
    `;
    document.body.appendChild(modal);
  }

  let backdrop = document.getElementById('reminder-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'reminder-backdrop';
    backdrop.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 2199;
    `;
    backdrop.onclick = closeSaveReminderModal;
    document.body.appendChild(backdrop);
  }

  const lang = getCurrentLanguage();

  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
      <h3 style="color: #fff; font-size: 1.2rem; margin: 0;">🔖 Save & Set Deadline Reminder</h3>
      <button onclick="closeSaveReminderModal()" style="background:none; border:none; color:#fff; font-size:1.5rem; cursor:pointer;">×</button>
    </div>
    
    <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.2rem;">
      Choose when you would like to be notified before the application deadline:
    </p>

    <div style="display: flex; flex-direction: column; gap: 0.7rem; margin-bottom: 1.5rem;">
      <label style="display:flex; align-items:center; gap:0.6rem; color:#fff; font-size:0.9rem; cursor:pointer;">
        <input type="radio" name="reminder-pref" value="3_days" checked> 🔔 3 days before deadline (Recommended)
      </label>
      <label style="display:flex; align-items:center; gap:0.6rem; color:#fff; font-size:0.9rem; cursor:pointer;">
        <input type="radio" name="reminder-pref" value="7_days"> 🔔 7 days before deadline
      </label>
      <label style="display:flex; align-items:center; gap:0.6rem; color:#fff; font-size:0.9rem; cursor:pointer;">
        <input type="radio" name="reminder-pref" value="1_day"> 🔔 1 day before deadline
      </label>
      <label style="display:flex; align-items:center; gap:0.6rem; color:#fff; font-size:0.9rem; cursor:pointer;">
        <input type="radio" name="reminder-pref" value="deadline_day"> ⏰ On deadline day
      </label>
      <label style="display:flex; align-items:center; gap:0.6rem; color:var(--text-muted); font-size:0.9rem; cursor:pointer;">
        <input type="radio" name="reminder-pref" value="none"> 🔕 Save without reminder
      </label>
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 0.8rem;">
      <button class="btn btn-outline" style="padding:0.5rem 1rem;" onclick="closeSaveReminderModal()">Cancel</button>
      <button class="btn btn-primary" style="padding:0.5rem 1.2rem;" onclick="executeSave('${itemType}', '${itemId}')">Save Bookmark</button>
    </div>
  `;

  modal.style.display = 'block';
  backdrop.style.display = 'block';
}

function closeSaveReminderModal() {
  const modal = document.getElementById('reminder-modal');
  const backdrop = document.getElementById('reminder-backdrop');
  if (modal) modal.style.display = 'none';
  if (backdrop) backdrop.style.display = 'none';
}

async function executeSave(itemType, itemId) {
  const selectedPref = document.querySelector('input[name="reminder-pref"]:checked')?.value || '3_days';

  try {
    const res = await fetch('/api/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemType, itemId, reminderPreference: selectedPref }),
      credentials: 'include'
    });

    const data = await res.json();
    closeSaveReminderModal();

    if (data.success) {
      const lang = getCurrentLanguage();
      alert(t('savedSuccess', lang));
      // Optionally update bookmark button icon
      const saveBtn = document.getElementById(`save-btn-${itemId}`);
      if (saveBtn) {
        saveBtn.innerText = '🔖 ' + t('btnSaved', lang);
        saveBtn.classList.remove('btn-outline');
        saveBtn.classList.add('btn-primary');
      }
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error('Save Item Error:', err);
  }
}

`

---

### File 35 of 49
**File Name:** style.css  
**File Path:** /public/style.css  
**Purpose:** Complete master CSS stylesheet with warm cream/blue design system, 3D carousel, and responsive grid  

`css
/* ==========================================================================
   DISHASETU — REALISTIC WARM CREAM & PROFESSIONAL BLUE DESIGN SYSTEM
   Warm Cream + Ivory + Deep Navy + Professional Blue + Subtle Teal Aesthetic
   ========================================================================== */

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

:root {
  /* Core Color Palette: Warm Cream, Ivory, Deep Navy, Professional Blue & Subtle Teal */
  --bg-main: #fbf9f4;            /* Soft Warm Cream Canvas */
  --bg-surface: #f7f4ed;         /* Light Ivory Surface */
  --bg-surface-elevated: #ffffff; /* Crisp White Card Container */
  
  --bg-glass: rgba(255, 255, 255, 0.94);
  --bg-glass-card: rgba(255, 255, 255, 0.96);
  
  /* Brand Accent Colors */
  --primary-blue: #1d4ed8;       /* Professional Royal Blue */
  --primary-blue-hover: #1e40af;
  --primary-teal: #0d9488;       /* Subtle Teal Accent */
  --primary-teal-dark: #0f766e;
  
  --accent-amber: #d97706;       /* Warm Gold / Scheme Accent */
  --accent-amber-dark: #b45309;

  /* Header & Structural Dark Accent */
  --navy-dark: #0f172a;          /* Deep Navy Header / Text Anchor */
  --navy-surface: #1e293b;
  
  /* Typography Colors */
  --text-main: #0f172a;          /* Deep Charcoal Navy */
  --text-muted: #475569;         /* Muted Slate Body Text */
  --text-subtle: #64748b;        /* Light Slate Secondary */
  --text-inverse: #ffffff;
  
  /* Borders & Divider */
  --border-light: #e2e8f0;       /* Soft Light Border */
  --border-medium: #cbd5e1;      /* Medium Border */
  --border-glow: #3b82f6;        /* Focus Blue Ring */
  --border-scheme-glow: #f59e0b;

  /* Elevation Shadows */
  --shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.04);
  --shadow-md: 0 6px 20px rgba(15, 23, 42, 0.06);
  --shadow-lg: 0 12px 36px rgba(15, 23, 42, 0.1);
  --shadow-glow: 0 0 25px rgba(29, 78, 216, 0.2);
  --shadow-scheme-glow: 0 0 25px rgba(217, 119, 6, 0.2);
  
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-full: 9999px;

  --font-en: 'Plus Jakarta Sans', -apple-system, sans-serif;
  --font-hi: 'Noto Sans Devanagari', 'Plus Jakarta Sans', sans-serif;

  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Reset & Global Canvas */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-en);
  background-color: var(--bg-main);
  color: var(--text-main);
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  position: relative;
}

[lang="hi"] body, .lang-hi {
  font-family: var(--font-hi);
}

a {
  color: var(--primary-blue);
  text-decoration: none;
  transition: var(--transition);
}

a:hover {
  color: var(--primary-blue-hover);
}

.container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.main-content {
  flex: 1 0 auto;
}

/* Realistic Panel & Card Utilities */
.glass-panel {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.glass-card {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.glass-card:hover {
  border-color: var(--primary-blue);
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.glass-card.scheme-card:hover {
  border-color: var(--accent-amber);
  box-shadow: var(--shadow-scheme-glow);
}

/* Top Header Navbar: Professional Deep Navy Header */
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--navy-dark);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  list-style: none;
}

.nav-links a {
  color: #cbd5e1;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.4rem 0.68rem;
  border-radius: var(--radius-sm);
  position: relative;
}

.nav-links a:hover, .nav-links a.active {
  color: #ffffff;
}

.nav-links a.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: var(--primary-teal);
  border-radius: 2px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lang-switcher {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  padding: 3px;
  cursor: pointer;
  user-select: none;
}

.lang-btn {
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 700;
  color: #cbd5e1;
  border: none;
  background: none;
  cursor: pointer;
  transition: var(--transition);
}

.lang-btn.active {
  background: #ffffff;
  color: var(--navy-dark);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Dynamic Sarkari Result Style Continuous Right -> Left Ticker */
.ticker-container {
  display: flex;
  align-items: center;
  background: var(--navy-dark);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 46px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.05);
}

.ticker-fixed-label {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--primary-blue);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0 1rem;
  height: 100%;
  z-index: 10;
  letter-spacing: 0.5px;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 8px #4ade80;
  animation: pulseGlow 1.5s infinite alternate;
}

@keyframes pulseGlow {
  0% { opacity: 0.4; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.2); }
}

.ticker-track-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.ticker-track {
  display: flex;
  align-items: center;
  white-space: nowrap;
  width: max-content;
  animation: marqueeRightToLeft 39s linear infinite;
}

.ticker-track-wrapper:hover .ticker-track {
  animation-play-state: paused;
}

.ticker-track-group {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding-right: 0.8rem;
}

@keyframes marqueeRightToLeft {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

.ticker-card {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-size: 0.84rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  white-space: nowrap;
}

.ticker-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.ticker-tag-badge {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
}

.ticker-tag-title {
  color: #ffffff;
  font-weight: 600;
}

.ticker-tag-arrow {
  font-size: 0.8rem;
  opacity: 0.8;
  transition: transform 0.2s ease;
}

.ticker-card:hover .ticker-tag-arrow {
  transform: translateX(3px);
}

/* Sarkari Result Inspired Color Tag Variations */
.tag-blue   { background: #1e3a8a; border: 1px solid #3b82f6; color: #ffffff; }
.tag-teal   { background: #0f766e; border: 1px solid #14b8a6; color: #ffffff; }
.tag-green  { background: #14532d; border: 1px solid #22c55e; color: #ffffff; }
.tag-purple { background: #581c87; border: 1px solid #a855f7; color: #ffffff; }
.tag-orange { background: #7c2d12; border: 1px solid #f97316; color: #ffffff; }
.tag-red    { background: #881337; border: 1px solid #f43f5e; color: #ffffff; }
.tag-gold   { background: #78350f; border: 1px solid #eab308; color: #ffffff; }

/* ==========================================================================
   HERO SECTION WITH REALISTIC WARM GOLDEN VISUAL & 3D ORBIT CAROUSEL
   ========================================================================== */

.hero-section {
  position: relative;
  padding: 3.5rem 0 4.5rem 0;
  overflow: hidden;
  min-height: 640px;
  background: linear-gradient(180deg, #f7f4ed 0%, #fbf9f4 100%);
  border-bottom: 1px solid var(--border-light);
}

.hero-bg-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 75% 25%, rgba(217, 119, 6, 0.08) 0%, transparent 65%),
    radial-gradient(circle at 25% 75%, rgba(29, 78, 216, 0.06) 0%, transparent 65%);
  pointer-events: none;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 2rem;
  align-items: center;
  position: relative;
  z-index: 10;
}

.hero-tagline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(13, 148, 136, 0.1);
  border: 1px solid rgba(13, 148, 136, 0.25);
  padding: 6px 16px;
  border-radius: var(--radius-full);
  color: var(--primary-teal-dark);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 1.2rem;
}

.hero-heading {
  font-size: 3.4rem;
  font-weight: 800;
  line-height: 1.14;
  margin-bottom: 1.2rem;
  color: var(--navy-dark);
}

.hero-heading span.gradient-text {
  color: var(--primary-blue);
  background: none;
  -webkit-text-fill-color: initial;
}

.hero-description {
  font-size: 1.12rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
  max-width: 520px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Button Component Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.85rem 1.7rem;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.btn-primary {
  background: var(--primary-blue);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(29, 78, 216, 0.3);
}

.btn-primary:hover {
  background: var(--primary-blue-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(29, 78, 216, 0.4);
}

.btn-outline {
  background: #ffffff;
  color: var(--navy-dark);
  border: 1.5px solid var(--border-medium);
  box-shadow: var(--shadow-sm);
}

.btn-outline:hover {
  background: #f8fafc;
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

.btn-scheme {
  background: var(--accent-amber);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3);
}

.btn-scheme:hover {
  background: var(--accent-amber-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(217, 119, 6, 0.4);
}

/* 3D Circular Orbit Carousel Container */
.hero-visual-stage {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
  transform-style: preserve-3d;
}

.hero-center-realistic-visual {
  position: absolute;
  width: 440px;
  height: 440px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
  mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 90%);
  -webkit-mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 90%);
  box-shadow: 0 0 50px rgba(217, 119, 6, 0.25);
}

.hero-student-road-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 3D Orbit Carousel Cards */
.orbit-card {
  position: absolute;
  top: 40%;
  left: 38%;
  padding: 0.95rem 1.25rem;
  min-width: 185px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid var(--border-medium);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--navy-dark);
  transition: box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease;
  will-change: transform, opacity;
  user-select: none;
}

.orbit-card .orbit-icon {
  font-size: 1.6rem;
}

.orbit-card .orbit-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--navy-dark);
  white-space: nowrap;
}

/* Front Active Orbit Card */
.orbit-card.is-front {
  border-color: var(--primary-blue);
  background: #ffffff;
  box-shadow: 0 0 35px rgba(29, 78, 216, 0.3), 0 12px 30px rgba(15, 23, 42, 0.15);
}

.orbit-card.is-front .orbit-title {
  color: var(--primary-blue);
}

.orbit-card:hover {
  border-color: var(--primary-blue) !important;
  box-shadow: 0 0 35px rgba(29, 78, 216, 0.35) !important;
}

/* Prominent Multi-line Opportunity Card Title */
.opportunity-card-title {
  color: #ffffff;
  font-size: 1.15rem;
  font-weight: 800;
  margin-bottom: 0.6rem;
  line-height: 1.38;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* QUICK ELIGIBILITY FINDER PANEL */
.eligibility-panel {
  margin-top: -1.5rem;
  position: relative;
  z-index: 40;
  padding: 2rem;
  background: #ffffff;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.finder-form-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr) auto;
  gap: 1rem;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-control, .form-select, .form-input, .form-textarea {
  background: #ffffff;
  border: 1.5px solid var(--border-medium);
  border-radius: var(--radius-sm);
  padding: 0.7rem 1rem;
  color: var(--navy-dark);
  font-size: 0.95rem;
  font-family: inherit;
  transition: var(--transition);
}

.form-control option {
  background-color: #ffffff;
  color: var(--navy-dark);
}

.form-control:focus, .form-select:focus, .form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 10px rgba(29, 78, 216, 0.25);
}

/* Section Title Styling */
.section-title-box {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title-box h2 {
  font-size: 2.3rem;
  color: var(--navy-dark);
  margin-bottom: 0.5rem;
}

.section-title-box p {
  color: var(--text-muted);
  font-size: 1.05rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.6rem;
}

/* Badges */
.card-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-open { background: rgba(13, 148, 136, 0.12); color: var(--primary-teal-dark); border: 1px solid rgba(13, 148, 136, 0.3); }
.badge-closing { background: rgba(225, 29, 72, 0.12); color: #be123c; border: 1px solid rgba(225, 29, 72, 0.3); }
.badge-upcoming { background: rgba(29, 78, 216, 0.12); color: var(--primary-blue); border: 1px solid rgba(29, 78, 216, 0.3); }
.badge-scheme { background: rgba(217, 119, 6, 0.12); color: var(--accent-amber-dark); border: 1px solid rgba(217, 119, 6, 0.3); }

/* Mandatory Government Information Disclaimer Banner */
.govt-disclaimer-banner {
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: var(--radius-md);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.govt-disclaimer-banner .icon {
  font-size: 1.8rem;
  color: var(--accent-amber-dark);
}

.govt-disclaimer-banner p {
  margin: 0;
  font-size: 0.88rem;
  color: #78350f;
  line-height: 1.45;
}

/* HOW IT WORKS TIMELINE */
.how-it-works-timeline {
  position: relative;
  padding: 2rem 0;
}

.timeline-path-line {
  position: absolute;
  top: 50%;
  left: 5%;
  right: 5%;
  height: 4px;
  background: var(--border-light);
  z-index: 1;
}

.timeline-path-line-active {
  position: absolute;
  top: 50%;
  left: 5%;
  width: 0%;
  height: 4px;
  background: var(--primary-blue);
  z-index: 2;
  transition: width 0.6s ease;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  position: relative;
  z-index: 5;
}

.step-card {
  background: #ffffff;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 1.6rem 1.2rem;
  text-align: center;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
}

.step-icon-circle {
  width: 52px;
  height: 52px;
  margin: 0 auto 1rem auto;
  border-radius: 50%;
  background: #f8fafc;
  border: 2px solid var(--border-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.3rem;
  color: var(--text-muted);
  transition: var(--transition);
}

.step-card.active .step-icon-circle {
  border-color: var(--primary-blue);
  color: var(--primary-blue);
  background: #eff6ff;
  transform: scale(1.08);
}

/* GOVERNMENT SCHEMES VISUAL STAGE */
.schemes-section-stage {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 3rem;
  align-items: center;
  margin-top: 2rem;
}

.parliament-landmark-box {
  position: relative;
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);
  border-radius: var(--radius-lg);
  border: 1.5px solid #fde68a;
  box-shadow: var(--shadow-sm);
}

.parliament-building-icon {
  font-size: 6.5rem;
}

.orbit-bubble {
  position: absolute;
  padding: 0.6rem 1.1rem;
  background: #ffffff;
  border: 1.5px solid var(--border-medium);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--navy-dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--shadow-md);
  animation: orbitFloat 4s ease-in-out infinite alternate;
}

.bubble-1 { top: 10%; left: 8%; animation-delay: 0s; }
.bubble-2 { top: 15%; right: 8%; animation-delay: 1s; }
.bubble-3 { top: 50%; left: 2%; animation-delay: 1.8s; }
.bubble-4 { top: 52%; right: 2%; animation-delay: 0.5s; }
.bubble-5 { bottom: 10%; left: 15%; animation-delay: 2.4s; }
.bubble-6 { bottom: 12%; right: 15%; animation-delay: 1.4s; }

@keyframes orbitFloat {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-8px); }
}

/* FINAL CTA SECTION */
.final-cta-wrapper {
  position: relative;
  width: 100%;
  padding: 5.5rem 0;
  margin-top: 4rem;
  background-image: 
    linear-gradient(to bottom, var(--bg-main) 0%, transparent 18%, transparent 82%, var(--bg-main) 100%),
    linear-gradient(90deg, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.85) 45%, rgba(15, 23, 42, 0.3) 100%),
    url('assets/final-cta-bg.jpg');
  background-size: cover;
  background-position: center right;
  background-repeat: no-repeat;
  min-height: 540px;
  display: flex;
  align-items: center;
}

.final-cta-container {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 3rem;
  align-items: center;
  position: relative;
  z-index: 10;
}

.final-cta-left {
  max-width: 580px;
}

/* Notification Bell & Drawer */
.notification-bell-btn {
  position: relative;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 800;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Footer: Professional Deep Navy Footer */
.footer {
  background: var(--navy-dark);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4rem 0 2rem 0;
  margin-top: 5rem;
  color: #f8fafc;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-brand p {
  color: #cbd5e1;
  margin-top: 0.8rem;
  font-size: 0.95rem;
}

.footer-col h4 {
  color: #ffffff;
  font-size: 1rem;
  margin-bottom: 1.2rem;
}

.footer-col ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.footer-col a {
  color: #cbd5e1;
  font-size: 0.9rem;
}

.footer-col a:hover {
  color: #ffffff;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 0.85rem;
}

/* Global Viewport Safety */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* Mobile Navigation Hamburger Toggle Button */
.mobile-nav-toggle {
  display: none;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  cursor: pointer;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.mobile-nav-toggle .hamburger-bar {
  display: block;
  width: 22px;
  height: 2px;
  background-color: #ffffff;
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.mobile-nav-toggle.is-active .hamburger-bar:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.mobile-nav-toggle.is-active .hamburger-bar:nth-child(2) {
  opacity: 0;
}

.mobile-nav-toggle.is-active .hamburger-bar:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* Responsive Breakpoints */

/* Tablet Breakpoint (<= 992px) */
@media (max-width: 992px) {
  .navbar-inner {
    position: relative;
  }

  .mobile-nav-toggle {
    display: flex;
  }

  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(15, 23, 42, 0.98);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-direction: column;
    padding: 1.2rem;
    gap: 0.8rem;
    z-index: 100;
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
    border-radius: 0 0 var(--radius-md) var(--radius-md);
  }

  .nav-links.mobile-open {
    display: flex;
  }

  .hero-grid { 
    grid-template-columns: 1fr; 
    text-align: center;
    gap: 2.5rem;
  }

  .hero-description { 
    margin: 0 auto 2rem auto; 
  }

  .hero-actions { 
    justify-content: center;
    flex-wrap: wrap;
  }

  .hero-visual-stage {
    min-height: 420px;
    perspective: 900px;
  }

  .hero-center-realistic-visual {
    width: 340px;
    height: 340px;
  }

  .orbit-card {
    left: 32%;
    min-width: 155px;
    padding: 0.75rem 1rem;
  }

  .orbit-card .orbit-icon {
    font-size: 1.4rem;
  }

  .orbit-card .orbit-title {
    font-size: 0.85rem;
  }

  .finder-form-grid { grid-template-columns: 1fr 1fr; }
  .steps-grid { grid-template-columns: 1fr 1fr; }
  .schemes-section-stage { grid-template-columns: 1fr; }
  .final-cta-container { grid-template-columns: 1fr; text-align: center; }
  .final-cta-left { max-width: 100%; margin: 0 auto; }
  .footer-grid { grid-template-columns: 1fr 1fr; }
}

/* Mobile Breakpoint (<= 640px) */
@media (max-width: 640px) {
  .hero-heading { 
    font-size: 2.05rem; 
    line-height: 1.25;
  }

  .hero-description {
    font-size: 0.95rem;
  }

  .hero-actions {
    gap: 0.75rem;
  }

  .hero-actions .btn {
    padding: 0.75rem 1.4rem;
    font-size: 0.92rem;
  }

  .hero-visual-stage {
    min-height: 330px;
    perspective: 700px;
  }

  .hero-center-realistic-visual {
    width: 250px;
    height: 250px;
  }

  .orbit-card {
    left: 28%;
    min-width: 130px;
    padding: 0.55rem 0.8rem;
    gap: 0.55rem;
  }

  .orbit-card .orbit-icon {
    font-size: 1.25rem;
  }

  .orbit-card .orbit-title {
    font-size: 0.78rem;
  }

  .ticker-container {
    height: 42px;
  }

  .ticker-fixed-label {
    font-size: 0.68rem;
    padding: 0 0.65rem;
    gap: 4px;
  }

  .ticker-card {
    padding: 0.35rem 0.75rem;
    font-size: 0.8rem;
  }

  .finder-form-grid { grid-template-columns: 1fr; }
  .steps-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr; }
  
  .footer-bottom {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}

/* Small Mobile Breakpoint (<= 390px) */
@media (max-width: 390px) {
  .hero-heading { 
    font-size: 1.75rem; 
  }

  .hero-tagline {
    font-size: 0.78rem;
  }

  .hero-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .hero-visual-stage {
    min-height: 290px;
    perspective: 600px;
  }

  .hero-center-realistic-visual {
    width: 210px;
    height: 210px;
  }

  .orbit-card {
    left: 24%;
    min-width: 112px;
    padding: 0.45rem 0.65rem;
    gap: 0.45rem;
  }

  .orbit-card .orbit-icon {
    font-size: 1.1rem;
  }

  .orbit-card .orbit-title {
    font-size: 0.72rem;
  }

  .nav-actions {
    gap: 0.5rem;
  }

  .nav-actions .btn {
    padding: 0.35rem 0.65rem !important;
    font-size: 0.78rem !important;
  }

  .lang-btn {
    padding: 2px 7px;
    font-size: 0.75rem;
  }

  .eligibility-panel {
    padding: 1.25rem;
  }

  .section-title-box h2 {
    font-size: 1.7rem;
  }
}

/* Public Banner Image Styles for Cards and Details */
.card-banner-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  margin-bottom: 0.8rem;
  display: block;
}

.detail-banner-img {
  width: 100%;
  max-height: 380px;
  object-fit: cover;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-md);
  display: block;
}


`

---

### File 36 of 49
**File Name:** index.html  
**File Path:** /public/index.html  
**Purpose:** Homepage with 3D elliptical orbit carousel, ticker, fresh opportunities, and CTA  

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DishaSetu | Right Opportunity → Right Person → Right Time</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Dynamic Navbar Placeholder -->
  <div id="navbar-placeholder"></div>

  <!-- FRAME 2: Dynamic Latest Updates Marquee Ticker (Left -> Right) -->
  <div id="ticker-placeholder"></div>

  <main class="main-content">
    
    <!-- FRAME 1: HERO SECTION WITH STUDENT BACKPACK SILHOUETTE & CURVED GLOWING LIGHT ROAD -->
    <section class="hero-section">
      <div class="hero-bg-particles"></div>
      <div class="container hero-grid">
        <!-- Left Hero Text & CTA -->
        <div>
          <div class="hero-tagline">
            <span>✨</span> <span data-i18n="heroLabel">Your Digital Guide to Opportunities</span>
          </div>
          <h1 class="hero-heading">
            <span data-i18n="heroHeading">Find What's Meant for You.</span><br>
            <span class="gradient-text">Right Time. Right Person.</span>
          </h1>
          <p class="hero-description" data-i18n="heroSubtext">
            Discover scholarships, government schemes, competitions, exams, hackathons and skill programs — all in one place.
          </p>
          <div class="hero-actions">
            <a href="opportunities.html" class="btn btn-primary" data-i18n="btnFindOpportunities">
              🎓 Find Opportunities →
            </a>
            <a href="schemes.html" class="btn btn-scheme" data-i18n="btnGovernmentSchemes">
              🏛️ Government Schemes
            </a>
          </div>
        </div>

        <!-- Right Hero Visual Stage: Realistic Student with Backpack & Future Cyan Light Road (Behind 3D Orbit Carousel) -->
        <div class="hero-visual-stage">
          <!-- Realistic Student & Future Light Road Central Visual -->
          <div class="hero-center-realistic-visual">
            <img src="assets/hero-golden-hour.jpg" alt="Realistic Student Walking Along Golden Hour Light Road" class="hero-student-road-img">
          </div>

          <!-- 3D Circular / Elliptical Orbit Carousel Cards -->
          <a href="opportunities.html?type=Scholarship" class="orbit-card" data-index="0">
            <span class="orbit-icon">🎓</span>
            <span class="orbit-title">Scholarships</span>
          </a>

          <a href="opportunities.html?type=Quiz Competition" class="orbit-card" data-index="1">
            <span class="orbit-icon">🏆</span>
            <span class="orbit-title">Competitions</span>
          </a>

          <a href="schemes.html" class="orbit-card" data-index="2">
            <span class="orbit-icon">🏛️</span>
            <span class="orbit-title">Government Schemes</span>
          </a>

          <a href="opportunities.html?type=Hackathon" class="orbit-card" data-index="3">
            <span class="orbit-icon">💻</span>
            <span class="orbit-title">Hackathons</span>
          </a>

          <a href="opportunities.html?type=Skill Development Program" class="orbit-card" data-index="4">
            <span class="orbit-icon">⚙️</span>
            <span class="orbit-title">Skill Programs</span>
          </a>
        </div>
      </div>
    </section>

    <!-- QUICK ELIGIBILITY FINDER PANEL -->
    <section class="container mb-5">
      <div class="glass-panel eligibility-panel">
        <h3 style="color: var(--navy-dark); font-size: 1.3rem; margin-bottom: 1.2rem;" data-i18n="finderTitle">
          Find Opportunities For You
        </h3>
        <form onsubmit="handleEligibilityCheck(event)" class="finder-form-grid">
          <div class="form-group">
            <label data-i18n="labelAge">Age</label>
            <input type="number" id="finder-age" class="form-control" placeholder="e.g. 21" min="10" max="80" value="21">
          </div>

          <div class="form-group">
            <label data-i18n="labelEducation">Education</label>
            <select id="finder-education" class="form-control">
              <option value="Graduate">Graduate</option>
              <option value="12th">12th Pass</option>
              <option value="10th">10th Pass</option>
              <option value="Post Graduate">Post Graduate</option>
              <option value="Diploma">Diploma</option>
              <option value="ITI">ITI</option>
            </select>
          </div>

          <div class="form-group">
            <label data-i18n="labelState">State</label>
            <select id="finder-state" class="form-control">
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Punjab">Punjab</option>
              <option value="All India">All India</option>
            </select>
          </div>

          <div class="form-group">
            <label data-i18n="labelCategory">Category</label>
            <select id="finder-category" class="form-control">
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
              <option value="Women">Women</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary" style="height: 44px;" data-i18n="btnSearchNow">
            Find Opportunities →
          </button>
        </form>
      </div>
    </section>

    <!-- FRAME 3: HOW IT WORKS SECTION - ANIMATED STEPS -->
    <section id="how-it-works" class="container mb-5" style="padding-top: 2rem;">
      <div class="section-title-box">
        <h2 data-i18n="howItWorksTitle">Your Journey to a Better Future</h2>
        <p>Follow the path to discover, verify eligibility, and apply</p>
      </div>

      <div class="how-it-works-timeline">
        <div class="timeline-path-line"></div>
        <div id="timeline-active-line" class="timeline-path-line-active"></div>

        <div class="steps-grid">
          <div class="step-card active">
            <div class="step-icon-circle">👤</div>
            <div style="font-size:0.75rem; color:var(--primary-teal); font-weight:800; text-transform:uppercase; margin-bottom:0.3rem;">01</div>
            <h4 style="color:var(--navy-dark); margin-bottom:0.4rem;" data-i18n="step1Title">Tell Us About You</h4>
            <p style="color:var(--text-muted); font-size:0.85rem;" data-i18n="step1Desc">Provide your age, education, state, and category.</p>
          </div>

          <div class="step-card">
            <div class="step-icon-circle">🔍</div>
            <div style="font-size:0.75rem; color:var(--primary-teal); font-weight:800; text-transform:uppercase; margin-bottom:0.3rem;">02</div>
            <h4 style="color:var(--navy-dark); margin-bottom:0.4rem;" data-i18n="step2Title">We Find Matches</h4>
            <p style="color:var(--text-muted); font-size:0.85rem;" data-i18n="step2Desc">DishaSetu scans opportunities relevant to your profile.</p>
          </div>

          <div class="step-card">
            <div class="step-icon-circle">✓</div>
            <div style="font-size:0.75rem; color:var(--primary-teal); font-weight:800; text-transform:uppercase; margin-bottom:0.3rem;">03</div>
            <h4 style="color:var(--navy-dark); margin-bottom:0.4rem;" data-i18n="step3Title">Check Eligibility</h4>
            <p style="color:var(--text-muted); font-size:0.85rem;" data-i18n="step3Desc">Instantly see itemized pass/fail criteria.</p>
          </div>

          <div class="step-card">
            <div class="step-icon-circle">🚀</div>
            <div style="font-size:0.75rem; color:var(--primary-teal); font-weight:800; text-transform:uppercase; margin-bottom:0.3rem;">04</div>
            <h4 style="color:var(--navy-dark); margin-bottom:0.4rem;" data-i18n="step4Title">Apply & Grow</h4>
            <p style="color:var(--text-muted); font-size:0.85rem;" data-i18n="step4Desc">Direct links to official application portals.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FRAME 4: FRESH OPPORTUNITIES FOR YOU SECTION -->
    <section class="container mb-5">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
        <div>
          <span class="card-badge badge-open" style="margin-bottom: 0.4rem;">Latest Opportunities</span>
          <h2 style="color: var(--navy-dark); font-size: 2.2rem; margin: 0;">Fresh Opportunities <span style="color: var(--primary-blue)">For You</span></h2>
        </div>
        <a href="opportunities.html" class="btn btn-outline" style="padding: 0.5rem 1.2rem; font-size: 0.88rem;">View All →</a>
      </div>

      <div id="fresh-opportunities-grid" class="cards-grid">
        <!-- Dynamically Populated via JS -->
      </div>
    </section>

    <!-- FRAME 5: GOVERNMENT SCHEMES SECTION - ANIMATED VISUAL WITH PARLIAMENT & BUBBLES -->
    <section class="container mb-5">
      <!-- Mandatory Government Disclaimer Banner -->
      <div class="govt-disclaimer-banner">
        <div class="icon">🏛️</div>
        <p data-i18n="govtDisclaimer">
          This platform is an information and discovery portal. It is not an official government website. Always verify eligibility, dates and application details on the official website before applying.
        </p>
      </div>

      <div class="schemes-section-stage">
        <!-- Left Text & CTA -->
        <div>
          <span class="card-badge badge-scheme" style="margin-bottom: 0.6rem;">Government Schemes</span>
          <h2 style="color: var(--navy-dark); font-size: 2.4rem; line-height: 1.2; margin-bottom: 1rem;">
            Schemes for a <span style="color: var(--accent-amber)">Stronger Tomorrow</span>
          </h2>
          <p style="color: var(--text-muted); font-size: 1.05rem; margin-bottom: 1.8rem;" data-i18n="exploreSchemesSubtext">
            Discover Central and State Government schemes designed to support education, employment, health, housing, skills and more.
          </p>
          <a href="schemes.html" class="btn btn-scheme" data-i18n="btnGovernmentSchemes">
            Explore Schemes →
          </a>
        </div>

        <!-- Right Visual: Parliament Building Silhouette with Orbiting Category Bubbles -->
        <div class="parliament-landmark-box">
          <div class="parliament-building-icon">🏛️</div>
          
          <div class="orbit-bubble bubble-1">🎓 Education</div>
          <div class="orbit-bubble bubble-2">💼 Employment</div>
          <div class="orbit-bubble bubble-3">👩 Women</div>
          <div class="orbit-bubble bubble-4">🌾 Farmers</div>
          <div class="orbit-bubble bubble-5">🏥 Health</div>
          <div class="orbit-bubble bubble-6">🏠 Housing</div>
        </div>
      </div>
    </section>

    <!-- FRAME 6: CINEMATIC FINAL MOTIVATIONAL CTA SECTION -->
    <section class="final-cta-wrapper">
      <div class="container final-cta-container">
        <!-- Left Area: Branding, Tagline & Button -->
        <div class="final-cta-left">
          <a href="index.html" class="brand-logo" style="margin-bottom: 1rem; display: inline-block;">
            <img src="assets/logo.png" alt="DishaSetu Logo" style="height: 44px; width: auto; object-fit: contain; filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.4));">
          </a>
          
          <p style="color: #cbd5e1; font-weight: 700; font-size: 1.05rem; margin-bottom: 1.8rem;" data-i18n="brandTagline">
            Right Opportunity → Right Person → Right Time
          </p>

          <a href="opportunities.html" class="btn btn-primary" style="padding: 0.95rem 2.4rem; font-size: 1.08rem;">
            Get Started Now →
          </a>
        </div>

        <!-- Right Side: Visually open to showcase the realistic student standing on mountain cliff looking at cyan horizon -->
        <div></div>
      </div>
    </section>

  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a href="index.html" class="brand-logo">
          <img src="assets/logo.png" alt="DishaSetu Logo" style="height: 40px; width: auto; object-fit: contain;">
        </a>
        <p data-i18n="brandTagline">Right Opportunity → Right Person → Right Time</p>
        <p style="font-size: 0.82rem; color: var(--text-subtle); margin-top: 0.5rem;">
          Your Digital Guide to Opportunities & Government Schemes
        </p>
      </div>

      <div class="footer-col">
        <h4 data-i18n="navOpportunities">Opportunities</h4>
        <ul>
          <li><a href="opportunities.html?type=Scholarship">Scholarships</a></li>
          <li><a href="opportunities.html?type=Hackathon">Hackathons</a></li>
          <li><a href="opportunities.html?type=Quiz Competition">Quiz Competitions</a></li>
          <li><a href="opportunities.html?type=Skill Development Program">Skill Programs</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4 data-i18n="navSchemes">Government Schemes</h4>
        <ul>
          <li><a href="schemes.html?governmentType=Central">Central Schemes</a></li>
          <li><a href="schemes.html?governmentType=State">State Schemes</a></li>
          <li><a href="schemes.html?sector=Education">Education Schemes</a></li>
          <li><a href="schemes.html?sector=Skill Development">Skill Schemes</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Legal & Portal Info</h4>
        <ul>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="index.html">Disclaimer</a></li>
          <li><a href="login.html">Student Portal</a></li>
          <li><a href="admin-dashboard.html">Admin Console</a></li>
        </ul>
      </div>
    </div>

    <div class="container footer-bottom">
      <span>© 2026 DishaSetu. All rights reserved.</span>
      <span>Designed for Student Empowerment & Guidance</span>
    </div>
  </footer>

  <!-- Modular Scripts -->
  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/eligibility.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    // Load Frame 4 Fresh Opportunities For You
    async function loadFreshOpportunities() {
      const grid = document.getElementById('fresh-opportunities-grid');
      if (!grid) return;

      try {
        const res = await fetch('/api/opportunities?limit=3');
        const data = await res.json();
        if (!data.success || !data.opportunities) return;

        const lang = getCurrentLanguage();
        grid.innerHTML = data.opportunities.map(op => {
          const title = getLocalized(op.title, lang);
          const lastDateStr = op.lastDate ? new Date(op.lastDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
          const isClosing = op.status === 'CLOSING SOON';

          return `
            <div class="glass-card" style="padding: 1.6rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                ${op.publicBannerImage ? `<img src="${op.publicBannerImage}" alt="${title} Banner" class="card-banner-img" onerror="this.style.display='none'">` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                  <span class="card-badge ${isClosing ? 'badge-closing' : 'badge-open'}">${op.type}</span>
                  <span class="card-badge ${isClosing ? 'badge-closing' : 'badge-open'}">${op.status}</span>
                </div>

                <h3 class="opportunity-card-title">${title}</h3>
                
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.8rem;">
                  🎯 For: Students | State: ${(op.eligibility.state || ['All India']).join(', ')}
                </div>

                <div style="font-size: 0.82rem; color: var(--text-subtle); margin-bottom: 0.8rem;">
                  🎓 Min. ${(op.eligibility.education || ['12th Pass'])[0]} | 🎂 Max. ${op.eligibility.maxAge || 25} Years
                </div>

                ${op.prizeAmount ? `<div style="font-size: 0.92rem; font-weight: 800; color: var(--primary-cyan); margin-bottom: 0.6rem;">💰 Prize: ${op.prizeAmount}</div>` : ''}
                
                <div style="font-size: 0.82rem; color: var(--text-subtle); margin-bottom: 1rem;">
                  📅 Last Date: <strong>${lastDateStr}</strong>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; pt-3; border-top: 1px solid var(--border-light);">
                <span class="card-badge badge-open" style="font-size: 0.72rem;">Eligible for You ✓</span>
                <a href="opportunity-details.html?id=${op._id}" class="btn btn-primary" style="padding: 0.4rem 0.9rem; font-size: 0.82rem;">
                  View →
                </a>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error('Load Fresh Opportunities Error:', err);
      }
    }

    document.addEventListener('DOMContentLoaded', loadFreshOpportunities);
  </script>
</body>
</html>

`

---

### File 37 of 49
**File Name:** login.html  
**File Path:** /public/login.html  
**Purpose:** Unified student and administrator authentication login portal  

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .role-tabs {
      display: flex;
      gap: 0.5rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-light);
      padding: 0.35rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
    }
    .role-tab {
      flex: 1;
      text-align: center;
      padding: 0.6rem 0.8rem;
      border-radius: 8px;
      color: var(--text-muted);
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .role-tab.active {
      background: var(--primary-cyan);
      color: #090d16;
      box-shadow: 0 0 12px rgba(6, 182, 212, 0.4);
    }
    .role-tab-admin.active {
      background: #4ade80;
      color: #090d16;
      box-shadow: 0 0 12px rgba(74, 222, 128, 0.4);
    }
  </style>
</head>
<body style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; padding-top: 5rem; padding-bottom: 3rem;">
  <div id="navbar-placeholder" style="width: 100%; position: fixed; top: 0; z-index: 100;"></div>

  <main class="container" style="max-width: 460px; width: 100%; padding: 1rem;">
    <div class="glass-panel" style="padding: 2.2rem; border-radius: 16px;">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <a href="index.html" class="brand-logo" style="justify-content: center; margin-bottom: 0.4rem;">
          <img src="assets/logo.png" alt="DishaSetu Logo" style="height: 42px; width: auto; filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.4));">
        </a>
        <h2 style="color: #fff; font-size: 1.5rem; margin-top: 0.5rem;" id="login-heading">Login to DishaSetu</h2>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 0.2rem;" id="login-subtext">Access saved opportunities & student portal</p>
      </div>

      <!-- Role Selector Tabs: Student vs Admin -->
      <div class="role-tabs">
        <div id="tab-student" class="role-tab active" onclick="switchLoginRole('student')">
          🎓 Student Portal
        </div>
        <div id="tab-admin" class="role-tab role-tab-admin" onclick="switchLoginRole('admin')">
          🛡️ Admin Console
        </div>
      </div>

      <div id="login-alert" style="display: none; padding: 0.8rem; border-radius: 8px; margin-bottom: 1.2rem; font-size: 0.85rem;"></div>

      <form onsubmit="handleLogin(event)">
        <input type="hidden" id="login-role" value="student">

        <div class="form-group" style="margin-bottom: 1.2rem;">
          <label style="display: block; color: #e2e8f0; font-size: 0.88rem; margin-bottom: 0.4rem;" id="email-label">Student Email Address</label>
          <input type="email" id="login-email" class="form-control" placeholder="student.demo@dishasetu.in" required value="student.demo@dishasetu.in">
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label style="display: block; color: #e2e8f0; font-size: 0.88rem; margin-bottom: 0.4rem;">Password</label>
          <input type="password" id="login-password" class="form-control" placeholder="••••••••" required value="Student@123">
        </div>

        <button type="submit" id="login-submit-btn" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 0.8rem; font-size: 1rem;">
          Login to Student Portal →
        </button>
      </form>

      <!-- Quick Demo Credentials Box -->
      <div style="margin-top: 1.5rem; background: rgba(15, 23, 42, 0.7); border: 1px dashed var(--border-light); padding: 0.8rem 1rem; border-radius: 8px; font-size: 0.82rem; color: var(--text-muted);" id="demo-credentials-box">
        <strong style="color: var(--primary-cyan); display: block; margin-bottom: 0.2rem;">🔑 Demo Student Credentials:</strong>
        Email: <code style="color:#fff;">student.demo@dishasetu.in</code> | Password: <code style="color:#fff;">Student@123</code>
      </div>

      <div style="text-align: center; margin-top: 1.5rem; font-size: 0.88rem; color: var(--text-muted);">
        Don't have a student account? <a href="register.html" style="color: var(--primary-cyan); font-weight: 700;">Register Here</a>
      </div>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>

  <script>
    let currentRole = 'student';

    function switchLoginRole(role) {
      currentRole = role;
      document.getElementById('login-role').value = role;

      const tabStudent = document.getElementById('tab-student');
      const tabAdmin = document.getElementById('tab-admin');
      const heading = document.getElementById('login-heading');
      const subtext = document.getElementById('login-subtext');
      const emailLabel = document.getElementById('email-label');
      const submitBtn = document.getElementById('login-submit-btn');
      const demoBox = document.getElementById('demo-credentials-box');

      if (role === 'admin') {
        tabAdmin.classList.add('active');
        tabStudent.classList.remove('active');
        heading.innerText = 'Admin Control Console';
        subtext.innerText = 'Manage opportunities, schemes & review student submissions';
        emailLabel.innerText = 'Administrator Email';
        document.getElementById('login-email').value = 'admin@dishasetu.in';
        document.getElementById('login-password').value = 'Admin@123';
        submitBtn.className = 'btn btn-scheme';
        submitBtn.style.background = '#4ade80';
        submitBtn.style.color = '#090d16';
        submitBtn.innerText = 'Login to Admin Control Console →';
        
        demoBox.innerHTML = `
          <strong style="color: #4ade80; display: block; margin-bottom: 0.2rem;">🛡️ Admin Credentials options:</strong>
          Option 1: <code style="color:#fff;">admin@dishasetu.in</code> / <code style="color:#fff;">Admin@123</code><br>
          Option 2: <code style="color:#fff;">shivamkumarmzp2@gmail.com</code> / <code style="color:#fff;">Shakti@826</code>
        `;
      } else {
        tabStudent.classList.add('active');
        tabAdmin.classList.remove('active');
        heading.innerText = 'Login to Student Portal';
        subtext.innerText = 'Access saved opportunities & personalized recommendations';
        emailLabel.innerText = 'Student Email Address';
        document.getElementById('login-email').value = 'student.demo@dishasetu.in';
        document.getElementById('login-password').value = 'Student@123';
        submitBtn.className = 'btn btn-primary';
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        submitBtn.innerText = 'Login to Student Portal →';

        demoBox.innerHTML = `
          <strong style="color: var(--primary-cyan); display: block; margin-bottom: 0.2rem;">🔑 Demo Student Credentials:</strong>
          Email: <code style="color:#fff;">student.demo@dishasetu.in</code> | Password: <code style="color:#fff;">Student@123</code>
        `;
      }
    }

    async function handleLogin(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const role = document.getElementById('login-role').value;
      const alertBox = document.getElementById('login-alert');

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role }),
          credentials: 'include'
        });

        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem('dishasetu_user', JSON.stringify(data.user));
          
          alertBox.style.display = 'block';
          alertBox.style.background = 'rgba(34, 197, 94, 0.2)';
          alertBox.style.border = '1px solid #22c55e';
          alertBox.style.color = '#86efac';
          alertBox.innerText = `🎉 Login successful! Welcome ${data.user.name}. Redirecting...`;

          setTimeout(() => {
            if (data.user.role === 'admin') {
              window.location.href = 'admin-dashboard.html';
            } else {
              window.location.href = 'dashboard.html';
            }
          }, 1000);
        } else {
          alertBox.style.display = 'block';
          alertBox.style.background = 'rgba(239, 68, 68, 0.2)';
          alertBox.style.border = '1px solid #ef4444';
          alertBox.style.color = '#fca5a5';
          alertBox.innerText = '❌ ' + (data.message || 'Invalid credentials');
        }
      } catch (err) {
        console.error('Login error:', err);
        alertBox.style.display = 'block';
        alertBox.style.background = 'rgba(239, 68, 68, 0.2)';
        alertBox.style.border = '1px solid #ef4444';
        alertBox.style.color = '#fca5a5';
        alertBox.innerText = '❌ Connection error during login. Please try again.';
      }
    }
  </script>
</body>
</html>

`

---

### File 38 of 49
**File Name:** register.html  
**File Path:** /public/register.html  
**Purpose:** Student account registration portal with educational profile inputs  

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Registration | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh;">
  <div id="navbar-placeholder" style="width: 100%; position: absolute; top: 0;"></div>

  <main class="container" style="max-width: 520px; width: 100%; padding: 4rem 1rem 2rem 1rem;">
    <div class="glass-panel" style="padding: 2.5rem;">
      <div style="text-align: center; margin-bottom: 1.8rem;">
        <a href="index.html" class="brand-logo" style="justify-content: center; margin-bottom: 0.5rem;">
          <div class="logo-icon">✨</div>
          <span>Disha<span style="color: var(--primary-cyan)">Setu</span></span>
        </a>
        <h2 style="color: #fff; font-size: 1.5rem; margin-top: 0.5rem;">Create Student Profile</h2>
        <p style="color: var(--text-muted); font-size: 0.88rem;">Start discovering personalized opportunities & government schemes</p>
      </div>

      <form onsubmit="handleRegister(event)">
        <div class="form-group" style="margin-bottom: 1rem;">
          <label>Full Name</label>
          <input type="text" id="reg-name" class="form-control" placeholder="Rahul Verma" required>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label>Email Address</label>
          <input type="email" id="reg-email" class="form-control" placeholder="rahul@example.com" required>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label>Password</label>
          <input type="password" id="reg-password" class="form-control" placeholder="••••••••" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label>Age</label>
            <input type="number" id="reg-age" class="form-control" placeholder="21" required value="21">
          </div>

          <div class="form-group">
            <label>Education</label>
            <select id="reg-edu" class="form-control">
              <option value="Graduate">Graduate</option>
              <option value="12th">12th Pass</option>
              <option value="10th">10th Pass</option>
              <option value="Post Graduate">Post Graduate</option>
              <option value="Diploma">Diploma</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
          <div class="form-group">
            <label>State</label>
            <select id="reg-state" class="form-control">
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="All India">All India</option>
            </select>
          </div>

          <div class="form-group">
            <label>Category</label>
            <select id="reg-cat" class="form-control">
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
              <option value="Women">Women</option>
            </select>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
          Register Profile →
        </button>
      </form>

      <div style="text-align: center; margin-top: 1.5rem; font-size: 0.88rem; color: var(--text-muted);">
        Already registered? <a href="login.html" style="color: var(--primary-cyan); font-weight: 700;">Login Here</a>
      </div>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>

  <script>
    async function handleRegister(e) {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const age = document.getElementById('reg-age').value;
      const education = document.getElementById('reg-edu').value;
      const state = document.getElementById('reg-state').value;
      const category = document.getElementById('reg-cat').value;

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, age, education, state, category }),
          credentials: 'include'
        });

        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem('dishasetu_user', JSON.stringify(data.user));
          window.location.href = 'dashboard.html';
        } else {
          alert(data.message || 'Registration failed');
        }
      } catch (err) {
        console.error('Registration error:', err);
      }
    }
  </script>
</body>
</html>

`

---

### File 39 of 49
**File Name:** dashboard.html  
**File Path:** /public/dashboard.html  
**Purpose:** Student personal dashboard with personalized recommendations  

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Dashboard | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="navbar-placeholder"></div>
  <div id="ticker-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem;">
    <!-- Welcome Header -->
    <div class="glass-panel" style="padding: 2rem; margin-bottom: 2.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="card-badge badge-open" style="margin-bottom: 0.5rem;">Student Profile</span>
          <h1 style="color: #fff; font-size: 2rem; margin-bottom: 0.4rem;">
            Welcome back, <span id="dash-user-name" style="color: var(--primary-cyan);">Student</span>!
          </h1>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0;">
            Here are personalized opportunity recommendations matched to your profile.
          </p>
        </div>

        <button class="btn btn-outline" onclick="openEditProfileModal()">
          ⚙️ Edit Student Profile
        </button>
      </div>

      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 1.5rem; padding-top: 1.2rem; border-top: 1px solid var(--border-light); font-size: 0.9rem;">
        <span>🎓 Qualification: <strong id="dash-edu" style="color:#fff;">Graduate</strong></span>
        <span>📍 State: <strong id="dash-state" style="color:#fff;">Uttar Pradesh</strong></span>
        <span>🎂 Age: <strong id="dash-age" style="color:#fff;">21 Years</strong></span>
        <span>🏷️ Category: <strong id="dash-cat" style="color:#fff;">General</strong></span>
      </div>
    </div>

    <!-- Recommended For You Section -->
    <div style="margin-bottom: 3rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2 style="color: #fff; font-size: 1.6rem; margin-bottom: 0.2rem;">✨ Recommended For You</h2>
          <p style="color: var(--text-muted); font-size: 0.92rem; margin: 0;">Based on your qualification, age, and state profile</p>
        </div>
      </div>

      <div id="dash-recommend-grid" class="cards-grid">
        <!-- Dynamically Populated -->
      </div>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/eligibility.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    async function loadStudentDashboard() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();
        if (!data.success || !data.user) {
          window.location.href = 'login.html';
          return;
        }

        const user = data.user;
        localStorage.setItem('dishasetu_user', JSON.stringify(user));

        document.getElementById('dash-user-name').innerText = user.name;
        document.getElementById('dash-edu').innerText = user.education || 'Graduate';
        document.getElementById('dash-state').innerText = user.state || 'All India';
        document.getElementById('dash-age').innerText = (user.age || '21') + ' Years';
        document.getElementById('dash-cat').innerText = user.category || 'General';

        // Fetch Recommendations based on user profile
        fetchRecommendations(user);
      } catch (err) {
        console.error('Dashboard Error:', err);
      }
    }

    async function fetchRecommendations(user) {
      const grid = document.getElementById('dash-recommend-grid');
      try {
        const res = await fetch('/api/opportunities/check-eligibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            age: user.age || 21,
            education: user.education || 'Graduate',
            state: user.state || 'Uttar Pradesh',
            category: user.category || 'General'
          })
        });

        const data = await res.json();
        if (!data.success || !data.results) return;

        const lang = getCurrentLanguage();
        const topMatches = data.results.slice(0, 6);

        grid.innerHTML = topMatches.map(item => {
          const op = item.opportunity;
          const title = getLocalized(op.title, lang);
          const desc = getLocalized(op.description, lang);
          const isEligible = item.status === 'ELIGIBLE';

          return `
            <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                  <span class="card-badge ${isEligible ? 'badge-open' : 'badge-closing'}">
                    ${isEligible ? '✓ Eligible' : '⚠ Likely Eligible'}
                  </span>
                  <span style="font-weight: 800; color: var(--primary-cyan); font-size: 0.82rem;">
                    ${item.matchCount}/4 Matched
                  </span>
                </div>

                <h3 style="color: #fff; font-size: 1.15rem; margin-bottom: 0.5rem;">${title}</h3>
                <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1rem;">${desc.substring(0, 100)}...</p>
                
                ${op.prizeAmount ? `<div style="font-size: 0.88rem; font-weight: 800; color: var(--primary-cyan); margin-bottom: 0.8rem;">💰 ${op.prizeAmount}</div>` : ''}
              </div>

              <div style="display: flex; gap: 0.6rem; margin-top: 1rem;">
                <a href="opportunity-details.html?id=${op._id}" class="btn btn-outline" style="flex: 1; padding: 0.5rem; font-size: 0.82rem; justify-content: center;">
                  View Details
                </a>
                <button class="btn btn-primary" style="padding: 0.5rem 0.8rem; font-size: 0.82rem;" onclick="openSaveReminderModal('Opportunity', '${op._id}')">
                  🔖 Save
                </button>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error('Fetch Recommendations Error:', err);
      }
    }

    function openEditProfileModal() {
      const age = prompt('Enter your age:', '21');
      const education = prompt('Enter your highest qualification (10th, 12th, Graduate, Post Graduate, Diploma, ITI):', 'Graduate');
      const state = prompt('Enter your state (e.g. Uttar Pradesh, Madhya Pradesh, Maharashtra, All India):', 'Uttar Pradesh');
      const category = prompt('Enter category (General, OBC, SC, ST, EWS, Women):', 'General');

      if (age && education) {
        fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ age, education, state, category }),
          credentials: 'include'
        }).then(res => res.json()).then(data => {
          if (data.success) {
            alert('Profile updated successfully!');
            loadStudentDashboard();
          }
        });
      }
    }

    document.addEventListener('DOMContentLoaded', loadStudentDashboard);
  </script>
</body>
</html>

`

---

### File 40 of 49
**File Name:** opportunities.html  
**File Path:** /public/opportunities.html  
**Purpose:** Comprehensive opportunity search, type filtering, and category browsing view  

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Opportunities Discovery | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="navbar-placeholder"></div>
  <div id="ticker-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2rem; padding-bottom: 4rem;">
    <!-- Page Header -->
    <div style="margin-bottom: 2rem;">
      <h1 style="color: var(--navy-dark); font-size: 2.4rem; margin-bottom: 0.5rem;" data-i18n="navOpportunities">
        Student Opportunities
      </h1>
      <p style="color: var(--text-muted); font-size: 1.05rem;">
        Discover scholarships, competitive exams, coding hackathons, essay competitions & prize opportunities.
      </p>
    </div>

    <!-- Search & Filter Controls Grid -->
    <div style="display: grid; grid-template-columns: 280px 1fr; gap: 2rem; align-items: start;">
      
      <!-- Filters Sidebar -->
      <div class="glass-panel" style="padding: 1.5rem; position: sticky; top: 90px;">
        <h3 style="color: var(--navy-dark); font-size: 1.1rem; margin-bottom: 1.2rem;">🔍 Filter Opportunities</h3>
        
        <div class="form-group" style="margin-bottom: 1.2rem;">
          <label>Search Keyword</label>
          <input type="text" id="filter-search" class="form-control" placeholder="Search title or keyword..." oninput="loadOpportunities()">
        </div>

        <div class="form-group" style="margin-bottom: 1.2rem;">
          <label>Opportunity Type</label>
          <select id="filter-type" class="form-control" onchange="loadOpportunities()">
            <option value="All">All Opportunity Types</option>
            <option value="Scholarship">Scholarship</option>
            <option value="Hackathon">Coding & Hackathon</option>
            <option value="Quiz Competition">Quiz Competition</option>
            <option value="Essay Competition">Essay Competition</option>
            <option value="Competitive Exam">Competitive Exam</option>
            <option value="Skill Development Program">Skill Program</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 1.2rem;">
          <label>Education</label>
          <select id="filter-education" class="form-control" onchange="loadOpportunities()">
            <option value="Any">Any Qualification</option>
            <option value="10th">10th Pass</option>
            <option value="12th">12th Pass</option>
            <option value="Graduate">Graduate</option>
            <option value="Post Graduate">Post Graduate</option>
            <option value="Diploma">Diploma</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 1.2rem;">
          <label>State</label>
          <select id="filter-state" class="form-control" onchange="loadOpportunities()">
            <option value="All India">All India</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label>Status</label>
          <select id="filter-status" class="form-control" onchange="loadOpportunities()">
            <option value="All">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="CLOSING SOON">Closing Soon</option>
            <option value="UPCOMING">Upcoming</option>
          </select>
        </div>

        <button class="btn btn-outline" style="width: 100%; justify-content: center;" onclick="resetFilters()">Reset Filters</button>
      </div>

      <!-- Opportunities Cards Grid -->
      <div>
        <div id="opportunities-loading" style="text-align: center; padding: 3rem 0; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">✨</div>
          <p data-i18n="loading">Finding the right opportunities for you...</p>
        </div>

        <div id="opportunities-grid" class="cards-grid" style="display: none;">
          <!-- Dynamically Populated -->
        </div>

        <div id="opportunities-empty" style="display: none; text-align: center; padding: 4rem 0;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🎓</div>
          <h3 style="color: #fff; margin-bottom: 0.5rem;">No matching opportunities found</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Try adjusting your filters or search keywords.</p>
          <button class="btn btn-primary" onclick="resetFilters()">Explore All Opportunities</button>
        </div>
      </div>

    </div>
  </main>

  <!-- Modular Scripts -->
  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/eligibility.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    async function loadOpportunities() {
      const loading = document.getElementById('opportunities-loading');
      const grid = document.getElementById('opportunities-grid');
      const empty = document.getElementById('opportunities-empty');

      loading.style.display = 'block';
      grid.style.display = 'none';
      empty.style.display = 'none';

      const search = document.getElementById('filter-search')?.value || '';
      const type = document.getElementById('filter-type')?.value || 'All';
      const education = document.getElementById('filter-education')?.value || 'Any';
      const state = document.getElementById('filter-state')?.value || 'All India';
      const status = document.getElementById('filter-status')?.value || 'All';

      // Parse query string parameters on initial load
      const urlParams = new URLSearchParams(window.location.search);
      const initialType = urlParams.get('type');
      if (initialType && !search && type === 'All') {
        document.getElementById('filter-type').value = initialType;
      }

      try {
        const query = new URLSearchParams({ search, type: document.getElementById('filter-type').value, education, state, status });
        const res = await fetch(`/api/opportunities?${query.toString()}`);
        const data = await res.json();

        loading.style.display = 'none';

        if (!data.success || !data.opportunities || data.opportunities.length === 0) {
          empty.style.display = 'block';
          return;
        }

        const lang = getCurrentLanguage();
        grid.innerHTML = data.opportunities.map(op => {
          const title = getLocalized(op.title, lang);
          const desc = getLocalized(op.description, lang);
          const benefits = getLocalized(op.benefits, lang);
          const lastDateStr = op.lastDate ? new Date(op.lastDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

          let badgeClass = 'badge-open';
          if (op.status === 'CLOSING SOON') badgeClass = 'badge-closing';
          if (op.status === 'UPCOMING') badgeClass = 'badge-upcoming';

          return `
            <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                ${op.publicBannerImage ? `<img src="${op.publicBannerImage}" alt="${title} Banner" class="card-banner-img" onerror="this.style.display='none'">` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                  <span class="card-badge ${badgeClass}">${op.type}</span>
                  <span class="card-badge ${badgeClass}">${op.status}</span>
                </div>
                <h3 class="opportunity-card-title">${title}</h3>
                <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1rem;">${desc.substring(0, 110)}...</p>
                
                ${op.prizeAmount ? `<div style="font-size: 0.9rem; font-weight: 800; color: var(--primary-cyan); margin-bottom: 0.5rem;">💰 ${op.prizeAmount}</div>` : ''}
                
                <div style="font-size: 0.8rem; color: var(--text-subtle); margin-bottom: 1rem;">
                  📅 Last Date: <strong>${lastDateStr}</strong>
                </div>
              </div>

              <div style="display: flex; gap: 0.6rem; margin-top: 1rem;">
                <a href="opportunity-details.html?id=${op._id}" class="btn btn-outline" style="flex: 1; padding: 0.5rem; font-size: 0.82rem; justify-content: center;">
                  ${t('btnViewDetails', lang)}
                </a>
                <button id="save-btn-${op._id}" class="btn btn-primary" style="padding: 0.5rem 0.8rem; font-size: 0.82rem;" onclick="openSaveReminderModal('Opportunity', '${op._id}')">
                  🔖 ${t('btnSave', lang)}
                </button>
              </div>
            </div>
          `;
        }).join('');

        grid.style.display = 'grid';
      } catch (err) {
        console.error('Load Opportunities Error:', err);
        loading.style.display = 'none';
        empty.style.display = 'block';
      }
    }

    function resetFilters() {
      document.getElementById('filter-search').value = '';
      document.getElementById('filter-type').value = 'All';
      document.getElementById('filter-education').value = 'Any';
      document.getElementById('filter-state').value = 'All India';
      document.getElementById('filter-status').value = 'All';
      loadOpportunities();
    }

    document.addEventListener('DOMContentLoaded', loadOpportunities);
  </script>
</body>
</html>

`

---

### File 41 of 49
**File Name:** opportunity-details.html  
**File Path:** /public/opportunity-details.html  
**Purpose:** Detailed opportunity view with banner, eligibility criteria, and apply link  

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Opportunity Details | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="navbar-placeholder"></div>
  <div id="ticker-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem;">
    <div id="details-loading" style="text-align: center; padding: 4rem 0;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">✨</div>
      <p>Loading opportunity details...</p>
    </div>

    <div id="details-container" style="display: none; grid-template-columns: 1fr 340px; gap: 2.5rem; align-items: start;">
      <!-- Main Content Left -->
      <div>
        <div id="detail-banner-box"></div>
        <div style="display: flex; gap: 0.6rem; align-items: center; margin-bottom: 1rem;">
          <span id="detail-type-badge" class="card-badge badge-open">Scholarship</span>
          <span id="detail-status-badge" class="card-badge badge-open">OPEN</span>
        </div>

        <h1 id="detail-title" style="color: var(--navy-dark); font-size: 2.2rem; margin-bottom: 1rem; line-height: 1.3; word-break: break-word; overflow-wrap: break-word;">Opportunity Title</h1>

        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: var(--navy-dark); font-size: 1.2rem; margin-bottom: 0.8rem;">📋 Overview</h3>
          <p id="detail-description" style="color: var(--text-muted); font-size: 1rem; line-height: 1.7; margin: 0;"></p>
        </div>

        <!-- Eligibility Section -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: var(--navy-dark); font-size: 1.2rem; margin-bottom: 1rem;">🎯 Eligibility Criteria</h3>
          <div id="detail-eligibility-box" style="color: var(--text-muted); font-size: 0.95rem;"></div>
        </div>

        <!-- Benefits & Prize -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 0.8rem;">💡 Benefits & Financial Aid</h3>
          <p id="detail-benefits" style="color: var(--primary-cyan); font-weight: 700; font-size: 1.05rem; margin: 0;"></p>
        </div>

        <!-- Documents Required -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 0.8rem;">📁 Required Documents</h3>
          <p id="detail-documents" style="color: var(--text-muted); font-size: 0.95rem; margin: 0;"></p>
        </div>

        <!-- Application Process Steps -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 1rem;">🚀 How to Apply (Step-by-Step)</h3>
          <div id="detail-process-box" style="color: var(--text-muted); font-size: 0.95rem; white-space: pre-line;"></div>
        </div>
      </div>

      <!-- Sticky Right Summary Sidebar -->
      <div class="glass-panel" style="padding: 1.8rem; position: sticky; top: 90px;">
        <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 1.2rem;">Quick Summary</h3>

        <div style="margin-bottom: 1rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.8rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Last Date to Apply</span>
          <div id="detail-last-date" style="font-size: 1.1rem; font-weight: 800; color: #f87171; margin-top: 0.2rem;">-</div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Official Portal</span>
          <div style="font-size: 0.85rem; color: var(--primary-cyan); font-weight: 600; margin-top: 0.2rem; word-break: break-all;" id="detail-url-text">-</div>
        </div>

        <a id="detail-apply-btn" href="#" target="_blank" class="btn btn-primary" style="width: 100%; justify-content: center; margin-bottom: 0.8rem;">
          🚀 Apply Now (Official Portal)
        </a>

        <button id="detail-save-btn" class="btn btn-outline" style="width: 100%; justify-content: center;">
          🔖 Save & Remind Me
        </button>
      </div>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    async function loadOpportunityDetails() {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      if (!id) {
        window.location.href = 'opportunities.html';
        return;
      }

      try {
        const res = await fetch(`/api/opportunities/${id}`);
        const data = await res.json();
        if (!data.success || !data.opportunity) {
          alert('Opportunity not found.');
          window.location.href = 'opportunities.html';
          return;
        }

        const op = data.opportunity;
        const lang = getCurrentLanguage();

        document.getElementById('details-loading').style.display = 'none';
        const container = document.getElementById('details-container');
        container.style.display = 'grid';

        const bannerBox = document.getElementById('detail-banner-box');
        if (op.publicBannerImage) {
          bannerBox.innerHTML = `<img src="${op.publicBannerImage}" alt="${getLocalized(op.title, lang)} Banner" class="detail-banner-img" onerror="this.style.display='none'">`;
        } else {
          bannerBox.innerHTML = '';
        }

        document.getElementById('detail-type-badge').innerText = op.type;
        document.getElementById('detail-status-badge').innerText = op.status;
        document.getElementById('detail-title').innerText = getLocalized(op.title, lang);
        document.getElementById('detail-description').innerText = getLocalized(op.description, lang);
        document.getElementById('detail-benefits').innerText = getLocalized(op.benefits, lang) || op.prizeAmount || 'Financial aid as per program rules.';
        document.getElementById('detail-documents').innerText = getLocalized(op.documents, lang) || 'Identity proof, marksheets, income certificate if applicable.';
        document.getElementById('detail-process-box').innerText = getLocalized(op.applicationProcess, lang) || 'Visit official website and fill application form.';

        // Eligibility breakdown
        const el = op.eligibility || {};
        document.getElementById('detail-eligibility-box').innerHTML = `
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;">
            <li>• Age: <strong>${el.minAge || 0} – ${el.maxAge || 100} Years</strong></li>
            <li>• Qualification: <strong>${(el.education || ['Any']).join(', ')}</strong></li>
            <li>• Eligible States: <strong>${(el.state || ['All India']).join(', ')}</strong></li>
            <li>• Categories: <strong>${(el.category || ['All']).join(', ')}</strong></li>
            ${el.details ? `<li style="margin-top: 0.5rem; color: #fff;">• Note: ${getLocalized(el.details, lang)}</li>` : ''}
          </ul>
        `;

        const lastDateStr = op.lastDate ? new Date(op.lastDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Open';
        document.getElementById('detail-last-date').innerText = lastDateStr;
        document.getElementById('detail-url-text').innerText = op.applyUrl;
        document.getElementById('detail-apply-btn').href = op.applyUrl;

        document.getElementById('detail-save-btn').onclick = () => openSaveReminderModal('Opportunity', op._id);
      } catch (err) {
        console.error('Load Details Error:', err);
      }
    }

    document.addEventListener('DOMContentLoaded', loadOpportunityDetails);
  </script>
</body>
</html>

`

---

### File 42 of 49
**File Name:** schemes.html  
**File Path:** /public/schemes.html  
**Purpose:** Government scheme directory with central/state filters and sector categorization  

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Government Schemes Portal | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="navbar-placeholder"></div>
  <div id="ticker-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2rem; padding-bottom: 4rem;">
    
    <!-- Mandatory Government Disclaimer Banner -->
    <div class="govt-disclaimer-banner">
      <div class="icon">🏛️</div>
      <p data-i18n="govtDisclaimer">
        This platform is an information and discovery portal. It is not an official government website. Always verify eligibility, dates and application details on the official website before applying.
      </p>
    </div>

    <!-- Page Header -->
    <div style="margin-bottom: 2rem;">
      <h1 style="color: var(--navy-dark); font-size: 2.4rem; margin-bottom: 0.5rem;" data-i18n="exploreSchemesTitle">
        Schemes for a Stronger Tomorrow
      </h1>
      <p style="color: var(--text-muted); font-size: 1.05rem;" data-i18n="exploreSchemesSubtext">
        Discover Central and State Government schemes designed to support education, employment, health, housing, skills and more.
      </p>
    </div>

    <!-- Tabs: All / Central / State -->
    <div style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem;">
      <button class="btn btn-outline scheme-tab active" data-gov="All" onclick="selectGovTab(this, 'All')">All Schemes</button>
      <button class="btn btn-outline scheme-tab" data-gov="Central" onclick="selectGovTab(this, 'Central')">Central Schemes</button>
      <button class="btn btn-outline scheme-tab" data-gov="State" onclick="selectGovTab(this, 'State')">State Schemes</button>
    </div>

    <!-- Filter Grid -->
    <div style="display: grid; grid-template-columns: 280px 1fr; gap: 2rem; align-items: start;">
      
      <div class="glass-panel" style="padding: 1.5rem; position: sticky; top: 90px;">
        <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 1.2rem;">🏛️ Sector Filters</h3>
        
        <div class="form-group" style="margin-bottom: 1.2rem;">
          <label>Search Scheme</label>
          <input type="text" id="scheme-search" class="form-control" placeholder="Scheme name..." oninput="loadSchemes()">
        </div>

        <div class="form-group" style="margin-bottom: 1.2rem;">
          <label>Sector / Category</label>
          <select id="scheme-sector" class="form-control" onchange="loadSchemes()">
            <option value="All">All Sectors</option>
            <option value="Education">Education</option>
            <option value="Employment">Employment</option>
            <option value="Women">Women</option>
            <option value="Farmers">Farmers</option>
            <option value="Health">Health</option>
            <option value="Housing">Housing</option>
            <option value="Skill Development">Skill Development</option>
            <option value="Financial Assistance">Financial Assistance</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label>State Filter</label>
          <select id="scheme-state" class="form-control" onchange="loadSchemes()">
            <option value="All India">All India / All States</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi</option>
          </select>
        </div>

        <button class="btn btn-outline" style="width: 100%; justify-content: center;" onclick="resetSchemeFilters()">Reset Filters</button>
      </div>

      <!-- Schemes Grid -->
      <div>
        <div id="schemes-loading" style="text-align: center; padding: 3rem 0; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">🏛️</div>
          <p>Fetching government schemes...</p>
        </div>

        <div id="schemes-grid" class="cards-grid" style="display: none;">
          <!-- Dynamically Populated -->
        </div>

        <div id="schemes-empty" style="display: none; text-align: center; padding: 4rem 0;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🏛️</div>
          <h3 style="color: #fff; margin-bottom: 0.5rem;">No matching government schemes found</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Try adjusting your sector or state filters.</p>
          <button class="btn btn-scheme" onclick="resetSchemeFilters()">View All Schemes</button>
        </div>
      </div>

    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    let currentGovType = 'All';

    function selectGovTab(btn, govType) {
      document.querySelectorAll('.scheme-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGovType = govType;
      loadSchemes();
    }

    async function loadSchemes() {
      const loading = document.getElementById('schemes-loading');
      const grid = document.getElementById('schemes-grid');
      const empty = document.getElementById('schemes-empty');

      loading.style.display = 'block';
      grid.style.display = 'none';
      empty.style.display = 'none';

      const search = document.getElementById('scheme-search')?.value || '';
      const sector = document.getElementById('scheme-sector')?.value || 'All';
      const stateName = document.getElementById('scheme-state')?.value || 'All India';

      try {
        const query = new URLSearchParams({ search, sector, governmentType: currentGovType, stateName });
        const res = await fetch(`/api/schemes?${query.toString()}`);
        const data = await res.json();

        loading.style.display = 'none';

        if (!data.success || !data.schemes || data.schemes.length === 0) {
          empty.style.display = 'block';
          return;
        }

        const lang = getCurrentLanguage();
        grid.innerHTML = data.schemes.map(sch => {
          const title = getLocalized(sch.title, lang);
          const desc = getLocalized(sch.description, lang);
          const benefits = getLocalized(sch.benefits, lang);

          return `
            <div class="glass-card scheme-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                  <span class="card-badge badge-scheme">🏛️ ${sch.governmentType} Scheme</span>
                  <span style="font-size: 0.8rem; color: var(--scheme-amber); font-weight: 700;">📍 ${sch.stateName}</span>
                </div>
                <h3 style="color: #fff; font-size: 1.15rem; margin-bottom: 0.5rem;">${title}</h3>
                <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1rem;">${desc.substring(0, 110)}...</p>

                ${benefits ? `<div style="font-size: 0.85rem; font-weight: 700; color: var(--scheme-amber); margin-bottom: 1rem;">💡 ${benefits}</div>` : ''}
              </div>

              <div style="display: flex; gap: 0.6rem; margin-top: 1rem;">
                <a href="scheme-details.html?id=${sch._id}" class="btn btn-outline" style="flex: 1; padding: 0.5rem; font-size: 0.82rem; justify-content: center;">
                  ${t('btnViewDetails', lang)}
                </a>
                <button id="save-btn-${sch._id}" class="btn btn-scheme" style="padding: 0.5rem 0.8rem; font-size: 0.82rem;" onclick="openSaveReminderModal('Scheme', '${sch._id}')">
                  🔖 ${t('btnSave', lang)}
                </button>
              </div>
            </div>
          `;
        }).join('');

        grid.style.display = 'grid';
      } catch (err) {
        console.error('Load Schemes Error:', err);
        loading.style.display = 'none';
        empty.style.display = 'block';
      }
    }

    function resetSchemeFilters() {
      document.getElementById('scheme-search').value = '';
      document.getElementById('scheme-sector').value = 'All';
      document.getElementById('scheme-state').value = 'All India';
      currentGovType = 'All';
      document.querySelectorAll('.scheme-tab').forEach(b => b.classList.remove('active'));
      document.querySelector('.scheme-tab[data-gov="All"]').classList.add('active');
      loadSchemes();
    }

    document.addEventListener('DOMContentLoaded', loadSchemes);
  </script>
</body>
</html>

`

---

### File 43 of 49
**File Name:** scheme-details.html  
**File Path:** /public/scheme-details.html  
**Purpose:** Government scheme detailed view with benefits and portal application steps  

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Government Scheme Details | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="navbar-placeholder"></div>
  <div id="ticker-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2rem; padding-bottom: 5rem;">
    
    <!-- Mandatory Government Disclaimer Banner -->
    <div class="govt-disclaimer-banner">
      <div class="icon">🏛️</div>
      <p data-i18n="govtDisclaimer">
        This platform is an information and discovery portal. It is not an official government website. Always verify eligibility, dates and application details on the official website before applying.
      </p>
    </div>

    <div id="scheme-details-loading" style="text-align: center; padding: 4rem 0;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🏛️</div>
      <p>Loading scheme details...</p>
    </div>

    <div id="scheme-details-container" style="display: none; grid-template-columns: 1fr 340px; gap: 2.5rem; align-items: start;">
      <!-- Main Content Left -->
      <div>
        <div style="display: flex; gap: 0.6rem; align-items: center; margin-bottom: 1rem;">
          <span id="scheme-gov-badge" class="card-badge badge-scheme">Central Scheme</span>
          <span id="scheme-state-badge" style="font-size: 0.82rem; color: var(--scheme-amber); font-weight: 700;">📍 All India</span>
        </div>

        <h1 id="scheme-title" style="color: var(--navy-dark); font-size: 2.2rem; margin-bottom: 1rem;">Government Scheme Title</h1>

        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: var(--navy-dark); font-size: 1.2rem; margin-bottom: 0.8rem;">📋 Overview</h3>
          <p id="scheme-description" style="color: var(--text-muted); font-size: 1rem; line-height: 1.7; margin: 0;"></p>
        </div>

        <!-- Eligibility Section -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 1rem;">🎯 Target Audience & Eligibility</h3>
          <div id="scheme-eligibility-box" style="color: var(--text-muted); font-size: 0.95rem;"></div>
        </div>

        <!-- Benefits -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 0.8rem;">💡 Key Scheme Benefits</h3>
          <p id="scheme-benefits" style="color: var(--scheme-amber); font-weight: 700; font-size: 1.05rem; margin: 0;"></p>
        </div>

        <!-- Required Documents -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 0.8rem;">📁 Required Documents</h3>
          <p id="scheme-documents" style="color: var(--text-muted); font-size: 0.95rem; margin: 0;"></p>
        </div>

        <!-- Application Process -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 1rem;">🚀 Official Application Process</h3>
          <div id="scheme-process-box" style="color: var(--text-muted); font-size: 0.95rem; white-space: pre-line;"></div>
        </div>
      </div>

      <!-- Sticky Right Summary Sidebar -->
      <div class="glass-panel" style="padding: 1.8rem; position: sticky; top: 90px; border-color: var(--border-scheme-glow);">
        <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 1.2rem;">Scheme Summary</h3>

        <div style="margin-bottom: 1rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.8rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Sector</span>
          <div id="scheme-sector-text" style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-top: 0.2rem;">-</div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Official Portal Link</span>
          <div style="font-size: 0.85rem; color: var(--scheme-amber); font-weight: 600; margin-top: 0.2rem; word-break: break-all;" id="scheme-url-text">-</div>
        </div>

        <a id="scheme-apply-btn" href="#" target="_blank" class="btn btn-scheme" style="width: 100%; justify-content: center; margin-bottom: 0.8rem;">
          🏛️ Visit Official Govt Portal →
        </a>

        <button id="scheme-save-btn" class="btn btn-outline" style="width: 100%; justify-content: center;">
          🔖 Save Scheme & Remind Me
        </button>
      </div>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    async function loadSchemeDetails() {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      if (!id) {
        window.location.href = 'schemes.html';
        return;
      }

      try {
        const res = await fetch(`/api/schemes/${id}`);
        const data = await res.json();
        if (!data.success || !data.scheme) {
          alert('Government scheme not found.');
          window.location.href = 'schemes.html';
          return;
        }

        const sch = data.scheme;
        const lang = getCurrentLanguage();

        document.getElementById('scheme-details-loading').style.display = 'none';
        const container = document.getElementById('scheme-details-container');
        container.style.display = 'grid';

        document.getElementById('scheme-gov-badge').innerText = `${sch.governmentType} Scheme`;
        document.getElementById('scheme-state-badge').innerText = `📍 ${sch.stateName}`;
        document.getElementById('scheme-title').innerText = getLocalized(sch.title, lang);
        document.getElementById('scheme-description').innerText = getLocalized(sch.description, lang);
        document.getElementById('scheme-benefits').innerText = getLocalized(sch.benefits, lang) || 'Government subsidies and assistance.';
        document.getElementById('scheme-documents').innerText = getLocalized(sch.documents, lang) || 'Aadhar card, Domicile certificate, Income certificate.';
        document.getElementById('scheme-process-box').innerText = getLocalized(sch.applicationProcess, lang) || 'Apply online on the official portal.';
        document.getElementById('scheme-sector-text').innerText = sch.sector;

        document.getElementById('scheme-url-text').innerText = sch.applyUrl;
        document.getElementById('scheme-apply-btn').href = sch.applyUrl;

        document.getElementById('scheme-save-btn').onclick = () => openSaveReminderModal('Scheme', sch._id);
      } catch (err) {
        console.error('Load Scheme Details Error:', err);
      }
    }

    document.addEventListener('DOMContentLoaded', loadSchemeDetails);
  </script>
</body>
</html>

`

---

### File 44 of 49
**File Name:** saved-opportunities.html  
**File Path:** /public/saved-opportunities.html  
**Purpose:** Student bookmarked opportunities and upcoming deadline tracker  

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Saved Opportunities & Reminders | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="navbar-placeholder"></div>
  <div id="ticker-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem;">
    <div style="margin-bottom: 2rem;">
      <h1 style="color: #fff; font-size: 2.2rem; margin-bottom: 0.5rem;" data-i18n="navSaved">Saved Items</h1>
      <p style="color: var(--text-muted); font-size: 1rem;">
        Track your bookmarked student opportunities and government schemes with active deadline reminders.
      </p>
    </div>

    <div id="saved-loading" style="text-align: center; padding: 3rem 0; color: var(--text-muted);">
      <div style="font-size: 2.5rem; margin-bottom: 1rem;">🔖</div>
      <p>Loading your saved items...</p>
    </div>

    <div id="saved-grid" class="cards-grid" style="display: none;">
      <!-- Dynamically Populated -->
    </div>

    <div id="saved-empty" style="display: none; text-align: center; padding: 4rem 0;">
      <div style="font-size: 3.5rem; margin-bottom: 1rem;">🔖</div>
      <h3 style="color: #fff; margin-bottom: 0.5rem;">No saved items yet</h3>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Explore scholarships and government schemes and click Save to set deadline reminders.</p>
      <a href="opportunities.html" class="btn btn-primary">Browse Opportunities →</a>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    async function loadSavedItems() {
      const userStr = localStorage.getItem('dishasetu_user');
      if (!userStr) {
        window.location.href = 'login.html';
        return;
      }

      const loading = document.getElementById('saved-loading');
      const grid = document.getElementById('saved-grid');
      const empty = document.getElementById('saved-empty');

      try {
        const res = await fetch('/api/saved', { credentials: 'include' });
        const data = await res.json();

        loading.style.display = 'none';

        if (!data.success || !data.savedItems || data.savedItems.length === 0) {
          empty.style.display = 'block';
          return;
        }

        const lang = getCurrentLanguage();
        grid.innerHTML = data.savedItems.map(saved => {
          const item = saved.opportunityId || saved.schemeId;
          if (!item) return '';

          const isOpp = saved.itemType === 'Opportunity';
          const title = getLocalized(item.title, lang);
          const lastDateStr = item.lastDate ? new Date(item.lastDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
          const detailsUrl = isOpp ? `opportunity-details.html?id=${item._id}` : `scheme-details.html?id=${item._id}`;

          let prefLabel = '🔕 No reminder set';
          if (saved.reminderPreference === '7_days') prefLabel = '🔔 Reminder set: 7 days before';
          if (saved.reminderPreference === '3_days') prefLabel = '🔔 Reminder set: 3 days before';
          if (saved.reminderPreference === '1_day') prefLabel = '🔔 Reminder set: 1 day before';
          if (saved.reminderPreference === 'deadline_day') prefLabel = '🔔 Reminder set: On deadline day';

          return `
            <div class="glass-card ${!isOpp ? 'scheme-card' : ''}" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                  <span class="card-badge ${isOpp ? 'badge-open' : 'badge-scheme'}">${saved.itemType}</span>
                  <span style="font-size: 0.8rem; color: var(--text-muted);">Saved ${new Date(saved.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 style="color: #fff; font-size: 1.15rem; margin-bottom: 0.5rem;">${title}</h3>
                
                <div style="font-size: 0.85rem; color: var(--primary-cyan); font-weight: 700; margin-bottom: 0.8rem;">
                  📅 Deadline: ${lastDateStr}
                </div>

                <div style="background: rgba(255,255,255,0.05); padding: 0.5rem 0.8rem; border-radius: var(--radius-sm); font-size: 0.82rem; color: #fef3c7; margin-bottom: 1.2rem;">
                  ${prefLabel}
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <a href="${item.applyUrl}" target="_blank" class="btn ${isOpp ? 'btn-primary' : 'btn-scheme'}" style="justify-content: center; padding: 0.5rem;">
                  🚀 Apply Now (Official Portal)
                </a>
                <div style="display: flex; gap: 0.5rem;">
                  <a href="${detailsUrl}" class="btn btn-outline" style="flex:1; justify-content: center; padding: 0.4rem; font-size: 0.8rem;">
                    View Details
                  </a>
                  <button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; color: #f87171;" onclick="removeSavedRecord('${saved._id}')">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');

        grid.style.display = 'grid';
      } catch (err) {
        console.error('Load Saved Items Error:', err);
        loading.style.display = 'none';
        empty.style.display = 'block';
      }
    }

    async function removeSavedRecord(id) {
      if (!confirm('Are you sure you want to remove this item from your saved list?')) return;
      try {
        const res = await fetch(`/api/saved/${id}`, { method: 'DELETE', credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          loadSavedItems();
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error('Remove Error:', err);
      }
    }

    document.addEventListener('DOMContentLoaded', loadSavedItems);
  </script>
</body>
</html>

`

---

### File 45 of 49
**File Name:** submit-opportunity.html  
**File Path:** /public/submit-opportunity.html  
**Purpose:** Student community contribution form with dual-image upload (proof & banner)  

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Submit an Opportunity | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .form-group {
      margin-bottom: 1.2rem;
    }
    .form-label {
      display: block;
      color: #e2e8f0;
      font-size: 0.88rem;
      margin-bottom: 0.4rem;
      font-weight: 500;
    }
    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-light);
      border-radius: 8px;
      color: #fff;
      font-size: 0.92rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: var(--primary-cyan);
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
    }
    .file-dropzone {
      border: 2px dashed rgba(6, 182, 212, 0.4);
      background: rgba(6, 182, 212, 0.05);
      border-radius: 12px;
      padding: 1.8rem;
      text-align: center;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .file-dropzone:hover {
      background: rgba(6, 182, 212, 0.1);
      border-color: var(--primary-cyan);
    }
    .req-star {
      color: #f87171;
    }
  </style>
</head>
<body>
  <div id="navbar-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem; max-width: 850px;">
    <!-- Page Title -->
    <div style="margin-bottom: 2rem; text-align: center;">
      <span class="card-badge badge-open" style="margin-bottom: 0.5rem; display: inline-block;">Community Contribution</span>
      <h1 style="color: #fff; font-size: 2.2rem; font-weight: 800; margin-bottom: 0.4rem;">Submit an Opportunity or Scheme</h1>
      <p style="color: var(--text-muted); font-size: 0.98rem; max-width: 650px; margin: 0 auto;">
        Discovered a new scholarship, hackathon, government scheme, or exam? Submit it here with proof or official document so our verification team can approve and share it with thousands of students!
      </p>
    </div>

    <!-- Submission Form Container -->
    <div class="glass-panel" style="padding: 2.2rem;">
      <div id="alert-box" style="display: none; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.9rem;"></div>

      <form id="submission-form" enctype="multipart/form-data">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.2rem;">
          
          <!-- Category Type -->
          <div class="form-group">
            <label class="form-label">Category Type <span class="req-star">*</span></label>
            <select name="categoryType" class="form-select" required id="categoryTypeSelect">
              <option value="Opportunity">Student Opportunity (Scholarship / Hackathon / Exam / Quiz / Internship)</option>
              <option value="Government Scheme">Government Scheme (Central / State Welfare Scheme)</option>
            </select>
          </div>

          <!-- Specific Type -->
          <div class="form-group">
            <label class="form-label">Sub-Category / Program Type <span class="req-star">*</span></label>
            <select name="type" class="form-select" required id="typeSelect">
              <option value="Scholarship">🎓 Scholarship</option>
              <option value="Government Scheme">🏛️ Government Scheme</option>
              <option value="Hackathon">💻 Hackathon</option>
              <option value="Coding Competition">💻 Coding Competition</option>
              <option value="Quiz Competition">🏆 Quiz Competition</option>
              <option value="GK / GS Competition">📚 GK / GS Competition</option>
              <option value="Essay Competition">✍️ Essay Competition</option>
              <option value="Competitive Exam">📝 Competitive Exam</option>
              <option value="Skill Development Program">⚙️ Skill Development Program</option>
              <option value="Prize Opportunity">🎁 Prize-Based Opportunity</option>
              <option value="Internship">💼 Internship / Student Role</option>
              <option value="Other">✨ Other Student Program</option>
            </select>
          </div>

        </div>

        <!-- Opportunity Title -->
        <div class="form-group">
          <label class="form-label">Opportunity / Scheme Title <span class="req-star">*</span></label>
          <input type="text" name="title" class="form-input" placeholder="e.g. National Merit Scholarship Scheme 2026 or Smart India Hackathon" required>
        </div>

        <!-- Organization / Authority -->
        <div class="form-group">
          <label class="form-label">Organization / Conducting Authority</label>
          <input type="text" name="organization" class="form-input" placeholder="e.g. Ministry of Education, AICTE, ISRO, Tata Trusts, Google">
        </div>

        <!-- Verification Source Link (MANDATORY) -->
        <div class="form-group">
          <label class="form-label">Official Source URL / Portal Link <span class="req-star">*</span></label>
          <input type="url" name="sourceUrl" class="form-input" placeholder="https://scholarships.gov.in or https://official-notice-url.org" required>
          <span style="font-size: 0.78rem; color: var(--text-muted); display: block; margin-top: 0.3rem;">Must be a valid official website or news link where our team can verify the authenticity.</span>
        </div>

        <!-- Section Header for Image Uploads -->
        <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-light); padding: 1.2rem; border-radius: 10px; margin-bottom: 1.5rem;">
          <h4 style="color: var(--primary-cyan); margin-bottom: 0.4rem; font-size: 1rem;">📷 Opportunity Image Uploads</h4>
          <p style="color: var(--text-muted); font-size: 0.82rem; margin-bottom: 1rem;">Upload two separate files: a private verification document for Admin inspection, and a public poster banner for student display.</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.2rem;">
            
            <!-- 1. Private Verification / Proof Image (MANDATORY) -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 700;">1. Verification / Proof Image <span class="req-star">*</span></label>
              <span style="font-size: 0.76rem; color: #facc15; display: block; margin-bottom: 0.5rem;">🔒 Private — visible ONLY to Admin for verification.</span>
              
              <div class="file-dropzone" onclick="document.getElementById('proofFileInput').click()">
                <div style="font-size: 2rem; margin-bottom: 0.2rem;">📄</div>
                <div style="color: var(--primary-cyan); font-weight: 600; font-size: 0.88rem;" id="proofFileLabel">Click to select Official Notice / Circular / Proof</div>
                <div style="color: var(--text-muted); font-size: 0.76rem; margin-top: 0.2rem;">PDF, JPG, PNG, WEBP (Max 15MB)</div>
              </div>
              <input type="file" id="proofFileInput" name="verificationImage" accept=".pdf,.jpg,.jpeg,.png,.webp" style="display: none;" required onchange="updateProofPreview(this)">
              <div id="proofPreviewBox" style="display: none; margin-top: 0.5rem; text-align: center;"></div>
            </div>

            <!-- 2. Public Opportunity Banner / Poster (PUBLIC) -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 700;">2. Opportunity Banner / Poster</label>
              <span style="font-size: 0.76rem; color: #4ade80; display: block; margin-bottom: 0.5rem;">🌐 Public — displayed on DishaSetu website after approval.</span>
              
              <div class="file-dropzone" onclick="document.getElementById('bannerFileInput').click()" style="border-color: rgba(74, 222, 128, 0.4); background: rgba(74, 222, 128, 0.05);">
                <div style="font-size: 2rem; margin-bottom: 0.2rem;">🖼️</div>
                <div style="color: #4ade80; font-weight: 600; font-size: 0.88rem;" id="bannerFileLabel">Click to select Event Poster / Banner Image</div>
                <div style="color: var(--text-muted); font-size: 0.76rem; margin-top: 0.2rem;">JPG, PNG, WEBP (Max 15MB)</div>
              </div>
              <input type="file" id="bannerFileInput" name="publicBannerImage" accept=".jpg,.jpeg,.png,.webp" style="display: none;" onchange="updateBannerPreview(this)">
              <div id="bannerPreviewBox" style="display: none; margin-top: 0.5rem; text-align: center;"></div>
            </div>

          </div>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label class="form-label">Description & Overview</label>
          <textarea name="description" class="form-textarea" rows="3" placeholder="Brief details about what this opportunity is, target audience, and key highlights..."></textarea>
        </div>

        <!-- Eligibility Grid -->
        <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-light); padding: 1.2rem; border-radius: 10px; margin-bottom: 1.5rem;">
          <h4 style="color: var(--primary-cyan); margin-bottom: 0.8rem; font-size: 0.95rem;">🎯 Eligibility Criteria</h4>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div>
              <label class="form-label">Min Age (Years)</label>
              <input type="number" name="minAge" class="form-input" value="0" min="0" max="100">
            </div>

            <div>
              <label class="form-label">Max Age (Years)</label>
              <input type="number" name="maxAge" class="form-input" value="100" min="0" max="100">
            </div>

            <div>
              <label class="form-label">Applicable State</label>
              <select name="stateSelect" class="form-select" id="stateSelect">
                <option value="All India">All India</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Bihar">Bihar</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Other State">Other State</option>
              </select>
            </div>
          </div>

          <div style="margin-top: 1rem;">
            <label class="form-label">Education Qualification</label>
            <select name="educationSelect" class="form-select" id="educationSelect">
              <option value="Graduate">Graduate / Pursuing Degree</option>
              <option value="10th">10th Pass</option>
              <option value="12th">12th Pass</option>
              <option value="Post Graduate">Post Graduate / Master</option>
              <option value="Diploma">Diploma / ITI</option>
              <option value="PhD">PhD / Researcher</option>
              <option value="Any">Any Qualification</option>
            </select>
          </div>
        </div>

        <!-- Last Date & Application Link -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.2rem;">
          <div class="form-group">
            <label class="form-label">Last Application Deadline <span class="req-star">*</span></label>
            <input type="date" name="lastDate" class="form-input" required id="lastDateInput">
          </div>

          <div class="form-group">
            <label class="form-label">Direct Application Form Link</label>
            <input type="url" name="applyUrl" class="form-input" placeholder="https://apply-link.com (Optional)">
          </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.9rem; font-size: 1.05rem; margin-top: 1rem;" id="submitBtn">
          🚀 Submit Opportunity for Verification
        </button>
      </form>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  
  <script>
    // Pre-set min date to today
    document.getElementById('lastDateInput').min = new Date().toISOString().split('T')[0];

    function updateProofPreview(input) {
      const label = document.getElementById('proofFileLabel');
      const previewBox = document.getElementById('proofPreviewBox');
      if (input.files && input.files[0]) {
        const file = input.files[0];
        label.innerHTML = `✅ Verification Proof Selected: <strong>${file.name}</strong> (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            previewBox.style.display = 'block';
            previewBox.innerHTML = `<img src="${e.target.result}" alt="Proof Preview" style="max-height: 110px; border-radius: 8px; border: 1px solid var(--border-light); margin-top: 0.4rem;">`;
          };
          reader.readAsDataURL(file);
        } else {
          previewBox.style.display = 'none';
        }
      } else {
        label.innerText = 'Click to select Official Notice / Circular / Proof';
        previewBox.style.display = 'none';
      }
    }

    function updateBannerPreview(input) {
      const label = document.getElementById('bannerFileLabel');
      const previewBox = document.getElementById('bannerPreviewBox');
      if (input.files && input.files[0]) {
        const file = input.files[0];
        label.innerHTML = `✅ Public Banner Selected: <strong>${file.name}</strong> (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            previewBox.style.display = 'block';
            previewBox.innerHTML = `<img src="${e.target.result}" alt="Banner Preview" style="max-height: 120px; width: 100%; object-fit: cover; border-radius: 8px; border: 1px solid #4ade80; margin-top: 0.4rem;">`;
          };
          reader.readAsDataURL(file);
        } else {
          previewBox.style.display = 'none';
        }
      } else {
        label.innerText = 'Click to select Event Poster / Banner Image';
        previewBox.style.display = 'none';
      }
    }

    document.getElementById('submission-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const alertBox = document.getElementById('alert-box');
      const submitBtn = document.getElementById('submitBtn');

      // Check user login state
      const storedUser = localStorage.getItem('dishasetu_user');
      if (!storedUser) {
        alertBox.style.display = 'block';
        alertBox.style.background = 'rgba(239, 68, 68, 0.2)';
        alertBox.style.border = '1px solid #ef4444';
        alertBox.style.color = '#fca5a5';
        alertBox.innerText = '⚠️ Please log in first to submit opportunities.';
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
      }

      const form = e.target;
      const formData = new FormData(form);

      // Append education & state array
      const eduVal = document.getElementById('educationSelect').value;
      const stateVal = document.getElementById('stateSelect').value;
      formData.set('education', JSON.stringify([eduVal]));
      formData.set('state', JSON.stringify([stateVal]));

      submitBtn.disabled = true;
      submitBtn.innerText = '⏳ Uploading proof and submitting...';

      try {
        const res = await fetch('/api/submissions', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        const data = await res.json();
        if (data.success) {
          alertBox.style.display = 'block';
          alertBox.style.background = 'rgba(34, 197, 94, 0.2)';
          alertBox.style.border = '1px solid #22c55e';
          alertBox.style.color = '#86efac';
          alertBox.innerText = '🎉 ' + data.message;
          form.reset();
          document.getElementById('proofFileLabel').innerText = 'Click to select Official Notice / Circular / Proof';
          document.getElementById('bannerFileLabel').innerText = 'Click to select Event Poster / Banner Image';
          document.getElementById('proofPreviewBox').style.display = 'none';
          document.getElementById('bannerPreviewBox').style.display = 'none';
          
          setTimeout(() => {
            window.location.href = 'my-submissions.html';
          }, 2000);
        } else {
          alertBox.style.display = 'block';
          alertBox.style.background = 'rgba(239, 68, 68, 0.2)';
          alertBox.style.border = '1px solid #ef4444';
          alertBox.style.color = '#fca5a5';
          alertBox.innerText = '❌ ' + (data.message || 'Submission failed. Please check form inputs.');
        }
      } catch (err) {
        console.error('Submission Error:', err);
        alertBox.style.display = 'block';
        alertBox.style.background = 'rgba(239, 68, 68, 0.2)';
        alertBox.style.border = '1px solid #ef4444';
        alertBox.style.color = '#fca5a5';
        alertBox.innerText = '❌ ' + (err.message || 'Error processing upload. Please check network connection and try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = '🚀 Submit Opportunity for Verification';
      }
    });
  </script>
</body>
</html>

`

---

### File 46 of 49
**File Name:** my-submissions.html  
**File Path:** /public/my-submissions.html  
**Purpose:** Student portal for tracking submitted opportunities and admin verification status  

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Submissions | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .status-badge {
      display: inline-block;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-pending { background: rgba(234, 179, 8, 0.18); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); }
    .status-under-review { background: rgba(59, 130, 246, 0.18); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
    .status-changes-requested { background: rgba(249, 115, 22, 0.18); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.4); }
    .status-approved { background: rgba(34, 197, 94, 0.18); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); }
    .status-rejected { background: rgba(239, 68, 68, 0.18); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }

    .submission-card {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.2rem;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .submission-card:hover {
      border-color: var(--primary-cyan);
      box-shadow: 0 4px 20px rgba(6, 182, 212, 0.15);
    }
  </style>
</head>
<body>
  <div id="navbar-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem;">
    <!-- Page Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <span class="card-badge badge-open" style="margin-bottom: 0.4rem;">Student Submissions Portal</span>
        <h1 style="color: #fff; font-size: 2rem; font-weight: 800; margin-bottom: 0.2rem;">My Opportunity Submissions</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0;">Track verification status and admin feedback for your submitted opportunities and schemes.</p>
      </div>

      <a href="submit-opportunity.html" class="btn btn-primary" style="padding: 0.65rem 1.3rem;">
        + Submit New Opportunity
      </a>
    </div>

    <!-- Submissions Summary Stats -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.2rem; margin-bottom: 2rem;">
      <div class="glass-panel" style="padding: 1.2rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Total Submitted</div>
        <div id="stat-total" style="font-size: 2rem; font-weight: 800; color: var(--primary-cyan); margin-top: 0.2rem;">0</div>
      </div>
      <div class="glass-panel" style="padding: 1.2rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Pending Review</div>
        <div id="stat-pending" style="font-size: 2rem; font-weight: 800; color: #facc15; margin-top: 0.2rem;">0</div>
      </div>
      <div class="glass-panel" style="padding: 1.2rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Approved & Live</div>
        <div id="stat-approved" style="font-size: 2rem; font-weight: 800; color: #4ade80; margin-top: 0.2rem;">0</div>
      </div>
    </div>

    <!-- Submissions List -->
    <div id="submissions-container">
      <div style="text-align: center; color: var(--text-muted); padding: 3rem 0;">
        ⏳ Loading your submitted opportunities...
      </div>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>

  <script>
    async function loadMySubmissions() {
      const container = document.getElementById('submissions-container');
      const userStr = localStorage.getItem('dishasetu_user');

      if (!userStr) {
        container.innerHTML = `
          <div class="glass-panel" style="padding: 3rem; text-align: center;">
            <h3 style="color:#fff; margin-bottom:0.8rem;">🔒 Login Required</h3>
            <p style="color:var(--text-muted); margin-bottom:1.5rem;">Please log in to view your submitted opportunities and status.</p>
            <a href="login.html" class="btn btn-primary">Go to Login Page</a>
          </div>
        `;
        return;
      }

      try {
        const res = await fetch('/api/submissions/my', { credentials: 'include' });
        const data = await res.json();

        if (!data.success) {
          container.innerHTML = `<div style="color:#f87171; text-align:center;">Error: ${data.message}</div>`;
          return;
        }

        const items = data.data || [];

        // Update counts
        document.getElementById('stat-total').innerText = items.length;
        document.getElementById('stat-pending').innerText = items.filter(i => i.status === 'Pending Review' || i.status === 'Under Review').length;
        document.getElementById('stat-approved').innerText = items.filter(i => i.status === 'Approved').length;

        if (items.length === 0) {
          container.innerHTML = `
            <div class="glass-panel" style="padding: 3rem; text-align: center;">
              <div style="font-size: 3rem; margin-bottom: 0.8rem;">📤</div>
              <h3 style="color: #fff; margin-bottom: 0.5rem;">No Submissions Yet</h3>
              <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Have you found a scholarship or government scheme? Share it to help fellow students.</p>
              <a href="submit-opportunity.html" class="btn btn-primary">+ Submit First Opportunity</a>
            </div>
          `;
          return;
        }

        container.innerHTML = items.map(sub => {
          let badgeClass = 'status-pending';
          if (sub.status === 'Under Review') badgeClass = 'status-under-review';
          if (sub.status === 'Changes Requested') badgeClass = 'status-changes-requested';
          if (sub.status === 'Approved') badgeClass = 'status-approved';
          if (sub.status === 'Rejected') badgeClass = 'status-rejected';

          const formattedDate = new Date(sub.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric'
          });
          const lastDateStr = new Date(sub.lastDate).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric'
          });

          return `
            <div class="submission-card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.8rem;">
                <div>
                  <span class="status-badge ${badgeClass}">${sub.status}</span>
                  <span style="font-size: 0.8rem; color: var(--primary-cyan); font-weight: 600; margin-left: 0.5rem;">[${sub.type}]</span>
                  <h3 style="color: #fff; font-size: 1.25rem; margin-top: 0.4rem; margin-bottom: 0.2rem;">${sub.title}</h3>
                  <div style="color: var(--text-muted); font-size: 0.85rem;">
                    ${sub.organization ? `🏢 ${sub.organization} • ` : ''}Submitted on ${formattedDate}
                  </div>
                </div>

                <div style="text-align: right;">
                  <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">Deadline</span>
                  <strong style="color: #f87171; font-size: 0.95rem;">${lastDateStr}</strong>
                </div>
              </div>

              ${sub.description ? `<p style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 1rem; line-height: 1.5;">${sub.description}</p>` : ''}

              <!-- Source Link & Proof Badge -->
              <div style="display: flex; gap: 0.8rem; flex-wrap: wrap; margin-bottom: 1rem; font-size: 0.82rem;">
                <a href="${sub.sourceUrl}" target="_blank" rel="noopener" style="color: var(--primary-cyan); text-decoration: underline;">
                  🔗 Source Link
                </a>
                <a href="${sub.proofUrl}" target="_blank" rel="noopener" style="color: #4ade80; text-decoration: underline;">
                  📄 View Uploaded Proof (${sub.proofOriginalName || 'Document'})
                </a>
              </div>

              <!-- Admin Feedback Section -->
              ${sub.adminFeedback ? `
                <div style="background: rgba(15, 23, 42, 0.7); border-left: 3px solid var(--primary-cyan); padding: 0.8rem 1rem; border-radius: 6px; margin-top: 0.8rem;">
                  <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">💬 Admin Feedback Note</div>
                  <div style="color: #e2e8f0; font-size: 0.88rem; margin-top: 0.2rem;">"${sub.adminFeedback}"</div>
                </div>
              ` : ''}

              ${sub.status === 'Approved' ? `
                <div style="margin-top: 0.8rem; color: #4ade80; font-size: 0.85rem; font-weight: 600;">
                  ✨ Approved & published live on the public DishaSetu opportunity feed!
                </div>
              ` : ''}
            </div>
          `;
        }).join('');

      } catch (err) {
        console.error('Fetch My Submissions Error:', err);
        container.innerHTML = `<div style="color:#f87171; text-align:center;">Failed to connect to backend server.</div>`;
      }
    }

    document.addEventListener('DOMContentLoaded', loadMySubmissions);
  </script>
</body>
</html>

`

---

### File 47 of 49
**File Name:** admin-dashboard.html  
**File Path:** /public/admin-dashboard.html  
**Purpose:** Admin control center with live database statistics and opportunity CRUD table  

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="navbar-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem;">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <span class="card-badge badge-closing" style="margin-bottom: 0.4rem;">Admin Control Console</span>
        <h1 style="color: #fff; font-size: 2rem; font-weight: 800; margin-bottom: 0.2rem;">DishaSetu Administration</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0;">Manage student opportunities, government schemes, student submissions, and student directory.</p>
      </div>

      <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
        <a href="admin-submissions.html" class="btn btn-outline" style="border-color: #4ade80; color: #4ade80;">
          📥 Review Submissions (<span id="btn-pending-count">0</span>)
        </a>
        <a href="admin-students.html" class="btn btn-outline">
          👥 Registered Students
        </a>
        <button class="btn btn-primary" onclick="openCreateOpportunityModal()">+ Add Opportunity</button>
        <button class="btn btn-scheme" onclick="openCreateSchemeModal()">+ Add Govt Scheme</button>
      </div>
    </div>

    <!-- Live Database Stats Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.2rem; margin-bottom: 3rem;">
      <div class="glass-panel" style="padding: 1.4rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Registered Students</div>
        <div id="stat-students" style="font-size: 2.2rem; font-weight: 800; color: var(--primary-cyan); margin-top: 0.3rem;">0</div>
      </div>

      <div class="glass-panel" style="padding: 1.4rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Total Opportunities</div>
        <div id="stat-opps" style="font-size: 2.2rem; font-weight: 800; color: #38bdf8; margin-top: 0.3rem;">0</div>
      </div>

      <div class="glass-panel" style="padding: 1.4rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Government Schemes</div>
        <div id="stat-schemes" style="font-size: 2.2rem; font-weight: 800; color: var(--scheme-amber); margin-top: 0.3rem;">0</div>
      </div>

      <div class="glass-panel" style="padding: 1.4rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Pending Submissions</div>
        <div id="stat-pending" style="font-size: 2.2rem; font-weight: 800; color: #facc15; margin-top: 0.3rem;">0</div>
      </div>

      <div class="glass-panel" style="padding: 1.4rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Approved & Live</div>
        <div id="stat-approved" style="font-size: 2.2rem; font-weight: 800; color: #4ade80; margin-top: 0.3rem;">0</div>
      </div>
    </div>

    <!-- Admin Manage Opportunities Table -->
    <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 3rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 1rem;">
        <h3 style="color: #fff; font-size: 1.3rem; margin: 0;">🎓 Student Opportunities Management</h3>
        <span style="font-size: 0.85rem; color: var(--text-muted);">Toggle checkbox to show item on front-page ticker</span>
      </div>
      
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; color: var(--text-main); font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-light); text-align: left; color: var(--text-muted);">
              <th style="padding: 0.8rem;">Title</th>
              <th style="padding: 0.8rem;">Type</th>
              <th style="padding: 0.8rem;">Last Date</th>
              <th style="padding: 0.8rem;">Latest Ticker</th>
              <th style="padding: 0.8rem; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="admin-opps-list">
            <!-- Dynamically Populated -->
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    let loadedOpportunities = [];

    async function loadAdminStats() {
      try {
        // Fetch dashboard statistics from real backend endpoint
        const resStats = await fetch('/api/admin/dashboard-stats', { credentials: 'include' });
        const dataStats = await resStats.json();
        if (dataStats.success) {
          const s = dataStats.stats;
          document.getElementById('stat-students').innerText = s.totalStudents || 0;
          document.getElementById('stat-opps').innerText = s.totalOpportunities || 0;
          document.getElementById('stat-schemes').innerText = s.totalSchemes || 0;
          document.getElementById('stat-pending').innerText = s.pendingSubmissions || 0;
          document.getElementById('stat-approved').innerText = s.approvedSubmissions || 0;
          document.getElementById('btn-pending-count').innerText = s.pendingSubmissions || 0;
        }

        const resOpp = await fetch('/api/opportunities');
        const dataOpp = await resOpp.json();
        if (dataOpp.success) {
          loadedOpportunities = dataOpp.opportunities || [];
          renderAdminOppsList(loadedOpportunities);
        }
      } catch (err) {
        console.error('Admin Load Error:', err);
      }
    }

    function renderAdminOppsList(items) {
      const tbody = document.getElementById('admin-opps-list');
      if (!tbody || !items) return;

      tbody.innerHTML = items.map(op => {
        const titleEn = op.title ? (op.title.en || op.title) : '';
        const titleHi = op.title ? (op.title.hi || '') : '';
        const lastDateStr = op.lastDate ? new Date(op.lastDate).toLocaleDateString('en-IN') : 'N/A';

        return `
          <tr style="border-bottom: 1px solid var(--border-light);">
            <td style="padding: 0.8rem;">
              <strong style="color:#fff;">${titleEn}</strong>
              ${titleHi && titleHi !== titleEn ? `<br><span style="font-size:0.8rem; color:var(--text-muted);">${titleHi}</span>` : ''}
            </td>
            <td style="padding: 0.8rem;"><span class="card-badge badge-open">${op.type}</span></td>
            <td style="padding: 0.8rem; color:#f87171;">${lastDateStr}</td>
            <td style="padding: 0.8rem;">
              <input type="checkbox" ${op.showInLatestUpdates ? 'checked' : ''} onchange="toggleTickerFlag('${op._id}', this.checked)">
              <span style="font-size:0.8rem; margin-left:4px; color:${op.showInLatestUpdates ? 'var(--primary-teal)' : 'var(--text-muted)'};">${op.showInLatestUpdates ? 'Active' : 'Hidden'}</span>
            </td>
            <td style="padding: 0.8rem; text-align: right;">
              <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.78rem; color: var(--primary-teal); margin-right: 4px;" onclick="openEditOpportunityModal('${op._id}')">Edit</button>
              <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.78rem; color: #f87171;" onclick="deleteOpportunity('${op._id}')">Delete</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    async function toggleTickerFlag(id, show) {
      try {
        await fetch(`/api/opportunities/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ showInLatestUpdates: show }),
          credentials: 'include'
        });
        loadAdminStats();
      } catch (err) {
        console.error('Toggle Error:', err);
      }
    }

    async function deleteOpportunity(id) {
      if (!confirm('Are you sure you want to delete this opportunity?')) return;
      try {
        await fetch(`/api/opportunities/${id}`, { method: 'DELETE', credentials: 'include' });
        loadAdminStats();
      } catch (err) {
        console.error('Delete Error:', err);
      }
    }

    function openCreateOpportunityModal() {
      const title = prompt('Opportunity Title *\n[ Type ANY custom title, e.g., University of Allahabad Debate Competition 2026 ]:', 'University of Allahabad Debate Competition 2026');
      if (!title || !title.trim()) return;

      const type = prompt('Type (Scholarship, Quiz Competition, Hackathon, Essay Competition, Competitive Exam, Skill Development Program, Prize Opportunity, Internship):', 'Quiz Competition');
      const applyUrl = prompt('Official Application Link (applyUrl):', 'https://mygov.in');
      const prizeAmount = prompt('Prize / Financial Aid Amount (Optional, e.g. ₹50,000):', '₹10,000');
      const lastDateInput = prompt('Last Application Date (YYYY-MM-DD):', '2026-10-30');

      if (title && applyUrl) {
        fetch('/api/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            type: type || 'Opportunity',
            applyUrl: applyUrl.trim(),
            prizeAmount: prizeAmount ? prizeAmount.trim() : '',
            lastDate: lastDateInput ? new Date(lastDateInput) : new Date('2026-10-30'),
            showInLatestUpdates: true
          }),
          credentials: 'include'
        }).then(res => res.json()).then(data => {
          if (data.success) {
            alert('Opportunity created successfully!');
            loadAdminStats();
          } else {
            alert(data.message);
          }
        });
      }
    }

    function openEditOpportunityModal(id) {
      const op = loadedOpportunities.find(o => o._id === id);
      if (!op) return;

      const currentTitle = typeof op.title === 'object' ? (op.title.en || op.title.hi || '') : op.title;
      const newTitle = prompt('Edit Opportunity Title *\n[ Type ANY custom title ]:', currentTitle);
      if (!newTitle || !newTitle.trim()) return;

      const newType = prompt('Edit Opportunity Type:', op.type || 'Opportunity');
      const newApplyUrl = prompt('Edit Official Application Link:', op.applyUrl || '');
      const newPrize = prompt('Edit Prize / Financial Aid Amount:', op.prizeAmount || '');
      const defaultDateStr = op.lastDate ? new Date(op.lastDate).toISOString().split('T')[0] : '2026-10-30';
      const newLastDate = prompt('Edit Last Date (YYYY-MM-DD):', defaultDateStr);

      fetch(`/api/opportunities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          type: newType ? newType.trim() : op.type,
          applyUrl: newApplyUrl ? newApplyUrl.trim() : op.applyUrl,
          prizeAmount: newPrize !== null ? newPrize.trim() : op.prizeAmount,
          lastDate: newLastDate ? new Date(newLastDate) : op.lastDate
        }),
        credentials: 'include'
      }).then(res => res.json()).then(data => {
        if (data.success) {
          alert('Opportunity updated successfully!');
          loadAdminStats();
        } else {
          alert(data.message);
        }
      });
    }

    function openCreateSchemeModal() {
      const titleEn = prompt('Government Scheme Title (English):', 'PM Vocational Skill Scheme 2026');
      const titleHi = prompt('Government Scheme Title (Hindi):', 'पीएम व्यावसायिक कौशल योजना 2026');
      const sector = prompt('Sector (Education, Employment, Women, Farmers, Health, Skill Development):', 'Skill Development');
      const applyUrl = prompt('Official Government Portal Link:', 'https://pmkvyofficial.org');

      if (titleEn && applyUrl) {
        fetch('/api/schemes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: { en: titleEn, hi: titleHi },
            sector,
            governmentType: 'Central',
            applyUrl,
            lastDate: new Date('2026-12-31'),
            showInLatestUpdates: true
          }),
          credentials: 'include'
        }).then(res => res.json()).then(data => {
          if (data.success) {
            alert('Government Scheme created successfully!');
            loadAdminStats();
          } else {
            alert(data.message);
          }
        });
      }
    }

    document.addEventListener('DOMContentLoaded', loadAdminStats);
  </script>
</body>
</html>

`

---

### File 48 of 49
**File Name:** admin-submissions.html  
**File Path:** /public/admin-submissions.html  
**Purpose:** Admin review console for verifying student submissions, proof files, and approving live  

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Review Submissions | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-pending { background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); }
    .status-under-review { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
    .status-changes-requested { background: rgba(249, 115, 22, 0.2); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.4); }
    .status-approved { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); }
    .status-rejected { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }

    .modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(5px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-content {
      background: #0f172a;
      border: 1px solid var(--border-light);
      border-radius: 14px;
      max-width: 650px;
      width: 100%;
      padding: 2rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
      max-height: 90vh;
      overflow-y: auto;
    }
  </style>
</head>
<body>
  <div id="navbar-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem;">
    <!-- Console Title -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <span class="card-badge badge-closing" style="margin-bottom: 0.4rem;">Admin Control Center</span>
        <h1 style="color: #fff; font-size: 2rem; font-weight: 800; margin-bottom: 0.2rem;">Student Submissions Review Console</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0;">Verify uploaded documents, test source links, and approve student-submitted opportunities to publish them live.</p>
      </div>

      <a href="admin-dashboard.html" class="btn btn-outline">Back to Admin Dashboard</a>
    </div>

    <!-- Filters & Search Bar -->
    <div class="glass-panel" style="padding: 1.2rem; margin-bottom: 2rem; display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; flex: 1;">
        <select id="statusFilter" class="form-select" style="max-width: 220px; padding: 0.6rem 1rem;" onchange="loadAdminSubmissions()">
          <option value="All">All Submissions</option>
          <option value="Pending Review" selected>Pending Review</option>
          <option value="Under Review">Under Review</option>
          <option value="Changes Requested">Changes Requested</option>
          <option value="Approved">Approved & Live</option>
          <option value="Rejected">Rejected</option>
        </select>

        <input type="text" id="searchInput" class="form-input" style="max-width: 300px; padding: 0.6rem 1rem;" placeholder="Search title or organization..." onkeyup="loadAdminSubmissions()">
      </div>

      <div style="color: var(--text-muted); font-size: 0.88rem;" id="totalCountBadge">
        Showing 0 submissions
      </div>
    </div>

    <!-- Submissions Table -->
    <div class="glass-panel" style="padding: 1.5rem;">
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; color: var(--text-main); font-size: 0.88rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-light); text-align: left; color: var(--text-muted);">
              <th style="padding: 0.8rem;">Submission Details</th>
              <th style="padding: 0.8rem;">Submitted By</th>
              <th style="padding: 0.8rem;">Proof & Link</th>
              <th style="padding: 0.8rem;">Deadline</th>
              <th style="padding: 0.8rem;">Status</th>
              <th style="padding: 0.8rem; text-align: right;">Review Action</th>
            </tr>
          </thead>
          <tbody id="admin-submissions-tbody">
            <!-- Populated via JS -->
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- Review Modal -->
  <div id="reviewModal" class="modal-backdrop">
    <div class="modal-content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
        <h3 style="color: #fff; font-size: 1.3rem; margin: 0;" id="modalTitle">Review Opportunity</h3>
        <button onclick="closeReviewModal()" style="background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer;">✕</button>
      </div>

      <div id="modalDetails" style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-light); padding: 1rem; border-radius: 8px; margin-bottom: 1.2rem; font-size: 0.88rem; color: #cbd5e1;">
        <!-- Details injected via JS -->
      </div>

      <div class="form-group" style="margin-bottom: 1.2rem;">
        <label style="display: block; color: #e2e8f0; font-size: 0.88rem; margin-bottom: 0.4rem;">Update Status</label>
        <select id="modalStatusSelect" class="form-select">
          <option value="Approved">✅ Approve & Auto-Publish Live</option>
          <option value="Under Review">🔍 Mark Under Review</option>
          <option value="Changes Requested">⚠️ Request Changes from Student</option>
          <option value="Rejected">❌ Reject Submission</option>
        </select>
      </div>

      <div class="form-group" style="margin-bottom: 1.5rem;">
        <label style="display: block; color: #e2e8f0; font-size: 0.88rem; margin-bottom: 0.4rem;">Admin Feedback / Note for Student</label>
        <textarea id="modalFeedbackText" class="form-textarea" rows="3" placeholder="Provide reason or feedback note visible to the student..."></textarea>
      </div>

      <div style="display: flex; gap: 0.8rem; justify-content: flex-end;">
        <button onclick="closeReviewModal()" class="btn btn-outline">Cancel</button>
        <button onclick="submitReviewAction()" class="btn btn-primary" id="saveReviewBtn">Save & Apply Status</button>
      </div>
    </div>
  </div>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>

  <script>
    let currentSubmissions = [];
    let selectedSubmissionId = null;

    async function loadAdminSubmissions() {
      const tbody = document.getElementById('admin-submissions-tbody');
      const statusFilter = document.getElementById('statusFilter').value;
      const searchInput = document.getElementById('searchInput').value;

      try {
        const url = `/api/submissions/admin?status=${encodeURIComponent(statusFilter)}&search=${encodeURIComponent(searchInput)}`;
        const res = await fetch(url, { credentials: 'include' });
        const data = await res.json();

        if (!data.success) {
          tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#f87171; padding:2rem;">${data.message}</td></tr>`;
          return;
        }

        currentSubmissions = data.data || [];
        document.getElementById('totalCountBadge').innerText = `Showing ${currentSubmissions.length} submissions`;

        if (currentSubmissions.length === 0) {
          tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:3rem;">No submissions found for selected criteria.</td></tr>`;
          return;
        }

        tbody.innerHTML = currentSubmissions.map(sub => {
          let badgeClass = 'status-pending';
          if (sub.status === 'Under Review') badgeClass = 'status-under-review';
          if (sub.status === 'Changes Requested') badgeClass = 'status-changes-requested';
          if (sub.status === 'Approved') badgeClass = 'status-approved';
          if (sub.status === 'Rejected') badgeClass = 'status-rejected';

          const studentName = sub.submittedBy ? sub.submittedBy.name : 'Unknown';
          const studentEmail = sub.submittedBy ? sub.submittedBy.email : '';
          const lastDateStr = new Date(sub.lastDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

          return `
            <tr style="border-bottom: 1px solid var(--border-light);">
              <td style="padding: 0.8rem;">
                <strong style="color:#fff;">${sub.title}</strong>
                <div style="font-size:0.78rem; color:var(--primary-cyan); font-weight:600; margin-top:2px;">${sub.type} (${sub.categoryType})</div>
                ${sub.organization ? `<div style="font-size:0.75rem; color:var(--text-muted);">Org: ${sub.organization}</div>` : ''}
              </td>

              <td style="padding: 0.8rem;">
                <div style="color:#e2e8f0; font-weight:600;">${studentName}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${studentEmail}</div>
              </td>

              <td style="padding: 0.8rem;">
                <a href="${sub.sourceUrl}" target="_blank" style="color:var(--primary-cyan); text-decoration:underline; font-size:0.8rem; display:block;">🔗 Source URL</a>
                <a href="${sub.proofUrl || sub.verificationImage}" target="_blank" style="color:#4ade80; text-decoration:underline; font-size:0.8rem; display:block; margin-top:2px;">📄 View Proof (Private)</a>
                ${sub.publicBannerImage ? `<a href="${sub.publicBannerImage}" target="_blank" style="color:#38bdf8; text-decoration:underline; font-size:0.8rem; display:block; margin-top:2px;">🖼️ View Public Banner</a>` : ''}
              </td>

              <td style="padding: 0.8rem; color:#f87171; font-weight:600;">
                ${lastDateStr}
              </td>

              <td style="padding: 0.8rem;">
                <span class="status-badge ${badgeClass}">${sub.status}</span>
              </td>

              <td style="padding: 0.8rem; text-align: right;">
                <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="openReviewModal('${sub._id}')">
                  Review & Action
                </button>
              </td>
            </tr>
          `;
        }).join('');

      } catch (err) {
        console.error('Admin Submissions Load Error:', err);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#f87171; padding:2rem;">Failed to load submissions. Check server connection.</td></tr>`;
      }
    }

    function openReviewModal(id) {
      const sub = currentSubmissions.find(s => s._id === id);
      if (!sub) return;

      selectedSubmissionId = id;
      document.getElementById('modalTitle').innerText = `Review: ${sub.title}`;
      
      const modalDetails = document.getElementById('modalDetails');
      modalDetails.innerHTML = `
        <div style="margin-bottom:0.4rem;"><strong>Category:</strong> ${sub.categoryType} • <strong>Type:</strong> ${sub.type}</div>
        <div style="margin-bottom:0.4rem;"><strong>Submitted By:</strong> ${sub.submittedBy ? sub.submittedBy.name : 'Student'} (${sub.submittedBy ? sub.submittedBy.email : ''})</div>
        <div style="margin-bottom:0.4rem;"><strong>Source Verification URL:</strong> <a href="${sub.sourceUrl}" target="_blank" style="color:var(--primary-cyan);">${sub.sourceUrl}</a></div>
        <div style="margin-bottom:0.4rem;"><strong>Verification Proof (Private):</strong> <a href="${sub.proofUrl || sub.verificationImage}" target="_blank" style="color:#4ade80;">${sub.proofOriginalName || 'Uploaded Verification File'}</a></div>
        ${sub.publicBannerImage ? `<div style="margin-bottom:0.4rem;"><strong>Public Banner Image:</strong> <a href="${sub.publicBannerImage}" target="_blank" style="color:#38bdf8;">${sub.publicBannerOriginalName || 'Public Banner File'}</a></div>` : '<div style="margin-bottom:0.4rem; color: var(--text-muted);"><strong>Public Banner:</strong> None provided</div>'}
        ${sub.description ? `<div style="margin-top:0.4rem; padding-top:0.4rem; border-top:1px solid rgba(255,255,255,0.1);"><strong>Description:</strong> ${sub.description}</div>` : ''}
      `;

      document.getElementById('modalStatusSelect').value = sub.status === 'Pending Review' ? 'Approved' : sub.status;
      document.getElementById('modalFeedbackText').value = sub.adminFeedback || '';
      document.getElementById('reviewModal').style.display = 'flex';
    }

    function closeReviewModal() {
      document.getElementById('reviewModal').style.display = 'none';
      selectedSubmissionId = null;
    }

    async function submitReviewAction() {
      if (!selectedSubmissionId) return;

      const status = document.getElementById('modalStatusSelect').value;
      const adminFeedback = document.getElementById('modalFeedbackText').value;
      const saveBtn = document.getElementById('saveReviewBtn');

      saveBtn.disabled = true;
      saveBtn.innerText = 'Updating status...';

      try {
        const res = await fetch(`/api/submissions/admin/${selectedSubmissionId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, adminFeedback }),
          credentials: 'include'
        });

        const data = await res.json();
        if (data.success) {
          alert(`Status updated to "${status}" successfully! ${status === 'Approved' ? 'Published live to public listings!' : ''}`);
          closeReviewModal();
          loadAdminSubmissions();
        } else {
          alert('Error: ' + data.message);
        }
      } catch (err) {
        console.error('Update Status Error:', err);
        alert('Server error updating status.');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save & Apply Status';
      }
    }

    document.addEventListener('DOMContentLoaded', loadAdminSubmissions);
  </script>
</body>
</html>

`

---

### File 49 of 49
**File Name:** admin-students.html  
**File Path:** /public/admin-students.html  
**Purpose:** Admin registered student directory, search, and profile inspector  

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registered Students Directory | DishaSetu Admin</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(5px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-content {
      background: #0f172a;
      border: 1px solid var(--border-light);
      border-radius: 14px;
      max-width: 550px;
      width: 100%;
      padding: 2rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
    }
  </style>
</head>
<body>
  <div id="navbar-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem;">
    <!-- Directory Title -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <span class="card-badge badge-open" style="margin-bottom: 0.4rem;">Student Management</span>
        <h1 style="color: #fff; font-size: 2rem; font-weight: 800; margin-bottom: 0.2rem;">Registered Students Directory</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0;">View student profiles, education qualifications, state locations, and community contributions.</p>
      </div>

      <a href="admin-dashboard.html" class="btn btn-outline">Back to Admin Dashboard</a>
    </div>

    <!-- Filters & Search Bar -->
    <div class="glass-panel" style="padding: 1.2rem; margin-bottom: 2rem; display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; flex: 1;">
        <select id="educationFilter" class="form-select" style="max-width: 180px; padding: 0.6rem 1rem;" onchange="loadStudents()">
          <option value="All">All Education</option>
          <option value="10th">10th Pass</option>
          <option value="12th">12th Pass</option>
          <option value="Graduate">Graduate</option>
          <option value="Post Graduate">Post Graduate</option>
          <option value="Diploma">Diploma</option>
          <option value="PhD">PhD</option>
        </select>

        <select id="stateFilter" class="form-select" style="max-width: 180px; padding: 0.6rem 1rem;" onchange="loadStudents()">
          <option value="All">All States</option>
          <option value="All India">All India</option>
          <option value="Uttar Pradesh">Uttar Pradesh</option>
          <option value="Bihar">Bihar</option>
          <option value="Madhya Pradesh">Madhya Pradesh</option>
          <option value="Rajasthan">Rajasthan</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Delhi">Delhi</option>
        </select>

        <input type="text" id="searchInput" class="form-input" style="max-width: 280px; padding: 0.6rem 1rem;" placeholder="Search name, email, or phone..." onkeyup="loadStudents()">
      </div>

      <div style="color: var(--text-muted); font-size: 0.88rem;" id="totalStudentsCount">
        Showing 0 students
      </div>
    </div>

    <!-- Students Directory Table -->
    <div class="glass-panel" style="padding: 1.5rem;">
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; color: var(--text-main); font-size: 0.88rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-light); text-align: left; color: var(--text-muted);">
              <th style="padding: 0.8rem;">Student Name</th>
              <th style="padding: 0.8rem;">Contact Email</th>
              <th style="padding: 0.8rem;">Education / State</th>
              <th style="padding: 0.8rem;">Category</th>
              <th style="padding: 0.8rem;">Submissions</th>
              <th style="padding: 0.8rem;">Registered On</th>
              <th style="padding: 0.8rem; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="students-tbody">
            <!-- Populated via JS -->
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- Student Profile Modal -->
  <div id="studentModal" class="modal-backdrop">
    <div class="modal-content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
        <h3 style="color: #fff; font-size: 1.3rem; margin: 0;" id="modalStudentName">Student Profile</h3>
        <button onclick="closeStudentModal()" style="background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer;">✕</button>
      </div>

      <div id="modalProfileContent" style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">
        <!-- Details injected via JS -->
      </div>

      <div style="margin-top: 1.5rem; text-align: right;">
        <button onclick="closeStudentModal()" class="btn btn-outline">Close Profile</button>
      </div>
    </div>
  </div>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>

  <script>
    let currentStudents = [];

    async function loadStudents() {
      const tbody = document.getElementById('students-tbody');
      const education = document.getElementById('educationFilter').value;
      const state = document.getElementById('stateFilter').value;
      const search = document.getElementById('searchInput').value;

      try {
        const url = `/api/admin/students?education=${encodeURIComponent(education)}&state=${encodeURIComponent(state)}&search=${encodeURIComponent(search)}`;
        const res = await fetch(url, { credentials: 'include' });
        const data = await res.json();

        if (!data.success) {
          tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#f87171; padding:2rem;">${data.message}</td></tr>`;
          return;
        }

        currentStudents = data.students || [];
        document.getElementById('totalStudentsCount').innerText = `Showing ${currentStudents.length} registered students`;

        if (currentStudents.length === 0) {
          tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:3rem;">No registered students matching current filters.</td></tr>`;
          return;
        }

        tbody.innerHTML = currentStudents.map(st => {
          const regDate = new Date(st.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

          return `
            <tr style="border-bottom: 1px solid var(--border-light);">
              <td style="padding: 0.8rem;">
                <strong style="color:#fff;">${st.name}</strong>
                <div style="font-size:0.75rem; color:var(--primary-cyan);">${st.role.toUpperCase()}</div>
              </td>

              <td style="padding: 0.8rem;">
                <div style="color:#cbd5e1;">${st.email}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${st.phone || 'No phone'}</div>
              </td>

              <td style="padding: 0.8rem;">
                <span class="card-badge badge-open" style="font-size:0.7rem; padding:2px 6px;">${st.education || 'Graduate'}</span>
                <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">📍 ${st.state || 'All India'}</div>
              </td>

              <td style="padding: 0.8rem;">
                ${st.category || 'General'}
              </td>

              <td style="padding: 0.8rem;">
                <strong style="color:#4ade80;">${st.totalSubmissions || 0}</strong>
                <span style="font-size:0.75rem; color:var(--text-muted);">(${st.approvedSubmissions || 0} Live)</span>
              </td>

              <td style="padding: 0.8rem; color:var(--text-muted);">
                ${regDate}
              </td>

              <td style="padding: 0.8rem; text-align: right;">
                <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.78rem; margin-right: 4px;" onclick="openStudentModal('${st._id}')">
                  View Profile
                </button>
                <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.78rem; color: #f87171;" onclick="deleteStudent('${st._id}', '${st.name}')">
                  Delete
                </button>
              </td>
            </tr>
          `;
        }).join('');

      } catch (err) {
        console.error('Load Students Error:', err);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#f87171; padding:2rem;">Failed to load students directory.</td></tr>`;
      }
    }

    function openStudentModal(id) {
      const st = currentStudents.find(s => s._id === id);
      if (!st) return;

      document.getElementById('modalStudentName').innerText = `Student Profile: ${st.name}`;
      const content = document.getElementById('modalProfileContent');
      content.innerHTML = `
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-light); padding: 1.2rem; border-radius: 10px;">
          <div style="margin-bottom:0.6rem;"><strong>Full Name:</strong> ${st.name}</div>
          <div style="margin-bottom:0.6rem;"><strong>Email Address:</strong> ${st.email}</div>
          <div style="margin-bottom:0.6rem;"><strong>Mobile Phone:</strong> ${st.phone || 'Not provided'}</div>
          <div style="margin-bottom:0.6rem;"><strong>Education Qualification:</strong> ${st.education || 'Graduate'}</div>
          <div style="margin-bottom:0.6rem;"><strong>Home State:</strong> ${st.state || 'All India'}</div>
          <div style="margin-bottom:0.6rem;"><strong>Social Category:</strong> ${st.category || 'General'}</div>
          <div style="margin-bottom:0.6rem;"><strong>Account Type / Role:</strong> ${st.role}</div>
          <div style="margin-bottom:0.6rem;"><strong>Registered Date:</strong> ${new Date(st.createdAt).toLocaleString('en-IN')}</div>
          <div style="margin-top:0.8rem; padding-top:0.8rem; border-top:1px solid rgba(255,255,255,0.1); color: #4ade80;">
            <strong>Community Impact:</strong> ${st.totalSubmissions || 0} Submitted Opportunities (${st.approvedSubmissions || 0} Approved)
          </div>
        </div>
      `;

      document.getElementById('studentModal').style.display = 'flex';
    }

    function closeStudentModal() {
      document.getElementById('studentModal').style.display = 'none';
    }

    async function deleteStudent(id, name) {
      if (!confirm(`Are you sure you want to delete student account "${name}"?`)) return;

      try {
        const res = await fetch(`/api/admin/students/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
          alert(`Student account "${name}" was deleted successfully.`);
          loadStudents();
        } else {
          alert('Error: ' + data.message);
        }
      } catch (err) {
        console.error('Delete Student Error:', err);
        alert('Failed to delete student account.');
      }
    }

    document.addEventListener('DOMContentLoaded', loadStudents);
  </script>
</body>
</html>

`

---

