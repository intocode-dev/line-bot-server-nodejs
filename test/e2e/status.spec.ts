import * as chai from 'chai';
import ChaiHttp = require('chai-http');
import {BotServer} from '../../lib/bot-server';

chai.use(ChaiHttp);

describe('/status', () => {
  let server: BotServer;

  beforeEach(() => {
    server = new BotServer({
      cert: BotServer.defaultSSLCert,
      channelAccessToken: 'test',
      channelSecret: 'test',
      key: BotServer.defaultSSLKey,
      port: 1234
    });
  });

  describe('when enableStatusEndpoint is not called', () => {

    it('should return 404', (done) => {
      chai.request(server.app)
        .get('/status')
        .end((err, res: ChaiHttp.Response) => {
          chai.expect(err.message).to.equal('Not Found');
          chai.expect(res).to.have.status(404);
          done();
        });
    });

  });

  describe('when enableStatusEndpoint is called', () => {

    it('should return 200', (done) => {
      server.enableStatusEndpoint();
      chai.request(server.app)
        .get('/status')
        .end((err, res: ChaiHttp.Response) => {
          chai.expect(err).to.be.null;
          chai.expect(res).to.have.status(200);
          done();
        });
    });

  });

});
