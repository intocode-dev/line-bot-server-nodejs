import {ClientConfig} from '@line/bot-sdk';

export interface BotServerOptions extends ClientConfig {
  port?: number;
}
