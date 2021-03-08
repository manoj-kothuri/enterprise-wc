import { IdsElement, scss, customElement } from '../ids-base/ids-element';
import { props } from '../ids-base/ids-constants';

// @ts-ignore
import styles from './ids-toolbar-more-actions.scss';

// Subcomponents
import IdsToolbarSection from './ids-toolbar-section';
import IdsMenuButton from '../ids-menu-button/ids-menu-button';
import IdsPopupMenu from '../ids-popup-menu/ids-popup-menu';

/**
 * IDS Toolbar Section Component
 */
@customElement('ids-toolbar-more-actions')
@scss(styles)
class IdsToolbarMoreActionsButton extends IdsElement {
  constructor() {
    super();
  }

  static get properties() {
    return [];
  }

  connectedCallback() {
    this.refresh();
  }

  template() {
    return `<div class="ids-toolbar-section more">
      <ids-menu-button id="icon-button" menu="icon-menu">
        <ids-icon slot="icon" icon="more"></ids-icon>
        <span class="audible">More Actions Button</span>
      </ids-menu-button>
      <ids-popup-menu id="icon-menu" target="#icon-button" trigger="click">
        <ids-menu-group>
          <ids-menu-item>Option One</ids-menu-item>
          <ids-menu-item>Option Two</ids-menu-item>
          <ids-menu-item>Option Three</ids-menu-item>
        </ids-menu-group>
      </ids-popup-menu>
    </div>`;
  }

  /**
   * @readonly
   * @returns {IdsMenuButton} the inner menu button
   */
  get buttonEl() {
    return this.shadowRoot.querySelector('ids-menu-button');
  }

  /**
   * @readonly
   * @returns {IdsPopupMenu} the inner popup menu
   */
  get menuEl() {
    return this.shadowRoot.querySelector('ids-popup-menu');
  }

  /**
   *
   */
  refresh() {
    const popup = this.menuEl?.popup;
    if (!popup) {
      return;
    }
    popup.align = 'bottom, right';
  }
}

export default IdsToolbarMoreActionsButton;
export {
  IdsMenuButton,
  IdsPopupMenu
};
