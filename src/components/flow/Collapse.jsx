import { customElement } from '../../renderer/@main.js'
import { getValue } from '../../lib/std/@main.js'
import { CustomElement } from '../../lib/comp/CustomElement.js'

class CollapseElement extends CustomElement {
	hide() {
		this.shadowRoot.innerHTML = ''
	}
	show() {
		this.shadowRoot.innerHTML = '<slot/>'
	}
	/** @param {When} value - To toggle children */
	set when(value) {
		getValue(value) ? this.show() : this.hide()
	}
}

/**
 * Similar to `Show`, but doesn't remove its children from the
 * document
 *
 * @param {{
 * 	when: When
 * 	children?: Children
 * }} props
 * @returns {Children}
 */
export function Collapse(props) {
	customElement('pota-collapse', CollapseElement)

	return (
		<pota-collapse
			when={props.when}
			children={props.children}
		/>
	)
}
