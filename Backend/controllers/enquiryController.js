const Enquiry = require('../models/Enquiry');

// @desc    Get all enquiries
// @route   GET /api/enquiries
exports.getEnquiries = async (req, res) => {
  try {
    const { status, enquiryType, search, sort } = req.query;
    let query = {};

    if (status && status !== 'All Status' && status !== 'All') {
      query.status = status;
    }

    if (enquiryType && enquiryType !== 'All Types' && enquiryType !== 'All') {
      query.enquiryType = enquiryType;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { productOrEquipment: { $regex: s, $options: 'i' } },
        { location: { $regex: s, $options: 'i' } },
        { subject: { $regex: s, $options: 'i' } },
        { message: { $regex: s, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'name') {
      sortOption = { name: 1 };
    }

    const enquiries = await Enquiry.find(query).sort(sortOption);

    res.json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single enquiry
// @route   GET /api/enquiries/:id
exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error fetching enquiry by id:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new enquiry
// @route   POST /api/enquiries
exports.createEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      productOrEquipment,
      machineName,
      product,
      machine,
      machineImage,
      image,
      price,
      enquiryType,
      location,
      district,
      subject,
      message,
      notes,
      userId,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const resolvedProduct = String(
      productOrEquipment ||
      machineName ||
      product ||
      machine ||
      subject ||
      'Agricultural Equipment'
    ).trim();

    const resolvedLocation = String(location || district || '').trim();

    let resolvedImage = '';
    const rawImg = machineImage || image;
    if (typeof rawImg === 'string') {
      resolvedImage = rawImg.trim();
    } else if (Array.isArray(rawImg) && rawImg.length > 0) {
      const first = rawImg[0];
      resolvedImage = (typeof first === 'string' ? first : first?.url || first?.data || first?.preview || '').toString().trim();
    } else if (rawImg && typeof rawImg === 'object') {
      resolvedImage = (rawImg.url || rawImg.data || rawImg.preview || rawImg.path || '').toString().trim();
    }

    const resolvedMessage = String(message || subject || `Enquiry for ${resolvedProduct}`).trim();
    const resolvedPrice = String(price || '').trim();
    const resolvedEmail = String(email || '').trim();
    const resolvedNotes = String(notes || '').trim();
    const resolvedUserId = String(userId || '').trim();

    const newEnquiry = await Enquiry.create({
      name: String(name).trim(),
      email: resolvedEmail,
      phone: String(phone).trim(),
      productOrEquipment: resolvedProduct,
      machineImage: resolvedImage,
      price: resolvedPrice,
      enquiryType: enquiryType || 'Machinery Enquiry',
      location: resolvedLocation,
      subject: String(subject || `Quotation Request for ${resolvedProduct}`).trim(),
      message: resolvedMessage,
      status: 'New',
      notes: resolvedNotes,
      userId: resolvedUserId,
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: newEnquiry,
    });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update enquiry status or notes
// @route   PUT /api/enquiries/:id
exports.updateEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const {
      name,
      email,
      phone,
      productOrEquipment,
      enquiryType,
      location,
      subject,
      message,
      status,
      notes,
    } = req.body;

    if (name) enquiry.name = name.trim();
    if (email !== undefined) enquiry.email = email.trim();
    if (phone) enquiry.phone = phone.trim();
    if (productOrEquipment) enquiry.productOrEquipment = productOrEquipment.trim();
    if (enquiryType) enquiry.enquiryType = enquiryType;
    if (location !== undefined) enquiry.location = location.trim();
    if (subject !== undefined) enquiry.subject = subject.trim();
    if (message) enquiry.message = message.trim();
    if (status) enquiry.status = status;
    if (notes !== undefined) enquiry.notes = notes.trim();

    const updated = await enquiry.save();

    res.json({
      success: true,
      message: 'Enquiry updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete enquiry
// @route   DELETE /api/enquiries/:id
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    await Enquiry.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Enquiry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
