const mongoose = require("./mongoose.service").mongoose;
const Schema = mongoose.Schema;

const valuesSchema = new Schema({ 
    balance: { 
      type: Number, 
      required: true 
    }, 
    percent: {
      type: Number,
      required: true 
    },
    created_at: {
      type: Date,
      required: true
    }
});

exports.values = mongoose.model("values", valuesSchema);

const transactionsSchema = new Schema({ 
  hash:{
    type: String, 
    required: true 
  },
  to: { 
    type: String, 
    required: true 
  }, 
  from: {
    type: String,
    required: true 
  },
  value:{
    type: String,
    required: true 
  },
  gasPrice:{
    type: String, 
    required: true 
  },
  input:{
    type: String, 
    required: true 
  },
  blockNumber:{
    type: String, 
    required: true 
  },
  created_at: {
    type: Date,
    required: true
  }
});

exports.transactions = mongoose.model("transactions", transactionsSchema);