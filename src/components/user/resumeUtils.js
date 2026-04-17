// Parse multiline text into structured blocks (header + bullet items)
// Lines starting with •, - or * are treated as bullet items under the current header.
// Other non-empty lines start a new block as header.
export function parseBlocks(text) {
  if (!text) return [];
  const lines = text.split('\n').filter(l => l.trim());
  const blocks = [];
  let current = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[•\-\*]\s*/.test(trimmed)) {
      if (!current) current = { header: '', items: [] };
      current.items.push(trimmed.replace(/^[•\-\*]\s*/, ''));
    } else {
      if (current) blocks.push(current);
      current = { header: trimmed, items: [] };
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

// Split comma or newline-separated text into a flat array
export function toList(text) {
  if (!text) return [];
  if (text.includes(',')) {
    return text.split(',').map(s => s.trim()).filter(Boolean);
  }
  return text.split('\n').map(s => s.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
}

// Serialize structured experiences → flat text for templates
export function serializeExperiences(experiences) {
  if (!experiences || !experiences.length) return '';
  return experiences
    .filter(e => e.empresa || e.cargo)
    .map(e => {
      const period = e.atual ? `${e.inicio} a Atual` : `${e.inicio}${e.fim ? ` a ${e.fim}` : ''}`;
      const header = `${e.empresa} — ${e.cargo}${period ? ` — ${period}` : ''}`;
      const funcs = (e.funcoes || []).filter(f => f.trim()).map(f => `• ${f}`);
      return [header, ...funcs].join('\n');
    })
    .join('\n\n');
}

// Serialize structured education → flat text
export function serializeEducation(education) {
  if (!education || !education.length) return '';
  return education
    .filter(e => e.curso || e.instituicao)
    .map(e => {
      const parts = [e.curso, e.instituicao, e.ano].filter(Boolean);
      return parts.join(' — ');
    })
    .join('\n');
}

// Serialize structured courses → flat text
export function serializeCourses(courses) {
  if (!courses || !courses.length) return '';
  return courses
    .filter(c => c.nome)
    .map(c => {
      const parts = [c.nome, c.instituicao, c.ano].filter(Boolean);
      return parts.join(' — ');
    })
    .join('\n');
}

// Serialize skills array → comma-separated string
export function serializeSkills(skills) {
  if (!skills || !skills.length) return '';
  return skills.join(', ');
}

// Serialize structured languages → comma-separated string
export function serializeLanguages(languages) {
  if (!languages || !languages.length) return '';
  return languages
    .filter(l => l.idioma)
    .map(l => `${l.idioma} (${l.nivel})`)
    .join(', ');
}
