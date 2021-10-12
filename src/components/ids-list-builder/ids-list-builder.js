import {
  IdsElement,
  customElement,
  scss,
  mix,
  attributes
} from '../../core';

// Import Mixins
import {
  IdsEventsMixin,
  IdsThemeMixin
} from '../../mixins';

import styles from './ids-list-builder.scss';
import IdsListView from '../ids-list-view';
import IdsInput from '../ids-input/ids-input';

/**
 * IDS ListBuilder Component
 * @type {IdsListBuilder}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @mixes IdsThemeMixin
 */

@customElement('ids-list-builder')
@scss(styles)
class IdsListBuilder extends mix(IdsListView).with(IdsEventsMixin, IdsThemeMixin) {
  constructor() {
    super();
  }

  #selectedItem;

  #selectedItemEditor;

  placeholder;

  connectedCallback() {
    super.connectedCallback();

    this.virtualScroll = true;
    this.itemHeight = 44;

    this.data = [
      {
        id: 1,
        productId: '7439937961',
        productName: '1 Steampan Lid',
        inStock: true,
        units: '9',
        unitPrice: 23,
        color: 'Green'
      },
      {
        id: 1,
        productId: '7439937961',
        productName: '2 Steampan Lid',
        inStock: true,
        units: '9',
        unitPrice: 23,
        color: 'Green'
      },
      {
        id: 1,
        productId: '7439937961',
        productName: '3 Steampan Lid',
        inStock: true,
        units: '9',
        unitPrice: 23,
        color: 'Green'
      },
      {
        id: 1,
        productId: '7439937961',
        productName: '4 Steampan Lid',
        inStock: true,
        units: '9',
        unitPrice: 23,
        color: 'Green'
      },
      {
        id: 1,
        productId: '7439937961',
        productName: '5 Steampan Lid',
        inStock: true,
        units: '9',
        unitPrice: 23,
        color: 'Green'
      },
      {
        id: 1,
        productId: '7439937961',
        productName: '6 Steampan Lid',
        inStock: true,
        units: '9',
        unitPrice: 23,
        color: 'Green'
      },
      {
        id: 1,
        productId: '7439937961',
        productName: '7 Steampan Lid',
        inStock: true,
        units: '9',
        unitPrice: 23,
        color: 'Green'
      },
      {
        id: 1,
        productId: '7439937961',
        productName: '8 Steampan Lid',
        inStock: true,
        units: '9',
        unitPrice: 23,
        color: 'Green'
      },
      {
        id: 1,
        productId: '7439937961',
        productName: '9 Steampan Lid',
        inStock: true,
        units: '9',
        unitPrice: 23,
        color: 'Green'
      },
      {
        id: 1,
        productId: '7439937961',
        productName: '10 Steampan Lid',
        inStock: true,
        units: '9',
        unitPrice: 23,
        color: 'Green'
      },
      {
        id: 1,
        productId: '7439937961',
        productName: '11 Steampan Lid',
        inStock: true,
        units: '9',
        unitPrice: 23,
        color: 'Green'
      },
      {
        id: 1,
        productId: '7439937961',
        productName: '12 Steampan Lid',
        inStock: true,
        units: '9',
        unitPrice: 23,
        color: 'Green'
      },
      {
        id: 1,
        productId: '7439937961',
        productName: '13 Steampan Lid',
        inStock: true,
        units: '9',
        unitPrice: 23,
        color: 'Green'
      },
    ];

    this.#attachEventListeners();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes() {
    return [
      ...super.attributes,
    ];
  }

  /**
   * Create the Template for the contents
   * @returns {string} The template
   */
  template() {
    return `
      <div class="ids-list-builder">
          <div class="header">
            <ids-toolbar>
              <ids-toolbar-section type="buttonset">
                <ids-button id="button-add">
                  <ids-icon slot="icon" icon="add"></ids-icon>
                </ids-button>
                <ids-button id="button-up">
                  <ids-icon slot="icon" icon="arrow-up"></ids-icon>
                </ids-button>
                <ids-button id="button-down">
                  <ids-icon slot="icon" icon="arrow-down"></ids-icon>
                </ids-button>
                <ids-button id="button-edit">
                  <ids-icon slot="icon" icon="edit"></ids-icon>
                </ids-button>
                <ids-button id="button-delete">
                  <ids-icon slot="icon" icon="delete"></ids-icon>
                </ids-button>
              </ids-toolbar-section>
            </ids-toolbar>
          </div>
          <div class="content">
            ${super.template()} 
          </div>
        <slot></slot>
      </div>
    `;
  }

  #toggleSelectedAttribute(item) {
    if (item.getAttribute('selected')) {
      item.removeAttribute('selected');
    } else {
      item.setAttribute('selected', 'selected');
    }
  }

  #toggleSelectedListItem(item) {
    if (item.tagName === 'LI') {
      if (item !== this.#selectedItem) {
        if (this.#selectedItem?.getAttribute('selected')) {
          // unselect previous item if it's selected
          this.#toggleSelectedAttribute(this.#selectedItem);
        }
        this.#selectedItem = item;
      }
      this.#toggleSelectedAttribute(item);
      item.focus();
    }
  }

  #attachEventListeners() {
    this.#attachClickListeners();
    this.#attachDragEventListeners();
  }

  // helper method for swapping nodes
  #swap(nodeA, nodeB) {
    const parentA = nodeA.parentNode;
    const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

    nodeB.parentNode.insertBefore(nodeA, nodeB);
    parentA.insertBefore(nodeB, siblingA);
  }

  // helper method to determine which node is above
  #isAbove(nodeA, nodeB) {
    const rectA = nodeA.getBoundingClientRect();
    const rectB = nodeB.getBoundingClientRect();
    const centerA = rectA.top + rectA.height / 2;
    const centerB = rectB.top + rectB.height / 2;
    return centerA < centerB;
  }

  #createPlaceholder(height) {
    const p = document.createElement('div');
    p.style.height = `${height}px`;
    p.style.border = `solid 1px red`;
    return p;
  }

  #updateSelectedItemWithEditorValue() {
    this.#selectedItem.querySelector('ids-text').innerHTML = this.#selectedItemEditor.value;
  }

  #removeSelectedItemEditor() {
    this.#selectedItem.style.display = 'list-item';
    this.#selectedItem.parentNode.removeAttribute('disabled');
    this.#selectedItemEditor.remove();
    this.#selectedItemEditor = null;
  }

  #attachClickListeners() {
    this.onEvent('click', this.container.querySelector('#button-add'), (event) => {
    });
    this.onEvent('click', this.container.querySelector('#button-up'), (event) => {
      if (this.#selectedItem) {
        const prev = this.#selectedItem.parentNode.previousElementSibling;
        if (prev) {
          this.#swap(this.#selectedItem.parentNode, prev);
        }
      }
    });

    this.onEvent('click', this.container.querySelector('#button-down'), (event) => {
      // const selected = this.container.querySelector('li[selected]');
      if (this.#selectedItem) {
        const next = this.#selectedItem.parentNode.nextElementSibling;
        if (next) {
          this.#swap(this.#selectedItem.parentNode, next);
        }
      }
    });

    this.onEvent('click', this.container.querySelector('#button-edit'), (event) => {
      // replace innerHTML with <input> that has the value of the current li
      // const i = document.createElement('input');
      if (this.#selectedItem) {
        if (!this.#selectedItemEditor) {
          const i = new IdsInput();

          // insert into DOM
          this.#selectedItem.parentNode.insertBefore(i, this.#selectedItem);

          // hide & disable IDS draggable
          this.#selectedItem.style.display = `none`;
          this.#selectedItem.parentNode.setAttribute('disabled', '');

          // set the value of input
          this.#selectedItemEditor = i;
          i.value = this.#selectedItem.querySelector('ids-text').innerHTML;
          i.autoselect = 'true';
        }
      }
    });

    this.onEvent('click', this.container.querySelector('#button-delete'), (event) => {
      if (this.#selectedItem) {
        this.#selectedItem.parentNode.remove();
        this.#selectedItem = null;
        if (this.#selectedItemEditor) this.#selectedItemEditor = null;
      }
    });
  }

  #attachDragEventListeners() {
    this.container.querySelectorAll('ids-draggable').forEach((s) => {
      this.onEvent('ids-dragstart', s, (event) => {
        // unfocus any editor
        if (this.#selectedItemEditor) {
          this.#updateSelectedItemWithEditorValue();
          this.#removeSelectedItemEditor();
        }

        // toggle selected item
        const listItem = event.target.querySelector('li');
        this.#toggleSelectedListItem(listItem);

        // create placeholder
        this.placeholder = this.#createPlaceholder(s.getBoundingClientRect().height);

        // need this for draggable to move around
        s.style.position = `absolute`;
        s.parentNode.style.zIndex = `100`;

        s.parentNode.insertBefore(
          this.placeholder,
          s.nextSibling
        );
      });

      this.onEvent('ids-drag', s, (event) => {
        let prevEle = this.placeholder?.previousElementSibling; // might be null for first
        let nextEle = this.placeholder?.nextElementSibling;

        // skip over checking the original selected node position
        if (prevEle === this.#selectedItem.parentNode) {
          prevEle = prevEle.previousElementSibling;
        }
        // skip over checking the original selected position
        if (nextEle === this.#selectedItem.parentNode) {
          nextEle = nextEle.nextElementSibling;
        }

        if (prevEle && this.#isAbove(s, prevEle)) {
          this.#swap(this.placeholder, prevEle);
          return;
        }

        if (nextEle && this.#isAbove(nextEle, s)) {
          this.#swap(nextEle, this.placeholder);
        }
      });

      this.onEvent('ids-dragend', s, (event) => {
        s.style.removeProperty('position');
        s.style.removeProperty('transform');

        this.#swap(s, this.placeholder);
        if (this.placeholder) {
          this.placeholder.remove();
        }
      });
    });
  }
}

export default IdsListBuilder;
