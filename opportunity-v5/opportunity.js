'use strict';
(() => {
  const choice = document.getElementById('anchor-choice');
  const summary = document.getElementById('anchor-summary');
  const enquiry = document.getElementById('enquiry-link');
  const descriptions = {
    either: ['Either anchor position', 'Let’s discuss the position and format that best suit your brand.'],
    a: ['Anchor A — approximately 25,000 sq ft', 'Anchor A: approximately 25,000 sq ft at one end of the proposed market.'],
    b: ['Anchor B — approximately 20,000 sq ft', 'Anchor B: approximately 20,000 sq ft at the opposite end of the proposed market.'],
    both: ['Both anchor positions', 'Let’s explore your space needs across the two proposed positions: approximately 45,000 sq ft combined.']
  };
  const bodyPhrases = {either:'either anchor position', a:'Anchor A (approximately 25,000 sq ft)', b:'Anchor B (approximately 20,000 sq ft)', both:'both anchor positions'};
  function updateEnquiry() {
    const selected = descriptions[choice.value] || descriptions.either;
    summary.textContent = selected[1];
    const subject = 'Stony Plain Farmers Market — ' + selected[0];
    const body = 'Hello Tim,\r\n\r\nI would like to explore ' + (bodyPhrases[choice.value] || bodyPhrases.either) + ' in the proposed Stony Plain Farmers Market.\r\n\r\nCompany / brand:\r\nProposed concept:\r\nApproximate space requirement:\r\nContact name and details:\r\n\r\nPlease send further project information and next steps.';
    enquiry.href = 'mailto:tim@businessasaforceforgood.ca?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }
  if (choice && summary && enquiry) {
    choice.addEventListener('change', updateEnquiry);
    document.querySelectorAll('[data-anchor]').forEach(link => {
      link.addEventListener('click', () => {
        const key = link.getAttribute('data-anchor');
        if (descriptions[key]) { choice.value = key; updateEnquiry(); }
      });
    });
    updateEnquiry();
  }
  const print = document.getElementById('print-brief');
  if (print) print.addEventListener('click', () => window.print());
  const history = document.querySelector?.('.history-menu');
  if (history) {
    window.stonyHistoryListeners?.abort();
    const listeners = new AbortController(); window.stonyHistoryListeners = listeners;
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && history.open) { history.open = false; history.querySelector('summary').focus(); }
    }, {signal:listeners.signal});
    document.addEventListener('click', event => { if (!history.contains(event.target)) history.open = false; }, {signal:listeners.signal});
    history.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { history.open = false; }));
  }
})();
