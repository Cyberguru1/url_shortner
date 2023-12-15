const crypto = require('crypto');

// Function to generate a random hash string
 function generateRandomHash(length) {
  const randomValue = crypto.randomBytes(length);
  const hash = crypto.createHash('sha256');
  hash.update(randomValue);
  const hashString = hash.digest('hex');
  return hashString;
}

module.exports = generateRandomHash;
