// ============================================================================
// BuurtBieb.nl — ISBN & Titel Lookup Service
// Bronnen: Open Library (Edities + Works), Google Books (NL + Internationaal),
//          Wikipedia NL/EN samenvatting & ISBN-10 <-> ISBN-13 conversie
// 100% client-side (geen eigen backend of API-key nodig)
// ============================================================================

const ISBN_PRESETS = {
  '9789023496618': {
    title: 'De ontdekking van de hemel',
    author: 'Harry Mulisch',
    genre: 'Literatuur & Roman',
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780140239379-L.jpg?default=false',
    description: 'Klassieke roman over de vriendschap tussen Onno Quist en Max Delius.'
  },
  '9789044543087': {
    title: 'De meeste mensen deugen',
    author: 'Rutger Bregman',
    genre: 'Psychologie & Filosofie',
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780316418539-L.jpg?default=false',
    description: 'Een nieuwe geschiedenis van de mens vol hoopvolle wetenschappelijke inzichten.'
  },
  '9789401607995': {
    title: 'De zeven zussen',
    author: 'Lucinda Riley',
    genre: 'Feelgood & Romantiek',
    cover_url: 'https://covers.openlibrary.org/b/isbn/9781447288589-L.jpg?default=false',
    description: 'Na de plotselinge dood van hun vader komen Maia en haar zussen samen in hun ouderlijk huis.'
  },
  '9789041413680': {
    title: 'Het diner',
    author: 'Herman Koch',
    genre: 'Spanning & Thriller',
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780385346856-L.jpg?default=false',
    description: 'Spannende psychologische roman tijdens een vijfsterrendiner in Amsterdam.'
  },
  '9789048821242': {
    title: 'Sapiens: Een kleine geschiedenis van de mensheid',
    author: 'Yuval Noah Harari',
    genre: 'Geschiedenis & Politiek',
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg?default=false',
    description: 'Hoe veroverde Homo sapiens de aarde? Meeslepende geschiedenis van de mensheid.'
  },
  '9789029538411': {
    title: 'De avond is ongemak',
    author: 'Marieke Lucas Rijneveld',
    genre: 'Literatuur & Roman',
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780571349364-L.jpg?default=false',
    description: 'International Booker Prize winnaar over een gereformeerd boerengezin.'
  },
  '9789021409832': {
    title: 'Grand Hotel Europa',
    author: 'Ilja Leonard Pfeijffer',
    genre: 'Reizen, Cultuur & Taal',
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780374165864-L.jpg?default=false',
    description: 'Meeslepende roman over het oude continent, massatoerisme en de liefde.'
  },
  '9789025442958': {
    title: 'Het hout',
    author: 'Jeroen Brouwers',
    genre: 'Literatuur & Roman',
    cover_url: '',
    description: 'Bekroond met de Libris Literatuur Prijs.'
  }
};

function mapSubjectsToDutchGenre(rawSubjects) {
  const text = (Array.isArray(rawSubjects) ? rawSubjects.join(' ') : String(rawSubjects || '')).toLowerCase();
  if (!text) return 'Literatuur & Roman';
  if (text.includes('thriller') || text.includes('suspense')) return 'Spanning & Thriller';
  if (text.includes('detective') || text.includes('crime') || text.includes('mystery') || text.includes('misdaad')) return 'Detective & Misdaad';
  if (text.includes('fantasy') || text.includes('science fiction') || text.includes('sci-fi') || text.includes('dune')) return 'Fantasy & Sciencefiction';
  if (text.includes('romance') || text.includes('love') || text.includes('feelgood')) return 'Feelgood & Romantiek';
  if (text.includes('cook') || text.includes('food') || text.includes('recipe') || text.includes('kook')) return 'Kookboek, Eten & Lifestyle';
  if (text.includes('history') || text.includes('geschiedenis') || text.includes('war') || text.includes('politics')) return 'Geschiedenis & Politiek';
  if (text.includes('psycholog') || text.includes('philosoph') || text.includes('filosofie')) return 'Psychologie & Filosofie';
  if (text.includes('self-help') || text.includes('health') || text.includes('mindfulness')) return 'Persoonlijke Ontwikkeling & Gezondheid';
  if (text.includes('biograph') || text.includes('memoir')) return 'Biografie & Waargebeurd';
  if (text.includes('science') || text.includes('nature') || text.includes('technology')) return 'Wetenschap, Natuur & Techniek';
  if (text.includes('travel') || text.includes('reizen')) return 'Reizen, Cultuur & Taal';
  if (text.includes('art') || text.includes('design') || text.includes('photography')) return 'Kunst, Design & Fotografie';
  if (text.includes('textbook') || text.includes('education') || text.includes('business') || text.includes('management')) return 'Studie-, Vak- & Managementboek';
  if (text.includes('juvenile') || text.includes('children') || text.includes('young adult') || text.includes('jeugd')) return 'Kinder-, Jeugd- & Young Adult';
  if (text.includes('comic') || text.includes('graphic novel') || text.includes('poetry') || text.includes('poëzie')) return 'Stripboek, Graphic Novel & Poëzie';
  return 'Literatuur & Roman';
}

function normalizeCoverUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let clean = url.trim().replace(/^http:\/\//i, 'https://');
  clean = clean.replace(/([?&])edge=curl(&|$)/i, (match, sep, tail) => {
    if (sep === '?' && tail) return '?';
    return tail ? sep : '';
  });
  if (clean.includes('books.google.') && clean.includes('zoom=1')) {
    clean = clean.replace('zoom=1', 'zoom=2');
  }
  if (clean.includes('covers.openlibrary.org/b/isbn/') && !clean.includes('default=false')) {
    clean += `${clean.includes('?') ? '&' : '?'}default=false`;
  }
  return clean;
}

function trimDescription(raw, maxLen = 360) {
  const clean = String(raw || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return '';
  if (clean.length <= maxLen) return clean;
  const slice = clean.slice(0, maxLen);
  const lastSentenceEnd = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
  if (lastSentenceEnd > Math.floor(maxLen * 0.55)) {
    return slice.slice(0, lastSentenceEnd + 1).trim();
  }
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 40 ? slice.slice(0, lastSpace) : slice).trim() + '…';
}

function stripSubtitle(title) {
  const clean = String(title || '').trim();
  if (!clean) return '';
  return clean.split(/\s*[:(\[]|\s+-\s+/)[0].trim() || clean;
}

function parseIsbnIfValid(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed || !/^[0-9Xx\s-]+$/.test(trimmed)) return null;
  const cleaned = trimmed.replace(/[^0-9Xx]/g, '').toUpperCase();
  return cleaned.length === 10 || cleaned.length === 13 ? cleaned : null;
}

function isbn13To10(isbn13) {
  const s = String(isbn13 || '').replace(/[^0-9]/g, '');
  if (s.length !== 13 || !s.startsWith('978')) return '';
  const core = s.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(core[i]) * (10 - i);
  }
  const rem = (11 - (sum % 11)) % 11;
  const check = rem === 10 ? 'X' : String(rem);
  return core + check;
}

function isbn10To13(isbn10) {
  const s = String(isbn10 || '').replace(/[^0-9Xx]/g, '').toUpperCase();
  if (s.length !== 10 || !/^[0-9]{9}[0-9X]$/.test(s)) return '';
  const core = '978' + s.slice(0, 9);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(core[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return core + String(check);
}

function getIsbnVariants(isbn) {
  const list = [isbn];
  if (isbn.length === 13) {
    const v10 = isbn13To10(isbn);
    if (v10) list.push(v10);
  } else if (isbn.length === 10) {
    const v13 = isbn10To13(isbn);
    if (v13) list.push(v13);
  }
  return list;
}

function pickIsbnFromIdentifiers(identifiers) {
  if (!Array.isArray(identifiers)) return '';
  const isbn13 = identifiers.find((i) => i && i.type === 'ISBN_13' && i.identifier);
  if (isbn13) return String(isbn13.identifier);
  const isbn10 = identifiers.find((i) => i && i.type === 'ISBN_10' && i.identifier);
  return isbn10 ? String(isbn10.identifier) : '';
}

async function fetchWithTimeout(url, timeoutMs = 8000) {
  if (typeof AbortController === 'undefined') {
    return fetch(url);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function searchGoogleBooksVolumes(query, options = {}) {
  const q = String(query || '').trim();
  if (!q) return null;
  try {
    const langPart = options.langRestrict ? `&langRestrict=${encodeURIComponent(options.langRestrict)}` : '';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=8${langPart}`;
    const res = await fetchWithTimeout(url, 8000);
    if (!res.ok) return null;
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    if (items.length === 0) return null;

    let bestTitle = '';
    let bestAuthor = '';
    let bestCover = '';
    let bestDesc = '';
    let bestIsbn = '';
    let allCategories = [];

    for (const item of items) {
      const info = item && item.volumeInfo ? item.volumeInfo : {};
      if (!bestTitle && info.title) bestTitle = info.title;
      if (!bestAuthor && Array.isArray(info.authors) && info.authors.length > 0) {
        bestAuthor = info.authors.join(', ');
      }
      if (!bestIsbn) {
        bestIsbn = pickIsbnFromIdentifiers(info.industryIdentifiers);
      }
      if (!bestDesc && typeof info.description === 'string' && info.description.trim()) {
        bestDesc = trimDescription(info.description, 360);
      }
      if (!bestCover && info.imageLinks) {
        const rawImg =
          info.imageLinks.extraLarge ||
          info.imageLinks.large ||
          info.imageLinks.medium ||
          info.imageLinks.small ||
          info.imageLinks.thumbnail ||
          info.imageLinks.smallThumbnail ||
          '';
        const normalized = normalizeCoverUrl(rawImg);
        if (normalized) bestCover = normalized;
      }
      if (Array.isArray(info.categories)) {
        allCategories = allCategories.concat(info.categories);
      }
    }

    if (!bestTitle && !bestCover) return null;
    return {
      isbn: bestIsbn,
      title: bestTitle,
      author: bestAuthor || 'Onbekende auteur',
      genre: allCategories.length > 0 ? mapSubjectsToDutchGenre(allCategories) : '',
      cover_url: bestCover,
      description: bestDesc,
      source: 'Google Books API'
    };
  } catch (err) {
    console.warn('Google Books lookup fout:', err);
    return null;
  }
}

async function fetchOpenLibraryWorkDescription(workKey) {
  const key = String(workKey || '').trim();
  if (!key || !key.startsWith('/works/')) return '';
  try {
    const res = await fetchWithTimeout(`https://openlibrary.org${key}.json`, 6000);
    if (!res.ok) return '';
    const data = await res.json();
    const rawDesc =
      typeof data.description === 'string'
        ? data.description
        : data.description && typeof data.description.value === 'string'
          ? data.description.value
          : '';
    return trimDescription(rawDesc, 360);
  } catch {
    return '';
  }
}

async function searchOpenLibraryDocs(query) {
  const q = String(query || '').trim();
  if (!q) return null;
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=6&fields=key,title,author_name,cover_i,isbn,subject,first_sentence`;
    const res = await fetchWithTimeout(url, 8000);
    if (!res.ok) return null;
    const data = await res.json();
    const docs = Array.isArray(data.docs) ? data.docs : [];
    if (docs.length === 0) return null;

    const preferred = docs.find((d) => d && d.cover_i) || docs[0];
    const firstWithTitle = docs.find((d) => d && d.title) || preferred;
    const isbnList = Array.isArray(firstWithTitle.isbn) ? firstWithTitle.isbn : [];
    const bestIsbn = isbnList.find((x) => String(x).length === 13) || isbnList[0] || '';
    const rawSentence = firstWithTitle.first_sentence;
    let desc = trimDescription(
      Array.isArray(rawSentence) ? rawSentence[0] : typeof rawSentence === 'string' ? rawSentence : '',
      360
    );

    if (!desc && firstWithTitle.key && String(firstWithTitle.key).startsWith('/works/')) {
      desc = await fetchOpenLibraryWorkDescription(firstWithTitle.key);
    }

    return {
      isbn: bestIsbn,
      title: firstWithTitle.title || '',
      author: Array.isArray(firstWithTitle.author_name)
        ? firstWithTitle.author_name.join(', ')
        : 'Onbekende auteur',
      genre: Array.isArray(firstWithTitle.subject) && firstWithTitle.subject.length > 0
        ? mapSubjectsToDutchGenre(firstWithTitle.subject)
        : '',
      cover_url: preferred && preferred.cover_i
        ? `https://covers.openlibrary.org/b/id/${preferred.cover_i}-L.jpg`
        : '',
      description: desc,
      source: 'Open Library Search'
    };
  } catch (err) {
    console.warn('Open Library Search fout:', err);
    return null;
  }
}

async function fetchOpenLibraryByIsbn(isbn) {
  try {
    const olUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const olRes = await fetchWithTimeout(olUrl, 8000);
    if (!olRes.ok) return null;
    const olData = await olRes.json();
    const entry = olData[`ISBN:${isbn}`];
    if (!entry || !entry.title) return null;

    const authors = Array.isArray(entry.authors)
      ? entry.authors.map((a) => a.name).join(', ')
      : 'Onbekende auteur';
    const rawCover = entry.cover && (entry.cover.large || entry.cover.medium || entry.cover.small);
    const olSubjects = Array.isArray(entry.subjects) ? entry.subjects.map((s) => s.name || s) : [];
    const rawDesc = entry.subtitle || (entry.notes && entry.notes.value) || (typeof entry.notes === 'string' ? entry.notes : '');
    let desc = trimDescription(rawDesc, 360);

    // Haal volledige samenvatting op uit Open Library Works als de editie geen beschrijving heeft
    if (!desc && Array.isArray(entry.works) && entry.works[0] && entry.works[0].key) {
      desc = await fetchOpenLibraryWorkDescription(entry.works[0].key);
    }

    return {
      isbn,
      title: entry.title,
      author: authors,
      genre: olSubjects.length > 0 ? mapSubjectsToDutchGenre(olSubjects) : '',
      cover_url: normalizeCoverUrl(rawCover),
      description: desc,
      source: 'Open Library API'
    };
  } catch (err) {
    console.warn('Open Library lookup niet bereikbaar:', err);
    return null;
  }
}

async function fetchWikipediaSummary(title, author, lang = 'nl') {
  const shortTitle = stripSubtitle(title);
  if (!shortTitle || shortTitle.length < 3) return null;
  const authorClean = author && author !== 'Onbekende auteur' ? String(author).split(',')[0].trim() : '';
  const searchTerm = [shortTitle, authorClean, lang === 'nl' ? 'boek' : 'book'].filter(Boolean).join(' ');
  try {
    const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&srlimit=3&format=json&origin=*`;
    const searchRes = await fetchWithTimeout(searchUrl, 6000);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const hits = (searchData && searchData.query && searchData.query.search) || [];
    if (hits.length === 0) return null;

    const targetNorm = shortTitle.toLowerCase();
    const bestHit = hits.find((h) => {
      const hTitle = String(h.title || '').toLowerCase();
      return hTitle === targetNorm || hTitle.startsWith(targetNorm + ' (') || hTitle.includes(targetNorm);
    });
    if (!bestHit) return null;

    const sumUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestHit.title)}`;
    const sumRes = await fetchWithTimeout(sumUrl, 6000);
    if (!sumRes.ok) return null;
    const sumData = await sumRes.json();
    if (!sumData || sumData.type === 'disambiguation') return null;

    const description = trimDescription(sumData.extract || '', 360);
    const cover_url = normalizeCoverUrl((sumData.thumbnail && sumData.thumbnail.source) || '');
    if (!description && !cover_url) return null;

    return {
      description,
      cover_url,
      source: `Wikipedia (${lang.toUpperCase()})`
    };
  } catch {
    return null;
  }
}

function mergeBookData(base, patch) {
  if (!patch) return base;
  const merged = { ...base };
  if (!merged.isbn && patch.isbn) merged.isbn = patch.isbn;
  if (!merged.title && patch.title) merged.title = patch.title;
  if ((!merged.author || merged.author === 'Onbekende auteur') && patch.author && patch.author !== 'Onbekende auteur') {
    merged.author = patch.author;
  }
  if (!merged.genre && patch.genre) merged.genre = patch.genre;
  if (!merged.cover_url && patch.cover_url) merged.cover_url = patch.cover_url;
  if (!merged.description && patch.description) merged.description = patch.description;
  if (patch.source) {
    if (!merged.source) {
      merged.source = patch.source;
    } else if (!merged.source.includes(patch.source)) {
      merged.source = `${merged.source} + ${patch.source}`;
    }
  }
  return merged;
}

function findPresetByQuery(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return null;
  for (const [isbn, preset] of Object.entries(ISBN_PRESETS)) {
    const hay = `${isbn} ${preset.title} ${preset.author}`.toLowerCase();
    if (hay.includes(q)) {
      return {
        isbn,
        ...preset,
        source: 'BuurtBieb Boekencatalogus (Offline Cache)'
      };
    }
  }
  return null;
}

const coverLookupCache = new Map();
const pendingCoverLookups = new Map();

window.IsbnService = {
  cleanIsbn(raw) {
    return String(raw || '').replace(/[^0-9Xx]/g, '').toUpperCase();
  },

  isbn13To10,
  isbn10To13,
  trimDescription,

  async findCoverByTitleAuthor(title, author) {
    const cleanTitle = String(title || '').trim();
    const shortTitle = stripSubtitle(cleanTitle);
    const cleanAuthor = String(author || '').trim();
    const firstAuthor = cleanAuthor && cleanAuthor !== 'Onbekende auteur' ? cleanAuthor.split(',')[0].trim() : '';
    const query = [shortTitle || cleanTitle, firstAuthor].filter(Boolean).join(' ');
    if (!query) return '';

    const cacheKey = `${cleanTitle.toLowerCase()}||${cleanAuthor.toLowerCase()}`;
    if (coverLookupCache.has(cacheKey)) {
      return coverLookupCache.get(cacheKey);
    }
    if (pendingCoverLookups.has(cacheKey)) {
      return pendingCoverLookups.get(cacheKey);
    }

    const task = (async () => {
      try {
        const structuredQuery = firstAuthor
          ? `intitle:"${shortTitle}" inauthor:"${firstAuthor}"`
          : `intitle:"${shortTitle}"`;
        const gbExact = await searchGoogleBooksVolumes(structuredQuery);
        if (gbExact && gbExact.cover_url) {
          coverLookupCache.set(cacheKey, gbExact.cover_url);
          return gbExact.cover_url;
        }
        const gb = await searchGoogleBooksVolumes(query);
        if (gb && gb.cover_url) {
          coverLookupCache.set(cacheKey, gb.cover_url);
          return gb.cover_url;
        }
        const ol = await searchOpenLibraryDocs(query);
        if (ol && ol.cover_url) {
          coverLookupCache.set(cacheKey, ol.cover_url);
          return ol.cover_url;
        }
        coverLookupCache.set(cacheKey, '');
        return '';
      } finally {
        pendingCoverLookups.delete(cacheKey);
      }
    })();

    pendingCoverLookups.set(cacheKey, task);
    return task;
  },

  async lookupByIsbn(rawInput) {
    const trimmed = String(rawInput || '').trim();
    if (!trimmed) {
      throw new Error('Voer een ISBN (10 of 13 cijfers) of een boektitel / auteur in.');
    }

    const isbn = parseIsbnIfValid(trimmed);
    let result = {
      isbn: isbn || '',
      title: '',
      author: '',
      genre: '',
      cover_url: '',
      description: '',
      source: ''
    };

    if (isbn) {
      const variants = getIsbnVariants(isbn);

      for (const variant of variants) {
        if (result.title && result.cover_url && result.description) break;
        const olEntry = await fetchOpenLibraryByIsbn(variant);
        result = mergeBookData(result, olEntry);

        if (!result.title || !result.cover_url || !result.description) {
          const gbIsbn = await searchGoogleBooksVolumes(`isbn:${variant}`);
          result = mergeBookData(result, gbIsbn);
        }

        if (!result.title) {
          const gbPlain = await searchGoogleBooksVolumes(variant);
          result = mergeBookData(result, gbPlain);
        }

        if (ISBN_PRESETS[variant]) {
          result = mergeBookData(result, {
            isbn: variant,
            ...ISBN_PRESETS[variant],
            source: 'BuurtBieb Boekencatalogus'
          });
        }
      }
    } else {
      const gbNl = await searchGoogleBooksVolumes(trimmed, { langRestrict: 'nl' });
      result = mergeBookData(result, gbNl);

      if (!result.title || !result.cover_url || !result.description) {
        const gbQuery = await searchGoogleBooksVolumes(trimmed);
        result = mergeBookData(result, gbQuery);
      }

      if (!result.title || !result.cover_url || !result.description) {
        const olQuery = await searchOpenLibraryDocs(trimmed);
        result = mergeBookData(result, olQuery);
      }

      if (!result.title) {
        result = mergeBookData(result, findPresetByQuery(trimmed));
      }
    }

    // Extra verrijking op schone titel (zonder ondertitel) + auteur wanneer kaft of samenvatting nog mist
    if (result.title && (!result.cover_url || !result.description)) {
      const shortTitle = stripSubtitle(result.title);
      const firstAuthor =
        result.author && result.author !== 'Onbekende auteur'
          ? String(result.author).split(',')[0].trim()
          : '';
      const structuredQuery = firstAuthor
        ? `intitle:"${shortTitle}" inauthor:"${firstAuthor}"`
        : `intitle:"${shortTitle}"`;

      const gbStructuredNl = await searchGoogleBooksVolumes(structuredQuery, { langRestrict: 'nl' });
      result = mergeBookData(result, gbStructuredNl);

      if (!result.cover_url || !result.description) {
        const gbStructuredAny = await searchGoogleBooksVolumes(structuredQuery);
        result = mergeBookData(result, gbStructuredAny);
      }

      if (!result.cover_url || !result.description) {
        const enrichQuery = [shortTitle, firstAuthor].filter(Boolean).join(' ');
        const olEnrich = await searchOpenLibraryDocs(enrichQuery);
        result = mergeBookData(result, olEnrich);
      }

      // Wikipedia NL (en EN fallback) voor samenvatting van bekende/literaire boeken
      if (!result.description) {
        const wikiNl = await fetchWikipediaSummary(result.title, result.author, 'nl');
        result = mergeBookData(result, wikiNl);
      }
      if (!result.description) {
        const wikiEn = await fetchWikipediaSummary(result.title, result.author, 'en');
        result = mergeBookData(result, wikiEn);
      }
    }

    if (!result.title) {
      throw new Error(
        isbn
          ? `Geen automatische match gevonden voor ISBN ${isbn}. Probeer ook eens te zoeken op boektitel + auteur of vul handmatig in.`
          : `Geen boek gevonden voor "${trimmed}". Probeer een kortere zoekterm of vul titel en auteur handmatig in.`
      );
    }

    return {
      isbn: result.isbn || isbn || '',
      title: result.title,
      author: result.author || 'Onbekende auteur',
      genre: result.genre || 'Literatuur & Roman',
      cover_url: result.cover_url || '',
      description: result.description || '',
      source: result.source || 'Boekzoekservice'
    };
  }
};
