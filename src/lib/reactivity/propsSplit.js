// const [others, local] = propsSplit(props, ['children'])

import { empty, keys } from '#std'

/**
 * Split an object into multiple sub objects
 *
 * @param {pota.props} props
 * @param {...string[]} args
 * @returns {pota.props[]} - Array of objects
 */
export function propsSplit(props, ...args) {
	const result = []
	const used = empty()

	for (const _props of args) {
		const target = empty()
		for (const key of _props) {
			used[key] = null
			target[key] = props[key]
		}
		result.push(target)
	}

	const target = empty()
	for (const key of keys(props)) {
		if (used[key] === undefined) {
			target[key] = props[key]
		}
	}
	result.unshift(target)
	return result
}
