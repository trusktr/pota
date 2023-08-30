import { empty, entries, noop } from '#std'

const properties = empty()
const propertiesNS = empty()

export function registerProp(name, fn) {
	properties[name] = fn
}
export function registerPropNS(name, fn) {
	propertiesNS[name] = fn
}

// internal props

registerProp('children', noop)
registerProp('mount', noop)
registerProp('$data', noop)

// styles

import { setStyle } from './style.js'
registerProp('style', setStyle)

import { setStyleNS, setVarNS } from './style.js'
registerPropNS('style', setStyleNS)
registerPropNS('var', setVarNS)

// class

import { setClass } from './class.js'
registerProp('class', setClass)

import { setClassNS } from './class.js'
registerPropNS('class', setClassNS)

// properties

import { setProp } from './attribute-property.js'
registerProp('innerHTML', setProp)
registerProp('textContent', setProp)
registerProp('value', setProp)
registerProp('innerText', setProp)

import { setPropNS, setAttributeNS } from './attribute-property.js'
registerPropNS('prop', setPropNS)
registerPropNS('attr', setAttributeNS)

// lifecycles

import { setOnMount, setOnCleanup } from './lifecycles.js'
registerProp('onMount', setOnMount)
registerProp('onCleanup', setOnCleanup)

registerPropNS('onMount', setOnMount)
registerPropNS('onCleanup', setOnCleanup)

// events

import { eventName, setEventNS, addEvent } from './event.js'
registerPropNS('on', setEventNS)

// catch all

import { setNodeProp } from './attribute-property.js'

export function assignProps(node, props) {
	let event
	for (const [name, value] of entries(props)) {
		// run plugins
		if (properties[name]) {
			properties[name](node, name, value, props)
			continue
		}

		// onClick={handler}
		event = eventName(name)
		if (event !== null) {
			// delegated: yes
			addEvent(node, event, value, true, false)
			continue
		}

		// magic with ns

		const [ns, localName] =
			name.indexOf(':') !== -1 ? name.split(':') : ['', name]

		// run plugins NS
		if (propertiesNS[ns]) {
			propertiesNS[ns](node, name, value, props, localName, ns)
			continue
		}

		// onClick:my-ns={handler}
		event = eventName(ns)
		if (event !== null) {
			// delegated: yes
			addEvent(node, event, value, true, false)
			continue
		}

		// catch all
		setNodeProp(node, name, value, ns)
	}
}