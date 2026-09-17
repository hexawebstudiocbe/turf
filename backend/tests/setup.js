const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Pre-initialize indexes on models
  const User = require('../src/models/User');
  const Turf = require('../src/models/Turf');
  const Booking = require('../src/models/Booking');
  const BlockedSlot = require('../src/models/BlockedSlot');

  await Promise.all([
    User.init(),
    Turf.init(),
    Booking.init(),
    BlockedSlot.init(),
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});
