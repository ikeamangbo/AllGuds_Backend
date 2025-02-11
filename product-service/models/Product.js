const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stockQuantity: { type: Number, required: true },
  type: {
    type: String,
    enum: [
      "Electronics",
      "Home and Kitchen",
      "Books and Stationery",
      "Fashion",
      "Sports and Outdoors",
      "Toys and Games",
      "Beauty and Cosmetics",
      "Automotive",
      "Health and Personal Care",
      "Jewelry and Accessories",
      "Groceries and Food",
      "Tools and Hardware",
      "Office Supplies",
      "Musical Instruments",
      "Furniture",
      "Art and Craft",
      "Video Games and Consoles",
      "Music",
    ],
  },
  wishlist: { type: Boolean, default: false }, // New wishlist field
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
