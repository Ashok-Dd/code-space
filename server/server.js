import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({origin : '*'}));

const server = http.createServer(app);

// ✅ Proper Mongoose Schema
const codeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true
  }
});

const CodeSpace = mongoose.model("CodeSpace", codeSchema);

// ✅ POST: Create or Update code
app.post("/", async (req, res) => {
  try {
    const { id, code } = req.body;

    if (!id || !code)
      return res.status(400).json({ success: false, message: "id & code required!" });

    const grabbed = await CodeSpace.findOneAndUpdate(
      { id },
      { code },
      { new: true, upsert: true }
    );

    return res.status(200).json({ success: true, data: grabbed });

  } catch (error) {
    console.log("Error in posting code: ", error);
    return res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

// ✅ GET: Get code by id param
app.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const grabbed = await CodeSpace.findOne({ id });

    if (!grabbed) {
      return res.status(404).json({ success: false, message: "Code not found!" });
    }

    return res.status(200).send(grabbed.code);

  } catch (error) {
    console.log("Error fetching code: ", error);
    return res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

// ✅ Connect DB THEN run server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    server.listen(4000, () => {
      console.log("🚀 Server running at http://localhost:4000");
    });
  })
  .catch((err) => console.log("❌ Failed to connect DB:", err));
