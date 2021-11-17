import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';
import IdsDataSource from '../../core/ids-data-source';
import Base from '../ids-menu/ids-menu-base';
import styles from './ids-separator.scss';

/**
 * IDS Separator Component
 * @type {IdsSeparator}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @mixes IdsThemeMixin
 * @part separator - the menu separator element
 */
@customElement('ids-separator')
@scss(styles)
export default class IdsSeparator extends Base {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback?.();
  }

  static get attributes() {
    return [
      ...super.attributes,
      attributes.VERTICAL
    ];
  }

  template() {
    let tagName = 'div';
    if (this.parentElement?.tagName === 'IDS-MENU-GROUP') {
      tagName = 'li';
    }
    return `<${tagName} part="separator" class="ids-separator"></${tagName}>`;
  }

  get vertical() {
    return this.container.classList.contains('vertical');
  }

  set vertical(val) {
    const current = this.vertical;
    const trueVal = IdsStringUtils.stringToBool(val);
    if (current !== trueVal) {
      if (trueVal) {
        this.container.classList.add('vertical');
        this.setAttribute('vertical', '');
      } else {
        this.container.classList.remove('vertical');
        this.removeAttribute('vertical');
      }
    }
  }
}
