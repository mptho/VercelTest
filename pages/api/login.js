import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error("MONGODB_URI is required!");
}

export default async function handler(request, response) {
  if (request.method === "POST") {
    const { username, password } = request.body;

    try {
      const mongoClient = new MongoClient(uri, options);
      await mongoClient.connect();
      const db = mongoClient.db("CNPM");  // Sử dụng tên DB của bạn
      const collection = db.collection("users");  // Sử dụng collection 'users'

      const user = await collection.findOne({ username });

      if (!user) {
        return response.status(404).json({ success: false, message: "User not found" });
      }

      if (user.password === password) {
        return response.status(200).json({ success: true, message: "Login successful" });
      } else {
        return response.status(401).json({ success: false, message: "Incorrect password" });
      }
    } catch (error) {
      console.error(error);
      return response.status(500).json({ success: false, message: "Server error" });
    }
  } else {
    return response.status(405).json({ success: false, message: "Method not allowed" });
  }
}
