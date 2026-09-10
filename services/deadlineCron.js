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
