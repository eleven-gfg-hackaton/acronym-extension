const getAllText = () => {
  return document.getElementsByTagName('body')[0].innerText;
};

const findMatches = (responseData) => {
  const words = responseData.map((item) => item.word);

  let xpath = "//*[text()[";
  for (let i = 0; i < words.length; i++) {
    xpath += `contains(., "${words[i]}") or `;
  }

  xpath = xpath.slice(0, -4) + "]]"; // Remove the trailing " or "

  const contextNode = document.body;
  const result = document.evaluate(xpath, contextNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  const matches = result.snapshotLength;

  for (let i = 0; i < matches; i++) {
    words.forEach((word) => {
      wrapMatches(result.snapshotItem(i), word);
    });
  }
}

//Function to wrap matched words in a span
const wrapMatches = (element, word) => {
  //TODO: Ignore replace if the word is the attribute of HTML tags
  const regex = new RegExp(`\\b${word}\\b`, 'g');
  element.innerHTML = element.innerHTML.replace(regex, `<span class="acr-highlight">${word}</span>`);
}

//add event listener to close the popup
document.addEventListener('click', (e) => {

  var activeClickedElement = document.getElementsByClassName('active-arc-element');

  for (let i = 0; i < activeClickedElement.length; i++) {
    activeClickedElement[i].classList.remove('active-arc-element');
  }

  if (e.target.classList.contains('acr-close-popup')) {
    const popup = document.querySelector('.acr-popup');
    popup.className = 'acr-popup';
  }
});

var responseAcr = {};

chrome.runtime.sendMessage({message: "contentToBackground", data: getAllText()}, function (response) {
  console.log("Response from background:", response);
  findMatches(response.data);

  bindingArcHighlightEvents();

  responseAcr = response.data;
});

function bindingArcHighlightEvents() {

// add event listener to show the meaning of the word when clicked
  var arcElements = document.getElementsByClassName('acr-highlight');

  for (var i = 0; i < arcElements.length; i++) {
    arcElements[i].addEventListener('click', (e) => {
      e.target.classList.add('active-arc-element');

      const popup = document.querySelector('.acr-popup');
      popup.classList.remove('show');

      const meaningPopupContent = document.querySelector('.acr-content');
      const word = e.target.textContent;

      const meaning = responseAcr.find((item) => item.word === word);

      var content = `
      <h3>Acronym detection: ${word}</h3>
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

      console.log('heh', e);
      // style popup position under the word
      popup.style.top = `${e.clientY + 10}px`;
      popup.style.left = `${e.clientX + 10}px`;

      // show the popup
      popup.className = 'acr-popup show';
    });
  }
}

// append the popup element to the body
document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeend', `
    <div class="acr-popup hide">
    <div class="acr-close-popup">X</div>
      <div class="acr-content"></div>
    </div>
`);
