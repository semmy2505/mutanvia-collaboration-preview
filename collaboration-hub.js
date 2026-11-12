const tabs = [...document.querySelectorAll('[data-view]')];
const views = [...document.querySelectorAll('.view')];
const toast = document.getElementById('toast');
const validViews = new Set(views.map((view) => view.id));
let timer;

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(timer);
  timer = setTimeout(() => toast.classList.remove('show'), 3600);
}

function selectedHash(view) {
  return `#${encodeURIComponent(view)}`;
}

function selectView(view, updateHash = true) {
  if (!validViews.has(view)) return false;
  tabs.forEach((tab) => {
    const on = tab.dataset.view === view;
    tab.classList.toggle('active', on);
    tab.setAttribute('aria-selected', String(on));
  });
  views.forEach((section) => section.classList.toggle('active', section.id === view));
  if (updateHash && location.hash !== selectedHash(view)) {
    history.replaceState(null, '', selectedHash(view));
  }
  return true;
}

function viewFromHash() {
  const rawHash = location.hash.slice(1);
  if (!rawHash) return null;
  try {
    const view = decodeURIComponent(rawHash);
    return validViews.has(view) ? view : null;
  } catch {
    return null;
  }
}

tabs.forEach((tab) => tab.addEventListener('click', () => selectView(tab.dataset.view)));
const initialView = viewFromHash();
if (initialView) selectView(initialView, false);
window.addEventListener('hashchange', () => {
  const requestedView = viewFromHash();
  if (requestedView) selectView(requestedView, false);
});

function filterRows(buttons, rows, key) {
  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((item) => item.classList.toggle('active', item === button));
    const value = button.dataset[key];
    rows.forEach((row) => row.classList.toggle(
      'is-hidden',
      value !== 'all' && !(row.dataset.type || '').split(' ').includes(value)
    ));
  }));
}

filterRows([...document.querySelectorAll('[data-stakeholder]')], [...document.querySelectorAll('#stakeholder-table tr')], 'stakeholder');
filterRows([...document.querySelectorAll('[data-document]')], [...document.querySelectorAll('#document-list article')], 'document');

document.getElementById('show-critical').addEventListener('click', () => {
  document.querySelector('[data-stakeholder="watch"]').click();
  notify('Showing fictional sample watch items.');
});

document.getElementById('feedback-open').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const openOnly = button.dataset.filtered !== 'true';
  document.querySelectorAll('[data-feedback]').forEach((item) => {
    item.classList.toggle('is-hidden', openOnly && item.dataset.feedback !== 'open');
  });
  button.dataset.filtered = String(openOnly);
  button.textContent = openOnly ? 'Show all sample feedback' : 'Toggle example open items';
  notify(openOnly ? 'Showing fictional sample feedback items marked open.' : 'Showing all fictional sample feedback items.');
});

document.getElementById('docs-review').addEventListener('click', () => {
  document.querySelector('[data-document="review"]').click();
  notify('Showing fictional sample review items.');
});

document.getElementById('pending-only').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const pendingOnly = button.dataset.filtered !== 'true';
  document.querySelectorAll('#approval-list article').forEach((item) => {
    item.classList.toggle('is-hidden', pendingOnly && item.dataset.status !== 'pending');
  });
  button.dataset.filtered = String(pendingOnly);
  button.textContent = pendingOnly ? 'Show all sample states' : 'Toggle example pending items';
  notify(pendingOnly ? 'Showing fictional sample items marked pending.' : 'Showing all fictional sample states.');
});

document.querySelectorAll('[data-note]').forEach((button) => button.addEventListener('click', () => notify(button.dataset.note)));
document.querySelectorAll('[data-approval]').forEach((button) => button.addEventListener('click', () => notify(button.dataset.approval)));
document.getElementById('brief').addEventListener('click', () => notify('Static preview only: no stakeholder brief is generated or downloaded.'));
document.getElementById('share').addEventListener('click', () => notify('Static preview only: no update is created, queued or sent.'));
document.getElementById('team-view').addEventListener('click', () => notify('This fictional sample shows roles only and contains no personal contact data.'));
