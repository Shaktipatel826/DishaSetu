# DishaSetu — Part 1: Backend Core, Configuration, Services & Database Models

## File: package.json
- **Path:** /package.json
- **Purpose:** Project metadata, dependency declarations, and scripts

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

## File: server.js
- **Path:** /server.js
- **Purpose:** Main application entry point, Express server, middleware, routes, and error handling

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

## File: db.js
- **Path:** /config/db.js
- **Purpose:** MongoDB Atlas connection configuration via Mongoose

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

## File: deadlineCron.js
- **Path:** /services/deadlineCron.js
- **Purpose:** Scheduled cron jobs for deadline monitoring and reminder notifications

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

## File: seedData.js
- **Path:** /seedData.js
- **Purpose:** Database seeding script for initializing demo opportunities, schemes, and admin account

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

## File: User.js
- **Path:** /models/User.js
- **Purpose:** Mongoose schema for student users, profile data, and bcrypt authentication

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

## File: Admin.js
- **Path:** /models/Admin.js
- **Purpose:** Mongoose schema for administrator credentials and permissions

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

## File: Opportunity.js
- **Path:** /models/Opportunity.js
- **Purpose:** Mongoose schema for student opportunities (scholarships, hackathons, competitions)

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

## File: Scheme.js
- **Path:** /models/Scheme.js
- **Purpose:** Mongoose schema for central and state government schemes

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

## File: Submission.js
- **Path:** /models/Submission.js
- **Purpose:** Mongoose schema for student-submitted opportunities pending admin review

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

## File: SavedItem.js
- **Path:** /models/SavedItem.js
- **Purpose:** Mongoose schema for student bookmarks, saved opportunities, and reminders

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

## File: Notification.js
- **Path:** /models/Notification.js
- **Purpose:** Mongoose schema for bilingual in-app notifications and alerts

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

