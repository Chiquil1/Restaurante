const dashboardModel = require('../Models/dashboardModel');

exports.getVentasHoy = async (req, res) => {
    try {
        const result = await dashboardModel.getVentasHoy();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getClientesHoy = async (req, res) => {
    try {
        const result = await dashboardModel.getClientesHoy();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPedidosActivos = async (req, res) => {
    try {
        const result = await dashboardModel.getPedidosActivos();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMesasOcupadas = async (req, res) => {
    try {
        const result = await dashboardModel.getMesasOcupadas();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTotalMesas = async (req, res) => {
    try {
        const result = await dashboardModel.getTotalMesas();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDashboardSummary = async (req, res) => {
    try {
        const ventasHoy = await dashboardModel.getVentasHoy();
        const clientesHoy = await dashboardModel.getClientesHoy();
        const pedidosActivos = await dashboardModel.getPedidosActivos();
        const mesasOcupadas = await dashboardModel.getMesasOcupadas();
        const totalMesas = await dashboardModel.getTotalMesas();
        
        res.json({
            ventasHoy: ventasHoy.total,
            clientesHoy: clientesHoy.total,
            pedidosActivos: pedidosActivos.total,
            mesasOcupadas: mesasOcupadas.total,
            totalMesas: totalMesas.total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
