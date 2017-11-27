import * as LINEBot from '@line/bot-sdk';
import * as express from 'express';
import {BotServerOptions} from './bot-server-options';
import {Express, Router} from 'express';

export default class BotServer {
  options: BotServerOptions;
  client: LINEBot.Client;
  clientConfig: LINEBot.ClientConfig;
  app: Express;

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

    this.clientConfig = {
      channelSecret: this.options.channelSecret,
      channelAccessToken: this.options.channelAccessToken
    };

    this.client = new LINEBot.Client(this.clientConfig);

    this.app = express();

    this.app.get('/status', (req, res) => {
      res.status(200);
      res.end();
    });
  }

  public setWebhook(endpoint: string, callback: Router) {
    this.app.post(endpoint, LINEBot.middleware(this.clientConfig as LINEBot.MiddlewareConfig), callback);
  }

  public start(callback?: Function) {
    this.app.listen(this.options.port, callback);
  }

}
