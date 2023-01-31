import eventsJSON from '../../../assets/data/events.json';
import IdsMonthView from '../../ids-month-view/ids-month-view';
import IdsCalendar from '../ids-calendar';
import IdsCustomCalendarEvent from './ids-custom-calendar-event';
import CustomCalendarEventManager from './ids-custom-calendar-event-manager';

const eventsURL: any = eventsJSON;

/**
 * Fetch events.json
 * @returns {Promise} events.json content
 */
function getCalendarEvents(): Promise<any> {
  return fetch(eventsURL).then((res) => res.json());
}

document.addEventListener('DOMContentLoaded', async () => {
  const calendar: any = document.querySelector<IdsCalendar>('ids-calendar');
  const addEventMenu = document.querySelector('#add-event');

  const view = calendar?.getView();
  if (view instanceof IdsMonthView) {
    const eventManager = new CustomCalendarEventManager();
    view.generateYOffset = (event: IdsCustomCalendarEvent): number => eventManager.generateYOffset(event);
    view.isEventOverflowing = (event: IdsCustomCalendarEvent): boolean => eventManager.isEventOverflowing(event);
  }

  // Set event types
  calendar.eventTypesData = [
    {
      id: 'dto',
      label: 'Discretionary Time Off',
      translationKey: 'DiscretionaryTimeOff',
      color: 'azure',
      checked: true,
      noOfAttributes: 2,
      attrs: [
        'subject',
        'time'
      ]
    },
    {
      id: 'admin',
      label: 'Admin',
      translationKey: 'AdministrativeLeave',
      color: 'amethyst',
      checked: true,
      noOfAttributes: 2,
      attrs: [
        'subject',
        'time'
      ]
    },
    {
      id: 'team',
      label: 'Team Event',
      translationKey: 'TeamEvent',
      color: 'emerald',
      checked: true,
      noOfAttributes: 3,
      attrs: [
        'subject',
        'time',
        'location'
      ]
    },
    {
      id: 'sick',
      label: 'Sick Time',
      translationKey: 'SickTime',
      color: 'amber',
      checked: true,
      noOfAttributes: 2,
      attrs: [
        'subject',
        'time'
      ]
    },
    {
      id: 'holiday',
      label: 'Company Holiday',
      translationKey: 'CompanyHoliday',
      color: 'slate',
      checked: true,
      disabled: true,
      noOfAttributes: 1,
      attrs: [
        'subject'
      ]
    }
  ];
  calendar.eventsData = await getCalendarEvents();

  addEventMenu?.addEventListener('selected', (evt: any) => {
    // Mock user defined id
    const id: string = Date.now().toString() + Math.floor(Math.random() * 100);

    switch (evt.detail.value) {
      case 'add-modal':
        calendar.createNewEvent(id, true);
        break;
      case 'add-api':
        calendar.createNewEvent(id, false);
        break;
      case 'clear':
        calendar.clearEvents();
        break;
      default:
        break;
    }
  });
});
