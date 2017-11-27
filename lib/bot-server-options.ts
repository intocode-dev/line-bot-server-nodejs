import {ClientConfig} from '@line/bot-sdk';

export interface BotServerOptions extends ClientConfig {
  port?: number;
  key: string | Buffer;
  cert: string | Buffer;
}
