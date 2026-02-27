require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await mongoose.connection
      .collection('users')
      .find({ resumeUrl: { $exists: true, $ne: '' } })
      .project({ _id: 0, email: 1, resume: 1, resumeUrl: 1 })
      .toArray();

    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
