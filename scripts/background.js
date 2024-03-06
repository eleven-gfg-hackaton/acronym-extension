const apiUrl = '';

const fetchData = async () => {
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
};

const response = [
  {
    word: 'to',
    abbrFor: [
      {
        name: 'Acknowledgement',
        meaning: 'Acknowledgement'
      },
      {
        name: 'Hông Sao Lả',
        meaning: 'No problemmmm'
      }
    ]
  },
  {
    word: '404',
    abbrFor: [
      {
        name: 'Not found',
        meaning: 'hahaha'
      }
    ]
  },
];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === "contentToBackground") {
    console.log("Received message from content script:", request.data);
    // response = fetchData(request.data);
    sendResponse({ message: "backgroundToContent", data: response });
  }
});
