const Product = require('../models/Product');
const Cart = require('../models/Cart'); // Assuming you have a Cart model
const upload = require('../utils/upload');
const s3 = require('../utils/aws-config');

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, imageUrl, stockQuantity } = req.body;
    let uploadedImageUrl = imageUrl;

    if (req.files && req.files.imageUrl) {
      const image = req.files.imageUrl;
      const params = {
        Bucket: 'eneye-images',
        Key: `products/${Date.now()}-${image.name}`,
        Body: image.data,
        ContentType: image.mimetype,
        ACL: 'public-read',
      };
      const uploadResult = await s3.upload(params).promise();
      uploadedImageUrl = uploadResult.Location;
    }

    if (!uploadedImageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const product = new Product({
      title,
      description,
      price,
      imageUrl: uploadedImageUrl,
      stockQuantity,
      sellerId: req.user.userId,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, imageUrl, stockQuantity } = req.body;
    const product = await Product.findOneAndUpdate(
      { _id: id, sellerId: req.user.userId },
      { title, description, price, imageUrl, stockQuantity },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id, sellerId: req.user.userId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    const imageUrl = product.imageUrl;
    const bucketName = 'eneye-images';
    const region = 'eu-north-1';
    const bucketDomain = `https://${bucketName}.s3.${region}.amazonaws.com/`;
    if (!imageUrl.startsWith(bucketDomain)) {
      return res.status(400).json({ message: 'Invalid image URL' });
    }

    const key = imageUrl.replace(bucketDomain, '');
    await s3.deleteObject({ Bucket: bucketName, Key: key }).promise();
    await Product.findByIdAndDelete(id);

    res.json({ message: 'Product and associated image deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

// Cart Operations
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart', error });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error });
  }
};
