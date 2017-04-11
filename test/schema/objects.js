'use strict'

const testSchema = require('../helpers/testSchema').tesSchemaWithAndWithoutArrayMerge
const testSchemaNormal = require('../helpers/testSchema').testSchemaWithoutArrayMerge
const testSchemaMerge = require('../helpers/testSchema').testSchemaWithArrayMerge
const toJsonSchema = require('../../src/index')
const should = require('chai').should()
const omit = require('lodash.omit')

const expect = require('chai').expect

describe('Objects', () => {

	describe('Invalid not-schema', () => {

		it('should throw error for undefined value', () => {
			expect(() => toJsonSchema()).to.throw(Error, "Type of value couldn't be determined")
		})

	})


	describe('Simple objects', () => {

		it('should get schema for empty object', () => {
			testSchema({}, {type: 'object'})
		})

		it('should get schema for object with properties (no nested objects)', () => {
			testSchema({
				id: 11,
				name: 'john',
				labels: ['short', 'fat'],
			}, {
				type: 'object',
				properties: {
					id: {type: 'integer'},
					name: {type: 'string'},
					labels: {
						type: 'array',
						items: {type: 'string'},
					},
				},
			})
		})

		it('should get schema for object with nested objects', () => {
			testSchema({
				id: 11,
				name: 'john',
				friend: {
					first_name: 'Joe',
					last_name: 'Doe',
				},
			}, {
				type: 'object',
				properties: {
					id: {type: 'integer'},
					name: {type: 'string'},
					friend: {
						type: 'object',
						properties: {
							first_name: {type: 'string'},
							last_name: {type: 'string'},
						},
					},
				},
			})
		})

		it('should get schema for object with nested array of compatible objects', () => {
			const instance = {
				id: 12,
				a: [
					{test: 1},
					{differentKeyName: 2},
				],
			}
			const schema = {
				type: 'object',
				properties: {
					id: {type: 'integer'},
					a: {
						type: 'array',
						items: {
							type: 'object',
						},
					},
				},
			}
			testSchemaMerge(instance, schema)
			should.throw(() => testSchemaNormal(instance, schema), Error, 'Invalid schema')
		})

	})

	describe('Custom object func', () => {

		const options = {
      objects: {
        customFnc: (obj, defaultFnc) => {
          return  defaultFnc(omit(obj, ['a']), ['b'])
        }
      },
		}

		it('should remove a and make b required', () => {
			testSchema({a: 1, b: 2, c: 3}, {
				type: 'object',
				properties: {
					b: {type: 'integer', required: true},
					c: {type: 'integer'},
				}
			}, options)
		})

		it('should remove a and make b required also for nested', () => {
			testSchema({a: 1, b: 2, c: {a: 1, b: 2, c: 3}}, {
				type: 'object',
				properties: {
					b: {type: 'integer', required: true},
					c: {
            type: 'object',
            properties: {
              b: {type: 'integer', required: true},
              c: {type: 'integer'},
            }
          },
				}
			}, options)
		})
	})

})
