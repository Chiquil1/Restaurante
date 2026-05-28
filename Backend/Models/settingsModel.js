const prisma = require('../lib/prisma');

// ── Configuración General ──

// Obtener configuración
exports.getConfig = async () => {

    return await prisma.configuracion_general.findFirst({
        orderBy: {
            id: 'desc'
        }
    });
};

// Actualizar configuración
exports.updateConfig = async (config) => {

    const {
        nombreNegocio,
        moneda,
        horario_apertura,
        horario_cierre,
        telefono,
        email
    } = config;

    return await prisma.configuracion_general.update({
        where: {
            id: 1
        },

        data: {
            nombreNegocio,
            moneda,
            horario_apertura,
            horario_cierre,
            telefono,
            email
        }
    });
};

// Crear configuración
exports.createConfig = async (config) => {

    const {
        nombreNegocio,
        moneda,
        horario_apertura,
        horario_cierre,
        telefono,
        email
    } = config;

    return await prisma.configuracion_general.create({
        data: {
            nombreNegocio,
            moneda,
            horario_apertura,
            horario_cierre,
            telefono,
            email
        }
    });
};

// ── Sucursales ──

// Obtener sucursales
exports.getSucursales = async () => {

    return await prisma.sucursales.findMany({
        orderBy: {
            id: 'asc'
        }
    });
};

// Obtener sucursal por ID
exports.getSucursalById = async (id) => {

    return await prisma.sucursales.findUnique({
        where: {
            id: Number(id)
        }
    });
};

// Crear sucursal
exports.createSucursal = async (
    sucursal
) => {

    const {
        nombreSucursal,
        direccion,
        ciudad,
        estado,
        codigoPostal,
        telefono
    } = sucursal;

    return await prisma.sucursales.create({
        data: {
            nombreSucursal,
            direccion,
            ciudad,
            estado,
            codigoPostal,
            telefono
        }
    });
};

// Actualizar sucursal
exports.updateSucursal = async (
    id,
    sucursal
) => {

    return await prisma.sucursales.update({
        where: {
            id: Number(id)
        },

        data: {
            ...sucursal
        }
    });
};

// Eliminar sucursal
exports.deleteSucursal = async (id) => {

    await prisma.sucursales.delete({
        where: {
            id: Number(id)
        }
    });

    return {
        message: 'Sucursal eliminada'
    };
};