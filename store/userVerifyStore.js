const confirmationStore = {};

export function setConfirmationCode(key, data) {
  confirmationStore[key] = data;
  console.log('[setConfirmationCode]', key, data, confirmationStore);
  setTimeout(() => {
    delete confirmationStore[key];
    console.log('[deleteConfirmationCode:timeout]', key, confirmationStore);
  }, 15 * 60 * 1000); 
}

export function getConfirmationCode(key) {
  const code = confirmationStore[key];
  console.log('[getConfirmationCode]', key, code, confirmationStore);
  return code;
}

export function deleteConfirmationCode(key) {
  delete confirmationStore[key];
}
