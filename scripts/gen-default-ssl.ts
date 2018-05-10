import * as path from 'path';
import { BotServer } from '../lib/bot-server';

BotServer.generateDefaultSSLAsync(path.resolve(__dirname, '../ssl'));
