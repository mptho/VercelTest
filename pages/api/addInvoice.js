import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error("MONGODB_URI is required!");
}

async function addInvoice(req, res) {
  if (req.method === 'POST') {
    try {
      const mongoClient = new MongoClient(uri, options);
      await mongoClient.connect();
      const db = mongoClient.db("CNPM");
      const collection = db.collection("invoices");

      // Extract invoice data from the request body
      const invoiceData = req.body;

      // Add the invoice data to the database
      const result = await collection.insertOne(invoiceData);

      // If insertion fails
      if (!result.insertedId) {
        return res.status(500).json({ error: "Failed to insert invoice" });
      }

      // Return the invoice data with the inserted ID
      res.status(201).json({
        message: 'Invoice added successfully',
        invoice: { ...invoiceData, _id: result.insertedId }
      });

    } catch (error) {
      console.error('Error adding invoice:', error);
      res.status(500).json({ error: 'Failed to add invoice' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

export default addInvoice;
