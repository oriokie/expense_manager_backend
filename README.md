# Expense Management App

This is an expense management application built with:

- Node.js
- Express
- MongoDB: the database
- Redis: for caching

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- Redis

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/oriokie/expense_manager_backend.git
   ```

2. Install the dependencies:

   ```bash
   cd expense-management-app
   npm install
   ```

3. Create a `.env` file and add your MongoDB URI and Redis Configuration

   ```
   MONGO_URI=mongodb://localhost:27017/expense_manager_backend
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

### Running the APP

1. Start the MongoDB server:
   `mongod`

2. Start the Redis server:
   `redis-server`

3. Start the application:
   `npm run dev`

# API EndPoints

# Author

Edwin Orioki Kenyansa
