const prisma = require("../config/prisma");
const stripe = require("stripe")(
  "sk_test_51QwaFyAlv5QLA796O11fIsOBdsD8320ArI7qakdunEZ6XCHIge5e1jETA3rNM9oSRSfyBMfg68VKfoIz8ulUmHvA00Uc39cvAS"
);

exports.payment = async (req, res) => {
  try {
    // Check user
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
    });
    const amountTHB = cart.cartTotal * 100; // * 100 เพราะว่าค่าเงืนหน่วยเป็นสตางค์

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTHB,
      currency: "thb",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
