import { empty, microtask } from '../../lib/std/@main.js'
import {
	untrack,
	withOwner,
} from '../../lib/reactivity/primitives/solid.js'

export const plugins = empty()
export const pluginsNS = empty()

/**
 * Defines a prop that can be used on any Element
 *
 * @param {string} propName - Name of the prop
 * @param {(
 * 	node: Elements,
 * 	propName: string,
 * 	propValue: Function | any,
 * 	props: object,
 * ) => void} fn
 *   - Function to run when this prop is found on any Element
 *
 * @param {boolean} [runOnMicrotask=true] - To avoid the problem of
 *   needed props not being set, or children elements not created yet.
 *   Default is `true`
 */
export const propsPlugin = (propName, fn, runOnMicrotask = true) => {
	plugin(plugins, propName, fn, runOnMicrotask)
}

/**
 * Defines a namespaced prop that can be used on any Element
 *
 * @param {string} NSName - Name of the namespace
 * @param {(
 * 	node: Elements,
 * 	propName: string,
 * 	propValue: Function | any,
 * 	props: object,
 * 	localName: string,
 * 	ns: string,
 * ) => void} fn
 *   - Function to run when this prop is found on any Element
 *
 * @param {boolean} [runOnMicrotask=true] - To avoid the problem of
 *   needed props not being set, or children elements not created yet.
 *   Default is `true`
 */
export const propsPluginNS = (NSName, fn, runOnMicrotask = true) => {
	plugin(pluginsNS, NSName, fn, runOnMicrotask)
}

const plugin = (plugins, name, fn, runOnMicrotask) => {
	plugins[name] = !runOnMicrotask
		? (...args) => untrack(() => fn(...args))
		: (...args) => {
				const owned = withOwner()
				microtask(() => owned(() => untrack(() => fn(...args))))
			}
}
