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
            channelAccessToken: 'testToken',
            key: 'keyFile',
            cert: 'certFile'
          } as BotServerOptions);
        }).to.throw('Missing options.port\nPlease set PORT environment variable.');
      });
    });

    describe('when channelSecret is not provided in options', () => {
      it('should throw an error', () => {
        expect(() => {
          new BotServer({
            channelAccessToken: 'test',
            port: 1234,
            key: 'keyFile',
            cert: 'certFile'
          } as BotServerOptions);
        }).to.throw('Missing options.channelSecret\nPlease set CHANNEL_SECRET environment variable.');
      });
    });

    describe('when channelAccessToken is not provided in options', () => {
      it('should throw an error', () => {
        expect(() => {
          new BotServer({
            channelSecret: 'test',
            port: 1234,
            key: 'keyFile',
            cert: 'certFile'
          } as BotServerOptions);
        }).to.throw('Missing options.channelAccessToken\nPlease set CHANNEL_ACCESS_TOKEN environment variable.');
      });
    });

    describe('when key is not provided in options', () => {
      it('should throw an error', () => {
        expect(() => {
          new BotServer({
            channelAccessToken: 'test',
            channelSecret: 'test',
            port: 1234,
            cert: 'certFile'
          } as BotServerOptions);
        }).to.throw('Missing options.key\nPlease set SSL_KEY environment variable.');
      });
    });

    describe('when cert is not provided in options', () => {
      it('should throw an error', () => {
        expect(() => {
          new BotServer({
            channelAccessToken: 'test',
            channelSecret: 'test',
            port: 1234,
            key: 'keyFile'
          } as BotServerOptions);
        }).to.throw('Missing options.cert\nPlease set SSL_CERT environment variable.');
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

  describe('start', () => {
    let server: BotServer;

    before(() => {
      server = new BotServer({
        channelAccessToken: 'test',
        channelSecret: 'test',
        port: 1234,
        key: 'keyFile',
        cert: 'certFile'
      });
    });

    it('should be startable', () => {
      expect(() => server.start()).not.to.throw;
    });

  });

});
