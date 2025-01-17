import { effect, signal } from '../lib/reactivity/primitives/solid.js'

/**
 * Returns a `isSelected`function that will return true when the
 * argument for it matches the original signal `value`.
 *
 * @param {Signal} value - Signal with the current value
 * @returns {(item: any) => Signal} Signal that you can run with a
 *   value to know if matches the original signal
 */
export function useSelector(value) {
	const map = new Map()

	let prev
	effect(() => {
		const selected = value()
		if (selected === prev) return

		const previous = map.get(prev)
		if (previous) previous.write(false)

		const current = map.get(selected)
		if (current) current.write(true)

		prev = selected
	})

	/**
	 * Is selected function, it will return true when the value matches
	 * the current signal
	 *
	 * @param {unknown} item - Values to compare with current
	 * @returns {Signal} A signal with a boolean value
	 */
	return function isSelected(item) {
		if (!map.has(item)) {
			const [read, write] = signal(item === value())
			map.set(item, {
				read,
				write,
			})
		}

		return map.get(item).read
	}
}
