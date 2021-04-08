const subscribeButton = document.getElementById('subscribeButton');
const unsubscribeButton = document.getElementById('unsubscribeButton');

const factOutput = document.getElementById('fact');
const jokeOutput = document.getElementById('joke');

if ("serviceWorker" in navigator) {
  try {
	checkSubscription();
    init();
  } catch (e) {
    console.error('error init(): ' + e);
  }

  subscribeButton.addEventListener('click', () => {
	  subscribe().catch(e => {
		  if (Notification.permission === 'denied') {
	         console.warn('Permission for notifications was denied');
	      } else {
	    	 console.error('error subscribe(): ' + e);
	      }   
	  });
  });

  unsubscribeButton.addEventListener('click', () => {
	unsubscribe().catch(e => console.error('error unsubscribe(): ' + e)); 
  });
}


async function checkSubscription() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
// var data = JSON.stringify({"endpoint": subscription.endpoint});

let student = {
  endpoint: subscription.endpoint
};

let json = JSON.stringify(student);

console.log("data", json)
    const response = await fetch("http://34.93.112.43:8080/isSubscribed", {
      method: 'POST',
      body: json,
      dataType: "json",
      headers: {
        'Accept': "application/json",
        "Access-Control-Allow-Origin":"*",
        'Content-Type': "application/json; charset=utf-8"
    }
    })
    .then(response => response.json()) 
    .then(json =>  {return json})
    .catch(err => console.log(err));

    const subscribed = await response;
    // console.log('subscribed', subscribed);

    if (subscribed) {
      subscribeButton.disabled = true;
      unsubscribeButton.disabled = false;
    }

    return subscribed;
  }

  return false;
}

async function init() {
   await fetch('http://34.93.112.43:8080/publicSigningKey')
     .then(response => response.arrayBuffer())
     .then(key => this.publicSigningKey = key)
     .finally(() => console.info('Application Server Public Key fetched from the server'));

  await navigator.serviceWorker.register("sw2.js", {
    scope: "/"
  });

  await navigator.serviceWorker.ready;
  console.info('Service Worker has been installed and is ready');
  navigator.serviceWorker.addEventListener('message', event => displayLastMessages());

  displayLastMessages();
}

function displayLastMessages() {
  caches.open('data').then(dataCache => {
    dataCache.match('fact')
      .then(response => response ? response.text() : '')
      .then(txt => factOutput.innerText = txt);
    
    dataCache.match('joke')
	  .then(response => response ? response.text() : '')
	  .then(txt => jokeOutput.innerText = txt);    
  });
}

async function unsubscribe() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    const successful = await subscription.unsubscribe();
    if (successful) {
      console.info('Unsubscription successful');

      await fetch("http://34.93.112.43:8080/unsubscribe", {
        method: 'POST',
        body: JSON.stringify({endpoint: subscription.endpoint})
        // headers: {
        //   "content-type": "application/json"
        // }
      });

      console.info('Unsubscription info sent to the server');

      subscribeButton.disabled = false;
      unsubscribeButton.disabled = true;
    }
    else {
      console.error('Unsubscription failed');
    }
  }
}

async function subscribe() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: this.publicSigningKey
  });

  console.info(`Subscribed to Push Service: ${subscription.endpoint}`);
  

  // await fetch("http://34.93.112.43:8080/subscribe", {
  //   method: 'POST',
  //   body: JSON.stringify(subscription),
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Access-Control-Allow-Headers": "http://34.93.112.43:8080"
  //   }
  // });

  var ipaddress;
        $.getJSON('https://api.ipify.org?format=jsonp&callback=?', function(data) {
			const values = Array
    .from(document.querySelectorAll('input[type="checkbox"]'))
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
    var credentials = JSON.parse(JSON.stringify(subscription));
    console.log('subscription', credentials);

	  var formData = {
                'selectedValues': values,
                'ipAddress': data.ip,
                'url': subscription.endpoint,
                'expirationTime':subscription.expirationTime,
                'keys': JSON.parse(JSON.stringify(subscription)).keys
                    };
                    console.log(JSON.stringify(formData));

                    $.ajax({
                        url: "http://34.93.112.43:8080/createSubscription",
                        type: "post",
                        data: JSON.stringify(formData),
                          headers: {
                            'Accept': "application/json",
                            'Content-Type': "application/json; charset=utf-8"
                          },
                        success: function(d) {
                            console.log(d);
                            localStorage.setItem('susbscribeStatus', 'subscribed');
                        }
                    });
          });
	

  console.info('Subscription info sent to the server');

  // subscribeButton.disabled = true;
  // unsubscribeButton.disabled = false;
}
