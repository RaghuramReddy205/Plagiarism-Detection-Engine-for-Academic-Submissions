/**
 * Plagiarism Detection Engine - Main Application Controller
 * Handles Student Authentication, Document Submission, File Uploads,
 * 5-Stage Algorithmic Scanning Pipeline, Synchronized Diff Viewer,
 * Agency Leaderboard, Certificate Modal, and Dark/Light Mode.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentUser: null,
    currentTheme: localStorage.getItem('theme') || 'dark',
    activePresetId: null,
    scanResults: null,
    isScanning: false
  };

  // DOM Elements
  const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
  
  // Auth Elements
  const authView = document.getElementById('auth-view');
  const mainView = document.getElementById('main-view');
  const loginForm = document.getElementById('student-login-form');
  const studentNameInput = document.getElementById('student-name-input');
  const studentRollInput = document.getElementById('student-roll-input');
  const studentDeptInput = document.getElementById('student-dept-input');
  const studentNavPill = document.getElementById('student-nav-pill');
  const navStudentName = document.getElementById('nav-student-name');
  const navStudentRoll = document.getElementById('nav-student-roll');
  const navStudentAvatar = document.getElementById('nav-student-avatar');
  const logoutBtn = document.getElementById('logout-btn');

  // Input & Presets Elements
  const docTextarea = document.getElementById('doc-textarea');
  const fileDropzone = document.getElementById('file-dropzone');
  const fileInput = document.getElementById('file-input');
  const charCountEl = document.getElementById('char-count');
  const wordCountEl = document.getElementById('word-count');
  const presetChipsContainer = document.getElementById('preset-chips-container');
  const scanBtn = document.getElementById('scan-btn');

  // Scanning HUD Elements
  const scanHud = document.getElementById('scan-progress-hud');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressStatusText = document.getElementById('progress-status-text');

  // Results Elements
  const resultsSection = document.getElementById('results-section');
  const topAgencyName = document.getElementById('top-agency-name');
  const topAgencyDomain = document.getElementById('top-agency-domain');
  const topAgencyTier = document.getElementById('top-agency-tier');
  const topAgencyDescription = document.getElementById('top-agency-description');
  const topMatchedTitle = document.getElementById('top-matched-title');
  const topMatchedCitation = document.getElementById('top-matched-citation');
  const gaugePercent = document.getElementById('gauge-percent');
  const gaugeFillCircle = document.getElementById('gauge-fill-circle');
  const riskBadge = document.getElementById('risk-badge');
  const agencyCardsGrid = document.getElementById('agency-cards-grid');

  // Side-by-Side Diff Elements
  const studentDocBox = document.getElementById('student-doc-box');
  const targetDocBox = document.getElementById('target-doc-box');
  const targetColTitle = document.getElementById('target-col-title');
  const targetColBadge = document.getElementById('target-col-badge');

  // Diagnostics Elements
  const diagTokens = document.getElementById('diag-tokens');
  const diagKgrams = document.getElementById('diag-kgrams');
  const diagFingerprints = document.getElementById('diag-fingerprints');
  const diagTime = document.getElementById('diag-time');

  // Certificate Modal Elements
  const certModal = document.getElementById('cert-modal');
  const openCertBtn = document.getElementById('open-cert-btn');
  const closeCertBtn = document.getElementById('close-cert-btn');
  const printCertBtn = document.getElementById('print-cert-btn');
  const certStudentName = document.getElementById('cert-student-name');
  const certStudentRoll = document.getElementById('cert-student-roll');
  const certDept = document.getElementById('cert-dept');
  const certDate = document.getElementById('cert-date');
  const certScore = document.getElementById('cert-score');
  const certTopAgency = document.getElementById('cert-top-agency');
  const certFingerprints = document.getElementById('cert-fingerprints');
  const certStatus = document.getElementById('cert-status');

  // -------------------------------------------------------------
  // 1. INITIALIZE 3D SCENE
  // -------------------------------------------------------------
  let threeScene = null;
  try {
    threeScene = new Interactive3DScene('webgl-background');
  } catch (err) {
    console.warn('3D WebGL Scene initialization error:', err);
  }

  // themeToggleCheckbox already declared at line 19

  // -------------------------------------------------------------
  // 2. THEME SWITCHING (LIGHT & DARK MODE)
  // -------------------------------------------------------------
  function applyTheme(theme) {
    state.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const isDark = theme === 'dark';
    if (themeToggleCheckbox) {
      themeToggleCheckbox.checked = !isDark; // checked = light mode
    }

    if (threeScene) {
      threeScene.setTheme(isDark);
    }
  }

  applyTheme(state.currentTheme);

  if (themeToggleCheckbox) {
    themeToggleCheckbox.addEventListener('change', (e) => {
      const newTheme = e.target.checked ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }

  // -------------------------------------------------------------
  // 3. STUDENT AUTHENTICATION & SESSION MANAGEMENT
  // -------------------------------------------------------------
  function checkSavedSession() {
    const savedUser = localStorage.getItem('plagiarism_student_session');
    if (savedUser) {
      try {
        state.currentUser = JSON.parse(savedUser);
        activateStudentSession();
      } catch (e) {
        localStorage.removeItem('plagiarism_student_session');
      }
    }
  }

  function activateStudentSession() {
    if (!state.currentUser) return;

    authView.style.display = 'none';
    mainView.classList.add('active');

    // Update Nav
    navStudentName.textContent = state.currentUser.name;
    navStudentRoll.textContent = state.currentUser.roll;
    navStudentAvatar.textContent = state.currentUser.name.charAt(0).toUpperCase();
    studentNavPill.classList.add('active');
    logoutBtn.classList.add('active');
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = studentNameInput.value.trim();
    const roll = studentRollInput.value.trim();
    const dept = studentDeptInput.value.trim() || 'Computer Science & Engineering';

    if (!name || !roll) {
      alert('Please enter both your Student Name and Roll Number.');
      return;
    }

    state.currentUser = { name, roll, dept };
    localStorage.setItem('plagiarism_student_session', JSON.stringify(state.currentUser));
    activateStudentSession();
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('plagiarism_student_session');
    state.currentUser = null;
    studentNavPill.classList.remove('active');
    logoutBtn.classList.remove('active');
    mainView.classList.remove('active');
    authView.style.display = 'flex';
  });

  // Quick Demo Login Presets
  window.fillDemoStudent = function(name, roll, dept) {
    studentNameInput.value = name;
    studentRollInput.value = roll;
    studentDeptInput.value = dept;
  };

  // -------------------------------------------------------------
  // 4. SAMPLE PRESETS & DOCUMENT TEXTAREA LOGIC
  // -------------------------------------------------------------
  function renderPresetChips() {
    presetChipsContainer.innerHTML = '';
    SAMPLE_PRESETS.forEach((preset) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'preset-chip';
      chip.textContent = preset.name;
      chip.setAttribute('title', preset.description);
      chip.addEventListener('click', () => {
        document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.activePresetId = preset.id;
        docTextarea.value = preset.text;
        updateCharCounts();
        // Smooth scroll to textarea
        docTextarea.focus();
      });
      presetChipsContainer.appendChild(chip);
    });
  }

  function updateCharCounts() {
    const text = docTextarea.value;
    charCountEl.textContent = `${text.length} chars`;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    wordCountEl.textContent = `${words} words`;
    scanBtn.disabled = text.trim().length === 0;
  }

  docTextarea.addEventListener('input', updateCharCounts);

  // File Upload Handling
  fileDropzone.addEventListener('click', () => fileInput.click());

  fileDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropzone.classList.add('dragover');
  });

  fileDropzone.addEventListener('dragleave', () => {
    fileDropzone.classList.remove('dragover');
  });

  fileDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadedFile(e.target.files[0]);
    }
  });

  function handleUploadedFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      docTextarea.value = event.target.result;
      updateCharCounts();
    };
    reader.readAsText(file);
  }

  // -------------------------------------------------------------
  // 5. FIVE-STAGE ALGORITHMIC SCANNING PIPELINE
  // -------------------------------------------------------------
  const SCAN_STAGES = [
    { percent: 20, text: 'Stage 1/5: Normalizing text & extracting alphanumeric tokens...' },
    { percent: 45, text: 'Stage 2/5: Calculating Rabin-Karp Dual Modulo Rolling Hashes & Winnowing...' },
    { percent: 70, text: 'Stage 3/5: Querying Internet Academic Repositories (IEEE, arXiv, ACM, Springer)...' },
    { percent: 88, text: 'Stage 4/5: Constructing Suffix Arrays & Computing Kasai LCP Substring Matches...' },
    { percent: 100, text: 'Stage 5/5: Evaluating similarity scores & ranking most similar agencies!' }
  ];

  scanBtn.addEventListener('click', async () => {
    const text = docTextarea.value.trim();
    if (!text) {
      alert('Please enter or upload a document to inspect.');
      return;
    }

    if (state.isScanning) return;
    state.isScanning = true;
    scanBtn.disabled = true;

    // Trigger 3D scanner laser & data beams
    if (threeScene) {
      threeScene.resetHighlights();
      threeScene.startScanAnimation();
    }

    // Show Progress HUD
    resultsSection.classList.remove('active');
    scanHud.classList.add('active');
    scanHud.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const stepElements = [
      document.getElementById('step-1'),
      document.getElementById('step-2'),
      document.getElementById('step-3'),
      document.getElementById('step-4'),
      document.getElementById('step-5')
    ];

    // Reset steps
    stepElements.forEach(s => {
      s.className = 'p-step';
    });

    for (let i = 0; i < SCAN_STAGES.length; i++) {
      const stage = SCAN_STAGES[i];
      progressBarFill.style.width = `${stage.percent}%`;
      progressStatusText.innerHTML = `<span class="spinner"></span> ${stage.text}`;

      stepElements[i].classList.add('active');
      if (i > 0) {
        stepElements[i - 1].classList.remove('active');
        stepElements[i - 1].classList.add('completed');
      }

      // Small realistic pause for visualization
      await new Promise(r => setTimeout(r, 450));
    }

    stepElements[4].classList.remove('active');
    stepElements[4].classList.add('completed');

    // Run the actual algorithms in algorithms.js
    const searchResults = window.plagiarismEngine.searchInternetAgencies(text, ACADEMIC_AGENCIES);
    state.scanResults = searchResults;

    // Finish 3D Scan animation
    if (threeScene) {
      threeScene.stopScanAnimation();
      if (searchResults.mostSimilarAgency) {
        threeScene.highlightTopAgency(searchResults.mostSimilarAgency.agencyId);
      }
    }

    // Hide HUD after brief moment and display results
    setTimeout(() => {
      scanHud.classList.remove('active');
      displayResults(searchResults, text);
      state.isScanning = false;
      scanBtn.disabled = false;
    }, 400);
  });

  // -------------------------------------------------------------
  // 6. RENDER RESULTS & "WHICH AGENCY IS MORE SIMILAR"
  // -------------------------------------------------------------
  function displayResults(results, originalStudentText) {
    const topAgency = results.mostSimilarAgency;
    resultsSection.classList.add('active');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 1. Spotlight on the MOST SIMILAR AGENCY
    if (topAgency) {
      topAgencyName.textContent = topAgency.agencyName;
      topAgencyDomain.textContent = topAgency.domain;
      topAgencyTier.textContent = topAgency.reputation;
      topAgencyDescription.textContent = topAgency.description;

      if (topAgency.matchedPaper) {
        topMatchedTitle.textContent = topAgency.matchedPaper.title;
        topMatchedCitation.textContent = `${topAgency.matchedPaper.authors} • ${topAgency.matchedPaper.published} • DOI: ${topAgency.matchedPaper.doi}`;
      }
    }

    // 2. Circular Gauge & Overall Score
    const score = results.overallPlagiarismScore;
    gaugePercent.textContent = `${score}%`;

    // SVG Circumference: 2 * PI * 60 = ~377
    const offset = 377 - (377 * (score / 100));
    gaugeFillCircle.style.strokeDashoffset = offset;

    if (score >= 30) {
      gaugeFillCircle.style.stroke = '#f43f5e'; // Red
    } else if (score >= 15) {
      gaugeFillCircle.style.stroke = '#f59e0b'; // Amber
    } else {
      gaugeFillCircle.style.stroke = '#10b981'; // Green
    }

    riskBadge.className = `risk-badge ${results.riskBadgeClass}`;
    riskBadge.textContent = `${results.riskLevel} (${score}%)`;

    // 3. Render Comparative Agency Leaderboard
    renderAgencyLeaderboard(results.allAgenciesRanked);

    // 4. Render Side-by-Side Synced Highlighted Diff
    if (topAgency && topAgency.matchedPaper && topAgency.comparison) {
      renderSideBySideDiff(
        originalStudentText,
        topAgency.matchedPaper.text,
        topAgency.comparison.highlightRangesStudent,
        topAgency.comparison.highlightRangesTarget,
        topAgency.agencyName
      );
    }

    // 5. Algorithm Diagnostics
    const comp = topAgency?.comparison;
    diagTokens.textContent = comp ? comp.studentCleanLength.toLocaleString() : '0';
    diagKgrams.textContent = comp ? comp.kgramsCount.toLocaleString() : '0';
    diagFingerprints.textContent = comp ? `${comp.commonFingerprints} / ${comp.fingerprintsCount}` : '0';
    diagTime.textContent = `${results.executionDurationMs} ms`;
  }

  // -------------------------------------------------------------
  // 7. AGENCY COMPARISON LEADERBOARD
  // -------------------------------------------------------------
  function renderAgencyLeaderboard(rankedAgencies) {
    agencyCardsGrid.innerHTML = '';

    rankedAgencies.forEach((agency, index) => {
      const isTop = index === 0;
      const card = document.createElement('div');
      card.className = `agency-rank-card ${isTop ? 'top-rank' : ''}`;

      const color = agency.badgeColor || '#0284c7';
      const score = agency.similarityScore;

      card.innerHTML = `
        <div class="rank-badge-number">#${index + 1}</div>
        <div class="agency-card-top">
          <div class="agency-card-icon" style="background: ${color}">
            ${agency.agencyName.charAt(0)}
          </div>
          <div>
            <h4>${agency.agencyName}</h4>
            <span>${agency.domain}</span>
          </div>
        </div>
        <div class="agency-score-row">
          <span class="score-label">${isTop ? 'Primary Source Match' : 'Corpus Overlap'}</span>
          <span class="score-val" style="color: ${score >= 30 ? 'var(--accent-rose)' : score >= 15 ? 'var(--accent-amber)' : 'var(--accent-emerald)'}">
            ${score}%
          </span>
        </div>
        <div class="agency-bar-track">
          <div class="agency-bar-fill" style="width: ${Math.max(4, score)}%; background: ${score >= 30 ? 'var(--accent-rose)' : score >= 15 ? 'var(--accent-amber)' : 'var(--accent-emerald)'}"></div>
        </div>
        <div class="agency-card-footer">
          <span>${agency.reputation.split(' ')[0]} Index</span>
          <span>${agency.comparison?.commonFingerprints || 0} winnowed hashes</span>
        </div>
      `;

      card.addEventListener('click', () => {
        // Highlight in 3D
        if (threeScene) threeScene.highlightTopAgency(agency.agencyId);
        // Switch diff comparison to this agency
        if (agency.matchedPaper && agency.comparison) {
          renderSideBySideDiff(
            docTextarea.value,
            agency.matchedPaper.text,
            agency.comparison.highlightRangesStudent,
            agency.comparison.highlightRangesTarget,
            agency.agencyName
          );
          studentDocBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      agencyCardsGrid.appendChild(card);
    });
  }

  // -------------------------------------------------------------
  // 8. SIDE-BY-SIDE HIGHLIGHTED VIEWER
  // -------------------------------------------------------------
  function renderSideBySideDiff(studentText, targetText, studentRanges, targetRanges, targetAgencyName) {
    targetColTitle.textContent = `${targetAgencyName} (Source Reference)`;
    targetColBadge.textContent = `${targetRanges.length} Matching Excerpts`;

    studentDocBox.innerHTML = generateHighlightedHTML(studentText, studentRanges);
    targetDocBox.innerHTML = generateHighlightedHTML(targetText, targetRanges);

    // Sync scroll
    let isSyncing = false;
    studentDocBox.onscroll = () => {
      if (!isSyncing) {
        isSyncing = true;
        const ratio = studentDocBox.scrollTop / (studentDocBox.scrollHeight - studentDocBox.clientHeight || 1);
        targetDocBox.scrollTop = ratio * (targetDocBox.scrollHeight - targetDocBox.clientHeight);
        setTimeout(() => isSyncing = false, 50);
      }
    };

    targetDocBox.onscroll = () => {
      if (!isSyncing) {
        isSyncing = true;
        const ratio = targetDocBox.scrollTop / (targetDocBox.scrollHeight - targetDocBox.clientHeight || 1);
        studentDocBox.scrollTop = ratio * (studentDocBox.scrollHeight - studentDocBox.clientHeight);
        setTimeout(() => isSyncing = false, 50);
      }
    };
  }

  function generateHighlightedHTML(text, ranges) {
    if (!ranges || ranges.length === 0) {
      return escapeHtml(text);
    }

    // Sort ranges by start position
    const sorted = [...ranges].sort((a, b) => a.start - b.start);
    let html = '';
    let lastIdx = 0;

    for (const r of sorted) {
      if (r.start > lastIdx) {
        html += escapeHtml(text.substring(lastIdx, r.start));
      }

      const matchText = text.substring(r.start, r.end);
      html += `<span class="plag-highlight" title="Matched Common Substring (${r.length} chars)">${escapeHtml(matchText)}</span>`;
      lastIdx = Math.max(lastIdx, r.end);
    }

    if (lastIdx < text.length) {
      html += escapeHtml(text.substring(lastIdx));
    }

    return html;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // -------------------------------------------------------------
  // 9. CERTIFICATE MODAL & PRINTING
  // -------------------------------------------------------------
  openCertBtn.addEventListener('click', () => {
    if (!state.scanResults || !state.currentUser) return;
    const res = state.scanResults;
    const user = state.currentUser;

    certStudentName.textContent = user.name;
    certStudentRoll.textContent = user.roll;
    certDept.textContent = user.dept;
    certDate.textContent = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    certScore.textContent = `${res.overallPlagiarismScore}%`;
    certTopAgency.textContent = res.mostSimilarAgency?.agencyName || 'None';
    certFingerprints.textContent = `${res.mostSimilarAgency?.comparison?.commonFingerprints || 0} common hashes`;
    certStatus.textContent = res.riskLevel;

    certModal.classList.add('active');
  });

  const closeCertXBtn = document.getElementById('close-cert-x-btn');
  if (closeCertXBtn) {
    closeCertXBtn.addEventListener('click', () => {
      certModal.classList.remove('active');
    });
  }

  closeCertBtn.addEventListener('click', () => {
    certModal.classList.remove('active');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal.classList.contains('active')) {
      certModal.classList.remove('active');
    }
  });

  certModal.addEventListener('click', (e) => {
    if (e.target === certModal) {
      certModal.classList.remove('active');
    }
  });

  printCertBtn.addEventListener('click', () => {
    window.print();
  });

  // -------------------------------------------------------------
  // 10. BOOTSTRAP INITIALIZATION
  // -------------------------------------------------------------
  renderPresetChips();
  checkSavedSession();
  updateCharCounts();
});
