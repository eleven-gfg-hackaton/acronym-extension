document.addEventListener('DOMContentLoaded', function () {
// handle toggle popup switch setting
  const acrEnableSwitcher = document.getElementById('acrEnableSwitcher');
  chrome.storage.local.get(['enabledAcr'], function (result) {
    acrEnableSwitcher.checked = result.enabledAcr;
    // chrome.runtime.sendMessage({ type: 'acrEnableSettingChange', enabled: acrEnableSwitcher.checked });
  });

  acrEnableSwitcher.addEventListener('change', function () {
    // Update the extension's state in storage
    var isEnabled = acrEnableSwitcher.checked;
    chrome.storage.local.set({enabledAcr: isEnabled}, function () {
      console.log('enabledAcr is set to ' + isEnabled);
    });
  });
});
