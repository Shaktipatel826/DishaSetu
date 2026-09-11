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

    // Construct relative web URLs for uploaded files
    const proofUrl = `/uploads/proofs/${proofFile.filename}`;
    const verificationImage = proofUrl;
    const publicBannerImage = bannerFile ? `/uploads/proofs/${bannerFile.filename}` : '';

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
