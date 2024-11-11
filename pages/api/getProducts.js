// getProducts.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error("MONGODB_URI is required!");
}

async function getProducts(req, res) {
  if (req.method === 'GET') {
    try {
      // Kết nối tới MongoDB
      const mongoClient = new MongoClient(uri, options);
      await mongoClient.connect();
      const db = mongoClient.db("CNPM"); // Database bạn đang dùng
      const collection = db.collection("products"); // Collection cần làm việc

      // Lấy tất cả sản phẩm
      const products = await collection.find().toArray();

      // Trả về danh sách sản phẩm
      res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  } else {
    // Nếu không phải GET, trả về lỗi 405 Method Not Allowed
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

export default getProducts;
