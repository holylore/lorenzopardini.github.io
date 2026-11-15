const NOTE_URL = 'notes/ProjectsHub.md';

// Only these groups are shown. Add 'progress' or 'dropped' here to show them again later.
const SHOW_GROUPS = ['live'];

// Card image, matched on the title as written in Obsidian
const IMAGE_FOR = [
  [/Excel financial modeling/i, 'images/Tableau-viz.png'],
  [/Google Colab Python/i, 'images/all-weather_optimizer.png'],
  [/FinanceCopilot/i, 'images/FinanceCopilot.png'],
  [/DailyDigest/i, 'images/DailyDigest_Workflow.png'],
  [/PreplyCopilot/i, 'images/Notion-CRM_Assistant.png'],
  [/Dify/i, 'images/DifyFail.png'],
];

// Names shown on the site. The Obsidian titles stay as they are.
const DISPLAY_NAME = [
  [/^Excel financial modeling/i, 'Strategic Portfolio Analysis'],
  [/^Google Colab Python/i, 'All-Weather Contrarian Optimizer'],
  [/^PreplyCopilot, CRM for Pei/i, 'PreplyCopilot, CRM for Pei (my GF)'],
];

const STATUS_LABEL = { live: 'Live', progress: 'In progress', dropped: 'Dropped' };

// Display order of the projects on the site. Projects not listed here appear last.
// Use the names as they appear on the site, one per line.
const ORDER = [
  'PreplyCopilot, CRM for Pei (my GF)',
  'All-Weather Contrarian Optimizer',
  'Strategic Portfolio Analysis',
  'Daily newsletter (DailyDigest)',
];

function rank(title) {
  const i = ORDER.indexOf(title);
  return i === -1 ? 999 : i;
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

// Filter category, decided from the project title
function categoryOf(raw) {
  if (/excel|colab|financecopilot/i.test(raw)) return 'Finance';
  if (/chess/i.test(raw)) return 'Data';
  return 'AI & Automation';
}

// Group, decided from the Status line written in Obsidian
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

    // A project is public when its note links to GitHub or Kaggle
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
    p.category = categoryOf(raw);
    const name = DISPLAY_NAME.find(([re]) => re.test(raw));
    p.title = name ? name[1] : raw;
  });

  return {
    projects,
    nextText: nextLines.join('\n').trim(),
    infraText: infraLines.join('\n').trim(),
  };
}

// One carousel: arrows on each side of the track, dots underneath
function buildCarousel(items) {
  const carousel = el('div', 'carousel');
  const stage = el('div', 'stage');

  const prev = el('button', 'nav-btn prev');
  prev.setAttribute('aria-label', 'Previous project');
  prev.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>';

  const track = el('div', 'track');
  items.forEach((p) => {
    const slide = el('div', 'slide');
    slide.dataset.cat = p.category;

    const card = el('article', 'card reveal');
    card.innerHTML = `
      ${p.image ? `<img src="${p.image}" alt="${escapeHTML(p.title)}">` : ''}
      <span class="eyebrow">${STATUS_LABEL[p.group]}</span>
      <h3>${escapeHTML(p.title)}</h3>
      <p>${escapeHTML(p.summary)}</p>
      <div class="links">
        <a class="btn primary" href="project.html?p=${p.index}">Read more</a>
      </div>`;
    slide.appendChild(card);
    track.appendChild(slide);
  });

  const next = el('button', 'nav-btn next');
  next.setAttribute('aria-label', 'Next project');
  next.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>';

  const dots = el('div', 'dots');

  stage.append(prev, track, next);
  carousel.append(stage, dots);
  return carousel;
}

// Wires one carousel: arrows, dots, and disabled states at the ends
function initCarousel(carousel) {
  const track = carousel.querySelector('.track');
  const prev = carousel.querySelector('.prev');
  const next = carousel.querySelector('.next');
  const dotsBox = carousel.querySelector('.dots');

  const visibleSlides = () => Array.from(track.querySelectorAll('.slide')).filter((s) => !s.hidden);

  // Distance from one card to the next: card width plus the gap
  const stepSize = () => {
    const first = visibleSlides()[0];
    if (!first) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return first.offsetWidth + gap;
  };

  const currentIndex = () => {
    const step = stepSize();
    return step ? Math.round(track.scrollLeft / step) : 0;
  };

  function renderDots() {
    dotsBox.innerHTML = '';
    visibleSlides().forEach((_, i) => {
      const dot = el('button', 'dot');
      dot.setAttribute('aria-label', `Show project ${i + 1}`);
      dot.addEventListener('click', () => {
        track.scrollTo({ left: i * stepSize(), behavior: 'smooth' });
      });
      dotsBox.appendChild(dot);
    });
  }

  function update() {
    const count = visibleSlides().length;
    const index = currentIndex();
    Array.from(dotsBox.children).forEach((dot, i) => dot.classList.toggle('active', i === index));
    prev.disabled = index <= 0;
    next.disabled = index >= count - 1;
  }

  prev.addEventListener('click', () => track.scrollBy({ left: -stepSize(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: stepSize(), behavior: 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });

  // Used by the filters: go back to the first card and rebuild the dots
  carousel.refresh = () => {
    track.scrollLeft = 0;
    renderDots();
    update();
  };

  renderDots();
  update();
}

function renderIndex(data) {
  const root = document.getElementById('project-groups');
  root.innerHTML = '';

  // The group heading is shown only when more than one group is visible
  const showHeading = SHOW_GROUPS.length > 1;

  GROUPS
    .filter(([key]) => SHOW_GROUPS.includes(key))
    .forEach(([key, label]) => {
            const items = data.projects
        .filter((p) => p.group === key && p.isPublic)
        .sort((a, b) => rank(a.title) - rank(b.title));
      if (!items.length) return;

      const group = el('div', 'group');
      if (showHeading) group.innerHTML = `<h3 class="group-title">${label}</h3>`;
      group.appendChild(buildCarousel(items));
      root.appendChild(group);
    });

  if (!root.children.length) {
    root.innerHTML = '<p>No public projects to show yet.</p>';
  }

  root.querySelectorAll('.carousel').forEach(initCarousel);

  document.getElementById('next-steps').innerHTML = marked.parse(data.nextText);
  document.getElementById('infrastructure').innerHTML = marked.parse(data.infraText);
}

// Filter buttons: All, Finance, AI & Automation, Data
function setupFilters() {
  const buttons = document.querySelectorAll('[data-filter]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.toggle('active', b === btn));
      const choice = btn.dataset.filter;

      document.querySelectorAll('#project-groups .carousel').forEach((carousel) => {
        const slides = carousel.querySelectorAll('.slide');
        slides.forEach((slide) => {
          slide.hidden = !(choice === 'All' || slide.dataset.cat === choice);
        });

        // Hide the group when none of its slides are visible
        const anyVisible = Array.from(slides).some((s) => !s.hidden);
        carousel.closest('.group').hidden = !anyVisible;

        carousel.refresh();
      });
    });
  });
}

// Turns the links at the start of a paragraph into buttons, coloured by platform.
// Any description text after the links stays in the paragraph, unchanged.
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

    if (p.textContent.trim() === '' && p.children.length === 0) p.remove();
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
  const statusLine = p.statusText
    ? `<span class="eyebrow">${STATUS_LABEL[p.group]} · ${escapeHTML(p.statusText)}</span>`
    : '';
  root.innerHTML = `${statusLine}<h1>${escapeHTML(p.title)}</h1>${marked.parse(p.text)}`;
  makeButtons(root);
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
      if (projectsRoot) {
        renderIndex(data);
        setupFilters();
      }
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