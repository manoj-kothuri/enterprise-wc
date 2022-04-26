import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';
import { EXPANDABLE_AREA_TYPES } from './ids-exandable-area-attributes';
import Base from './ids-exandable-area-base';

import styles from './ids-expandable-area.scss';

/**
 * IDS Expandable Area Component
 * @type {IdsExpandableArea}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @mixes IdsKeyboardMixin
 * @mixes IdsThemeMixin
 * @part container - the main container element
 * @part header - the header element
 * @part pane - the expandable pane element
 * @part footer - the footer element
 */
@customElement('ids-expandable-area')
@scss(styles)
export default class IdsExpandableArea extends Base {
  constructor() {
    super();
    this.state = {};
  }

  connectedCallback(): void {
    this.expander = this.shadowRoot?.querySelector('[data-expander]');
    this.expanderDefault = this.shadowRoot?.querySelector('[name="expander-default"]');
    this.expanderExpanded = this.shadowRoot?.querySelector('[name="expander-expanded"]');
    this.pane = this.shadowRoot?.querySelector('.ids-expandable-area-pane');
    this.#attachEventHandlers();
    this.switchState();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes(): Array<string> {
    return [attributes.EXPANDED, attributes.TYPE, attributes.MODE, attributes.VERSION];
  }

  /**
   * Set the type
   * @param {string | null} value The Type [null, toggle-btn]
   */
  set type(value: string) {
    if (value === EXPANDABLE_AREA_TYPES[0]) {
      this.setAttribute(attributes.TYPE, value);
    } else {
      this.setAttribute(attributes.TYPE, '');
    }
  }

  get type() { return this.getAttribute(attributes.TYPE); }

  /**
   * Set the expanded property
   * @param {string | null} value true/false
   */
  set expanded(value: string | null) {
    if (value) {
      this.setAttribute(attributes.EXPANDED, value);
    } else {
      this.setAttribute(attributes.EXPANDED, 'false');
    }
    this.switchState();
  }

  get expanded() { return this.getAttribute(attributes.EXPANDED); }

  /**
   * The main state switching function
   * @returns {void}
   */
  switchState(): void {
    this.expanderDefault = this.shadowRoot?.querySelector('[name="expander-default"]');
    this.expanderExpanded = this.shadowRoot?.querySelector('[name="expander-expanded"]');
    this.state.expanded = this.getAttribute(attributes.EXPANDED) === 'true' || false;
    this.expander?.setAttribute('aria-expanded', this.state.expanded);

    // Hide/show the text link if default
    if (this.type === null && this.expanderDefault && this.expanderExpanded) {
      this.expanderDefault.hidden = this.state.expanded;
      this.expanderExpanded.hidden = !this.state.expanded;
    }

    if (!this.state.expanded) {
      this.collapsePane();
    } else {
      this.expandPane();
    }
  }

  /**
   * Collapse the expandable area pane.
   * @private
   * @returns {void}
   */
  collapsePane(): void {
    requestAnimationFrame(() => {
      if (!this.pane) {
        return;
      }

      this.pane.style.height = `${this.pane?.scrollHeight}px`;
      requestAnimationFrame(() => {
        this.pane.style.height = `0px`;
      });
    });
  }

  /**
   * Expand the expandable area pane.
   * @private
   * @returns {void}
   */
  expandPane(): void {
    if (!this.pane) {
      return;
    }

    this.pane.style.height = `${this.pane.scrollHeight}px`;
  }

  /**
   * Sets the expanded state attribute
   * @returns {void}
   */
  setAttributes(): void {
    this.setAttribute(attributes.EXPANDED, this.getAttribute(attributes.EXPANDED) === 'true' ? 'false' : 'true');
  }

  /**
   * Sets up event listeners
   * @private
   * @returns {void}
   */
  #attachEventHandlers(): void {
    this.onEvent('click', this.expander, () => {
      this.setAttributes();
    });

    this.onEvent('touchstart', this.expander, (e: any) => {
      if (e.touches && e.touches.length > 0) {
        this.setAttributes();
      }
    }, {
      passive: true
    });
  }

  /**
   * Inner template contents
   * @returns {string} The template
   */
  template(): string {
    let template;
    if (this.type === EXPANDABLE_AREA_TYPES[0]) {
      template = `
        <div class="ids-expandable-area" part="container">
          <div class="ids-expandable-area-header" part="header" aria-expanded="false" data-expander="header">
            <slot name="header"></slot>
          </div>
          <div class="ids-expandable-area-pane" part="pane">
            <slot name="pane"></slot>
          </div>
        </div>
      `;
    } else {
      template = `
        <div class="ids-expandable-area" part="container">
          <div class="ids-expandable-area-header" part="header">
            <slot name="header"></slot>
          </div>
          <div class="ids-expandable-area-pane" part="pane">
            <slot name="pane"></slot>
          </div>
          <div class="ids-expandable-area-footer" part="footer">
            <a class="ids-expandable-area-expander" href="#0" role="button" aria-expanded="false" data-expander="link">
              <slot name="expander-default"></slot>
              <slot name="expander-expanded" hidden></slot>
            </a>
          </div>
        </div>
      `;
    }
    return template;
  }
}