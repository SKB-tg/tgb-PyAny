/* libs start */
;(function() {
  var canUseWebP = function() {
    var elem = document.createElement('canvas');

    if (!!(elem.getContext && elem.getContext('2d'))) {
        // was able or not to get WebP representation
        return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
    }

    // very old browser like IE 8, canvas not supported
    return false;
  };
  
  var isWebpSupported = canUseWebP();

  if (isWebpSupported === false) {
    var lazyItems = document.querySelectorAll('[data-src-replace-webp]');

    for (var i = 0; i < lazyItems.length; i += 1) {
      var item = lazyItems[i];

      var dataSrcReplaceWebp = item.getAttribute('data-src-replace-webp');
      if (dataSrcReplaceWebp !== null) {
        item.setAttribute('data-src', dataSrcReplaceWebp);
      }
    }
  }

  var lazyLoadInstance = new LazyLoad({
    elements_selector: ".lazy"
  });
})();
/* libs end */

/* myLib start */
;(function() {
  window.myLib = {};

  window.myLib.body = document.querySelector('body');

  window.myLib.closestAttr = function(item, attr) {
    var node = item;
    while(node) {
      var attrValue = node.getAttribute(attr);
      if (attrValue) {
        return attrValue;
      }

      node = node.parentElement;
    }

    return null;
  };
// ****задействует родительские элменты
  window.myLib.closestItemByClass = function(item, className) {
    var node = item;

    while(node) {
      if (node.classList.contains(className)) {
        return node;
      }

      node = node.parentElement;
    }

    return null;
  };

  window.myLib.toggleScroll = function() {
    myLib.body.classList.toggle('no-scroll');
  };
})();
/* myLib end */

/* header start */
;(function() {
  if (window.matchMedia('(max-width: 992px)').matches) {
    return;
  }

  var headerPage = document.querySelector('.header-page');

  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 0) {
      headerPage.classList.add('is-active');
    } else {
      headerPage.classList.remove('is-active');
    }
  });
})();
/* header end */

/* popup start */
;(function() {
  var showPopup = function(target) {
    target.classList.add('is-active');
  };

  var closePopup = function(target) {
    target.classList.remove('is-active');
  };

  myLib.body.addEventListener('click', function(e) {
    var target = e.target;
    var popupClass = myLib.closestAttr(target, 'data-popup');

    if (popupClass === null) {
      return;
    }

    e.preventDefault();
    var popup = document.querySelector('.' + popupClass);

    if (popup) {
      showPopup(popup);
      myLib.toggleScroll();
    }
  });

  myLib.body.addEventListener('click', function(e) {
    var target = e.target;
    var popupItemClose = myLib.closestItemByClass(target, 'popup-close');

    var popup_thanks = myLib.closestItemByClass(target, 'popup-thanks') || null;

    if (popupItemClose ||
        target.classList.contains('popup__inner')) {
          var popup = myLib.closestItemByClass(target, 'popup');
          if (popup_thanks) { delete_popup__chek__order('chek__order_id');
           }
          closePopup(popup);
          myLib.toggleScroll();

    }
  });

  myLib.body.addEventListener('keydown', function(e) {
    if (e.keyCode !== 27) {
      return;
    }

    var popup = document.querySelector('.popup.is-active');

    if (popup) {
      closePopup(popup);
      myLib.toggleScroll();
    }
  });
})();

/* popup end */

/* scrollTo start */
;(function() {
  var scroll = function(target) {
    var targetTop = target.getBoundingClientRect().top;
    var scrollTop = window.pageYOffset;
    var targetOffsetTop = targetTop + scrollTop;
    var headerOffset = document.querySelector('.header-page').clientHeight;
    window.scrollTo(0, targetOffsetTop - headerOffset);
  } 

  myLib.body.addEventListener('click', function(e) {
    var target = e.target;
    var scrollToItemClass = myLib.closestAttr(target, 'data-scroll-to');
    if (scrollToItemClass === null) {
      return;
    }

    e.preventDefault();
    var scrollToItem = document.querySelector('.' + scrollToItemClass);

    if (scrollToItem) {
      scroll(scrollToItem);
    }
  });
})();
/* scrollTo end */

/* catalog start */
;(function() {
  var catalogSection = document.querySelector('.js-section-catalog');

  if (catalogSection === null) {
    return;
  }

  var removeChildren = function(item) {
    while (item.firstChild) {
      item.removeChild(item.firstChild);
    }
  };

  var updateChildren = function(item, children) {
    removeChildren(item);
    for (var i = 0; i < children.length; i += 1) {
      item.appendChild(children[i]);
    }
  };

  var catalog = catalogSection.querySelector('.catalog');
  var catalogNav = catalogSection.querySelector('.catalog-nav');
  var catalogItems = catalogSection.querySelectorAll('.catalog__item');

  catalogNav.addEventListener('click', function(e) {
    var target = e.target;
    var item = myLib.closestItemByClass(target, 'catalog-nav__btn');

    if (item === null || item.classList.contains('is-active')) {
      return;
    }

    e.preventDefault();
    var filterValue = item.getAttribute('data-filter');
    var previousBtnActive = catalogNav.querySelector('.catalog-nav__btn.is-active');

    previousBtnActive.classList.remove('is-active');
    item.classList.add('is-active');

    if (filterValue === 'all') {
      updateChildren(catalog, catalogItems);
      return;
    }

    var filteredItems = [];
    for (var i = 0; i < catalogItems.length; i += 1) {
      var current = catalogItems[i];
      var categories = current.getAttribute('data-category').split(',');

      if (categories.indexOf(filterValue) !== -1) {
        filteredItems.push(current);
      }
    }

    updateChildren(catalog, filteredItems);
  });
})();
/* catalog end */

/* map start */
;(function() {
  var sectionContacts = document.querySelector('.section-contacts');

  if (!sectionContacts) {
    return;
  }

  var ymapInit = function() {
    if (typeof ymaps === 'undefined') {
      return;
    }
  
    ymaps.ready(function () {
      var ymap = document.querySelector('.contacts__map');
      var coordinates = ymap.getAttribute('data-coordinates');
      var address = ymap.getAttribute('data-address');

      var myMap = new ymaps.Map('ymap', {
              center: coordinates.split(','),
              zoom: 16
          }, {
              searchControlProvider: 'yandex#search'
          }),
  
          myPlacemark = new ymaps.Placemark(myMap.getCenter(), {
              balloonContent: address
          }, {
              iconLayout: 'default#image',
              iconImageHref: WPJS.siteUrl + '/assets/img/common/marker.svg',
              iconImageSize: [40, 63.2],
              iconImageOffset: [-50, -38]
          });
  
      myMap.geoObjects.add(myPlacemark);
  
      myMap.behaviors.disable('scrollZoom');
    });
  };

  var ymapLoad = function() {
    var script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?lang=en_RU';
    myLib.body.appendChild(script);
    script.addEventListener('load', ymapInit);
  };

  var checkYmapInit = function() {
    var sectionContactsTop = sectionContacts.getBoundingClientRect().top;
    var scrollTop = window.pageYOffset;
    var sectionContactsOffsetTop = scrollTop + sectionContactsTop;

    if (scrollTop + window.innerHeight > sectionContactsOffsetTop) {
      ymapLoad();
      window.removeEventListener('scroll', checkYmapInit);
    }
  };

  window.addEventListener('scroll', checkYmapInit);
  checkYmapInit();
})();
/* map end */

/* form start */
;(function() {
  var forms = document.querySelectorAll('.form-send');
  if (forms.length === 0) {
    return;
  }

  var serialize = function(form, add_obj) {
    var items = form.querySelectorAll('input, select, textarea');
    var str = '';
    var obj = {}; //
    var val_category=Object.values(add_obj);
    for (var i = 0; i < items.length; i += 1) {
      var item = items[i];
      var name = item.name;
      var value = item.value;
      var separator = i === 0 ? '' : '&';

      if (value) {
        str += separator + name + ':...' + value;
        if (name.includes('-')) {
          let name1 = name.split('-');
          obj[name1[name1.length-1]] = value;//
        } //
        obj[name] = value;
      }
    }
    str = 'Категория' + ':...' + val_category + separator + str;
    obj['str'] = str;
    obj['Категория']=val_category;
     //
    return obj;//
  };
  // var _obj = serialize(form);// =>{return obj};
  var formSend = function(form, add_obj) {


    var data = serialize(form, add_obj)['str'];
    //var tg_data = serialize(form);
    //delete tg_data.str;
    console.log(data);


    var xhr = new XMLHttpRequest();
    var url = '/zakazDataForm';// + '?action=send_email';
    
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json'; //см. обработчик хитрая доработка  -- https://developer.mozilla.org/ru/docs/Learn/JavaScript/Objects/JSON
    xhr.onload = function() {
      var activePopup = document.querySelector('.popup.is-active');

      if (activePopup) {
        activePopup.classList.remove('is-active');
      } else {
        myLib.toggleScroll();
      }

      if (xhr.response.ok === true) {
        document.querySelector('.popup-thanks').classList.add('is-active');
        data1 = data.split( '&',);// replace(/&/g, '\n');
        chek_order(data1);  //данные в popup-oorder для информирования
        //console.log(tg_data);
        document.dispatchEvent(new CustomEvent('reset-cart'));
      } else {
        document.querySelector('.popup-error').classList.add('is-active');
      }

      form.reset();
    };

    xhr.send(data);
    //setTimeout(sendMessage(data), 1000);//вызов функции отсылки в чат, можно переделать забор из формы 

  };

  for (var i = 0; i < forms.length; i += 1) {
    forms[i].addEventListener('submit', function(e) {
      e.preventDefault();
      var form = e.currentTarget;
    // этапный способ сбора инфы о товаре в базу  -- можно закоминтать
    const cart1 = JSON.parse(localStorage.getItem('cart')) || {};
    const key_cart = Object.keys(cart1);
    //console.log(cart1, key_cart[0]);
    for (var i = 0; i < key_cart.length; i += 1) {
    var cart3 = cart1[key_cart[i]];
    const val_cart1 = Object.values(cart3)[6] || '';
    var category_obj={};
    var type_obj_in_data={'product': cart1[key_cart[i]]}
    category_obj['Категория'] = val_cart1;
    //console.log(cart1[key_cart[i]], category_obj, type_obj_in_data);
    //send_data_db(type_obj_in_data);
  }
        //----------------------------------------
        // "name"  TEXT,
        // "description" TEXT,
        // "price" TEXT,
        // "slug"  TEXT,
        // "category"  TEXT,
        // "attribute" TEXT,
        // "src"
    formSend(form, category_obj);

    });
  }
})();
/* form end */

//   start   popup__chek__order*/
  const delete_popup__chek__order = (id) => {
const cartDOMElement = document.querySelector('.popup__chek__order');
    const chek__orderDOMElement = cartDOMElement.querySelector(`[data-chek__order-id="${id}"]`);

    cartDOMElement.removeChild(chek__orderDOMElement);
  };
function chek_order(resp) {
  const cartDOMElement = document.querySelector('.popup__chek__order');

  if (!cartDOMElement) {
    return;
  }
    var resp1='';
    for (var i = 0; i < resp.length; i += 1) {
      resp1 += `<p>${resp[i]}</p>`;
    }
    var d = new Date();
    var n = d.toLocaleTimeString().slice(3,).replace(':', '_');
    const chek__orderDOMElement = document.createElement('div');
    const chek__orderTemplate = `
      <p class="popup__subtitle">Чек-ордер №${n}-д</p>
       ${resp1}`;
    chek__orderDOMElement.innerHTML = chek__orderTemplate;
    chek__orderDOMElement.setAttribute('data-chek__order-id', 'chek__order_id');
    // cartItemDOMElement.classList.add('js-cart-item');

    cartDOMElement.appendChild(chek__orderDOMElement);
  // };

}
//   end popup__chek__order*/

/* cart start */
;(function() {
  const cartDOMElement = document.querySelector('.js-cart');

  if (!cartDOMElement) {
    return;
  }
  const cart = JSON.parse(localStorage.getItem('cart')) || {};
  const cartItemsCounterDOMElement = document.querySelector('.js-cart-total-count-items');
  const cartTotalPriceDOMElement = document.querySelector('.js-cart-total-price');
  const cartTotalPriceInputDOMElement = document.querySelector('.js-cart-total-price-input');
  const cartWrapperDOMElement = document.querySelector('.js-cart-wrapper');

  const renderCartItem = ({ id, name, attribute, src, price, quantity }) => {
    const cartItemDOMElement = document.createElement('div');

    const attributeTemplate = attribute
      ? `<p class="cart-item__attribute">${attribute}</p><input type="hidden" name="${id}-Аттрибут" value="${attribute}">`
      : '';

    const cartItemTemplate = `
      <div class="cart-item cart__item">
        <div class="cart-item__main">
          <div class="cart-item__start">
            <button class="cart-item__btn cart-item__btn--remove js-btn-cart-item-remove" type="button"></button>
          </div>
          <div class="cart-item__img-wrapper">
            <img class="cart-item__img" src="${src}" alt="">
          </div>
          <div class="cart-item__content">
            <h3 class="cart-item__title">${name}</h3>
            <input type="hidden" name="Изделие" value="${name}">
            <input class="js-cart-input-quantity" type="hidden" name="Количество" value="${quantity}">
            <input class="js-cart-input-price" type="hidden" name="Цена" value="${price * quantity}">
            ${attributeTemplate}
          </div>
        </div>
        <div class="cart-item__end">
          <div class="cart-item__actions">
            <button class="cart-item__btn js-btn-product-decrease-quantity" type="button">-</button>
            <span class="cart-item__quantity js-cart-item-quantity">${quantity}</span>
            <button class="cart-item__btn js-btn-product-increase-quantity" type="button">+</button>
          </div>
          <p class="cart-item__price"><span class="js-cart-item-price">${price * quantity}</span> ₽</p>
        </div>
      </div>
      `;

    cartItemDOMElement.innerHTML = cartItemTemplate;
    cartItemDOMElement.setAttribute('data-product-id', id);
    cartItemDOMElement.classList.add('js-cart-item');

    cartDOMElement.appendChild(cartItemDOMElement);
  };

  const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  const updateCartTotalPrice = () => {
    const totalPrice = Object.keys(cart).reduce((acc, id) => {
      const { quantity, price } = cart[id];
      return acc + price * quantity;
    }, 0);

    if (cartTotalPriceDOMElement) {
      cartTotalPriceDOMElement.textContent = totalPrice;
    }

    if (cartTotalPriceInputDOMElement) {
      cartTotalPriceInputDOMElement.value = totalPrice;
    }
  };

  const updateCartTotalItemsCounter = () => {
    const totalQuantity = Object.keys(cart).reduce((acc, id) => {
      const { quantity } = cart[id];
      return acc + quantity;
    }, 0);

    if (cartItemsCounterDOMElement) {
      cartItemsCounterDOMElement.textContent = totalQuantity;
    }

    return totalQuantity;
  };

  const updateCart = () => {
    const totalQuantity = updateCartTotalItemsCounter();
    updateCartTotalPrice();
    saveCart();

    if (totalQuantity === 0) {
      cartWrapperDOMElement.classList.add('is-empty');
    } else {
      cartWrapperDOMElement.classList.remove('is-empty');
    }
  };

  const deleteCartItem = (id) => {
    const cartItemDOMElement = cartDOMElement.querySelector(`[data-product-id="${id}"]`);

    cartDOMElement.removeChild(cartItemDOMElement);
    delete cart[id];
    updateCart();
  };

  const addCartItem = (data) => {
    const { id } = data;

    if (cart[id]) {
      increaseQuantity(id);
      return;
    }

    cart[id] = data;
    renderCartItem(data);
    updateCart();
  };

  const updateQuantity = (id, quantity) => {
    const cartItemDOMElement = cartDOMElement.querySelector(`[data-product-id="${id}"]`);
    const cartItemQuantityDOMElement = cartItemDOMElement.querySelector('.js-cart-item-quantity');
    const cartItemPriceDOMElement = cartItemDOMElement.querySelector('.js-cart-item-price');
    const cartItemInputPriceDOMElement = cartItemDOMElement.querySelector('.js-cart-input-price');
    const cartItemInputQuantityDOMElement = cartItemDOMElement.querySelector('.js-cart-input-quantity');

    cart[id].quantity = quantity;
    cartItemQuantityDOMElement.textContent = quantity;
    cartItemPriceDOMElement.textContent = quantity * cart[id].price;
    cartItemInputPriceDOMElement.value = quantity * cart[id].price;
    cartItemInputQuantityDOMElement.value = quantity;

    updateCart();
  };

  const decreaseQuantity = (id) => {
    const newQuantity = cart[id].quantity - 1;
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };

  const increaseQuantity = (id) => {
    const newQuantity = cart[id].quantity + 1;
    updateQuantity(id, newQuantity);
  };

  const generateID = (string1, string2) => {
    const secondParam = string2 ? `-${string2}` : '';
    return `${string1}${secondParam}`.replace(/ /g, '-');
  };

  const getProductData = (productDOMElement) => {
    const description = ' ' + productDOMElement.children[1].children[1].children[0].textContent; //classList('product__content'); //getElementsByClassName('product__description');
    // console.log(description);
    const category = productDOMElement.parentElement.getAttribute('data-category')
    const name = productDOMElement.getAttribute('data-product-name');
    const attribute = productDOMElement.getAttribute('data-product-attribute')||'';
    const price = productDOMElement.getAttribute('data-product-price');
    const src = productDOMElement.getAttribute('data-product-src');
    const quantity = 1;
    const id = generateID(name, attribute);

    return { name, attribute, price, src, quantity, id, category, description};
  };

  const renderCart = () => {
    const ids = Object.keys(cart);
    ids.forEach((id) => renderCartItem(cart[id]));
  };

  const resetCart = () => {
    const ids = Object.keys(cart);
    ids.forEach((id) => deleteCartItem(cart[id].id));
  };

  const cartInit = () => {
    renderCart();
    updateCart();

    document.addEventListener('reset-cart', resetCart);

    document.querySelector('body').addEventListener('click', (e) => {
      const target = e.target;

      if (target.classList.contains('js-btn-add-to-cart')) {
        e.preventDefault();
        const productDOMElement = target.closest('.js-product');
        const data = getProductData(productDOMElement);
        addCartItem(data);
      }

      if (target.classList.contains('js-btn-cart-item-remove')) {
        e.preventDefault();
        const cartItemDOMElement = target.closest('.js-cart-item');
        const productID = cartItemDOMElement.getAttribute('data-product-id');
        deleteCartItem(productID);
      }

      if (target.classList.contains('js-btn-product-increase-quantity')) {
        e.preventDefault();
        const cartItemDOMElement = target.closest('.js-cart-item');
        const productID = cartItemDOMElement.getAttribute('data-product-id');
        increaseQuantity(productID);
      }

      if (target.classList.contains('js-btn-product-decrease-quantity')) {
        e.preventDefault();
        const cartItemDOMElement = target.closest('.js-cart-item');
        const productID = cartItemDOMElement.getAttribute('data-product-id');
        decreaseQuantity(productID);
      }

      if (target.classList.contains('js-btn-product-attribute')) {
        e.preventDefault();
        const attribute = target.getAttribute('data-product-attribute-value')||'';
        const price = target.getAttribute('data-product-attribute-price');
        const productDOMElement = target.closest('.js-product');
        const activeAttributeDOMElement = productDOMElement.querySelector('.js-btn-product-attribute.is-active');
        const productPriceDOMElement = productDOMElement.querySelector('.js-product-price-value');

        productPriceDOMElement.textContent = price;
        productDOMElement.setAttribute('data-product-attribute', attribute);
        productDOMElement.setAttribute('data-product-price', price);
        activeAttributeDOMElement.classList.remove('is-active');
        target.classList.add('is-active');
      }
    });
  };

  cartInit();
})();
//  end cart

// TG-web-app  start
function sendMessage(msg_id, with_webview) {
    if (!initDataUnsafe.query_id) {
        alert('WebViewQueryId not defined');
        return;
    }
    //if (!msg_id == '') {let msg_id_m = JSON.stringify(msg_id, null, 2);}
	let msg_id_m = JSON.stringify(msg_id);
    $.ajax('/sendMessage', {
        type: 'POST',
        data: {
            _auth: initData,
            msg_id: msg_id_m || '',
            with_webview: !initDataUnsafe.receiver && with_webview ? 1 : 0
        },
        dataType: 'json',
        success: setTimeout(function (result) {
            //$('button').prop('disabled', false);
            if (result.response) {
                if (result.response.ok) {
                    $('#btn_status').html('Message sent successfully!').addClass('ok').show();
                } else {
                    $('#btn_status').text(result.response.description).addClass('err').show();
                    alert(result.response.description);
                }
            } else {
                $('#btn_status').text('Unknown error').addClass('err').show();
                alert('Unknown error');
            }
        }, 1000),
        error: function (xhr) {
            //$('button').prop('disabled', false);
            $('#btn_status').text('Server error').addClass('err').show();
            alert('Server error');
        }
    });
}
Telegram.WebApp.ready();

const initData = Telegram.WebApp.initData || '';
const initDataUnsafe = Telegram.WebApp.initDataUnsafe || {};

function webviewExpand() {
    Telegram.WebApp.expand();
}

;(function(){

   let initDataUnsafe_JSON = JSON.stringify(initDataUnsafe, null, 2);
    if (initDataUnsafe.query_id && initData) {
        $('#webview_data_status').show();
        $.ajax('/checkData', {
            type: 'POST',
            data: {_auth: initData},
            id: initData.id,
            dataType: 'json',
            success: function (result) {
                if (result.ok) {
                    $('#webview_data_status').html('Hash is correct').addClass('ok');
                    alert('Hash is correct');

                } else {
                    alert('Unknown error');
                }
            },
            error: function (xhr) {
                    alert('No correct');
                }
        });
    }
})();

function send_data_db(obj) {
    // let formData = new FormData(Data);
    // formData.append('id', 1.466566666646464 match.random());
    // var obj = {};
    // formData.forEach( ( value,key) => {
    //   obj[key] = value;
    // });
    _json = JSON.stringify(obj);
    console.log(_json);
    // const request = new XMLHttpRequest();
    // request.open('POST', '/sendDataDB');
    // request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // request.responseType = 'json';
    // request.send(json);
    // request.addEventListener('load', (event) => {
    //     if (request.status != 200) {
    //         console.log('Проблема');
    //     }
    //     alert('Hash is correct');

    //    // console.log(request.response);
    // });
//-----------------------------------------------------------
        $.ajax('/sendDataDB', {
            type: 'POST',
            data: {_auth: initData,
              my_data: _json},
            id: initData.id,
            dataType: 'json',
            success: function (result) {
                if (result.ok) {
                    alert('Hash is correct');

                } else {
                    alert('Unknown error');
                }
            },
            error: function (xhr) {
                    alert('No correct');
                }
        });

}
