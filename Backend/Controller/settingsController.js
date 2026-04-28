const settingsModel = require('../Models/settingsModel');

exports.getGeneral = async (req, res) => {
    try {
        const config = await settingsModel.getGeneral();
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateGeneral = async (req, res) => {
    try {
        const config = await settingsModel.updateGeneral(req.body);
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBranch = async (req, res) => {
    try {
        const branch = await settingsModel.getBranch();
        res.json(branch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateBranch = async (req, res) => {
    try {
        const branch = await settingsModel.updateBranch(req.body);
        res.json(branch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createBackup = async (req, res) => {
    try {
        const { sucursalId } = req.body;
        const backup = await settingsModel.createBackup(sucursalId);
        res.status(201).json(backup);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
