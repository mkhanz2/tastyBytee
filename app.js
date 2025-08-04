const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const cookie = require("cookie-parser");
const jwt = require("jsonwebtoken");
const verifyUser = require("./authenticationMiddleWear")
app.set("view engine", "ejs");
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
app.use(cookie());
const path = require('path');
const PORT = process.env.PORT || 3000;

// EMAIL COMNFIRMATION
const email = require('./helper/sendEmail')
const emailAll= require('./helper/sendEmailAll')

// DATABASES
const userAcc = require("./Db/appDb");
const cart = require("./Db/cartDb")
const itemsOrdered = require("./Db/purchasedItems")
// PART 2 FOOD ORDER DB
const foodCart = require('./Db/order-foodCart')
const orderedFoodItems = require('./Db/orderedFood')
const purchasedItems = require("./Db/purchasedItems");
const orderFoodCart = require("./Db/order-foodCart");
const orderedFood = require("./Db/orderedFood");

// FOR SENDING EMAIL TO CUSTOMERS
const nodemailer = require('nodemailer');

require('dotenv').config()

// Route where user can see the account creation page
app.get("/", (req, res) => {
  res.render("createAcc");
});

//Route where user can create their account
app.post("/create-account", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let findUser = await userAcc.findOne({ email })

    if (findUser) {
      res.status(500).alert("User already registered")
    }

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        const user = await userAcc.create({
          username,
          email,
          password: hash,
        });

        const token = jwt.sign({ email: `${user.email}` }, "abc");
        res.cookie("token", token);
        console.log(req.cookies);
        res.redirect('/login');
      });
    });
  } catch (error) {
    res.status(500).send("Error in creating account");
  }
});

// Route where user can login / can see login page
app.get("/login", (req, res) => {
  res.render("login");
});

//Route where we will verify the user (Authenticate the user)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await userAcc.findOne({ username });

  if (!user) {
    return res.send("Something went wrong");
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      return res.status(500).send("Error in authentication");
    }

    if (result) {
      const token = jwt.sign({ email: user.email }, "abc");
      res.cookie("token", token);
      res.redirect('/home');
    } else {
      res.send("Wrong info");
    }
  });
});

// Home route where user can see dashboard/services we offer
app.get('/home', verifyUser, (req, res) => {
  res.render('home')
})


// BAKING ESSENTIAL ITEMS WILL BE DISPLAYED
app.get('/purchase-now', verifyUser, async (req, res) => {
  const cartItems = await cart.countDocuments({ email: req.user.email })
  res.render('items-pages', { cartItems })

})

// ORDER HISTORY
app.get('/order-history', verifyUser, async (req, res) => {

  const orderhistoryitems = await purchasedItems.countDocuments()

  if (!orderhistoryitems) {
    res.render('emptyOrder')
  }

  const orders = await itemsOrdered.find()
  console.log(orders);

  res.render('order-history', { orders })
})

// user  will click to account button which will redirect to account-details page
app.get('/account-details', (req, res) => {
  res.render('account-details')
})



// user can update their account info
app.post('/edit', verifyUser, async (req, res) => {
  const { name, address, email, number, dob } = req.body;

  try {
    // Build update object only with non-empty fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (address) updateFields.address = address;
    if (email) updateFields.email = email;
    if (number) updateFields.number = number;
    if (dob) updateFields.dob = new Date(dob);

    const result = await userAcc.updateOne(
      { email: req.user.email }, // based on email from token
      { $set: updateFields }
    );

    console.log("Update result:", result);
    res.send("done");

  } catch (error) {
    console.log("Error in update:", error);
    res.status(500).send("Error in updating profile, please try again later");
  }
});


// saved info will be displayed
app.get('/profile', verifyUser, async (req, res) => {  // Added verifyUser middleware
  try {
    const user = await userAcc.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).send("User not found");
    }


    res.render('profile', { user });

  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).send("Error loading profile");
  }
});


// USER CAN ADD TO CART BY THIS 
app.post('/add-to-cart', verifyUser, async (req, res) => {

  try {
    const { imgUrl, itemName, productDescription, price } = req.body;

    const cartItem = await cart.create({
      email: req.user.email,
      imgUrl,
      itemName,
      productDescription,
      price: `${req.body.price}`
    });

    console.log("Saved item:", cartItem); // Debug saved document
    res.redirect('/purchase-now');
  } catch (error) {
    console.error("Cart save error:", error);
    res.status(500).send("Error saving to cart");
  }
});



// VIEW CART PAGE
app.get('/cart', verifyUser, async (req, res) => {
  const itemsInCart = await cart.countDocuments()
  if (!itemsInCart) {
    res.render('emptyCart')
  } else {
    try {
      const userItem = await cart.find({ email: req.user.email });
      const price = await userItem.reduce((acc, item) => acc + item.price, 0)
      res.render('cart', { userItem, price });
    } catch (error) {
      console.error("Cart error:", error);
      res.status(500).send("Error loading cart");
    }
  }
});


//  TO REMOVE ITEMS FROM CART
app.get('/delete/:id', async (req, res) => {
  try {
    await cart.findOneAndDelete({ _id: req.params.id })
    res.redirect('/cart')
  } catch (error) {
    console.log(error)
    res.status(500).send("Error in removing item")
  }
})

// CHECKOUT PAGE WHERE USER WILL BE ABLE TO MAKE PURCHASE (LETS USER SELECT ONLY ONE ITEM TO PURCHASE)

app.get('/checkout/:id', verifyUser, async (req, res) => {

  const buyingItems = await cart.findOne({ _id: req.params.id });
  console.log(buyingItems)
  res.render('checkout', { buyingItems })
})

app.post('/payment', verifyUser, async (req, res) => {

  try {
    const { imgUrl, itemName, productDescription, price, shipment, totalPrice } = req.body

    const userOrder = await itemsOrdered.create({
      imgUrl,
      itemName,
      productDescription,
      price,
      shipment,
      totalPrice,
      email: req.user.email
    })

    email(req.user.email, {
      itemName,
      productDescription,
      price,
      shipment,
      totalPrice
    });


    res.send("order confirmed")
  } catch (error) {
    console.log(error)
    res.status(500).send("Error while placing order")
  }

})

// LET USER PURCHASE/ BUY MULTIPLE ITEMS AT A TIME "PROCEED TO BUY ALL /BUTTON"

// YET TO BE DONE

app.get('/checkout', verifyUser, async (req, res) => {

  try {
    const allItems = await cart.find({ email: req.user.email })
    res.render('checkoutAllItems', { allItems })

  } catch (error) {
    console.log(error)
    res.status(500).send("Error in checkout please try again later")
  }

})

app.post('/payment-all', verifyUser, async (req, res) => {
  try {
    const items = await cart.find({ email: req.user.email });

    if (items.length === 0) {
      return res.status(400).send("Cart is empty");
    }

    // Create ordered record in DB (optional)
    for (const item of items) {
      await itemsOrdered.create({ 
        email: req.user.email,
        imgUrl: item.imgUrl,
        itemName: item.itemName,
        productDescription: item.productDescription,
        price: item.price,
        totalPrice: item.price,
      });
    }

    // Create one HTML string for all items
    let htmlItems = "";
    let total = 0;

    items.forEach(item => {
        console.log("Current item:", item); 
      htmlItems += `
        <div style="margin-bottom: 20px;">
          <p><strong>Item:</strong> ${item.itemName}</p>
          <p><strong>Description:</strong> ${item.productDescription}</p>
          <p><strong>Price:</strong> ₹${item.price}</p>
          <hr />
        </div>
      `;
      total += item.price;
    });

    // Call email function ONCE
    emailAll(req.user.email, htmlItems, total);
    res.send("All items ordered & email sent");

  } catch (error) {
    console.error(error);
    res.status(500).send("Error in ordering");
  }
});





// PART 2 FROM HERE WE ARE CREATING ORDER FOOD PAGE _______________________

app.get('/order-now', verifyUser, async (req, res) => {
  const foodItems = await foodCart.countDocuments()
  res.render('order-now', { foodItems })
})

//  USER CAN ADD TO CART FROM HERE
app.post('/add-to-foodCart', verifyUser, async (req, res) => {

  try {
    const { imgUrl, itemName, productDescription, price } = req.body

    await orderFoodCart.create({
      email: req.user.email,
      imgUrl,
      itemName,
      productDescription,
      price: `${req.body.price}`
    })

    res.redirect("/order-now")

  } catch (error) {
    console.log(error)
    res.status(500).send("Error while adding the item to cart")
  }
})

// USER CAN VIEW THE CART

app.get('/order-foodCart', verifyUser, async (req, res) => {
  const itemsInCart = await foodCart.countDocuments()
  // console.log(itemsInCart)
  if (!itemsInCart) {
    res.render('empty-foodCart')
  } else {
    try {
      const foodCartItems = await foodCart.find();
      const price = await foodCartItems.reduce((acc, item) => acc + item.price, 0)
      res.render('order-foodCart', { foodCartItems, price });
    } catch (error) {
      console.error("Cart error:", error);
      res.status(500).send("Error loading cart");
    }
  }
});

// REMOVE FOOD ITEMS
app.get('/delete-food/:id', async (req, res) => {
  try {
    await foodCart.findOneAndDelete({ _id: req.params.id })
    res.redirect('/order-foodCart')
  } catch (error) {
    console.log(error)
    res.status(500).send('error while removing from cart')
  }
})

// CHECKOUT FOOD
app.get('/checkout-food/:id', async (req, res) => {
  const buyingItems = await foodCart.findOne({ _id: req.params.id })
  res.render('checkout-food', { buyingItems })
})

app.post('/payment-food', verifyUser, async (req, res) => {

  try {
    const { imgUrl, itemName, productDescription, price, shipment, totalPrice } = req.body
    console.log(req.body)

    await orderedFoodItems.create({
      imgUrl,
      itemName,
      productDescription,
      price,
      shipment,
      totalPrice
    })

    email(req.user.email, {
      itemName,
      productDescription,
      price,
      shipment,
      totalPrice
    });

    res.send("order placed successfully")

  } catch (error) {
    console.log(error)
    res.status(500).send("Error in ordering")
  }

})

// HERE USER CAN SEE ALL THE FOOD THEY ORDERED

app.get('/orderedFood', verifyUser, async (req, res) => {
  const orderedFoodItems = await orderedFood.countDocuments()

  if (!orderedFoodItems) {
    res.render('emptyFoodorder')
  }
  const foodOrders = await orderedFood.find()
  console.log(foodOrders)
  res.render('foodOrderHistory', { foodOrders })
})

app.get('/checkout-foodItems', verifyUser,async(req,res)=>{
  const allFoodItems= await foodCart.find({email: req.user.email})
  console.log(allFoodItems)
  res.render('foodCheckoutAll', {allFoodItems})
})

app.post('/payment-allFood', verifyUser, async (req, res) => {
  try {
    const items = await foodCart.find({ email: req.user.email });

    if (items.length === 0) {
      return res.status(400).send("Cart is empty");
    }

    // Create ordered record in DB (optional)
    for (const item of items) {
      await orderedFood.create({
        email: req.user.email,
        imgUrl: item.imgUrl,
        itemName: item.itemName,
        productDescription: item.productDescription,
        price: item.price,
        totalPrice: item.price,
      });
    }

    // Create one HTML string for all items
    let htmlItems = "";
    let total = 0;

    items.forEach(item => {
        console.log("Current item:", item); 
      htmlItems += `
        <div style="margin-bottom: 20px;">
          <p><strong>Item:</strong> ${item.itemName}</p>
          <p><strong>Description:</strong> ${item.productDescription}</p>
          <p><strong>Price:</strong> ₹${item.price}</p>
          <hr />
        </div>
      `;
      total += item.price;
    });

    // Call email function ONCE
    emailAll(req.user.email, htmlItems, total);
    res.send("All items ordered & email sent");

  } catch (error) {
    console.error(error);
    res.status(500).send("Error in ordering");
  }
});

// HERE NEW SECTION THAT IS EXPLORE RECEPIE SECTION IS STARTED

app.get('/explore-recepies',verifyUser, (req,res)=>{
  res.render('explore-recepies')
})

app.get('/chicken-chilli',verifyUser, (req,res)=>{
  res.render('chicken-chilli')
})

app.get('/muffin-recepie',verifyUser,(req,res)=>{
  res.render('muffin-recepie')
})

app.get('/chocolate-cake',verifyUser,(req,res)=>{
  res.render('chocolate-cake')
})


// Logout
app.get('/logout', (req, res) => {
  res.cookie("token", "")
  res.redirect('login')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})

module.exports = app;
