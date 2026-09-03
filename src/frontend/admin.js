const apiRoot = window.location.origin;
const loginForm = document.querySelector('#admin-login-form');
const statusElement = document.querySelector('#admin-status');
const inquiryList = document.querySelector('#inquiry-list');

function setStatus(message) {
  if (statusElement) statusElement.textContent = message;
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(loginForm).entries());
    setStatus('Signing in...');

    try {
      const response = await fetch(`${apiRoot}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to sign in');
      window.location.href = '/admin.html';
    } catch (error) {
      setStatus(error.message);
    }
  });
}

function renderInquiry(inquiry) {
  const card = document.createElement('article');
  card.className = 'inquiry-card';
  card.innerHTML = `
    <header><h2></h2><time></time></header>
    <div class="inquiry-meta"><span class="service"></span><span class="date"></span><span class="location"></span><span class="budget"></span><span class="email"></span></div>
    <p class="details"></p>
  `;
  card.querySelector('h2').textContent = inquiry.name;
  card.querySelector('time').textContent = new Date(inquiry.created_at).toLocaleString();
  card.querySelector('.service').textContent = inquiry.service;
  card.querySelector('.date').textContent = inquiry.event_date || 'Date not specified';
  card.querySelector('.location').textContent = inquiry.location || 'Location not specified';
  card.querySelector('.budget').textContent = inquiry.budget || 'Budget not specified';
  card.querySelector('.email').textContent = inquiry.email;
  card.querySelector('.details').textContent = inquiry.details;
  return card;
}

if (inquiryList) {
  fetch(`${apiRoot}/api/admin/inquiries`, { credentials: 'same-origin' })
    .then(async (response) => {
      if (response.status === 401) {
        window.location.href = '/admin.html';
        return null;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to load inquiries');
      return result;
    })
    .then((result) => {
      if (!result) return;
      inquiryList.replaceChildren(...result.inquiries.map(renderInquiry));
      setStatus(result.inquiries.length ? `${result.inquiries.length} inquiries` : 'No inquiries yet.');
    })
    .catch((error) => setStatus(error.message));
}

document.querySelector('#admin-logout')?.addEventListener('click', async () => {
  await fetch(`${apiRoot}/api/admin/logout`, { method: 'POST', credentials: 'same-origin' });
  window.location.href = '/admin.html';
});
