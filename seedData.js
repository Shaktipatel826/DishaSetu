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
