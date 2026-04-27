const paymentsService = require("../Services/paymentsService");

const createPayment = async (req, res) => {
  try {
    const payment = await paymentsService.registerPayment(req.body);
    res.status(201).json({
      message: "Pago registrado exitosamente",
      payment
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPaymentDetails = async (req, res) => {
  try {
    const data = await paymentsService.getPaymentHistory(req.params.ventaId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPayment,
  getPaymentDetails
};
