'use strict'

const helpers = require('./helpers')
const merge = require('lodash.merge');
const isEqual = require('lodash.isequal');

const defaultOptions = {
  strings: {
    detectFormat: true,
    customFnc: null,
  },
  arrays: {
    mode: 'merge'
  }
}

const skipReverseFind = ['hostname', 'host-name', 'alpha', 'alphanumeric', 'regex', 'regexp', 'pattern']
const filteredFormats = helpers.stringFormats.filter(item => skipReverseFind.indexOf(item) < 0)

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

class ToJsonSchema {

  constructor(options) {
    this.options = merge({}, defaultOptions, options)
  }

  getCommonArrayItemsType(arr) {
    return getCommonTypeFromArrayOfTypes(arr.map(item => helpers.getType(item)))
  }

  /**
   * Tries to find the least common schema that would validate all items in the array. More details
   * helpers.mergeSchemaObjs description
   * @param {array} arr
   * @returns {object|null}
   */
  getCommonArrayItemSchema(arr) {
    const schemas = arr.map(item => this.getSchema(item, null))
    // schemas.forEach(schema => console.log(JSON.stringify(schema, '\t')))
    return schemas.reduce((acc, current) => helpers.mergeSchemaObjs(acc, current), schemas.pop())
  }

  getSchemaForObject(obj) {
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
        acc[propertyName] = this.getSchema(obj[propertyName], requiredVal)
        return acc
      }, {})
    }
    return schema
  }

  getSchemaForArray(arr) {
    const schema = {type: 'array'}
    const commonType = this.getCommonArrayItemsType(arr)
    if (commonType) {
      schema.items = {type: commonType}
      if (commonType !== 'integer' && commonType !== 'number') {
        const itemSchema = this.getCommonArrayItemSchema(arr)
        if (itemSchema) {
          schema.items = itemSchema
        }
      }
    }
    return schema
  }

  getSchemaForArrayNoMerging(arr) {
    const schema = {type: 'array'}
    if (arr.length > 0) {
      schema.items = this.getSchema(arr[0], null)
    }
    if (arr.length > 1) {
      for (let i = 1; i < arr.length; i++) {
        if (!isEqual(schema.items, this.getSchema(arr[i], null))) {
          throw new Error('Invalid schema, incompatible array items')
        }
      }
    }
    return schema
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
    // console.log(this.options);
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
      schema = this.getSchemaForObject(value)
    } else if (type === 'array' && value.length > 0) {
      schema = this.options.arrays.mode === 'merge' ? this.getSchemaForArray(value) : this.getSchemaForArrayNoMerging(value)
    } else if (type === 'string') {
      schema = this.getStringSchema(value)
    }

    if (typeof required === 'boolean') {
      schema.required = required
    }

    return schema
  }
}

function toJsonSchema(value, arrayMerge, required) {
  const tjs = new ToJsonSchema({
    arrays: {
      mode: arrayMerge ? 'merge' : 'first',
    },
    strings: {
      customFnc: (value, prevFnc) => {
        const index = helpers.stringFormats.indexOf(value)
        if (index >= 0) {
          return {type: 'string', format: helpers.stringFormats[index]}
        }
        return prevFnc(value)
      },
    }
  })
  return tjs.getSchema(value, required)
}

module.exports = toJsonSchema
