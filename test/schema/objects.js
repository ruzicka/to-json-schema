'use strict'

const testSchema = require('../helpers/testSchema').tesSchemaWithAndWithoutArrayMerge
const testSchemaNormal = require('../helpers/testSchema').testSchemaWithoutArrayMerge
const testSchemaMerge = require('../helpers/testSchema').testSchemaWithArrayMerge
const should = require('chai').should()

const toJsonSchema = require('../../src/index')
const expect = require('chai').expect

describe('Objects', () => {

	describe('Invalid not-schema', () => {

		it('should throw error if both $required and $optional present', () => {
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
			testSchema({}, {type: 'object', required: true})
		})

		it('should get schema for object with properties (no nested objects)', () => {
			testSchema({
				id: 11,
				name: 'john',
				labels: ['short', 'fat'],
			}, {
				type: 'object',
				required: true,
				properties: {
					id: {type: 'integer', required: true},
					name: {type: 'string', required: true},
					labels: {
						type: 'array',
						required: true,
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
				required: true,
				properties: {
					id: {type: 'integer', required: true},
					name: {type: 'string', required: true},
					friend: {
						type: 'object',
						required: true,
						properties: {
							first_name: {type: 'string', required: true},
							last_name: {type: 'string', required: true},
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
				required: true,
				properties: {
					id: {type: 'integer', required: true},
					a: {
						type: 'array',
						required: true,
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
				required: true,
				properties: {
					id: {type: 'integer', required: true},
					name: {type: 'string', required: true},
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
					first_name: {type: 'string', required: true},
					last_name: {type: 'string', required: false},
				}}},
			}, {
				type: 'object',
				required: true,
				properties: {
					id: {type: 'integer', required: true},
					name: {type: 'string', required: true},
					friend: {type: 'object', properties: {
						first_name: {type: 'string', required: true},
						last_name: {type: 'string', required: false},
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
