import { INVALID_SAVED_URL_MESSAGE, normalizeUrl, readStoredUrl } from './url-utils.js';

const STORAGE_KEY = 'rbi_server_url';
const form = document.querySelector('[data-connect-form]');
const input = document.querySelector('#server-url');
const error = document.querySelector('[data-error]');
const saved = document.querySelector('[data-saved]');
const clearButton = document.querySelector('[data-clear]');

const showError = (message) => {
  error.textContent = message;
  error.hidden = !message;
};

const updateSaved = () => {
  const value = localStorage.getItem(STORAGE_KEY);
  if (value) {
    saved.textContent = `Saved server: ${value}. Press Connect to open.`;
    saved.hidden = false;
  } else {
    saved.hidden = true;
  }
};

const redirectToServer = (url) => {
  window.location.assign(url);
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  showError('');
  const value = normalizeUrl(input.value);
  if (!value) {
    showError('Enter a valid URL like http://server:8080');
    return;
  }
  localStorage.setItem(STORAGE_KEY, value);
  updateSaved();
  redirectToServer(value);
});

clearButton.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  updateSaved();
  showError('');
  input.value = '';
});

const { url: storedUrl, error: storedError } = readStoredUrl(
  localStorage,
  STORAGE_KEY,
);
if (storedUrl) {
  input.value = storedUrl;
}
if (storedError) {
  showError(INVALID_SAVED_URL_MESSAGE);
}
updateSaved();
