import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error("MONGODB_URI is required!");
}

async function getInvoiceById(req, res) {
  if (req.method === 'GET') {
    const { invoiceId } = req.query; // Lấy invoiceId từ query parameters

    let mongoClient; // Declare mongoClient here to ensure it's in scope for both try and finally

    try {
      // Kết nối tới MongoDB
      mongoClient = new MongoClient(uri, options);
      await mongoClient.connect();
      const db = mongoClient.db("CNPM");
      const collection = db.collection("invoices");

      // Tìm hóa đơn theo invoiceId
      const invoice = await collection.findOne({ invoiceId: invoiceId });

      if (!invoice) {
        // Nếu không tìm thấy hóa đơn
        res.status(404).json({ error: "Invoice not found" });
      } else {
        // Trả về thông tin hóa đơn
        res.status(200).json(invoice);
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    } finally {
      // Ensure mongoClient is defined before attempting to close it
      if (mongoClient) {
        await mongoClient.close();
      }
    }
  } else {
    // Nếu không phải GET, trả về lỗi 405 Method Not Allowed
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

export default getInvoiceById;
