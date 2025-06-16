const confirmationStore = {};

export function setConfirmationCode(key, data) {
  confirmationStore[key] = data;
  setTimeout(() => {
    delete confirmationStore[key];
  }, 15 * 60 * 1000); 
}

export function getConfirmationCode(key) {
  return confirmationStore[key];
}

export function deleteConfirmationCode(key) {
  delete confirmationStore[key];
}
