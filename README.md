# 🍔 TastyBytee

**TastyBytee** is your all-in-one food platform!  
Order your favorite dishes, explore mouth-watering recipes, apply for chef/kitchen jobs, and even shop for kitchen essentials — all in one place.  

---

## 🚀 Features

- **🍽️ Order Food** — Browse and order from our curated menu.
- **📖 Explore Recipes** — Discover tasty recipes and cooking tips.
- **💼 Apply for Jobs** — Find job openings.
- **🛒 Order Kitchen Items** — Get all your cooking essentials online.
- **🔒 Secure Authentication** — JWT-based login with cookies for session management.
- **🖼️ File Uploads** — Upload images using `multer`.
- **🔐 Password Security** — Encrypted passwords with `bcrypt`.

---

## 🛠️ Tech Stack

**Frontend:**  
- EJS Templates  
- HTML5, CSS3  
- JavaScript  

**Backend:**  
- Node.js  
- Express.js  

**Database:**  
- MongoDB (with Mongoose)  

**Security & Auth:**  
- JSON Web Token (JWT)  
- bcrypt for password hashing  
- cookie-parser for session handling  

**File Handling:**  
- multer for image uploads

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/mkhanz2/tastyBytee.git

# Move into the project folder
cd tastyBytee

# Install dependencies
npm install

# Create a .env file and set the required variables
PORT=3000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret

# Run the app
npm start
