import mongoose from "mongoose";

const promoSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discount: { type: Number, required: true, min: 1, max: 90 },
  allowedUsers: { type: [String], default: [] }, // empty = all users allowed
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
});

const Promo = mongoose.models.Promo || mongoose.model("Promo", promoSchema);
export default Promo;
