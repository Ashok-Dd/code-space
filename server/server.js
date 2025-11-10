import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const server = http.createServer(app);

// ✅ Optional rate limiting
const limiter = rateLimit({
  windowMs: 10 * 1000, // 10 sec
  max: 50, // 50 requests per 10 sec
});
app.use(limiter);

// ✅ Mongoose Schema
const codeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
  },
});

const CodeSpace = mongoose.model("CodeSpace", codeSchema);

// ✅ POST: Create new code
app.post("/", async (req, res) => {
  try {
    const { id, code } = req.body;
    if (!id || !code)
      return res.status(400).json({ success: false, message: "id & code required!" });

    const existing = await CodeSpace.findOne({ id });
    if (existing)
      return res.status(400).json({ success: false, message: "id already exists!" });

    const newCode = await CodeSpace.create({ id, code });
    return res.status(201).json({ success: true, data: newCode });
  } catch (error) {
    console.error("Error in posting code:", error);
    return res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

// ✅ PUT: Update existing code
app.put("/update", async (req, res) => {
  try {
    const { id, code } = req.body;
    if (!id || !code)
      return res.status(400).json({ success: false, message: "id & code required!" });

    const updated = await CodeSpace.findOneAndUpdate({ id }, { code }, { new: true });
    if (!updated)
      return res.status(404).json({ success: false, message: "id not found!" });

    return res.status(200).json({ success: true, message: "Code updated successfully!", data: updated });
  } catch (error) {
    console.error("Error updating code:", error);
    return res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

// ✅ GET: Get code by ID
app.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const grabbed = await CodeSpace.findOne({ id });

    if (!grabbed) return res.status(404).json({ success: false, message: "Code not found!" });
    return res.status(200).send(grabbed.code);
  } catch (error) {
    console.log("Error fetching code: ", error);
    return res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

// ✅ GET: Check ID availability
app.get("/check/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await CodeSpace.findOne({ id });
    return res.status(200).json({ exists: !!existing });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    server.listen(4000, () => {
      console.log("🚀 Server running at http://localhost:4000");
    });
  })
  .catch((err) => console.log("❌ Failed to connect DB:", err));
