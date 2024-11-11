// deleteProduct.js
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error("MONGODB_URI is required!");
}

async function deleteProduct(req, res) {
  if (req.method === 'DELETE') {
    try {
      const { productId } = req.query; // Lấy productId từ query

      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const mongoClient = new MongoClient(uri, options);
      await mongoClient.connect();
      const db = mongoClient.db("CNPM");
      const collection = db.collection("products");

      // Chuyển productId thành ObjectId nếu nó là chuỗi
      const objectId = new ObjectId(productId);

      // Xóa sản phẩm theo productId
      const result = await collection.deleteOne({ _id: objectId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.status(200).json({ message: "Product deleted successfully" });

    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

export default deleteProduct;
