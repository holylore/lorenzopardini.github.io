const NOTE_URL = 'notes/ProjectsHub.md';

// Image shown on each card, matched by project name
const IMAGE_FOR = [
  [/Excel financial modeling/i, 'images/Tableau-viz.png'],
  [/Google Colab Python/i, 'images/all-weather_optimizer.png'],
  [/FinanceCopilot/i, 'images/FinanceCopilot.png'],
  [/DailyDigest/i, 'images/DailyDigest_Workflow.png'],
  [/PreplyCopilot/i, 'images/Notion-CRM_Assistant.png'],
  [/Dify/i, 'images/DifyFail.png'],
];

const STATUS_LABEL = { live: 'Live', progress: 'In progress', dropped: 'Dropped' };

const GROUPS = [
  ['live', 'Live projects'],
  ['progress', 'In progress'],
  ['dropped', 'Dropped projects and what I learned'],
];

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Decides the group from the Status line written in Obsidian
function classify(statusText) {
  const s = (statusText || '').toLowerCase();
  if (/dropped|abandon|retired/.test(s)) return 'dropped';
  if (/progress|paused/.test(s)) return 'progress';
  if (/live/.test(s)) return 'live';
  return 'progress';
}

// Splits the note into projects, next steps and infrastructure, keeping the text as written
function parseNote(text) {
  const lines = text.replace(/\r/g, '').split('\n');
  const projects = [];
  let pending = [];
  let current = null;
  let mode = 'projects';
  const nextLines = [];
  const infraLines = [];

  const flush = () => {
    if (current) {
      projects.push(current);
      current = null;
    }
  };

  for (const line of lines) {
    const heading = /^##\s+(.+)$/.exec(line);
    if (heading) {
      flush();
      const name = heading[1].trim().toLowerCase();
      if (name.startsWith('next steps')) { mode = 'next'; continue; }
      if (name.startsWith('infrastructure')) { mode = 'infra'; continue; }
      mode = 'projects';
      pending.push(line);
      continue;
    }

    if (mode === 'next') { nextLines.push(line); continue; }
    if (mode === 'infra') { infraLines.push(line); continue; }

    const entry = /^- \*\*(.+?)\*\*/.exec(line);
    if (entry) {
      flush();
      current = {
        title: entry[1].replace(/:\s*$/, '').trim(),
        pre: pending,
        entry: line,
        body: [],
      };
      pending = [];
      continue;
    }

    // "Goal - ..." and "Purpose - ..." start the text of the next project
    if (/^(Goal|Purpose)\s*-/i.test(line.trim())) {
      flush();
      pending.push(line);
      continue;
    }

    if (current) current.body.push(line);
    else pending.push(line);
  }
  flush();

  projects.forEach((p, i) => {
    p.index = i;
    p.text = [...p.pre, p.entry, ...p.body].join('\n').trim();
    const statusMatch = /status:\s*(.*)/i.exec(p.text);
    p.statusText = statusMatch ? statusMatch[1].trim() : '';
    p.group = classify(p.statusText);
    p.summary = p.body
      .map((l) => l.trim())
      .find((l) => l
        && !/^https?:/i.test(l)
        && !/^\*/.test(l)
        && !/^Status:/i.test(l)
        && !/^Started/i.test(l)
        && !/^(Goal|Purpose)/i.test(l)) || '';
    const img = IMAGE_FOR.find(([re]) => re.test(p.title));
    p.image = img ? img[1] : '';
  });

  return {
    projects,
    nextText: nextLines.join('\n').trim(),
    infraText: infraLines.join('\n').trim(),
  };
}

function renderIndex(data) {
  const root = document.getElementById('project-groups');
  root.innerHTML = '';

  GROUPS.forEach(([key, label]) => {
    const items = data.projects.filter((p) => p.group === key);
    if (!items.length) return;

    const heading = document.createElement('h3');
    heading.className = 'group-title';
    heading.textContent = label;
    root.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'grid';
    items.forEach((p) => {
      const card = document.createElement('article');
      card.className = 'card reveal';
      card.innerHTML = `
        ${p.image ? `<img src="${p.image}" alt="${escapeHTML(p.title)}">` : ''}
        <span class="eyebrow">${STATUS_LABEL[p.group]}</span>
        <h3>${escapeHTML(p.title)}</h3>
        <p>${escapeHTML(p.summary)}</p>
        <div class="links">
          <a class="btn primary" href="project.html?p=${p.index}">Read more</a>
        </div>`;
      grid.appendChild(card);
    });
    root.appendChild(grid);
  });

  document.getElementById('next-steps').innerHTML = marked.parse(data.nextText);
  document.getElementById('infrastructure').innerHTML = marked.parse(data.infraText);
}

function renderProject(data) {
  const root = document.getElementById('note-content');
  const i = Number(new URLSearchParams(window.location.search).get('p'));
  const p = data.projects[i];
  if (!p) {
    root.innerHTML = '<p>Project not found.</p>';
    return;
  }
  const statusLine = p.statusText
    ? `<span class="eyebrow">${STATUS_LABEL[p.group]} · ${escapeHTML(p.statusText)}</span>`
    : '';
  root.innerHTML = `${statusLine}<h1>${escapeHTML(p.title)}</h1>${marked.parse(p.text)}`;
  document.title = p.title + ' — Lorenzo Pardini';
}

function observeReveal() {
  const items = document.querySelectorAll('.reveal:not(.in)');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

observeReveal();

const projectsRoot = document.getElementById('project-groups');
const noteRoot = document.getElementById('note-content');

if (projectsRoot || noteRoot) {
  fetch(NOTE_URL)
    .then((r) => {
      if (!r.ok) throw new Error('missing');
      return r.text();
    })
    .then((text) => {
      const data = parseNote(text);
      if (projectsRoot) renderIndex(data);
      if (noteRoot) renderProject(data);
      observeReveal();
    })
    .catch(() => {
      if (projectsRoot) {
        projectsRoot.innerHTML = '<p>Projects could not be loaded. Check that notes/ProjectsHub.md exists.</p>';
      }
      if (noteRoot) noteRoot.innerHTML = '<p>Project not found.</p>';
    });
}