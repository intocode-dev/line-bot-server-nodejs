import * as fs from 'fs-extra';
import BotServer from '../lib/bot-server';

if (!fs.existsSync('.env')) {
  BotServer.generateEnvFile('.env');
}
