const { Command } = require('commander');
const fs = require('fs');
const { pipeline } = require('stream');
const { Readable } = require('stream'); // Добавляем Readable
const { Transform } = require('stream');
const { processInput } = require('./streams');
const readline = require('readline');

const program = new Command();

program
  .option('-i, --input <path>', 'Input file path')
  .option('-o, --output <path>', 'Output file path')
  .requiredOption('-t, --task <task>', 'Task to execute');

program.parse(process.argv);

const options = program.opts();

async function run() {
  let inputStream, outputStream;

  // Setup input stream
  if (options.input) {
    try {
      inputStream = fs.createReadStream(options.input);
      inputStream.on('error', (err) => {
        process.stderr.write(`Error reading input file: ${err.message}\n`);
        process.exit(1);
      });
    } catch (err) {
      process.stderr.write(`Error accessing input file: ${err.message}\n`);
      process.exit(1);
    }
  } else {
    inputStream = process.stdin;
  }

  // Setup output stream
  if (options.output) {
    try {
      outputStream = fs.createWriteStream(options.output);
      outputStream.on('error', (err) => {
        process.stderr.write(`Error writing to output file: ${err.message}\n`);
        process.exit(1);
      });
    } catch (err) {
      process.stderr.write(`Error accessing output file: ${err.message}\n`);
      process.exit(1);
    }
  } else {
    outputStream = process.stdout;
  }

  // Transform stream for task processing
  const transformStream = processInput(options.task);

  // Handle console input for continuous processing
  if (!options.input) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', (line) => {
      // Преобразуем строку в поток
      const inputStream = Readable.from([line]);
      pipeline(
        inputStream,
        transformStream,
        outputStream,
        (err) => {
          if (err) {
            process.stderr.write(`Error processing input: ${err.message}\n`);
            // Не завершаем процесс, чтобы продолжать принимать ввод
          }
        }
      );
    });

    rl.on('close', () => {
      process.exit(0);
    });
  } else {
    // Process file input
    pipeline(
      inputStream,
      transformStream,
      outputStream,
      (err) => {
        if (err) {
          process.stderr.write(`Error in pipeline: ${err.message}\n`);
          process.exit(1);
        }
      }
    );
  }
}

run().catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});