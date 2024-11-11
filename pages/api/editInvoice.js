import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error("MONGODB_URI is required!");
}

async function editInvoice(req, res) {
  if (req.method === 'PUT') {
    console.log("Received PUT request for invoiceId:", req.query.invoiceId); 
    try {
      const { invoiceId } = req.query; // Lấy invoiceId từ query
      const updatedInvoice = req.body; // Lấy thông tin hóa đơn cần cập nhật từ body

      if (!invoiceId || !updatedInvoice) {
        return res.status(400).json({ error: "Invoice ID and updated data are required" });
      }

      const mongoClient = new MongoClient(uri, options);
      await mongoClient.connect();
      const db = mongoClient.db("CNPM");
      const collection = db.collection("invoices");

      // Cập nhật hóa đơn sử dụng invoiceId (không chuyển sang ObjectId)
      const result = await collection.updateOne(
        { invoiceId: invoiceId }, // Tìm hóa đơn theo invoiceId
        { $set: updatedInvoice } // Cập nhật thông tin hóa đơn
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      res.status(200).json({ message: "Invoice updated successfully" });

    } catch (error) {
      console.error('Error updating invoice:', error);
      res.status(500).json({ error: "Failed to update invoice" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

export default editInvoice;
