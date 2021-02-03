// Imports Used in the Examples
import pathData from 'ids-identity/dist/theme-uplift/icons/standard/path-data.json';

// Here we append all the HTML to show off the icons to the icon div section
const queryString = window.location.search;
const justOne = queryString === '?count=1';

document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.ids-icon-list');
  let iconHtml = '';
  const iconData = Object.entries(pathData);

  for (let i = 0; i < iconData.length; i++) {
    iconHtml += `<span class="ids-icon-container"><ids-text font-size="10">icon-${iconData[i][0]}</ids-text><br/>
      <ids-icon icon="${iconData[i][0]}" size="large"></ids-icon>
      <ids-icon icon="${iconData[i][0]}"></ids-icon>
      <ids-icon icon="${iconData[i][0]}" size="small"></ids-icon></span>`;

    if (i === 0 && justOne) {
      break;
    }
  }

  if (section) {
    section.insertAdjacentHTML('beforeend', iconHtml);
  }
});
