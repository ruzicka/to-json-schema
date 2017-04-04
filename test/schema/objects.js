'use strict'

const testSchema = require('../helpers/testSchema').tesSchemaWithAndWithoutArrayMerge
const testSchemaNormal = require('../helpers/testSchema').testSchemaWithoutArrayMerge
const testSchemaMerge = require('../helpers/testSchema').testSchemaWithArrayMerge
const should = require('chai').should()

const toJsonSchema = require('../../src/index')
const expect = require('chai').expect

describe('Objects', () => {

	describe('Invalid not-schema', () => {

		it.skip('should throw error if both $required and $optional present', () => {
			expect(() => toJsonSchema({
				id: 11,
				name: 'test',
				$required: ['name'],
				$optional: ['id'],
			})).to.throw(Error, "Defining both '$required' and '$optional' fields is not allowed")
		})

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

	describe('Object containing real JSON schema', () => {

		it('should get schema for empty object', () => {
			testSchema({$schema: {type: 'integer'}}, {type: 'integer'}, 11)
		})

		it('should get schema for object with properties (no nested objects)', () => {
			testSchema({
				id: 11,
				name: 'john',
				labels: {$schema: {type: 'array', items: {type: 'string'}}},
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
			}, {
				id: 11,
				name: 'john',
				labels: ['item1', 'item2'],
			})
		})

		it('should get schema for object with nested objects', () => {
			testSchema({
				id: 11,
				name: 'john',
				friend: {$schema: {type: 'object', properties: {
					first_name: {type: 'string'},
					last_name: {type: 'string'},
				}}},
			}, {
				type: 'object',
				properties: {
					id: {type: 'integer'},
					name: {type: 'string'},
					friend: {type: 'object', properties: {
						first_name: {type: 'string'},
						last_name: {type: 'string'},
					}},
				},
			}, {
				id: 11,
				name: 'john',
				friends: {
					first_name: 'jack',
				},
			})
		})

	})

})
