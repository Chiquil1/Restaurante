const prisma = require('../lib/prisma');

// Obtener todas las mesas
exports.getAllTables = async (filters = {}) => {
    const tables = await prisma.mesas.findMany({
        where: filters.estado
            ? { estado: filters.estado }
            : {},
        orderBy: [
            { piso: 'asc' },
            { numero: 'asc' }
        ]
    });

    return tables;
};

// Obtener estados de mesas
exports.getTableStates = async () => {
    return await prisma.mesas.findMany({
        select: {
            id: true,
            numero: true,
            estado: true,
            capacidad: true,
            cliente: true,
            total: true,
            mesero_id: true,
            piso: true,
            ubicacion: true
        },
        orderBy: [
            { piso: 'asc' },
            { numero: 'asc' }
        ]
    });
};

// Obtener mesa por ID
exports.getTableById = async (id) => {
    return await prisma.mesas.findUnique({
        where: {
            id: Number(id)
        }
    });
};

// Obtener mesas por números
exports.getTablesByNumbers = async (numeros) => {
    return await prisma.mesas.findMany({
        where: {
            numero: {
                in: numeros
            }
        }
    });
};

// Crear mesa
exports.createTable = async (tableData) => {
    const {
        numero,
        capacidad,
        piso,
        ubicacion,
        estado,
        mesero_id,
        cliente,
        total
    } = tableData;

    return await prisma.mesas.upsert({
        where: {
            numero
        },
        update: {
            capacidad,
            piso,
            ubicacion,
            estado,
            mesero_id,
            cliente,
            total
        },
        create: {
            numero,
            capacidad,
            piso,
            ubicacion,
            estado: estado || 'libre',
            mesero_id,
            cliente,
            total: total || 0
        }
    });
};

// Actualizar mesa
exports.updateTable = async (id, tableData) => {
    return await prisma.mesas.update({
        where: {
            id: Number(id)
        },
        data: {
            ...tableData
        }
    });
};

// Eliminar mesa
exports.deleteTable = async (id) => {
    await prisma.mesas.delete({
        where: {
            id: Number(id)
        }
    });

    return {
        message: 'Mesa eliminada correctamente'
    };
};

// Actualizar estado
exports.updateTableStatus = async (
    id,
    estado,
    mesero_id = null,
    cliente = null
) => {
    return await prisma.mesas.update({
        where: {
            id: Number(id)
        },
        data: {
            estado,
            mesero_id,
            cliente
        }
    });
};

// Liberar mesa
exports.liberarMesa = async (id) => {
    return await prisma.mesas.update({
        where: {
            id: Number(id)
        },
        data: {
            estado: 'libre',
            cliente: null,
            total: 0,
            mesero_id: null
        }
    });
};