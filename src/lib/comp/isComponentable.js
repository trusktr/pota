import { isArray, isFunction, isNotNullObject } from '../std/@main.js'
import { isReactive } from '../reactivity/isReactive.js'

/**
 * Returns true if the value can be made a Component
 *
 * @param {any} value
 * @returns {boolean}
 */
export const isComponentable = value =>
	!isReactive(value) &&
	(isFunction(value) ||
		// avoid [1,2] and support { toString(){ return "something"} }
		(!isArray(value) && isNotNullObject(value) && !value.then))
