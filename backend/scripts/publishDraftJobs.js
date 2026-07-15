require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hiresenseai';
    await mongoose.connect(mongoUri);

    const result = await mongoose.connection
      .collection('jobs')
      .updateMany({ status: 'draft' }, { $set: { status: 'published' } });

    console.log(JSON.stringify({ matched: result.matchedCount, modified: result.modifiedCount }));
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
