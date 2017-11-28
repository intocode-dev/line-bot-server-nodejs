import * as fs from 'fs-extra';
import * as path from 'path';
import * as pem from 'pem';
import * as LINEBot from '@line/bot-sdk';
import * as express from 'express';
import * as https from 'https';
import {BotServerOptions} from './bot-server-options';
import {ErrorRequestHandler, Express, RequestHandler, Router} from 'express';

export default class BotServer {
  static defaultSSLKey = path.resolve(__dirname, '../ssl/localhost.key');
  static defaultSSLCert = path.resolve(__dirname, '../ssl/localhost.crt');

  options: BotServerOptions;
  client: LINEBot.Client;
  clientConfig: LINEBot.ClientConfig;
  app: Express;
  https: https.Server;

  constructor(options: BotServerOptions) {

    this.options = options;

    if (!this.options.port) {
      throw new Error('Missing options.port\nPlease set PORT environment variable.');
    }

    if (!this.options.channelSecret) {
      throw new Error('Missing options.channelSecret\nPlease set CHANNEL_SECRET environment variable.');
    }

    if (!this.options.channelAccessToken) {
      throw new Error('Missing options.channelAccessToken\nPlease set CHANNEL_ACCESS_TOKEN environment variable.');
    }

    if (!this.options.key) {
      throw new Error('Missing options.key\nPlease set SSL_KEY environment variable.');
    }

    if (!this.options.cert) {
      throw new Error('Missing options.cert\nPlease set SSL_CERT environment variable.');
    }

    this.clientConfig = {
      channelSecret: this.options.channelSecret,
      channelAccessToken: this.options.channelAccessToken
    };

    this.client = new LINEBot.Client(this.clientConfig);

    this.app = express();

    this.https = https.createServer({
      key: fs.readFileSync(this.options.key),
      cert: fs.readFileSync(this.options.cert)
    }, this.app);

  }

  public enableStatusEndpoint() {
    this.app.get('/status', (req, res) => {
      res.status(200);
      res.end();
    });
  }

  public setWebhook(endpoint: string, callback: RequestHandler | ErrorRequestHandler) {
    this.app.post(endpoint, LINEBot.middleware(this.clientConfig as LINEBot.MiddlewareConfig), callback);
  }

  public start() {
    this.https.listen(this.options.port);
  }

  static generateDefaultSSLAsync(days: number = 9999, selfSigned: boolean = true) {

    return new Promise((resolve, reject) => {
      if (!fs.existsSync(BotServer.defaultSSLKey) || !fs.existsSync(BotServer.defaultSSLCert)) {
        pem.createCertificate({ days: days, selfSigned: selfSigned }, (err, keys) => {
          if (err) {
            return reject(err);
          }

          fs.writeFileSync(BotServer.defaultSSLKey, keys.serviceKey);
          fs.writeFileSync(BotServer.defaultSSLCert, keys.certificate);

          return resolve(true);
        });
      } else {
        return resolve(true);
      }
    });
  }

  static getEnvOptions(): BotServerOptions {
    return {
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
      channelSecret: process.env.CHANNEL_SECRET || '',
      port: (process.env.PORT) ? Number(process.env.PORT) : 443,
      key: process.env.SSL_KEY || '',
      cert: process.env.SSL_CERT || ''
    };
  }

  static generateEnvFile(fileName: string, options: BotServerOptions = {} as BotServerOptions) {
    if (/^\./.test(fileName) === false) {
      throw new Error('File name must starts with dot "."');
    }

    let buffer = new Buffer(
      'CHANNEL_ACCESS_TOKEN=' + (options.channelAccessToken || '') + '\n' +
      'CHANNEL_SECRET=' + (options.channelSecret || '') + '\n' +
      'PORT=' + (options.port || '') + '\n' +
      'SSL_KEY=' + (options.key || '') + '\n' +
      'SSL_CERT=' + (options.cert || '') + '\n'
    );

    fs.writeFileSync(fileName, buffer);
  }
}
