// Supporting components
import IdsPopup from '../ids-popup';
import css from '../../../assets/css/ids-popup/index.css';

const cssLink = `<link href="${css}" rel="stylesheet">`;
document.querySelector('head').insertAdjacentHTML('afterbegin', cssLink);

document.addEventListener('DOMContentLoaded', () => {
  const popup = document.querySelector('#popup-1');
  if (!popup) {
    return;
  }

  // Implement `onPlace` callback to alter popup values and provide logging
  popup.onPlace = (popupRect) => {
    // eslint-disable-next-line
    console.log('Before `onPlace` occurs:', popupRect.x, popupRect.y);

    popupRect.x += 100;
    popupRect.y += 50;

    // eslint-disable-next-line
    console.log('After `onPlace` occurs:', popupRect.x, popupRect.y);

    return popupRect;
  };
});