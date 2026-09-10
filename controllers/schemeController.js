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
