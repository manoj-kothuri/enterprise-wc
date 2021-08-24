/**
 * @jest-environment jsdom
 */
import IdsAccordion, {
  IdsAccordionHeader,
  IdsAccordionPanel
} from '../../src/components/ids-accordion';

import elemBuilderFactory from '../helpers/elem-builder-factory';

const elemBuilder = elemBuilderFactory();

const createAccordion = async () => elemBuilder.createElemFromTemplate(`<ids-accordion>
    <ids-accordion-panel id="p1">
      <ids-accordion-header id="h1" slot="header"></ids-accordion-header>
    </ids-accordion-panel>
    <ids-accordion-panel id="p2">
      <ids-accordion-header id="h2" slot="header"></ids-accordion-header>
    </ids-accordion-panel>
    <ids-accordion-panel id="p3">
      <ids-accordion-header id="h3" slot="header"></ids-accordion-header>
    </ids-accordion-panel>
  </ids-accordion>
`);

describe('IdsAccordion Component', () => {
  let accordion;
  let panel;
  let panel2;
  let panel3;
  let header;
  let header2;
  let header3;

  beforeEach(async () => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => cb());

    accordion = await createAccordion();

    panel = document.querySelector('#p1');
    panel2 = document.querySelector('#p2');
    panel3 = document.querySelector('#p3');
    header = document.querySelector('#h1');
    header2 = document.querySelector('#h2');
    header3 = document.querySelector('#h3');
  });

  afterEach(async () => {
    elemBuilder.clearElement();
    accordion = null;
    panel = null;
    panel2 = null;
    panel3 = null;
    header = null;
    header2 = null;
    header3 = null;
  });

  it('renders correctly', async () => {
    expect(accordion.outerHTML).toMatchSnapshot();
    panel.expanded = true;
    expect(accordion.outerHTML).toMatchSnapshot();
    panel.expanded = false;
    expect(accordion.outerHTML).toMatchSnapshot();
  });

  it('renders with no errors', async () => {
    const errors = jest.spyOn(global.console, 'error');
    accordion.remove();
    accordion = await createAccordion();

    expect(document.querySelectorAll('ids-accordion').length).toEqual(1);
    expect(errors).not.toHaveBeenCalled();
  });

  it('can set the pane title attribute', () => {
    const panelTitle = 'Expander text';
    panel.pane.setAttribute('title', panelTitle);
    expect(panel.pane.getAttribute('title')).toBe(panelTitle);
  });

  it('can change its expanded property', () => {
    const panelEl = accordion.querySelector('ids-accordion-panel');

    panelEl.setAttribute('expanded', true);
    panel.expanded = true;
    expect(panelEl.getAttribute('expanded')).toBeTruthy();
    expect(panel.getAttribute('expanded')).toBeTruthy();

    panelEl.setAttribute('expanded', false);
    panel.expanded = false;
    expect(panelEl.getAttribute('expanded')).toBeFalsy();
    expect(panel.expanded).toBeFalsy();
  });

  it('can change set its aria-expanded attribute', () => {
    panel.expanded = true;
    expect(header.getAttribute('aria-expanded')).toBeTruthy();
  });

  it('can be expanded/collapsed when clicked (mouse)', () => {
    const event = new MouseEvent('click', {
      target: panel.expander,
      bubbles: true,
      cancelable: true,
      view: window
    });

    // Expand
    panel.expander.dispatchEvent(event);
    expect(panel.expanded).toBeTruthy();

    // Collapse
    panel.expander.dispatchEvent(event);
    expect(panel.expanded).toBeFalsy();
  });

  it('can be expanded/collapsed when touched', () => {
    const event = new TouchEvent('touchstart', {
      touches: [{
        identifier: '123',
        pageX: 0,
        pageY: 0,
        target: panel.expander
      }],
      bubbles: true,
      cancpanelable: true,
      view: window
    });

    // Expand
    panel.expander.dispatchEvent(event);

    expect(panel.expanded).toBeTruthy();

    // Collapse
    panel.expander.dispatchEvent(event);

    expect(panel.expanded).toBeFalsy();
  });

  it('can be expanded/collapsed when pressing Enter key', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });

    // Expand
    panel.dispatchEvent(event);
    expect(panel.expanded).toBeTruthy();

    // Collapse
    panel.dispatchEvent(event);
    expect(panel.expanded).toBeFalsy();
  });

  it('can be expanded/collapsed when pressing Space key', () => {
    const event = new KeyboardEvent('keydown', { key: ' ' });

    // Expand
    panel.dispatchEvent(event);
    expect(panel.expanded).toBeTruthy();

    // Collapse
    panel.dispatchEvent(event);
    expect(panel.expanded).toBeFalsy();
  });

  it('can select the next panel when pressing the ArrowDown key', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    let nextPanel = panel.nextElementSibling;

    panel.dispatchEvent(event);
    nextPanel.setAttribute('tabindex', '0');
    expect(nextPanel.getAttribute('tabindex')).toBe('0');

    nextPanel = panel3.nextElementSibling;
    panel3.dispatchEvent(event);
    expect(nextPanel).toBe(null);
  });

  it('can select the prev panel when pressing the ArrowUp key', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    let prevPanel = panel2.previousElementSibling;

    panel2.dispatchEvent(event);
    prevPanel.setAttribute('tabindex', '0');
    expect(prevPanel.getAttribute('tabindex')).toBe('0');

    prevPanel = panel.previousElementSibling;
    panel.dispatchEvent(event);
    expect(prevPanel).toBe(null);
  });

  it('can change the height of the pane', () => {
    panel.pane.style.height = `100px`;

    requestAnimationFrame(() => {
      panel.pane.style.height = `100px`;
      requestAnimationFrame(() => {
        panel.pane.style.height = `0px`;
      });
    });
    expect(panel.pane.style.height).toEqual('0px');
  });

  it('supports setting mode', () => {
    accordion.mode = 'dark';
    expect(accordion.container.getAttribute('mode')).toEqual('dark');
  });

  it('supports setting version', () => {
    accordion.version = 'classic';
    expect(accordion.container.getAttribute('version')).toEqual('classic');
  });
});
