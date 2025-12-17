require("dotenv").config();
const serverPort = process.env.SERVER_PORT || 69;
const mongodbURL = process.env.MONGODB_ATLAS_URL;
const defaultImagePath = process.env.DEFAULT_USER_IMAGE_PATH || "public/images/users/user.png"; 
module.exports = {serverPort, mongodbURL, defaultImagePath};