(function () {
  'use strict';
  
  // Check if already loaded
  if (document.getElementById('teedl-panel')) return;

  // Get the current domain for hosting
  var HOST = window.location.origin;
  
  // Check if Teedl should be activated via URL parameter
  var urlParams = new URLSearchParams(window.location.search);
  var teedlUrl = urlParams.get('teedl');
  
  if (teedlUrl) {
    HOST = teedlUrl;
  }

  // Detect current Google Workspace app
  var site = window.location.pathname.includes('/document') ? 'docs' :
    window.location.pathname.includes('/presentation') ? 'slides' :
    window.location.pathname.includes('/spreadsheets') ? 'sheets' :
    window.location.host.includes('mail.google.com') ? 'gmail' :
    window.location.host.includes('replit.com') ? 'replit' :
    window.location.host.includes('fafsa.gov') ? 'fafsa' :
    window.location.host.includes('classroom.google.com') ? 'classroom' :
    'generic';

  // Generate anonymous ID
  function getOrCreateAnonId() {
    try {
      var key = 'teedl_anon_id';
      var val = localStorage.getItem(key);
      if (!val) {
        val = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function(c){
          return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        });
        localStorage.setItem(key, val);
      }
      return val;
    } catch (_) {
      return 'anon_' + Math.random().toString(36).slice(2);
    }
  }

  var anonId = getOrCreateAnonId();
  var sessionStartedAt = Date.now();

  // Analytics tracking (simplified for web app)
  function track(eventType, extra) {
    try {
      var payload = { 
        anon_id: anonId, 
        event_type: eventType, 
        site: site, 
        ts: new Date().toISOString() 
      };
      if (extra && typeof extra === 'object') { 
        for (var k in extra) payload[k] = extra[k]; 
      }
      
      // Send to your analytics endpoint (optional)
      // fetch(HOST + '/api/events', { 
      //   method: 'POST', 
      //   headers: { 'Content-Type': 'application/json' }, 
      //   body: JSON.stringify(payload), 
      //   keepalive: true 
      // }).catch(function(){});
      
      console.log('Teedl Event:', eventType, payload);
    } catch (_) {}
  }

  // Create iframe pointing to panel.html
  var frame = document.createElement('iframe');
  frame.id = 'teedl-panel';
  frame.setAttribute('title', 'Teedl - Guided Steps');
  Object.assign(frame.style, {
    position: 'fixed', 
    top: '0px', 
    right: '0px', 
    width: '340px', 
    height: '100%',
    border: '0', 
    zIndex: 2147483647, 
    boxShadow: '-4px 0 16px rgba(0,0,0,.12)', 
    background: '#fff'
  });
  frame.src = HOST + '/panel.html?_=' + Date.now();
  document.body.appendChild(frame);

  track('panel_open');

  // Load steps data
  function loadSteps() {
    return fetch(HOST + '/src/steps/' + site + '.json?_' + Date.now())
      .then(function(r){ return r.ok ? r.json() : []; })
      .catch(function(){ return []; });
  }

  loadSteps().then(function(steps){
    try {
      frame.addEventListener('load', function(){
        frame.contentWindow.postMessage({ 
          __teedl_boot: true, 
          steps: Array.isArray(steps) ? steps : [] 
        }, '*');
      });
    } catch (_) {}
  });

  // Handle messages from the panel
  window.addEventListener('message', function(ev){
    if (!ev || !ev.data || ev.data.__teedl_evt == null) return;
    var evt = ev.data.__teedl_evt;
    if (evt === 'panel_close') {
      var durationMs = Date.now() - sessionStartedAt;
      track('panel_close', { session_duration_ms: durationMs });
      // Remove the panel
      var panel = document.getElementById('teedl-panel');
      if (panel) panel.remove();
    } else if (evt === 'open_feedback') {
      track('open_feedback');
    } else if (evt === 'step_view') {
      track('step_view', { step_idx: ev.data.step_idx });
    } else if (evt === 'step_complete') {
      track('step_complete', { step_idx: ev.data.step_idx });
    }
  });
})();
