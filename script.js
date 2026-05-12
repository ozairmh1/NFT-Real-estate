// --- 1. GLOBAL STATE AND CONSTANTS ---
const properties = [
    {
        id: 1,
        name: "Banjara Hills Villa",
        locality: "Banjara hills",
        type: "Residential Villa",
        totalValue: 20000,
        tokensTotal: 20000,
        tokensSold: 5000,
        size: "3500 Sqyd",
        floors: 3,
        images: [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        imagePlaceholder: "Villa"
    },
    {
        id: 2,
        name: "Attapur Venue Hall",
        locality: "Attapur",
        type: "Commercial Hall",
        totalValue: 15000,
        tokensTotal: 15000,
        tokensSold: 10000,
        size: "10000 Sqyd",
        floors: 1,
        images: [
            "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1549492423-400259a212ce?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        imagePlaceholder: "Venue Hall"
    },
    {
        id: 3,
        name: "Saidabad Commercial Shop",
        locality: "Saidabad",
        type: "Commercial Retail",
        totalValue: 10000,
        tokensTotal: 10000,
        tokensSold: 800,
        size: "1000 Sqyd",
        floors: 1,
        images: [
            "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        imagePlaceholder: "Shop"
    }
];
let currentProperty = null;
let users = [];
let loggedInUser = null;

const dummyTransactions = [
    { 
        id: 'TXN-9a8c12b4', 
        tokenNumber: 'PROP-1-0015', 
        property: 'Banjara Hills Villa', 
        ownerWallet: '0x1A2b...C3d4', 
        percentageOwned: '1.5%',
        status: 'Confirmed on Ethereum' 
    },
    { 
        id: 'TXN-f3e76d05', 
        tokenNumber: 'PROP-2-0501', 
        property: 'Attapur Venue Hall', 
        ownerWallet: '0x5E6f...D7g8', 
        percentageOwned: '5.0%',
        status: 'Confirmed on Polygon' 
    },
];

// --- 2. UI NAVIGATION ---

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    const page = document.getElementById(pageId);
    if (!page) return;

    if (pageId === 'listing-page') {
        page.style.display = 'grid';
        renderProperties(properties);
    } else if (pageId === 'login-page' || pageId === 'signup-page') {
        page.style.display = 'flex';
    } else {
        page.style.display = 'block';
    }
}

// --- 3. AUTHENTICATION ---

function handleSignUp(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (users.find(user => user.email === email)) {
        alert('User with this email already exists!');
        return;
    }

    users.push({ name, email, password, wallet: { tokens: 0, usd: 0, orders: 0, profit: 0, investments: [] } });
    alert('Sign up successful! Please log in.');
    showPage('login-page');
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        loggedInUser = user;
        updateUIVisibility();
        updateWalletInfo();
        showPage('user-wallet-page');
    } else {
        alert('Invalid email or password.');
    }
}

function handleLogout() {
    loggedInUser = null;
    updateUIVisibility();
    showPage('login-page');
}

function updateUIVisibility() {
    const authButtons = document.getElementById('auth-buttons');
    const userPfp = document.getElementById('user-pfp');
    const navUserWallet = document.getElementById('nav-user-wallet');

    if (loggedInUser) {
        authButtons.style.display = 'none';
        userPfp.style.display = 'block';
        navUserWallet.style.display = 'block';
    } else {
        authButtons.style.display = 'flex';
        userPfp.style.display = 'none';
        navUserWallet.style.display = 'none';
    }
}


// --- 4. PROPERTY LISTING AND FILTERING ---

function renderProperties(propertiesToRender) {
    const grid = document.getElementById('property-grid');
    grid.innerHTML = '';

    if (propertiesToRender.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #ccc;">No properties match your current filters.</p>';
        return;
    }

    propertiesToRender.forEach(property => {
        const percentageSold = ((property.tokensSold / property.tokensTotal) * 100).toFixed(2);
        const tokensAvailable = property.tokensTotal - property.tokensSold;
        const cardHTML = `
            <div class="property-card fade-in-up" style="animation-delay: ${property.id * 0.1}s;">
                <div class="property-image">
                    <i class="fas fa-house-damage"></i> ${property.imagePlaceholder}
                </div>
                <div class="property-info">
                    <h3>${property.name}</h3>
                    <span class="price-tag">$${property.totalValue.toLocaleString()}</span>
                    <p>${property.locality} | ${property.type}</p>
                    <div class="availability-bar">
                        <div class="sold-progress" style="width: ${percentageSold}%;"></div>
                    </div>
                    <div class="availability-text">
                        <span>**${percentageSold}% Sold**</span>
                        <span>${tokensAvailable.toLocaleString()} Tokens Available</span>
                    </div>
                    <div class="tokens-info">
                        Total Tokens: ${property.tokensTotal.toLocaleString()}
                    </div>
                    <button class="btn btn-primary purchase-btn" data-property-id="${property.id}">
                        Purchase Minimum 1%
                    </button>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });
    
    document.querySelectorAll('.purchase-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const propertyId = e.target.getAttribute('data-property-id');
            showPurchasePage(parseInt(propertyId));
        });
    });
}

function applyFilters() {
    const localityFilter = document.getElementById('locality-filter').value;
    const priceFilter = parseInt(document.getElementById('price-range-filter').value);
    const tokensMinFilter = parseInt(document.getElementById('tokens-min-filter').value) || 0;

    const filtered = properties.filter(property => {
        const localityMatch = localityFilter === 'all' || property.locality === localityFilter;
        const priceMatch = property.totalValue <= priceFilter;
        const tokensAvailable = property.tokensTotal - property.tokensSold;
        const tokensMatch = tokensAvailable >= tokensMinFilter;
        return localityMatch && priceMatch && tokensMatch;
    });

    renderProperties(filtered);
}

function resetFilters() {
    document.getElementById('locality-filter').value = 'all';
    const maxPrice = properties.reduce((max, p) => Math.max(max, p.totalValue), 0);
    document.getElementById('price-range-filter').value = maxPrice;
    document.getElementById('tokens-min-filter').value = '';
    updatePriceLabel(maxPrice);
    applyFilters();
}

function updatePriceLabel(value) {
    document.getElementById('price-value').textContent = `$10,000 - $${parseInt(value).toLocaleString()}+`;
}

// --- 5. PURCHASE PAGE ---

function showPurchasePage(propertyId) {
    currentProperty = properties.find(p => p.id === propertyId);
    if (!currentProperty) return;

    showPage('purchase-page');
    resetPaymentForm();
    
    if(loggedInUser) {
        document.getElementById('wallet-balance-display').textContent = `$${loggedInUser.wallet.usd.toFixed(2)}`;
    }

    const tokensAvailable = currentProperty.tokensTotal - currentProperty.tokensSold;
    document.querySelectorAll('.token-slider').forEach(slider => {
        slider.max = tokensAvailable;
    });
    
    document.querySelectorAll('.payment-details span').forEach(span => {
        if (span.id.endsWith('-token-amount-display')) {
            span.textContent = `0 / ${tokensAvailable} Tokens`;
        }
    });


    document.getElementById('main-property-image').src = currentProperty.images[0];
    const thumbnailsContainer = document.querySelector('.thumbnail-images');
    thumbnailsContainer.innerHTML = '';
    currentProperty.images.forEach((imgSrc, index) => {
        const thumb = document.createElement('img');
        thumb.src = imgSrc;
        thumb.alt = `Thumbnail ${index + 1}`;
        thumb.classList.add('thumbnail');
        if (index === 0) thumb.classList.add('active');
        
        const newThumb = thumb.cloneNode(true);
        newThumb.addEventListener('click', () => changeImage(imgSrc));
        thumbnailsContainer.appendChild(newThumb);
    });

    const detailsContainer = document.getElementById('property-details-content');
    detailsContainer.innerHTML = `
        <h2>${currentProperty.name}</h2>
        <span class="price-tag">Total Value: $${currentProperty.totalValue.toLocaleString()}</span>
        <p><strong><i class="fas fa-map-marker-alt"></i> Location:</strong> ${currentProperty.locality}</p>
        <p><strong><i class="fas fa-building"></i> Type:</strong> ${currentProperty.type}</p>
        <p><strong><i class="fas fa-ruler-combined"></i> Size:</strong> ${currentProperty.size}</p>
        <p><strong><i class="fas fa-layer-group"></i> Floors:</strong> ${currentProperty.floors}</p>
    `;
}

function changeImage(newImageSrc) {
    document.getElementById('main-property-image').src = newImageSrc;
    document.querySelectorAll('.thumbnail-images img').forEach(thumb => {
        thumb.classList.toggle('active', thumb.src === newImageSrc);
    });
}

function resetPaymentForm() {
    document.querySelectorAll('input[name="payment"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('.payment-details').forEach(detail => detail.style.display = 'none');
    document.querySelectorAll('.payment-details input[type="text"], .payment-details input[type="number"]').forEach(input => input.value = '');
    
    document.querySelectorAll('.token-slider').forEach(slider => {
        slider.value = 0;
    });
    document.querySelectorAll('.payment-details span').forEach(span => {
        if (span.id.includes('token-amount-display')) {
            span.textContent = '0 Tokens';
        }
    });

    const starknetSlider = document.querySelector('.starknet-slider');
    if (starknetSlider) {
        starknetSlider.value = 0;
        document.getElementById('starknet-amount').textContent = '0 StarkNet';
    }

    document.getElementById('usd-to-pay').textContent = '$0.00';
}


function updateTokenPurchase(method, amount) {
    if (!currentProperty) return;

    const tokenPrice = currentProperty.totalValue / currentProperty.tokensTotal;
    let totalUSD = 0;
    
    if (method === 'nft') {
        const starknetValue = 0.25;
        totalUSD = amount * starknetValue;
        document.getElementById('starknet-amount').textContent = `${amount} StarkNet`;
    } else { // For wallet, upi, card
        totalUSD = amount * tokenPrice;
        if (document.getElementById(`${method}-token-amount-display`)) {
            document.getElementById(`${method}-token-amount-display`).textContent = `${amount} Tokens`;
        }
    }

    document.getElementById('usd-to-pay').textContent = `$${totalUSD.toFixed(2)}`;
}

function handlePurchase() {
    if (!loggedInUser || !currentProperty) {
        alert('Please log in to make a purchase.');
        return;
    }

    const selectedPaymentMethod = document.querySelector('input[name="payment"]:checked');
    if (!selectedPaymentMethod) {
        alert('Please select a payment method.');
        return;
    }

    const paymentMethod = selectedPaymentMethod.value;
    const tokenPrice = currentProperty.totalValue / currentProperty.tokensTotal;
    let tokensToPurchase = 0;
    let costInUSD = 0;

    let sliderId = `${paymentMethod}-token-slider`;
    if(paymentMethod === 'wallet') sliderId = 'wallet-token-slider';
    else if (paymentMethod === 'nft') sliderId = 'starknet-slider';


    tokensToPurchase = parseFloat(document.getElementById(sliderId).value);

    if (isNaN(tokensToPurchase) || tokensToPurchase <= 0) {
        alert('Please select a valid number of tokens.');
        return;
    }
    costInUSD = tokensToPurchase * tokenPrice;

    if (paymentMethod === 'wallet') {
        if (loggedInUser.wallet.usd < costInUSD) {
            alert('Insufficient balance.');
            return;
        }

        loggedInUser.wallet.usd -= costInUSD;
    }

    loggedInUser.wallet.tokens += tokensToPurchase;
    loggedInUser.wallet.orders += 1;
    if (!loggedInUser.wallet.investments.includes(currentProperty.name)) {
        loggedInUser.wallet.investments.push(currentProperty.name);
    }

    alert('Purchase successful!');
    updateWalletInfo();
    showPage('user-wallet-page');
}


// --- 6. USER WALLET ---

function updateWalletInfo() {
    if (!loggedInUser) return;
    document.getElementById('wallet-tokens').textContent = `${loggedInUser.wallet.tokens.toFixed(2)} TKN`;
    document.getElementById('wallet-usd').textContent = `$${loggedInUser.wallet.usd.toFixed(2)}`;
    document.getElementById('wallet-orders').textContent = `${loggedInUser.wallet.orders} Orders`;
    document.getElementById('wallet-profit').textContent = `$${loggedInUser.wallet.profit.toFixed(2)}`;
    
    const investmentsP = document.getElementById('wallet-investments');
    if (loggedInUser.wallet.investments.length === 0) {
        investmentsP.textContent = 'Not invested yet';
    } else {
        investmentsP.textContent = loggedInUser.wallet.investments.join(', ');
    }
}

function handleAddFunds(event) {
    event.preventDefault();
    const amount = parseFloat(document.getElementById('add-funds-amount').value);

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    loggedInUser.wallet.usd += amount;
    updateWalletInfo();
    document.getElementById('add-funds-modal').style.display = 'none';
}


// --- 7. TOKEN VERIFICATION ---

function verifyToken() {
    const input = document.getElementById('verification-input').value.trim();
    const resultBox = document.getElementById('verification-result');
    resultBox.innerHTML = '';

    if (!input) {
        resultBox.innerHTML = '<p style="color: #ff8c00;">Please enter a Transaction ID or Token Number.</p>';
        return;
    }

    const transaction = dummyTransactions.find(t => t.id === input || t.tokenNumber === input);

    if (transaction) {
        resultBox.innerHTML = `
            <p style="color: var(--color-gold); font-weight: 700;">✅ Token Verification Successful</p>
            <p><strong>Verification Status:</strong> ${transaction.status}</p>
            <p><strong>Property:</strong> ${transaction.property}</p>
            <p><strong>Owner Wallet:</strong> ${transaction.ownerWallet}</p>
            <p><strong>Percentage Owned:</strong> ${transaction.percentageOwned}</p>
            <p style="font-size: 0.85rem; margin-top: 10px;">Unique ID: ${transaction.id}</p>
        `;
    } else {
        resultBox.innerHTML = `
            <p style="color: #ff6347; font-weight: 700;">❌ Verification Failed</p>
            <p>The entered ID/Token does not match any record on our ledger or is invalid.</p>
        `;
    }
}

// --- 8. INITIALIZATION ---

function init() {
    // Attach event listeners
    document.getElementById('signup-form').addEventListener('submit', handleSignUp);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    document.getElementById('create-account-link').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('signup-page');
    });
    document.getElementById('login-link').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('login-page');
    });
    
    document.getElementById('login-btn').addEventListener('click', () => showPage('login-page'));
    document.getElementById('signup-btn').addEventListener('click', () => showPage('signup-page'));
    document.getElementById('explore-properties-btn').addEventListener('click', () => showPage('listing-page'));
    document.getElementById('reset-filters-btn').addEventListener('click', resetFilters);
    document.getElementById('verify-token-btn').addEventListener('click', verifyToken);
    document.getElementById('back-to-listings-btn').addEventListener('click', () => showPage('listing-page'));

    document.getElementById('locality-filter').addEventListener('change', applyFilters);
    document.getElementById('price-range-filter').addEventListener('input', () => {
        updatePriceLabel(document.getElementById('price-range-filter').value);
        applyFilters();
    });
    document.getElementById('tokens-min-filter').addEventListener('input', applyFilters);

    document.getElementById('nav-properties').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('listing-page');
    });
    document.getElementById('nav-user-wallet').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('user-wallet-page');
    });

    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', (event) => {
            document.querySelectorAll('.payment-details').forEach(detail => detail.style.display = 'none');
            const selectedPayment = event.target.value;
            document.getElementById(`${selectedPayment}-details`).style.display = 'block';
        });
    });
    
    document.getElementById('starknet-slider').addEventListener('input', (e) => updateTokenPurchase('nft', e.target.value));
    document.getElementById('wallet-token-slider').addEventListener('input', (e) => updateTokenPurchase('wallet', e.target.value));
    document.getElementById('upi-token-slider').addEventListener('input', (e) => updateTokenPurchase('upi', e.target.value));
    document.getElementById('debit-card-token-slider').addEventListener('input', (e) => updateTokenPurchase('debit-card', e.target.value));
    document.getElementById('credit-card-token-slider').addEventListener('input', (e) => updateTokenPurchase('credit-card', e.target.value));
    document.getElementById('finalize-purchase-btn').addEventListener('click', handlePurchase);

    // Add Funds Modal Listeners
    document.getElementById('add-funds-btn').addEventListener('click', () => {
        document.getElementById('add-funds-modal').style.display = 'flex';
    });
    document.getElementById('close-modal-btn').addEventListener('click', () => {
        document.getElementById('add-funds-modal').style.display = 'none';
    });
    document.getElementById('add-funds-form').addEventListener('submit', handleAddFunds);


    // Set initial state
    const maxPrice = properties.reduce((max, p) => Math.max(max, p.totalValue), 0);
    const priceRangeFilter = document.getElementById('price-range-filter');
    priceRangeFilter.max = maxPrice;
    priceRangeFilter.value = maxPrice;
    updatePriceLabel(maxPrice);

    // Show login page by default
    showPage('login-page');
    // But also render the properties in the background so they are ready
    renderProperties(properties);
}

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
