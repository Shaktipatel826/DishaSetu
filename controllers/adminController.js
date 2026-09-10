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
