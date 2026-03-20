const scriptURL = 'https://script.google.com/macros/s/AKfycbwmgxEuCJjT9Klqqd0oY2i7DNAyazybjDz7CKX4mq4SnEyJesAgU3EiBxsLipWFpGMTWg/exec';

let cart = [];

function changeLocalQty(id, n) {
    let el = document.getElementById(id);
    let current = parseInt(el.innerText);
    el.innerText = Math.max(1, current + n);
}

function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('open');
}

function addToCart(name, price, qtyId) {
    let quantityToAdd = parseInt(document.getElementById(qtyId).innerText);
    const existing = cart.find(i => i.name === name);
    if (existing) { existing.qty += quantityToAdd; } 
    else { cart.push({ name, price, qty: quantityToAdd }); }
    document.getElementById(qtyId).innerText = "1";
    updateCartUI();
    if (!document.getElementById('cart-drawer').classList.contains('open')) toggleCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById('cart-items-list');
    const count = document.getElementById('cart-count');
    list.innerHTML = "";
    let subtotal = 0;
    let totalQty = 0;

    cart.forEach((item, index) => {
        subtotal += item.price * item.qty;
        totalQty += item.qty;
        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
                <div><strong>${item.name}</strong><br>Rs ${item.price} x ${item.qty}</div>
                <button onclick="removeFromCart(${index})" style="color:red; border:none; background:none; cursor:pointer;">Remove</button>
            </div>`;
    });

    count.innerText = totalQty;
    document.getElementById('cart-subtotal').innerText = subtotal;
    document.getElementById('cart-grand-total').innerText = subtotal > 0 ? subtotal + 40 : 0;
}

function openCheckout() {
    if (cart.length === 0) return alert("Your cart is empty!");
    toggleCart();
    document.getElementById('checkout-view').style.display = 'flex';
}

function closeCheckout() {
    document.getElementById('checkout-view').style.display = 'none';
}

async function finalizeOrder() {
    const submitBtn = document.getElementById('submitBtn');
    const orderData = {
        name: document.getElementById('custName').value,
        phone: document.getElementById('custPhone').value,
        mail: document.getElementById('custMail').value,
        hno: document.getElementById('addHno').value,
        street: document.getElementById('addStreet').value,
        city: document.getElementById('addCity').value,
        mandal: document.getElementById('addMandal').value,
        district: document.getElementById('addDist').value,
        state: document.getElementById('addState').value,
        pin: document.getElementById('addPin').value,
        landmark: document.getElementById('addLandmark').value,
        orderItems: cart.map(i => `${i.name} (x${i.qty})`).join(", "),
        quantity: cart.reduce((acc, i) => acc + i.qty, 0),
        grandTotal: document.getElementById('cart-grand-total').innerText
    };

    if (!orderData.name || !orderData.phone || !orderData.pin) return alert("Please fill Name, Phone, and Pincode.");

    submitBtn.innerText = "Saving to Sheet...";
    submitBtn.disabled = true;

    try {
        const params = new URLSearchParams(orderData);
        await fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });
    } catch (e) { console.error("Sheet Error:", e); }

    const address = `${orderData.hno}, ${orderData.street}, ${orderData.city}, ${orderData.pin} (${orderData.landmark})`;
    const waMsg = `*BEES ERTH ORDER*%0A%0A*Items:* ${orderData.orderItems}%0A*Total:* Rs ${orderData.grandTotal}%0A%0A*Delivery:* ${encodeURIComponent(address)}`;
    
    window.open(`https://wa.me/918375003180?text=${waMsg}`, '_blank');
    
    submitBtn.innerText = "Place Order via WhatsApp";
    submitBtn.disabled = false;
    cart = []; updateCartUI(); closeCheckout();
}