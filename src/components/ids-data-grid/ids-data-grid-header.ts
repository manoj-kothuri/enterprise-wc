import { customElement } from '../../core/ids-decorators';
import IdsElement from '../../core/ids-element';
import IdsEventsMixin from '../../mixins/ids-events-mixin/ids-events-mixin';
import { escapeHTML } from '../../utils/ids-xss-utils/ids-xss-utils';

import type IdsDataGrid from './ids-data-grid';
import { IdsDataGridColumn, IdsDataGridColumnGroup } from './ids-data-grid-column';

@customElement('ids-data-grid-header')
export default class IdsDataGridHeader extends IdsEventsMixin(IdsElement) {
  rootNode?: any;

  headerCheckbox?: HTMLElement;

  constructor() {
    super({ noShadowRoot: true });
    this.state = {
      headerMenuData: null
    };
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.#attachEventHandlers();
  }

  /**
   * Reference to the data grid parent
   * @returns {IdsDataGrid} the data grid parent
   */
  get dataGrid() {
    if (!this.rootNode) this.rootNode = (this.getRootNode() as any);
    return (this.rootNode.host) as IdsDataGrid;
  }

  /**
   * Handle all header related events
   * @private
   */
  #attachEventHandlers() {
    this.#attachSelectionHandler();
    this.#attachSortHandler();
    this.#attachResizeHandlers();
    this.#attachReorderHandlers();
  }

  /**
   * Attach handlers to sort via clicking the headers
   * @private
   */
  #attachSortHandler() {
    this.offEvent('click.sort', this);
    this.onEvent('click.sort', this, (e: any) => {
      // Dont sort on resize
      if (this.dataGrid?.isResizing) {
        this.dataGrid.isResizing = false;
        return;
      }

      const sortableHeaderCell = e.target.closest('.is-sortable')?.closest('.ids-data-grid-header-cell');
      if (sortableHeaderCell) {
        this.dataGrid?.setSortColumn(
          sortableHeaderCell.getAttribute('column-id'),
          sortableHeaderCell.getAttribute('aria-sort') !== 'ascending'
        );
      }
    });
  }

  /**
   * Attach handlers to sort via clicking the headers
   * @private
   */
  #attachSelectionHandler() {
    // Select all/deselect all
    this.headerCheckbox = <HTMLElement> this.querySelector('ids-data-grid-header .ids-data-grid-checkbox-container .ids-data-grid-checkbox');
    this.offEvent('click.select', this.headerCheckbox);
    this.onEvent('click.select', this.headerCheckbox, (e: any) => {
      if (e.target.classList.contains('checked') || e.target.classList.contains('indeterminate')) {
        this.dataGrid?.deSelectAllRows();
      } else {
        this.dataGrid?.selectAllRows();
      }
    });
  }

  /**
   * Establish Drag handlers for resize
   * Based on https://htmldom.dev/resize-columns-of-a-table/
   * @private
   */
  #attachResizeHandlers() {
    // Track the current position of mouse
    let x = 0;
    let w = 0;
    let columnId = '';

    const mouseMoveHandler = (e: MouseEvent) => {
      // Determine how far the mouse has been moved
      const dx = e.clientX - x;
      // Update the width of column to ${w + dx}px
      this.dataGrid?.setColumnWidth(columnId, w + (!this.dataGrid.localeAPI.isRTL() ? dx : -dx));
    };

    // When user releases the mouse, remove the existing event listeners
    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);

      this?.style.setProperty('cursor', '');
      requestAnimationFrame(() => {
        this.dataGrid!.isResizing = false;
      });
    };

    // Add a resize Handler
    this.offEvent('mousedown.resize', this);
    this.onEvent('mousedown.resize', this, (e: MouseEvent) => {
      const target = (e.target as any);
      if (!target.classList.contains('resizer')) {
        return;
      }

      // Get the current mouse position
      x = e.clientX;

      // Calculate the current width of column
      const col = target.closest('.ids-data-grid-header-cell');
      const colStyles = window.getComputedStyle(col);
      columnId = col.getAttribute('column-id');
      w = parseInt(colStyles.width, 10);

      // Attach listeners for document's events
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);

      // Import the cursor behavior
      this?.style.setProperty('cursor', 'col-resize');

      // Prevent a click causing a sort
      this.dataGrid!.isResizing = true;
    });
  }

  /**
   * Establish Reorder handlers for moving columns
   * @private
   */
  #attachReorderHandlers() {
    const dragArrows = this.dataGrid?.wrapper?.querySelector<HTMLElement>('.ids-data-grid-sort-arrows');
    let dragger: HTMLElement;
    let startIndex = 0;

    // Style the Dragger
    this.offEvent('dragstart.resize', this);
    this.onEvent('dragstart.resize', this, (e: DragEvent) => {
      const target = (e.target as any);
      if (!target.classList.contains('reorderer')) {
        return;
      }

      target.parentNode.classList.add('active-drag-column');
      dragger = target.parentNode.cloneNode(true);
      dragger.classList.add('dragging');
      dragger.style.position = 'absolute';
      dragger.style.top = '0';
      dragger.style.left = '-1000px';

      this?.appendChild(dragger);
      // Based on width of 110
      e?.dataTransfer?.setDragImage(dragger, this.dataGrid?.localeAPI.isRTL() ? 100 : 10, 18);

      target.style.position = 'absolute';
      startIndex = target.parentNode.getAttribute('aria-colindex');
    });

    // Show the arrows
    this.offEvent('dragenter.resize', this);
    this.onEvent('dragenter.resize', this, (e: DragEvent) => {
      const cell = (e.target as any).closest('.ids-data-grid-header-cell');
      if (cell.classList.contains('active-drag-column')) return;

      const rect = cell.getBoundingClientRect();
      const curIndex = cell.getAttribute('aria-colindex');
      const cellLeft = rect.left + (startIndex < curIndex ? rect.width + 1 : 1);
      const cellRight = rect.left + (startIndex < curIndex ? 1 : rect.width + 1);

      dragArrows?.style.setProperty('left', `${this.dataGrid?.localeAPI.isRTL() ? cellRight : cellLeft}px`);
      dragArrows?.style.setProperty('height', `${rect.height}px`);
      dragArrows?.style.setProperty('display', 'block');

      e.preventDefault();
    });

    // Use a normal cursor (not drag and drop)
    this.offEvent('dragover.resize', this);
    this.onEvent('dragover.resize', this, (e: DragEvent) => {
      e.dataTransfer!.dropEffect = 'move';
      e.preventDefault();
    });

    const removeDragger = (e: DragEvent) => {
      this.querySelector('.active-drag-column')?.classList.remove('active-drag-column');
      dragger?.remove();
      dragArrows?.style.setProperty('display', 'none');
      e.preventDefault();
    };

    // Set everything temp element back to normal
    this.offEvent('dragend.resize', this);
    this.onEvent('dragend.resize', this, (e: DragEvent) => {
      removeDragger(e);
    });

    this.offEvent('drop.resize', this);
    this.onEvent('drop.resize', this, (e: DragEvent) => {
      const cell = (e.target as any).closest('.ids-data-grid-header-cell');
      this.dataGrid?.moveColumn(startIndex - 1, cell.getAttribute('aria-colindex') - 1);
      removeDragger(e);
    });
  }

  /**
   * Set the header checkbox state
   * @private
   */
  setHeaderCheckbox() {
    if (!this.dataGrid?.rowSelection || this.dataGrid?.rowSelection === 'single' || !this.headerCheckbox) {
      return;
    }

    const selectedCount = this.dataGrid?.selectedRows.length;
    const dataCount = this.dataGrid?.data.length;

    if (selectedCount === 0) {
      this.headerCheckbox.classList.remove('indeterminate');
      this.headerCheckbox.classList.remove('checked');
      this.headerCheckbox.setAttribute('aria-checked', 'false');
      return;
    }

    if (selectedCount === dataCount) {
      this.headerCheckbox.classList.remove('indeterminate');
      this.headerCheckbox.classList.add('checked');
      this.headerCheckbox.setAttribute('aria-checked', 'true');
      return;
    }

    if (selectedCount !== dataCount) {
      this.headerCheckbox.classList.add('indeterminate');
      this.headerCheckbox.setAttribute('aria-checked', 'mixed');
    }
  }

  /**
   * Set the sort column and sort direction on the UI only
   * @param {string} id The column id (or field) to set
   * @param {boolean} ascending Sort ascending (lowest first) or descending (lowest last)
   */
  setSortState(id: string, ascending: boolean) {
    const sortedHeaders = [...this!.querySelectorAll('.is-sortable')]
      .map((sorted) => sorted.closest('.ids-data-grid-header-cell'));
    sortedHeaders.forEach((header) => header?.removeAttribute('aria-sort'));

    const header = this.querySelector(`[column-id="${id}"]`);
    if (header && sortedHeaders.includes(header)) {
      header.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
    }
  }

  /**
   * Set filter row to be shown or hidden
   * @private
   * @returns {object} This API object for chaining
   */
  setFilterRow() {
    const nodes = this?.querySelectorAll('.ids-data-grid-header-cell-filter-wrapper');
    nodes?.forEach((n) => n?.classList?.[this.dataGrid?.filterable ? 'remove' : 'add']('hidden'));
    this.dataGrid?.triggerEvent(this.dataGrid?.filterable ? 'filterrowopened' : 'filterrowclosed', this.dataGrid, {
      detail: { elem: this, filterable: this.dataGrid?.filterable }
    });
    return this;
  }

  /**
   * Return the Template for the header contents
   * @param {IdsDataGrid} datagrid visible columns in the data grid
   * @returns {string} The template
   */
  static template(datagrid: IdsDataGrid): string {
    const html = `<ids-data-grid-header class="ids-data-grid-header" role="rowgroup" part="header">
      <ids-data-grid-row class="ids-data-grid-row" role="row">
        ${datagrid.visibleColumns.map((columnData: any, index: number) => `${this.headerCellTemplate(datagrid, columnData, index)}`).join('')}
      </ids-data-grid-row>
    </ids-data-grid-header>`;
    return this.columnGroupsTemplate(datagrid) + html;
  }

  /**
   * Returns the markup for a header cell.
   * @param {IdsDataGrid} dataGrid visible columns in the data grid
   * @param {IdsDataGridColumn} column The column info
   * @param {number} index The column index
   * @returns {string} The resuling header cell template
   */
  static headerCellTemplate(dataGrid: IdsDataGrid, column: IdsDataGridColumn, index: number) {
    const selectionCheckBoxTemplate = `
      <span class="ids-data-grid-checkbox-container">
        <span
          role="checkbox"
          aria-checked="false"
          aria-label="${column.name}"
          class="ids-data-grid-checkbox"
        >
        </span>
      </span>
    `;

    const sortIndicatorTemplate = `
      <span class="sort-indicator">
        <ids-icon icon="dropdown"></ids-icon>
        <ids-icon icon="dropdown"></ids-icon>
      </span>
    `;

    const resizerTemplate = `<span class="resizer"></span>`;
    const reorderTemplate = `<div class="reorderer" draggable="true"><ids-icon icon="drag" size="medium"></ids-icon></div>`;

    const selectionCheckbox = column.id !== 'selectionRadio' && column.id === 'selectionCheckbox';
    const colName = escapeHTML(column.name);
    const headerContentTemplate = `
      ${selectionCheckbox ? selectionCheckBoxTemplate : ''}
      ${(column.id !== 'selectionRadio' && column.id !== 'selectionCheckbox' && colName) ? colName : ''}
    `.trim();

    let cssClasses = 'ids-data-grid-header-cell-content';
    cssClasses += column.sortable ? ' is-sortable' : '';
    cssClasses += selectionCheckbox ? ' has-selectioncheckbox vertical-align-center' : '';
    cssClasses += column.headerIcon ? ' has-headericon' : '';
    cssClasses += column.reorderable ? ' is-reorderable' : '';

    // Content row cell template
    const headerContentWrapperTemplate = `<span class="${cssClasses}">
        <span class="ids-data-grid-header-text">
          ${headerContentTemplate}
        </span>
        ${this.headerIconTemplate(column)}
        ${column.sortable ? sortIndicatorTemplate : ''}
      </span>${column.resizable ? resizerTemplate : ''}${column.reorderable ? reorderTemplate : ''}`;

    // Filter row cell template
    const headerFilterWrapperTemplate = dataGrid?.filters?.filterTemplate(column) || '';
    let align = column.align ? ` align-${column.align}` : '';
    if (column.headerAlign) {
      align = ` align-${column.headerAlign}`;
    }

    // Frozen Classes
    const lastFrozen = dataGrid?.leftFrozenColumns.length;
    const frozen = column?.frozen ? ` frozen frozen-${column?.frozen}${index + 1 === lastFrozen ? ' frozen-last' : ''}` : '';

    // Header cell template
    const html = `
      <span
        class="ids-data-grid-header-cell${align}${frozen}"
        part="header-cell"
        aria-colindex="${index + 1}"
        column-id="${column.id}"
        role="columnheader">
        ${headerContentWrapperTemplate}
        ${headerFilterWrapperTemplate}
      </span>
    `;

    return html;
  }

  /**
   * Returns the markup for a header icon.
   * @param {IdsDataGridColumn | IdsDataGridColumnGroup} column The column info
   * @returns {string} The resuling header icon template
   */
  static headerIconTemplate(column: IdsDataGridColumn | IdsDataGridColumnGroup): string {
    const headerIcon = typeof column?.headerIcon === 'string' ? column.headerIcon : '';
    if (headerIcon === '') return '';

    const headerIconTooltip = column.headerIconTooltip || headerIcon;
    return `
      <span class="ids-data-grid-header-icon" data-headericontooltip="${headerIconTooltip}">
        <ids-icon icon="${headerIcon}" size="medium"></ids-icon>
      </span>`;
  }

  /**
   * Returns the markup for the grouped header cells.
   * @param {IdsDataGrid} dataGrid The datagrid reference
   * @returns {string} The resuling header cell template
   */
  static columnGroupsTemplate(dataGrid: IdsDataGrid) : string {
    if (!dataGrid?.columnGroups) {
      return '';
    }
    let columnGroupHtml = `<ids-data-grid-header class="ids-data-grid-header column-groups" part="header" role="rowgroup">
    <div role="row" class="ids-data-grid-row ids-data-grid-column-groups">`;

    dataGrid?.columnGroups.forEach((columnGroup: IdsDataGridColumnGroup) => {
      const align = columnGroup.align ? ` align-${columnGroup.align}` : '';

      // Header cell template
      let cssClasses = 'ids-data-grid-header-cell-content';
      cssClasses += columnGroup.headerIcon ? ' has-headericon' : '';

      const html = `<span class="ids-data-grid-header-cell${align}" part="header-cell" column-group-id="${columnGroup.id || 'id'}" role="columnheader">
        <span class="${cssClasses}">
          <span class="ids-data-grid-header-text">
            ${columnGroup.name || ''}
          </span>
          ${this.headerIconTemplate(columnGroup)}
        </span>
      </span>`;
      columnGroupHtml += html;
    });

    columnGroupHtml += '</div></ids-data-grid-header>';

    return columnGroupHtml;
  }
}
