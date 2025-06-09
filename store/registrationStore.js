const registrationStore = {};

export function setRegistrationData(uuid, data) {
  registrationStore[uuid] = data;

  setTimeout(() => {
    delete registrationStore[uuid];
  }, 900000);
}

export function getRegistrationData(uuid) {
  return registrationStore[uuid];
}

export function deleteRegistrationData(uuid) {
  delete registrationStore[uuid];
}
