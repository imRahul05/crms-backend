const multer = require('multer');

// For memory storage (optional: switch to disk if needed)
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
