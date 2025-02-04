import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';
import styles from './ids-data-label.scss';
import IdsThemeMixin from '../../mixins/ids-theme-mixin/ids-theme-mixin';
import IdsEventsMixin from '../../mixins/ids-events-mixin/ids-events-mixin';
import IdsLocaleMixin from '../../mixins/ids-locale-mixin/ids-locale-mixin';
import IdsElement from '../../core/ids-element';
import '../ids-text/ids-text';

/**
 * IDS Data Label Component
 * @type {IdsDataLabel}
 * @inherits IdsElement
 * @mixes IdsThemeMixin
 */
@customElement('ids-data-label')
@scss(styles)
export default class IdsDataLabel extends IdsThemeMixin(IdsLocaleMixin(IdsEventsMixin(IdsElement))) {
  constructor() {
    super();

    this.state = {
      labelClass: 'top-positioned',
    };
  }

  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The propertires in an array
   */
  static get attributes() {
    return [
      ...super.attributes,
      attributes.LABEL,
      attributes.LABEL_POSITION,
      attributes.LANGUAGE,
      attributes.MODE
    ];
  }

  /**
   * Create the Template for the contents
   * @returns {string} The template
   */
  template(): string {
    return `<div class="${this.labelClass}">
        <ids-text class="label" font-size="16">${this.label}<span class="colon">${this.colon}</span></ids-text>
        <ids-text class="description" font-size="16"><slot></slot></ids-text>
      </div>`;
  }

  /**
   * Sets to label
   * @param {string} value label string
   */
  set label(value: string) {
    if (value) {
      this.setAttribute(attributes.LABEL, value);
    } else {
      this.removeAttribute(attributes.LABEL);
    }

    const label = this.container?.querySelector('.label');
    if (label) {
      label.innerHTML = `${value ?? ''}<span class="colon">${this.colon}</span>`;
    }
  }

  get label(): string {
    return this.getAttribute(attributes.LABEL) ?? '';
  }

  /**
   * Sets to label
   * @param {string} value label string
   */
  set labelPosition(value: string | null) {
    if (value) {
      this.setAttribute(attributes.LABEL_POSITION, value);
      if (this.container) {
        this.container.className = `${value}-positioned`;
      }
    }
  }

  get labelPosition(): string | null {
    return this.getAttribute(attributes.LABEL_POSITION);
  }

  /**
   * @returns {string} css class for data-label
   */
  get labelClass(): string {
    if (this.labelPosition) {
      return `${this.labelPosition}-positioned`;
    }
    return 'top-positioned';
  }

  /**
   * @returns {string} css class for data-label
   */
  get colon(): string {
    return this.labelPosition === 'left' ? ':' : '';
  }
}
