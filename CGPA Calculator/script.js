(function () {
  const STORAGE_KEY = "cgpa-calculator-dashboard-v1";
  const GRADE_SCALE = [
    { label: "S", value: 10 },
    { label: "A", value: 9 },
    { label: "B", value: 8 },
    { label: "C", value: 7 },
    { label: "D", value: 6 },
    { label: "E", value: 5 },
    { label: "F", value: 0 },
  ];
  const GRADUATION_CREDITS = 160;

  const defaultState = {
    semesterSubjects: [],
    editingSubjectId: null,
    editingSemesterId: null,
    semesters: [],
    whatIf: {
      currentCgpa: "",
      completedCredits: "",
      futureSemesters: [],
    },
  };

  const state = loadState();
  let dom = {};
  let toastTimer = null;
  let chartResizeTimer = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheDom();
    populateGradeOptions();
    bindEvents();
    normalizeState();
    renderAll();
  }

  function cacheDom() {
    dom = {
      body: document.body,
      clearDataBtn: document.getElementById("clearDataBtn"),
      saveSemesterBtn: document.getElementById("saveSemesterBtn"),
      fabAddSubject: document.getElementById("fabAddSubject"),
      subjectForm: document.getElementById("subjectForm"),
      subjectName: document.getElementById("subjectName"),
      subjectCredits: document.getElementById("subjectCredits"),
      subjectGrade: document.getElementById("subjectGrade"),
      subjectSubmitBtn: document.getElementById("subjectSubmitBtn"),
      subjectCancelBtn: document.getElementById("subjectCancelBtn"),
      subjectTableBody: document.getElementById("subjectTableBody"),
      subjectEmptyState: document.getElementById("subjectEmptyState"),
      semesterCreditsValue: document.getElementById("semesterCreditsValue"),
      semesterPointsValue: document.getElementById("semesterPointsValue"),
      semesterGpaValue: document.getElementById("semesterGpaValue"),
      semesterList: document.getElementById("semesterList"),
      semesterListEmpty: document.getElementById("semesterListEmpty"),
      overallCgpaValue: document.getElementById("overallCgpaValue"),
      overallCreditsValue: document.getElementById("overallCreditsValue"),
      currentCgpaInput: document.getElementById("currentCgpaInput"),
      completedCreditsInput: document.getElementById("completedCreditsInput"),
      addFutureSemesterBtn: document.getElementById("addFutureSemesterBtn"),
      futureSemesterList: document.getElementById("futureSemesterList"),
      futureSemesterEmpty: document.getElementById("futureSemesterEmpty"),
      projectedCgpaValue: document.getElementById("projectedCgpaValue"),
      projectionDelta: document.getElementById("projectionDelta"),
      statsCurrentCgpa: document.getElementById("statsCurrentCgpa"),
      statsHighestGpa: document.getElementById("statsHighestGpa"),
      statsLowestGpa: document.getElementById("statsLowestGpa"),
      statsTotalCredits: document.getElementById("statsTotalCredits"),
      statsSemesters: document.getElementById("statsSemesters"),
      statsProgress: document.getElementById("statsProgress"),
      heroSemesterGpa: document.getElementById("heroSemesterGpa"),
      heroRunningCgpa: document.getElementById("heroRunningCgpa"),
      heroProjectedCgpa: document.getElementById("heroProjectedCgpa"),
      toastContainer: document.getElementById("toastContainer"),
    };
  }

  function populateGradeOptions() {
    dom.subjectGrade.innerHTML = GRADE_SCALE.map(
      (grade) => `<option value="${grade.label}">${grade.label} (${grade.value})</option>`
    ).join("");
  }

  function bindEvents() {
    dom.clearDataBtn.addEventListener("click", clearAllData);
    dom.fabAddSubject.addEventListener("click", () => {
      document.getElementById("semester").scrollIntoView({ behavior: "smooth", block: "start" });
      dom.subjectName.focus();
    });
    dom.saveSemesterBtn.addEventListener("click", saveCurrentSemester);
    dom.subjectForm.addEventListener("submit", handleSubjectSubmit);
    dom.subjectCancelBtn.addEventListener("click", cancelSubjectEdit);
    dom.subjectTableBody.addEventListener("click", handleCurrentSubjectAction);
    dom.semesterList.addEventListener("click", handleSemesterAction);
    dom.futureSemesterList.addEventListener("click", handleFutureClick);
    dom.futureSemesterList.addEventListener("input", handleFutureInput);
    dom.currentCgpaInput.addEventListener("input", handleWhatIfSummaryInput);
    dom.completedCreditsInput.addEventListener("input", handleWhatIfSummaryInput);
    dom.addFutureSemesterBtn.addEventListener("click", addFutureSemester);
    window.addEventListener("resize", handleResize);
  }

  function normalizeState() {
    state.semesterSubjects = Array.isArray(state.semesterSubjects) ? state.semesterSubjects : [];
    state.semesters = Array.isArray(state.semesters) ? state.semesters : [];
    state.whatIf = state.whatIf && typeof state.whatIf === "object" ? state.whatIf : defaultState.whatIf;
    state.whatIf.futureSemesters = Array.isArray(state.whatIf.futureSemesters) ? state.whatIf.futureSemesters : [];

    state.semesterSubjects = state.semesterSubjects.map(normalizeSubject).filter(Boolean);
    state.semesters = state.semesters.map(normalizeSemester).filter(Boolean);
    state.whatIf.futureSemesters = state.whatIf.futureSemesters.map(normalizeFutureSemester).filter(Boolean);
  }

  function normalizeSubject(subject) {
    if (!subject) {
      return null;
    }

    return {
      id: subject.id || crypto.randomUUID(),
      name: String(subject.name || "").trim(),
      credits: toNumber(subject.credits),
      grade: getValidGrade(subject.grade),
    };
  }

  function normalizeSemester(semester) {
    if (!semester) {
      return null;
    }

    const subjects = Array.isArray(semester.subjects) ? semester.subjects.map(normalizeSubject).filter(Boolean) : [];
    const totals = calculateSemester(subjects);

    return {
      id: semester.id || crypto.randomUUID(),
      semesterNumber: toNumber(semester.semesterNumber) || 1,
      subjects,
      totalCredits: isFiniteNumber(semester.totalCredits) ? toNumber(semester.totalCredits) : totals.totalCredits,
      totalGradePoints: isFiniteNumber(semester.totalGradePoints) ? toNumber(semester.totalGradePoints) : totals.totalGradePoints,
      gpa: isFiniteNumber(semester.gpa) ? toNumber(semester.gpa) : totals.gpa,
    };
  }

  function normalizeFutureSemester(semester) {
    if (!semester) {
      return null;
    }

    const mode = semester.mode === "gpa" ? "gpa" : "subjects";
    const subjects = Array.isArray(semester.subjects) ? semester.subjects.map(normalizeSubject).filter(Boolean) : [];

    return {
      id: semester.id || crypto.randomUUID(),
      title: String(semester.title || "Future Semester").trim() || "Future Semester",
      mode,
      directCredits: toNumber(semester.directCredits),
      directGpa: toNumber(semester.directGpa),
      subjects,
      editingSubjectId: semester.editingSubjectId || null,
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return structuredClone(defaultState);
      }

      const parsed = JSON.parse(raw);
      return {
        ...structuredClone(defaultState),
        ...parsed,
        whatIf: {
          ...structuredClone(defaultState.whatIf),
          ...(parsed.whatIf || {}),
        },
      };
    } catch {
      return structuredClone(defaultState);
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function renderAll() {
    renderSemesterSubjects();
    renderSemesters();
    renderWhatIf();
    renderStats();
    renderHeroStats();
    drawChart();
    persist();
  }

  function renderSemesterSubjects() {
    const totals = calculateSemester(state.semesterSubjects);
    dom.subjectTableBody.innerHTML = state.semesterSubjects
      .map(
        (subject) => `
          <tr>
            <td>
              ${state.editingSubjectId === subject.id
                ? `<input class="table-input" data-current-field="name" data-subject-id="${subject.id}" value="${escapeHtml(subject.name)}" placeholder="Subject name">`
                : escapeHtml(subject.name || "Untitled Subject")}
            </td>
            <td>
              ${state.editingSubjectId === subject.id
                ? `<input class="table-input" data-current-field="credits" data-subject-id="${subject.id}" type="number" min="0" step="0.5" value="${formatInputNumber(subject.credits)}">`
                : formatNumber(subject.credits)}
            </td>
            <td>
              ${state.editingSubjectId === subject.id
                ? `<select class="table-select" data-current-field="grade" data-subject-id="${subject.id}">${renderGradeOptions(subject.grade)}</select>`
                : `<span class="grade-chip">${subject.grade}</span>`}
            </td>
            <td>${formatNumber(subject.credits * getGradePoint(subject.grade))}</td>
            <td>
              <div class="row-actions">
                ${state.editingSubjectId === subject.id
                  ? `<button class="small-button primary" data-action="finish-edit" data-subject-id="${subject.id}">Done</button>`
                  : `<button class="small-button" data-action="edit" data-subject-id="${subject.id}">Edit</button>`}
                <button class="small-button danger" data-action="delete" data-subject-id="${subject.id}">Delete</button>
              </div>
            </td>
          </tr>
        `
      )
      .join("");

    dom.subjectEmptyState.classList.toggle("hidden", state.semesterSubjects.length !== 0);
    dom.semesterCreditsValue.textContent = formatNumber(totals.totalCredits);
    dom.semesterPointsValue.textContent = formatNumber(totals.totalGradePoints);
    dom.semesterGpaValue.textContent = formatNumber(totals.gpa);
    dom.heroSemesterGpa.textContent = formatNumber(totals.gpa);
  }

  function renderGradeOptions(currentGrade) {
    return GRADE_SCALE.map(
      (grade) => `<option value="${grade.label}" ${grade.label === currentGrade ? "selected" : ""}>${grade.label} (${grade.value})</option>`
    ).join("");
  }

  function renderSemesters() {
    if (!state.semesters.length) {
      dom.semesterList.innerHTML = "";
      dom.semesterListEmpty.classList.remove("hidden");
    } else {
      dom.semesterListEmpty.classList.add("hidden");
      dom.semesterList.innerHTML = state.semesters
        .slice()
        .sort((left, right) => left.semesterNumber - right.semesterNumber)
        .map((semester) => {
          const subjectItems = semester.subjects.length
            ? semester.subjects
                .map(
                  (subject) => `<li>${escapeHtml(subject.name)} - ${formatNumber(subject.credits)} credits - ${subject.grade}</li>`
                )
                .join("")
            : "<li>No saved subjects</li>";

          return `
            <article class="semester-card">
              <div class="semester-card-head">
                <div>
                  <p class="eyebrow">Semester ${semester.semesterNumber}</p>
                  <h3>${formatNumber(semester.gpa)} GPA</h3>
                </div>
                <div class="semester-actions">
                  <button class="small-button" data-action="load-semester" data-semester-id="${semester.id}">Edit semester</button>
                  <button class="small-button danger" data-action="delete-semester" data-semester-id="${semester.id}">Delete</button>
                </div>
              </div>
              <div class="semester-meta">
                <span>${formatNumber(semester.totalCredits)} credits</span>
                <span>${semester.subjects.length} subjects</span>
                <span>${formatNumber(semester.totalGradePoints)} grade points</span>
              </div>
              <details class="semester-details">
                <summary>View subjects</summary>
                <ul>${subjectItems}</ul>
              </details>
            </article>
          `;
        })
        .join("");
    }

    const overall = calculateOverallCgpa(state.semesters);
    dom.overallCgpaValue.textContent = formatNumber(overall.cgpa);
    dom.overallCreditsValue.textContent = formatNumber(overall.totalCredits);
    dom.heroRunningCgpa.textContent = formatNumber(overall.cgpa);
  }

  function renderWhatIf() {
    dom.currentCgpaInput.value = state.whatIf.currentCgpa;
    dom.completedCreditsInput.value = state.whatIf.completedCredits;

    if (!state.whatIf.futureSemesters.length) {
      dom.futureSemesterList.innerHTML = "";
      dom.futureSemesterEmpty.classList.remove("hidden");
    } else {
      dom.futureSemesterEmpty.classList.add("hidden");
      dom.futureSemesterList.innerHTML = state.whatIf.futureSemesters
        .map((semester) => {
          const displayTotals = semester.mode === "gpa" ? getFutureSemesterDirectProjection(semester) : calculateSemester(semester.subjects);
          const subjectRows = semester.subjects.length
            ? semester.subjects
                .map(
                  (subject) => `
                    <tr>
                      <td><input class="table-input" data-future-field="name" data-semester-id="${semester.id}" data-subject-id="${subject.id}" value="${escapeHtml(subject.name)}" placeholder="Subject name"></td>
                      <td><input class="table-input" data-future-field="credits" data-semester-id="${semester.id}" data-subject-id="${subject.id}" type="number" min="0" step="0.5" value="${formatInputNumber(subject.credits)}"></td>
                      <td><select class="table-select" data-future-field="grade" data-semester-id="${semester.id}" data-subject-id="${subject.id}">${renderGradeOptions(subject.grade)}</select></td>
                      <td>${formatNumber(subject.credits * getGradePoint(subject.grade))}</td>
                      <td><button class="small-button danger" data-action="delete-future-subject" data-semester-id="${semester.id}" data-subject-id="${subject.id}">Delete</button></td>
                    </tr>
                  `
                )
                .join("")
            : `<tr><td colspan="5" class="muted">Add at least one subject.</td></tr>`;

          return `
            <article class="future-card" data-semester-id="${semester.id}">
              <div class="future-card-head">
                <div>
                  <label class="future-field">
                    <span>Future Semester Title</span>
                    <input data-future-title data-semester-id="${semester.id}" value="${escapeHtml(semester.title)}" placeholder="Future Semester 1">
                  </label>
                </div>
                <div class="future-controls">
                  <div class="segmented" role="tablist" aria-label="Semester mode">
                    <button type="button" class="${semester.mode === "subjects" ? "active" : ""}" data-action="set-future-mode" data-mode="subjects" data-semester-id="${semester.id}">Subjects</button>
                    <button type="button" class="${semester.mode === "gpa" ? "active" : ""}" data-action="set-future-mode" data-mode="gpa" data-semester-id="${semester.id}">Direct GPA</button>
                  </div>
                  <button class="small-button danger" data-action="delete-future-semester" data-semester-id="${semester.id}">Delete</button>
                </div>
              </div>

              <div class="future-form ${semester.mode === "gpa" ? "hidden" : ""}">
                <div class="future-field-grid">
                  <label>
                    <span>Subject Name</span>
                    <input data-future-draft="name" data-semester-id="${semester.id}" placeholder="Expected course">
                  </label>
                  <label>
                    <span>Credits</span>
                    <input data-future-draft="credits" data-semester-id="${semester.id}" type="number" min="0" step="0.5" placeholder="3">
                  </label>
                  <label>
                    <span>Expected Grade</span>
                    <select data-future-draft="grade" data-semester-id="${semester.id}">${renderGradeOptions("A")}</select>
                  </label>
                  <button type="button" class="primary-button" data-action="add-future-subject" data-semester-id="${semester.id}">Add Subject</button>
                </div>

                <div class="table-shell future-table-shell">
                  <table class="data-table future-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Credits</th>
                        <th>Expected Grade</th>
                        <th>Points</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>${subjectRows}</tbody>
                  </table>
                </div>
              </div>

              <div class="future-form ${semester.mode === "gpa" ? "" : "hidden"}">
                <div class="future-field-grid">
                  <label>
                    <span>Semester Credits</span>
                    <input data-future-direct="credits" data-semester-id="${semester.id}" type="number" min="0" step="0.5" value="${formatInputNumber(semester.directCredits)}" placeholder="18">
                  </label>
                  <label>
                    <span>Expected GPA</span>
                    <input data-future-direct="gpa" data-semester-id="${semester.id}" type="number" min="0" max="10" step="0.01" value="${formatInputNumber(semester.directGpa)}" placeholder="8.20">
                  </label>
                  <article class="summary-card">
                    <span>Semester Projection</span>
                    <strong>${formatNumber(displayTotals.gpa)}</strong>
                  </article>
                  <article class="summary-card">
                    <span>Weighted Points</span>
                    <strong>${formatNumber(displayTotals.gpa * displayTotals.totalCredits)}</strong>
                  </article>
                </div>
              </div>

              <div class="semester-meta" style="margin-top: 14px;">
                <span>Credits: ${formatNumber(displayTotals.totalCredits)}</span>
                <span>GPA: ${formatNumber(displayTotals.gpa)}</span>
                <span>Weighted points: ${formatNumber(displayTotals.totalGradePoints)}</span>
              </div>
            </article>
          `;
        })
        .join("");
    }

    const projection = calculateProjectedCgpa();
    dom.projectedCgpaValue.textContent = formatNumber(projection.cgpa);
    dom.heroProjectedCgpa.textContent = formatNumber(projection.cgpa);
    dom.projectionDelta.textContent = projection.message;
  }

  function renderStats() {
    const overall = calculateOverallCgpa(state.semesters);
    const gpAs = state.semesters.map((semester) => semester.gpa).filter((gpa) => isFiniteNumber(gpa));
    const highest = gpAs.length ? Math.max(...gpAs) : 0;
    const lowest = gpAs.length ? Math.min(...gpAs) : 0;
    const progress = overall.totalCredits > 0 ? Math.min(100, (overall.totalCredits / GRADUATION_CREDITS) * 100) : 0;

    dom.statsCurrentCgpa.textContent = formatNumber(overall.cgpa);
    dom.statsHighestGpa.textContent = formatNumber(highest);
    dom.statsLowestGpa.textContent = formatNumber(lowest);
    dom.statsTotalCredits.textContent = formatNumber(overall.totalCredits);
    dom.statsSemesters.textContent = String(state.semesters.length);
    dom.statsProgress.textContent = `${Math.round(progress)}%`;
  }

  function renderHeroStats() {
    const projection = calculateProjectedCgpa();
    dom.heroProjectedCgpa.textContent = formatNumber(projection.cgpa);
  }

  function handleSubjectSubmit(event) {
    event.preventDefault();

    const name = dom.subjectName.value.trim();
    const credits = toNumber(dom.subjectCredits.value);
    const grade = dom.subjectGrade.value;

    if (!name) {
      showToast("Subject name is required.", "error");
      dom.subjectName.focus();
      return;
    }

    if (!isFiniteNumber(credits) || credits <= 0) {
      showToast("Credits must be greater than zero.", "error");
      dom.subjectCredits.focus();
      return;
    }

    const subjectData = { name, credits, grade };

    if (state.editingSubjectId) {
      const index = state.semesterSubjects.findIndex((subject) => subject.id === state.editingSubjectId);
      if (index !== -1) {
        state.semesterSubjects[index] = { ...state.semesterSubjects[index], ...subjectData };
        showToast("Subject updated.", "success");
      }
    } else {
      state.semesterSubjects.push({ id: crypto.randomUUID(), ...subjectData });
      showToast("Subject added.", "success");
    }

    resetSubjectForm();
    renderAll();
  }

  function handleCurrentSubjectAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const subjectId = button.dataset.subjectId;
    const action = button.dataset.action;
    const subject = state.semesterSubjects.find((item) => item.id === subjectId);

    if (!subject) {
      return;
    }

    if (action === "edit") {
      state.editingSubjectId = subjectId;
      dom.subjectName.value = subject.name;
      dom.subjectCredits.value = subject.credits;
      dom.subjectGrade.value = subject.grade;
      dom.subjectSubmitBtn.textContent = "Update Subject";
      dom.subjectCancelBtn.classList.remove("hidden");
      renderSemesterSubjects();
      dom.subjectName.focus();
      return;
    }

    if (action === "finish-edit") {
      const updatedName = dom.subjectTableBody.querySelector(`[data-current-field="name"][data-subject-id="${subjectId}"]`).value.trim();
      const updatedCredits = toNumber(dom.subjectTableBody.querySelector(`[data-current-field="credits"][data-subject-id="${subjectId}"]`).value);
      const updatedGrade = dom.subjectTableBody.querySelector(`[data-current-field="grade"][data-subject-id="${subjectId}"]`).value;

      if (!updatedName) {
        showToast("Subject name cannot be empty.", "error");
        return;
      }

      if (!isFiniteNumber(updatedCredits) || updatedCredits <= 0) {
        showToast("Credits must be greater than zero.", "error");
        return;
      }

      state.semesterSubjects = state.semesterSubjects.map((item) =>
        item.id === subjectId ? { ...item, name: updatedName, credits: updatedCredits, grade: updatedGrade } : item
      );
      state.editingSubjectId = null;
      resetSubjectForm();
      showToast("Subject saved.", "success");
      renderAll();
      return;
    }

    if (action === "delete") {
      confirmAndRun("Delete this subject?", () => {
        state.semesterSubjects = state.semesterSubjects.filter((item) => item.id !== subjectId);
        if (state.editingSubjectId === subjectId) {
          resetSubjectForm();
        }
        showToast("Subject deleted.", "success");
        renderAll();
      });
    }
  }

  function handleSemesterAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const semesterId = button.dataset.semesterId;
    const action = button.dataset.action;
    const semester = state.semesters.find((item) => item.id === semesterId);

    if (!semester) {
      return;
    }

    if (action === "load-semester") {
      state.semesterSubjects = semester.subjects.map((subject) => ({ ...subject, id: crypto.randomUUID() }));
      state.editingSemesterId = semesterId;
      state.editingSubjectId = null;
      resetSubjectForm();
      showToast(`Semester ${semester.semesterNumber} loaded for editing.`, "success");
      renderAll();
      document.getElementById("semester").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (action === "delete-semester") {
      confirmAndRun(`Delete semester ${semester.semesterNumber}?`, () => {
        state.semesters = state.semesters.filter((item) => item.id !== semesterId);
        if (state.editingSemesterId === semesterId) {
          state.editingSemesterId = null;
        }
        showToast("Semester deleted.", "success");
        renderAll();
      });
    }
  }

  function handleFutureClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const semesterId = button.dataset.semesterId;
    const action = button.dataset.action;
    const semester = state.whatIf.futureSemesters.find((item) => item.id === semesterId);

    if (!semester) {
      return;
    }

    if (action === "set-future-mode") {
      semester.mode = button.dataset.mode === "gpa" ? "gpa" : "subjects";
      showToast(`Future semester switched to ${semester.mode === "gpa" ? "direct GPA" : "subjects"} mode.`, "success");
      renderAll();
      return;
    }

    if (action === "delete-future-semester") {
      confirmAndRun("Delete this future semester?", () => {
        state.whatIf.futureSemesters = state.whatIf.futureSemesters.filter((item) => item.id !== semesterId);
        showToast("Future semester deleted.", "success");
        renderAll();
      });
      return;
    }

    if (action === "add-future-subject") {
      const nameInput = dom.futureSemesterList.querySelector(`[data-future-draft="name"][data-semester-id="${semesterId}"]`);
      const creditsInput = dom.futureSemesterList.querySelector(`[data-future-draft="credits"][data-semester-id="${semesterId}"]`);
      const gradeInput = dom.futureSemesterList.querySelector(`[data-future-draft="grade"][data-semester-id="${semesterId}"]`);
      const name = nameInput.value.trim();
      const credits = toNumber(creditsInput.value);

      if (!name || !isFiniteNumber(credits) || credits <= 0) {
        showToast("Enter a valid future subject name and credits.", "error");
        return;
      }

      semester.subjects.push({
        id: crypto.randomUUID(),
        name,
        credits,
        grade: gradeInput.value,
      });

      nameInput.value = "";
      creditsInput.value = "";
      gradeInput.value = "A";
      showToast("Future subject added.", "success");
      renderAll();
      return;
    }

    if (action === "delete-future-subject") {
      confirmAndRun("Delete this future subject?", () => {
        semester.subjects = semester.subjects.filter((item) => item.id !== button.dataset.subjectId);
        showToast("Future subject deleted.", "success");
        renderAll();
      });
    }
  }

  function handleFutureInput(event) {
    const target = event.target;
    const semesterId = target.dataset.semesterId;
    if (!semesterId) {
      return;
    }

    const semester = state.whatIf.futureSemesters.find((item) => item.id === semesterId);
    if (!semester) {
      return;
    }

    if (target.matches("[data-future-title]")) {
      semester.title = target.value.trim() || "Future Semester";
      persist();
      updateWhatIfPreview();
      return;
    }

    if (target.matches("[data-future-direct='credits']")) {
      semester.directCredits = target.value;
      persist();
      updateWhatIfPreview();
      return;
    }

    if (target.matches("[data-future-direct='gpa']")) {
      semester.directGpa = target.value;
      persist();
      updateWhatIfPreview();
      return;
    }

    const subjectId = target.dataset.subjectId;
    if (!subjectId) {
      return;
    }

    const subject = semester.subjects.find((item) => item.id === subjectId);
    if (!subject) {
      return;
    }

    if (target.matches("[data-future-field='name']")) {
      subject.name = target.value;
    } else if (target.matches("[data-future-field='credits']")) {
      subject.credits = target.value;
    } else if (target.matches("[data-future-field='grade']")) {
      subject.grade = target.value;
    }

    persist();
    updateWhatIfPreview();
    updateStatsOnly();
    updateChartOnly();
  }

  function handleWhatIfSummaryInput(event) {
    const { value } = event.target;
    if (event.target === dom.currentCgpaInput) {
      state.whatIf.currentCgpa = value;
    } else if (event.target === dom.completedCreditsInput) {
      state.whatIf.completedCredits = value;
    }

    persist();
    updateWhatIfPreview();
  }

  function addFutureSemester() {
    state.whatIf.futureSemesters.push({
      id: crypto.randomUUID(),
      title: `Future Semester ${state.whatIf.futureSemesters.length + 1}`,
      mode: "subjects",
      directCredits: "",
      directGpa: "",
      subjects: [],
      editingSubjectId: null,
    });

    showToast("Future semester added.", "success");
    renderAll();
  }

  function saveCurrentSemester() {
    const totals = calculateSemester(state.semesterSubjects);

    if (!state.semesterSubjects.length) {
      showToast("Add at least one subject before saving.", "error");
      return;
    }

    const semesterPayload = {
      id: state.editingSemesterId || crypto.randomUUID(),
      semesterNumber: state.editingSemesterId
        ? (state.semesters.find((semester) => semester.id === state.editingSemesterId)?.semesterNumber || state.semesters.length + 1)
        : state.semesters.length + 1,
      subjects: state.semesterSubjects.map((subject) => ({ ...subject, id: crypto.randomUUID() })),
      totalCredits: totals.totalCredits,
      totalGradePoints: totals.totalGradePoints,
      gpa: totals.gpa,
    };

    if (state.editingSemesterId) {
      state.semesters = state.semesters.map((semester) =>
        semester.id === state.editingSemesterId ? semesterPayload : semester
      );
      showToast(`Semester ${semesterPayload.semesterNumber} updated.`, "success");
    } else {
      state.semesters.push(semesterPayload);
      showToast(`Semester ${semesterPayload.semesterNumber} saved.`, "success");
    }

    state.editingSemesterId = null;
    clearSemesterWorkspace();
    renderAll();
  }

  function clearSemesterWorkspace() {
    state.semesterSubjects = [];
    state.editingSubjectId = null;
    dom.subjectForm.reset();
    dom.subjectSubmitBtn.textContent = "Add Subject";
    dom.subjectCancelBtn.classList.add("hidden");
    dom.subjectGrade.value = "O";
  }

  function resetSubjectForm() {
    dom.subjectForm.reset();
    dom.subjectGrade.value = "O";
    dom.subjectSubmitBtn.textContent = state.editingSubjectId ? "Update Subject" : "Add Subject";
    dom.subjectCancelBtn.classList.toggle("hidden", !state.editingSubjectId);
  }

  function cancelSubjectEdit() {
    state.editingSubjectId = null;
    resetSubjectForm();
    renderSemesterSubjects();
  }

  function clearAllData() {
    confirmAndRun("Clear every saved subject, semester, and simulator entry?", () => {
      localStorage.removeItem(STORAGE_KEY);
      Object.assign(state, structuredClone(defaultState));
      populateGradeOptions();
      resetSubjectForm();
      dom.currentCgpaInput.value = "";
      dom.completedCreditsInput.value = "";
      renderAll();
      showToast("All data cleared.", "success");
    });
  }


  function confirmAndRun(message, callback) {
    if (window.confirm(message)) {
      callback();
    }
  }

  function calculateSemester(subjects) {
    const totals = subjects.reduce(
      (accumulator, subject) => {
        const credits = toNumber(subject.credits);
        const gradePoint = getGradePoint(subject.grade);

        if (!isFiniteNumber(credits) || credits <= 0) {
          return accumulator;
        }

        accumulator.totalCredits += credits;
        accumulator.totalGradePoints += credits * gradePoint;
        return accumulator;
      },
      { totalCredits: 0, totalGradePoints: 0 }
    );

    return {
      totalCredits: totals.totalCredits,
      totalGradePoints: totals.totalGradePoints,
      gpa: totals.totalCredits > 0 ? totals.totalGradePoints / totals.totalCredits : 0,
    };
  }

  function calculateOverallCgpa(semesters) {
    const totals = semesters.reduce(
      (accumulator, semester) => {
        const credits = toNumber(semester.totalCredits);
        const gpa = toNumber(semester.gpa);

        if (!isFiniteNumber(credits) || credits <= 0 || !isFiniteNumber(gpa)) {
          return accumulator;
        }

        accumulator.totalCredits += credits;
        accumulator.totalWeighted += credits * gpa;
        return accumulator;
      },
      { totalCredits: 0, totalWeighted: 0 }
    );

    return {
      totalCredits: totals.totalCredits,
      cgpa: totals.totalCredits > 0 ? totals.totalWeighted / totals.totalCredits : 0,
    };
  }

  function calculateProjectedCgpa() {
    const currentCgpa = toNumber(state.whatIf.currentCgpa);
    const completedCredits = toNumber(state.whatIf.completedCredits);
    const baseCredits = isFiniteNumber(completedCredits) && completedCredits > 0 ? completedCredits : 0;
    const baseCgpa = isFiniteNumber(currentCgpa) && currentCgpa >= 0 ? currentCgpa : 0;

    let futureWeighted = 0;
    let futureCredits = 0;

    for (const semester of state.whatIf.futureSemesters) {
      const projection = semester.mode === "gpa" ? getFutureSemesterDirectProjection(semester) : calculateSemester(semester.subjects);
      futureCredits += projection.totalCredits;
      futureWeighted += projection.totalCredits * projection.gpa;
    }

    const totalCredits = baseCredits + futureCredits;
    const weightedCurrent = baseCgpa * baseCredits;
    const projectedCgpa = totalCredits > 0 ? (weightedCurrent + futureWeighted) / totalCredits : 0;
    const delta = projectedCgpa - baseCgpa;

    return {
      cgpa: projectedCgpa,
      message: totalCredits > 0
        ? `${formatNumber(baseCgpa)} → ${formatNumber(projectedCgpa)} (${delta >= 0 ? "+" : ""}${formatNumber(delta)})`
        : "Add current credits and future semesters to see a projection.",
    };
  }

  function getFutureSemesterDirectProjection(semester) {
    const credits = toNumber(semester.directCredits);
    const gpa = toNumber(semester.directGpa);
    return {
      totalCredits: isFiniteNumber(credits) && credits > 0 ? credits : 0,
      totalGradePoints: (isFiniteNumber(credits) && credits > 0 ? credits : 0) * (isFiniteNumber(gpa) ? gpa : 0),
      gpa: isFiniteNumber(gpa) ? gpa : 0,
    };
  }

  function updateWhatIfPreview() {
    const projection = calculateProjectedCgpa();
    dom.projectedCgpaValue.textContent = formatNumber(projection.cgpa);
    dom.projectionDelta.textContent = projection.message;
    dom.heroProjectedCgpa.textContent = formatNumber(projection.cgpa);
    persist();
  }

  function updateStatsOnly() {
    renderStats();
    renderHeroStats();
  }

  function updateChartOnly() {
    drawChart();
  }

  function handleResize() {
    clearTimeout(chartResizeTimer);
    chartResizeTimer = setTimeout(() => drawChart(), 120);
  }

  function drawChart() {
    const canvas = dom.chart;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, rect.width);
    const height = Math.max(260, rect.height || 320);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const semesters = state.semesters
      .slice()
      .sort((left, right) => left.semesterNumber - right.semesterNumber);

    if (!semesters.length) {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();
      ctx.font = "600 16px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Save semesters to see the GPA trend chart.", width / 2, height / 2);
      return;
    }

    const padding = { top: 28, right: 26, bottom: 52, left: 52 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const gpas = semesters.map((semester) => semester.gpa);
    const minY = Math.max(0, Math.min(...gpas) - 0.5);
    const maxY = Math.min(10, Math.max(...gpas) + 0.5);
    const rangeY = Math.max(1, maxY - minY);

    const axisColor = getComputedStyle(document.documentElement).getPropertyValue("--border").trim();
    const textColor = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();
    const lineColor = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();

    ctx.lineWidth = 1;
    ctx.strokeStyle = axisColor;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.font = "500 12px Inter, sans-serif";
    ctx.textAlign = "right";

    for (let tick = 0; tick <= 5; tick += 1) {
      const value = minY + (rangeY / 5) * tick;
      const y = padding.top + chartHeight - (chartHeight / 5) * tick;
      ctx.fillText(formatNumber(value), padding.left - 10, y + 4);
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    const points = semesters.map((semester, index) => ({
      x: semesters.length === 1 ? padding.left + chartWidth / 2 : padding.left + (chartWidth / (semesters.length - 1)) * index,
      y: padding.top + chartHeight - ((semester.gpa - minY) / rangeY) * chartHeight,
      label: `Sem ${semester.semesterNumber}`,
      value: semester.gpa,
    }));

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        const prev = points[index - 1];
        const cpX = (prev.x + point.x) / 2;
        ctx.bezierCurveTo(cpX, prev.y, cpX, point.y, point.x, point.y);
      }
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    points.forEach((point) => {
      ctx.fillStyle = lineColor;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText(point.label, point.x, height - 18);
      ctx.fillText(formatNumber(point.value), point.x, point.y - 14);
    });
  }

  function showToast(message, type = "info") {
    clearTimeout(toastTimer);
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<strong>${type === "error" ? "Action blocked" : type === "success" ? "Success" : "Notice"}</strong><span>${escapeHtml(message)}</span>`;
    dom.toastContainer.appendChild(toast);

    toastTimer = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      setTimeout(() => toast.remove(), 180);
    }, 2800);
  }

  function resetSubjectForm() {
    dom.subjectForm.reset();
    dom.subjectGrade.value = "O";
    dom.subjectSubmitBtn.textContent = state.editingSubjectId ? "Update Subject" : "Add Subject";
    dom.subjectCancelBtn.classList.toggle("hidden", !state.editingSubjectId);
  }

  function formatNumber(value) {
    return Number.isFinite(Number(value)) ? Number(value).toFixed(2) : "0.00";
  }

  function formatInputNumber(value) {
    return value === null || value === undefined || value === "" ? "" : String(value);
  }

  function getGradePoint(grade) {
    return GRADE_SCALE.find((item) => item.label === grade)?.value ?? 0;
  }

  function getValidGrade(grade) {
    return GRADE_SCALE.some((item) => item.label === grade) ? grade : "O";
  }

  function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function isFiniteNumber(value) {
    return Number.isFinite(Number(value));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  const originalRenderAll = renderAll;
  renderAll = function renderAllWrapped() {
    originalRenderAll();
  };

  window.addEventListener("beforeunload", persist);
})();