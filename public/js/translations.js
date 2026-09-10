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
