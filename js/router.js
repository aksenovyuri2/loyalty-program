let currentRoute = null;
const enterCallbacks = {};

export function navigate(path) {
  if (window.location.hash === '#' + path) return;
  window.location.hash = path;
}

export function onEnter(path, fn) {
  enterCallbacks[path] = fn;
}

export function getCurrentRoute() {
  return currentRoute;
}

function handleRoute() {
  const hash = window.location.hash.slice(1) || '/lk';
  const prevRoute = currentRoute;
  currentRoute = hash;

  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  const screenId = hash.slice(1);
  const screen = document.getElementById(`screen-${screenId}`);
  if (screen) {
    screen.classList.add('active');
  }

  if (prevRoute !== hash) {
    window.scrollTo(0, 0);
  }

  // Call enter callback to refresh screen data
  if (enterCallbacks[hash]) {
    enterCallbacks[hash]();
  }

  document.querySelectorAll('.bottom-nav__item').forEach(item => {
    item.classList.toggle('active', item.dataset.route === hash);
  });
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
