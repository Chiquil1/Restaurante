const Payments = require("../Models/paymentsModel");

const registerPayment = async (data) => {
  return await Payments.createPayment(data);
};

const getPaymentHistory = async (ventaId) => {
  const history = await Payments.getPaymentsBySale(ventaId);
  const balance = await Payments.getSaleBalance(ventaId);
  return {
    ...balance,
    payments: history
  };
};

module.exports = {
  registerPayment,
  getPaymentHistory
};
