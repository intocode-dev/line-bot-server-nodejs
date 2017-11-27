import * as chai from 'chai';
import BotServer from '../../lib/bot-server';
import {BotServerOptions} from '../../lib/bot-server-options';

const expect = chai.expect;

describe('BotServer', () => {

  describe('constructor', () => {

    describe('when port is not provided in options', () => {
      it('should throw an error', () => {
        expect(() => {
          new BotServer({
            channelSecret: 'testSecret',
            channelAccessToken: 'testToken'
          } as BotServerOptions);
        }).to.throw('Missing port option. Please set PORT environment variable.');
      });
    });

    describe('when channelSecret is not provided in options', () => {
      it('should throw an error', () => {
        expect(() => {
          new BotServer({
            channelAccessToken: 'test',
            port: 1234
          } as BotServerOptions);
        }).to.throw('Missing channelSecret option. Please set CHANNEL_SECRET environment variable.');
      });
    });

    describe('when channelAccessToken is not provided in options', () => {
      it('should throw an error', () => {
        expect(() => {
          new BotServer({
            channelSecret: 'test',
            port: 1234
          } as BotServerOptions);
        }).to.throw('Missing channelAccessToken option. Please set CHANNEL_ACCESS_TOKEN environment variable.');
      });
    });

    describe('when all required properties is provided in options', () => {
      it('should not throw an error', () => {
        expect(() => {
          new BotServer({
            channelSecret: 'testSecret',
            channelAccessToken: 'testToken',
            port: 1234
          } as BotServerOptions);
        }).not.to.throw;
      });
    });
  });
});
