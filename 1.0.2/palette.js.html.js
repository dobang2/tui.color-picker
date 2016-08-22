tui.util.defineNamespace("fedoc.content", {});
fedoc.content["palette.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Color palette view\n * @author NHN Ent. FE Development Team &lt;dl_javascript@nhnent.com>\n */\n'use strict';\nvar util = global.tui.util;\nvar domutil = require('./core/domutil');\nvar domevent = require('./core/domevent');\nvar View = require('./core/view');\nvar tmpl = require('../template/palette');\n\n/**\n * @constructor\n * @extends {View}\n * @mixes CustomEvents\n * @param {object} options - options for color palette view\n *  @param {string[]} options.preset - color list\n * @param {HTMLDivElement} container - container element\n */\nfunction Palette(options, container) {\n    /**\n     * option object\n     * @type {object}\n     */\n    this.options = util.extend({\n        cssPrefix: 'tui-colorpicker-',\n        preset: [\n            '#181818',\n            '#282828',\n            '#383838',\n            '#585858',\n            '#B8B8B8',\n            '#D8D8D8',\n            '#E8E8E8',\n            '#F8F8F8',\n            '#AB4642',\n            '#DC9656',\n            '#F7CA88',\n            '#A1B56C',\n            '#86C1B9',\n            '#7CAFC2',\n            '#BA8BAF',\n            '#A16946'\n        ],\n        detailTxt: 'Detail'\n    }, options);\n\n    container = domutil.appendHTMLElement(\n        'div',\n        container,\n        this.options.cssPrefix + 'palette-container'\n    );\n\n    View.call(this, options, container);\n}\n\nutil.inherit(Palette, View);\n\n/**\n * Mouse click event handler\n * @fires Palette#_selectColor\n * @fires Palette#_toggleSlider\n * @param {MouseEvent} clickEvent - mouse event object\n */\nPalette.prototype._onClick = function(clickEvent) {\n    var options = this.options,\n        target = clickEvent.srcElement || clickEvent.target,\n        eventData = {};\n\n    if (domutil.hasClass(target, options.cssPrefix + 'palette-button')) {\n        eventData.color = target.value;\n\n        /**\n         * @event Palette#_selectColor\n         * @type {object}\n         * @property {string} color - selected color value\n         */\n        this.fire('_selectColor', eventData);\n        return;\n    }\n\n    if (domutil.hasClass(target, options.cssPrefix + 'palette-toggle-slider')) {\n        /**\n         * @event Palette#_toggleSlider\n         */\n        this.fire('_toggleSlider');\n    }\n};\n\n/**\n * Textbox change event handler\n * @fires Palette#_selectColor\n * @param {Event} changeEvent - change event object\n */\nPalette.prototype._onChange = function(changeEvent) {\n    var options = this.options,\n        target = changeEvent.srcElement || changeEvent.target,\n        eventData = {};\n\n    if (domutil.hasClass(target, options.cssPrefix + 'palette-hex')) {\n        eventData.color = target.value;\n\n        /**\n         * @event Palette#_selectColor\n         * @type {object}\n         * @property {string} color - selected color value\n         */\n        this.fire('_selectColor', eventData);\n        return;\n    }\n};\n\n/**\n * Invoke before destory\n * @override\n */\nPalette.prototype._beforeDestroy = function() {\n    this._toggleEvent(false);\n};\n\n/**\n * Toggle view DOM events\n * @param {boolean} [onOff=false] - true to bind event.\n */\nPalette.prototype._toggleEvent = function(onOff) {\n    var options = this.options,\n        container = this.container,\n        method = domevent[!!onOff ? 'on' : 'off'],\n        hexTextBox;\n\n    method(container, 'click', this._onClick, this);\n\n    hexTextBox = domutil.find('.' + options.cssPrefix + 'palette-hex', container);\n\n    if (hexTextBox) {\n        method(hexTextBox, 'change', this._onChange, this);\n    }\n};\n\n/**\n * Render palette\n * @override\n */\nPalette.prototype.render = function(color) {\n    var options = this.options,\n        html = '';\n\n    this._toggleEvent(false);\n\n    html = tmpl.layout.replace('{{colorList}}', util.map(options.preset, function(_color) {\n        var itemHtml = tmpl.item.replace(/{{color}}/g, _color);\n        itemHtml = itemHtml.replace('{{selected}}', _color === color ?  (' ' + options.cssPrefix + 'selected') : ''); \n\n        return itemHtml;\n    }).join(''));\n\n    html = html.replace(/{{cssPrefix}}/g, options.cssPrefix)\n        .replace('{{detailTxt}}', options.detailTxt)\n        .replace(/{{color}}/g, color);\n\n    this.container.innerHTML = html;\n\n    this._toggleEvent(true);\n};\n\nutil.CustomEvents.mixin(Palette);\n\nmodule.exports = Palette;\n\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"