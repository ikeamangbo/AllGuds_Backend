const Product = require('../models/Product');
const Cart = require('../models/Cart'); // Assuming you have a Cart model
const upload = require('../utils/upload');
const s3 = require('../utils/aws-config');

const FormatData = (data) => {
  return { data };
};

exports.createProduct = async (req, res) => {
  try {
    console.log('Received product data:', req.body);
    console.log('Field validation:', {
      hasName: !!req.body.name,
      hasDesc: !!req.body.desc,
      hasType: !!req.body.type,
      hasPrice: !!req.body.price,
      hasStock: !!req.body.stock,
      hasImg: !!req.body.img
    });

    const { name, desc, type, price, stock, img } = req.body;
    // Get seller from auth middleware
    const seller = req.user?.id || req.user?.userId;

    if (!seller) {
      return res.status(401).json({ 
        message: 'Unauthorized - Seller ID not found',
        error: 'No seller ID in request'
      });
    }

    // Validate required fields
    const missingFields = {
      name: !name,
      desc: !desc,
      type: !type,
      price: !price,
      stock: !stock,
      img: !img,
      seller: !seller
    };

    const hasMissingFields = Object.values(missingFields).some(missing => missing);

    if (hasMissingFields) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({ 
        message: 'All fields are required',
        missing: missingFields
      });
    }

    const product = new Product({
      name: name.trim(),
      desc: desc.trim(),
      type,
      price: parseFloat(price),
      stock: parseInt(stock),
      img,
      seller,
      available: parseInt(stock) > 0
    });

    console.log('Creating product with data:', {
      ...product.toObject(),
      hasName: !!product.name,
      hasDesc: !!product.desc,
      hasType: !!product.type,
      hasPrice: !!product.price,
      hasStock: !!product.stock,
      hasImg: !!product.img,
      hasSeller: !!product.seller
    });

    const savedProduct = await product.save();
    
    const formattedProduct = {
      _id: savedProduct._id.toString(),
      name: savedProduct.name,
      desc: savedProduct.desc,
      type: savedProduct.type,
      price: parseFloat(savedProduct.price),
      stock: parseInt(savedProduct.stock),
      img: savedProduct.img,
      seller: savedProduct.seller.toString(),
      available: savedProduct.stock > 0
    };

    res.status(201).json({ data: formattedProduct });
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({ 
      message: 'Error creating product',
      error: error.message,
      details: error.errors // Include validation errors if any
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .select('-__v')
      .lean()
      .exec();

    const formattedProducts = products.map(product => ({
      _id: product._id.toString(),
      name: product.name || '',
      desc: product.desc || '',
      type: product.type || '',
      price: parseFloat(product.price) || 0,
      img: product.img || '',
      stock: parseInt(product.stock) || 0,
      seller: product.seller?.toString() || '',
      available: (product.stock || 0) > 0
    }));

    res.status(200).json(FormatData(formattedProducts));
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('-__v')
      .lean()
      .exec();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const formattedProduct = {
      _id: product._id.toString(),
      name: product.name,
      desc: product.desc,
      type: product.type,
      price: parseFloat(product.price),
      img: product.img,
      stock: parseInt(product.stock),
      seller: product.seller.toString(),
      available: product.stock > 0
    };

    res.status(200).json(FormatData(formattedProduct));
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, desc, type, price, img, stock } = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        desc,
        type,
        price: parseFloat(price),
        img,
        stock: parseInt(stock),
        available: parseInt(stock) > 0
      },
      { new: true }
    ).lean();

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const formattedProduct = {
      _id: updatedProduct._id.toString(),
      name: updatedProduct.name,
      desc: updatedProduct.desc,
      type: updatedProduct.type,
      price: parseFloat(updatedProduct.price),
      img: updatedProduct.img,
      stock: parseInt(updatedProduct.stock),
      seller: updatedProduct.seller.toString(),
      available: updatedProduct.stock > 0
    };

    res.status(200).json(FormatData(formattedProduct));
  } catch (error) {
    console.error('Error in updateProduct:', error);
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
