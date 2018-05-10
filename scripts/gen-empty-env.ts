import * as fs from 'fs-extra';
import * as path from 'path';
import { BotServer } from '../lib/bot-server';

const envPath = path.resolve(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
  BotServer.generateEnvFile(envPath);
  console.log('Generated environment file: ' + envPath);
  console.log('Please configure environment variables before start the server.');
}
