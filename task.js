const cartProductsElement = document.querySelector('.cart__products');

document.querySelectorAll('.product__quantity-control_dec, .product__quantity-control_inc')
    .forEach(el => el.addEventListener('click', onClickQuantityControl));

document.querySelectorAll('.product__add').forEach(el => el.addEventListener('click', onClickAddProduct));

localStorage_RestoreProducts();

function onClickQuantityControl() {
    const quantityElement = this.closest('.product__quantity-controls').querySelector('.product__quantity-value');

    if (this.classList.contains('product__quantity-control_dec')) {
        quantityElement.innerText = Math.max(1, quantityElement.innerText - 1);
    } else {
        if (this.classList.contains('product__quantity-control_inc')) {
            quantityElement.innerText++;
        }
    }
}

function onClickAddProduct() {
    const productElement = this.closest('.product');
    const id = productElement.dataset.id;
    const src = productElement.querySelector('.product__image').getAttribute('src');
    let quantity = Number(productElement.querySelector('.product__quantity-value').innerText);

    let productInCartElement = cartProductsElement.querySelector(`[data-id="${id}"]`);
    if (productInCartElement) {
        quantity += Number(productInCartElement.querySelector('.cart__product-count').innerText);
        productInCartElement.querySelector('.cart__product-count').innerText = quantity;
    } else {
        productInCartElement = insertCartProductHTML(id, quantity, src);
        setCartVisibleProperty();
    }

    localStorage_SaveProduct(id, quantity, src);
    moveProductToCart(productElement, productInCartElement);
}

function moveProductToCart(productElement, productInCartElement) {
    const src = productElement.querySelector('.product__image').getAttribute('src');

    // ++Create new element copy of picture
    const movedProductElement = document.createElement('div');
    movedProductElement.className = 'moved__product';
    const movedProductImgElement = document.createElement('img');
    movedProductImgElement.src = src;
    movedProductImgElement.className = 'cart__product-image';
    movedProductElement.insertAdjacentElement('afterbegin', movedProductImgElement);
    document.body.insertBefore(movedProductElement, null);
    // --Create new element copy of picture

    let counter = 100;

    let ClientRect = productElement.querySelector('.product__image').getBoundingClientRect();
    const positionStart = {top: ClientRect.top, left: ClientRect.left};
    movedProductElement.style.top = positionStart.top + 'px';
    movedProductElement.style.left = positionStart.left + 'px';

    ClientRect = productInCartElement.getBoundingClientRect();
    const positionEnd = {top: ClientRect.top, left: ClientRect.left};

    const step = {
        top: (positionEnd.top - positionStart.top) / counter,
        left: (positionEnd.left - positionStart.left) / counter
    };

    let intervalId = setInterval(() => {
        const {top, left} = movedProductElement.getBoundingClientRect();
        movedProductElement.style.top = (top + step.top) + 'px';
        movedProductElement.style.left = (left + step.left) + 'px';
        counter--;
        if (counter <= 0) {
            clearInterval(intervalId);
            movedProductElement.remove();
        };

    }, 1, movedProductElement, step, counter);
}

function onClickRemoveProduct() {
    const element = this.closest('.cart__product');
    localStorage_SaveProduct(element.dataset.id, 0);
    element.remove();
    setCartVisibleProperty();
}

function insertCartProductHTML(id, quantity, src) {
    cartProductsElement.insertAdjacentHTML(
        'beforeend', `
            <div class="cart__product" data-id="${id}">
                <img class="cart__product-image" src="${src}">
                <div class="cart__product-count">${quantity}</div>
                <div class="cart__product-remove">
                    Удалить
                </div>
            </div>`
    );

    const productInCartElement = cartProductsElement.lastElementChild.querySelector('.cart__product-remove');
    productInCartElement.onclick = onClickRemoveProduct;
    return productInCartElement;
}

function setCartVisibleProperty() {
    const cartElement = document.querySelector('.cart');

    if (cartElement.querySelector('.cart__product')) {
        cartElement.classList.add('cart_active')
    }
    else {
        cartElement.classList.remove('cart_active')
    }
}

function localStorage_RestoreProducts() {
    const cartProductsStorage = JSON.parse(localStorage.getItem('cartProducts'));
    if (!cartProductsStorage) return;

    for(key in cartProductsStorage) {
        insertCartProductHTML(key, cartProductsStorage[key].quantity, cartProductsStorage[key].src);
    }

    setCartVisibleProperty();
}

function localStorage_SaveProduct(id, quantity, src='') {
    let cartProductsStorage = JSON.parse(localStorage.getItem('cartProducts'));
    if (!cartProductsStorage) cartProductsStorage = new Object();

    if (quantity === 0) {
        delete cartProductsStorage[id];
    }
    else {
        cartProductsStorage[id] = {quantity: quantity, src: src};
    }

    localStorage.setItem('cartProducts', JSON.stringify(cartProductsStorage));
}
