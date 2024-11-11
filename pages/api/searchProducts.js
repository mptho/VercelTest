import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error("MONGODB_URI is required!");
}

async function getProductByName(req, res) {
  if (req.method === 'GET') {
     const searchQuery = req.query.name; // Lấy name từ query parameters
     console.log("Searching for:", searchQuery);

    try {
      // Kết nối tới MongoDB
      const mongoClient = new MongoClient(uri, options);
      await mongoClient.connect();
      const db = mongoClient.db("CNPM");
      const collection = db.collection("products");

      // Tìm sản phẩm theo tên (sử dụng regex để tìm kiếm gần đúng)
      const products = await collection.find({ name: { $regex: searchQuery, $options: "i" } }).toArray();
      console.log("Products found:", products); // Kiểm tra kết quả truy vấn

      if (!products || products.length === 0) {
        // Nếu không tìm thấy sản phẩm
        res.status(404).json({ error: "No products found" });
      } else {
        // Trả về danh sách sản phẩm phù hợp
        res.status(200).json(products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    } finally {
      await mongoClient.close();
    }
  } else {
    // Nếu không phải GET, trả về lỗi 405 Method Not Allowed
    res.status(405).json({ error: "Method Not Allowed" });
  }
}


export default getProductByName;
