(function() {
    'use strict';

    // Важно: добавить явную регистрацию провайдера
    Lampa.Parser = function() {
        this.sites = {
            // Регистрация провайдера с уникальным именем
            '4krezka': {
                url: 'https://4krezka.net',
                title: '4K Rezka',
                search: true
            }
        };

        this.search = function(params) {
            return new Promise((resolve) => {
                Lampa.Activity.push({
                    url: '',
                    title: 'Поиск - ' + params.query,
                    component: '4krezka',
                    search: params.query,
                    page: 1
                });
            });
        };
    };

    // Создаем компонент для Lampa
    Lampa.Component.add('4krezka', {
        start: function() {
            let _this = this;
            
            // Обработка поиска или списка
            this.create = function() {
                let params = Lampa.Activity.get();
                let rezka = new RezkaProvider();

                // Если есть поисковый запрос - используем поиск
                if (params.search) {
                    rezka.search({query: params.search}).then(_this.build);
                } 
                // Иначе загружаем список фильмов
                else {
                    rezka.list({page: params.page || 1}).then(_this.build);
                }
            };

            this.build = function(data) {
                let items = data.results || [];
                let html = $('<div class="category-full"></div>');
                
                items.forEach(function(element) {
                    let card = Lampa.Template.get('card', {
                        title: element.title,
                        release_year: element.year,
                        quality: element.quality || '',
                        poster: element.poster
                    });

                    // Обработчик клика на карточку
                    card.on('hover:enter', function() {
                        Lampa.Activity.push({
                            url: '',
                            component: 'full',
                            id: element.id,
                            method: '4krezka',
                            data: element
                        });
                    });

                    html.append(card);
                });

                _this.renderList(html);
            };

            this.renderList = function(html) {
                Lampa.Scroll.render().data('_this', _this).addClass('category-full');
                Lampa.Scroll.append(html);
            };
        }
    });

    // Основной провайдер 
    class RezkaProvider {
        constructor() {
            this.network = new Lampa.Reguest();
            this.host = 'https://4krezka.net';
        }

        // Методы list, search, get остаются прежними 
        // (код из предыдущего ответа)
    }

    // Регистрация плагина в Lampa
    Lampa.Plugins.add({
        name: '4krezka',
        type: 'video',
        version: '1.0',
        create: function() {
            return new RezkaProvider();
        }
    });
})();
