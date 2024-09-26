# MERN-Ecommerce

## Project Description
This is a full-stack eCommerce web application built with the MERN (MongoDB, Express.js, React.js, Node.js) stack. It includes features for both users and admins, covering the core functionality required for an online store.

## Features
### User Features
- User Registration and Authentication
- Product Browsing and Filtering
- Shopping Cart Management
- Secure Checkout with Payment Gateway Integration
- Order History and Tracking
- Product Reviews and Ratings

### Admin Features
- Product Management (Add, Edit, Delete)
- Order Management
- User Management
- Inventory Control

## Tech Stack
- **Frontend**: React.js, Redux, React Router,React-Toolkit -Query, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT, Bcrypt.js
- **Payment Gateway**: Stripe 
- **Deployment**: Heroku (Backend), Vercel (Frontend), MongoDB Atlas

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/MelakuAzene21/MERN-Ecommerce.git
    ```

2. Navigate to the project directory:

    ```bash
    cd MERN-Ecommerce
    ```

3. Install dependencies for both frontend and backend:

    ```bash
    # Backend
    cd backend
    npm install

    # Frontend
    cd ../frontend
    npm install
    ```

4. Create a `.env` file in the root of the backend directory with the following variables:

    ```env
    MONGO_URI=your_mongo_db_uri
    JWT_SECRET=your_jwt_secret
    STRIPE_SECRET_KEY=your_stripe_secret_key
    ```

5. Run the development servers:

    ```bash
    # Backend (inside /backend)
    npm run dev

    # Frontend (inside /frontend)
    npm start
    ```

## Usage

- Visit `http://localhost:3000` for the frontend React app.
- Visit `http://localhost:5000` for the backend API.

## Deployment

To deploy the application to production, follow the documentation for:
- [Heroku](https://www.heroku.com/) for the backend.
- [Vercel](https://vercel.com/) for the frontend.
