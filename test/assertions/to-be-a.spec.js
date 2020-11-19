/* global expect */
describe('to be a/an assertion', () => {
  const circular = {};
  circular.self = circular;

  it('asserts typeof with support for array type and instanceof', () => {
    expect(5, 'to be a', 'number');
    expect(5, 'to be a number');
    expect('abc', 'to be a', 'string');
    expect('', 'to be a string');
    expect('', 'to be the empty string');
    expect('', 'to be an empty string');
    expect('abc', 'to be a non-empty string');
    expect([], 'to be an', 'array');
    expect([], 'to be an array');
    expect([], 'to be an empty array');
    expect({}, 'to be an', Object);
    expect([123], 'to be a non-empty array');
    expect([], 'to be an', 'object');
    expect([], 'to be an object');
    expect([], 'to be an', Array);
    expect(/ab/, 'to be a', RegExp);
    expect(/ab/, 'to be a regexp');
    expect(123, 'not to be a regex');
    expect(/ab/, 'to be a regex');
    expect(/ab/, 'to be a regular expression');
    expect(123, 'not to be a regular expression');
    expect(null, 'not to be an', 'object');
    expect(null, 'not to be an object');
    expect(true, 'to be a', 'boolean');
    expect(true, 'to be a boolean');
    expect(expect, 'to be a', 'function');
    expect(expect, 'to be a function');
    expect(circular, 'to be an object');
    expect(new Date(), 'to be a', 'date');
    expect(new Date(), 'to be a date');
    expect({}, 'not to be a date');
    expect(new Date().toISOString(), 'not to be a date');
  });

  it('should support type objects', () => {
    expect('foo', 'to be a', expect.getType('string'));
  });

  describe('with a type name', () => {
    it('should succeed when the subject is recognized as having the type', () => {
      expect(new Error('foo'), 'to be an', 'Error');
    });

    it('should fail when the subject is not recognized as having the type', () => {
      expect(
        function () {
          expect(123, 'to be an', 'Error');
        },
        'to throw',
        'expected 123 to be an Error'
      );
    });

    // Maybe better: throw a non-Unexpected error
    it('should fail when the type is not defined', () => {
      expect(
        function () {
          expect(123, 'to be a', 'FoopQuuxDoop');
        },
        'to throw',
        'expected 123 to be a FoopQuuxDoop\n' + '  Unknown type: FoopQuuxDoop'
      );
    });

    it('should fail when the type is not defined in the "not" case', () => {
      expect(
        function () {
          expect(123, 'not to be a', 'FoopQuuxDoop');
        },
        'to throw',
        'expected 123 not to be a FoopQuuxDoop\n' +
          '  Unknown type: FoopQuuxDoop'
      );
    });
  });

  it('formats Error instances correctly when an assertion fails', () => {
    expect(
      function () {
        const error = new Error('error message');
        error.data = 'extra';
        expect(error, 'to be a number');
      },
      'to throw',
      "expected Error({ message: 'error message', data: 'extra' }) to be a number"
    );
  });

  it('should fail with the correct error message if the type is given as an anonymous function', () => {
    expect(
      function () {
        expect('foo', 'to be a', function () {});
      },
      'to throw',
      "expected 'foo' to be a function () {}"
    );
  });

  it('should throw when the type is specified as undefined', () => {
    expect(
      function () {
        expect('foo', 'to be an', undefined);
      },
      'to throw',
      "expected 'foo' to be an undefined\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <string> to be an <undefined>\n' +
        '  did you mean:\n' +
        '    <any> [not] to be (a|an) <function>\n' +
        '    <any> [not] to be (a|an) <string>\n' +
        '    <any> [not] to be (a|an) <type>'
    );
  });

  it('should throw when the type is specified as null', () => {
    expect(
      function () {
        expect('foo', 'to be a', null);
      },
      'to throw',
      "expected 'foo' to be a null\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <string> to be a <null>\n' +
        '  did you mean:\n' +
        '    <any> [not] to be (a|an) <function>\n' +
        '    <any> [not] to be (a|an) <string>\n' +
        '    <any> [not] to be (a|an) <type>'
    );
  });

  it('should not consider a string a to be an instance of an object without a name property', () => {
    expect(
      function () {
        expect('foo', 'to be a', {});
      },
      'to throw',
      "expected 'foo' to be a {}\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <string> to be a <object>\n' +
        '  did you mean:\n' +
        '    <any> [not] to be (a|an) <function>\n' +
        '    <any> [not] to be (a|an) <string>\n' +
        '    <any> [not] to be (a|an) <type>'
    );
  });

  it('should throw when the type is specified as an object without an identify function', () => {
    expect(
      function () {
        expect('foo', 'to be a', { name: 'bar' });
      },
      'to throw',
      "expected 'foo' to be a { name: 'bar' }\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <string> to be a <object>\n' +
        '  did you mean:\n' +
        '    <any> [not] to be (a|an) <function>\n' +
        '    <any> [not] to be (a|an) <string>\n' +
        '    <any> [not] to be (a|an) <type>'
    );
  });

  it('should throw when the type is specified as an object with an identify function, but without a name property', () => {
    expect(
      function () {
        expect('foo', 'to be a', {
          // prettier-ignore
          identify: function () {
            return true;
          },
        });
      },
      'to throw',
      expect.it(function (err) {
        // Compensate for V8 5.1+ setting { identify: function () {} }.identify.name === 'identify'
        // http://v8project.blogspot.dk/2016/04/v8-release-51.html
        expect(
          err
            .getErrorMessage('text')
            .toString()
            .replace('function identify', 'function '),
          'to satisfy',
          "expected 'foo' to be a { identify: function () { return true; } }\n" +
            '  The assertion does not have a matching signature for:\n' +
            '    <string> to be a <object>\n' +
            '  did you mean:\n' +
            '    <any> [not] to be (a|an) <function>\n' +
            '    <any> [not] to be (a|an) <string>\n' +
            '    <any> [not] to be (a|an) <type>'
        );
      })
    );
  });

  it('throws when the assertion fails', () => {
    expect(
      function () {
        expect(5, 'to be an', Array);
      },
      'to throw exception',
      'expected 5 to be an Array'
    );

    expect(
      function () {
        expect([], 'not to be an', 'array');
      },
      'to throw exception',
      'expected [] not to be an array'
    );

    expect(
      function () {
        expect(circular, 'not to be an object');
      },
      'to throw exception',
      'expected { self: [Circular] } not to be an object'
    );
  });

  it('throws an error a diff when comparing string and not negated', () => {
    expect(
      function () {
        expect('foo', 'to be', 'bar');
      },
      'to throw exception',
      "expected 'foo' to be 'bar'\n" + '\n' + '-foo\n' + '+bar'
    );
  });

  it('throws an error without actual and expected when comparing string and negated', () => {
    expect(
      function () {
        expect('foo', 'not to be', 'foo');
      },
      'to throw exception',
      expect.it(function (e) {
        expect(e, 'not to have property', 'actual');
        expect(e, 'not to have property', 'expected');
      })
    );
  });

  it('throws an error without actual and expected when not comparing string and not negated', () => {
    expect(
      function () {
        expect('foo', 'to be', {});
      },
      'to throw exception',
      expect.it(function (e) {
        expect(e, 'not to have property', 'actual');
        expect(e, 'not to have property', 'expected');
      })
    );
  });
});
