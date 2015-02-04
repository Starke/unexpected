var basename = require('path').basename;
var debug = require('debug')('metalsmith-unexpected-markdown');
var dirname = require('path').dirname;
var extname = require('path').extname;
var resolve = require('path').resolve;
var marked = require('marked');
var fs = require('fs');

var vm = require('vm');

var unexpected = require('../lib/').clone();
unexpected.installPlugin(require('magicpen-prism'));

var lightExpect = unexpected.clone()
    .installPlugin(require('./magicpen-github-syntax-theme'));

var darkExpect = unexpected.clone()
    .installPlugin(require('./magicpen-dark-syntax-theme'));

var styleRegex = /style=".*?"/;

module.exports = function plugin(options) {
    options = options || {};
    var keys = options.keys || [];

    return function(files, metalsmith, done){
        var exampleTests = {};
        Object.keys(files).forEach(function(file){
            debug('checking file: %s', file);
            if (!markdown(file)) return;
            var data = files[file];
            var dir = dirname(file);
            var html = basename(file, extname(file)) + '.html';
            if ('.' !== dir) html = dir + '/' + html;

            var exampleExpect = (files[file].theme === 'dark' ? darkExpect : lightExpect).clone();
            var context = vm.createContext({
                expect: exampleExpect
            });

            var lastError = '';

            var tests = exampleTests[file] = [];
            options.renderer = new marked.Renderer();
            var originalCodeRenderer = options.renderer.code;
            options.renderer.code = function(code, lang, escaped) {
                switch (lang) {
                case 'js':
                case 'javascript':
                    tests.push({ code: code });
                    var pen = exampleExpect.output.clone();
                    var syntaxHighlighed =
                        pen.code(code, 'javascript').toString('html')
                            .replace(styleRegex, 'class="code ' + this.options.langPrefix + 'javascript"');
                    try {
                        vm.runInContext(code, context);
                    } catch (e) {
                        var errorMessage = e._isUnexpected ?
                            e.output :
                            exampleExpect.output.clone().error(e.message);

                        lastError = errorMessage.toString('html')
                            .replace(styleRegex, 'class="output"');
                    }
                    return syntaxHighlighed;
                case 'output':
                    tests[tests.length - 1].output = code;
                    return lastError;
                default: return originalCodeRenderer.call(this, code, lang, escaped);
                }
            };
            debug('converting file: %s', file);
            var str = marked(data.contents.toString(), options);
            data.contents = new Buffer(str);
            keys.forEach(function(key) {
                data[key] = marked(data[key], options);
            });

            delete files[file];
            files[html] = data;
        });

        var pen = unexpected.output.clone();
        pen.indentationWidth = 4;
        pen.addStyle('escapedString', function (content) {
            this.text(JSON.stringify(content).replace(/^"|"$/g, ''));
        });

        pen.text('/*global describe, it*/').nl();
        pen.text('// THIS FILE IS AUTOGENERATED! DO NOT CHANGE IT MANUALLY.').nl();
        pen.text('// THIS FILE IS AUTOGENERATED! DO NOT CHANGE IT MANUALLY.').nl();
		pen.text('// It is built based on the examples in the documentation folder').nl();
		pen.text('// when the documentation site gets build by running "make site-build".').nl();
		pen.text('var expect = require("../").clone();').nl(2);

        pen.text('expect.addAssertion("to have message", function (expect, subject, value) {').nl();
        pen.indentLines();
        pen.i().block(function () {
            this.text('var message;').nl();
            this.text('if (subject._isUnexpected) {').nl();
            this.text('    message = subject.output.toString();').nl();
            this.text('} else if (subject && Object.prototype.toString.call(subject) === "[object Error]") {').nl();
            this.text('    message = subject.message;').nl();
            this.text('} else {').nl();
            this.text('    message = String(subject);').nl();
            this.text('}').nl();
            this.text('this.errorMode = "bubble";').nl();
            this.text('expect(message, "to equal", value);');
        }).nl();
        pen.outdentLines();
        pen.text('});').nl(2);

        pen.text('describe("documentation tests", function () {').nl();
        pen.indentLines();
        Object.keys(exampleTests).forEach(function (file, index) {
            if (index > 0) {
                pen.nl();
            }

            var tests = exampleTests[file];
            pen.i().text('it("').text(file).text(' contains correct examples", function () {').nl();
            pen.indentLines();

            tests.forEach(function (test, index) {
                if (index > 0) {
                    pen.nl();
                }

                if (test.output) {
                    pen.i().text('try {').nl();
                    pen.indentLines();
                    pen.i().block('text', test.code).nl();
                    pen.i().text('expect.fail(function (output) {').nl();
                    pen.indentLines();
                    pen.i().text('output.error("expected:").nl();').nl();
                    test.code.split(/\n/).forEach(function (line, index) {
                        pen.i().text('output.code("').escapedString(line).text('").nl();').nl();
                    });
                    pen.i().text('output.error("to throw");').nl();
                    pen.outdentLines();
                    pen.i().text('});').nl();
                    pen.outdentLines();
                    pen.i().text('} catch (e) {').nl();
                    pen.indentLines();
                    pen.i().text('expect(e, "to have message",').nl();
                    pen.indentLines();
                    var lines = test.output.split(/\n/);
                    lines.forEach(function (line, index) {
                        pen.i().text('"').escapedString(line);
                        if (index < lines.length - 1) {
                            pen.text('\\n" +').nl();
                        } else {
                            pen.text('"');
                        }
                    });
                    pen.nl();
                    pen.outdentLines();
                    pen.i().text(');').nl();
                    pen.outdentLines();
                    pen.i().text('}');
                } else {
                    pen.i().block('text', test.code);
                }
                pen.nl();
            });

            pen.outdentLines();
            pen.i().text('});').nl();
        });
        pen.outdentLines();
        pen.text('});').nl();

        fs.writeFile(resolve(__dirname, '..', 'test', 'documentation.spec.js'), pen.toString(), done);
    };
};

function markdown(file){
    return /\.md|\.markdown/.test(extname(file));
}
