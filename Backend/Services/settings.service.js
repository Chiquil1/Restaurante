const settingsModel = require('../Models/settingsModel');

const getSettings = async () => {
  const general = await settingsModel.getGeneral();
  const notificaciones = await settingsModel.getNotifications();
  const sucursal = await settingsModel.getBranch();

  return {
    general,
    notificaciones,
    sucursal,
  };
};

const updateGeneral = async (data) => {
  const existing = await settingsModel.findGeneral();
  if (existing) {
    return await settingsModel.updateGeneral(data);
  }
  return await settingsModel.insertGeneral(data);
};

const updateNotifications = async (data) => {
  const existing = await settingsModel.findNotifications();
  if (existing) {
    return await settingsModel.updateNotifications(data);
  }
  return await settingsModel.insertNotifications(data);
};

const updateBranch = async (data) => {
  const existing = await settingsModel.findBranch();
  if (existing) {
    return await settingsModel.updateBranch(data);
  }
  return await settingsModel.insertBranch(data);
};

const updatePassword = async (userId, hashedPassword) => {
  return await settingsModel.updatePassword(userId, hashedPassword);
};

const registerBackup = async () => {
  const branch = await settingsModel.findBranch();
  const branchId = branch ? branch.id : null;

  if (branchId) {
    await settingsModel.updateLastBackup(branchId);
  }

  return await settingsModel.createBackup(branchId);
};

module.exports = {
  getSettings,
  updateGeneral,
  updateNotifications,
  updatePassword,
  updateBranch,
  registerBackup,
};
