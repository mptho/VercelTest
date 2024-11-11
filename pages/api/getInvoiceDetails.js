import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const options = {};

async function getInvoiceDetails(req, res) {
  if (req.method === 'GET') {
    try {
      const { invoiceId } = req.query;
      if (!invoiceId) {
        return res.status(400).json({ error: "Invoice ID is required" });
      }

      const mongoClient = new MongoClient(uri, options);
      await mongoClient.connect();
      const db = mongoClient.db("CNPM");
      const collection = db.collection("invoices");

      // Tìm hóa đơn theo invoiceId
      const invoice = await collection.findOne({ invoiceId: invoiceId });
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Trả về thông tin hóa đơn và sản phẩm
      res.status(200).json({
        invoiceId: invoice.invoiceId,
        customerName: invoice.customerName,
        status: invoice.status,
        dateCreated: invoice.dateCreated,
        totalAmount: invoice.totalAmount,
        products: invoice.products, // Giả sử `products` là mảng chứa thông tin sản phẩm trong hóa đơn
      });
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      res.status(500).json({ error: "Failed to fetch invoice details" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

export default getInvoiceDetails;
