'use strict'

const merge = require('lodash.merge')
const isEqual = require('lodash.isequal')

const helpers = require('./helpers')

const defaultOptions = {
  required: false,
  strings: {
    detectFormat: true,
    customFnc: null,
  },
  arrays: {
    mode: 'all',
  },
  objects: {
    customFnc: null,
    requireOverrideFnc: null,
    additionalProperties: true,
  },
}

const skipReverseFind = ['hostname', 'host-name', 'alpha', 'alphanumeric', 'regex', 'regexp', 'pattern']
const filteredFormats = helpers.stringFormats.filter(item => skipReverseFind.indexOf(item) < 0)

function getCommonTypeFromArrayOfTypes(arrOfTypes) {
  let lastVal
  for (let i = 0, {length} = arrOfTypes; i < length; i++) {
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


class ToJsonSchema {
  constructor(options) {
    this.options = merge({}, defaultOptions, options)
  }

  /**
   * Tries to find the least common schema that would validate all items in the array. More details
   * helpers.mergeSchemaObjs description
   * @param {array} arr
   * @returns {object|null}
   */
  getCommonArrayItemSchema(arr) {
    const schemas = arr.map(item => this.getSchema(item))
    // schemas.forEach(schema => console.log(JSON.stringify(schema, '\t')))
    return schemas.reduce((acc, current) => helpers.mergeSchemaObjs(acc, current), schemas.pop())
  }

  getObjectSchemaDefault(obj, requiredFields = []) {
    const schema = {type: 'object'}
    const objKeys = Object.keys(obj)
    if (objKeys.length > 0) {
      schema.properties = objKeys.reduce((acc, propertyName) => {
        let required // keep it undefined if not in requiredFields
        if (requiredFields.indexOf(propertyName) >= 0) {
          required = true
        }
        acc[propertyName] = this.getSchema(obj[propertyName], required) // eslint-disable-line no-param-reassign
        return acc
      }, {})
    }
    return schema
  }

  getObjectSchema(obj) {
    if (this.options.objects.customFnc) {
      return this.options.objects.customFnc(obj, this.getObjectSchemaDefault.bind(this))
    }
    return this.getObjectSchemaDefault(obj)
  }

  getArraySchemaMerging(arr) {
    const schema = {type: 'array'}
    const commonType = getCommonArrayItemsType(arr)
    if (commonType) {
      schema.items = {type: commonType}
      if (commonType !== 'integer' && commonType !== 'number') {
        const itemSchema = this.getCommonArrayItemSchema(arr)
        if (itemSchema) {
          schema.items = itemSchema
        }
      } else if (this.options.required) {
        schema.items.required = true
      }
    }
    return schema
  }

  getArraySchemaNoMerging(arr) {
    const schema = {type: 'array'}
    if (arr.length > 0) {
      schema.items = this.getSchema(arr[0])
    }
    return schema
  }

  getArraySchemaUniform(arr) {
    const schema = this.getArraySchemaNoMerging(arr)

    if (arr.length > 1) {
      for (let i = 1; i < arr.length; i++) {
        if (!isEqual(schema.items, this.getSchema(arr[i]))) {
          throw new Error('Invalid schema, incompatible array items')
        }
      }
    }
    return schema
  }

  getArraySchema(arr) {
    if (arr.length === 0) { return {type: 'array'} }
    switch (this.options.arrays.mode) {
      case 'all': return this.getArraySchemaMerging(arr)
      case 'first': return this.getArraySchemaNoMerging(arr)
      case 'uniform': return this.getArraySchemaUniform(arr)
      default: throw new Error(`Unknown array mode option '${this.options.arrays.mode}'`)
    }
  }

  getStringSchemaDefault(value) {
    const schema = {type: 'string'}

    if (!this.options.strings.detectFormat) {
      return schema
    }

    const index = filteredFormats.findIndex(item => helpers.isFormat(value, item))
    if (index >= 0) {
      schema.format = filteredFormats[index]
    }

    return schema
  }

  getStringSchema(value) {
    if (this.options.strings.customFnc) {
      return this.options.strings.customFnc(value, this.getStringSchemaDefault.bind(this))
    }
    return this.getStringSchemaDefault(value)
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
  getSchema(value, required) {
    const type = helpers.getType(value)
    if (!type) {
      throw new Error("Type of value couldn't be determined")
    }

    let schema
    switch (type) {
      case 'object':
        schema = this.getObjectSchema(value)
        break
      case 'array':
        schema = this.getArraySchema(value)
        break
      case 'string':
        schema = this.getStringSchema(value)
        break
      default:
        schema = {type}
    }


    const defaultRequireFunc = schm => {
      if (typeof required === 'boolean') {
        return {...schm, required}
      } else if (this.options.required) {
        return {...schm, required: true}
      }
      return schm
    }

    if (this.options.objects.requireOverrideFnc) {
      schema = this.options.objects.requireOverrideFnc(schema, value, defaultRequireFunc)
    } else {
      schema = defaultRequireFunc(schema)
    }

    if (schema.type === 'object' && this.options.objects.additionalProperties === false) {
      schema.additionalProperties = false
    }

    return schema
  }
}

function toJsonSchema(value, options) {
  const tjs = new ToJsonSchema(options)
  return tjs.getSchema(value)
}

module.exports = toJsonSchema
