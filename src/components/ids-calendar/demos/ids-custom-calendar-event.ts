import IdsCalendarEvent, { CalendarEventTypeData } from '../ids-calendar-event';
import styles from './ids-custom-calendar-event.scss';
import { customElement, scss } from '../../../core/ids-decorators';

interface CustomCalendarEventTypeData extends CalendarEventTypeData {
  noOfAttributes?: number;
  attrs?: [];
}

@customElement('ids-custom-calendar-event')
@scss(styles)
export default class IdsCustomCalendarEvent extends IdsCalendarEvent {
  #cssClass: string[] = [];

  eventTypesJson: CustomCalendarEventTypeData[] | any = [];

  eventPillHeight = '18px'; // Default height for 1 line event pill

  constructor() {
    super();
  }

  /**
   * Invoked when ids-custom-calendar-event is added to the DOM
   */
  connectedCallback(): void {
    super.connectedCallback();

    if (this.container) {
      this.container.style.height = this.eventPillHeight;
    }

    // overrides the day cell date text position
    document.documentElement.style.setProperty('--ids-month-view-day-text-top', '2px');

    // overrides the font-size of "More" text for events overflow inside the day cell
    const calendar: any = document.querySelector('ids-calendar');
    const view = calendar?.getView();
    const eventRows = view.container.children[0].children[0].rows;
    for (let i = 0; i < eventRows.length; i++) {
      for (let j = 0; j < eventRows[i].cells.length; j++) {
        const childrenCount = eventRows[i].cells[j].children[1]?.children.length;
        if (childrenCount > 0) {
          if (eventRows[i].cells[j].children[1].children[childrenCount - 1].tagName === 'IDS-TEXT') {
            eventRows[i].cells[j].children[1].children[childrenCount - 1].setAttribute('font-size', '10');
          }
        }
      }
    }
  }

  template(): string {
    // Customized Layout
    const cssClass = this.#cssClass.join(' ');
    return `
      <a class='ids-calendar-event ${cssClass}' href='#' color='${this.color}'>
          ${this.contentTemplate()}
      </a>
    `;
  }

  /**
   * Creates template for calendar event content
   * @returns {string} content html
   */
  contentTemplate(): string {
    if (!this.eventData) return ``;

    let text = `<span line='1' class='custom-calendar-event-title'>${this.eventData.shortSubject || this.eventData.subject}</span>`;
    const tooltip = this.eventData.subject;
    const overflow = this.overflow;
    const icon = this.eventData.icon ? `<ids-icon class='calendar-event-icon custom-calendar-event-icon' icon='${this.eventData.icon}' height='12' width='12'></ids-icon>` : '';
    this.eventTypesJson.push(this.eventTypeData);

    if (this.eventTypesJson) {
      const eventPillsAttr = this.eventTypesJson.filter((item: any) => item.id === this.eventData?.type);
      if (eventPillsAttr.length > 0 && eventPillsAttr[0].attrs) {
        if (eventPillsAttr[0].id === 'dto' || eventPillsAttr[0].id === 'admin' || eventPillsAttr[0].id === 'sick') {
          eventPillsAttr[0]?.attrs.forEach((attr: string) => {
            if (attr === 'time' && this.eventData?.starts && this.eventData?.ends) {
              text += `<span line='2' class='custom-calendar-event-details'>${this.getHourRange(new Date(this.eventData.starts), new Date(this.eventData.ends))}</span>`;
              this.eventPillHeight = '28px';
            }
          });
        } else if (eventPillsAttr[0].id === 'team') {
          eventPillsAttr[0].attrs.forEach((attr: string) => {
            if (attr === 'time' && this.eventData?.starts && this.eventData?.ends) {
              text += `<span line='2' class='custom-calendar-event-details'>${this.getHourRange(new Date(this.eventData.starts), new Date(this.eventData.ends))}</span>`;
              this.eventPillHeight = '28px';
            } else if (attr === 'location' && this.eventData?.location) {
              text += `<span line="3" class="custom-calendar-event-details">${this.eventData.location}</span>`;
              this.eventPillHeight = '36px';
            }
          });
        }
      }
    }

    return `<div class='calendar-event-content'>
                ${icon}
              <ids-text class='calendar-event-title' inline overflow='${overflow}' tooltip='${tooltip}'>
                ${text}
              </ids-text>
            </div>`;
  }

  /**
   * Sets extra css classes to calendar event
   * @param {Array<string>} value array of css classes
   */
  set cssClass(value: string[]) {
    this.#cssClass = this.#cssClass.concat(value);
    this.container?.classList.add(...value);
  }

  /**
   * Gets the start and end time format for each event
   * @param {Date} start Event Start Date
   * @param {Date} end Event End Date
   * @returns {string} Formatted Hour Range
   */
  getHourRange(start: Date, end: Date) {
    const startHours = start.getHours() + start.getMinutes() / 60;
    const endHours = end.getHours() + start.getMinutes() / 60;
    return this.locale?.formatHourRange(startHours, endHours, {});
  }
}
