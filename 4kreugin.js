(function() {
  'use strict';

  var host = 'https://4krezka.net'; // URL сайта

  function fetchHTML(url, callback, errorCallback) {
    var net = new Lampa.Reguest();
    net.timeout(5000);
    net.native(url, function(data) {
      callback(data);
    }, function(error) {
      console.error('Ошибка при получении данных:', error);
      if (errorCallback) errorCallback(error);
    });
  }

  function parseHTMLForResults(html) {
    var results = [];
    try {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var items = doc.querySelectorAll('.poster');
      items.forEach(function(item) {
        var title = item.querySelector('.poster__title')?.textContent || 'Без названия';
        var url = host + (item.querySelector('a')?.getAttribute('href') || '');
        var poster = host + (item.querySelector('img')?.getAttribute('src') || '');
        results.push({
          title: title,
          url: url,
          poster: poster
        });
      });
    } catch (e) {
      console.error('Ошибка при парсинге HTML:', e);
    }
    return results;
  }

  function startPlugin() {
    Lampa.Plugins.add({
      id: '4krezka',
      title: '4KRezka',
      icon: 'https://4krezka.net/favicon.ico',
      onSearch: function(query, call) {
        var searchUrl = host + '/index.php?do=search&subaction=search&story=' + encodeURIComponent(query);
        fetchHTML(searchUrl, function(html) {
          var results = parseHTMLForResults(html);
          call(results);
        }, function() {
          call([]);
        });
      },
      onFetch: function(item, call) {
        fetchHTML(item.url, function(html) {
          var streams = [{ title: 'Основной поток', url: item.url }];
          call(streams);
        }, function() {
          call([]);
        });
      }
    });
    console.log('Плагин 4KRezka успешно зарегистрирован!');
  }

  if (typeof Lampa !== 'undefined') {
    startPlugin();
  } else {
    console.error('LAMPA не загружена');
  }
})();
