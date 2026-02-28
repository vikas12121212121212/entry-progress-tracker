const express = require("express");
const cors = require("cors");

const entryRoutes =
  require("./routes/route");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/entries", entryRoutes);

app.listen(5000, () =>
  console.log("Server running")
);