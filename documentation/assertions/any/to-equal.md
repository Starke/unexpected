Asserts deep equality.

```js
expect({ a: 'b' }, 'to equal', { a: 'b' });
const now = new Date();
expect(now, 'to equal', now);
expect(now, 'to equal', new Date(now.getTime()));
expect({ now }, 'to equal', { now });
```

For a lot of types a failing equality test results in a nice
diff. Below you can see some examples of the diffs.

An object diff containing a string diff:

```js
expect({ text: 'foo!' }, 'to equal', { text: 'f00!' });
```

```output
expected { text: 'foo!' } to equal { text: 'f00!' }

{
  text: 'foo!' // should equal 'f00!'
               //
               // -foo!
               // +f00!
}
```

A diff between objects with different keys.

```js
expect({ one: 1, two: 2, four: 4, five: 5 }, 'to equal', {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
});
```

```output
expected { one: 1, two: 2, four: 4, five: 5 }
to equal { one: 1, two: 2, three: 3, four: 4 }

{
  one: 1,
  two: 2,
  four: 4,
  five: 5 // should be removed
  // missing three: 3
}
```

A diff between two arrays.

```js
expect([0, 2, 1, 4], 'to equal', [0, 1, 2, 3, 4]);
```

```output
expected [ 0, 2, 1, 4 ] to equal [ 0, 1, 2, 3, 4 ]

[
    0,
┌─▷
│   2,
│   // missing 3
└── 1, // should be moved
    4
]
```

A diff between two buffers.

<!-- unexpected-markdown skipBrowser:true -->

```js
expect(
  Buffer.from('\x00\x01\x02Here is the thing I was talking about', 'utf-8'),
  'to equal',
  Buffer.from('\x00\x01\x02Here is the thing I was quuxing about', 'utf-8')
);
```

```output
expected Buffer.from([0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74 /* 24 more */ ])
to equal Buffer.from([0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74 /* 24 more */ ])

 00 01 02 48 65 72 65 20 69 73 20 74 68 65 20 74  │...Here is the t│
-68 69 6E 67 20 49 20 77 61 73 20 74 61 6C 6B 69  │hing I was talki│
+68 69 6E 67 20 49 20 77 61 73 20 71 75 75 78 69  │hing I was quuxi│
 6E 67 20 61 62 6F 75 74                          │ng about│
```

This assertion can be negated using the `not` flag:

```js
expect(1, 'not to equal', '1');
expect({ one: 1 }, 'not to equal', { one: '1' });
expect(null, 'not to equal', '1');
const now = new Date();
const later = new Date(now.getTime() + 42);
expect(now, 'not to equal', later);
expect({ time: now }, 'not to equal', { time: later });
```

In case of a failing expectation you get the following output:

```js
expect({ a: { b: 'd' } }, 'not to equal', { a: { b: 'd' } });
```

```output
expected { a: { b: 'd' } } not to equal { a: { b: 'd' } }
```
