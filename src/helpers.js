'use strict'

const jsonSchemaHelpers = require('jsonschema/lib/helpers')
const isEqual = require('lodash.isequal');
const xor = require('lodash.xor');
const keys = require('lodash.keys');
const Validator = require('jsonschema').Validator
const v = new Validator()   // TODO verify if new instance is really needed
const types = v.types

const helpers = {

	stringFormats: keys(jsonSchemaHelpers.FORMAT_REGEXPS),

	isFormat: jsonSchemaHelpers.isFormat,

	typeNames: [
		'integer',
		'number', // make sure number is after integer (for proper type detection)
		'string',
		'array',
		'object',
		'boolean',
		'null',
		'date',
	],

	getType(val) {
		return helpers.typeNames.find(typeName => types[typeName](val))
	},

	/**
	 * Tries to find the least common schema from two supplied JSON schemas. If it is unable to find
	 * such a schema, it returns null. Incompatibility in structure/types leads to returning null,
	 * except when the difference is only integer/number. Than the 'number' is used instead 'int'.
	 * Types/Structure incompatibility in array items only leads to schema that doesn't specify
	 * items structure/type.
	 * @param {object} schema1 - JSON schema
	 * @param {object} schema2 - JSON schema
	 * @returns {object|null}
	 */
	mergeSchemaObjs(schema1, schema2) {
		const schema1Keys = keys(schema1)
		const schema2Keys = keys(schema2)
		if (!isEqual(schema1Keys, schema2Keys)) {
			if (schema1.type === 'array' && schema2.type === 'array') {
				// TODO optimize???
				if (isEqual(xor(schema1Keys, schema2Keys), ['items'])) {
					const schemaWithoutItems = schema1Keys.length > schema2Keys.length ? schema2 : schema1
					const schemaWithItems = schema1Keys.length > schema2Keys.length ? schema1 : schema2
					const isSame = keys(schemaWithoutItems).reduce((acc, current) =>
						isEqual(schemaWithoutItems[current], schemaWithItems[current]) && acc, true)
					if (isSame) {
						return schemaWithoutItems
					}
				}
			}
			if (schema1.type !== 'object' || schema2.type !== 'object') {
				return null
			}
		}

		const retObj = {}
		for (let i = 0, length = schema1Keys.length; i < length; i++) {
			const key = schema1Keys[i]
			if (helpers.getType(schema1[key]) === 'object') {
				const x = helpers.mergeSchemaObjs(schema1[key], schema2[key])
				if (!x) {
					if (schema1.type === 'object' || schema2.type === 'object') {
						return {type: 'object'}
					}
					// special treatment for array items. If not mergeable, we can do without them
					if (key !== 'items' || schema1.type !== 'array' || schema2.type !== 'array') {
						return null
					}
				} else {
					retObj[key] = x
				}
			} else {
				if (key === 'type') {
					if (schema1[key] !== schema2[key]) {
						if ((schema1[key] === 'integer' && schema2[key] === 'number')
							|| (schema1[key] === 'number' && schema2[key] === 'integer')) {
							retObj[key] = 'number'
						} else {
							return null
						}
					} else {
						retObj[key] = schema1[key]
					}
				} else {
					if (!isEqual(schema1[key], schema2[key])) {
						return null
					} else {
						retObj[key] = schema1[key]
					}
				}
			}
		}
		return retObj
		console.log(retObj)
	},

}

module.exports = helpers
