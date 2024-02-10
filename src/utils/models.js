import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  seller: String,
  buyer: String,
  title: String,
  price: Number,
  frozen: Boolean
});

const conditionSchema = new mongoose.Schema({
  parent: String,
  content: String,
  acceptedSeller: Boolean,
  acceptedBuyer: Boolean,
});

export const Transaction = mongoose.models.transactions || mongoose.model("transactions", transactionSchema);
export const Condition = mongoose.models.conditions ||mongoose.model("conditions", conditionSchema);
