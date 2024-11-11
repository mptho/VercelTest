import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error("MONGODB_URI is required!");
}

async function addProduct(req, res) {
  if (req.method === 'POST') {
    try {
      const mongoClient = new MongoClient(uri, options);
      await mongoClient.connect();
      const db = mongoClient.db("CNPM");
      const collection = db.collection("products");

      // Dữ liệu sản phẩm từ yêu cầu
      const product = req.body;

      // Thêm sản phẩm vào cơ sở dữ liệu
      const result = await collection.insertOne(product);

      // Nếu result không có giá trị
      if (!result.insertedId) {
        return res.status(500).json({ error: "Failed to insert product" });
      }

      // Trả về thông tin sản phẩm đã thêm
      res.status(201).json({
        message: 'Product added successfully',
        product: { ...product, _id: result.insertedId }
      });

    } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({ error: 'Failed to add product' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

export default addProduct;
