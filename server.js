// Step 1 Import
const express = require("express");
const app = express();
const morgan = require("morgan");
const { readdirSync } = require("fs");
const cors = require("cors");
const swaggerDocs = require("./config/swagger"); // Import Swagger

//const authRouter = require("./routes/auth");

// Middleware
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" })); // อ่านไฟล์ Json
app.use(cors());

// นำ Swagger ไปใช้
swaggerDocs(app);

// app.use("/api", authRouter);
readdirSync("./routes").map((item) =>
  app.use("/api", require("./routes/" + item))
);

// Step 3 Router

// Step 2 Start Server
app.listen(5000, () => console.log(`Server is running on port 5000`));
