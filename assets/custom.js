
document.addEventListener('DOMContentLoaded', function () {
  const currencyRate = parseFloat(window.Shopify.currency.rate)
  const shippingThreshold = 100

  function updateProgress(currentValue, maxValue) {
    const progressFill = document.getElementById('progress-fill');
    const remainingAmount = document.getElementById('remaining-amount');
    const achievementMsg = document.getElementById('achievement-msg');
    const shippingText = document.querySelector('.shipping-text');

    if(!progressFill) return
      
    // Update CSS variables
    document.documentElement.style.setProperty('--current-value', currentValue);
    document.documentElement.style.setProperty('--max-value', maxValue);
    
    // Calculate percentage
    const percentage = Math.min((currentValue / maxValue) * 100, 100);
    
    const remaining = Math.max(maxValue - currentValue, 0);
    console.log("remaining", remaining.toFixed(2))
    remainingAmount.textContent = remaining.toFixed(2);
    
    // Update progress bar
    progressFill.style.width = percentage + '%';
    
    // Check if free shipping is achieved
    if (currentValue >= maxValue) {
        progressFill.classList.add('free-shipping-achieved');
        achievementMsg.classList.add('show');
        shippingText.style.display = 'none';
    } else {
        progressFill.classList.remove('free-shipping-achieved');
        achievementMsg.classList.remove('show');
        shippingText.style.display = 'block';
        //shippingText.style.display = 'none';

    }
  }

  async function updateBar() {
    const res = await fetch('/cart.js')
    const data = await res.json()
    console.log("cart data", data.items)
    const totalPrice = data.total_price / 100
    updateProgress(totalPrice, shippingThreshold * currencyRate)
  }

  updateBar()

  document.addEventListener('cart:update', async function () {
    setTimeout(() => {
      updateBar()
    }, 300)
  })
})

document.addEventListener('filter:update', function (event) {
  setTimeout(() => {
    const details = document.querySelector('sorting-filter-component details')
    details.removeAttribute('open')
  }, 300)
})