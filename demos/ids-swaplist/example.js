// Example for populating the List View
const listView = document.querySelectorAll('ids-list-view');

// Do an ajax request and apply the data to the list
const url = '/data/events.json';

fetch(url)
  .then(
    (res) => {
      if (res.status !== 200) {
        return;
      }

      res.json().then((data) => {
        listView.forEach((l) => {
          l.data = data;
        });
      });
    }
  );
