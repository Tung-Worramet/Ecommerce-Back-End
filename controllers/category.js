const prisma = require("../config/prisma");

exports.create = async (req, res) => {
  try {
    const { name } = req.body;

    const category = await prisma.category.create({
      data: {
        name: name,
      },
    });

    res.send(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.send(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.delete({
      where: {
        id: Number(id),
      },
    });
    res.send(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
