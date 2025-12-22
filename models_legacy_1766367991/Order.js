import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "user" },
  items: [
    {
      product: { type: String, required: true, ref: "Product" },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
  amount: { type: Number, required: true },
  address: { type: String, ref: "Address", required: true },
  status: { type: String, default: "Order Placed", required: true },
  date: { type: Number, required: true },
});

const Order = mongoose.models.order || mongoose.model("order", orderSchema);

export default Order;
