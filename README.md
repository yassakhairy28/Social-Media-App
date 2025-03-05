## Social-Media-App

**Social Media Application**

## Project Description

A backend service for a social media application that allows users to connect socially through features like creating posts, commenting, liking, and following other users.

## Main Features

- **Create Posts**: Users can publish and share text and images.
- **Comments**: Users can comment on other users' posts.
- **Likes**: Users can like posts.
- **Follow Users**: Users can follow each other to stay updated.
- **Notifications**: Users receive updates on interactions like comments, likes, and new followers.

## Technologies Used

- **Backend**:
  - Node.js
  - Express.js for building APIs
  - Firebase for authentication and data storage

## Requirements

- Node.js installed on the device
- A Firebase account with Authentication, Firestore, and Storage enabled

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

3. **Set up Firebase**:
   
   - Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
   - Enable Authentication, Firestore, and Storage services.
   - Download the `google-services.json` file and place it in the project root directory.

4. **Run the application**:
   
   ```bash
   npm start
   ```
   
   The backend service will start, ready to handle API requests.

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
