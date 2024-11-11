import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error("MONGODB_URI is required!");
}

async function getProductById(req, res) {
  if (req.method === 'GET') {
    const { productId } = req.query; // Lấy productId từ query parameters

    try {
      // Kết nối tới MongoDB
      const mongoClient = new MongoClient(uri, options);
      await mongoClient.connect();
      const db = mongoClient.db("CNPM");
      const collection = db.collection("products");

      // Tìm sản phẩm theo productId (chuỗi ID từ DataTable)
      const product = await collection.findOne({ productId: productId });

      if (!product) {
        // Nếu không tìm thấy sản phẩm
        res.status(404).json({ error: "Product not found" });
      } else {
        // Trả về thông tin sản phẩm
        res.status(200).json(product);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    } finally {
      await mongoClient.close();
    }
  } else {
    // Nếu không phải GET, trả về lỗi 405 Method Not Allowed
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

export default getProductById;
