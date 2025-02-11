const Order = require('../models/Order');
const { orderQueue } = require('../config/bull');
const User = require('../../auth-service/models/User');

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.userId; // Ensure user is authenticated
    if (!userId) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    const { products, totalPrice } = req.body;

    // Fetch user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the order
    const order = new Order({
      userId,
      products,
      totalPrice,
    });
    await order.save();

    // Add order processing job to BullMQ queue
    await orderQueue.add('processOrder', {
      orderId: order._id,
      userEmail: user.email,
      userName: user.name,
    });

    console.log(`Order processing job added for Order ID: ${order._id}`);

    // Respond with order details
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
};


exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
};