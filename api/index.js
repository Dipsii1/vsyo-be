import express from "express";
import serverless from "serverless-http";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "OK" });
});

export default serverless(app);