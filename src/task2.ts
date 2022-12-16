import { createReadStream, createWriteStream, existsSync, WriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import * as readline from 'readline';
import csv from 'csvtojson';

const readFilePath = path.resolve(__dirname, 'csv/nodejs-hw1-ex1.csv');
const writeFilePath = path.resolve(__dirname, 'results/nodejs-hw1-ex1.txt');

class CsvToJsonConverter {
    public static async convertCsvToJson(
        filePath: string,
        writeFilePath: string,
    ): Promise<void> {
        const readableStream = createReadStream(filePath);
        const writableStream = await CsvToJsonConverter.createWritableStream(writeFilePath);

        const csvInstance = csv();
        const readlineInterface = readline.createInterface({
            input: readableStream,
            crlfDelay: Infinity,
        });

        readlineInterface.on('line', value => {
            csvInstance.write(`${value}\n`);
        });

        csvInstance.on('data', chunk => {
            const value = chunk.toString();
            writableStream.write(value);
        });

        readlineInterface.on('error', error => {
            console.error(`Read file error:\n${error}`);
        });

        csvInstance.on('error', error => {
            console.error(`Converting error:\n${error}`);
        });
    }

    private static async createWritableStream(writeFilePath: string): Promise<WriteStream> {
        const writeFileDirName = path.dirname(writeFilePath);
        if (!existsSync(writeFileDirName)) {
            await mkdir(writeFileDirName);
        }

        const writeStream = createWriteStream(writeFilePath);
        return writeStream;
    }
}

CsvToJsonConverter.convertCsvToJson(readFilePath, writeFilePath);
