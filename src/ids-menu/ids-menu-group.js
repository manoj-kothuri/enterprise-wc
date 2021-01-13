import {
  IdsElement,
  customElement,
  scss
} from '../ids-base/ids-element';
import { props } from '../ids-base/ids-constants';
import { IdsEventsMixin } from '../ids-base/ids-events-mixin';
import styles from './ids-menu-group.scss';

// Menu Selection Types
const MENU_GROUP_SELECT_TYPES = [
  'none',
  'single',
  'multiple'
];

/**
 * IDS Menu Group Component
 */
@customElement('ids-menu-group')
@scss(styles)
class IdsMenuGroup extends IdsElement {
  constructor() {
    super();
  }

  /**
   * Return the properties we handle as getters/setters
   * @returns {Array} properties
   */
  static get properties() {
    return [
      props.KEEP_OPEN,
      props.SELECT
    ];
  }

  template() {
    let describedBy = '';
    if (this.header?.id) {
      describedBy = ` aria-labelledby="${this.header.id}"`;
    }

    return `<ul class="ids-menu-group" role="group"${describedBy}><slot></slot></ul>`;
  }

  /**
   * @private
   * @returns {void}
   */
  connectedCallBack() {
    this.handleEvents();
    this.refresh();
  }

  /**
   * @private
   * @returns {void}
   */
  handleEvents() {
    this.eventHandlers = new IdsEventsMixin();

    // Listen for `selected` events from child menu items.
    // Single-select groups will force deselection of other items in the group.
    this.eventHandlers.addEventListener('selected', this, (e) => {
      const item = e.target.closest('ids-menu-item');
      if (this.select === 'single') {
        this.deselectAllExcept(item);
      }
    });
  }

  /**
   * Updates some attributes/properties after changes to the component are made.
   * @returns {void}
   */
  refresh() {
    if (this.header?.id) {
      this.container.setAttribute('aria-labelledby', `${this.header.id}`);
    } else {
      this.container.removeAttribute('aria-labelledby');
    }
  }

  /**
   * @readonly
   * @returns {HTMLElement} the `IdsMenu` or `IdsPopupMenu` parent node.
   */
  get menu() {
    return this.parentNode;
  }

  /**
   * @readonly
   * @returns {Array<HTMLElement>} all available menu items in this group
   */
  get items() {
    return Array.from(this.querySelectorAll('ids-menu-item, .ids-menu-item'));
  }

  /**
   * Gets this groups descriptive header, if one is defined.
   * @readonly
   * @returns {HTMLElement} containing a menu
   */
  get header() {
    const inlineHeader = this.querySelector('ids-menu-header');
    const preceedingHeader = this.previousElementSibling?.tagName === 'IDS-MENU-HEADER' && this.previousElementSibling;
    return inlineHeader || preceedingHeader;
  }

  /**
   * @returns {string|undefined} containing the type of selection this group allows
   */
  get select() {
    return this.getAttribute(props.SELECT);
  }

  /**
   * @param {string} val the type of selection to set this group
   */
  set select(val) {
    let trueVal = `${val}`;
    if (MENU_GROUP_SELECT_TYPES.indexOf(trueVal) === -1) {
      trueVal = MENU_GROUP_SELECT_TYPES[0];
    }

    // Sync the attribute
    switch (trueVal) {
      case 'none':
        this.removeAttribute(props.SELECT);
        break;
      default:
        this.setAttribute(props.SELECT, trueVal);
    }
  }

  /**
   * @returns {boolean} true if selection of an item within this group should
   * cause the parent menu to close
   */
  get keepOpen() {
    return this.hasAttribute(props.KEEP_OPEN);
  }

  /**
   * @param {boolean} val true if the menu should close when an item in this group is selected
   */
  set keepOpen(val) {
    const trueVal = val !== null;
    if (trueVal) {
      this.setAttribute(props.KEEP_OPEN, '');
    } else {
      this.removeAttribute(props.KEEP_OPEN);
    }
  }

  /**
   * Causes all menu items except for those provided to become deselected.
   * @param {HTMLElement|Array<IdsMenuItem>} keptItems a single item or list of items
   * whose selection will be ignored.
   * @returns {void}
   */
  deselectAllExcept(keptItems) {
    const keptItemsArr = Array.isArray(keptItems) ? keptItems : [keptItems];
    this.items.forEach((item) => {
      if (!keptItemsArr.includes(item) && item.selected) {
        item.deselect();
      }
    });
  }
}

export default IdsMenuGroup;
