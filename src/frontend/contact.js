/* ================= CLIENT INQUIRY ================= */

const inquiryForm = document.querySelector('#inquiry-form');
const formStatus = document.querySelector('#form-status');

if (inquiryForm) {
  inquiryForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = new FormData(inquiryForm);
    const payload = Object.fromEntries(data.entries());
    const isLocalTestMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiUrl = window.PORTFOLIO_API_URL || window.location.origin;
    const submitButton = inquiryForm.querySelector('button[type="submit"]');

    if (submitButton) submitButton.disabled = true;
    if (formStatus) formStatus.textContent = 'Sending your inquiry...';

    try {
      const response = await fetch(`${apiUrl}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to send inquiry');

      inquiryForm.reset();
      if (formStatus) {
        let successText = 'Thank you! Your inquiry has been sent successfully. I will get back to you soon.';
        if (isLocalTestMode) {
          successText += ' (Local test mode)';
        }
        formStatus.textContent = successText;
        formStatus.style.color = '#111111';
        formStatus.style.fontWeight = '500';
      }
    } catch (error) {
      const message = error instanceof TypeError && error.message === 'Failed to fetch'
        ? 'Unable to connect to the inquiry server. Please start the backend and try again.'
        : error.message;
      if (formStatus) formStatus.textContent = message;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}
