/*global expect*/
describe('to be one of', function () {
    it('asserts booleans can be true or false', function () {
        //expect(true, 'to be one of', true, false);
        expect(true, 'to be one of', [true, false]);

        expect(true, 'not to be one of', [false]);
        expect(2, 'not to be one of', [0, 1]);
    });

    it('throws when assertions fail', function () {
        expect(function () {
            expect(1, 'to be one of', [0, 2]);
        }, 'to throw exception', "expected 1 to be one of [ 0, 2 ]");

        expect(function () {
            expect(1, 'not to be one of', [0, 1]);
        }, 'to throw exception', "expected 1 not to be one of [ 0, 1 ]");
    });
});
