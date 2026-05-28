const prisma = require('../lib/prisma');

// Obtener todo el menú
exports.getAllMenu = async () => {

    return await prisma.menu.findMany({
        orderBy: [
            {
                categoria: 'asc'
            },

            {
                nombre: 'asc'
            }
        ]
    });
};

// Obtener producto por ID
exports.getMenuById = async (id) => {

    return await prisma.menu.findUnique({
        where: {
            id: Number(id)
        }
    });
};

// Crear producto
exports.createMenuItem = async (
    item
) => {

    const {
        nombre,
        descripcion,
        categoria,
        precio,
        ingredientes,
        tiempo_preparacion,
        disponible
    } = item;

    return await prisma.menu.create({
        data: {
            nombre,
            descripcion,
            categoria,
            precio,
            ingredientes,
            tiempo_preparacion,

            disponible:
                disponible !== undefined
                    ? disponible
                    : true
        }
    });
};

// Actualizar producto
exports.updateMenuItem = async (
    id,
    item
) => {

    return await prisma.menu.update({
        where: {
            id: Number(id)
        },

        data: {
            ...item
        }
    });
};

// Eliminar producto
exports.deleteMenuItem = async (
    id
) => {

    await prisma.menu.delete({
        where: {
            id: Number(id)
        }
    });

    return {
        message: 'Producto eliminado'
    };
};

// Obtener menú por categoría
exports.getMenuByCategory = async (
    categoria
) => {

    return await prisma.menu.findMany({
        where: {
            categoria,
            disponible: true
        },

        orderBy: {
            nombre: 'asc'
        }
    });
};

// Obtener productos disponibles
exports.getAvailableMenu = async () => {

    return await prisma.menu.findMany({
        where: {
            disponible: true
        },

        orderBy: [
            {
                categoria: 'asc'
            },

            {
                nombre: 'asc'
            }
        ]
    });
};

// Obtener categorías
exports.getCategories = async () => {

    const categories =
        await prisma.menu.findMany({

        where: {
            categoria: {
                not: null
            }
        },

        distinct: ['categoria'],

        select: {
            categoria: true
        },

        orderBy: {
            categoria: 'asc'
        }
    });

    return categories.map(
        item => item.categoria
    );
};