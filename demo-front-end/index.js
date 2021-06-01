// This is where we listen to authorized users clicking on events when they click a feature button.
// We hit the back-end in response to these.
// We re-validate authorizations in the back-end.
// See /demo-back-end
window.addEventListener('overhide-appsell-sku-clicked',(e) => { 
  console.log(`sku-clicked :: ${JSON.stringify(e.detail, null, 2)}`);
}, false);

// This event fires whenever we're asked to topup funds.
// We're using it here to show the VISA instructional helper image.
window.addEventListener('overhide-hub-pending-transaction',(e) => { 
  console.log(`pending-transaction :: ${JSON.stringify(e.detail, null, 2)}`);
  if (e.detail.currency == 'dollars') {
    document.querySelector("#visa").style.opacity = e.detail.isPending ? "1" : "0";
  }
}, false);
