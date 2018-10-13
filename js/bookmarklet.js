/* eslint no-unused-labels: 0 */
javascript: void (function () {
  var url = 'https://olf.github.io/mhmapsolver/';

    var list = document.querySelectorAll('.treasureMapPopup-goals-group-goal:not(.complete)');
    var mice = [];

    for (var i=0; i<list.length; i++) {
        mice.push(list[i].getAttribute('data-search-term'));
    }

  if (mice.length > 0) {
    window.open(url + '?mice=' + encodeURI(mice.join('/')), 'mhmapsolver');
  }
})();
