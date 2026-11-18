const mongoose = require('mongoose');
const Address = require('../models/Address');

// Helper to format address for frontend compatibility
const formatAddress = (addr) => {
  const obj = addr.toObject ? addr.toObject() : addr;
  return {
    ...obj,
    id: String(obj._id),
  };
};

// @desc    Get all addresses for a user
// @route   GET /api/addresses
exports.getAddresses = async (req, res) => {
  try {
    const { userId, email } = req.query;

    let query = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query = { userId };
    } else if (email && email.trim()) {
      query = { userEmail: email.trim().toLowerCase() };
    }

    if (!query) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const addresses = await Address.find(query).sort({ isDefault: -1, createdAt: -1 });

    res.json({
      success: true,
      count: addresses.length,
      data: addresses.map(formatAddress),
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new address
// @route   POST /api/addresses
exports.createAddress = async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      email,
      name,
      phone,
      village,
      district,
      state,
      pincode,
      type,
      isDefault,
    } = req.body;

    const resolvedEmail = (userEmail || email || '').trim().toLowerCase();
    const resolvedUserId =
      userId && mongoose.Types.ObjectId.isValid(userId) ? userId : null;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient name is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Contact phone is required' });
    }
    if (!village || !village.trim()) {
      return res.status(400).json({ success: false, message: 'Address / Village is required' });
    }
    if (!district || !district.trim()) {
      return res.status(400).json({ success: false, message: 'District is required' });
    }
    if (!state || !state.trim()) {
      return res.status(400).json({ success: false, message: 'State is required' });
    }
    if (!pincode || !pincode.trim()) {
      return res.status(400).json({ success: false, message: 'PIN code is required' });
    }

    // Check if this is the first address for the user
    const existingCountQuery = resolvedUserId
      ? { userId: resolvedUserId }
      : resolvedEmail
      ? { userEmail: resolvedEmail }
      : null;

    let shouldBeDefault = Boolean(isDefault);
    if (existingCountQuery) {
      const count = await Address.countDocuments(existingCountQuery);
      if (count === 0) {
        shouldBeDefault = true;
      } else if (shouldBeDefault) {
        // Unset previous defaults
        await Address.updateMany(existingCountQuery, { isDefault: false });
      }
    }

    const newAddress = await Address.create({
      userId: resolvedUserId,
      userEmail: resolvedEmail,
      name: name.trim(),
      phone: phone.trim(),
      village: village.trim(),
      district: district.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      type: type || 'Farm Delivery',
      isDefault: shouldBeDefault,
    });

    res.status(201).json({
      success: true,
      message: 'Address saved successfully to database',
      data: formatAddress(newAddress),
    });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an address
// @route   PUT /api/addresses/:id
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid address ID' });
    }

    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const {
      name,
      phone,
      village,
      district,
      state,
      pincode,
      type,
      isDefault,
    } = req.body;

    if (name) address.name = name.trim();
    if (phone) address.phone = phone.trim();
    if (village) address.village = village.trim();
    if (district) address.district = district.trim();
    if (state) address.state = state.trim();
    if (pincode) address.pincode = pincode.trim();
    if (type) address.type = type.trim();

    if (isDefault === true || isDefault === 'true') {
      const userFilter = address.userId
        ? { userId: address.userId }
        : { userEmail: address.userEmail };
      await Address.updateMany({ ...userFilter, _id: { $ne: address._id } }, { isDefault: false });
      address.isDefault = true;
    }

    await address.save();

    res.json({
      success: true,
      message: 'Address updated successfully in database',
      data: formatAddress(address),
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid address ID' });
    }

    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const wasDefault = address.isDefault;
    const userFilter = address.userId
      ? { userId: address.userId }
      : { userEmail: address.userEmail };

    await Address.findByIdAndDelete(id);

    // If deleted address was default, promote another address if one exists
    if (wasDefault && userFilter) {
      const nextAddr = await Address.findOne(userFilter).sort({ updatedAt: -1 });
      if (nextAddr) {
        nextAddr.isDefault = true;
        await nextAddr.save();
      }
    }

    res.json({
      success: true,
      message: 'Address removed successfully from database',
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set address as default
// @route   PATCH /api/addresses/:id/default
exports.setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid address ID' });
    }

    const target = await Address.findById(id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const userFilter = target.userId
      ? { userId: target.userId }
      : { userEmail: target.userEmail };

    if (userFilter) {
      await Address.updateMany(userFilter, { isDefault: false });
    }

    target.isDefault = true;
    await target.save();

    res.json({
      success: true,
      message: 'Default address updated successfully',
      data: formatAddress(target),
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
