import { CalendarEventData, CalendarEventTypeData } from '../ids-calendar-event';
import IdsCustomCalendarEvent from './ids-custom-calendar-event';

interface CustomCalendarEventTypeData extends CalendarEventTypeData {
  noOfAttributes?: number;
  attrs?: [];
}


export default class WfmCalendarEventManager {
  CUSTOM_MAX_EVENT_COUNT = 3;

  #eventPositionMap = new Map();

  #eventPillAttributesMap = new Map();

  #dateKey = '';

  #order = 0;

  #eventData: CustomCalendarEventTypeData | any;

  /**
 * Sets dateKey property
 * @param {string} val dateKey string
 */
  set dateKey(val: string) {
    this.#dateKey = val;
  }

  /**
   * Sets order property
   * @param {number} val order number
   */
  set order(val: number) {
    this.#order = val;
  }

  set eventData(data: CustomCalendarEventTypeData[] | any) {
    this.#eventData = data;
  }

  get yOffset(): number {
    return this.#eventPositionMap.get(`${this.#dateKey}_${this.#order}`);
  }

  set yOffset(calendarEvent: IdsCustomCalendarEvent | any) {
    // const eventTypeData = calendarEvent.eventTypeData;
    // const dateKey = calendarEvent.dateKey;
    // const order = calendarEvent.order;
    this.manageEventPillsPosition(this.#dateKey, this.#order, this.#eventData);
    // const position = this.#eventPositionMap.get(`${dateKey}_${order}`);
    console.log(this.#eventPositionMap);
    // return position;
  }

  isEventOverflowing(event: IdsCustomCalendarEvent): boolean {
    return event.order > this.CUSTOM_MAX_EVENT_COUNT - 1;
  }

  /**
   * Manage event pill position vetically based on the number of attributes displayed in first event pill
   * @param {string} dateKey generated date key
   * @param {number} eventOrder Events order
   * @param {CalendarEventTypeData} eventType Event
   */
  manageEventPillsPosition(dateKey: string, eventOrder: number, eventType: CalendarEventTypeData | any) {
    const MAX_EVENT_PILL_ATTR_COUNT = 5;
    if (eventOrder === 0) {
      if (eventType.noOfAttributes === 3) {
        this.#eventPositionMap.set(`${dateKey}_${eventOrder + 1}`, 58);
      } else if (eventType.noOfAttributes === 2) {
        this.#eventPositionMap.set(`${dateKey}_${eventOrder + 1}`, 50);
      } else if (eventType.noOfAttributes === 1) {
        this.#eventPositionMap.set(`${dateKey}_${eventOrder + 1}`, 40);
      }
      this.#eventPillAttributesMap.set(`${dateKey}_${eventOrder}`, eventType.noOfAttributes);
    } else if (eventOrder === 1) {
      const attributesCount = this.#eventPillAttributesMap.get(`${dateKey}_${eventOrder - 1}`);
      if ((attributesCount + eventType.noOfAttributes) > MAX_EVENT_PILL_ATTR_COUNT) {
        this.CUSTOM_MAX_EVENT_COUNT = 1;
      } else {
        this.CUSTOM_MAX_EVENT_COUNT = 2;
      }

      if (attributesCount === 3 && eventType.noOfAttributes === 1) {
        this.#eventPositionMap.set(`${dateKey}_${eventOrder + 1}`, 70);
      } else if (attributesCount === 2) {
        this.#eventPositionMap.set(`${dateKey}_${eventOrder + 1}`, 70);
      } else if (attributesCount === 1 && eventType.noOfAttributes === 1) {
        this.#eventPositionMap.set(`${dateKey}_${eventOrder + 1}`, 60);
      } else if (attributesCount === 1 && eventType.noOfAttributes === 2) {
        this.#eventPositionMap.set(`${dateKey}_${eventOrder + 1}`, 70);
      }
      this.#eventPillAttributesMap.set(`${dateKey}_${eventOrder}`, eventType.noOfAttributes);
    } else if (eventOrder === 2) {
      const firstPillAttributesCount = this.#eventPillAttributesMap.get(`${dateKey}_${eventOrder - 2}`);
      const secondPillAttributesCount = this.#eventPillAttributesMap.get(`${dateKey}_${eventOrder - 1}`);
      if ((firstPillAttributesCount + secondPillAttributesCount + eventType.noOfAttributes) >= MAX_EVENT_PILL_ATTR_COUNT) {
        this.CUSTOM_MAX_EVENT_COUNT = 2;
      } else {
        this.CUSTOM_MAX_EVENT_COUNT = 3;
      }

      if (secondPillAttributesCount === 3) {
        this.#eventPositionMap.set(`${dateKey}_${eventOrder + 1}`, 70);
      } else if (secondPillAttributesCount === 2) {
        this.#eventPositionMap.set(`${dateKey}_${eventOrder + 1}`, 85);
      } else if (secondPillAttributesCount === 1) {
        this.#eventPositionMap.set(`${dateKey}_${eventOrder + 1}`, 75);
      }
      this.#eventPillAttributesMap.set(`${dateKey}_${eventOrder}`, eventType.noOfAttributes);
    }
  }

  /**
   * Groups calendar events by day using dateKey as key
   * @param {CalendarEventData[]} events calendar events data
   * @returns {Record<string, Array<CalendarEventData>>} collection of calendar events
   */
  groupEventsByDay(events: CalendarEventData[]): Record<string, Array<CalendarEventData>> {
    const dayEvents: Record<string, Array<CalendarEventData>> = {};

    events.forEach((event: CalendarEventData) => {
      const dateKey = this.generateDateKey(new Date(event.starts)).toString();
      if (!dayEvents[dateKey]) dayEvents[dateKey] = [];
      dayEvents[dateKey].push(event);
    });

    return dayEvents;
  }

  /**
   * Creates date key used in component
   * Format - [year][month][date]
   * @param {Date} date Date obj
   * @returns {number} 20200421
   */
  generateDateKey(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth().toString();
    const day = date.getDate().toString();

    return parseInt(`${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`);
  }
}
