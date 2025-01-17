import { makeCallback } from '../../lib/comp/@main.js'
import { memo } from '../../lib/reactivity/primitives/solid.js'
import { resolve } from '../../renderer/@renderer.js'

import { getValue, isNullUndefined } from '../../lib/std/@main.js'

/**
 * Renders its children based on a condition
 *
 * @param {object} props
 * @param {When} props.when
 * @param {Children} [props.fallback]
 * @param {Children} [props.children]
 * @returns {Children}
 */
export function Show(props) {
	const callback = makeCallback(props.children)
	const value = memo(() => getValue(props.when))
	const condition = memo(() => !!value())

	// needs resolve to avoid re-rendering
	const fallback = isNullUndefined(props.fallback)
		? null
		: memo(() => resolve(props.fallback))

	return memo(() => (condition() ? callback(value) : fallback))
}
