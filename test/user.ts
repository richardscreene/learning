import util = require("util");
import assert = require("assert");
import mocha = require("mocha");
import sinon = require("sinon");
import jwt = require("jsonwebtoken");
import Boom = require("@hapi/boom");

import proxyquire = require("proxyquire");

const JWT_SECRET = "this-is-the-key";
process.env["JWT_SECRET"] = JWT_SECRET;

const MODULE_UNDER_TEST = "../backend/user/user";

const DEFAULT_USER_ID = "1111";
const DEFAULT_EMAIL = "john.smith@example.com";
const DEFAULT_NAME = "John Smith";
const DEFAULT_ROLE = "user";
const DEFAULT_PASSWORD = "1234";
const DEFAULT_HASH =
  "78729e3e4b1dbc5a2d96c4c22aaf34df1f4dd8e30803844cc6488bf28022b2117a4b5179829fa50bff11ffafb8fd3b9513a9dfe193645c37f2e329ea2d868df6";
const DEFAULT_SALT = "cb9feab6af83ca612a8b4daea8905b98";
const DEFAULT_ITERATIONS = 1000;
const DEFAULT_REFRESH_TOKEN = "DUMMY_REFRESH_TOKEN";
const DEFAULT_RESET_TOKEN = "DUMMY_RESET_TOKEN";

describe("user", () => {
  describe("register", () => {
    it("should succeed", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          insertOne: sinon
            .stub()
            .withArgs({
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: sinon.object
            })
            .resolves({
              userId: DEFAULT_USER_ID,
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: {
                hash: DEFAULT_HASH,
                salt: DEFAULT_SALT,
                iterations: DEFAULT_ITERATIONS
              }
            }),
          updateById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID, {
              refreshToken: sinon.string
            })
            .resolves({
              userId: DEFAULT_USER_ID,
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: {
                hash: DEFAULT_HASH,
                salt: DEFAULT_SALT,
                iterations: DEFAULT_ITERATIONS
              },
              refreshToken: DEFAULT_REFRESH_TOKEN
            })
        }
      });
      user
        .register({
          email: DEFAULT_EMAIL,
          password: DEFAULT_PASSWORD,
          name: DEFAULT_NAME,
          role: DEFAULT_ROLE
        })
        .then(token => {
          assert(token);
          done();
        })
        .catch(done);
    });

    it("should fail if user already exist", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          insertOne: sinon
            .stub()
            .withArgs({
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: sinon.object
            })
            .rejects(Boom.conflict("error"))
        }
      });
      user
        .register({
          email: DEFAULT_EMAIL,
          password: DEFAULT_PASSWORD,
          name: DEFAULT_NAME,
          role: DEFAULT_ROLE
        })
        .then(done)
        .catch(err => {
          assert.equal(err.output.statusCode, 409);
          done();
        });
    });
  });

  describe("login", () => {
    it("should succeed", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          findByEmail: sinon
            .stub()
            .withArgs(DEFAULT_EMAIL)
            .resolves({
              userId: DEFAULT_USER_ID,
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: {
                hash: DEFAULT_HASH,
                salt: DEFAULT_SALT,
                iterations: DEFAULT_ITERATIONS
              }
            }),
          updateById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID, {
              refreshToken: sinon.string
            })
            .resolves({
              userId: DEFAULT_USER_ID,
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: {
                hash: DEFAULT_HASH,
                salt: DEFAULT_SALT,
                iterations: DEFAULT_ITERATIONS
              },
              refreshToken: DEFAULT_REFRESH_TOKEN
            })
        }
      });
      user
        .login({ email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD })
        .then(token => {
          assert(token);
          done();
        })
        .catch(done);
    });

    it("should fail if user does not exist", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          findByEmail: sinon
            .stub()
            .withArgs(DEFAULT_EMAIL)
            .rejects(Boom.forbidden("error"))
        }
      });
      user
        .login({ email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD })
        .then(done)
        .catch(err => {
          assert.equal(err.output.statusCode, 403);
          done();
        });
    });
  });

  describe("forgot", () => {
    it("should succeed", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {
          send: sinon
            .stub()
            .withArgs(DEFAULT_EMAIL, sinon.string)
            .resolves()
        },
        "./db": {
          findByEmail: sinon
            .stub()
            .withArgs(DEFAULT_EMAIL)
            .resolves({
              userId: DEFAULT_USER_ID,
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: {
                hash: DEFAULT_HASH,
                salt: DEFAULT_SALT,
                iterations: DEFAULT_ITERATIONS
              }
            }),
          updateById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID, {
              resetToken: sinon.string
            })
            .resolves({
              userId: DEFAULT_USER_ID,
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: {
                hash: DEFAULT_HASH,
                salt: DEFAULT_SALT,
                iterations: DEFAULT_ITERATIONS
              },
              resetToken: DEFAULT_RESET_TOKEN
            })
        }
      });
      user
        .forgot(DEFAULT_EMAIL)
        .then(() => {
          done();
        })
        .catch(done);
    });

    it("should silently fail if user does not exist", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          findByEmail: sinon
            .stub()
            .withArgs(DEFAULT_EMAIL)
            .rejects(Boom.notFound("error"))
        }
      });
      user
        .forgot(DEFAULT_EMAIL)
        .then(() => {
          done();
        })
        .catch(done);
    });

    it("should fail on error", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          findByEmail: sinon
            .stub()
            .withArgs(DEFAULT_EMAIL)
            .resolves({
              userId: DEFAULT_USER_ID,
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: {
                hash: DEFAULT_HASH,
                salt: DEFAULT_SALT,
                iterations: DEFAULT_ITERATIONS
              }
            }),
          updateById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID, {
              resetToken: sinon.string
            })
            .rejects(new Error("error"))
        }
      });
      user
        .forgot(DEFAULT_EMAIL)
        .then(done)
        .catch(err => {
          assert.equal(err.message, "error");
          done();
        });
    });
  });

  describe("reset", () => {
    let resetToken;

    before(() => {
      return util
        .promisify(jwt.sign)({ userId: DEFAULT_USER_ID }, JWT_SECRET, {
          expiresIn: "1h",
          algorithm: "HS256"
        })
        .then(myResetToken => {
          resetToken = myResetToken;
          return Promise.resolve();
        });
    });

    it("should succeed", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          findById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID)
            .resolves({
              userId: DEFAULT_USER_ID,
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: {
                hash: DEFAULT_HASH,
                salt: DEFAULT_SALT,
                iterations: DEFAULT_ITERATIONS
              },
              resetToken
            }),
          updateById: sinon
            .stub()
            .withArgs(
              DEFAULT_USER_ID,
              {
                auth: sinon.object,
                refreshToken: sinon.string
              },
              {
                resetToken: ""
              }
            )
            .resolves({
              userId: DEFAULT_USER_ID,
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: {
                hash: DEFAULT_HASH,
                salt: DEFAULT_SALT,
                iterations: DEFAULT_ITERATIONS
              },
              refreshToken: DEFAULT_REFRESH_TOKEN
            })
        }
      });
      user
        .reset(resetToken, "admin")
        .then(() => {
          done();
        })
        .catch(done);
    });

    it("should fail if user does not exist", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          findById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID)
            .rejects(Boom.notFound("error"))
        }
      });
      user
        .reset(resetToken, "admin")
        .then(done)
        .catch(err => {
          assert.equal(err.output.statusCode, 404);
          done();
        });
    });

    it("should fail on update error", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          findById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID)
            .resolves({
              userId: DEFAULT_USER_ID,
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: {
                hash: DEFAULT_HASH,
                salt: DEFAULT_SALT,
                iterations: DEFAULT_ITERATIONS
              },
              resetToken
            }),
          updateById: sinon
            .stub()
            .withArgs(
              DEFAULT_USER_ID,
              {
                auth: sinon.object,
                refreshToken: sinon.string
              },
              {
                resetToken: ""
              }
            )
            .rejects(new Error("error"))
        }
      });
      user
        .reset(resetToken, "admin")
        .then(done)
        .catch(err => {
          assert.equal(err.message, "error");
          done();
        });
    });

    it("should fail if webtoken is invalid", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {}
      });
      user
        .reset("DUMMY_TOKEN", "admin")
        .then(done)
        .catch(err => {
          assert.equal(err.output.statusCode, 401);
          done();
        });
    });
  });

  describe("create", () => {
    it("should succeed", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          insertOne: sinon
            .stub()
            .withArgs({
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: sinon.object
            })
            .resolves({
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: {
                hash: DEFAULT_HASH,
                salt: DEFAULT_SALT,
                iterations: DEFAULT_ITERATIONS
              }
            })
        }
      });
      user
        .create({
          email: DEFAULT_EMAIL,
          password: DEFAULT_PASSWORD,
          name: DEFAULT_NAME,
          role: DEFAULT_ROLE
        })
        .then(user => {
          assert.deepEqual(user, {
            email: DEFAULT_EMAIL,
            name: DEFAULT_NAME,
            role: DEFAULT_ROLE
          });
          done();
        })
        .catch(done);
    });

    it("should fail if user already exist", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          insertOne: sinon
            .stub()
            .withArgs({
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: sinon.object
            })
            .rejects(Boom.conflict("error"))
        }
      });
      user
        .create({
          email: DEFAULT_EMAIL,
          password: DEFAULT_PASSWORD,
          name: DEFAULT_NAME,
          role: DEFAULT_ROLE
        })
        .then(done)
        .catch(err => {
          assert.equal(err.output.statusCode, 409);
          done();
        });
    });
  });

  describe("retrieve", () => {
    it("should succeed", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          findById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID)
            .resolves({
              userId: DEFAULT_USER_ID,
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE
            })
        }
      });
      user
        .retrieve(DEFAULT_USER_ID)
        .then(user => {
          assert.deepEqual(user, {
            userId: DEFAULT_USER_ID,
            email: DEFAULT_EMAIL,
            name: DEFAULT_NAME,
            role: DEFAULT_ROLE
          });
          done();
        })
        .catch(done);
    });

    it("should fail if user does not exist", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          findById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID)
            .rejects(Boom.notFound("error"))
        }
      });
      user
        .retrieve(DEFAULT_USER_ID)
        .then(done)
        .catch(err => {
          assert.equal(err.output.statusCode, 404);
          done();
        });
    });
  });

  describe("update", () => {
    it("should succeed with password", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          updateById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID, {
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: sinon.object
            })
            .resolves({
              userId: DEFAULT_USER_ID,
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: {
                hash: DEFAULT_HASH,
                salt: DEFAULT_SALT,
                iterations: DEFAULT_ITERATIONS
              }
            })
        }
      });
      user
        .update(DEFAULT_USER_ID, {
          email: DEFAULT_EMAIL,
          password: DEFAULT_PASSWORD,
          name: DEFAULT_NAME,
          role: DEFAULT_ROLE
        })
        .then(user => {
          assert.deepEqual(user, {
            userId: DEFAULT_USER_ID,
            email: DEFAULT_EMAIL,
            name: DEFAULT_NAME,
            role: DEFAULT_ROLE
          });
          done();
        })
        .catch(done);
    });

    it("should succeed without password", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          updateById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID, {
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE
            })
            .resolves({
              userId: DEFAULT_USER_ID,
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              auth: {
                hash: DEFAULT_HASH,
                salt: DEFAULT_SALT,
                iterations: DEFAULT_ITERATIONS
              }
            })
        }
      });
      user
        .update(DEFAULT_USER_ID, {
          email: DEFAULT_EMAIL,
          name: DEFAULT_NAME,
          role: DEFAULT_ROLE
        })
        .then(user => {
          assert.deepEqual(user, {
            userId: DEFAULT_USER_ID,
            email: DEFAULT_EMAIL,
            name: DEFAULT_NAME,
            role: DEFAULT_ROLE
          });
          done();
        })
        .catch(done);
    });

    it("should fail if user does not exist", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          updateById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID, {
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE
            })
            .rejects(Boom.notFound("error"))
        }
      });
      user
        .update(DEFAULT_USER_ID, {
          email: DEFAULT_EMAIL,
          password: DEFAULT_PASSWORD,
          name: DEFAULT_NAME,
          role: DEFAULT_ROLE
        })
        .then(done)
        .catch(err => {
          assert.equal(err.output.statusCode, 404);
          done();
        });
    });
  });

  describe("delete", () => {
    it("should succeed", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          deleteById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID)
            .resolves()
        }
      });
      user
        .del(DEFAULT_USER_ID)
        .then(() => {
          done();
        })
        .catch(done);
    });

    it("should fail if user does not exist", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          deleteById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID)
            .rejects(Boom.notFound("error"))
        }
      });
      user
        .del(DEFAULT_USER_ID)
        .then(done)
        .catch(err => {
          assert.equal(err.output.statusCode, 404);
          done();
        });
    });
  });

  describe("patch", () => {
    it("should succeed", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          updateById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID, {
              role: "admin"
            })
            .resolves({
              userId: DEFAULT_USER_ID,
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: "admin",
              auth: {
                hash: DEFAULT_HASH,
                salt: DEFAULT_SALT,
                iterations: DEFAULT_ITERATIONS
              }
            })
        }
      });
      user
        .patch(DEFAULT_USER_ID, {
          role: "admin"
        })
        .then(user => {
          assert.deepEqual(user, {
            userId: DEFAULT_USER_ID,
            email: DEFAULT_EMAIL,
            name: DEFAULT_NAME,
            role: "admin"
          });
          done();
        })
        .catch(done);
    });

    it("should fail if user does not exist", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          updateById: sinon
            .stub()
            .withArgs(DEFAULT_USER_ID, {
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE
            })
            .rejects(Boom.notFound("error"))
        }
      });
      user
        .update(DEFAULT_USER_ID, {
          role: "admin"
        })
        .then(done)
        .catch(err => {
          assert.equal(err.output.statusCode, 404);
          done();
        });
    });
  });

  describe("list", () => {
    it("should succeed", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          list: sinon
            .stub()
            .withArgs({})
            .resolves([
              {
                userId: DEFAULT_USER_ID,
                email: DEFAULT_EMAIL,
                name: DEFAULT_NAME,
                role: DEFAULT_ROLE,
                auth: {
                  hash: DEFAULT_HASH,
                  salt: DEFAULT_SALT,
                  iterations: DEFAULT_ITERATIONS
                }
              },
              {
                userId: "2222",
                email: "jane.doe@example.com",
                name: "Jane Doe",
                role: "admin",
                auth: {
                  hash: DEFAULT_HASH,
                  salt: DEFAULT_SALT,
                  iterations: DEFAULT_ITERATIONS
                }
              }
            ])
        }
      });
      user
        .list()
        .then(list => {
          assert.deepStrictEqual(list, [
            {
              email: DEFAULT_EMAIL,
              name: DEFAULT_NAME,
              role: DEFAULT_ROLE,
              userId: DEFAULT_USER_ID
            },
            {
              email: "jane.doe@example.com",
              name: "Jane Doe",
              role: "admin",
              userId: "2222"
            }
          ]);
          done();
        })
        .catch(done);
    });

    it("should fail", (done: Function) => {
      let user = proxyquire.noCallThru().load(MODULE_UNDER_TEST, {
        "./email-mailgun": {},
        "./db": {
          list: sinon
            .stub()
            .withArgs({})
            .rejects(new Error("error"))
        }
      });
      user
        .list()
        .then(done)
        .catch(err => {
          assert.equal(err.message, "error");
          done();
        });
    });
  });
});
