'use strict'

const helpers = require('../src/helpers')
const expect = require('chai').expect
require('chai').should()

describe('Schema merge', () => {

	it('should get common schema if array items are missing in one of the schemas', () => {
		const schema1 = {
			type: 'array',
			required: true,
		}
		const schema2 = {
			type: 'array',
			items: {
				type: 'number',
			},
			required: true,
		}
		expect(helpers.mergeSchemaObjs(schema1, schema2)).deep.equal(schema1)
		expect(helpers.mergeSchemaObjs(schema2, schema1)).deep.equal(schema1)
	})

	it("shouldn't find a common schema if there is difference in 'required' value", () => {
		const schema1 = {
			type: 'array',
			required: false,
		}
		const schema2 = {
			type: 'array',
			items: {
				type: 'number',
			},
			required: true,
		}
		expect(helpers.mergeSchemaObjs(schema1, schema2)).deep.equal(null)
		expect(helpers.mergeSchemaObjs(schema2, schema1)).deep.equal(null)
	})

	it('should merge integer and number', () => {
		const schema1 = {
			type: 'array',
			items: {
				type: 'integer',
			},
		}
		const schema2 = {
			type: 'array',
			items: {
				type: 'number',
			},
		}
		const result = helpers.mergeSchemaObjs(schema1, schema2)
		result.should.deep.equal(schema2)
	})

	it('should find a common schema if there is difference in array items', () => {
		const schema1 = {
			type: 'array',
			items: {
				type: 'string',
			},
		}
		const schema2 = {
			type: 'array',
			items: {
				type: 'number',
			},
		}
		const expectedResult = {
			type: 'array',
		}
		const result = helpers.mergeSchemaObjs(schema1, schema2)
		expect(result).deep.equal(expectedResult)
	})

	it('should get common schema if deeply nested array items are missing in one of the schemas', () => {
		const schema1 = {
			type: 'object',
			properties: {
				id: {
					type: 'integer',
					required: true,
				},
				a: {
					type: 'array',
					required: true,
				},
			},
		}
		const schema2 = {
			type: 'object',
			properties: {
				id: {
					type: 'integer',
					required: true,
				},
				a: {
					type: 'array',
					items: {
						type: 'number',
					},
					required: true,
				},
			},
		}
		expect(helpers.mergeSchemaObjs(schema1, schema2)).deep.equal(schema1)
		expect(helpers.mergeSchemaObjs(schema2, schema1)).deep.equal(schema1)
	})

	it("should merge object schemas that differs in that one of them is missing 'items' in array", () => {
		const schema1 = {
			type: 'object',
			properties: {
				id: {
					type: 'integer',
					required: true,
				},
				a: {
					type: 'array',
					required: true,
				},
			},
		}
		const schema2 = {
			type: 'object',
			properties: {
				id: {
					type: 'integer',
					required: true,
				},
				a: {
					type: 'array',
					items: {
						type: 'number',
					},
					required: true,
				},
			},
		}
		expect(helpers.mergeSchemaObjs(schema1, schema2)).deep.equal(schema1)
		expect(helpers.mergeSchemaObjs(schema2, schema1)).deep.equal(schema1)
	})

	it('should get schema for object with different properties', () => {
		const schema1 = {
			type: 'object',
			properties: {
				test: {
					type: 'integer',
					required: true,
				},
			},
		}
		const schema2 = {
			type: 'object',
			properties: {
				differentKeyName: {
					type: 'integer',
					required: true,
				},
			},
		}
		const expectedResult = {
			type: 'object',
		}
		expect(helpers.mergeSchemaObjs(schema1, schema2)).deep.equal(expectedResult)
		expect(helpers.mergeSchemaObjs(schema2, schema1)).deep.equal(expectedResult)
	})

	it('should get schema for object with different property types', () => {
		const schema1 = {
			type: 'object',
			properties: {
				test: {
					type: 'boolean',
					required: true,
				},
			},
		}
		const schema2 = {
			type: 'object',
			properties: {
				differentKeyName: {
					type: 'integer',
					required: true,
				},
			},
		}
		const expectedResult = {
			type: 'object',
		}
		expect(helpers.mergeSchemaObjs(schema1, schema2)).deep.equal(expectedResult)
		expect(helpers.mergeSchemaObjs(schema2, schema1)).deep.equal(expectedResult)
	})

	it('should get schema for object with different required values', () => {
		const schema1 = {
			type: 'object',
			properties: {
				test: {
					type: 'integer',
					required: true,
				},
			},
		}
		const schema2 = {
			type: 'object',
			properties: {
				differentKeyName: {
					type: 'integer',
					required: false,
				},
			},
		}
		const expectedResult = {
			type: 'object',
		}
		expect(helpers.mergeSchemaObjs(schema1, schema2)).deep.equal(expectedResult)
		expect(helpers.mergeSchemaObjs(schema2, schema1)).deep.equal(expectedResult)
	})

	it('should merge schema of objects with and without properties specified', () => {
		const schema1 = {
			type: 'object',
			properties: {
				test: {
					type: 'number',
					required: true,
				},
			},
		}
		const schema2 = {
			type: 'object',
		}
		expect(helpers.mergeSchemaObjs(schema1, schema2)).deep.equal(schema2)
		expect(helpers.mergeSchemaObjs(schema2, schema1)).deep.equal(schema2)
	})

})
