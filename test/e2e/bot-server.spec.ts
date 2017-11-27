import * as chai from 'chai';
import ChaiHttp = require('chai-http');
import BotServer from '../../lib/bot-server';

chai.use(ChaiHttp);

const expect = chai.expect;

describe('BotServer', () => {
  let server: BotServer;

  before(() => {
    server = new BotServer({
      channelSecret: 'testSecret',
      channelAccessToken: 'testToken',
      port: 1234
    });
  });

  it('should be startable', () => {
    expect(() => server.start()).not.to.throw;
  });

  describe('/status', () => {

    it('should return 200', (done) => {
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
