import * as fs from 'fs-extra';
import * as path from 'path';
import {BotServer} from '../lib/bot-server';

fs.ensureDir(path.resolve(__dirname, '../ssl'));

BotServer.generateDefaultSSLAsync();
