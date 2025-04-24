const { Transform } = require('stream');
const { createPhoneNumber } = require('./tasks');

function processInput(task) {
  return new Transform({
    transform(chunk, encoding, callback) {
      try {
        const input = chunk.toString().trim();
        let numbers;

        try {
          numbers = JSON.parse(input);
        } catch (err) {
          callback(new Error('Invalid input format: Expected a JSON array'));
          return;
        }

        if (task === 'createPhoneNumber') {
          const result = createPhoneNumber(numbers);
          callback(null, Buffer.from(result + '\n'));
        } else {
          callback(new Error('Unknown task'));
        }
      } catch (err) {
        callback(err);
      }
    }
  });
}

module.exports = { processInput };