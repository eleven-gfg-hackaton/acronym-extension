console.log('background.js loaded');

//https://developer.chrome.com/docs/extensions/get-started/tutorial/scripts-activetab

const apiUrl = '';
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
    sendResponse({ message: "backgroundToContent", data: response });
  }
});
