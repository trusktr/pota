import { create, toHTML } from '../../exports.js'
import { CustomElement as CustomElementsTemplate } from '../comp/CustomElement.js'
import { assign } from '../std/assign.js'
import { entries } from '../std/entries.js'
import { sheet } from './sheet.js'

/**
 * Custom Element Factory. Returns a function to register custom
 * elements that share a groupCSS and externalSheets. Each registered
 * custom element can have its own css too.
 *
 * @param {string} groupCSS - Css shared by the group
 * @param {string[]} externalSheets - Array with paths to external
 *   sheets
 * @returns {(name, css, component) => void}
 */
export function customElementGroup(groupCSS, externalSheets = []) {
	// load external css files in a Link
	for (const [key, value] of entries(externalSheets)) {
		externalSheets[key] = (
			<link
				rel="stylesheet"
				href={value}
			/>
		)
	}

	// make a sheet of the group css
	const groupSheet = sheet(groupCSS)

	// local sheets for classes
	const sheets = new Map()

	// adds main sheets to the Web Element
	class CustomElement extends CustomElementsTemplate {
		constructor() {
			super()

			const shadow = this.attachShadow({
				mode: 'open',
			})

			// add external stylesheets
			externalSheets.length && shadow.append(toHTML(externalSheets))

			// add group sheet to shadow
			shadow.adoptedStyleSheets.push(groupSheet)

			// add local css when the user provides a class
			const name = customElements.getName(this.constructor)

			if (sheets.has(name))
				this.shadowRoot.adoptedStyleSheets.push(sheets.get(name))

			// set property to empty when the slot is not in use
			this.shadowRoot.addEventListener('slotchange', e =>
				e.target.assignedElements().length
					? this.removeAttribute('empty')
					: this.setAttribute('empty', ''),
			)
		}
	}

	return assign(
		function (name, css, component) {
			class CustomElementUser extends CustomElement {
				constructor() {
					super()
					// add local css
					this.shadowRoot.adoptedStyleSheets.push(sheet(css))

					// add component
					this.shadowRoot.append(
						toHTML(create(component || <slot />)),
					)
				}
			}

			// if user provides a class
			const constructor = component.toString().startsWith('class')
				? component
				: CustomElementUser

			// save css in case user provided a class
			// as we cannot dynamically make it extend
			if (constructor !== CustomElementUser && css !== '') {
				sheets.set(name, sheet(css))
			}

			// define web element
			customElements.define(name, constructor)
		},
		{ CustomElement },
	)
}