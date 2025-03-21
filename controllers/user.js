const prisma = require("../config/prisma");

exports.listUsers = async (req, res) => {
  try {
    const user = await prisma.user.findMany({
      select: {
        id: true, // true คือการ ระบุให้ Prisma ดึงข้อมูลจากฟิลด์ที่ระบุใน select มาในผลลัพธ์ของการค้นหา
        email: true,
        role: true,
        enabled: true,
        address: true,
      },
    });

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const { id, enabled } = req.body;

    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        enabled: enabled,
      },
    });

    res.send("Update Status Success");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { id, role } = req.body;

    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        role: role,
      },
    });

    res.send("Update Role Success");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.userCart = async (req, res) => {
  try {
    const { cart } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        id: Number(req.user.id),
      },
    });

    // Check Quantity เช็คสินค้าหมด
    for (const item of cart) {
      const product = await prisma.product.findUnique({
        where: {
          id: item.id,
        },
        select: {
          quantity: true,
          title: true,
        },
      });

      if (!product || item.count > product.quantity) {
        return res.status(400).json({
          ok: false,
          message: `${product?.title || "Product"} out of stock`,
        });
      }
      // console.log(product);
    }

    // Delete old Cart item
    await prisma.productOnCart.deleteMany({
      where: {
        cart: {
          orderedById: user.id,
        },
      },
    });

    // Delete old Cart
    await prisma.cart.deleteMany({
      where: {
        orderedById: user.id,
      },
    });

    // เตรียมสินค้า
    let products = cart.map((item) => ({
      productId: item.id,
      count: item.count,
      price: item.price,
    }));

    // หาผลรวม
    let cartTotal = products.reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );

    // New Cart
    const newCart = await prisma.cart.create({
      data: {
        products: {
          create: products,
        },
        cartTotal: cartTotal,
        orderedById: user.id,
      },
    });
    // console.log(newCart);

    res.send("Add Cart Success");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getUserCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json({
      products: cart.products,
      cartTotal: cart.cartTotal,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// เคลียข้อมูลในตะกร้าสินค้า
exports.emptyCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
    });

    if (!cart) {
      return res.status(400).json({ message: "No cart" });
    }

    await prisma.productOnCart.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    const result = await prisma.cart.deleteMany({
      where: {
        orderedById: Number(req.user.id),
      },
    });

    // console.log(result);
    res.json({
      message: "Cart Empty Success",
      deleteCount: result.count,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.saveAddress = async (req, res) => {
  try {
    const { address } = req.body;

    const addressUser = await prisma.user.update({
      where: {
        id: Number(req.user.id),
      },
      data: {
        address: address,
      },
    });

    res.json({ ok: true, message: "Update Address Success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.saveOrder = async (req, res) => {
  try {
    // Check Stripe
    const { id, amount, status, currency } = req.body.paymentIntent;

    // Get User Cart
    const userCart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
      include: {
        products: true,
      },
    });

    // Check Cart Empty
    if (!userCart || userCart.products.length === 0) {
      return res.status(400).json({ ok: false, message: "No product in cart" });
    }

    // หาร 100 เพราะว่า รับข้อมูลมาจากfront-endแล้วfront-endได้ทำการคูณ 100 เพราะ stripe เก็บหน่วยเป็นสตางค์ ตอนบันทึกลง database เลยต้อง หาร 100 เพื่อแปลงกลับ
    const amountTHB = Number(amount) / 100;
    // Create New Order
    const order = await prisma.order.create({
      data: {
        products: {
          create: userCart.products.map((item) => ({
            productId: item.productId,
            count: item.count,
            price: item.price,
          })),
        },
        orderedBy: {
          connect: {
            id: Number(req.user.id),
          },
        },
        cartTotal: userCart.cartTotal,
        stripePaymentId: id,
        amount: amountTHB,
        status: status,
        currency: currency,
      },
    });

    // Update Product Quantity
    const update = userCart.products.map((item) => ({
      where: {
        id: item.productId,
      },
      data: {
        quantity: { decrement: item.count },
        sold: { increment: item.count },
      },
    }));

    await Promise.all(update.map((updated) => prisma.product.update(updated)));

    await prisma.cart.deleteMany({
      where: {
        orderedById: Number(req.user.id),
      },
    });

    // console.log(update)
    res.json({ ok: true, order });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        orderedById: Number(req.user.id),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!orders.length === 0) {
      return res.status(400).json({ ok: false, message: "No order" });
    }

    res.json({ ok: true, orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
