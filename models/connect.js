const mongoose = require("mongoose");

const DB_URI = process.env.DB_URI;

if (!DB_URI) {
  throw new Error(
    "Please define the DB_URI environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

module.exports = async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      // bufferMaxEntries: 0,
      // useFindAndModify: true,
      // useCreateIndex: true,
    };

    cached.promise = mongoose.connect(DB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

require("./Match");
require("./Message");
require("./Participant");
require("./Provider");
