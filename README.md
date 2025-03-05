## Social Media App

**Social Media Application**

## Project Description

A backend service for a social media application that allows users to connect socially through features like creating posts, commenting, liking, and following other users.

## Main Features

- **Create Posts**: Users can publish and share text and images.
- **Comments**: Users can comment on other users' posts.
- **Likes**: Users can like posts.

## Technologies Used

- **Backend**:
  - Node.js
  - Express.js for building APIs
  - GraphQL for querying data
  - MongoDB for data storage
  - JWT for authentication
  - bcrypt for password hashing
  - cryptoJs from encypt mobile number

## Security Measures

- **Password Hashing**: User passwords are securely hashed using **bcrypt** before being stored in the database.
- **JWT Authentication**: JSON Web Tokens (**JWT**) are used to authenticate and authorize users securely.
- **Data Protection**: Sensitive user information (such as passwords and phone numbers) is not exposed in API responses.
- **Role-Based Access Control (RBAC)**: Certain actions are restricted based on user roles and permissions.

## Requirements

- Node.js installed on the device
- A MongoDB database instance (local or cloud)

## Installation and Running

1. **Clone the repository**:
   
   ```bash
   git clone https://github.com/yassakhairy28/Social-Media-App.git
   ```

2. **Install dependencies**:
   
   ```bash
   cd Social-Media-App
   npm install
   ```

3. **Set up Environment Variables**:
   
   - Create a `.env` file in the root directory.
   - Add the following environment variables:
     
     ```env
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     ```

4. **Run the application**:
   
   ```bash
   npm start
   ```
   
   The backend service will start, ready to handle GraphQL API requests.

## Contributions

We welcome contributions from the community. To contribute, follow these steps:

1. **Fork the repository**.
2. **Create a new branch**:
   
   ```bash
   git checkout -b feature/feature-name
   ```

3. **Make necessary changes**.
4. **Push your changes to your branch**.
5. **Create a Pull Request**.


