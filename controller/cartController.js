import Cart from "../model/Cart.js";
import Product from "../model/productModel.js"; // ✅ Import Product model

// Add item to cart
export const addToCart = async (req, res) => {
  try {

     if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      toast.error('Invalid product ID');
      return;
    }
    const { userId, productId, quantity } = req.body;

    // ✅ Step 1: Check if product exists in DB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Step 2: Check if cart already exists for this user
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({ user: userId, items: [], totalAmount: 0 });
    }

    // ✅ Step 3: Check if product already in cart
    const itemIndex = cart.items.findIndex(item => 
      item.productId.toString() === product._id.toString()
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId: product._id, // ✅ Always use ObjectId
        quantity,
        price: product.price
      });
    }

    // ✅ Step 4: Update total amount
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await cart.save();
    return res.status(200).json(cart);
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({ message: "Server error while adding to cart" });
  }
};

// Get user cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId }).populate("items.productId");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ message: "Server error while fetching cart" });
  }
};
