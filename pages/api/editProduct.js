import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error("MONGODB_URI is required!");
}

async function editProduct(req, res) {
  if (req.method === 'PUT') {
    console.log("Received PUT request for productId:", req.query.productId); 
    try {
      const { productId } = req.query; // Lấy productId từ query
      const updatedProduct = req.body; // Lấy thông tin sản phẩm cần cập nhật từ body

      if (!productId || !updatedProduct) {
        return res.status(400).json({ error: "Product ID and updated data are required" });
      }

      const mongoClient = new MongoClient(uri, options);
      await mongoClient.connect();
      const db = mongoClient.db("CNPM");
      const collection = db.collection("products");

      // Cập nhật sản phẩm sử dụng productId (không chuyển sang ObjectId)
      const result = await collection.updateOne(
        { productId: productId }, // Tìm sản phẩm theo productId
        { $set: updatedProduct } // Cập nhật thông tin sản phẩm
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.status(200).json({ message: "Product updated successfully" });

    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: "Failed to update product" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

export default editProduct;
