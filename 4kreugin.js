(function() {
    'use strict';

    // Провайдер для 4krezka.net
    class RezkaProvider {
        constructor() {
            this.network = new Lampa.Reguest();
            this.host = 'https://4krezka.net';
        }

        // Получение списка фильмов
        list(params) {
            return new Promise((resolve, reject) => {
                let page = params.page || 1;
                this.network.native(`${this.host}/films?page=${page}`, (response) => {
                    try {
                        let items = this.parseMovies(response);
                        resolve({
                            results: items,
                            total_pages: 999, // Можно динамически определить
                            page: page
                        });
                    } catch (error) {
                        console.error('Rezka Plugin Error [list]:', error);
                        reject(error);
                    }
                }, reject);
            });
        }

        // Парсинг списка фильмов
        parseMovies(html) {
            let items = [];
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, 'text/html');
            let movies = doc.querySelectorAll('.film-list .film-item');

            movies.forEach(movie => {
                try {
                    let title = movie.querySelector('.film-title').textContent.trim();
                    let poster = movie.querySelector('.film-poster img').getAttribute('src');
                    let id = movie.querySelector('a').getAttribute('href').match(/\/films\/(\d+)/)[1];

                    items.push({
                        id: id,
                        title: title,
                        original_title: title,
                        poster: poster.startsWith('http') ? poster : this.host + poster,
                        year: movie.querySelector('.film-year')?.textContent.trim() || '',
                        quality: movie.querySelector('.film-quality')?.textContent.trim()
                    });
                } catch (err) {
                    console.error('Error parsing movie:', err);
                }
            });

            return items;
        }

        // Поиск фильмов
        search(params) {
            return new Promise((resolve, reject) => {
                let query = encodeURIComponent(params.query);
                this.network.native(`${this.host}/search?q=${query}`, (response) => {
                    try {
                        let items = this.parseSearchResults(response);
                        resolve({
                            results: items,
                            total: items.length
                        });
                    } catch (error) {
                        console.error('Rezka Plugin Error [search]:', error);
                        reject(error);
                    }
                }, reject);
            });
        }

        // Парсинг результатов поиска
        parseSearchResults(html) {
            let items = [];
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, 'text/html');
            let movies = doc.querySelectorAll('.search-list .search-item');

            movies.forEach(movie => {
                try {
                    let title = movie.querySelector('.search-title').textContent.trim();
                    let poster = movie.querySelector('.search-poster img').getAttribute('src');
                    let id = movie.querySelector('a').getAttribute('href').match(/\/films\/(\d+)/)[1];

                    items.push({
                        id: id,
                        title: title,
                        original_title: title,
                        poster: poster.startsWith('http') ? poster : this.host + poster,
                        year: movie.querySelector('.search-year')?.textContent.trim() || ''
                    });
                } catch (err) {
                    console.error('Error parsing search result:', err);
                }
            });

            return items;
        }

        // Получение ссылок на воспроизведение
        get(params) {
            return new Promise((resolve, reject) => {
                this.network.native(`${this.host}/films/${params.id}`, (response) => {
                    try {
                        let videoData = this.parseVideoLinks(response);
                        resolve(videoData);
                    } catch (error) {
                        console.error('Rezka Plugin Error [get]:', error);
                        reject(error);
                    }
                }, reject);
            });
        }

        // Парсинг видео ссылок
        parseVideoLinks(html) {
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, 'text/html');
            
            // Пример извлечения iframe с видео
            let iframe = doc.querySelector('iframe.player-frame');
            if (iframe) {
                let src = iframe.getAttribute('src');
                
                return {
                    file: src,
                    quality: {
                        "720p": src,
                        "480p": src
                    }
                };
            }

            return { file: '' };
        }
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
