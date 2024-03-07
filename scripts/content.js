const getAllText = () => {
  return document.getElementsByTagName('body')[0].innerText;
};
const sendTextToBackground = (text) => {
  chrome.runtime.sendMessage({message: "requestAcronymDetection", data: text}, function (response) {
  });
}

chrome.storage.local.get(['enabledAcr'], function (result) {
  console.log('getsetting', result);
  if (result.enabledAcr === false) {
    return;
  }

  sendTextToBackground(getAllText());
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('content.js received message:', request)
  if (request.type === 'acrEnableSettingChange') {
    // Modify content script behavior based on the new enabled state
    console.log(`Extension state changed to: ${request.enabled}`);
    if (request.enabled === false) {
      return;
    }

    sendTextToBackground(getAllText());
  }
});

// End get text and send to background.js
// Start handle the response from the API
var responseAcr = {};
const findMatches = (responseData) => {
  const acronyms = responseData.map((item) => item.acronym);

  let xpath = "//*[text()[";
  for (let i = 0; i < acronyms.length; i++) {
    xpath += `contains(., "${acronyms[i]}") or `;
  }

  xpath = xpath.slice(0, -4) + "]]"; // Remove the trailing " or "

  const contextNode = document.body;
  const result = document.evaluate(xpath, contextNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  const matches = result.snapshotLength;

  for (let i = 0; i < matches; i++) {
    acronyms.forEach((acronym) => {
      wrapMatches(result.snapshotItem(i), acronym);
    });
  }
}

//Function to wrap matched acronyms in a span
const wrapMatches = (element, acronym) => {
  // regex to match the acronym and ignore the acronym in the tags
  const regex = new RegExp(`\\b${acronym}\\b(?![^<]*>|[^<>]*<\\s*\\/\\s*[^>]+>)`, 'gi');

  element.innerHTML = element.innerHTML.replace(regex, `<span class="acr-highlight">${acronym}</span>`);
}

//add event listener to close the popup
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('acr-close-popup')) {
    const popup = document.querySelector('.acr-popup');
    popup.className = 'acr-popup';
  }
});

function bindingArcHighlightEvents() {
// add event listener to show the meaning of the acronym when clicked
  var arcElements = document.getElementsByClassName('acr-highlight');

  for (var i = 0; i < arcElements.length; i++) {
    arcElements[i].addEventListener('click', (e) => {
      e.target.classList.add('active-arc-element');

      const popup = document.querySelector('.acr-popup');
      popup.classList.remove('show');

      const meaningPopupContent = document.querySelector('.acr-content');
      const acronym = e.target.textContent;

      const meaning = responseAcr.find((item) => item.acronym === acronym);

      var content = `
      <h3>Acronym detection: ${acronym}</h3>
<table class="acr-table"><thead>
                              <tr>
                              <th>Stand for</th>
                              <th>Meaning</th>
                              </tr>
                              </thead><tbody>`;
      for (let i = 0; i < meaning.abbrFor.length; i++) {
        content += `<tr>
                    <td>${meaning.abbrFor[i].name || ''}</td>
                    <td>${meaning.abbrFor[i].meaning || ''}</td>
                    </tr>`;
      }

      content += `</tbody></table>`;

      meaningPopupContent.innerHTML = content;

      // style popup position under the acronym
      popup.style.top = `${e.clientY + 10}px`;
      popup.style.left = `${e.clientX + 10}px`;
      // Check if the popup is out of the screen and adjust the position
      if (popup.getBoundingClientRect().right > window.innerWidth) {
        popup.style.left = `${window.innerWidth - popup.getBoundingClientRect().width - 10}px`;
      }
      if (popup.getBoundingClientRect().bottom > window.innerHeight) {
        popup.style.top = `${window.innerHeight - popup.getBoundingClientRect().height - 10}px`;
      }

      // show the popup
      popup.className = 'acr-popup show';
    });
  }
}

// append the popup element to the body
document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeend', `
    <div class="acr-popup">
    <div class="acr-close-popup">X</div>
      <div class="acr-content"></div>
    </div>
`);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "apiEventTriggered") {
    if (message.data.length === 0) {
      return;
    }

    console.log('apiEventTriggered', message.data);

    responseAcr = message.data;

    findMatches(message.data);

    bindingArcHighlightEvents();
  }
});
// End handle the response from the API

