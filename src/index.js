'use strict'

const helpers = require('./helpers')
const _ = require('lodash')

function getCommonTypeFromArrayOfTypes(arrOfTypes) {
	let lastVal
	for (let i = 0, length = arrOfTypes.length; i < length; i++) {
		let currentType = arrOfTypes[i]
		if (i > 0) {
			if (currentType === 'integer' && lastVal === 'number') {
				currentType = 'number'
			} else if (currentType === 'number' && lastVal === 'integer') {
				lastVal = 'number'
			}
			if (lastVal !== currentType) return null
		}
		lastVal = currentType
	}
	return lastVal
}

function getCommonArrayItemsType(arr) {
	return getCommonTypeFromArrayOfTypes(arr.map(item => helpers.getType(item)))
}

/**
 * Tries to find the least common schema that would validate all items in the array. More details
 * helpers.mergeSchemaObjs description
 * @param {array} arr
 * @returns {object|null}
 */
function getCommonArrayItemSchema(arr, arrayMerge) {
	const schemas = arr.map(item => getSchema(item, arrayMerge, null))
	// schemas.forEach(schema => console.log(JSON.stringify(schema, '\t')))
	return schemas.reduce((acc, current) => helpers.mergeSchemaObjs(acc, current), schemas.pop())
}

function getSchemaForObject(obj, arrayMerge) {
	const schema = {type: 'object'}
	const objKeys = Object.keys(obj).filter(key => key !== '$required' && key !== '$optional')
	if (objKeys.length > 0) {
		const requiredFields = obj.$required || []
		const notRequiredFields = obj.$optional || []
		if (obj.$required && obj.$optional) {
			throw new Error("Defining both '$required' and '$optional' fields is not allowed")
		}
		const defaultRequired = !Boolean(obj.$required)
		schema.properties = objKeys.reduce((acc, propertyName) => {
			let requiredVal = defaultRequired
			if (requiredFields.indexOf(propertyName) >= 0) {
				requiredVal = true
			}
			if (notRequiredFields.indexOf(propertyName) >= 0) {
				requiredVal = false
			}
			acc[propertyName] = getSchema(obj[propertyName], arrayMerge, requiredVal)
			return acc
		}, {})
	}
	return schema
}

function getSchemaForArray(arr, arrayMerge) {
	const schema = {type: 'array'}
	const commonType = getCommonArrayItemsType(arr)
	if (commonType) {
		schema.items = {type: commonType}
		if (commonType !== 'integer' && commonType !== 'number') {
			const itemSchema = getCommonArrayItemSchema(arr, arrayMerge)
			if (itemSchema) {
				schema.items = itemSchema
			}
		}
	}
	return schema
}

function getSchemaForArrayNoMerging(arr, arrayMerge) {
	const schema = {type: 'array'}
	if (arr.length > 0) {
		schema.items = getSchema(arr[0], arrayMerge, null)
	}
	if (arr.length > 1) {
		for (let i = 1; i < arr.length; i++) {
			if (!_.isEqual(schema.items, getSchema(arr[i], arrayMerge, null))) {
				throw new Error('Invalid schema, incompatible array items')
			}
		}
	}
	return schema
}

/**
 * Gets JSON schema for provided value
 * @param value
 * @param {boolean|null} required - If true/false, then it will be assumed that value is required/optional. If
 * null, than the required field is omitted completely in the returned schema (this doesn't have an effect on subitems).
 * @param {boolean} arrayMerge - If true, array items will be merged to least compatible scheme if types are
 * incompatible.
 * @returns {object}
 */
function getSchema(value, arrayMerge, required) {
	if (typeof arrayMerge === 'undefined') {
		arrayMerge = false
	}

	if (typeof required === 'undefined') {
		required = true
	}
	const type = helpers.getType(value)
	if (!type) {
		throw new Error("Type of value couldn't be determined")
	}

	let schema = {type}


	if (type === 'object') {
		if (value.$schema) {
			return value.$schema
		}
		schema = getSchemaForObject(value, arrayMerge)
	} else if (type === 'array' && value.length > 0) {
		schema = arrayMerge ? getSchemaForArray(value, arrayMerge) : getSchemaForArrayNoMerging(value, arrayMerge)
	} else if (type === 'string') {
		let index = helpers.stringFormats.indexOf(value)
		if (index >= 0) {
			schema.format = helpers.stringFormats[index]
		} else {
			const skipReverseFind = ['hostname', 'host-name', 'alpha', 'alphanumeric', 'regex', 'regexp', 'pattern']
			const filteredFormats = helpers.stringFormats.filter(item => skipReverseFind.indexOf(item) < 0)
			index = filteredFormats.findIndex(item => helpers.isFormat(value, item))
			if (index >= 0) {
				schema.format = filteredFormats[index]
			}
		}
	}

	if (typeof required === 'boolean') {
		schema.required = required
	}

	return schema
}

module.exports = getSchema
