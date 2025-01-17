import { markReactive } from '../@main.js'

// abstracts oby reactivity

import $, {
	// signals
	memo as _memo,

	// effects
	root as _root,
	effect as _effect,
	batch as _batch,

	// cleanup/untrack
	cleanup as _cleanup,
	untrack as _untrack,

	// context
	context as _context,
	with as with_,
} from 'oby'

/**
 * Creates a signal
 *
 * @param {unknown} [initialValue] - Initial value of the signal
 * @param {unknown} [options] - Signal options
 * @returns {[
 * 	Signal,
 * 	Function | ((currentValue: unknown) => unknown),
 * ]}
 *   - Read/write tuple
 */
export const signal = (initialValue, options) => {
	const s = $(initialValue, options)
	return [markReactive(() => s()), s]
}

/**
 * Creates a read-only signal from the return value of a function that
 * automatically updates
 *
 * @param {Function} fn - Function to re-run when dependencies change
 * @returns {Signal} - Read only signal
 */
const memo = fn => markReactive(_memo(fn))

/**
 * Creates a new root
 *
 * @param {(dispose: Function) => any} fn
 * @returns {unknown}
 */
export const root = fn => _root(dispose => fn(dispose))

/**
 * Creates a renderEffect
 *
 * @param {Function} fn
 */
export const renderEffect = fn => {
	_effect(fn, { sync: 'init' })
}

/**
 * Creates an effect
 *
 * @param {Function} fn
 */
export const effect = fn => {
	_effect(fn)
}

/**
 * Batches changes to signals
 *
 * @param {Function} fn
 * @returns {unknown}
 */
export const batch = fn => _batch(fn)

/**
 * Runs a callback on cleanup, returns callback
 *
 * @template T
 * @param {Generic<T>} fn
 * @returns {Generic<T>}
 */
export const cleanup = fn => {
	_cleanup(fn)
	return fn
}

/**
 * Disables tracking for a function
 *
 * @param {Function} fn - Function to run with tracking disabled
 * @returns {any}
 */
export const untrack = fn => _untrack(fn)

/**
 * Creates a context and returns a function to get or set the value
 *
 * @param {unknown} [defaultValue] - Default value for the context
 * @returns {typeof Context} Context
 */
export function Context(defaultValue = {}) {
	const id = Symbol()

	/**
	 * @overload Gets the context value
	 * @returns {any} Context value
	 */
	/**
	 * @overload Runs `fn` with a new value as context
	 * @param {unknown} newValue - New value for the context
	 * @param {Function} fn - Callback to run with the new context value
	 * @returns {Children} Children
	 */
	/**
	 * @param {unknown | undefined} newValue
	 * @param {Function | undefined} fn
	 */
	function Context(newValue, fn) {
		if (newValue === undefined) {
			const c = _context(id)
			return c ?? defaultValue
		} else {
			let r
			_context({ [id]: newValue }, () => {
				r = untrack(fn)
			})
			return r
		}
	}

	return Context
}

/**
 * Lazy version of `memo`, it will run the function only when used
 *
 * @author Fabio Spampinato
 * @param {Function} fn - Function to re-run when dependencies change
 * @returns {Signal}
 */
function lazyMemo(fn) {
	const [sleeping, setSleeping] = signal(true)
	const m = memo(() => {
		if (sleeping()) return
		return fn()
	})

	let read = () => {
		setSleeping(false)
		read = m
		return m()
	}
	return markReactive(() => read())
}
export { lazyMemo as memo }

/**
 * Returns a function on which you can pass functions to run with the
 * current owner
 *
 * - @returns {(fn)=>any}
 */
export const withOwner = () => {
	const owned = with_()
	return fn => owned(fn)
}
