const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

describe('Client Routes', () => {
  it('should return the homepage with text', () => {
    return chai.request(server)
    .get('/')
    .then(response => {
      response.should.have.status(200);
      response.should.be.html;
    })
    .catch(error => {
      throw error;
    });
  });

  it('should return a 404 if page does not exist', () => {
    return chai.request(server)
    .get('/PANTS')
    .then(response => {
      response.should.have.status(404);
    })
    .catch(error => {
      throw error;
    });
  });
});

describe('API Routes', () => {
  beforeEach((done) => {
    database.migrate.rollback()
    .then(() => {
      database.migrate.latest()
      .then(() => {
        return database.seed.run()
        .then(() => {
          done();
        })
      })
    })
  })

  describe('GET /api/v1/locations', () => {
    it('should return all of the locations', () => {
      return chai.request(server)
      .get('/api/v1/locations')
      .then( response => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(22);
        response.body[0].should.have.property('id');
        response.body[0].id.should.equal(1);
        response.body[0].should.have.property('city');
        response.body[0].city.should.equal('Littleton');
        response.body[0].should.have.property('county');
        response.body[0].county.should.equal('Jefferson');
      })
      .catch(error => {
        throw error;
      })
    })
  })

  describe('GET /api/v1/locations/:id', () => {
    it('should return a specific location', () => {
      return chai.request(server)
      .get('/api/v1/locations/1')
      .then( response => {
        response.should.have.status(200);
        response.body[0].should.have.property('id');
        response.body[0].id.should.equal(1);
        response.body[0].should.have.property('city');
        response.body[0].city.should.equal('Littleton')
        response.body[0].should.have.property('county');
        response.body[0].county.should.equal('Jefferson');
      })
      .catch(error => {
        throw error;
      })
    })

    it('should return a 404 error if that id does not exist', () => {
      return chai.request(server)
      .get('/api/v1/locations/50')
      .then( response => {
        response.should.have.status(404);
        response.body.should.be.a('object');
        response.body.should.have.property('error');
        response.body.error.should.equal('Could not find location with id: 50');
      })
      .catch(error => {
        throw error;
      })
    })
  })

  describe('POST /api/v1/locations', () => {
    it('should create a new location', () => {
      return chai.request(server)
      .post('/api/v1/locations')
      .send({
        city: 'Glenwood Springs',
        county: 'Garfield'
      })
      .then(response => {
        response.should.have.status(201);
        response.body.should.be.a('object');
        response.body.should.have.property('id');
        response.body.id.should.equal(23);
      })
      .catch( error => {
        throw error;
      })
    })

    it('should return a 422 error if a body property is missing', () => {
      return chai.request(server)
      .post('/api/v1/locations')
      .send({
        // city: 'Glenwood Springs',
        county: 'Garfield'
      })
      .then( response => {
        response.should.have.status(422);
        response.body.should.be.a('object');
        response.body.should.have.property('error');
        response.body.error.should.equal('Expected format: { city: <String>, county: <String> }. You\'re missing a city property.')
      })
      .catch( error => {
        throw error;
      })
    })
  })

  describe('DELETE /api/v1/locations/:id', () => {
    it('should delete a location from the database', () => {
      return chai.request(server)
      .delete('/api/v1/locations/1')
      .then( response => {
        response.should.have.status(204);
      })
      .catch( error => {
        throw error;
      })
    })

    it('should return a 404 error if no location with that id exists', () => {
      return chai.request(server)
      .delete('/api/v1/locations/50')
      .then(response => {
        response.should.have.status(404);
        response.body.should.be.a('object');
        response.body.should.have.property('error');
        response.body.error.should.equal('No record with id: 50 to delete');
      })
      .catch(error => {
        throw error;
      })
    })
  })

  describe('GET /api/v1/sites', () => {
    it('should return all of the sites', () => {
      return chai.request(server)
      .get('/api/v1/sites')
      .then(response => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(43);
        response.body[0].should.have.property('id')
        // response.body[0].id.should.equal(1);
        response.body[0].should.have.property('name');
        // response.body[0].name.should.equal('Air Force Plant PJKS');
        response.body[0].should.have.property('location_id');
        // response.body[0].location_id.should.equal(1);
        response.body[0].should.have.property('info');
        // response.body[0].info.should.equal('https://echo.epa.gov/detailed-facility-report?fid=110060948453');
      })
      .catch(error => {
        throw error;
      });
    });
  });



  describe('GET /api/v1/sites/:id', () => {
    it('should return a specific site', () => {
      return chai.request(server)
      .get('/api/v1/sites/2')
      .then(response => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body[0].should.have.property('id')
        response.body[0].id.should.equal(2);
        response.body[0].should.have.property('name');
        // response.body[0].name.should.equal('Arvada Treatment Center');
        response.body[0].should.have.property('location_id');
        // response.body[0].location_id.should.equal(9);
        response.body[0].should.have.property('info');
        // response.body[0].info.should.equal('https://echo.epa.gov/detailed-facility-report?fid=110027855408');
      })
      .catch(error => {
        throw error;
      });
    });

    it('should return a 404 error if that id does not exist', () => {
      return chai.request(server)
      .get('/api/v1/sites/100')
      .then(response => {
        response.should.have.status(404);
        response.body.should.be.a('object');
        response.body.should.have.property('error');
        response.body.error.should.equal('Could not find site with id: 100');
      })
      .catch(error => {
        throw error;
      });
    });
  });

  describe('POST /api/v1/sites', () => {
    it('should create a new site', () => {
      return chai.request(server)
      .post('/api/v1/sites')
      .send({
        name: 'Lakewood Site',
        location_id: '18',
        info: 'api endpoint'
      })
      .then(response => {
        response.should.have.status(201);
        response.body.should.be.a('object');
        response.body.should.have.property('id');
        response.body.id.should.equal(44);
      })
      .catch(error => {
        throw error;
      });
    });

    it('should return a 422 error if a body property is missing', () => {
      return chai.request(server)
      .post('/api/v1/sites')
      .send({
        // name: 'Site',
        location_id: 1
      })
      .then(response => {
        response.should.have.status(422)
        response.body.should.be.a('object');
        response.body.should.have.property('error');
        response.body.error.should.equal('Expected format: { name: <String>, location_id: <Number> }. You\'re missing a name property.')
      })
      .catch(error => {
        throw error;
      });
    });
  });

  describe('DELETE /api/v1/sites/:id', () => {
    it('should delete a site from the database', () => {
      return chai.request(server)
      .delete('/api/v1/sites/2')
      .then(response => {
        response.should.have.status(204);
      })
      .catch(error => {
        throw error;
      });
    });

    it('should return a 404 error if no site with that id exists', () => {
      return chai.request(server)
      .delete('/api/v1/sites/100')
      .then(response => {
        response.should.have.status(404);
        response.body.should.be.a('object');
        response.body.should.have.property('error');
        response.body.error.should.equal('No site with id: 100 to delete');
      })
      .catch(error => {
        throw error;
      });
    });
  });
});