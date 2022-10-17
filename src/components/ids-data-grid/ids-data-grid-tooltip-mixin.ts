import { attributes } from '../../core/ids-attributes';
import { stringToBool, stringToNumber } from '../../utils/ids-string-utils/ids-string-utils';
import { sanitizeHTML } from '../../utils/ids-xss-utils/ids-xss-utils';
import { IdsDataGridTooltipOptions } from './ids-data-grid-column';
import debounce from '../../utils/ids-debounce-utils/ids-debounce-utils';

import '../ids-tooltip/ids-tooltip';

/**
 * A mixin that adds tooltip functionality to data grid
 * @param {any} superclass Accepts a superclass and creates a new subclass from it
 * @returns {any} The extended object
 */
const IdsDataGridTooltipMixin = (superclass: any) => class extends superclass {
  constructor() {
    super();
  }

  static get attributes() {
    return [
      ...super.attributes,
      attributes.SUPPRESS_TOOLTIPS
    ];
  }

  connectedCallback() {
    super.connectedCallback?.();
  }

  /**
   * Set the tooltips on/off.
   * @param {string|boolean} value True as turn off
   */
  set suppressTooltips(value) {
    if (stringToBool(value)) {
      this.setAttribute(attributes.SUPPRESS_TOOLTIPS, '');
    } else {
      this.removeAttribute(attributes.SUPPRESS_TOOLTIPS);
    }
    this.setupTooltip();
  }

  get suppressTooltips() {
    return stringToBool(this.getAttribute(attributes.SUPPRESS_TOOLTIPS)) || false;
  }

  /**
   * Single tooltip use with all grid elements
   * @private
   */
  #tooltip: any;

  /**
   * Types of tooltip as unique identifier
   * @private
   */
  #types = {
    BODY_CELL: 'body-cell',
    FILTER_BUTTON: 'filter-button',
    HEADER_TITLE: 'header-title',
    HEADER_ICON: 'header-icon'
  };

  /**
   * Setup tooltip
   * @private
   * @returns {void}
   */
  setupTooltip(): void {
    if (this.suppressTooltips) this.#detachTooltip();
    else this.#attachTooltip();
  }

  /**
   * Get list of path elements for given event.
   * @private
   * @param  {MouseEvent} e The event.
   * @returns {HTMLElement[]} List of path element.
   */
  #eventPath(e: any): HTMLElement[] {
    const path = e.path || e.composedPath() || [];
    return !path.length ? (e.orignPath || []) : path;
  }

  /**
   * Find element by selector in given event path.
   * @private
   * @param  {HTMLElement[]} path  List of path element.
   * @param  {string} s The selector value.
   * @returns {HTMLElement|undefined} Found element.
   */
  #findInPath(path: HTMLElement[], s: string): HTMLElement | undefined {
    return path?.find((el: HTMLElement) => el?.matches?.(s));
  }

  /**
   * Handle tooltip
   * @private
   * @param {MouseEvent} e The event
   */
  async #handleTooltip(e: any) {
    const path = this.#eventPath(e);

    // Close if previously showing
    this.#hideTooltip();

    // Body cell
    if (this.#findInPath(path, '.ids-data-grid-body')
      && this.#findInPath(path, '[role="cell"]')
    ) {
      await this.#tooltipBodyCell(path);
      return;
    }

    // Header title, and group header title
    if (this.#findInPath(path, '.ids-data-grid-header-text')
      || this.#findInPath(path, '.ids-data-grid-header-icon')
    ) {
      await this.#tooltipHeaderTitleOrIcon(path);
      return;
    }

    // Header filter button
    if (this.#findInPath(path, '.ids-data-grid-header-cell-filter-wrapper')
      && this.#findInPath(path, 'ids-menu-button')
    ) {
      await this.#tooltipFilterButton(path);
    }
  }

  /**
   * Handle tooltip for body cell
   * @private
   * @param  {HTMLElement[]} path List of path element.
   */
  async #tooltipBodyCell(path: HTMLElement[]) {
    const cellEl = this.#findInPath(path, '[role="cell"]') as HTMLElement;
    const textWidth = stringToNumber(cellEl.getAttribute('data-textwidth'));

    if ((cellEl.offsetWidth < cellEl.scrollWidth) || (cellEl.offsetWidth < textWidth)) {
      const rowIndex = stringToNumber(this.#findInPath(path, '[role="row"]')?.getAttribute('visible-rowindex'));
      const columnIndex = stringToNumber(cellEl.getAttribute('aria-colindex')) - 1;
      const rowData = this.data[rowIndex];
      const columnData = this.columns[columnIndex];
      const columnId = columnData.id;
      const fieldData = rowData[columnId];
      const text = (cellEl.textContent || '').trim();

      // The arguments to pass along callback
      const callbackArgs = {
        type: this.#types.BODY_CELL,
        rowData,
        rowIndex,
        columnData,
        columnId,
        columnIndex,
        fieldData,
        text,
        grid: this
      };

      // Get content
      const content = await this.#tooltipContent({
        data: columnData,
        callbackArgs
      });

      if (typeof content === 'string' && content !== '') {
        // Set tooltip css part
        await this.#setTooltipCssPart({ data: columnData, callbackArgs });

        // Get tooltip options
        const options = await this.#tooltipOptions({
          defaultOptions: { placement: 'top', x: 0, y: 10 },
          data: columnData,
          callbackArgs
        });

        // Show tooltip
        this.#showTooltip({
          target: cellEl,
          callbackArgs,
          content,
          options
        });
      }
    }
  }

  /**
   * Handle tooltip for header title or header icon
   * @private
   * @param  {HTMLElement[]} path List of path element.
   */
  async #tooltipHeaderTitleOrIcon(path: HTMLElement[]) {
    const cellEl = this.#findInPath(path, '[role="columnheader"]') as HTMLElement;
    const titleEl = this.#findInPath(path, '.ids-data-grid-header-text') as HTMLElement;
    const iconEl = this.#findInPath(path, '.ids-data-grid-header-icon') as HTMLElement;
    const isHeaderIcon = !!iconEl;

    if (isHeaderIcon || (titleEl?.offsetWidth < titleEl?.scrollWidth)) {
      const isHeaderGroup = cellEl.hasAttribute('column-group-id');
      const iconText = isHeaderIcon ? iconEl.getAttribute('data-headericontooltip') : null;
      let data: any;

      // The arguments to pass along callback
      let callbackArgs: any = {
        grid: this,
        text: (iconText || titleEl.textContent || '').trim(),
        type: isHeaderIcon ? this.#types.HEADER_ICON : this.#types.HEADER_TITLE,
        isHeaderGroup
      };

      // Set header group args
      if (isHeaderGroup) {
        const columnGroupId = cellEl.getAttribute('column-group-id');
        const columnGroupData = this.columnGroupDataById(columnGroupId as string);
        data = columnGroupData;

        callbackArgs = {
          ...callbackArgs,
          columnGroupId,
          columnGroupData,
          rowIndex: 0,
          columnGroupIndex: this.columnGroupIdxById(columnGroupId as string),
        };
      } else {
        // Set header title args
        const columnId = cellEl.getAttribute('column-id');
        const columnIndex = this.columnIdxById(columnId as string);
        const columnData = this.columns[columnIndex as number];
        data = columnData;

        callbackArgs = {
          ...callbackArgs,
          columnId,
          columnIndex,
          columnData,
          rowIndex: this.columnGroups ? 1 : 0,
        };
      }

      // Get content
      const content = await this.#tooltipContent({
        callbackArgs,
        data
      });

      if (typeof content === 'string' && content !== '') {
        // Set tooltip css part
        await this.#setTooltipCssPart({ data, callbackArgs });

        // Get tooltip options
        const options = await this.#tooltipOptions({
          defaultOptions: { placement: 'top', x: 0, y: (isHeaderIcon ? 16 : 10) },
          callbackArgs,
          data
        });

        // Show tooltip
        this.#showTooltip({
          target: isHeaderIcon ? iconEl : cellEl,
          callbackArgs,
          content,
          options
        });
      }
    }
  }

  /**
   * Handle tooltip for header filter button
   * @private
   * @param  {HTMLElement[]} path List of path element.
   */
  async #tooltipFilterButton(path: HTMLElement[]) {
    const cellEl: any = this.#findInPath(path, '[role="columnheader"]');
    const filterButton: any = this.#findInPath(path, 'ids-menu-button');

    if (filterButton) {
      const rowIndex = this.columnGroups ? 1 : 0;
      const columnId = cellEl.getAttribute('column-id');
      const columnIndex = this.columnIdxById(columnId as string);
      const columnData = this.columns[columnIndex];
      const text = (filterButton.text || '').trim();

      // The arguments to pass along callback
      const callbackArgs = {
        type: this.#types.FILTER_BUTTON,
        isFilterButton: true,
        rowIndex,
        columnData,
        columnIndex,
        columnId,
        text,
        grid: this
      };

      // Get content
      const content = await this.#tooltipContent({
        data: columnData,
        callbackArgs
      });

      if (typeof content === 'string' && content !== '') {
        // Set tooltip css part
        await this.#setTooltipCssPart({ data: columnData, callbackArgs });

        // Get tooltip options
        const options = await this.#tooltipOptions({
          defaultOptions: { placement: 'bottom', x: 0, y: 22 },
          data: columnData,
          callbackArgs
        });

        // Show tooltip
        this.#showTooltip({
          target: filterButton.dropdownIconEl,
          callbackArgs,
          content,
          options
        });
      }
    }
  }

  /**
   * Set tooltip css part.
   * @private
   * @param  {object} opt The options.
   */
  async #setTooltipCssPart(opt: any) {
    const { data, callbackArgs } = opt;
    const type = callbackArgs.type;

    // Set keys to use for given type
    let key = null;
    if (type === this.#types.BODY_CELL) key = 'tooltipCssPart';
    if (type === this.#types.HEADER_TITLE) key = 'headerTooltipCssPart';
    if (type === this.#types.HEADER_ICON) key = 'headerIconTooltipCssPart';
    if (type === this.#types.FILTER_BUTTON) key = 'filterButtonTooltipCssPart';

    // Get css part
    let cssPart = '';
    if (key && data && typeof data[key] === 'string') {
      cssPart = data[key];
    } else if (typeof data?.tooltipCssPart === 'function') {
      cssPart = await data.tooltipCssPart(callbackArgs);
    }
    cssPart = sanitizeHTML(cssPart || '');

    // Set tooltip css parts
    let parts = [
      'tooltip-popup',
      'tooltip-arrow',
      'tooltip-arrow-top',
      'tooltip-arrow-right',
      'tooltip-arrow-bottom',
      'tooltip-arrow-left'
    ];
    if (cssPart !== '') parts = parts.map((p: string) => `${p}: ${cssPart}-${p}`);
    this.#tooltip?.setAttribute('exportparts', parts.join(', '));
  }

  /**
   * Get tooltip content to display.
   * @private
   * @param  {object} opt The options.
   */
  async #tooltipContent(opt: any) {
    const { data, callbackArgs } = opt;
    const type = callbackArgs.type;

    // Set keys to use for given type
    let key = null;
    if (type === this.#types.BODY_CELL) key = 'tooltip';
    if (type === this.#types.HEADER_TITLE) key = 'headerTooltip';
    if (type === this.#types.HEADER_ICON) key = 'headerIconTooltip';
    if (type === this.#types.FILTER_BUTTON) key = 'filterButtonTooltip';

    // Set content
    let content = '';
    if (key && data && typeof data[key] === 'string') {
      content = data[key];
    } else if (typeof data?.tooltip === 'function') {
      content = await data.tooltip(callbackArgs);
    } else {
      content = callbackArgs.text;
    }

    return sanitizeHTML(content || '');
  }

  /**
   * Get tooltip settings.
   * @private
   * @param  {object} opt The options.
   */
  async #tooltipOptions(opt: any) {
    const { data, callbackArgs, defaultOptions } = opt;
    const type = callbackArgs.type;

    // Set keys to use for given type
    let keys: any = {};
    if (type === this.#types.BODY_CELL) {
      keys = { placement: 'placement', x: 'x', y: 'y' };
    } else if (type === this.#types.HEADER_TITLE) {
      keys = { placement: 'headerPlacement', x: 'headerX', y: 'headerY' };
    } else if (type === this.#types.HEADER_ICON) {
      keys = { placement: 'headerIconPlacement', x: 'headerIconX', y: 'headerIconY' };
    } else if (type === this.#types.FILTER_BUTTON) {
      keys = { placement: 'filterButtonPlacement', x: 'filterButtonX', y: 'filterButtonY' };
    }

    // Keys to use
    const { placement, x, y } = keys;

    // Default settings
    const options: IdsDataGridTooltipOptions = { ...defaultOptions };

    if (data.tooltipOptions) {
      let userOptions: any = {};
      // Options as callback
      if (typeof data.tooltipOptions === 'function') {
        userOptions = await data.tooltipOptions(callbackArgs);
      } else {
        // Options as simple object JSON style
        userOptions[placement] = data.tooltipOptions[placement];
        userOptions[x] = data.tooltipOptions[x];
        userOptions[y] = data.tooltipOptions[y];
      }

      // Adjust edge
      const adjustEdge = (v: any, isX: boolean) => {
        const val = parseInt(v, 10);
        if (!Number.isNaN(val)) options[isX ? 'x' : 'y'] = val;
      };
      adjustEdge(userOptions[x], true);
      adjustEdge(userOptions[y], false);

      // Adjust placement
      if (/^(top|right|bottom|left)$/g.test(userOptions[placement] || '')) {
        options.placement = userOptions[placement];
      }
    }

    return options;
  }

  /**
   * Handle to show tooltip
   * @private
   * @param  {object} opt The options.
   * @returns {void}
   */
  #showTooltip(opt: any): void {
    const {
      target,
      content,
      options,
      callbackArgs,
    } = opt;

    // Check veto before tooltip show
    const args = { ...callbackArgs, content, options };
    if (!this.triggerVetoableEvent('beforetooltipshow', args)) {
      return;
    }

    // Set tooltip options and show
    if (this.#tooltip) {
      this.#tooltip.placement = options.placement;
      this.#tooltip.innerHTML = content;
      this.#tooltip.target = target;
      this.#tooltip.visible = true;
      this.#tooltip.popup.setPosition(options.x, options.y, true, true);
    }
  }

  /**
   * Handle to hide tooltip
   * @private
   * @returns {void}
   */
  #hideTooltip(): void {
    this.#tooltip?.setAttribute('visible', 'false');
  }

  /**
   * Add tooltip and attach all tooltip events
   * @private
   * @returns {void}
   */
  #attachTooltip(): void {
    // Add tooltip if not already
    this.#tooltip = this.shadowRoot.querySelector('ids-tooltip');
    if (!this.#tooltip) {
      this.shadowRoot.querySelector('slot[name="tooltip"]')?.insertAdjacentHTML('beforeend', '<ids-tooltip id="tooltip" exportparts="tooltip-popup, tooltip-arrow"></ids-tooltip>');
      this.#tooltip = this.shadowRoot.querySelector('ids-tooltip');
    }

    // Attach tooltip events
    this.onEvent('mouseover.data-grid', this.container, debounce(async (e: any) => {
      this.#handleTooltip(e);
    }, 250));
    this.onEvent('mouseout.data-grid', this.container, debounce(async () => {
      this.#hideTooltip();
    }, 250));
    this.onEvent('scroll.data-grid', this.container, () => {
      this.#hideTooltip();
    });
  }

  /**
   * Detach tooltip and all tooltip events
   * @private
   * @returns {void}
   */
  #detachTooltip(): void {
    this.offEvent('mouseover.data-grid', this.container);
    this.offEvent('mouseout.data-grid', this.container);
    this.offEvent('scroll.data-grid', this.container);
    this.#tooltip?.remove();
    this.#tooltip = undefined;
  }
};

export default IdsDataGridTooltipMixin;