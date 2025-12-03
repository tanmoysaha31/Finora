const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mansuruntsarah_db_user:ABdureJm7Xscw4Li@ac-qiqgjwz-shard-00-00.wpyijvp.mongodb.net:27017,ac-qiqgjwz-shard-00-01.wpyijvp.mongodb.net:27017,ac-qiqgjwz-shard-00-02.wpyijvp.mongodb.net:27017/Jaiga?ssl=true&replicaSet=atlas-qapf2c-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = mongoose;
