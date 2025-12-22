import mongoose from "mongoose";

// import { ref } from "node:process";

const productSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "User" },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  offerPrice: { type: Number, required: true },
  image: { type: Array, required: true },
  date: { type: Number, required: true },
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
