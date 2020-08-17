import { IdsElement, customElement, mixin } from '../ids-base/ids-element';
import { IdsEventsMixin } from '../ids-base/ids-events-mixin';
import { IdsUtilitiesMixin } from '../ids-base/ids-utilities-mixin';
import { props } from '../ids-base/ids-constants';
import './ids-trigger-field.scss';

/**
 * IDS Trigger Field Components
 */
@customElement('ids-trigger-field')
@mixin(IdsEventsMixin)
@mixin(IdsUtilitiesMixin)
class IdsTriggerField extends IdsElement {
  /**
   * Call the constructor and then initialize
   */
  constructor() {
    super();
  }

  connectedCallBack() {
    this.render();
  }

  /**
   * Return the properties we handle as getters/setters
   * @returns {Array} The properties in an array
   */
  static get properties() {
    return [props.TABBABLE, props.APPEARANCE, props.ICON, props.DISABLE_EVENTS];
  }

  /**
   * Create the Template for the contents
   * @returns {string} The template
   */
  template() {
    return `
      <style>@import url('css/ids-trigger-field/ids-trigger-field.min.css');</style>
      <div class="ids-trigger-field">
        <ids-input type="text" ${this.disableNativeEvents ? `disable-native-events="${this.disabledNativeEvents}"` : ''}></ids-input>
        <ids-trigger-button ${this.disableNativeEvents ? `disable-native-events="${this.disabledNativeEvents}"` : ''}><ids-icon icon="${this.icon}"><ids-icon></ids-trigger-button>
      </div>
    `;
  }

  /**
   * Set if the trigger field is tabbable
   * @param {boolean} value True of false depending if the trigger field is tabbable
   */
  set tabbable(value) {
    const isTabbable = this.utilities.stringToBool(value);
    if (!isTabbable) {
      this.setAttribute(props.TABBABLE, value);
      this.setAttribute('tabindex', '-1');
    } else {
      this.setAttribute('tabindex', '0');
    }
  }

  get tabbable() { return this.getAttribute(props.TABBABLE); }

  /**
   * TODO: Set the appearance of the trigger field
   * @param {string} value Provide different options for appearance ['Normal', 'Compact']
   */
  set appearance(value) {
    if (value) {
      this.setAttribute(props.APPEARANCE, value);
    }

    this.removeAttribute(props.APPEARANCE);
  }

  get appearance() { return this.getAttribute(props.APPEARANCE); }

  /**
   * Return the icon name
   * @returns {string} the path data
   */
  set icon(value) {
    if (this.hasAttribute(props.ICON) && value) {
      this.setAttribute(props.ICON, value);
    } else {
      this.removeAttribute(props.ICON);
    }
  }

  get icon() { return this.getAttribute(props.ICON); }

  /**
   * Set if the button handles events
   * @param {boolean} value True of false depending if the button handles events
   */
  set disableNativeEvents(value) {
    const isDisabled = this.utilities.stringToBool(value);
    if (isDisabled) {
      this.setAttribute(props.DISABLE_EVENTS, value);
    }

    this.removeAttribute(props.DISABLE_EVENTS);
  }

  get disableNativeEvents() { return this.getAttribute(props.DISABLE_EVENTS); }
}

export default IdsTriggerField;
