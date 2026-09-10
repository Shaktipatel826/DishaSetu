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
