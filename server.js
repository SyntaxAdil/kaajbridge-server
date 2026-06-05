// dotenv
import dotenv from "dotenv";
dotenv.config();

// app import
import app from "./src/app.js";

// port
let port = process.env.PORT ?? 5000;

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
