const prisma = require('../lib/prisma');

// Obtener todo el personal
exports.getAllStaff = async () => {

    return await prisma.personal.findMany({
        orderBy: {
            id: 'asc'
        }
    });
};

// Obtener personal por ID
exports.getStaffById = async (id) => {

    return await prisma.personal.findUnique({
        where: {
            id: Number(id)
        }
    });
};

// Crear personal
exports.createStaff = async (staff) => {

    const {
        nombre,
        apellido,
        dni_curp,
        email,
        telefono,
        direccion,
        puesto,
        salario,
        turno,
        username,
        password_hash,
        rol_permisos,
        estado
    } = staff;

    return await prisma.personal.create({
        data: {
            nombre,
            apellido,
            dni_curp,
            email,
            telefono,
            direccion,
            puesto,
            salario,
            turno,
            username,
            password_hash,
            rol_permisos,

            estado:
                estado || 'activo'
        }
    });
};

// Actualizar personal
exports.updateStaff = async (
    id,
    staff
) => {

    return await prisma.personal.update({
        where: {
            id: Number(id)
        },

        data: {
            ...staff
        }
    });
};

// Eliminar personal
exports.deleteStaff = async (id) => {

    await prisma.personal.delete({
        where: {
            id: Number(id)
        }
    });

    return {
        message: 'Personal eliminado'
    };
};

// Buscar por username
exports.getStaffByUsername = async (
    username
) => {

    return await prisma.personal.findUnique({
        where: {
            username
        }
    });
};

// ── Ausencias ──

// Obtener ausencias
exports.getAusencias = async () => {

    return await prisma.personal_ausencias.findMany({
        include: {
            personal: {
                select: {
                    nombre: true,
                    apellido: true
                }
            }
        },

        orderBy: {
            id: 'desc'
        }
    });
};

// Crear ausencia
exports.createAusencia = async (
    ausencia
) => {

    const {
        personal_id,
        tipo,
        fecha_inicio,
        fecha_fin,
        motivo
    } = ausencia;

    return await prisma.personal_ausencias.create({
        data: {
            personal_id,
            tipo,

            fecha_inicio:
                new Date(fecha_inicio),

            fecha_fin:
                fecha_fin
                    ? new Date(fecha_fin)
                    : null,

            motivo
        }
    });
};

// Eliminar ausencia
exports.deleteAusencia = async (
    id
) => {

    await prisma.personal_ausencias.delete({
        where: {
            id: Number(id)
        }
    });

    return {
        message: 'Ausencia eliminada'
    };
};