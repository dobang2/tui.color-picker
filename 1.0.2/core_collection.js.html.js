tui.util.defineNamespace("fedoc.content", {});
fedoc.content["core_collection.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Common collections.\n * @author NHN Ent. FE Development Team &lt;dl_javascript@nhnent.com>\n */\n'use strict';\n\nvar util = global.tui.util,\n    forEachProp = util.forEachOwnProperties,\n    forEachArr = util.forEachArray,\n    isFunc = util.isFunction,\n    isObj = util.isObject;\n\nvar aps = Array.prototype.slice;\n\n/**\n * Common collection.\n *\n * It need function for get model's unique id.\n *\n * if the function is not supplied then it use default function {@link Collection#getItemID}\n * @constructor\n * @param {function} [getItemIDFn] function for get model's id.\n */\nfunction Collection(getItemIDFn) {\n    /**\n     * @type {object.&lt;string, *>}\n     */\n    this.items = {};\n\n    /**\n     * @type {number}\n     */\n    this.length = 0;\n\n    if (isFunc(getItemIDFn)) {\n        /**\n         * @type {function}\n         */\n        this.getItemID = getItemIDFn;\n    }\n}\n\n/**********\n * static props\n **********/\n\n/**\n * Combind supplied function filters and condition.\n * @param {...function} filters - function filters\n * @returns {function} combined filter\n */\nCollection.and = function(filters) {\n    var cnt;\n\n    filters = aps.call(arguments);\n    cnt = filters.length;\n\n    return function(item) {\n        var i = 0;\n\n        for (; i &lt; cnt; i += 1) {\n            if (!filters[i].call(null, item)) {\n                return false;\n            }\n        }\n        \n        return true;\n    };\n};\n\n/**\n * Combine multiple function filters with OR clause.\n * @param {...function} filters - function filters\n * @returns {function} combined filter\n */\nCollection.or = function(filters) {\n    var cnt;\n\n    filters = aps.call(arguments);\n    cnt = filters.length;\n\n    return function(item) {\n        var i = 1,\n            result = filters[0].call(null, item);\n\n        for (; i &lt; cnt; i += 1) {\n            result = (result || filters[i].call(null, item));\n        }\n\n        return result;\n    };\n};\n\n/**\n * Merge several collections.\n *\n * You can\\'t merge collections different _getEventID functions. Take case of use.\n * @param {...Collection} collections collection arguments to merge\n * @returns {Collection} merged collection.\n */\nCollection.merge = function(collections) {    // eslint-disable-line\n    var cols = aps.call(arguments),\n        newItems = {},\n        merged = new Collection(cols[0].getItemID),\n        extend = util.extend;\n\n    forEachArr(cols, function(col) {\n        extend(newItems, col.items);\n    });\n\n    merged.items = newItems;\n    merged.length = util.keys(merged.items).length;\n\n    return merged;\n};\n\n/**********\n * prototype props\n **********/\n\n/**\n * get model's unique id.\n * @param {object} item model instance.\n * @returns {number} model unique id.\n */\nCollection.prototype.getItemID = function(item) {\n    return item._id + '';\n};\n\n/**\n * add models.\n * @param {...*} item models to add this collection.\n */\nCollection.prototype.add = function(item) {\n    var id,\n        ownItems;\n\n    if (arguments.length > 1) {\n        forEachArr(aps.call(arguments), function(o) {\n            this.add(o);\n        }, this);\n\n        return;\n    }\n\n    id = this.getItemID(item);\n    ownItems = this.items;\n\n    if (!ownItems[id]) {\n        this.length += 1;\n    }\n    ownItems[id] = item;\n};\n\n/**\n * remove models.\n * @param {...(object|string|number)} id model instance or unique id to delete.\n * @returns {array} deleted model list.\n */\nCollection.prototype.remove = function(id) {\n    var removed = [],\n        ownItems,\n        itemToRemove;\n\n    if (!this.length) {\n        return removed;\n    }\n\n    if (arguments.length > 1) {\n        removed = util.map(aps.call(arguments), function(id) {\n            return this.remove(id);\n        }, this);\n\n        return removed;\n    }\n\n    ownItems = this.items;\n\n    if (isObj(id)) {\n        id = this.getItemID(id);\n    }\n\n    if (!ownItems[id]) {\n        return removed;\n    }\n\n    this.length -= 1;\n    itemToRemove = ownItems[id];\n    delete ownItems[id];\n\n    return itemToRemove;\n};\n\n/**\n * remove all models in collection.\n */\nCollection.prototype.clear = function() {\n    this.items = {};\n    this.length = 0;\n};\n\n/**\n * check collection has specific model.\n * @param {(object|string|number|function)} id model instance or id or filter function to check\n * @returns {boolean} is has model?\n */\nCollection.prototype.has = function(id) {\n    var isFilter,\n        has;\n\n    if (!this.length) {\n        return false;\n    }\n\n    isFilter = isFunc(id);\n    has = false;\n\n    if (isFilter) {\n        this.each(function(item) {\n            if (id(item) === true) {\n                has = true;\n                return false;\n            }\n        });\n    } else {\n        id = isObj(id) ? this.getItemID(id) : id;\n        has = util.isExisty(this.items[id]);\n    }\n\n    return has;\n};\n\n/**\n * invoke callback when model exist in collection.\n * @param {(string|number)} id model unique id.\n * @param {function} fn the callback.\n * @param {*} [context] callback context.\n */\nCollection.prototype.doWhenHas = function(id, fn, context) {\n    var item = this.items[id];\n\n    if (!util.isExisty(item)) {\n        return;\n    }\n\n    fn.call(context || this, item);\n};\n\n/**\n * Search model. and return new collection.\n * @param {function} filter filter function.\n * @returns {Collection} new collection with filtered models.\n * @example\n * collection.find(function(item) {\n *     return item.edited === true;\n * });\n *\n * function filter1(item) {\n *     return item.edited === false;\n * }\n *\n * function filter2(item) {\n *     return item.disabled === false;\n * }\n *\n * collection.find(Collection.and(filter1, filter2));\n *\n * collection.find(Collection.or(filter1, filter2));\n */\nCollection.prototype.find = function(filter) {\n    var result = new Collection();\n\n    if (this.hasOwnProperty('getItemID')) {\n        result.getItemID = this.getItemID;\n    }\n\n    this.each(function(item) {\n        if (filter(item) === true) {\n            result.add(item);\n        }\n    });\n\n    return result;\n};\n\n/**\n * Group element by specific key values.\n *\n * if key parameter is function then invoke it and use returned value.\n * @param {(string|number|function|array)} key key property or getter function. if string[] supplied, create each collection before grouping.\n * @param {function} [groupFunc] - function that return each group's key\n * @returns {object.&lt;string, Collection>} grouped object\n * @example\n * \n * // pass `string`, `number`, `boolean` type value then group by property value.\n * collection.groupBy('gender');    // group by 'gender' property value.\n * collection.groupBy(50);          // group by '50' property value.\n * \n * // pass `function` then group by return value. each invocation `function` is called with `(item)`.\n * collection.groupBy(function(item) {\n *     if (item.score > 60) {\n *         return 'pass';\n *     }\n *     return 'fail';\n * });\n *\n * // pass `array` with first arguments then create each collection before grouping.\n * collection.groupBy(['go', 'ruby', 'javascript']);\n * // result: { 'go': empty Collection, 'ruby': empty Collection, 'javascript': empty Collection }\n *\n * // can pass `function` with `array` then group each elements.\n * collection.groupBy(['go', 'ruby', 'javascript'], function(item) {\n *     if (item.isFast) {\n *         return 'go';\n *     }\n *\n *     return item.name;\n * });\n */\nCollection.prototype.groupBy = function(key, groupFunc) {\n    var result = {},\n        collection,\n        baseValue,\n        isFunc = util.isFunction,\n        keyIsFunc = isFunc(key),\n        getItemIDFn = this.getItemID;\n\n    if (util.isArray(key)) {\n        util.forEachArray(key, function(k) {\n            result[k + ''] = new Collection(getItemIDFn);\n        });\n\n        if (!groupFunc) {\n            return result;\n        }\n\n        key = groupFunc;\n        keyIsFunc = true;\n    }\n\n    this.each(function(item) {\n        if (keyIsFunc) {\n            baseValue = key(item);\n        } else {\n            baseValue = item[key];\n\n            if (isFunc(baseValue)) {\n                baseValue = baseValue.apply(item);\n            }\n        }\n\n        collection = result[baseValue];\n\n        if (!collection) {\n            collection = result[baseValue] = new Collection(getItemIDFn);\n        }\n\n        collection.add(item);\n    });\n\n    return result;\n};\n\n/**\n * Return single item in collection.\n *\n * Returned item is inserted in this collection firstly.\n * @returns {object} item.\n */\nCollection.prototype.single = function() {\n    var result;\n\n    this.each(function(item) {\n        result = item;\n        return false;\n    }, this);\n\n    return result;\n};\n\n/**\n * sort a basis of supplied compare function.\n * @param {function} compareFunction compareFunction\n * @returns {array} sorted array.\n */\nCollection.prototype.sort = function(compareFunction) {\n    var arr = [];\n\n    this.each(function(item) {\n        arr.push(item);\n    });\n\n    if (isFunc(compareFunction)) {\n        arr = arr.sort(compareFunction);\n    }\n\n    return arr;\n};\n\n/**\n * iterate each model element.\n *\n * when iteratee return false then break the loop.\n * @param {function} iteratee iteratee(item, index, items)\n * @param {*} [context] context\n */\nCollection.prototype.each = function(iteratee, context) {\n    forEachProp(this.items, iteratee, context || this);\n};\n\n/**\n * return new array with collection items.\n * @returns {array} new array.\n */\nCollection.prototype.toArray = function() {\n    if (!this.length) {\n        return [];\n    }\n\n    return util.map(this.items, function(item) {\n        return item;\n    });\n};\n\nmodule.exports = Collection;\n\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"