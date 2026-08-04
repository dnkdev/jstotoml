// thanks to our contributor ChatGPT
// node --test

import test from 'node:test';
import assert from 'node:assert/strict';

import toToml from '../index.js';

test('converts primitive values', () => {
    const result = toToml({
        name: 'Daniel',
        age: 11,
        active: true
    });

    assert.equal(
        result,
        `name = 'Daniel'
age = 11
active = true
`
    );
});


test('converts arrays', () => {
    const result = toToml({
        numbers: [1, 2, 3],
        names: ['one', 'two']
    });

    assert.equal(
        result,
        `numbers = [ 1, 2, 3 ]
names = [ 'one', 'two' ]
`
    );
});


test('converts nested objects into tables', () => {
    const result = toToml({
        database: {
            host: 'localhost',
            port: 5432
        }
    });

    assert.equal(
        result,
        `
[database]
host = 'localhost'
port = 5432
`
    );
});


test('supports deep nested objects', () => {
    const result = toToml({
        server: {
            database: {
                host: 'localhost'
            }
        }
    });

    assert.equal(
        result,
        `
[server]

[server.database]
host = 'localhost'
`
    );
});


test('supports table prefix option', () => {
    const result = toToml({
        main: 'buzz',
        config: {
            data: 'foo',
            database: {
                host: 'localhost'
            }
        }
    });

    assert.equal(
        result,
        `main = 'buzz'

[config]
data = 'foo'

[config.database]
host = 'localhost'
`
    );
});


test('converts dates', () => {
    const date = new Date('2026-01-01T00:00:00.000Z');

    const result = toToml({
        created: date
    });

    assert.equal(
        result,
        `created = 2026-01-01T00:00:00.000Z
`
    );
});


test('handles strings with quotes', () => {
    const result = toToml({
        text: "hello 'world'"
    });

    assert.equal(
        result,
        `text = "hello 'world'"
`
    );
});
test('handles strings with quotes', () => {
    const result = toToml({
        text: 'hello "world"'
    });

    assert.equal(
        result,
        `text = 'hello "world"'
`
    );
});


test('handles multiline strings', () => {
    const result = toToml({
        text: 'hello\nworld'
    });

    assert.equal(
        result,
        `text = """hello
world"""
`
    );
});

test('converts root primitive and array', () => {
    assert.equal(
        toToml('hello'),
        ''
    );
    assert.equal(
        toToml([1,2,3]),
        ''
    );
});

test('parseString hardening', () => {
    const result = toToml({
        data: 'Name is """Daniel""".\nI \'\'\'like\'\'\' javascript \'frameworks\' as "Ignore", and girls!',
        info: 'I\'m sure!'
    });

    assert.equal(result,
        String.raw`data = """Name is \"\"\"Daniel\"\"\".
I '''like''' javascript 'frameworks' as \"Ignore\", and girls!"""
info = "I'm sure!"
`
    );
}); 

