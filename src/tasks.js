function createPhoneNumber(numbers) {
    if (!Array.isArray(numbers) || numbers.length !== 10 || !numbers.every(n => Number.isInteger(n) && n >= 0 && n <= 9)) {
      throw new Error('Invalid input: Expected an array of 10 integers (0-9)');
    }
    const [a, b, c, d, e, f, g, h, i, j] = numbers;
    return `(${a}${b}${c}) ${d}${e}${f}-${g}${h}${i}${j}`;
  }
  
  module.exports = { createPhoneNumber };