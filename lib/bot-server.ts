import * as LINEBot from '@line/bot-sdk';
import * as Dotenv from 'dotenv';
import {DotenvOptions} from 'dotenv';
import * as express from 'express';
import {ErrorRequestHandler, Express, RequestHandler} from 'express';
import * as fs from 'fs-extra';
import * as https from 'https';
import * as path from 'path';
import * as pem from 'pem';
import {BotServerOptions} from './bot-server-options';

export class BotServer {
  public static defaultSSLKey = path.resolve(__dirname, '../ssl/localhost.key');
  public static defaultSSLCert = path.resolve(__dirname, '../ssl/localhost.crt');

  public static generateDefaultSSLAsync(days: number = 9999, selfSigned: boolean = true) {

    return new Promise((resolve, reject) => {
      if (!fs.existsSync(BotServer.defaultSSLKey) || !fs.existsSync(BotServer.defaultSSLCert)) {
        pem.createCertificate({days, selfSigned}, (err, keys) => {
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

  public static getEnvOptions(options?: DotenvOptions): BotServerOptions {
    Dotenv.config(options);

    return {
      cert: process.env.SSL_CERT || '',
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
      channelSecret: process.env.CHANNEL_SECRET || '',
      key: process.env.SSL_KEY || '',
      port: (process.env.PORT) ? Number(process.env.PORT) : 443
    };
  }

  public static generateEnvFile(fileName: string, options: BotServerOptions = {} as BotServerOptions) {
    const buffer = new Buffer(
      'CHANNEL_ACCESS_TOKEN=' + (options.channelAccessToken || '') + '\n' +
      'CHANNEL_SECRET=' + (options.channelSecret || '') + '\n' +
      'PORT=' + (options.port || '') + '\n' +
      'SSL_KEY=' + (options.key || '') + '\n' +
      'SSL_CERT=' + (options.cert || '') + '\n'
    );

    fs.writeFileSync(fileName, buffer);
  }

  public options: BotServerOptions;
  public client: LINEBot.Client;
  public clientConfig: LINEBot.ClientConfig;
  public app: Express;
  public https: https.Server;

  constructor(options?: BotServerOptions) {

    this.options = options || BotServer.getEnvOptions();

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
      channelAccessToken: this.options.channelAccessToken,
      channelSecret: this.options.channelSecret
    };

    this.client = new LINEBot.Client(this.clientConfig);

    this.app = express();

    this.https = https.createServer({
      cert: fs.readFileSync(this.options.cert),
      key: fs.readFileSync(this.options.key)
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

}
