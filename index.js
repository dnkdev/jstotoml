// @ts-check
/**
 * Converts js object to toml string.
 * @param {any} jsobject 
 * @param {any} options - no options to use now
 * @returns {string}
 */
export default function totoml(jsobject, options = undefined) {
    if (jsobject instanceof Object && !Array.isArray(jsobject)) {
        const stringBuffer = [];
        const globals = [];
        const tables = [];
        for (const key of Object.keys(jsobject)) {
            if (typeof jsobject[key] === 'object' && !Array.isArray(jsobject[key]) && Object.prototype.toString.call(jsobject[key]) !== '[object Date]') {
                tables.push(key);
            }
            else {
                globals.push(key);
            }
        }
        for (const key of globals) {
            stringBuffer.push(`${parsePrimitive(jsobject[key], key)}\n`);
        }
        for (const key of tables) {
            let prefix = '';
            if (options && options.table_prefix) {
                prefix = options.table_prefix
            }
            stringBuffer.push(`${parseObject(jsobject[key], key, prefix)}`)
        }

        return stringBuffer.join('')
    }
    else {
        return parsePrimitive(jsobject);
    }

    function parsePrimitive(/** @type {any} */ primitive, /** @type {string} */ key) {
        if (typeof primitive === 'string') {
            let q = "'";
            if (primitive.includes("'")) {
                q = '"';
            }
            if (primitive.includes("\n")) {
                q = '"""'
            }
            return `${key} = ${q}${primitive}${q}`
        }
        else if (typeof primitive === 'number' || typeof primitive === 'boolean') {
            return `${key} = ${primitive}`;
        }
        else if (Array.isArray(primitive)) {
            return `${key} = ${parseArray(primitive)}`;
        }
        else if (Object.prototype.toString.call(primitive) === '[object Date]') {
            return `${key} = ${primitive.toISOString()}`
        }
        return '';
    }

    function parseArray(/** @type {Array<any>} */ array) {
        const str = ['[ ']
        const length = array.length;
        for (let i = 0; i < length; i++) {
            if (array[i] === undefined) {
                continue;
            }
            if (typeof array[i] === 'object' && !Array.isArray(array[i])) {
                const object = array[i];
                str.push('{');
                const fields = Object.keys(object);
                for (const [index, key] of fields.entries()) {
                    let primitive = parsePrimitive(object[key], key)
                    if (index + 1 < fields.length) {
                        primitive = primitive.slice(0, primitive.length - 1).concat(',');
                    }
                    str.push(` ${primitive}`)
                }
                str.push('}');
            }
            else if (Array.isArray(array[i])) {
                str.push(`${parseArray(array[i])}`);
            }
            else if (typeof array[i] === 'string') {
                let q = "'";
                if (array[i].includes("'")) {
                    q = '"';
                }
                str.push(`${q}${array[i]}${q}`);
            }
            else {
                str.push(array[i].toString())
            }
            if (i + 1 < length) {
                str.push(', ')
            }
        }
        str.push(' ]')
        return str.join('');
    }

    function parseObject(/** @type {any} */ object, /** @type {string} */ tablename, /** @type {string | undefined} */ table_prefix) {
        let prefix = '';
        if (table_prefix) {
            prefix = table_prefix + '.'
        }
        const str = [`\n[${prefix}${tablename}]\n`];

        str.push(totoml(object, { table_prefix: tablename }))
        return str.join('')
    }
}