import * as LINEBot from '@line/bot-sdk';
import * as express from 'express';
import {BotServerOptions} from './bot-server-options';
import {Express, Router} from 'express';

export default class BotServer {
  options: BotServerOptions;
  client: LINEBot.Client;
  clientConfig: LINEBot.ClientConfig;
  server: Express;

  constructor(options: BotServerOptions) {
    this.options = options;

    if (!this.options.port) {
      throw new Error('Missing port option. Please set PORT environment variable.');
    }

    if (!this.options.channelSecret) {
      throw new Error('Missing channelSecret option. Please set CHANNEL_SECRET environment variable.');
    }

    if (!this.options.channelAccessToken) {
      throw new Error('Missing channelAccessToken option. Please set CHANNEL_ACCESS_TOKEN environment variable.');
    }

    this.clientConfig = {
      channelSecret: this.options.channelSecret,
      channelAccessToken: this.options.channelAccessToken
    };

    this.client = new LINEBot.Client(this.clientConfig);

    this.server = express();
  }

  public setWebhook(endpoint: string, callback: Router) {
    this.server.post(endpoint, LINEBot.middleware(this.clientConfig as LINEBot.MiddlewareConfig), callback);
  }

  public start(callback?: Function) {
    this.server.listen(this.options.port, callback);
  }

}
