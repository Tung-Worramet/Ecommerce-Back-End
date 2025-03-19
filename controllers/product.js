const prisma = require("../config/prisma");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUNDINARY_CLOUND_NAME,
  api_key: process.env.CLOUNDINARY_API_KEY,
  api_secret: process.env.CLOUNDINARY_API_SECRET,
});

exports.create = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } =
      req.body;

    const product = await prisma.product.create({
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });

    res.send(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { count } = req.params;

    const products = await prisma.product.findMany({
      take: parseInt(count),
      orderBy: { createdAt: "desc" },
      // ถ้าอยากได้อย่างอื่นด้วยให้ include แล้วจะเพิ่มเข้ามา
      include: {
        category: true,
        images: true,
      },
    });

    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.read = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await prisma.product.findFirst({
      where: {
        id: Number(id),
      },
      // ถ้าอยากได้อย่างอื่นด้วยให้ include แล้วจะเพิ่มเข้ามา
      include: {
        category: true,
        images: true,
      },
    });

    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } =
      req.body;

    // Clear images
    await prisma.image.deleteMany({
      where: {
        productId: Number(req.params.id),
      },
    });

    const product = await prisma.product.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });

    res.send(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1 ค้นหาสินค้า include images
    const product = await prisma.product.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        images: true,
      },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    console.log(product);

    // Step 2 Promise ลบรูปภาพใน cloud ลบแบบ รอฉันด้วย
    const deleteImage = product.images.map(
      (image) =>
        new Promise((resolve, reject) => {
          // ลบจาก cloud
          cloudinary.uploader.destroy(image.public_id, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        })
    );
    // product.images.forEach(async (image) => {
    //   await cloudinary.uploader.destroy(image.public_id);
    // });
    await Promise.all(deleteImage);

    // Step 3 ลบสินค้า
    await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });

    res.send("Removed Success");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.listby = async (req, res) => {
  try {
    const { sort, order, limit } = req.body;

    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { [sort]: order }, // sort เป็นชื่อ key ว่าจะเอา key ไหนมาใช้ order เป็นการจัดเรียงมากไปน้อย น้อยไปมาก "desc" "asc"
      include: { category: true, images: true },
    });

    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

const handleQuery = async (req, res, query) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

const handleCategory = async (req, res, categoryId) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryId.map((id) => Number(id)), // loop ค้นหาเป็น array
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

const handlePrice = async (req, res, priceRange) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        price: {
          gte: priceRange[0], // ค่ามากกว่า
          lte: priceRange[1], // ค่าน้อยกว่า
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
exports.searchFilters = async (req, res) => {
  try {
    const { query, category, price } = req.body;

    if (query) {
      console.log("query : ", query);
      await handleQuery(req, res, query);
    }

    if (category) {
      console.log("category : ", category);
      await handleCategory(req, res, category);
    }

    if (price) {
      console.log("price : ", price);
      await handlePrice(req, res, price);
    }

    // res.send("searchFilters");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.createImages = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      public_id: `${Date.now()}`,
      resource_type: "auto",
      folder: "Ecom",
    });

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.removeImages = async (req, res) => {
  try {
    const { public_id } = req.body;
    // console.log(public_id);

    cloudinary.uploader.destroy(public_id, (result) => {
      res.send("Remove Image Success");
    }); // destroy คือ ทำลาย
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
