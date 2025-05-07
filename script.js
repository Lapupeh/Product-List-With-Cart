'use strict';

const productsContainer =document.querySelector('.products-list');
const cartSummary = document.querySelector('.cart-summary');
const emptyCart = document.querySelector('.empty-placeholder');
const addedItems = document.querySelector('.added-items');
const totalItemsNumber = document.querySelector('.items-number')
const confirmedItems = document.querySelector('.confirmed-items')
const orderTotal = document.querySelector('.order-total-price');
const orderSummaryTotal = document.querySelector('.order-summary-price');
const confirmationModal = document.querySelector('.confirmation-modal');
const overlay = document.querySelector('.overlay');
const confirmOrderBtn = document.querySelector('.checkout-button');
const newOrderBtn = document.querySelector('.new-order')


// Initializing the add to cart
let cart = {};


// Fetch data from data.json
const fetchData = async () => { 
    try {
        const response = await fetch('./data.json');
        const fetchedData = await response.json();
        console.log(fetchedData);
        renderData(fetchedData);
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}


// Populate the DOM with the fetched data
const renderData = (data) => {
  productsContainer.innerHTML = ''; // Clear previous content
  
  data.forEach((product, index) => {
    const productElement = document.createElement('div');
    productElement.classList.add(`item-${index}`);
    productElement.innerHTML = `
    <div class="item-image-cart">
    <picture>
      <source media="(min-width: 1024px)" srcset="${product.image.desktop}">
      <source media="(min-width: 768px)" srcset="${product.image.tablet}">
      <img src="${product.image.mobile}" alt="Dessert Image" class="product-image" id="image-${index}">
    </picture>
    <button class="add-to-cart" id="add-${index}">
      <img src="./assets/images/icon-add-to-cart.svg" alt="cart-icon">
      <span>Add to cart</span>
    </button>
    <div id="controls-${index}" class="product-quantity hidden">
      <button class="decrement" data-index="${index}">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2"><path class="dec-sign" fill="#fff" d="M0 .375h10v1.25H0V.375Z"/></svg>
      </button>
      <span id="count-${index}" class="quantity-count">1</span>
      <button class="increment" data-index="${index}">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path class="inc-sign"fill="#fff" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"/></svg>
      </button>
    </div>
    </div>
    <div class="item-info">
      <p class="item-name">${product.category}</p>
      <h2>${product.name}</h2>
      <p class="item-price"">$${product.price}</p>
    </div>
    `;
    productsContainer.appendChild(productElement);
    

    //Implementing the result of clicking an add-to-cart button
    document.getElementById(`add-${index}`).addEventListener('click', () => { 
      cart[index] = {...product, quantity: 1 };
      document.getElementById(`add-${index}`).classList.add('hidden');
      document.getElementById(`controls-${index}`).classList.remove('hidden');
      document.getElementById(`image-${index}`).style.border = '2px solid #c73b0f';
      updateCartDisplay(); 
    });
    
  });

  productsContainer.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if(!button) return; // If the clicked element is not a button, do nothing

    const index = button.getAttribute('data-index');
    if(index === null) return; // If the button doesn't have a data-index, do nothing

      if(cart[index]) {
        if(button.classList.contains('increment')) {
          cart[index].quantity++;
        }
        else if(button.classList.contains('decrement')) {
          cart[index].quantity--;
          if(cart[index].quantity <= 0) {
            delete cart[index];
            document.getElementById(`add-${index}`).classList.remove('hidden');
            document.getElementById(`controls-${index}`).classList.add('hidden');
            document.getElementById(`image-${index}`).style.border = 'none';
            console.log(cart)
          }
        };
        document.getElementById(`count-${index}`).textContent = cart[index]?.quantity || 1;
        updateCartDisplay();
      }
  });
}



// Update Cart
function updateCartDisplay() {
  addedItems.classList.remove('hidden');
  addedItems.innerHTML = ''; // Clear previous content
  emptyCart.classList.add('hidden');
  

  // Update the total number of products in the cart to the CartSummary UI
  const cartLength = Object.keys(cart).length; 
  totalItemsNumber.textContent = cartLength;

  let totalPrice = 0;
  Object.entries(cart).forEach(([key, item]) => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;
    const addedItem = document.createElement('div');
    addedItem.classList.add('added-item');
    addedItem.setAttribute('data-index', key);
    addedItem.innerHTML = `
    <div class="added-item-info">
      <p>${item.name}</p>
      <div class="price-qty">
        <span class="qty">${item.quantity}x</span>
        <span class="price-per1">@${item.price}</span>
        <span class="item-total-price">$${itemTotal}</span>
      </div>
    </div>
      <button class="remove-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path class="remove-icon" fill="#CAAFA7" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/></svg>
      </button>
    `;
    addedItems.appendChild(addedItem);
  })

  if(totalPrice > 0) {
    cartSummary.classList.remove('hidden');
    orderTotal.textContent = totalPrice;
  } else {
    emptyCart.classList.remove('hidden');
    cartSummary.classList.add('hidden');
  }
}

// Implementing remove from cart button
addedItems.addEventListener('click', (e) => {
  const removeButton = e.target.closest('.remove-item');
  if(removeButton) {
    const parentItem = removeButton.closest('.added-item')
    const index = parentItem.getAttribute('data-index');

    delete cart[index];
    document.getElementById(`add-${index}`).classList.remove('hidden');
    document.getElementById(`controls-${index}`).classList.add('hidden');
    document.getElementById(`image-${index}`).style.border = 'none';
    updateCartDisplay();
  }
  
})

// Implementing the confirm order button 
function confirmOrder() {
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  
  let totalPrice = 0;
  Object.values(cart).forEach((item) => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;
    const confirmedItem = document.createElement('div');
    confirmedItem.classList.add('confirmed-item');
    confirmedItem.innerHTML = `
    <div class="item">
          <img src="${item.image.thumbnail}" alt="">
          <div class="item-information">
            <p>${item.name}</p>
            <div class="price-qty">
              <span class="qty">${item.quantity}x</span>
              <span class="price-per1">@ ${item.price}</span>
            </div>
          </div>
        </div>
        <span class="item-total-price">$${itemTotal}</span>`

      confirmedItems.insertBefore(confirmedItem, confirmedItems.firstChild);
      orderSummaryTotal.textContent = totalPrice;
  });

}
confirmOrderBtn.addEventListener('click', confirmOrder);

// Implementing new order button 
function newOrder() {
  document.body.style.overflow = '';
  document.body.scrollIntoView({behavior: "smooth"});
  const items = confirmedItems.querySelectorAll('.confirmed-item');
  items.forEach(item => item.remove());
  const allQuantityCounts = document.querySelectorAll('.products-list .quantity-count');
  allQuantityCounts.forEach(count => count.textContent = 1);
  overlay.classList.add('hidden');
  Object.entries(cart).forEach(([key]) => {
    document.getElementById(`add-${key}`).classList.remove('hidden');
    document.getElementById(`controls-${key}`).classList.add('hidden');
    document.getElementById(`image-${key}`).style.border = 'none';
  });

  Object.keys(cart).forEach(key => delete cart[key]);
  updateCartDisplay();
}
newOrderBtn.addEventListener('click', newOrder);


fetchData();