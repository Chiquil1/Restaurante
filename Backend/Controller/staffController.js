const staffModel = require('../Models/staffModel');

exports.getAllStaff = async (req, res) => {
    try {
        const staff = await staffModel.getAllStaff();
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStaffById = async (req, res) => {
    try {
        const staff = await staffModel.getStaffById(req.params.id);
        if (!staff) return res.status(404).json({ error: 'Personal no encontrado' });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createStaff = async (req, res) => {
    try {
        const staff = await staffModel.createStaff(req.body);
        res.status(201).json(staff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const staff = await staffModel.updateStaff(req.params.id, req.body);
        if (!staff) return res.status(404).json({ error: 'Personal no encontrado' });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const result = await staffModel.deleteStaff(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAusencias = async (req, res) => {
    try {
        const ausencias = await staffModel.getAusencias(req.params.personal_id);
        res.json(ausencias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createAusencia = async (req, res) => {
    try {
        const ausencia = await staffModel.createAusencia(req.body);
        res.status(201).json(ausencia);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
