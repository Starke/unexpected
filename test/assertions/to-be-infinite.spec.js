/* global expect */
describe('to be infinite assertion', () => {
  it('asserts a infinite number', () => {
    expect(123, 'not to be infinite');
    expect(0, 'not to be infinite');
    expect(Infinity, 'to be infinite');
    expect(-Infinity, 'to be infinite');
  });

  it('refuses to work on NaN', () => {
    expect(
      function () {
        expect(NaN, 'not to be infinite');
      },
      'to throw',
      'expected NaN not to be infinite\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <NaN> not to be infinite\n' +
        '  did you mean:\n' +
        '    <number> [not] to be infinite'
    );
  });

  it('throws when the assertion fails', () => {
    expect(
      function () {
        expect(123, 'to be infinite');
      },
      'to throw exception',
      'expected 123 to be infinite'
    );
  });
});
