document.addEventListener('DOMContentLoaded', function () {
  let currentSection = 0;
  const form = document.getElementById('form');
  const sections = Array.from(document.querySelectorAll('[data-section]'));
  const previousButtons = document.querySelectorAll('.previous');
  const nextButtons = document.querySelectorAll('.next');
  const submitBtn = document.getElementById('submitBtn');
  const googlePostForm = document.getElementById('googlePostForm');
  const iframe = document.getElementById('hiddenSubmitFrame');
  const statusEl = document.getElementById('submitStatus');

  // Keep ordered list of visited pages (first-visit order)
  window._visitedPages = window._visitedPages || [];

  function recordVisited(idx) {
    if (!window._visitedPages.includes(idx)) window._visitedPages.push(idx);
  }

  function showSection(idx) {
    if (idx < 0 || idx >= sections.length) return;
    sections.forEach((s, i) => {
      s.classList.toggle('section-hidden', i !== idx);
    });
    currentSection = idx;
    recordVisited(idx);
    // focus first input for accessibility
    const first = sections[idx].querySelector('input,textarea,select,button');
    if (first) first.focus();
  }

  // Validate required inputs in a section (handles radio groups and required textareas)
  function validateSection(idx) {
    const section = sections[idx];
    const requiredEls = Array.from(section.querySelectorAll('[required]'));

    for (const el of requiredEls) {
      if (el.type === 'radio') {
        // radio group: check if any radio with same name in this section is checked
        const radios = section.querySelectorAll('input[name="' + el.name + '"]');
        const anyChecked = Array.from(radios).some(r => r.checked);
        if (!anyChecked) {
          setStatus('Please answer the required question.', true);
          radios[0] && radios[0].focus();
          return false;
        }
      } else {
        if (!el.value || el.value.trim() === '') {
          setStatus('Please fill required fields.', true);
          el.focus();
          return false;
        }
      }
    }

    setStatus('', false);
    return true;
  }

  function setStatus(msg, isError) {
    statusEl.textContent = msg;
    statusEl.className = 'status' + (isError ? ' err' : (msg ? ' ok' : ''));
  }

  // Navigation wiring
  previousButtons.forEach(btn => btn.addEventListener('click', function (e) {
    e.preventDefault();
    showSection(Math.max(0, currentSection - 1));
  }));
  nextButtons.forEach(btn => btn.addEventListener('click', function (e) {
    e.preventDefault();
    if (!validateSection(currentSection)) return;
    showSection(Math.min(sections.length - 1, currentSection + 1));
  }));

  // Build hidden googlePostForm before submit (includes pageHistory, fbzx, fvv)
  function buildGoogleForm() {
    while (googlePostForm.firstChild) googlePostForm.removeChild(googlePostForm.firstChild);

    const sectionsCount = sections.length;
    let pageHistory;
    if (!window._visitedPages || window._visitedPages.length === 0) {
      pageHistory = Array.from({ length: sectionsCount }, (_, i) => i).join(',');
    } else {
      pageHistory = window._visitedPages.filter(n => Number.isInteger(n) && n >= 0 && n < sectionsCount).join(',');
    }

    // critical fields
    const ph = document.createElement('input'); ph.type = 'hidden'; ph.name = 'pageHistory'; ph.value = pageHistory; googlePostForm.appendChild(ph);
    const fbzx = document.createElement('input'); fbzx.type = 'hidden'; fbzx.name = 'fbzx'; fbzx.value = String(Date.now()) + Math.floor(Math.random() * 100000); googlePostForm.appendChild(fbzx);
    const fvv = document.createElement('input'); fvv.type = 'hidden'; fvv.name = 'fvv'; fvv.value = '1'; googlePostForm.appendChild(fvv);
    const submitHidden = document.createElement('input'); submitHidden.type = 'hidden'; submitHidden.name = '_submit_flag'; submitHidden.value = 'Submit'; googlePostForm.appendChild(submitHidden);

    // copy visible form data (entry.* names preserved)
    const fd = new FormData(form);
    const map = {};
    for (const [k, v] of fd.entries()) {
      if (!map[k]) map[k] = [];
      map[k].push(v);
    }
    for (const key of Object.keys(map)) {
      for (const val of map[key]) {
        const h = document.createElement('input'); h.type = 'hidden'; h.name = key; h.value = val; googlePostForm.appendChild(h);
      }
    }

    // debug timestamp
    const ts = document.createElement('input'); ts.type = 'hidden'; ts.name = 'timestamp_local'; ts.value = new Date().toISOString(); googlePostForm.appendChild(ts);

    console.debug('googlePostForm built with pageHistory=' + pageHistory);
    return pageHistory;
  }

  // Submit the hidden form to Google via iframe and detect success by iframe load or timeout
  function submitToGoogle() {
    if (!validateSection(currentSection)) return Promise.reject(new Error('Validation failed'));

    buildGoogleForm();

    const action = googlePostForm.getAttribute('action');
    if (!action || action.includes('PASTE_YOUR_GOOGLE_FORM')) {
      alert('Google Form action URL not configured. Paste your formResponse URL into the hidden googlePostForm action attribute.');
      return Promise.reject(new Error('google action missing'));
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    setStatus('Sending...', false);

    return new Promise((resolve, reject) => {
      let finished = false;
      function clean() {
        iframe.removeEventListener('load', onload);
        clearTimeout(timer);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      }
      function onload() {
        if (finished) return;
        finished = true;
        clean();
        setStatus('Submitted — check Google Form responses.', false);
        console.debug('iframe load detected — POST likely completed.');
        resolve({ success: true });
      }
      const timer = setTimeout(() => {
        if (finished) return;
        finished = true;
        clean();
        setStatus('Submit timed out — it may have succeeded. Check responses or retry.', true);
        console.debug('Submit timed out after 12s.');
        resolve({ success: false, timedOut: true });
      }, 12000);

      iframe.addEventListener('load', onload);

      try {
        googlePostForm.submit();
      } catch (err) {
        clearTimeout(timer);
        clean();
        setStatus('Submission failed (script error).', true);
        console.error('Submit error', err);
        reject(err);
      }
    });
  }

  // final submit handler (form submit)
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateSection(currentSection)) return;
    submitToGoogle()
      .then(result => {
        console.debug('Submit result', result);
        if (result && result.success) {
          form.reset();
          window._visitedPages = [];
          setStatus('Submitted successfully — thank you!', false);
          window.alert('Submitted successfully — thank you!')
          // showSection(0);
        } else {
          // uncertain (timed out) — keep the form intact so user can retry
        }
      })
      .catch(err => {
        console.error(err);
        setStatus('Submission failed — see console for details.', true);
        window.alert('Submission failed')
      });
  });

  // initialize UI
  showSection(0);
});