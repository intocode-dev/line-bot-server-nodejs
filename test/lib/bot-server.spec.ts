import * as fs from 'fs-extra';
import * as path from 'path';
import * as _ from 'lodash';
import * as chai from 'chai';
import * as ChaiAsPromised from 'chai-as-promised';
import * as dotenv from 'dotenv';
import * as sinon from 'sinon';
import * as pem from 'pem';
import * as LINEBot from '@line/bot-sdk';
import BotServer from '../../lib/bot-server';
import {BotServerOptions} from '../../lib/bot-server-options';
import {SinonStub} from 'sinon';

chai.use(ChaiAsPromised);

const expect = chai.expect;

describe('BotServer', () => {
  let fullOptions: BotServerOptions = {
      channelSecret: 'testSecret',
      channelAccessToken: 'testToken',
      port: 1234,
      key: BotServer.defaultSSLKey,
      cert: BotServer.defaultSSLCert
    },
    sandbox = sinon.createSandbox();

  describe('constructor', () => {

    describe('when port is not provided in options', () => {
      it('should throw an error', () => {
        let options = _.cloneDeep(fullOptions);

        delete options.port;

        expect(() => new BotServer(options)).to.throw('Missing options.port\nPlease set PORT environment variable.');
      });
    });

    describe('when channelSecret is not provided in options', () => {
      it('should throw an error', () => {
        let options = _.cloneDeep(fullOptions);

        delete options.channelSecret;

        expect(() => new BotServer(options)).to.throw('Missing options.channelSecret\nPlease set CHANNEL_SECRET environment variable.');
      });
    });

    describe('when channelAccessToken is not provided in options', () => {
      it('should throw an error', () => {
        let options = _.cloneDeep(fullOptions);

        delete options.channelAccessToken;

        expect(() => new BotServer(options)).to.throw('Missing options.channelAccessToken\nPlease set CHANNEL_ACCESS_TOKEN environment variable.');
      });
    });

    describe('when key is not provided in options', () => {
      it('should throw an error', () => {
        let options = _.cloneDeep(fullOptions);

        delete options.key;

        expect(() => new BotServer(options)).to.throw('Missing options.key\nPlease set SSL_KEY environment variable.');
      });
    });

    describe('when key file does not exists', () => {
      let options: BotServerOptions;

      before(() => {
        options = _.cloneDeep(fullOptions);

        options.key += '.not-exists';
      });

      it('should throw an error', () => {
        expect(() => new BotServer(options)).to.throw;
      });

    });

    describe('when key file has wrong content', () => {
      let options: BotServerOptions;

      before(() => {
        options = _.cloneDeep(fullOptions);

        options.key += '.wrong';

        fs.ensureFileSync(options.key as string);
      });

      it('should throw an error', () => {
        expect(() => new BotServer(options)).to.throw;
      });

      after(() => {
        fs.removeSync(options.key as string);
      });

    });

    describe('when cert is not provided in options', () => {
      it('should throw an error', () => {
        let options = _.cloneDeep(fullOptions);

        delete options.cert;

        expect(() => new BotServer(options)).to.throw('Missing options.cert\nPlease set SSL_CERT environment variable.');
      });
    });

    describe('when cert file does not exists', () => {
      let options: BotServerOptions;

      before(() => {
        options = _.cloneDeep(fullOptions);

        options.cert += '.not-exists';
      });

      it('should throw an error', () => {
        expect(() => new BotServer(options)).to.throw;
      });

    });

    describe('when cert file has wrong content', () => {
      let options: BotServerOptions;

      before(() => {
        options = _.cloneDeep(fullOptions);

        options.cert += '.wrong';

        fs.ensureFileSync(options.cert as string);
      });

      it('should throw an error', () => {
        expect(() => new BotServer(options)).to.throw;
      });

      after(() => {
        fs.removeSync(options.cert as string);
      });

    });

    describe('when all required options are provided correctly', () => {
      let server: BotServer;

      before(() => {
        let options = _.cloneDeep(fullOptions);

        server = new BotServer(options);
      });

      it('should create express instance', () => {
        expect(server.app).not.to.be.undefined;
      });

      it('should create https instance', () => {
        expect(server.https).not.to.be.undefined;
      });

      it('should create LINE bot client configuration', () => {
        expect(server.clientConfig).not.to.be.undefined;
      });

      it('should create LINE bot client instance', () => {
        expect(server.client).not.to.be.undefined;
      });

    });

  });

  describe('start', () => {
    let server: BotServer,
      stubListen: SinonStub;

    before(() => {
      server = new BotServer(fullOptions);
      stubListen = sandbox.stub(server.https, 'listen');
      server.start();
    });

    it('should be able to start with correct port', () => {
      expect(stubListen.getCall(0).args[0]).to.equal(fullOptions.port);
    });

    after(() => {
      stubListen.restore();
    });

  });

  describe('setWebHook', () => {
    let server: BotServer,
      stubPost: SinonStub,
      stubMiddleware: SinonStub,
      callback = () => {},
      endpoint = '/testing';

    before(() => {
      server = new BotServer(fullOptions);
      stubPost = sandbox.stub(server.app, 'post');
      stubMiddleware = sandbox.stub(LINEBot, 'middleware');
      server.setWebhook(endpoint, callback);
    });

    it('should set endpoint', () => {
      expect(stubPost.getCall(0).args[0]).to.equal(endpoint);
    });

    it('should set middleware', () => {
      expect(stubMiddleware.getCall(0).args[0]).to.equal(server.clientConfig);
    });

    it('should set callback', () => {
      expect(stubPost.getCall(0).args[2]).to.equal(callback);
    });

    after(() => {
      stubMiddleware.restore();
      stubPost.restore();
    });

  });

  describe('generateEnvFile', () => {

    describe('when file name starts with dot', () => {

      describe('and options is empty', () => {
        let testEnvFile = '.test-gen-empty.env',
          expectedConfigObject: { [name: string]: string };

        before(() => {
          BotServer.generateEnvFile(testEnvFile, {} as BotServerOptions);
          expectedConfigObject = dotenv.parse(fs.readFileSync(testEnvFile));
        });

        it('should create a file with empty variables', () => {
          expect(expectedConfigObject.CHANNEL_SECRET).to.equal('');
          expect(expectedConfigObject.CHANNEL_ACCESS_TOKEN).to.equal('');
          expect(expectedConfigObject.PORT).to.equal('');
          expect(expectedConfigObject.SSL_KEY).to.equal('');
          expect(expectedConfigObject.SSL_CERT).to.equal('');
        });

        after(() => {
          fs.removeSync(testEnvFile);
        });

      });

      describe('and options is not provided', () => {
        let testEnvFile = '.test-gen-empty.env',
          expectedConfigObject: { [name: string]: string };

        before(() => {
          BotServer.generateEnvFile(testEnvFile);
          expectedConfigObject = dotenv.parse(fs.readFileSync(testEnvFile));
        });

        it('should create a file with empty variables', () => {
          expect(expectedConfigObject.CHANNEL_SECRET).to.equal('');
          expect(expectedConfigObject.CHANNEL_ACCESS_TOKEN).to.equal('');
          expect(expectedConfigObject.PORT).to.equal('');
          expect(expectedConfigObject.SSL_KEY).to.equal('');
          expect(expectedConfigObject.SSL_CERT).to.equal('');
        });

        after(() => {
          fs.removeSync(testEnvFile);
        });

      });

      describe('and options provided correctly', () => {
        let testEnvFile = '.test-gen.env',
          expectedConfigObject: { [name: string]: string };

        before(() => {
          BotServer.generateEnvFile(testEnvFile, fullOptions);
          expectedConfigObject = dotenv.parse(fs.readFileSync(testEnvFile));
        });

        it('should create a file with correct variables', () => {
          expect(expectedConfigObject.CHANNEL_SECRET).to.equal(fullOptions.channelSecret);
          expect(expectedConfigObject.CHANNEL_ACCESS_TOKEN).to.equal(fullOptions.channelAccessToken);
          expect(expectedConfigObject.PORT).to.equal(String(fullOptions.port));
          expect(expectedConfigObject.SSL_KEY).to.equal(fullOptions.key);
          expect(expectedConfigObject.SSL_CERT).to.equal(fullOptions.cert);
        });

        after(() => {
          fs.removeSync(testEnvFile);
        });

      });

    });

  });

  describe('generateDefaultSSLAsync', () => {

    describe('when key file not exists', () => {
      let stubCreateCert: SinonStub,
        stubFileExists: SinonStub;

      before(() => {
        stubFileExists = sandbox.stub(fs, 'existsSync');
        stubCreateCert = sandbox.stub(pem, 'createCertificate');
        stubFileExists.onFirstCall().returns(false);
        stubFileExists.onSecondCall().returns(true);
        BotServer.generateDefaultSSLAsync();
      });

      it('should create certificate and key files', () => {
        expect(stubCreateCert.calledOnce).to.be.true;

      });

      after(() => {
        stubFileExists.restore();
        stubCreateCert.restore();
      });

    });

    describe('when cert file not exists', () => {
      let stubCreateCert: SinonStub,
        stubFileExists: SinonStub;

      before(() => {
        stubFileExists = sandbox.stub(fs, 'existsSync');
        stubCreateCert = sandbox.stub(pem, 'createCertificate');
        stubFileExists.onFirstCall().returns(true);
        stubFileExists.onSecondCall().returns(false);
        BotServer.generateDefaultSSLAsync();
      });

      it('should create certificate and key files', () => {
        expect(stubCreateCert.calledOnce).to.be.true;
      });

      after(() => {
        stubFileExists.restore();
        stubCreateCert.restore();
      });

    });

    describe('when key and cert files exists', () => {
      let stubCreateCert: SinonStub,
        stubFileExists: SinonStub;

      before(() => {
        stubFileExists = sandbox.stub(fs, 'existsSync');
        stubCreateCert = sandbox.stub(pem, 'createCertificate');
        stubFileExists.onFirstCall().returns(true);
        stubFileExists.onSecondCall().returns(true);
        BotServer.generateDefaultSSLAsync();
      });

      it('should not create certificate and key files', () => {
        expect(stubCreateCert.called).to.be.false;
      });

      after(() => {
        stubFileExists.restore();
        stubCreateCert.restore();
      });

    });

    describe('when pem module cannot create certificate', () => {
      let stubCreateCert: SinonStub,
        stubFileExists: SinonStub,
        errorMessage = 'Test createCertificate error';

      before(() => {
        stubFileExists = sandbox.stub(fs, 'existsSync');
        stubCreateCert = sandbox.stub(pem, 'createCertificate');
        stubFileExists.onFirstCall().returns(false);
        stubCreateCert.callsArgWith(1, new Error(errorMessage), { serviceKey: 'serviceKey', certificate: 'certificate' });
      });

      it('should reject with an error', () => {
        return expect(BotServer.generateDefaultSSLAsync()).to.eventually.rejectedWith(errorMessage);
      });

      after(() => {
        stubFileExists.restore();
        stubCreateCert.restore();
      });

    });

    describe('when pem module can create certificate', () => {
      let stubCreateCert: SinonStub,
        stubFileExists: SinonStub,
        stubWriteFile: SinonStub,
        serviceKey = 'serviceKey',
        certificate = 'certificate';

      before(() => {
        stubFileExists = sandbox.stub(fs, 'existsSync');
        stubCreateCert = sandbox.stub(pem, 'createCertificate');
        stubWriteFile = sandbox.stub(fs, 'writeFileSync');
        stubFileExists.onFirstCall().returns(false);
        stubCreateCert.callsArgWith(1, null, { serviceKey: serviceKey, certificate: certificate });
      });

      it('should create cert and key files', () => {
        return expect(BotServer.generateDefaultSSLAsync()).to.eventually.be.true
          .then(() => {
            expect(stubWriteFile.getCall(0).args[0]).to.equal(BotServer.defaultSSLKey);
            expect(stubWriteFile.getCall(0).args[1]).to.equal(serviceKey);
            expect(stubWriteFile.getCall(1).args[0]).to.equal(BotServer.defaultSSLCert);
            expect(stubWriteFile.getCall(1).args[1]).to.equal(certificate);
          });
      });

      after(() => {
        stubFileExists.restore();
        stubCreateCert.restore();
        stubWriteFile.restore();
      });

    });

  });

  describe('getEnvOptions', () => {
    let testEnvFile = path.resolve(__dirname, '../../.test.env'),
      testOptionsString = new Buffer('CHANNEL_ACCESS_TOKEN=test_channelAccessToken\n\
        CHANNEL_SECRET=test_channelSecret\n\
        PORT=1234\n\
        SSL_KEY=test_keyFile\n\
        SSL_CERT=test_certFile\n'),
      expectedOptions: BotServerOptions;

    before(() => {
      fs.writeFileSync(testEnvFile, testOptionsString);
      dotenv.config({path: testEnvFile});
      expectedOptions = BotServer.getEnvOptions();
    });

    it('should have correct channelAccessToken', () => {
      expect(expectedOptions.channelAccessToken).to.equal('test_channelAccessToken');
    });

    it('should have correct channelSecret', () => {
      expect(expectedOptions.channelSecret).to.equal('test_channelSecret');
    });

    it('should have correct port', () => {
      expect(expectedOptions.port).to.equal(1234);
    });

    it('should have correct channelAccessToken', () => {
      expect(expectedOptions.key).to.equal('test_keyFile');
    });

    it('should have correct channelAccessToken', () => {
      expect(expectedOptions.cert).to.equal('test_certFile');
    });

    after(() => {
      fs.removeSync(testEnvFile);
    });

  });

  after(() => {
    sandbox.restore();
  });

});
