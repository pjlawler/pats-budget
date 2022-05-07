const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// The MongoDB schema definition for the transaction 
const transactionSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: "Enter a name for transaction"
    },
    value: {
      type: Number,
      required: "Enter an amount"
    },
    date: {
      type: Date,
      default: Date.now
    }
  }
);

// creates the MongoDB model for the transaction based on the outline schema above
const Transaction = mongoose.model("Transaction", transactionSchema);

// exports the model for use by the rest of the app
module.exports = Transaction;
