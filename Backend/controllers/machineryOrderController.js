const MachineryOrder = require('../models/MachineryOrder');
const Enquiry = require('../models/Enquiry');

// @desc    Create new machinery order / dealer enquiry
// @route   POST /api/machinery-orders
exports.createMachineryOrder = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      location,
      district,
      village,
      state,
      pincode,
      machineId,
      machineName,
      title,
      productOrEquipment,
      brand,
      category,
      modelName,
      power,
      price,
      machineImage,
      image,
      images,
      intent,
      message,
      requirement,
      userId,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }
    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ success: false, message: 'Contact phone number is required' });
    }

    const resolvedMachineName = String(
      machineName || title || productOrEquipment || 'Agricultural Machinery'
    ).trim();

    // Resolve location
    let resolvedLocation = String(location || '').trim();
    if (!resolvedLocation) {
      const parts = [village, district, state, pincode].filter(Boolean);
      resolvedLocation = parts.join(', ');
    }
    if (!resolvedLocation) {
      resolvedLocation = 'District Buyer';
    }

    // Resolve primary image
    let resolvedImage = '';
    const rawImg = machineImage || image || (Array.isArray(images) && images[0]);
    if (typeof rawImg === 'string') {
      resolvedImage = rawImg.trim();
    } else if (rawImg && typeof rawImg === 'object') {
      resolvedImage = (rawImg.url || rawImg.data || rawImg.preview || rawImg.path || '').toString().trim();
    }

    const resolvedMessage = String(message || requirement || intent || `Quotation & subsidy enquiry for ${resolvedMachineName}`).trim();
    const resolvedPrice = String(price || '').trim();
    const resolvedBrand = String(brand || 'Rhinco').trim();
    const resolvedCategory = String(category || 'Farm Machinery').trim();
    const resolvedIntent = String(intent || 'Price Quotation').trim();

    // Create in MachineryOrder collection
    const newOrder = await MachineryOrder.create({
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: String(email || '').trim(),
      location: resolvedLocation,
      district: String(district || '').trim(),
      village: String(village || '').trim(),
      state: String(state || '').trim(),
      pincode: String(pincode || '').trim(),
      machineId: String(machineId || '').trim(),
      machineName: resolvedMachineName,
      productOrEquipment: resolvedMachineName,
      brand: resolvedBrand,
      category: resolvedCategory,
      modelName: String(modelName || '').trim(),
      power: String(power || '').trim(),
      price: resolvedPrice,
      machineImage: resolvedImage,
      intent: resolvedIntent,
      message: resolvedMessage,
      status: 'New',
      userId: String(userId || '').trim(),
    });

    // Dual-write into Enquiry collection for backward-compatibility with legacy enquiry dashboards
    try {
      await Enquiry.create({
        name: newOrder.name,
        phone: newOrder.phone,
        email: newOrder.email,
        location: newOrder.location,
        productOrEquipment: newOrder.machineName,
        machineImage: newOrder.machineImage,
        price: newOrder.price,
        enquiryType: 'Machinery Enquiry',
        subject: `Machinery Order Lead: ${newOrder.machineName}`,
        message: `${newOrder.intent} — ${newOrder.message}`,
        status: 'New',
        userId: newOrder.userId,
      });
    } catch (dualErr) {
      console.warn('Enquiry dual-write notice:', dualErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Machinery dealer enquiry submitted successfully',
      data: newOrder,
    });
  } catch (error) {
    console.error('Error creating machinery order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all machinery orders
// @route   GET /api/machinery-orders
exports.getMachineryOrders = async (req, res) => {
  try {
    const { status, search, sort } = req.query;
    let query = {};

    if (status && status !== 'All Status' && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { machineName: { $regex: s, $options: 'i' } },
        { brand: { $regex: s, $options: 'i' } },
        { location: { $regex: s, $options: 'i' } },
        { district: { $regex: s, $options: 'i' } },
        { intent: { $regex: s, $options: 'i' } },
        { message: { $regex: s, $options: 'i' } },
        { orderId: { $regex: s, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'name') {
      sortOption = { name: 1 };
    }

    const orders = await MachineryOrder.find(query).sort(sortOption);

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching machinery orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single machinery order by ID
// @route   GET /api/machinery-orders/:id
exports.getMachineryOrderById = async (req, res) => {
  try {
    const order = await MachineryOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Machinery order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching machinery order by id:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update machinery order status or notes
// @route   PUT /api/machinery-orders/:id
exports.updateMachineryOrder = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updateData = {};

    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const order = await MachineryOrder.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Machinery order not found' });
    }

    res.json({
      success: true,
      message: 'Machinery order updated successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error updating machinery order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete machinery order
// @route   DELETE /api/machinery-orders/:id
exports.deleteMachineryOrder = async (req, res) => {
  try {
    const order = await MachineryOrder.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Machinery order not found' });
    }
    res.json({
      success: true,
      message: 'Machinery order deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting machinery order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
