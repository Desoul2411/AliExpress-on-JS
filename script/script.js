'use strict';


document.addEventListener('DOMContentLoaded', () => {
    const search = document.querySelector('.search');   //quick JS - ctrl + shift + l
    const cartBtn = document.getElementById('cart');
    const wishlistBtn = document.getElementById('wishlist');
    const cart = document.querySelector('.cart'); 
    const goodsWrapper = document.querySelector('.goods-wrapper'); 
    const category = document.querySelector('.category');
    const cardCounter = cartBtn.querySelector('.counter');
    const wishlistCounter = wishlistBtn.querySelector('.counter');
    const cartWrapper = document.querySelector('.cart-wrapper'); 
    
    

    const wishlist = []; // Избранные товары
    const goodsBasket = {}; // Товары в корзине 
    
    const loading = (functioName) => {    //спиннер
        const spinner = `<div id="spinner"><div class="spinner-loading"><div><div><div></div>
        </div><div><div></div></div><div><div></div></div><div><div></div></div></div></div></div>`;

        if (functioName === 'renderCard') {
            goodsWrapper.innerHTML = spinner;
        }

        if (functioName === 'renderBasket') {
            cartWrapper.innerHTML = spinner;
        }

    };

    // Запрос на сервер
    const getGoods = (handler, filter) => {
        loading(handler.name);   //спиннер   / handler.name - имя переданной ф-ции
        fetch('db/db.json')   // путь относительно браузера
        .then(response => response.json())  // return response.json() - сократили / метод json() преобразует ответ в формате json в массив
        .then(filter)   //random sort
        .then(handler)   // в качестве handler передадим ф-цию renderCard
    };




    // Генерация карточек

    const createCardGoods = (id, title, price, img) => {
        const card = document.createElement('div');
        card.className = 'card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3';
        card.innerHTML = `
            <div class="card">
                <div class="card-img-wrapper">
                    <img class="card-img-top" src="${img}" alt="">
                    <button class="card-add-wishlist ${wishlist.includes(id) ? 'active' : '' }"   
                    data-goods-id = "${id}"></button>
                </div>
                <div class="card-body justify-content-between">
                    <a href="#" class="card-title">${title}</a>
                    <div class="card-price">${price} ₽</div>
                    <div>
                        <button class="card-add-cart"
                        data-goods-id="${id}">Добавить в корзину</button>
                    </div>
                </div>
            </div>`;
        return card;
    };





        //рендер товаров в корзине
        const createCardGoodsBasket = (id, title, price, img) => {
            const card = document.createElement('div');
            card.className = 'goods';
            card.innerHTML = `
            <div class="goods-img-wrapper">
                <img class="goods-img" src="${img}" alt="">
    
            </div>
            <div class="goods-description">
                <h2 class="goods-title">${title}</h2>
                <p class="goods-price">${price} ₽</p>
    
            </div>
            <div class="goods-price-count">
                <div class="goods-trigger">
                    <button class="goods-add-wishlist" ${wishlist.includes(id) ? 'active' : '' }"
                     data-goods-id="${id}" ></button>
                    <button class="goods-delete" data-goods-id="${id}"></button>
                </div>
                <div class="goods-count">${goodsBasket[id]}</div>       <!-- чтобы добавленный поаторно товар учитывался-->
            </div>`;
            return card;
        };




        //Рендеры

    const renderCard = goods => {  // goods - это ответ из обработанного промиса(массив) - response.json (список товаров, массив)
        goodsWrapper.textContent = ''; 

        if(goods.length) {
            goods.forEach(({id, title, price, imgMin }) => {   // сразу деструкткрировали из item - то же что const {id, title, price, imgMin } = item;
                goodsWrapper.appendChild(createCardGoods(id, title, price, imgMin));
            })
        } else {goodsWrapper.textContent = '❌ Товары по запросу не найдены!'; } // убрали старые карточки
    }




    const renderBasket = goods => {  // goods - это ответ из обработанного промиса(массив) - response.json (список товаров, массив)
        cartWrapper.textContent = ''; 

        if(goods.length) {
            goods.forEach(({id, title, price, imgMin }) => {   // сразу деструкткрировали из item - то же что const {id, title, price, imgMin } = item;
                cartWrapper.appendChild(createCardGoodsBasket(id, title, price, imgMin));
            })
        } else {cartWrapper.innerHTML = `<div id="cart-empty">Ваша корзина пока пуста</div>` }
    }



    
    //Вычисления

    const calcTotalPrice = goods => {
        let sum = goods.reduce((accum, item) => {
            return accum + item.price * goodsBasket[item.id];
        },0 )
        /*for (const item of goods) {
            sum += item.price * goodsBasket[item.id];  // goodsBasket[item.id]   - кол-во одного вида товара
        }*/
        cart.querySelector('.cart-total>span').textContent = sum.toFixed(2);
    }


    const checkCount = () => {
        wishlistCounter.textContent = wishlist.length;
        cardCounter.textContent = Object.keys(goodsBasket).length;
    }




    //Фильтры

    const showCardBasket = goods => {
        const basketGoods = goods.filter(item => goodsBasket.hasOwnProperty(item.id));
        calcTotalPrice(basketGoods);
        return basketGoods;
    };

    const showWishlist = () => {
        getGoods(renderCard, goods => goods.filter(item => wishlist.includes(item.id)))
    };

    const randomSort = (item) => item.sort(() => Math.random() - 0.5); //получим или + или -число и массив рандомно отсортируется









    //Работа с хранилищем 
    const getCookie= name => {
        let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
      }


      const cookieQuery = get => {
        if (get) {
            if (getCookie('goodsBasket')) {  // если есть товары, только тогда парсим (чтобы не было ошибки)
                Object.assign(goodsBasket, JSON.parse(getCookie('goodsBasket')));
                //goodsBasket = JSON.parse(getCookie('goodsBasket'));
            }  
            checkCount();
        } else {
            document.cookie = `goodsBasket=${JSON.stringify(goodsBasket)}; max-age= 86400e3`;
        }
        
      };



    const storageQuery = (get) => {
        if(get) {
            if (localStorage.getItem('wishlist')) {
                wishlist.push(...JSON.parse(localStorage.getItem('wishlist')));  
                //const wishlistStorage = JSON.parse(localStorage.getItem('wishlist'));
                //wishlistStorage.forEach(id => wishlist.push(id));
            } 
            checkCount();
            } else {
            localStorage.setItem('wishlist', JSON.stringify(wishlist)); 
        }
    };










    //События

    const closeCard = event => {
        const target = event.target;

        if (target === cart || target.classList.contains('cart-close') || event.keyCode === 27) {
            cart.style.display = '';
            document.removeEventListener('keyup',closeCard);
        }
    };


    const openCart = event => {
        event.preventDefault();
        cart.style.display = 'flex';
        document.addEventListener('keyup',closeCard);
        getGoods(renderBasket, showCardBasket);
    };



    /*goodsWrapper.appendChild(createCardGoods('1', 'Дартс', 2000 , 'img/temp/Archer.jpg'));  //можно append  вместо  appendChild
    goodsWrapper.appendChild(createCardGoods('2' , 'Фламинго', 3000, 'img/temp/Flamingo.jpg'));
    goodsWrapper.appendChild(createCardGoods('3', 'Носки', 333, 'img/temp/Socks.jpg'));*/


    const chooseCategory = event => {
        event.preventDefault();
        const target = event.target;
        

        //Фильтр по категориям
        if(target.classList.contains('category-item')) {
            const category = target.dataset.category;
            getGoods(renderCard, (goods) => {   // goods  = item с сервера    // передали новую ф-цию вместо random sort
                return goods.filter(item => item.category.includes(category));  // убрать return и лишние скобки
            })
            console.log(target.dataset.category)
        }
    };

    const searchGoods = event => {
        event.preventDefault();
        const input = event.target.elements.searchGoods;   // получиили input
        const inputValue = input.value.trim();    // trim убирает пробелы слева и справа

        if(inputValue !== '') { 
            const searchString = new RegExp(inputValue, 'i')    //Создаём regExp на основе введённых в строку данных
            getGoods(renderCard, goods => goods.filter(item => searchString.test(item.title)));   // метод test у regexp возвращает true или false
        } else {
            search.classList.add('error');    // анимация поля search
            setTimeout(() => {
                search.classList.remove('error'); 
            },2000);
        }

        input.value = ''; // очистить форму
    }


    


    const toggleWishlist = (id, elem) => {
        if (wishlist.includes(id)) {   // +1 так как если индекс будет = 0 , то вернёт false
            wishlist.splice(wishlist.indexOf(id),1);
            elem.classList.remove('active');
            //document.querySelector(`.card-add-wishlist[data-goods-id = '${id}']`).classList.remove('.active')
        } else {
            wishlist.push(id);
            //document.querySelector(`.card-add-wishlist[data-goods-id = '${id}']`).classList.add('.active')
            elem.classList.add('active');
        }
        
        checkCount();
        storageQuery();
    };


    
    const addBasket = id => {
        if (goodsBasket[id]) {
            goodsBasket[id] += 1
        } else {
            goodsBasket[id] = 1;
            
        }
            checkCount();
            cookieQuery();
    }



    const removeGoods = id => {   // Удаление товаров из корзины
        delete goodsBasket[id];
        checkCount();
        cookieQuery();
        getGoods(renderBasket, showCardBasket);
    }



    //handler
    const handlerGoods = event => {
        const target  = event.target;
        if (target.classList.contains('card-add-wishlist')) {
            toggleWishlist(target.dataset.goodsId, target);
        };

        if (target.classList.contains('card-add-cart')) {
            addBasket(target.dataset.goodsId);
        }
    }




    const handlerBasket = event => {
        const target = event.target;
        if (target.classList.contains('goods-add-wishlist')) {
            toggleWishlist(target.dataset.goodsId , target);
        }

        if (target.classList.contains('goods-delete')) {
            removeGoods(target.dataset.goodsId);
        }
    }



    //Инициализация
    {
    getGoods(renderCard, randomSort);  // в качестве handler передадим ф-цию renderCard
    storageQuery(true);
    cookieQuery(true);


    cartBtn.addEventListener('click', openCart);
    cart.addEventListener('click', closeCard);
    category.addEventListener('click', chooseCategory);
    search.addEventListener('submit', searchGoods);
    cartWrapper.addEventListener('click', handlerBasket);
    goodsWrapper.addEventListener('click',handlerGoods);
    wishlistBtn.addEventListener('click', showWishlist);

    }

});
