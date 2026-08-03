// @ts-check
/**
 * Converts js object to toml string.
 * @param {any} jsobject 
 * @param {any} options - no options to use now (used for inner recursion for nested objects - table_prefix)
 * @returns {string}
 */
export default function toToml(jsobject, options = undefined) {
    if (jsobject instanceof Object && !Array.isArray(jsobject)) {
        const stringBuffer = [];
        const tables = [];
        for (const key of Object.keys(jsobject)) {
            const value = jsobject[key];
            if (typeof value === 'object' && !Array.isArray(value) && Object.prototype.toString.call(value) !== '[object Date]') {
                tables.push(key);
            }
            else {
                stringBuffer.push(parsePrimitive(value, key), "\n");
            }
        }
        for (const key of tables) {
            let prefix = '';
            if (options && options.table_prefix) {
                prefix = options.table_prefix
            }
            stringBuffer.push(parseObject(jsobject[key], key, prefix))
        }

        return stringBuffer.join('')
    }
    else {
        return '';
    }

    function parseString(/** @type {string} */ str){
        let q = "'";
        // @ts-ignore
        if (str.includes("'")) {
            q = '"';
        }
        // @ts-ignore
        if (str.includes("\n")) {
            q = '"""'
        }
        return `${q}${str}${q}`
    }

    function parsePrimitive(/** @type {any} */ primitive, /** @type {string} */ key) {
        if (key != '')
        if (typeof primitive === 'string') {
            return `${key} = ${parseString(primitive)}`
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
                // @ts-ignore
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
                str.push(parseArray(array[i]));
            }
            else if (typeof array[i] === 'string') {
                str.push(parseString(array[i]));
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

        str.push(toToml(object, { table_prefix: tablename }))
        return str.join('')
    }
}