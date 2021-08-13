import { stringUtils } from '../ids-base';
import {
  IdsElement,
  customElement,
  attributes,
  scss,
  mix
} from '../ids-base/ids-element';

import {
  IdsKeyboardMixin,
  IdsEventsMixin,
  IdsThemeMixin
} from '../ids-mixins';

import IdsTab from './ids-tab';
import styles from './ids-tab-content.scss';

/**
 * IDS TabContent Component
 * @type {IdsTabContent}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @mixes IdsThemeMixin
 * @mixes IdsKeyboardMixin
 */
@customElement('ids-tab-content')
@scss(styles)
export default class IdsTabContent extends mix(IdsElement).with(
    IdsEventsMixin,
    IdsKeyboardMixin,
    IdsThemeMixin
  ) {
  constructor() {
    super();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes() {
    return [attributes.VALUE, attributes.ACTIVE];
  }

  template() {
    return `<slot></slot>`;
  }

  connectedCallback() {
    super.connectedCallback?.();
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
  }

  /**
   * the value representing a currently selected tab
   * @type {string}
   */
  set value(value) {
    if (this.getAttribute(attributes.VALUE) === value) {
      return;
    }

    this.setAttribute(attributes.VALUE, value);
  }

  get value() {
    return this.getAttribute(attributes.VALUE);
  }

  set active(value) {
    const isTruthy = stringUtils.stringToBool(value);

    if (isTruthy && this.getAttribute(attributes.ACTIVE) !== '') {
      this.setAttribute(attributes.ACTIVE, '');
    }

    if (!isTruthy && this.hasAttribute(attributes.ACTIVE)) {
      this.removeAttribute(attributes.ACTIVE);
    }
  }

  get active() {
    return this.hasAttribute(attributes.ACTIVE);
  }
}
