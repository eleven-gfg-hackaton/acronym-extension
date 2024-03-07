async function fetchData(text) {
  const url = 'https://us-central1-gfg-hackathon2-team-11.cloudfunctions.net/nodejs-http-function';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({text: text})
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Error:', error);
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('chrome.runtime.onMessage.addListener', request);

  if (request.message === "requestAcronymDetection") {
    sendResponse(true);  // ensureTrueIsReturned
    if (request.data) {
      fetchData(request.data)
        .then((data) => {
          console.log('fetchData', data);
          chrome.tabs.sendMessage(sender.tab.id, {action: 'apiEventTriggered', data: data});
        })
        .catch(error => console.error('chrome.runtime.onMessage.addListener' + error));
    }
    return true;
  }
});

