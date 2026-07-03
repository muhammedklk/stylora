const Address = require('../models/address');

exports.getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
        return res.json(addresses);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching addresses', error: error.message });
    }
};

exports.addAddress = async (req, res) => {
    try {
        const { name, phone, addressLine, city, state, postalCode, country, isDefault, addressType, latitude, longitude, mapAddress } = req.body;
        
        if (!name || !phone || !addressLine || !city || !state || !postalCode) {
            return res.status(400).json({ message: 'Required fields are missing' });
        }
        
        if (isDefault) {
            await Address.updateMany({ userId: req.user.id }, { isDefault: false });
        }
        
        const addressCount = await Address.countDocuments({ userId: req.user.id });
        
        const address = await Address.create({
            userId: req.user.id,
            name,
            phone,
            addressLine,
            city,
            state,
            postalCode,
            country: country || 'India',
            isDefault: isDefault || addressCount === 0, // first address is default
            addressType: addressType || 'shipping',
            latitude,
            longitude,
            mapAddress
        });
        
        return res.status(201).json(address);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating address', error: error.message });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const { name, phone, addressLine, city, state, postalCode, country, isDefault, addressType, latitude, longitude, mapAddress } = req.body;
        const address = await Address.findOne({ _id: req.params.id, userId: req.user.id });
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        
        if (isDefault) {
            await Address.updateMany({ userId: req.user.id, _id: { $ne: address._id } }, { isDefault: false });
            address.isDefault = true;
        } else if (isDefault === false && address.isDefault) {
            // Can't unset default if it is the only address, or default must exist
            const otherAddress = await Address.findOne({ userId: req.user.id, _id: { $ne: address._id } });
            if (otherAddress) {
                otherAddress.isDefault = true;
                await otherAddress.save();
                address.isDefault = false;
            }
        }
        
        if (name) address.name = name;
        if (phone) address.phone = phone;
        if (addressLine) address.addressLine = addressLine;
        if (city) address.city = city;
        if (state) address.state = state;
        if (postalCode) address.postalCode = postalCode;
        if (country) address.country = country;
        if (addressType) address.addressType = addressType;
        if (latitude !== undefined) address.latitude = latitude;
        if (longitude !== undefined) address.longitude = longitude;
        if (mapAddress !== undefined) address.mapAddress = mapAddress;
        
        await address.save();
        return res.json(address);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating address', error: error.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const address = await Address.findOne({ _id: req.params.id, userId: req.user.id });
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        
        const wasDefault = address.isDefault;
        await Address.findByIdAndDelete(req.params.id);
        
        if (wasDefault) {
            const nextAddress = await Address.findOne({ userId: req.user.id });
            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }
        
        return res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting address', error: error.message });
    }
};
