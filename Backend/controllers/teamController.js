const Team = require('../models/Team');

// @desc    Get all team members
// @route   GET /api/team
exports.getTeamMembers = async (req, res) => {
  try {
    const team = await Team.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: team.length,
      data: team,
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single team member
// @route   GET /api/team/:id
exports.getTeamMemberById = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }
    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new team member
// @route   POST /api/team
exports.createTeamMember = async (req, res) => {
  try {
    const { name, designation, contact, email, description, image } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!designation || !designation.trim()) {
      return res.status(400).json({ success: false, message: 'Designation is required' });
    }
    if (!contact || !contact.trim()) {
      return res.status(400).json({ success: false, message: 'Contact is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }
    if (!image) {
      return res.status(400).json({ success: false, message: 'Profile picture is required' });
    }

    const member = await Team.create({
      name: name.trim(),
      designation: designation.trim(),
      contact: contact.trim(),
      email: email.trim().toLowerCase(),
      description: description.trim(),
      image,
    });

    res.status(201).json({
      success: true,
      message: 'Team member added successfully',
      data: member,
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update team member
// @route   PUT /api/team/:id
exports.updateTeamMember = async (req, res) => {
  try {
    const { name, designation, contact, email, description, image } = req.body;

    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    if (name) member.name = name.trim();
    if (designation) member.designation = designation.trim();
    if (contact) member.contact = contact.trim();
    if (email) member.email = email.trim().toLowerCase();
    if (description) member.description = description.trim();
    if (image) member.image = image;

    await member.save();

    res.json({
      success: true,
      message: 'Team member updated successfully',
      data: member,
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete team member
// @route   DELETE /api/team/:id
exports.deleteTeamMember = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    await Team.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Team member deleted successfully',
      data: member,
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
