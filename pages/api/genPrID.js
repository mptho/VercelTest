// pages/api/genID.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error("MONGODB_URI is required!");
}

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Kết nối tới MongoDB
      const mongoClient = new MongoClient(uri, options);
      await mongoClient.connect();
      const db = mongoClient.db("CNPM"); // Database bạn đang dùng
      const collection = db.collection("products"); // Collection cần làm việc

      // Lấy sản phẩm mới nhất
      const lastProduct = await collection.find().sort({ productId: -1 }).limit(1).toArray();

      let newProductId = "SP1";

      if (lastProduct.length > 0) {
        const lastProductId = lastProduct[0].productId;
        const numericPart = parseInt(lastProductId.replace("SP", ""), 10);
        newProductId = `SP${numericPart + 1}`;
      }

      // Trả về productId mới
      res.status(200).json({ productId: newProductId });
    } catch (error) {
      console.error("Error generating product ID:", error);
      res.status(500).json({ error: "Failed to generate product ID" });
    }
  } else {
    // Nếu không phải GET, trả về lỗi 405 Method Not Allowed
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

export default handler;