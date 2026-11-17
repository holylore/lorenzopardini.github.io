// The note must sit in notes/ with exactly this name on GitHub
const NOTE_URL = 'notes/PoW - Pages.md';

// Only live projects are shown. Add 'progress' or 'dropped' here to show them later.
const SHOW_GROUPS = ['live'];

// Display order, using the names shown on the site
const ORDER = [
  'All-Weather Contrarian Optimizer',
  'Pei Attention CRM',
  'Strategic Portfolio Analysis',
  'DailyDigest',
];

// Image for each card, matched on the Obsidian title (old and new names both work)
const IMAGE_FOR = [
  [/Excel financial modeling|Portfolio Strategic/i, 'images/Tableau-viz.png'],
  [/Google Colab Python|All-Weather/i, 'images/all-weather_optimizer.png'],
  [/DailyDigest|Daily newsletter/i, 'images/DailyDigest_Workflow.png'],
  [/PreplyCopilot|Pei Attention/i, 'images/Notion-CRM_Assistant.png'],
];

// Names shown on the site. Obsidian titles stay as they are.
const DISPLAY_NAME = [
  [/^Excel financial modeling|^Portfolio Strategic/i, 'Strategic Portfolio Analysis'],
  [/^Google Colab Python|^All-Weather/i, 'All-Weather Contrarian Optimizer'],
  [/^PreplyCopilot|^Pei Attention/i, 'Pei Attention CRM'],
  [/^Daily newsletter|^DailyDigest/i, 'DailyDigest'],
];

const STATUS_LABEL = { live: 'Live', progress: 'In progress', dropped: 'Dropped' };

const el = (tag, className) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
};

const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

const rank = (title) => {
  const i = ORDER.indexOf(title);
  return i === -1 ? ORDER.length : i;
};

// Group, decided from the Status line in Obsidian
function classify(statusText) {
  const s = (statusText || '').toLowerCase();
  if (/dropped|abandon|retired/.test(s)) return 'dropped';
  if (/progress|paused/.test(s)) return 'progress';
  if (/live/.test(s)) return 'live';
  return 'progress';
}

// Splits the note into projects and the "What comes next" text
function parseNote(text) {
  const lines = text.replace(/\r/g, '').split('\n');
  const projects = [];
  const nextLines = [];
  let pending = [];
  let current = null;
  let inNext = false;

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
      inNext = heading[1].trim().toLowerCase().startsWith('what comes next');
      if (!inNext) pending.push(line);
      continue;
    }

    if (inNext) { nextLines.push(line); continue; }

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

    // "Goal -" and "Purpose -" lines start the text of the next project
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
    p.isPublic = /github\.com|kaggle\.com/i.test(p.text);
    p.summary = p.body
      .map((l) => l.trim())
      .find((l) => l
        && !/^https?:/i.test(l)
        && !/^\[/.test(l)
        && !/^\*/.test(l)
        && !/^Status:/i.test(l)
        && !/^Started/i.test(l)
        && !/^(Goal|Purpose)/i.test(l)) || '';

    const raw = p.title;
    const img = IMAGE_FOR.find(([re]) => re.test(raw));
    p.image = img ? img[1] : '';
    const name = DISPLAY_NAME.find(([re]) => re.test(raw));
    p.title = name ? name[1] : raw;
  });

  return {
    projects,
    nextText: nextLines.join('\n').trim(),
  };
}

// One card per public project, in a two-column grid
function buildGrid(items) {
  const grid = el('div', 'grid');
  items.forEach((p) => {
    const card = el('article', 'card reveal');
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
  return grid;
}

function renderIndex(data) {
  const root = document.getElementById('project-groups');
  const items = data.projects
    .filter((p) => SHOW_GROUPS.includes(p.group) && p.isPublic)
    .sort((a, b) => rank(a.title) - rank(b.title));

  root.innerHTML = '';
  if (!items.length) {
    root.innerHTML = '<p>No public projects to show yet.</p>';
  } else {
    root.appendChild(buildGrid(items));
  }

  document.getElementById('next-steps').innerHTML = marked.parse(data.nextText);
}

// Turns the links at the start of a paragraph into buttons, coloured by platform.
function makeButtons(root) {
  root.querySelectorAll('p').forEach((p) => {
    const links = [];
    const separators = [];

    for (const node of Array.from(p.childNodes)) {
      const isLink = node.nodeType === 1 && node.tagName === 'A';
      const isSeparator = node.nodeType === 3 && /^[\s·\-–]*$/.test(node.textContent);
      if (isLink) links.push(node);
      else if (isSeparator) separators.push(node);
      else break;
    }

    if (!links.length) return;

    const box = el('div', 'links');
    links.forEach((a) => {
      const href = a.getAttribute('href') || '';
      a.classList.add('btn');
      if (/github\.com/i.test(href)) a.classList.add('btn-github');
      else if (/kaggle\.com/i.test(href)) a.classList.add('btn-kaggle');
      else a.classList.add('btn-other');
      box.appendChild(a);
    });

    separators.forEach((n) => n.remove());
    p.parentNode.insertBefore(box, p);
    if (!p.textContent.trim() && !p.children.length) p.remove();
  });
}

function renderProject(data) {
  const root = document.getElementById('note-content');
  const i = Number(new URLSearchParams(window.location.search).get('p'));
  const p = data.projects[i];
  if (!p) {
    root.innerHTML = '<p>Project not found.</p>';
    return;
  }
  // Only the group label is shown here. The status sentence stays in the body text.
  root.innerHTML = `<span class="eyebrow">${STATUS_LABEL[p.group]}</span><h1>${escapeHTML(p.title)}</h1>${marked.parse(p.text)}`;
  makeButtons(root);
  document.title = `${p.title} — Lorenzo Pardini`;
}

// Fades elements in as they scroll into view
function observeReveal() {
  const items = document.querySelectorAll('.reveal:not(.in)');
  if (!('IntersectionObserver' in window)) {
    items.forEach((node) => node.classList.add('in'));
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
  items.forEach((node) => io.observe(node));
}

const projectsRoot = document.getElementById('project-groups');
const noteRoot = document.getElementById('note-content');

if (projectsRoot || noteRoot) {
  fetch(NOTE_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`${NOTE_URL} not found (status ${r.status})`);
      return r.text();
    })
    .then((text) => {
      const data = parseNote(text);
      if (projectsRoot) renderIndex(data);
      if (noteRoot) renderProject(data);
      observeReveal();
    })
    .catch((err) => {
      console.error('Projects failed to load:', err);
      const detail = escapeHTML(err && err.message ? err.message : String(err));
      if (projectsRoot) projectsRoot.innerHTML = `<p>Projects could not be loaded (${detail}).</p>`;
      if (noteRoot) noteRoot.innerHTML = `<p>Project not found (${detail}).</p>`;
    });
}

// Static content (hero, timeline, about) animates even if the note fails to load
observeReveal();