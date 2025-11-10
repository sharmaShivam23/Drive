# 1️⃣ Use official Node.js image
FROM node:18-alpine

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# 4️⃣ Copy rest of the backend files
COPY . .

# 5️⃣ Expose backend port
EXPOSE 5000

# 6️⃣ Start your app
CMD ["npm", "start"]
