/* global expect */
describe('to be rejected with error satisfying assertion', () => {
  it('should succeed if the response is rejected with a reason satisfying the argument', () => {
    return expect(
      new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error('OMG!'));
        }, 0);
      }),
      'to be rejected with error satisfying',
      new Error('OMG!')
    );
  });

  it('should provide the rejection reason as the fulfillment value', () => {
    return expect(
      expect.promise.reject(new Error('foo')),
      'to be rejected with error satisfying',
      'foo'
    ).then(function (reason) {
      expect(reason, 'to have message', 'foo');
    });
  });

  it('should support matching the error message against a regular expression', () => {
    return expect(
      new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error('OMG!'));
        }, 0);
      }),
      'to be rejected with error satisfying',
      /MG/
    );
  });

  it('should support matching the error message of an UnexpectedError against a regular expression', () => {
    return expect(
      new Promise(function (resolve, reject) {
        setTimeout(function () {
          try {
            expect(false, 'to be truthy');
          } catch (err) {
            reject(err);
          }
        }, 0);
      }),
      'to be rejected with error satisfying',
      /to be/
    );
  });

  it('should fail if the promise is rejected with a reason that does not satisfy the argument', () => {
    return expect(
      expect(
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject(new Error('OMG!'));
          }, 1);
        }),
        'to be rejected with error satisfying',
        new Error('foobar')
      ),
      'to be rejected with',
      "expected Promise to be rejected with error satisfying Error('foobar')\n" +
        "  expected Error('OMG!') to satisfy Error('foobar')\n" +
        '\n' +
        '  Error({\n' +
        "    message: 'OMG!' // should equal 'foobar'\n" +
        '                    //\n' +
        '                    // -OMG!\n' +
        '                    // +foobar\n' +
        '  })'
    );
  });

  describe('with the "exhaustively" flag', () => {
    it("errors if the rejection reason doesn't have all the same properties as the value", () => {
      return expect(function () {
        const error = new Error('foobar');
        error.data = { foo: 'bar' };
        return expect(
          expect.promise.reject(error),
          'to be rejected with error exhaustively satisfying',
          new Error('foobar')
        );
      }, 'to error');
    });

    it('errors with the correct error', () => {
      return expect(
        function () {
          const error = new Error('foobar');
          error.data = { foo: 'bar' };
          return expect(
            expect.promise.reject(error),
            'to be rejected with error exhaustively satisfying',
            new Error('foobar')
          );
        },
        'to error with',
        "expected Promise (rejected) => Error({ message: 'foobar', data: { foo: 'bar' } })\n" +
          "to be rejected with error exhaustively satisfying Error('foobar')\n" +
          "  expected Error({ message: 'foobar', data: { foo: 'bar' } })\n" +
          "  to exhaustively satisfy Error('foobar')\n" +
          '\n' +
          '  Error({\n' +
          "    message: 'foobar',\n" +
          "    data: { foo: 'bar' } // should be removed\n" +
          '  })'
      );
    });
  });

  describe('without the "exhaustively" flag', () => {
    it("does not error if the rejection reason doesn't have all the same properties as the value", () => {
      return expect(function () {
        const error = new Error('foobar');
        error.data = { foo: 'bar' };
        return expect(
          expect.promise.reject(error),
          'to be rejected with error satisfying',
          new Error('foobar')
        );
      }, 'not to error');
    });
  });

  describe('when passed a function as the subject', () => {
    it('should fail if the function returns a promise that is rejected with the wrong reason', () => {
      expect(
        function () {
          return expect(
            function () {
              return expect.promise.reject(new Error('foo'));
            },
            'to be rejected with error satisfying',
            new Error('bar')
          );
        },
        'to throw',
        'expected\n' +
          'function () {\n' +
          "  return expect.promise.reject(new Error('foo'));\n" +
          '}\n' +
          "to be rejected with error satisfying Error('bar')\n" +
          "  expected Promise (rejected) => Error('foo')\n" +
          "  to be rejected with error satisfying Error('bar')\n" +
          "    expected Error('foo') to satisfy Error('bar')\n" +
          '\n' +
          '    Error({\n' +
          "      message: 'foo' // should equal 'bar'\n" +
          '                     //\n' +
          '                     // -foo\n' +
          '                     // +bar\n' +
          '    })'
      );
    });

    it('should use the stack of the rejection reason when failing', () => {
      return expect(
        function () {
          return expect(
            function () {
              return expect.promise(function () {
                (function thisIsImportant() {
                  throw new Error('argh');
                })();
              });
            },
            'to be rejected with error satisfying',
            'foobar'
          );
        },
        'to error',
        expect.it(function (err) {
          expect(err.stack, 'to match', /thisIsImportant/);
        })
      );
    });

    describe('with the "exhaustively" flag', () => {
      it("errors if the rejection reason doesn't have all the same properties as the value", () => {
        return expect(function () {
          return expect(
            function () {
              return expect.promise(function () {
                const error = new Error('foobar');
                error.data = { foo: 'bar' };
                throw error;
              });
            },
            'to be rejected with error exhaustively satisfying',
            new Error('foobar')
          );
        }, 'to error');
      });

      it('errors with the correct error', () => {
        return expect(
          // prettier-ignore
          function () {
            return expect(
              function() {
                return expect.promise(function () {
                  const error = new Error('foobar');
                  error.data = { foo: 'bar' };
                  throw error;
                });
              },
              'to be rejected with error exhaustively satisfying',
              new Error('foobar')
            );
          },
          'to error with',
          'expected\n' +
            'function () {\n' +
            '  return expect.promise(function () {\n' +
            "    var error = new Error('foobar');\n" +
            "    error.data = { foo: 'bar' };\n" +
            '    throw error;\n' +
            '  });\n' +
            '}\n' +
            "to be rejected with error exhaustively satisfying Error('foobar')\n" +
            "  expected Promise (rejected) => Error({ message: 'foobar', data: { foo: 'bar' } })\n" +
            "  to be rejected with error exhaustively satisfying Error('foobar')\n" +
            "    expected Error({ message: 'foobar', data: { foo: 'bar' } })\n" +
            "    to exhaustively satisfy Error('foobar')\n" +
            '\n' +
            '    Error({\n' +
            "      message: 'foobar',\n" +
            "      data: { foo: 'bar' } // should be removed\n" +
            '    })'
        );
      });
    });

    describe('without the "exhaustively" flag', () => {
      it("does not error if the rejection reason doesn't have all the same properties as the value", () => {
        return expect(function () {
          return expect(
            function () {
              return expect.promise(function () {
                const error = new Error('foobar');
                error.data = { foo: 'bar' };
                throw error;
              });
            },
            'to be rejected with error satisfying',
            new Error('foobar')
          );
        }, 'not to error');
      });
    });
  });

  describe('with another promise library', () => {
    it('should use the stack of the rejection reason when failing', () => {
      return expect(
        function () {
          return expect(
            function () {
              return new Promise(function (resolve, reject) {
                (function thisIsImportant() {
                  throw new Error('argh');
                })();
              });
            },
            'to be rejected with error satisfying',
            'foobar'
          );
        },
        'to error',
        expect.it(function (err) {
          expect(err.stack, 'to match', /thisIsImportant/);
        })
      );
    });
  });
});
