// Supporting components
import IdsInput from '../../src/components/ids-input';
import IdsToggleButton from '../../src/components/ids-toggle-button';
import IdsIcon from '../../src/components/ids-icon';
import IdsHyperlink from '../../src/components/ids-hyperlink';

document.addEventListener('DOMContentLoaded', () => {
  // Add an event listener to test clickable links
  document.querySelectorAll('ids-toggle-button').forEach((idsButton) => {
    idsButton.addEventListener('click', (e) => {
      e.target.toggle();
    });
  });
});