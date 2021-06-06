// This is where we listen to authorized users clicking on events when they click a feature button.
// We hit the back-end in response to these.
// We re-validate authorizations in the back-end.
// See /demo-back-end
window.addEventListener('overhide-appsell-sku-clicked',(e) => { 
  console.log(`sku-clicked :: ${JSON.stringify(e.detail, null, 2)}`);
  let message = null;

  switch (e.detail.sku) {
    case 'free-feature':
      message = `${new Date()} &mdash; <b>free</b> feature used`;
      break;
    case 'paid-feature':
      message = `${new Date()} &mdash; <b>paid</b> feature used`;
      break;
    case 'subscribed-feature':
      message = `${new Date()} &mdash; <b>subscribed</b> feature used`;
      break;
  }

  const messages = document.querySelector('#messages').innerHTML;
  const newMessage = `<div class="w3-panel w3-pale-green w3-display-container"><span onclick="this.parentElement.style.display='none'"
  class="w3-button w3-display-topright">X</span><p>${message}</p></div>` + messages;
  document.querySelector('#messages').innerHTML = newMessage;
}, false);

// This event fires whenever we're asked to topup funds.
// We're using it here to show the VISA instructional helper image.
window.addEventListener('overhide-hub-pending-transaction',(e) => { 
  console.log(`pending-transaction :: ${JSON.stringify(e.detail, null, 2)}`);
  if (e.detail.currency == 'dollars') {
    document.querySelector("#visa").style.opacity = e.detail.isPending ? "1" : "0";
  }
}, false);


