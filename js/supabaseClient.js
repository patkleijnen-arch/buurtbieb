// ============================================================================
// BuurtBieb.nl — Hybride Client Data, Live Supabase Sync & Testmodus Laag
// Ondersteunt twee standen:
//   1. 'live'    -> Gedeelde Supabase PostgreSQL database + Realtime updates
//   2. 'sandbox' -> Lokale testmodus (alleen eigen browser-opslag, veilig testen)
// ============================================================================

const SUPABASE_URL = 'https://rvntqwsueypqwdddgill.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bnRxd3N1ZXlwcXdkZGRnaWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMDU5NTUsImV4cCI6MjEwOTY4MTk1NX0.BX2w62GA06M-61yi8LmSh2ukn3D0La8MqfN5h8KiH7k';

const DATA_MODE_KEY = 'buurtbieb_data_mode_v2';

const LIVE_STORAGE_KEYS = {
  SESSION_USER: 'buurtbieb_live_user_v2',
  PROFILES: 'buurtbieb_live_profiles_v2',
  BOOKS: 'buurtbieb_live_books_v2',
  STAMPS: 'buurtbieb_live_stamps_v2',
  REQUESTS: 'buurtbieb_live_requests_v2',
  CONVERSATIONS: 'buurtbieb_live_conversations_v2',
  MESSAGES: 'buurtbieb_live_messages_v2',
  WANTED_BOOKS: 'buurtbieb_live_wanted_books_v2'
};

const SANDBOX_STORAGE_KEYS = {
  SESSION_USER: 'buurtbieb_sandbox_user_v2',
  PROFILES: 'buurtbieb_sandbox_profiles_v2',
  BOOKS: 'buurtbieb_sandbox_books_v2',
  STAMPS: 'buurtbieb_sandbox_stamps_v2',
  REQUESTS: 'buurtbieb_sandbox_requests_v2',
  CONVERSATIONS: 'buurtbieb_sandbox_conversations_v2',
  MESSAGES: 'buurtbieb_sandbox_messages_v2',
  WANTED_BOOKS: 'buurtbieb_sandbox_wanted_books_v2'
};

const LEGACY_V1_KEYS = [
  'buurtbieb_current_user_v1',
  'buurtbieb_profiles_v1',
  'buurtbieb_books_v1',
  'buurtbieb_stamps_v1',
  'buurtbieb_requests_v1',
  'buurtbieb_conversations_v1',
  'buurtbieb_messages_v1',
  'buurtbieb_wanted_books_v1',
  'buurtbieb_data_mode_v1',
  'buurtbieb_sandbox_backup_v1'
];

const PRELAUNCH_TEST_IDS = [
  'user-1794750419921',
  'book-1794750499959',
  'stamp-1794750499962',
  'req-1794751005951',
  'prof-utrecht-01',
  'prof-amsterdam-02',
  'prof-groningen-03',
  'prof-haarlem-04',
  'user-1',
  'user-2',
  'user-3',
  'book-01',
  'book-02',
  'book-03',
  'book-04',
  'book-05',
  'book-06',
  'book-07',
  'book-08',
  'book-mp-01',
  'book-mp-02',
  'book-mp-03',
  'book-mp-04',
  'book-1',
  'book-2',
  'book-3',
  'book-4',
  'book-5',
  'book-6',
  'book-7',
  'book-8',
  'book-9',
  'book-10',
  'book-11',
  'book-12',
  'stamp-101',
  'stamp-102',
  'stamp-103',
  'stamp-104',
  'stamp-1',
  'stamp-2',
  'stamp-3',
  'stamp-4',
  'stamp-5',
  'stamp-6',
  'stamp-7',
  'stamp-8',
  'stamp-9',
  'stamp-10',
  'conv-seed-01',
  'conv-seed-02',
  'msg-seed-01',
  'msg-seed-02',
  'msg-seed-03',
  'wanted-01',
  'wanted-02',
  'wanted-1',
  'wanted-2',
  'wanted-3'
];

class BuurtBiebDatabase {
  constructor() {
    this.supabaseUrl = SUPABASE_URL;
    this.supabaseKey = SUPABASE_ANON_KEY;
    this.sbClient = null;
    this.accessToken = null;
    this.authUserId = null;
    this.realtimeChannel = null;
    this.pollTimer = null;
    this.syncDebounceTimer = null;
    this.inFlightWrites = 0;
    this.syncPendingAfterWrite = false;
    this.lastSyncAt = null;
    this.lastSyncError = null;
    this.realtimeConnected = false;
    this._legacySeedIds = null;

    // Optioneel schakelen via ?test=1 of ?test=0 in URL
    try {
      const searchStr = typeof window !== 'undefined' && window.location ? window.location.search : '';
      if (searchStr) {
        const params = new URLSearchParams(searchStr);
        const testParam = params.get('test');
        if (testParam === '1' || testParam === 'true') {
          localStorage.setItem(DATA_MODE_KEY, 'sandbox');
        } else if (testParam === '0' || testParam === 'false') {
          localStorage.setItem(DATA_MODE_KEY, 'live');
        }
      }
    } catch {}

    this.syncStatus = this.isLiveMode() ? 'syncing' : 'sandbox';

    this.initStorage();

    if (this.isLiveMode()) {
      this.syncFromSupabase(true);
      this.initRealtimeAndPolling();
    }
  }

  // ==========================================================================
  // 0. LIVE SUPABASE VS. GEHEIME ZANDBAK-TESTMODUS (STRIKT GESCHEIDEN)
  // ==========================================================================
  get keys() {
    return this.isLiveMode() ? LIVE_STORAGE_KEYS : SANDBOX_STORAGE_KEYS;
  }

  getDataMode() {
    try {
      return localStorage.getItem(DATA_MODE_KEY) === 'sandbox' ? 'sandbox' : 'live';
    } catch {
      return 'live';
    }
  }

  isLiveMode() {
    return this.getDataMode() === 'live';
  }

  getLegacySeedIdSet() {
    if (this._legacySeedIds) return this._legacySeedIds;
    const ids = new Set(PRELAUNCH_TEST_IDS);
    const seed = window.BUURTBIEB_SEED || {};
    ['profiles', 'books', 'stamps', 'wanted_books', 'conversations', 'messages'].forEach((k) => {
      (seed[k] || []).forEach((item) => {
        if (item && item.id) ids.add(String(item.id));
      });
    });
    this._legacySeedIds = ids;
    return ids;
  }

  isSeedRow(row) {
    if (!row || !row.id) return false;
    return this.getLegacySeedIdSet().has(String(row.id));
  }

  getConnectionStatus() {
    return {
      mode: this.getDataMode(),
      syncStatus: this.syncStatus,
      lastSyncAt: this.lastSyncAt,
      lastSyncError: this.lastSyncError,
      realtimeConnected: this.realtimeConnected
    };
  }

  setDataMode(mode) {
    const nextMode = mode === 'sandbox' ? 'sandbox' : 'live';
    try {
      localStorage.setItem(DATA_MODE_KEY, nextMode);
    } catch {}

    if (nextMode === 'sandbox') {
      this.stopRealtimeAndPolling();
      this.ensureSandboxSeeded();
      this.syncStatus = 'sandbox';
      this.lastSyncError = null;
      this.triggerUiRefresh();
    } else {
      this.syncStatus = 'syncing';
      this.initRealtimeAndPolling();
      this.syncFromSupabase(true);
      this.triggerUiRefresh();
    }
    return nextMode;
  }

  async resetDemoData() {
    const seed = window.BUURTBIEB_SEED || {};
    const freshProfiles = JSON.parse(JSON.stringify(seed.profiles || []));
    const freshBooks = JSON.parse(JSON.stringify(seed.books || []));
    const freshStamps = JSON.parse(JSON.stringify(seed.stamps || []));
    const freshConvs = JSON.parse(JSON.stringify(seed.conversations || []));
    const freshMsgs = JSON.parse(JSON.stringify(seed.messages || []));
    const freshWanted = JSON.parse(JSON.stringify(seed.wanted_books || []));

    localStorage.setItem(SANDBOX_STORAGE_KEYS.PROFILES, JSON.stringify(freshProfiles));
    localStorage.setItem(SANDBOX_STORAGE_KEYS.BOOKS, JSON.stringify(freshBooks));
    localStorage.setItem(SANDBOX_STORAGE_KEYS.STAMPS, JSON.stringify(freshStamps));
    localStorage.setItem(SANDBOX_STORAGE_KEYS.REQUESTS, JSON.stringify([]));
    localStorage.setItem(SANDBOX_STORAGE_KEYS.CONVERSATIONS, JSON.stringify(freshConvs));
    localStorage.setItem(SANDBOX_STORAGE_KEYS.MESSAGES, JSON.stringify(freshMsgs));
    localStorage.setItem(SANDBOX_STORAGE_KEYS.WANTED_BOOKS, JSON.stringify(freshWanted));

    try {
      const rawSandboxUser = localStorage.getItem(SANDBOX_STORAGE_KEYS.SESSION_USER);
      const current = rawSandboxUser ? JSON.parse(rawSandboxUser) : null;
      if (current) {
        const matched = freshProfiles.find(
          (p) => p.id === current.id || p.email.toLowerCase() === (current.email || '').toLowerCase()
        );
        if (matched) {
          localStorage.setItem(SANDBOX_STORAGE_KEYS.SESSION_USER, JSON.stringify(matched));
        } else {
          localStorage.removeItem(SANDBOX_STORAGE_KEYS.SESSION_USER);
        }
      }
    } catch {}

    this.triggerUiRefresh();
    return true;
  }

  // ==========================================================================
  // 0B. SUPABASE REST + REALTIME HELPERS
  // ==========================================================================
  getSupabaseClient() {
    if (this.sbClient) return this.sbClient;
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        this.sbClient = window.supabase.createClient(this.supabaseUrl, this.supabaseKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
        this.initSupabaseAuthListener();
      } catch {
        this.sbClient = null;
      }
    }
    return this.sbClient;
  }

  initSupabaseAuthListener() {
    if (!this.sbClient || this._authListenerBound) return;
    this._authListenerBound = true;
    try {
      this.sbClient.auth.getSession().then(({ data }) => {
        const session = data && data.session;
        if (session && session.access_token) {
          this.accessToken = session.access_token;
          this.authUserId = session.user?.id || null;
          this.hydrateProfileFromAuthUser(session.user);
        }
      }).catch(() => {});

      this.sbClient.auth.onAuthStateChange((_event, session) => {
        this.accessToken = session?.access_token || null;
        this.authUserId = session?.user?.id || null;
        if (session && session.user && this.isLiveMode()) {
          this.hydrateProfileFromAuthUser(session.user);
          this.scheduleSyncFromSupabase(200);
        }
      });
    } catch {}
  }

  hydrateProfileFromAuthUser(authUser) {
    if (!authUser || !authUser.id || !this.isLiveMode()) return;
    try {
      const profiles = this.getLocalProfiles();
      const existing = profiles.find((p) => p.id === authUser.id);
      const metaName = authUser.user_metadata?.bieb_name || authUser.user_metadata?.full_name || '';
      const email = String(authUser.email || '').trim().toLowerCase();
      const biebName =
        (existing && existing.bieb_name) ||
        metaName ||
        this.makeUniqueBiebNameFromEmail(email || 'Lezer');
      const profile = existing
        ? { ...existing, email: email || existing.email || '', needsOnboarding: false }
        : {
            id: authUser.id,
            email,
            bieb_name: biebName,
            has_physical_box: false,
            postal_code_4: '',
            postal_code_full: '',
            street_address: '',
            city: '',
            lat: null,
            lng: null,
            theme: 'klassiek_hout',
            contact_methods: ['in_app_chat'],
            whatsapp_number: '',
            books_shared_count: 0,
            needsOnboarding: false,
            created_at: new Date().toISOString()
          };
      if (!existing) {
        profiles.push(profile);
        localStorage.setItem(LIVE_STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
        this.sbUpsert('profiles', this.toDbProfile(profile));
      }
      localStorage.setItem(LIVE_STORAGE_KEYS.SESSION_USER, JSON.stringify(profile));
      this.triggerUiRefresh();
    } catch {}
  }

  getRestHeaders(extra = {}) {
    const bearer = this.accessToken || this.supabaseKey;
    return {
      apikey: this.supabaseKey,
      Authorization: `Bearer ${bearer}`,
      'Content-Type': 'application/json',
      ...extra
    };
  }

  async sbFetchJson(pathAndQuery) {
    const res = await fetch(`${this.supabaseUrl}/rest/v1/${pathAndQuery}`, {
      method: 'GET',
      headers: this.getRestHeaders()
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Supabase GET ${pathAndQuery} (${res.status}): ${txt}`);
    }
    return res.json();
  }

  runBackgroundSyncTask(fn) {
    if (!this.isLiveMode()) return;
    this.inFlightWrites++;
    Promise.resolve()
      .then(fn)
      .then(() => {
        this.lastSyncAt = new Date().toISOString();
        this.lastSyncError = null;
        if (this.syncStatus === 'error') this.syncStatus = 'connected';
      })
      .catch((err) => {
        console.warn('Supabase achtergrond-sync waarschuwing:', err);
        this.lastSyncError = err?.message || 'Synchronisatie mislukt';
      })
      .finally(() => {
        this.inFlightWrites = Math.max(0, this.inFlightWrites - 1);
        if (this.inFlightWrites === 0 && this.syncPendingAfterWrite) {
          this.syncPendingAfterWrite = false;
          this.scheduleSyncFromSupabase(250);
        }
      });
  }

  async sbUpsertImmediate(table, rows) {
    const payload = Array.isArray(rows) ? rows : [rows];
    if (payload.length === 0) return;
    const res = await fetch(`${this.supabaseUrl}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.getRestHeaders({
        Prefer: 'resolution=merge-duplicates,return=minimal'
      }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Supabase UPSERT ${table} (${res.status}): ${txt}`);
    }
  }

  async sbUpdateImmediate(table, matchQuery, patch) {
    const res = await fetch(`${this.supabaseUrl}/rest/v1/${table}?${matchQuery}`, {
      method: 'PATCH',
      headers: this.getRestHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify(patch)
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Supabase PATCH ${table} (${res.status}): ${txt}`);
    }
  }

  async sbDeleteImmediate(table, matchQuery) {
    const res = await fetch(`${this.supabaseUrl}/rest/v1/${table}?${matchQuery}`, {
      method: 'DELETE',
      headers: this.getRestHeaders({ Prefer: 'return=minimal' })
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Supabase DELETE ${table} (${res.status}): ${txt}`);
    }
  }

  async sbRpcImmediate(fnName, params = {}) {
    const res = await fetch(`${this.supabaseUrl}/rest/v1/rpc/${fnName}`, {
      method: 'POST',
      headers: this.getRestHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Supabase RPC ${fnName} (${res.status}): ${txt}`);
    }
  }

  sbUpsert(table, rows) {
    this.runBackgroundSyncTask(() => this.sbUpsertImmediate(table, rows));
  }

  sbUpdate(table, matchQuery, patch) {
    this.runBackgroundSyncTask(() => this.sbUpdateImmediate(table, matchQuery, patch));
  }

  sbDelete(table, matchQuery) {
    this.runBackgroundSyncTask(() => this.sbDeleteImmediate(table, matchQuery));
  }

  sbRpc(fnName, params = {}) {
    this.runBackgroundSyncTask(() => this.sbRpcImmediate(fnName, params));
  }

  // Row mappers (Zorgt dat alleen geldige tabelkolommen worden verstuurd)
  toDbProfile(p) {
    return {
      id: p.id,
      email: '',
      bieb_name: String(p.bieb_name || ''),
      has_physical_box: Boolean(p.has_physical_box),
      postal_code_4: String(p.postal_code_4 || ''),
      postal_code_full: String(p.postal_code_full || ''),
      street_address: p.has_physical_box ? String(p.street_address || '') : '',
      city: String(p.city || ''),
      lat: p.has_physical_box && typeof p.lat === 'number' && Number.isFinite(p.lat) ? p.lat : null,
      lng: p.has_physical_box && typeof p.lng === 'number' && Number.isFinite(p.lng) ? p.lng : null,
      theme: p.theme || 'klassiek_hout',
      contact_methods: Array.isArray(p.contact_methods) ? p.contact_methods : ['in_app_chat'],
      whatsapp_number: String(p.whatsapp_number || ''),
      books_shared_count: Number(p.books_shared_count || 0),
      needs_onboarding: false,
      updated_at: new Date().toISOString()
    };
  }

  fromDbProfile(row) {
    return {
      id: row.id,
      email: row.email || '',
      bieb_name: row.bieb_name || '',
      has_physical_box: Boolean(row.has_physical_box),
      postal_code_4: row.postal_code_4 || '',
      postal_code_full: row.postal_code_full || '',
      street_address: row.street_address || '',
      city: row.city || '',
      lat: typeof row.lat === 'number' && Number.isFinite(row.lat) ? row.lat : null,
      lng: typeof row.lng === 'number' && Number.isFinite(row.lng) ? row.lng : null,
      theme: row.theme || 'klassiek_hout',
      contact_methods: Array.isArray(row.contact_methods) ? row.contact_methods : ['in_app_chat'],
      whatsapp_number: row.whatsapp_number || '',
      books_shared_count: Number(row.books_shared_count || 0),
      needsOnboarding: false,
      created_at: row.created_at
    };
  }

  toDbBook(b) {
    return {
      id: b.id,
      owner_id: b.owner_id,
      owner_bieb_name: String(b.owner_bieb_name || ''),
      owner_whatsapp: String(b.owner_whatsapp || ''),
      isbn: String(b.isbn || ''),
      title: String(b.title || ''),
      author: String(b.author || ''),
      cover_url: String(b.cover_url || ''),
      description: String(b.description || ''),
      sticker_type: b.sticker_type || 'zwerfboek',
      genre: b.genre || b.market_category || 'Literatuur & Roman',
      market_category: b.market_category || b.genre || 'Literatuur & Roman',
      book_language: String(b.book_language || 'nl'),
      price_eur: Number(b.price_eur || 0),
      book_condition: b.book_condition || 'goed',
      allow_bidding: Boolean(b.allow_bidding),
      pickup_possible: b.pickup_possible !== false,
      self_service_box: Boolean(b.self_service_box),
      shipping_possible: Boolean(b.shipping_possible),
      deposit_type: b.deposit_type || 'geen',
      deposit_amount_eur: Number(b.deposit_amount_eur || 0),
      status: b.status || 'beschikbaar',
      reserved_by_id: b.reserved_by_id || null,
      reserved_by_name: b.reserved_by_name || null,
      reserved_handover: b.reserved_handover || null,
      handover_confirmed: Boolean(b.handover_confirmed),
      handover_completed_count: Number(b.handover_completed_count || 0),
      taken_at: b.taken_at || null,
      postal_code_4: String(b.postal_code_4 || ''),
      city: String(b.city || ''),
      created_at: b.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  fromDbBook(row) {
    return {
      ...row,
      book_language: row.book_language || 'nl',
      price_eur: Number(row.price_eur || 0),
      deposit_amount_eur: Number(row.deposit_amount_eur || 0),
      handover_completed_count: Number(row.handover_completed_count || 0),
      allow_bidding: Boolean(row.allow_bidding),
      pickup_possible: row.pickup_possible !== false,
      self_service_box: Boolean(row.self_service_box),
      shipping_possible: Boolean(row.shipping_possible),
      handover_confirmed: Boolean(row.handover_confirmed)
    };
  }

  toDbStamp(s) {
    return {
      id: s.id,
      book_id: s.book_id,
      reader_name: String(s.reader_name || ''),
      city: String(s.city || ''),
      postal_code_4: String(s.postal_code_4 || ''),
      stamp_style: s.stamp_style || 'poststempel_groen',
      comment: String(s.comment || ''),
      stamped_at: String(s.stamped_at || new Date().toISOString().slice(0, 10))
    };
  }

  toDbWantedBook(w) {
    return {
      id: w.id,
      seeker_id: w.seeker_id,
      seeker_name: String(w.seeker_name || ''),
      postal_code_4: String(w.postal_code_4 || ''),
      city: String(w.city || ''),
      title: String(w.title || ''),
      author: String(w.author || ''),
      genre: w.genre || 'Literatuur & Roman',
      prefer_mode: w.prefer_mode || 'lenen_of_ruilen',
      note: String(w.note || ''),
      created_at: w.created_at || new Date().toISOString()
    };
  }

  toDbRequest(r) {
    return {
      id: r.id,
      book_id: r.book_id,
      book_title: String(r.book_title || ''),
      sticker_type: r.sticker_type || 'zwerfboek',
      requester_id: r.requester_id,
      owner_id: r.owner_id,
      handover_mode: r.handover_mode || 'aan_de_deur_1op1',
      handover_confirmed: Boolean(r.handover_confirmed),
      is_paid: Boolean(r.is_paid),
      status: r.status || 'klaargelegd',
      created_at: r.created_at || new Date().toISOString()
    };
  }

  toDbConversation(c) {
    return {
      id: c.id,
      book_id: c.book_id,
      book_title: String(c.book_title || ''),
      book_author: String(c.book_author || ''),
      book_cover: String(c.book_cover || ''),
      sticker_type: c.sticker_type || 'zwerfboek',
      owner_id: c.owner_id,
      owner_bieb_name: String(c.owner_bieb_name || ''),
      owner_postal: String(c.owner_postal || ''),
      owner_city: String(c.owner_city || ''),
      requester_id: c.requester_id,
      requester_bieb_name: String(c.requester_bieb_name || ''),
      handover_mode: c.handover_mode || 'aan_de_deur_1op1',
      updated_at: c.updated_at || new Date().toISOString()
    };
  }

  toDbMessage(m) {
    return {
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      sender_name: String(m.sender_name || ''),
      body: String(m.body || ''),
      is_read: Boolean(m.is_read),
      created_at: m.created_at || new Date().toISOString()
    };
  }

  triggerUiRefresh() {
    if (typeof window.refreshAllViews === 'function') {
      window.refreshAllViews();
    }
  }

  scheduleSyncFromSupabase(delayMs = 450) {
    if (!this.isLiveMode()) return;
    if (this.inFlightWrites > 0) {
      this.syncPendingAfterWrite = true;
      return;
    }
    clearTimeout(this.syncDebounceTimer);
    this.syncDebounceTimer = setTimeout(() => {
      this.syncFromSupabase(false);
    }, delayMs);
  }

  async syncFromSupabase(showConnecting = false) {
    if (!this.isLiveMode()) return false;
    if (this.inFlightWrites > 0) {
      this.syncPendingAfterWrite = true;
      return false;
    }
    if (showConnecting && this.syncStatus !== 'connected') {
      this.syncStatus = 'syncing';
    }

    try {
      const hasAuthSession = Boolean(this.accessToken);
      const [profiles, books, stamps, wantedBooks, requests, conversations, messages] =
        await Promise.all([
          this.sbFetchJson('profiles?select=id,bieb_name,has_physical_box,postal_code_4,postal_code_full,street_address,city,lat,lng,theme,contact_methods,whatsapp_number,books_shared_count,created_at&order=created_at.asc'),
          this.sbFetchJson('books?select=*&order=created_at.desc'),
          this.sbFetchJson('stamps?select=*&order=created_at.asc'),
          this.sbFetchJson('wanted_books?select=*&order=created_at.desc'),
          hasAuthSession ? this.sbFetchJson('requests?select=*&order=created_at.desc').catch(() => []) : Promise.resolve([]),
          hasAuthSession ? this.sbFetchJson('conversations?select=*&order=updated_at.desc').catch(() => []) : Promise.resolve([]),
          hasAuthSession ? this.sbFetchJson('messages?select=*&order=created_at.asc').catch(() => []) : Promise.resolve([])
        ]);

      // Controleer nogmaals of de gebruiker ondertussen niet naar Sandbox is gewisseld
      if (!this.isLiveMode()) return false;

      const filterSeedOnly = (rawRows) => {
        const list = Array.isArray(rawRows) ? rawRows : [];
        return list.filter((r) => !this.isSeedRow(r));
      };

      const cleanMessages = filterSeedOnly(messages);
      const cleanConversations = filterSeedOnly(conversations);
      const cleanRequests = filterSeedOnly(requests);
      const cleanWantedBooks = filterSeedOnly(wantedBooks);
      const cleanStamps = filterSeedOnly(stamps);
      const cleanBooks = filterSeedOnly(books);
      const cleanProfiles = filterSeedOnly(profiles);

      const normProfilesRaw = cleanProfiles.map((r) => this.fromDbProfile(r));
      const { deduped: normProfiles } = this.dedupeProfilesList(normProfilesRaw);
      const normBooks = cleanBooks.map((r) => this.fromDbBook(r));

      localStorage.setItem(LIVE_STORAGE_KEYS.PROFILES, JSON.stringify(normProfiles));
      localStorage.setItem(LIVE_STORAGE_KEYS.BOOKS, JSON.stringify(normBooks));
      localStorage.setItem(LIVE_STORAGE_KEYS.STAMPS, JSON.stringify(cleanStamps));
      localStorage.setItem(LIVE_STORAGE_KEYS.WANTED_BOOKS, JSON.stringify(cleanWantedBooks));
      localStorage.setItem(LIVE_STORAGE_KEYS.REQUESTS, JSON.stringify(cleanRequests));
      localStorage.setItem(LIVE_STORAGE_KEYS.CONVERSATIONS, JSON.stringify(cleanConversations));
      localStorage.setItem(LIVE_STORAGE_KEYS.MESSAGES, JSON.stringify(cleanMessages));

      // Houd ingelogd Live profiel actueel en koppel direct bij herkend e-mailadres
      try {
        const rawLiveUser = localStorage.getItem(LIVE_STORAGE_KEYS.SESSION_USER);
        const currentLiveUser = rawLiveUser ? JSON.parse(rawLiveUser) : null;
        if (currentLiveUser) {
          if (this.isSeedRow(currentLiveUser)) {
            localStorage.removeItem(LIVE_STORAGE_KEYS.SESSION_USER);
          } else {
            const currentEmail = String(currentLiveUser.email || '').trim().toLowerCase();
            const remoteMatch = normProfiles.find(
              (p) =>
                p.id === currentLiveUser.id ||
                (currentEmail && String(p.email || '').trim().toLowerCase() === currentEmail)
            );
            if (remoteMatch && !remoteMatch.needsOnboarding && remoteMatch.bieb_name) {
              localStorage.setItem(
                LIVE_STORAGE_KEYS.SESSION_USER,
                JSON.stringify({ ...remoteMatch, needsOnboarding: false })
              );
            }
          }
        }
      } catch {}

      this.syncStatus = 'connected';
      this.lastSyncAt = new Date().toISOString();
      this.lastSyncError = null;
      this.triggerUiRefresh();
      return true;
    } catch (err) {
      this.syncStatus = 'error';
      this.lastSyncError = err?.message || 'Kan geen verbinding maken met Supabase.';
      console.warn('Supabase synchronisatie mislukt (lokale cache actief):', err);
      this.triggerUiRefresh();
      return false;
    }
  }

  initRealtimeAndPolling() {
    this.stopRealtimeAndPolling();
    if (!this.isLiveMode()) return;

    const client = this.getSupabaseClient();
    if (client) {
      try {
        this.realtimeChannel = client
          .channel('buurtbieb-public-sync')
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
            this.scheduleSyncFromSupabase(350);
          })
          .subscribe((status) => {
            this.realtimeConnected = status === 'SUBSCRIBED';
          });
      } catch {
        this.realtimeConnected = false;
      }
    }

    if (!this._focusBound) {
      this._focusBound = true;
      window.addEventListener('focus', () => {
        if (this.isLiveMode()) this.scheduleSyncFromSupabase(150);
      });
    }

    this.pollTimer = setInterval(() => {
      if (this.isLiveMode() && !document.hidden) {
        this.syncFromSupabase(false);
      }
    }, 20000);
  }

  stopRealtimeAndPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.realtimeChannel && this.sbClient) {
      try {
        this.sbClient.removeChannel(this.realtimeChannel);
      } catch {}
    }
    this.realtimeChannel = null;
    this.realtimeConnected = false;
  }

  // ==========================================================================
  // 1. LOKALE CACHE INITIALISATIE & OPSCHONING (LIVE = SCHOON, ZANDBAK OP VERZOEK)
  // ==========================================================================
  ensureSandboxSeeded() {
    const seed = window.BUURTBIEB_SEED || {};
    if (!localStorage.getItem(SANDBOX_STORAGE_KEYS.PROFILES)) {
      localStorage.setItem(SANDBOX_STORAGE_KEYS.PROFILES, JSON.stringify(seed.profiles || []));
    }
    if (!localStorage.getItem(SANDBOX_STORAGE_KEYS.BOOKS)) {
      localStorage.setItem(SANDBOX_STORAGE_KEYS.BOOKS, JSON.stringify(seed.books || []));
    }
    if (!localStorage.getItem(SANDBOX_STORAGE_KEYS.STAMPS)) {
      localStorage.setItem(SANDBOX_STORAGE_KEYS.STAMPS, JSON.stringify(seed.stamps || []));
    }
    if (!localStorage.getItem(SANDBOX_STORAGE_KEYS.REQUESTS)) {
      localStorage.setItem(SANDBOX_STORAGE_KEYS.REQUESTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(SANDBOX_STORAGE_KEYS.CONVERSATIONS)) {
      localStorage.setItem(SANDBOX_STORAGE_KEYS.CONVERSATIONS, JSON.stringify(seed.conversations || []));
    }
    if (!localStorage.getItem(SANDBOX_STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(SANDBOX_STORAGE_KEYS.MESSAGES, JSON.stringify(seed.messages || []));
    }
    if (!localStorage.getItem(SANDBOX_STORAGE_KEYS.WANTED_BOOKS)) {
      localStorage.setItem(SANDBOX_STORAGE_KEYS.WANTED_BOOKS, JSON.stringify(seed.wanted_books || []));
    }
  }

  initStorage() {
    // Verwijder verouderde gedeelde v1-sleutels zodat testdata nooit in Live lekt
    LEGACY_V1_KEYS.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });

    // Live opslag start altijd leeg ([]) en filtert eventuele seed/pre-launch rijen weg
    const liveCollectionKeys = [
      LIVE_STORAGE_KEYS.PROFILES,
      LIVE_STORAGE_KEYS.BOOKS,
      LIVE_STORAGE_KEYS.STAMPS,
      LIVE_STORAGE_KEYS.REQUESTS,
      LIVE_STORAGE_KEYS.CONVERSATIONS,
      LIVE_STORAGE_KEYS.MESSAGES,
      LIVE_STORAGE_KEYS.WANTED_BOOKS
    ];
    liveCollectionKeys.forEach((k) => {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) {
          localStorage.setItem(k, JSON.stringify([]));
        } else {
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed)) {
            localStorage.setItem(k, JSON.stringify([]));
          } else {
            const cleaned = parsed.filter((item) => !this.isSeedRow(item));
            if (cleaned.length !== parsed.length) {
              localStorage.setItem(k, JSON.stringify(cleaned));
            }
          }
        }
      } catch {
        localStorage.setItem(k, JSON.stringify([]));
      }
    });

    try {
      const rawLiveSession = localStorage.getItem(LIVE_STORAGE_KEYS.SESSION_USER);
      if (rawLiveSession) {
        const liveSession = JSON.parse(rawLiveSession);
        const sessionEmail = String(liveSession?.email || '').trim().toLowerCase();
        if (this.isSeedRow(liveSession) || sessionEmail.endsWith('@buurtbieb.nl')) {
          localStorage.removeItem(LIVE_STORAGE_KEYS.SESSION_USER);
        } else if (liveSession.needsOnboarding && sessionEmail) {
          const liveProfiles = JSON.parse(localStorage.getItem(LIVE_STORAGE_KEYS.PROFILES) || '[]');
          const matchedProfile = Array.isArray(liveProfiles)
            ? liveProfiles.find(
                (p) =>
                  String(p.email || '').trim().toLowerCase() === sessionEmail &&
                  !p.needsOnboarding &&
                  p.bieb_name
              )
            : null;
          if (matchedProfile) {
            localStorage.setItem(
              LIVE_STORAGE_KEYS.SESSION_USER,
              JSON.stringify({ ...matchedProfile, needsOnboarding: false })
            );
          }
        }
      }
    } catch {}

    if (!this.isLiveMode()) {
      this.ensureSandboxSeeded();
    }
  }

  // ==========================================================================
  // 1B. AUTHENTICATIE (Gebruikersnaam + Wachtwoord & Google Login)
  // ==========================================================================
  hashPassword(rawPassword) {
    const str = `buurtbieb_v1::${String(rawPassword || '')}`;
    let h1 = 0xdeadbeef ^ str.length;
    let h2 = 0x41c6ce57 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (
      'bbpw1_' +
      (h2 >>> 0).toString(16).padStart(8, '0') +
      (h1 >>> 0).toString(16).padStart(8, '0')
    );
  }

  dedupeProfilesList(profiles) {
    const seenEmails = new Set();
    const seenBiebNames = new Set();
    const duplicateIds = [];
    const deduped = [];
    (Array.isArray(profiles) ? profiles : []).forEach((p) => {
      if (!p) return;
      const em = String(p.email || '').trim().toLowerCase();
      const bn = String(p.bieb_name || '').trim().toLowerCase();
      if ((em && seenEmails.has(em)) || (bn && seenBiebNames.has(bn))) {
        if (p.id) duplicateIds.push(p.id);
      } else {
        if (em) seenEmails.add(em);
        if (bn) seenBiebNames.add(bn);
        deduped.push(p);
      }
    });
    return { deduped, duplicateIds };
  }

  isBiebNameTaken(biebName, excludeUserId = null, excludeEmail = null) {
    const target = String(biebName || '').trim().toLowerCase();
    if (!target) return false;
    const exId = excludeUserId ? String(excludeUserId) : '';
    const exMail = excludeEmail ? String(excludeEmail).trim().toLowerCase() : '';
    const profiles = this.getLocalProfiles();
    return profiles.some((p) => {
      if (!p || !p.bieb_name) return false;
      if (exId && String(p.id) === exId) return false;
      if (exMail && String(p.email || '').trim().toLowerCase() === exMail) return false;
      return String(p.bieb_name).trim().toLowerCase() === target;
    });
  }

  async refreshRemoteProfilesCache() {
    if (!this.isLiveMode()) return this.getLocalProfiles();
    try {
      const rows = await this.sbFetchJson('profiles?select=*&order=created_at.asc');
      if (Array.isArray(rows)) {
        const cleanRemote = rows.filter((r) => !this.isSeedRow(r)).map((r) => this.fromDbProfile(r));
        const existingLocal = this.getLocalProfiles();
        const { deduped } = this.dedupeProfilesList([...cleanRemote, ...existingLocal]);
        localStorage.setItem(LIVE_STORAGE_KEYS.PROFILES, JSON.stringify(deduped));
        return deduped;
      }
    } catch {}
    return this.getLocalProfiles();
  }

  async checkBiebNameTakenRemote(biebName, excludeUserId = null, excludeEmail = null) {
    if (this.isBiebNameTaken(biebName, excludeUserId, excludeEmail)) return true;
    await this.refreshRemoteProfilesCache();
    return this.isBiebNameTaken(biebName, excludeUserId, excludeEmail);
  }

  makeUniqueBiebNameFromEmail(email) {
    const localPart = String(email || '').split('@')[0].trim() || 'Lezer';
    const baseRaw = localPart.replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Lezer';
    const base = baseRaw.charAt(0).toUpperCase() + baseRaw.slice(1);
    if (!this.isBiebNameTaken(base)) return base;
    let counter = 2;
    while (this.isBiebNameTaken(`${base}${counter}`)) {
      counter += 1;
    }
    return `${base}${counter}`;
  }

  isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  toAuthEmail(username) {
    const clean = String(username || '').trim().toLowerCase();
    if (clean.includes('@')) return clean;
    const slug = clean.replace(/[^a-z0-9._-]/g, '_').replace(/^_+|_+$/g, '') || 'lezer';
    return `${slug}@users.buurtbieb.nl`;
  }

  async registerWithUsernamePassword({ username, password }) {
    const cleanInput = String(username || '').trim();
    const rawPassword = String(password || '');
    if (this.isLiveMode()) {
      if (!this.isValidEmail(cleanInput)) {
        throw new Error('Vul een geldig e-mailadres in.');
      }
    } else if (cleanInput.length < 2) {
      throw new Error('Vul een geldig e-mailadres in.');
    }
    if (rawPassword.length < 8) {
      throw new Error('Kies een wachtwoord van minimaal 8 tekens.');
    }

    const authEmail = this.isLiveMode() ? cleanInput.toLowerCase() : this.toAuthEmail(cleanInput);
    const defaultBiebName = cleanInput.includes('@')
      ? cleanInput
          .split('@')[0]
          .replace(/[._-]+/g, ' ')
          .trim()
      : cleanInput;

    if (!this.isLiveMode()) {
      const taken = await this.checkBiebNameTakenRemote(cleanInput);
      if (taken) {
        throw new Error(
          `Dit account (${cleanInput}) is al in gebruik. Log in met je wachtwoord.`
        );
      }
    }

    let userId = 'user-' + Date.now();

    if (this.isLiveMode()) {
      const client = this.getSupabaseClient();
      if (!client || !client.auth) {
        throw new Error('Supabase Auth is momenteel niet beschikbaar. Probeer het later opnieuw.');
      }
      const emailRedirectTo =
        typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')
          ? `${window.location.origin}${window.location.pathname}`
          : undefined;
      const { data, error } = await client.auth.signUp({
        email: authEmail,
        password: rawPassword,
        options: {
          ...(emailRedirectTo ? { emailRedirectTo } : {}),
          data: { bieb_name: defaultBiebName }
        }
      });
      if (error) {
        if (/already registered|already exists/i.test(error.message || '')) {
          throw new Error('Er bestaat al een account met dit e-mailadres. Probeer in te loggen.');
        }
        throw new Error(error.message || 'Account aanmaken via Supabase Auth mislukt.');
      }
      if (!data || !data.user) {
        throw new Error('Account aanmaken mislukt.');
      }
      if (!data.session) {
        return {
          mode: 'confirm_email',
          email: authEmail
        };
      }
      userId = data.user.id;
      this.accessToken = data.session.access_token;
      this.authUserId = data.user.id;
    }

    const profiles = this.getLocalProfiles();
    const newProfile = {
      id: userId,
      email: authEmail,
      bieb_name: defaultBiebName || 'BuurtBieb Lezer',
      ...(this.isLiveMode() ? {} : { password_hash: this.hashPassword(rawPassword) }),
      provider: 'password',
      has_physical_box: false,
      postal_code_4: '',
      postal_code_full: '',
      street_address: '',
      city: '',
      lat: null,
      lng: null,
      theme: 'klassiek_hout',
      contact_methods: ['in_app_chat'],
      whatsapp_number: '',
      books_shared_count: 0,
      needsOnboarding: this.isLiveMode(),
      created_at: new Date().toISOString()
    };

    profiles.push(newProfile);
    localStorage.setItem(this.keys.PROFILES, JSON.stringify(profiles));
    localStorage.setItem(this.keys.SESSION_USER, JSON.stringify(newProfile));
    this.sbUpsert('profiles', this.toDbProfile(newProfile));
    if (this.isLiveMode()) {
      this.sbUpsert('profile_private', {
        user_id: newProfile.id,
        email: authEmail,
        whatsapp_number: '',
        updated_at: new Date().toISOString()
      });
    }

    return {
      mode: 'registered',
      profile: newProfile
    };
  }

  async loginWithUsernamePassword({ username, password }) {
    const cleanUsername = String(username || '').trim();
    const rawPassword = String(password || '');
    if (!cleanUsername) {
      throw new Error('Vul je e-mailadres in.');
    }
    if (this.isLiveMode() && !this.isValidEmail(cleanUsername)) {
      throw new Error('Vul een geldig e-mailadres in.');
    }
    if (!rawPassword) {
      throw new Error('Vul je wachtwoord in.');
    }

    if (this.isLiveMode()) {
      const client = this.getSupabaseClient();
      if (!client || !client.auth) {
        throw new Error('Supabase Auth is momenteel niet beschikbaar.');
      }
      const authEmail = cleanUsername.toLowerCase();
      const { data, error } = await client.auth.signInWithPassword({
        email: authEmail,
        password: rawPassword
      });
      if (error || !data || !data.session || !data.user) {
        if (error && /email not confirmed/i.test(error.message || '')) {
          throw new Error('Bevestig eerst je e-mailadres via de link in je mailbox.');
        }
        throw new Error('Onjuist e-mailadres of wachtwoord.');
      }
      this.accessToken = data.session.access_token;
      this.authUserId = data.user.id;
      await this.refreshRemoteProfilesCache();
      this.hydrateProfileFromAuthUser(data.user);
      const current = this.getCurrentUser();
      this.scheduleSyncFromSupabase(100);
      return {
        mode: 'existing_profile',
        profile: current
      };
    }

    const matchUser = (list) =>
      (Array.isArray(list) ? list : []).find((p) => {
        if (!p) return false;
        const bieb = String(p.bieb_name || '').trim().toLowerCase();
        const em = String(p.email || '').trim().toLowerCase();
        const needle = cleanUsername.toLowerCase();
        return bieb === needle || (em && em === needle);
      });

    let profiles = this.getLocalProfiles();
    let existing = matchUser(profiles);

    if (!existing) {
      throw new Error('Geen account gevonden met deze gebruikersnaam. Maak eerst een account aan.');
    }

    const expectedHash = this.hashPassword(rawPassword);
    if (!existing.password_hash) {
      throw new Error('Dit sandbox-account gebruikt geen wachtwoord. Log in met Google of maak een nieuw testaccount aan.');
    } else if (existing.password_hash !== expectedHash) {
      throw new Error('Onjuist wachtwoord voor dit account.');
    }

    const normalized = { ...existing, needsOnboarding: false };
    localStorage.setItem(this.keys.SESSION_USER, JSON.stringify(normalized));
    return {
      mode: 'existing_profile',
      profile: normalized
    };
  }

  async signInWithGoogle(providedEmail) {
    if (this.isLiveMode()) {
      const client = this.getSupabaseClient();
      if (!client || !client.auth) {
        throw new Error('Google Login via Supabase Auth is momenteel niet beschikbaar.');
      }
      const redirectTo =
        typeof window !== 'undefined' && window.location
          ? `${window.location.origin}${window.location.pathname}`
          : undefined;
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      });
      if (error) {
        throw new Error(error.message || 'Google OAuth starten mislukt.');
      }
      return { redirecting: true, provider: 'google' };
    }

    // Alleen in lokale Sandbox-modus: snelle testlogin zonder echte OAuth-redirect
    let email = String(providedEmail || '').trim().toLowerCase();
    if (!email) {
      const inputVal =
        (typeof document !== 'undefined' &&
          document.getElementById('authUsernameInput')?.value?.trim()) ||
        '';
      if (inputVal && inputVal.includes('@')) {
        email = inputVal.toLowerCase();
      } else {
        const prompted = window.prompt(
          'Sandbox testmodus: vul een test e-mailadres in voor Google-simulatie:',
          'tester@example.com'
        );
        if (!prompted) return { cancelled: true };
        email = prompted.trim().toLowerCase();
      }
    }
    if (!email || !email.includes('@')) {
      throw new Error('Vul een geldig e-mailadres in.');
    }

    let profiles = this.getLocalProfiles();
    let existing = profiles.find(
      (p) => String(p.email || '').trim().toLowerCase() === email && p.bieb_name
    );

    if (existing) {
      const normalized = { ...existing, needsOnboarding: false };
      localStorage.setItem(this.keys.SESSION_USER, JSON.stringify(normalized));
      return {
        mode: 'existing_profile',
        profile: normalized,
        provider: 'google'
      };
    }

    const biebName = this.makeUniqueBiebNameFromEmail(email);
    const newProfile = {
      id: 'user-' + Date.now(),
      email,
      bieb_name: biebName,
      provider: 'google',
      has_physical_box: false,
      postal_code_4: '',
      city: '',
      theme: 'klassiek_hout',
      contact_methods: ['in_app_chat', 'email'],
      whatsapp_number: '',
      books_shared_count: 0,
      needsOnboarding: false,
      created_at: new Date().toISOString()
    };

    profiles.push(newProfile);
    localStorage.setItem(this.keys.PROFILES, JSON.stringify(profiles));
    localStorage.setItem(this.keys.SESSION_USER, JSON.stringify(newProfile));

    return {
      mode: 'existing_profile',
      profile: newProfile,
      provider: 'google'
    };
  }

  async sendMagicLink(email) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Vul een geldig e-mailadres in.');
    }

    return this.startPasswordlessSession({
      email: cleanEmail,
      provider: 'passwordless'
    });
  }

  async startPasswordlessSession({ email, provider }) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    try {
      if (cleanEmail) localStorage.setItem('buurtbieb_last_email_v2', cleanEmail);
    } catch {}

    const profiles = this.getLocalProfiles();
    let existing = profiles.find(
      (p) =>
        String(p.email || '').trim().toLowerCase() === cleanEmail &&
        !p.needsOnboarding &&
        p.bieb_name
    );

    if (existing) {
      const normalized = { ...existing, needsOnboarding: false };
      localStorage.setItem(this.keys.SESSION_USER, JSON.stringify(normalized));
      return {
        mode: 'existing_profile',
        profile: normalized,
        provider
      };
    }

    if (this.isLiveMode()) {
      try {
        const remoteRows = await this.sbFetchJson('profiles?select=*&order=created_at.asc');
        if (Array.isArray(remoteRows)) {
          const cleanRemote = remoteRows
            .filter((r) => !this.isSeedRow(r))
            .map((r) => this.fromDbProfile(r));
          const { deduped } = this.dedupeProfilesList(cleanRemote);
          localStorage.setItem(LIVE_STORAGE_KEYS.PROFILES, JSON.stringify(deduped));
          existing = deduped.find(
            (p) =>
              String(p.email || '').trim().toLowerCase() === cleanEmail &&
              !p.needsOnboarding &&
              p.bieb_name
          );
          if (existing) {
            const normalized = { ...existing, needsOnboarding: false };
            localStorage.setItem(this.keys.SESSION_USER, JSON.stringify(normalized));
            return {
              mode: 'existing_profile',
              profile: normalized,
              provider
            };
          }
        }
      } catch {}
    }

    // Nieuwe gebruiker: moet eenmalig kastjes-profiel instellen
    const current = this.getCurrentUser();
    const reusableId =
      current && String(current.email || '').trim().toLowerCase() === cleanEmail && current.id
        ? current.id
        : 'user-' + Date.now();
    const pendingUser = {
      id: reusableId,
      email: cleanEmail,
      provider,
      needsOnboarding: true,
      books_shared_count: 0
    };
    localStorage.setItem(this.keys.SESSION_USER, JSON.stringify(pendingUser));
    return {
      mode: 'onboarding_required',
      profile: pendingUser,
      provider
    };
  }

  completeFirstSignUpProfile({
    bieb_name,
    postal_code_4,
    city,
    theme,
    whatsapp_number,
    contact_methods,
    has_physical_box
  }) {
    const current = this.getCurrentUser();
    if (!current) throw new Error('Geen actieve aanmelding gevonden.');

    const cleanBiebName = String(bieb_name || '').trim();
    if (!cleanBiebName) {
      throw new Error('Vul een naam in voor jouw boekenplank of MiniBieb.');
    }
    const cleanEmail = String(current.email || '').trim().toLowerCase();
    if (this.isBiebNameTaken(cleanBiebName, current.id, cleanEmail)) {
      throw new Error(
        `De naam "${cleanBiebName}" is al in gebruik door een andere buurtgenoot. Kies een unieke naam voor jouw boekenplank of MiniBieb.`
      );
    }

    const cleanPostal = String(postal_code_4 || '').trim();
    if (!/^[1-9][0-9]{3}$/.test(cleanPostal)) {
      throw new Error('Voer een geldige 4-cijferige postcode in (bijv. 3512).');
    }

    const chosenMethods =
      Array.isArray(contact_methods) && contact_methods.length > 0
        ? contact_methods
        : ['in_app_chat'];

    const cleanPhone = String(whatsapp_number || '').replace(/[^0-9]/g, '');
    if (
      chosenMethods.some((m) => m === 'whatsapp' || m === 'signal' || m === 'sms') &&
      cleanPhone.length < 8
    ) {
      throw new Error('Vul een geldig telefoonnummer in als je WhatsApp, Signal of SMS als contactoptie kiest.');
    }

    const profiles = this.getLocalProfiles();
    const idx = profiles.findIndex(
      (p) =>
        p.id === current.id ||
        (cleanEmail && String(p.email || '').trim().toLowerCase() === cleanEmail)
    );
    const existingProfile = idx >= 0 ? profiles[idx] : null;

    const newProfile = {
      id: (existingProfile && existingProfile.id) || current.id || 'user-' + Date.now(),
      email: cleanEmail || current.email,
      bieb_name: cleanBiebName,
      has_physical_box: Boolean(has_physical_box),
      postal_code_4: cleanPostal,
      city: String(city || '').trim(),
      theme: theme || 'klassiek_hout',
      contact_methods: chosenMethods,
      whatsapp_number: cleanPhone,
      books_shared_count: Number((existingProfile && existingProfile.books_shared_count) || 0),
      needsOnboarding: false,
      created_at: (existingProfile && existingProfile.created_at) || new Date().toISOString()
    };

    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], ...newProfile };
    } else {
      profiles.push(newProfile);
    }

    localStorage.setItem(this.keys.PROFILES, JSON.stringify(profiles));
    localStorage.setItem(this.keys.SESSION_USER, JSON.stringify(newProfile));

    this.sbUpsert('profiles', this.toDbProfile(newProfile));
    return newProfile;
  }

  updateCurrentUserProfile(updates) {
    const current = this.getCurrentUser();
    if (!current) return null;

    const cleanUpdates = { ...(updates || {}) };
    if (cleanUpdates.bieb_name !== undefined) {
      const cleanBiebName = String(cleanUpdates.bieb_name || '').trim();
      if (!cleanBiebName) {
        throw new Error('Vul een naam in voor jouw boekenplank of MiniBieb.');
      }
      if (this.isBiebNameTaken(cleanBiebName, current.id, current.email)) {
        throw new Error(
          `De naam "${cleanBiebName}" is al in gebruik door een andere buurtgenoot. Kies een unieke naam voor jouw boekenplank of MiniBieb.`
        );
      }
      cleanUpdates.bieb_name = cleanBiebName;
    }

    if (cleanUpdates.postal_code_4 !== undefined) {
      const cleanPostal = String(cleanUpdates.postal_code_4 || '').trim();
      if (cleanPostal && !/^[1-9][0-9]{3}$/.test(cleanPostal)) {
        throw new Error('Voer een geldige 4-cijferige postcode in (bijv. 3512) of laat het veld leeg.');
      }
      cleanUpdates.postal_code_4 = cleanPostal;
    }

    const updated = { ...current, ...cleanUpdates, needsOnboarding: false };
    if (typeof updated.whatsapp_number === 'string') {
      updated.whatsapp_number = updated.whatsapp_number.replace(/[^0-9]/g, '');
    }
    localStorage.setItem(this.keys.SESSION_USER, JSON.stringify(updated));

    const profiles = this.getLocalProfiles();
    const idx = profiles.findIndex((p) => p.id === updated.id);
    if (idx >= 0) {
      profiles[idx] = updated;
      localStorage.setItem(this.keys.PROFILES, JSON.stringify(profiles));
    }

    if (!updated.needsOnboarding) {
      this.sbUpsert('profiles', this.toDbProfile(updated));

      // Synchroniseer gekoppelde boeken, oproepjes en gesprekken van deze gebruiker
      try {
        const books = this.getBooks();
        const changedBooks = [];
        books.forEach((b) => {
          if (b.owner_id === updated.id) {
            b.owner_bieb_name = updated.bieb_name;
            b.postal_code_4 = updated.postal_code_4;
            b.city = updated.city;
            b.owner_whatsapp = updated.whatsapp_number || '';
            if (!updated.has_physical_box && b.self_service_box) {
              b.self_service_box = false;
              b.pickup_possible = true;
            }
            changedBooks.push(b);
          }
        });
        if (changedBooks.length > 0) {
          localStorage.setItem(this.keys.BOOKS, JSON.stringify(books));
          this.sbUpsert('books', changedBooks.map((b) => this.toDbBook(b)));
        }

        const wanted = this.getWantedBooks();
        const changedWanted = [];
        wanted.forEach((w) => {
          if (w.seeker_id === updated.id) {
            w.seeker_name = updated.bieb_name;
            w.postal_code_4 = updated.postal_code_4;
            w.city = updated.city;
            changedWanted.push(w);
          }
        });
        if (changedWanted.length > 0) {
          localStorage.setItem(this.keys.WANTED_BOOKS, JSON.stringify(wanted));
          this.sbUpsert('wanted_books', changedWanted.map((w) => this.toDbWantedBook(w)));
        }

        const convs = JSON.parse(localStorage.getItem(this.keys.CONVERSATIONS) || '[]');
        const changedConvs = [];
        convs.forEach((c) => {
          if (c.owner_id === updated.id) {
            c.owner_bieb_name = updated.bieb_name;
            c.owner_postal = updated.postal_code_4;
            c.owner_city = updated.city;
            changedConvs.push(c);
          }
        });
        if (changedConvs.length > 0) {
          localStorage.setItem(this.keys.CONVERSATIONS, JSON.stringify(convs));
          this.sbUpsert('conversations', changedConvs.map((c) => this.toDbConversation(c)));
        }
      } catch {}
    }

    return updated;
  }

  getCurrentUser() {
    try {
      const raw = localStorage.getItem(this.keys.SESSION_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  signOut() {
    localStorage.removeItem(this.keys.SESSION_USER);
    this.accessToken = null;
    this.authUserId = null;
    if (this.isLiveMode()) {
      localStorage.setItem(LIVE_STORAGE_KEYS.REQUESTS, JSON.stringify([]));
      localStorage.setItem(LIVE_STORAGE_KEYS.CONVERSATIONS, JSON.stringify([]));
      localStorage.setItem(LIVE_STORAGE_KEYS.MESSAGES, JSON.stringify([]));
      const client = this.getSupabaseClient();
      if (client && client.auth) {
        client.auth.signOut().catch(() => {});
      }
    }
  }

  deleteCurrentAccount() {
    const current = this.getCurrentUser();
    if (!current) return false;

    const userId = current.id;
    const userEmail = (current.email || '').toLowerCase();

    // 1. Verwijder profiel uit opgeslagen profielen
    const profiles = this.getLocalProfiles().filter(
      (p) => p.id !== userId && (p.email || '').toLowerCase() !== userEmail
    );
    localStorage.setItem(this.keys.PROFILES, JSON.stringify(profiles));
    this.sbDelete('profiles', `id=eq.${encodeURIComponent(userId)}`);

    // 2. Verwijder boeken van deze gebruiker & geef eventueel door deze gebruiker gereserveerde boeken weer vrij
    const books = this.getBooks()
      .filter((b) => b.owner_id !== userId)
      .map((b) => {
        if (b.reserved_by_id === userId) {
          return {
            ...b,
            status: 'beschikbaar',
            reserved_by_id: null,
            reserved_by_name: null,
            reserved_handover: null,
            handover_confirmed: false
          };
        }
        return b;
      });
    localStorage.setItem(this.keys.BOOKS, JSON.stringify(books));
    this.sbDelete('books', `owner_id=eq.${encodeURIComponent(userId)}`);
    this.sbUpdate('books', `reserved_by_id=eq.${encodeURIComponent(userId)}`, {
      status: 'beschikbaar',
      reserved_by_id: null,
      reserved_by_name: null,
      reserved_handover: null,
      handover_confirmed: false
    });

    // 3. Verwijder lopende aanvragen van/naar deze gebruiker
    const requests = this.getRequests().filter(
      (r) => r.requester_id !== userId && r.owner_id !== userId
    );
    localStorage.setItem(this.keys.REQUESTS, JSON.stringify(requests));
    this.sbDelete(
      'requests',
      `or=(requester_id.eq.${encodeURIComponent(userId)},owner_id.eq.${encodeURIComponent(userId)})`
    );

    // 4. Verwijder chatgesprekken en bijbehorende berichten van deze gebruiker
    try {
      const allConvs = JSON.parse(localStorage.getItem(this.keys.CONVERSATIONS) || '[]');
      const removedConvIds = allConvs
        .filter((c) => c.owner_id === userId || c.requester_id === userId)
        .map((c) => c.id);
      const removedConvIdSet = new Set(removedConvIds);
      const remainingConvs = allConvs.filter((c) => !removedConvIdSet.has(c.id));
      localStorage.setItem(this.keys.CONVERSATIONS, JSON.stringify(remainingConvs));

      if (removedConvIds.length > 0) {
        const allMsgs = JSON.parse(localStorage.getItem(this.keys.MESSAGES) || '[]');
        const remainingMsgs = allMsgs.filter((m) => !removedConvIdSet.has(m.conversation_id));
        localStorage.setItem(this.keys.MESSAGES, JSON.stringify(remainingMsgs));

        const formatted = removedConvIds
          .map((id) => encodeURIComponent(String(id)))
          .join(',');
        this.sbDelete('messages', `conversation_id=in.(${formatted})`);
        this.sbDelete('conversations', `id=in.(${formatted})`);
      }
    } catch {}

    // 5. Verwijder Boek Gezocht oproepjes van deze gebruiker
    const remainingWanted = this.getWantedBooks().filter((w) => w.seeker_id !== userId);
    localStorage.setItem(this.keys.WANTED_BOOKS, JSON.stringify(remainingWanted));
    this.sbDelete('wanted_books', `seeker_id=eq.${encodeURIComponent(userId)}`);

    // 6. Beëindig actieve sessie
    localStorage.removeItem(this.keys.SESSION_USER);
    return true;
  }

  // ==========================================================================
  // 2. BOEKEN BEHEER
  // ==========================================================================
  getLocalProfiles() {
    try {
      return JSON.parse(localStorage.getItem(this.keys.PROFILES) || '[]');
    } catch {
      return [];
    }
  }

  getBooks() {
    try {
      return JSON.parse(localStorage.getItem(this.keys.BOOKS) || '[]');
    } catch {
      return [];
    }
  }

  addBook(bookInput) {
    const user = this.getCurrentUser();
    if (!user || user.needsOnboarding) {
      throw new Error('Log eerst in en voltooi je kastjes-profiel om een boek toe te voegen.');
    }

    let finalPrice = 0;
    if (bookInput.sticker_type === 'koopboek') {
      finalPrice = Math.min(5, Math.max(0.5, Number(bookInput.price_eur || 2.5)));
    } else if (bookInput.sticker_type === 'marktplaats') {
      finalPrice = Math.min(150, Math.max(5.5, Number(bookInput.price_eur || 15)));
    }

    const newBook = {
      id: 'book-' + Date.now(),
      owner_id: user.id,
      owner_bieb_name: user.bieb_name,
      owner_whatsapp: user.whatsapp_number || '',
      isbn: bookInput.isbn || '',
      title: bookInput.title.trim(),
      author: bookInput.author.trim(),
      cover_url: bookInput.cover_url || '',
      description: (bookInput.description || '').trim(),
      sticker_type: bookInput.sticker_type, // 'zwerfboek' | 'leenboek' | 'koopboek' | 'marktplaats'
      genre: bookInput.genre || bookInput.market_category || 'Literatuur & Roman',
      book_language: String(bookInput.book_language || 'nl'),
      price_eur: finalPrice,
      book_condition: bookInput.book_condition || 'als_nieuw',
      market_category: bookInput.genre || bookInput.market_category || 'Literatuur & Roman',
      allow_bidding: Boolean(bookInput.allow_bidding),
      pickup_possible: bookInput.pickup_possible !== false,
      self_service_box: Boolean(bookInput.self_service_box),
      shipping_possible: Boolean(bookInput.shipping_possible),
      deposit_type: bookInput.deposit_type || 'geen', // 'geen' | 'bedrag' | 'onderpand_boek'
      deposit_amount_eur:
        bookInput.deposit_type === 'bedrag' ? Number(bookInput.deposit_amount_eur || 10) : 0,
      status: 'beschikbaar',
      handover_confirmed: false,
      handover_completed_count: 0,
      postal_code_4: user.postal_code_4 || '',
      city: user.city || '',
      created_at: new Date().toISOString()
    };

    const books = this.getBooks();
    books.unshift(newBook);
    localStorage.setItem(this.keys.BOOKS, JSON.stringify(books));
    this.sbUpsert('books', this.toDbBook(newBook));

    const updatedUser = this.updateCurrentUserProfile({
      books_shared_count: (user.books_shared_count || 0) + 1
    });

    // Voeg eerste welkomststempel toe aan het Zwerfboek-Paspoort van dit boek
    this.addBookStamp({
      book_id: newBook.id,
      reader_name: `${user.bieb_name}`,
      city: user.city || '',
      postal_code_4: user.postal_code_4 || '',
      stamp_style: 'poststempel_groen',
      comment: `Geplaatst op de plank van ${user.bieb_name}${user.city ? ' (' + user.city + ')' : ''}. Veel leesplezier gewenst!`
    });

    return { book: newBook, user: updatedUser };
  }

  deleteBook(bookId) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Niet ingelogd.');

    const books = this.getBooks();
    const idx = books.findIndex((b) => b.id === bookId);
    if (idx < 0) throw new Error('Boek niet gevonden.');

    const book = books[idx];
    if (book.owner_id !== user.id) {
      throw new Error('Je kunt alleen boeken van je eigen boekenplank verwijderen.');
    }

    this.updateCurrentUserProfile({
      books_shared_count: Math.max(0, (user.books_shared_count || 1) - 1)
    });

    books.splice(idx, 1);
    localStorage.setItem(this.keys.BOOKS, JSON.stringify(books));
    this.sbDelete('books', `id=eq.${encodeURIComponent(bookId)}`);
    return { removedBook: book };
  }

  updateBookCover(bookId, coverUrl) {
    if (!bookId || !coverUrl) return;
    try {
      const books = this.getBooks();
      const idx = books.findIndex((b) => b.id === bookId);
      if (idx >= 0 && books[idx].cover_url !== coverUrl) {
        books[idx].cover_url = coverUrl;
        localStorage.setItem(this.keys.BOOKS, JSON.stringify(books));
        this.sbUpdate('books', `id=eq.${encodeURIComponent(bookId)}`, {
          cover_url: coverUrl,
          updated_at: new Date().toISOString()
        });
      }
      const convs = JSON.parse(localStorage.getItem(this.keys.CONVERSATIONS) || '[]');
      let convChanged = false;
      convs.forEach((c) => {
        if (c.book_id === bookId && c.book_cover !== coverUrl) {
          c.book_cover = coverUrl;
          convChanged = true;
        }
      });
      if (convChanged) {
        localStorage.setItem(this.keys.CONVERSATIONS, JSON.stringify(convs));
        this.sbUpdate('conversations', `book_id=eq.${encodeURIComponent(bookId)}`, {
          book_cover: coverUrl
        });
      }
    } catch {}
  }

  // Verplaats een boek tussen Binnen op de Digitale Plank (self_service_box: false) en Buiten in de fysieke MiniBieb (self_service_box: true)
  toggleBookPlacementLocation(bookId) {
    const user = this.getCurrentUser();
    if (!user || user.needsOnboarding) {
      throw new Error('Log eerst in om de locatie van dit boek aan te passen.');
    }

    const books = this.getBooks();
    const idx = books.findIndex((b) => b.id === bookId);
    if (idx < 0) throw new Error('Boek niet gevonden.');
    if (books[idx].owner_id !== user.id) {
      throw new Error('Alleen de eigenaar kan de locatie van dit boek aanpassen.');
    }

    const nowInMiniBieb = !books[idx].self_service_box;
    books[idx].self_service_box = nowInMiniBieb;
    books[idx].pickup_possible = !nowInMiniBieb;
    localStorage.setItem(this.keys.BOOKS, JSON.stringify(books));
    this.sbUpsert('books', this.toDbBook(books[idx]));
    return books[idx];
  }

  // Voorbijganger meldt dat een boek uit een fysieke MiniBieb is meegenomen
  markMiniBiebBookTaken(bookId) {
    const books = this.getBooks();
    const idx = books.findIndex((b) => b.id === bookId);
    if (idx < 0) throw new Error('Boek niet gevonden.');

    books[idx].status = 'meegenomen';
    books[idx].taken_at = new Date().toISOString();
    localStorage.setItem(this.keys.BOOKS, JSON.stringify(books));
    this.sbRpc('mark_minibieb_book_taken_rpc', { p_book_id: bookId });
    return books[idx];
  }

  // Voorbijganger legt zelf een boek in een bestaande fysieke MiniBieb en scant het ISBN
  addBookToMiniBiebBox(refBook, bookData) {
    const user = this.getCurrentUser();
    const dropoffReaderName =
      user && !user.needsOnboarding ? user.bieb_name : 'Buurtbewoner';

    const newBook = {
      id: 'book-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      owner_id: refBook.owner_id,
      owner_bieb_name: refBook.owner_bieb_name,
      owner_whatsapp: refBook.owner_whatsapp || '',
      isbn: bookData.isbn || '',
      title: (bookData.title || 'Onbekende titel').trim(),
      author: (bookData.author || 'Onbekende auteur').trim(),
      cover_url: bookData.cover_url || '',
      description: (bookData.description || '').trim(),
      sticker_type: 'zwerfboek',
      genre: bookData.genre || 'Literatuur & Roman',
      price_eur: 0,
      book_condition: 'goed',
      market_category: bookData.genre || 'Literatuur & Roman',
      allow_bidding: false,
      pickup_possible: false,
      self_service_box: true,
      shipping_possible: false,
      deposit_type: 'geen',
      deposit_amount_eur: 0,
      status: 'beschikbaar',
      postal_code_4: refBook.postal_code_4,
      city: refBook.city,
      created_at: new Date().toISOString()
    };

    const books = this.getBooks();
    books.unshift(newBook);
    localStorage.setItem(this.keys.BOOKS, JSON.stringify(books));
    this.sbUpsert('books', this.toDbBook(newBook));

    this.addBookStamp({
      book_id: newBook.id,
      reader_name: dropoffReaderName,
      city: refBook.city,
      postal_code_4: refBook.postal_code_4,
      stamp_style: 'poststempel_groen',
      comment: `In ${refBook.owner_bieb_name} (${refBook.city}) gelegd door ${dropoffReaderName}. Veel leesplezier!`
    });

    return newBook;
  }

  // Reserveer / Vraag boek aan (geldt voor zowel Thuis-Boekenplanken als MiniBiebs)
  reserveBook(bookId, handoverMode) {
    const user = this.getCurrentUser();
    if (!user || user.needsOnboarding) {
      throw new Error('Meld je eerst aan om een boek aan te vragen of te reserveren.');
    }

    const books = this.getBooks();
    const bookIndex = books.findIndex((b) => b.id === bookId);
    if (bookIndex < 0) throw new Error('Boek niet gevonden.');

    const book = books[bookIndex];
    if (book.owner_id === user.id) {
      throw new Error('Dit boek staat op je eigen boekenplank.');
    }
    if (book.status && book.status !== 'beschikbaar') {
      throw new Error('Dit boek is momenteel niet meer beschikbaar op de plank.');
    }

    const isPaidBook = book.sticker_type === 'koopboek' || book.sticker_type === 'marktplaats';

    books[bookIndex].status = 'gereserveerd';
    books[bookIndex].reserved_by_id = user.id;
    books[bookIndex].reserved_by_name = user.bieb_name;
    books[bookIndex].reserved_handover = handoverMode;
    books[bookIndex].handover_confirmed = false;
    localStorage.setItem(this.keys.BOOKS, JSON.stringify(books));
    this.sbRpc('reserve_book_rpc', {
      p_book_id: book.id,
      p_handover_mode: handoverMode || 'aan_de_deur_1op1',
      p_reserver_name: user.bieb_name || 'Buurtgenoot'
    });

    const requests = this.getRequests();
    const newReq = {
      id: 'req-' + Date.now(),
      book_id: book.id,
      book_title: book.title,
      sticker_type: book.sticker_type,
      requester_id: user.id,
      owner_id: book.owner_id,
      handover_mode: handoverMode,
      handover_confirmed: false,
      is_paid: isPaidBook,
      status: 'klaargelegd',
      created_at: new Date().toISOString()
    };
    requests.unshift(newReq);
    localStorage.setItem(this.keys.REQUESTS, JSON.stringify(requests));
    this.sbUpsert('requests', this.toDbRequest(newReq));

    return { book: books[bookIndex], user, request: newReq };
  }

  confirmBookHandover(bookId) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Log eerst in om de overdracht te bevestigen.');

    const books = this.getBooks();
    const idx = books.findIndex((b) => b.id === bookId);
    if (idx < 0) throw new Error('Boek niet gevonden.');

    const book = books[idx];
    if (book.owner_id !== user.id && book.reserved_by_id !== user.id) {
      throw new Error('Alleen de eigenaar of de aanvrager kan de overdracht bevestigen.');
    }

    const requests = this.getRequests();
    const reqIdx = requests.findIndex(
      (r) => r.book_id === bookId && !r.handover_confirmed
    );
    if (reqIdx >= 0) {
      requests[reqIdx].handover_confirmed = true;
      requests[reqIdx].status = 'overgedragen';
      localStorage.setItem(this.keys.REQUESTS, JSON.stringify(requests));
      this.sbUpsert('requests', this.toDbRequest(requests[reqIdx]));
    }

    // Bij een Leenboek gaat het boek tijdelijk van de openbare plank af (status: 'uitgeleend')
    // totdat het na het lezen weer wordt teruggebracht op de plank.
    if (book.sticker_type === 'leenboek') {
      books[idx].status = 'uitgeleend';
      books[idx].handover_confirmed = true;
      books[idx].handover_completed_count = (books[idx].handover_completed_count || 0) + 1;
      localStorage.setItem(this.keys.BOOKS, JSON.stringify(books));
      this.sbRpc('confirm_book_handover_rpc', { p_book_id: bookId });
      return { book: books[idx], removedFromShelf: false, isLoanedOut: true };
    }

    // Bij een Zwerfboek, Koopboek of Boekenbeurs-boek is het boek definitief weggegeven of verkocht:
    // zet de status op 'overgedragen' zodat het boek van de plank verdwijnt maar het Zwerfboek-Paspoort behouden blijft!
    books[idx].status = 'overgedragen';
    books[idx].handover_confirmed = true;
    books[idx].handover_completed_count = (books[idx].handover_completed_count || 0) + 1;
    localStorage.setItem(this.keys.BOOKS, JSON.stringify(books));
    this.sbRpc('confirm_book_handover_rpc', { p_book_id: bookId });

    return { book: books[idx], removedFromShelf: true, isLoanedOut: false };
  }

  markBookLoanedOutByOwner(bookId) {
    const user = this.getCurrentUser();
    const books = this.getBooks();
    const idx = books.findIndex((b) => b.id === bookId);
    if (idx < 0) throw new Error('Boek niet gevonden.');
    if (!user || books[idx].owner_id !== user.id) {
      throw new Error('Alleen de eigenaar kan dit boek als uitgeleend markeren.');
    }

    books[idx].status = 'uitgeleend';
    books[idx].handover_confirmed = true;
    localStorage.setItem(this.keys.BOOKS, JSON.stringify(books));
    this.sbUpsert('books', this.toDbBook(books[idx]));
    return books[idx];
  }

  returnBorrowedBook(bookId) {
    const user = this.getCurrentUser();
    const books = this.getBooks();
    const idx = books.findIndex((b) => b.id === bookId);
    if (idx < 0) return null;
    if (!user || (books[idx].owner_id !== user.id && books[idx].reserved_by_id !== user.id)) {
      throw new Error('Alleen de eigenaar of de lener kan dit boek terugzetten op de plank.');
    }

    books[idx].status = 'beschikbaar';
    delete books[idx].reserved_by_id;
    delete books[idx].reserved_by_name;
    delete books[idx].reserved_handover;
    delete books[idx].handover_confirmed;
    localStorage.setItem(this.keys.BOOKS, JSON.stringify(books));
    this.sbRpc('return_borrowed_book_rpc', { p_book_id: bookId });

    return books[idx];
  }

  getRequests() {
    try {
      return JSON.parse(localStorage.getItem(this.keys.REQUESTS) || '[]');
    } catch {
      return [];
    }
  }

  // ==========================================================================
  // 2B. BOEK GEZOCHT IN DE BUURT (Oproepjes van buurtgenoten)
  // ==========================================================================
  getWantedBooks() {
    try {
      return JSON.parse(localStorage.getItem(this.keys.WANTED_BOOKS) || '[]');
    } catch {
      return [];
    }
  }

  addWantedBook({ title, author, genre, prefer_mode, note }) {
    const user = this.getCurrentUser();
    if (!user || user.needsOnboarding) {
      throw new Error('Log eerst in om een "Boek Gezocht"-oproepje te plaatsen.');
    }

    const newWanted = {
      id: 'wanted-' + Date.now(),
      seeker_id: user.id,
      seeker_name: user.bieb_name,
      postal_code_4: user.postal_code_4,
      city: user.city,
      title: String(title || '').trim(),
      author: String(author || '').trim(),
      genre: genre || 'Literatuur & Roman',
      prefer_mode: prefer_mode || 'lenen_of_ruilen',
      note: String(note || '').trim(),
      created_at: new Date().toISOString()
    };

    const list = this.getWantedBooks();
    list.unshift(newWanted);
    localStorage.setItem(this.keys.WANTED_BOOKS, JSON.stringify(list));
    this.sbUpsert('wanted_books', this.toDbWantedBook(newWanted));
    return newWanted;
  }

  deleteWantedBook(wantedId) {
    const user = this.getCurrentUser();
    if (!user || user.needsOnboarding) {
      throw new Error('Log eerst in om een oproepje te verwijderen.');
    }
    const currentList = this.getWantedBooks();
    const target = currentList.find((w) => w.id === wantedId);
    if (!target) throw new Error('Oproepje niet gevonden.');
    if (target.seeker_id !== user.id) {
      throw new Error('Je kunt alleen je eigen oproepje verwijderen.');
    }
    const list = currentList.filter((w) => w.id !== wantedId);
    localStorage.setItem(this.keys.WANTED_BOOKS, JSON.stringify(list));
    this.sbDelete('wanted_books', `id=eq.${encodeURIComponent(wantedId)}`);
  }

  startWantedBookChat(wantedItem) {
    const user = this.getCurrentUser();
    if (!user || user.needsOnboarding) {
      throw new Error('Log eerst in om te reageren op een gezocht boek.');
    }
    if (wantedItem && wantedItem.seeker_id && wantedItem.seeker_id === user.id) {
      throw new Error('Dit is je eigen oproepje — je kunt geen chat met jezelf starten.');
    }

    const pseudoBook = {
      id: wantedItem.id,
      title: `🔎 Gezocht: ${wantedItem.title}`,
      author: wantedItem.author || 'Gezocht door buurtgenoot',
      cover_url: '',
      sticker_type: 'zwerfboek',
      owner_id: wantedItem.seeker_id,
      owner_bieb_name: wantedItem.seeker_name,
      postal_code_4: wantedItem.postal_code_4,
      city: wantedItem.city
    };

    const draftMessage = `Hoi ${wantedItem.seeker_name}! 📚 Ik zag jouw oproepje dat je op zoek bent naar "${wantedItem.title}"${wantedItem.author ? ' van ' + wantedItem.author : ''}. Ik heb dit boek thuis in de kast staan! Zullen we afspreken?`;

    const conv = this.startOrOpenBookChat({
      book: pseudoBook,
      handoverMode: 'aan_de_deur_1op1'
    });
    return { conv, draftMessage };
  }

  // ==========================================================================
  // 3. ZWERFBOEK-PASPOORT (Stempelkaart)
  // ==========================================================================
  getStampsForBook(bookId) {
    try {
      const all = JSON.parse(localStorage.getItem(this.keys.STAMPS) || '[]');
      return all.filter((s) => s.book_id === bookId);
    } catch {
      return [];
    }
  }

  getAllStamps() {
    try {
      return JSON.parse(localStorage.getItem(this.keys.STAMPS) || '[]');
    } catch {
      return [];
    }
  }

  addBookStamp({ book_id, reader_name, city, postal_code_4, stamp_style, comment }) {
    const stamps = this.getAllStamps();
    const newStamp = {
      id: 'stamp-' + Date.now(),
      book_id,
      reader_name: reader_name.trim(),
      city: city.trim(),
      postal_code_4: String(postal_code_4 || '').trim(),
      stamp_style: stamp_style || 'poststempel_groen',
      comment: comment.trim(),
      stamped_at: new Date().toISOString().slice(0, 10)
    };
    stamps.push(newStamp);
    localStorage.setItem(this.keys.STAMPS, JSON.stringify(stamps));
    this.sbUpsert('stamps', this.toDbStamp(newStamp));
    return newStamp;
  }

  // ==========================================================================
  // 4. CONTACTVOORKEUREN & IN-APP BUURTCHAT
  // ==========================================================================
  getProfileById(profileId) {
    const profiles = this.getLocalProfiles();
    return profiles.find((p) => p.id === profileId) || null;
  }

  getOwnerContactInfo(book) {
    const ownerProfile = this.getProfileById(book.owner_id);
    const methods =
      (ownerProfile && Array.isArray(ownerProfile.contact_methods) && ownerProfile.contact_methods.length > 0
        ? ownerProfile.contact_methods
        : book.owner_contact_methods) || ['in_app_chat', 'whatsapp'];

    return {
      methods,
      has_physical_box: ownerProfile ? Boolean(ownerProfile.has_physical_box) : Boolean(book.self_service_box),
      email: (ownerProfile && ownerProfile.email) || '',
      whatsapp_number: (ownerProfile && ownerProfile.whatsapp_number) || book.owner_whatsapp || '',
      bieb_name: (ownerProfile && ownerProfile.bieb_name) || book.owner_bieb_name
    };
  }

  getConversations() {
    try {
      const user = this.getCurrentUser();
      if (!user || user.needsOnboarding) return [];
      const list = JSON.parse(localStorage.getItem(this.keys.CONVERSATIONS) || '[]');
      const allMsgs = JSON.parse(localStorage.getItem(this.keys.MESSAGES) || '[]');
      const msgConvIds = new Set(allMsgs.map((m) => m.conversation_id));
      const activeDraftConvId = window.AppState?.chatDraft?.convId;
      const activeOpenConvId = window.AppState?.activeConversationId;

      return list
        .filter((c) => {
          if (c.owner_id && c.requester_id && c.owner_id === c.requester_id) {
            return false;
          }
          const isParticipant = c.owner_id === user.id || c.requester_id === user.id;
          if (!isParticipant) return false;
          const hasMessages = msgConvIds.has(c.id);
          const isCurrentOpen =
            (activeDraftConvId && c.id === activeDraftConvId) ||
            (activeOpenConvId && c.id === activeOpenConvId);
          return hasMessages || isCurrentOpen;
        })
        .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
    } catch {
      return [];
    }
  }

  removeConversationIfEmpty(convId) {
    if (!convId) return false;
    try {
      const allMsgs = JSON.parse(localStorage.getItem(this.keys.MESSAGES) || '[]');
      const hasMessages = allMsgs.some((m) => m.conversation_id === convId);
      if (hasMessages) return false;

      const allConvs = JSON.parse(localStorage.getItem(this.keys.CONVERSATIONS) || '[]');
      const remaining = allConvs.filter((c) => c.id !== convId);
      if (remaining.length !== allConvs.length) {
        localStorage.setItem(this.keys.CONVERSATIONS, JSON.stringify(remaining));
        this.sbDelete('conversations', `id=eq.${encodeURIComponent(convId)}`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  getMessagesForConversation(convId) {
    try {
      const user = this.getCurrentUser();
      if (!user || user.needsOnboarding) return [];
      const all = JSON.parse(localStorage.getItem(this.keys.MESSAGES) || '[]');
      return all
        .filter((m) => m.conversation_id === convId)
        .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    } catch {
      return [];
    }
  }

  getUnreadChatCount() {
    try {
      const user = this.getCurrentUser();
      if (!user || user.needsOnboarding) return 0;
      const myConvIds = new Set(this.getConversations().map((c) => c.id));
      const all = JSON.parse(localStorage.getItem(this.keys.MESSAGES) || '[]');
      return all.filter(
        (m) => myConvIds.has(m.conversation_id) && !m.is_read && m.sender_id !== user.id
      ).length;
    } catch {
      return 0;
    }
  }

  markConversationRead(convId) {
    try {
      const user = this.getCurrentUser();
      const currentUserId = user && user.id ? String(user.id) : '';
      const all = JSON.parse(localStorage.getItem(this.keys.MESSAGES) || '[]');
      let changed = false;
      all.forEach((m) => {
        if (m.conversation_id === convId && !m.is_read && (!currentUserId || String(m.sender_id) !== currentUserId)) {
          m.is_read = true;
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(this.keys.MESSAGES, JSON.stringify(all));
        const senderFilter = currentUserId ? `&sender_id=neq.${encodeURIComponent(currentUserId)}` : '';
        this.sbUpdate(
          'messages',
          `conversation_id=eq.${encodeURIComponent(convId)}&is_read=eq.false${senderFilter}`,
          { is_read: true }
        );
      }
    } catch {}
  }

  startOrOpenBookChat({ book, handoverMode }) {
    const user = this.getCurrentUser();
    if (!user || user.needsOnboarding) {
      throw new Error('Log eerst in om een chatgesprek te starten.');
    }
    if (book && book.owner_id && book.owner_id === user.id) {
      throw new Error('Dit is je eigen boek op de plank — je kunt geen chat met jezelf starten.');
    }
    const senderId = user.id;
    const locPart = [user.postal_code_4, user.city].filter(Boolean).join(' ');
    const senderName = locPart ? `${user.bieb_name} (${locPart})` : user.bieb_name;

    const allConversations = JSON.parse(localStorage.getItem(this.keys.CONVERSATIONS) || '[]');
    let conv = allConversations.find(
      (c) => c.book_id === book.id && c.requester_id === senderId && c.owner_id !== senderId
    );

    if (!conv) {
      conv = {
        id: 'conv-' + Date.now(),
        book_id: book.id,
        book_title: book.title,
        book_author: book.author,
        book_cover: book.cover_url || '',
        sticker_type: book.sticker_type,
        owner_id: book.owner_id,
        owner_bieb_name: book.owner_bieb_name,
        owner_postal: book.postal_code_4,
        owner_city: book.city,
        requester_id: senderId,
        requester_bieb_name: senderName,
        handover_mode: handoverMode || 'aan_de_deur_1op1',
        updated_at: new Date().toISOString()
      };
      allConversations.unshift(conv);
      localStorage.setItem(this.keys.CONVERSATIONS, JSON.stringify(allConversations));
      this.sbUpsert('conversations', this.toDbConversation(conv));
    }

    return conv;
  }

  sendChatMessage(convId, body, senderOverride) {
    const user = this.getCurrentUser();
    const senderId =
      (senderOverride && senderOverride.senderId) ||
      (user && !user.needsOnboarding ? user.id : 'guest-reader');
    const senderName =
      (senderOverride && senderOverride.senderName) ||
      (user && !user.needsOnboarding ? user.bieb_name : 'Buurtgenoot');

    const nowIso = new Date().toISOString();
    const allMessages = JSON.parse(localStorage.getItem(this.keys.MESSAGES) || '[]');
    const newMsg = {
      id: 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      conversation_id: convId,
      sender_id: senderId,
      sender_name: senderName,
      body: body.trim(),
      is_read: false,
      created_at: nowIso
    };
    allMessages.push(newMsg);
    localStorage.setItem(this.keys.MESSAGES, JSON.stringify(allMessages));
    this.sbUpsert('messages', this.toDbMessage(newMsg));

    const allConvs = JSON.parse(localStorage.getItem(this.keys.CONVERSATIONS) || '[]');
    const idx = allConvs.findIndex((c) => c.id === convId);
    if (idx >= 0) {
      allConvs[idx].updated_at = nowIso;
      localStorage.setItem(this.keys.CONVERSATIONS, JSON.stringify(allConvs));
      this.sbUpdate('conversations', `id=eq.${encodeURIComponent(convId)}`, {
        updated_at: nowIso
      });
    }

    if (!senderOverride && this.isLiveMode()) {
      this.triggerChatPushNotification(convId, newMsg.body, senderName);
    }

    return newMsg;
  }

  async savePushSubscription(subscriptionJson) {
    if (!this.isLiveMode() || !this.accessToken || !this.authUserId) return false;
    if (!subscriptionJson || !subscriptionJson.endpoint || !subscriptionJson.keys) return false;
    try {
      const row = {
        user_id: this.authUserId,
        endpoint: String(subscriptionJson.endpoint),
        p256dh: String(subscriptionJson.keys.p256dh || ''),
        auth: String(subscriptionJson.keys.auth || ''),
        user_agent: (typeof navigator !== 'undefined' && navigator.userAgent ? navigator.userAgent : '').slice(0, 220),
        updated_at: new Date().toISOString()
      };
      const res = await fetch(`${this.supabaseUrl}/rest/v1/push_subscriptions?on_conflict=user_id,endpoint`, {
        method: 'POST',
        headers: {
          apikey: this.supabaseKey,
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(row)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async deletePushSubscription(endpoint) {
    if (!this.isLiveMode() || !this.accessToken || !this.authUserId || !endpoint) return false;
    try {
      const url = `${this.supabaseUrl}/rest/v1/push_subscriptions?user_id=eq.${encodeURIComponent(this.authUserId)}&endpoint=eq.${encodeURIComponent(endpoint)}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          apikey: this.supabaseKey,
          Authorization: `Bearer ${this.accessToken}`
        }
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  triggerChatPushNotification(convId, messageText, senderName) {
    if (!this.isLiveMode() || !this.accessToken || !convId || !messageText) return;
    try {
      fetch(`${this.supabaseUrl}/functions/v1/send-chat-push`, {
        method: 'POST',
        headers: {
          apikey: this.supabaseKey,
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversation_id: convId,
          message_text: String(messageText).slice(0, 180),
          sender_name: String(senderName || '').slice(0, 80)
        })
      }).catch(() => {});
    } catch {}
  }
}

window.BuurtBiebDB = new BuurtBiebDatabase();
