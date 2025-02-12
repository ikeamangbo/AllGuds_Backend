const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  desc: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Electronics',
      'Fashion',
      'Home Appliances',
      'Furniture',
      'Home Decor',
      'Smart Home',
      'Personal Care',
      'Fitness',
      'Wearables',
      'Kitchenware',
      'Books',
      'Sports',
      'Beauty',
      'Toys & Games',
      'Outdoor'
    ]
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  img: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  available: {
    type: Boolean,
    default: true
  },
  wishlist: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);