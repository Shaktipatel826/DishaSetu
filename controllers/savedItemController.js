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
