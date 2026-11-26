// ============================================================================
// BuurtBieb.nl — Hoofd Applicatie Logica (UI, Kastjes, Stickers, Chat)
// ============================================================================

const AppState = {
  activeTab: 'plank', // 'plank' | 'marktplaats' | 'toevoegen' | 'chat' | 'profiel'
  searchQuery: '',
  filterPostal: '',
  filterGenre: 'alle',
  filterBookLanguage: 'alle',
  filterSticker: 'alle', // 'alle' | 'zwerfboek' | 'leenboek' | 'koopboek' | 'marktplaats'
  sortMode: 'dichtbij', // 'dichtbij' | 'nieuwste' | 'titel' | 'prijs_laag'
  shelfPage: 1,
  shelfPageSize: 6, // Standaard 2 planken (6 boeken) voor een rustig en overzichtelijk scherm
  filterDistanceKm: 'alle',
  mpVisibleCount: 6,
  selectedCabinetTheme: 'klassiek_hout',
  selectedPhysicalBoxId: null,
  mapZoom: 1,
  activeBookModalId: null,
  activeConversationId: null,
  chatViewMode: 'thread', // 'thread' (alleen actieve chat in beeld zoals WhatsApp) | 'list' (gesprekkenlijst)
  isEditingProfile: false,
  authModalMode: 'login',
  selectedStickerInForm: 'zwerfboek',
  selectedDepositTypeInForm: 'geen',
  cameraStream: null
};
window.AppState = AppState;

const CONTACT_METHOD_META = {
  in_app_chat: { label: '💬 BuurtChat', short: '💬 BuurtChat', cls: 'chip-chat' }
};

function renderContactMethodsBadges() {
  return '';
}

const THEME_LABELS = {
  groen_tuinhuis: { name: '🌿 Groen Tuinhuis', badge: 'Bosgroen & Eikenhout' },
  klassiek_hout: { name: '🪵 Klassiek Hout', badge: 'Ambachtelijk Notenhout' },
  rood_straatkastje: { name: '📮 Rood Straatkastje', badge: 'Warm Dorpsrood' }
};

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatLocationLabel(postal, city, fallback = 'Nederland') {
  const parts = [String(postal || '').trim(), String(city || '').trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : fallback;
}

// ============================================================================
// TAALWISSELAAR (NEDERLANDS ↔ ENGELS)
// ============================================================================
const LANG_STORAGE_KEY = 'buurtbieb_lang_v1';

function getCurrentLang() {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY) === 'en' ? 'en' : 'nl';
  } catch {
    return 'nl';
  }
}

function isEn() {
  return getCurrentLang() === 'en';
}

function tr(nlText, enText) {
  return isEn() ? enText : nlText;
}

const UI_EN_RAW_PAIRS = [
  ['BuurtBieb.nl — Landelijk Netwerk van Online & Fysieke Mini-Biebs', 'BuurtBieb.nl — Nationwide Network of Online & Street Little Libraries'],
  ['Online & Fysieke Mini-Biebs', 'Online & Street Little Libraries'],
  ['Online &amp; Fysieke Mini-Biebs', 'Online &amp; Street Little Libraries'],
  ['🌿 Landelijk Mini-Bieb Netwerk · 100% Buurtgedreven', '🌿 Nationwide Little Library Network · 100% Community-Driven'],
  ['Deel, leen en laat boeken zwerven door jouw buurt', 'Share, borrow and circulate books in your neighborhood'],
  ['Ontdek welke boeken er nú bij buren en in fysieke MiniBiebs in jouw wijk staan — direct afgesproken via de BuurtChat.', 'Discover books available from neighbors and street Little Libraries in your area — arranged directly via BuurtChat.'],
  ['📷 Scan ISBN &amp; Zet Boek op je Plank', '📷 Scan ISBN &amp; Add Book to Shelf'],
  ['📷 Scan ISBN & Zet Boek op je Plank', '📷 Scan ISBN & Add Book to Shelf'],
  ['🛍️ Bekijk de Boekenbeurs', '🛍️ Browse Book Market'],
  ['🏡 Hoe werkt het?', '🏡 How does it work?'],
  ['Gratis houden, ruilen of doorgeven', 'Keep, swap or pass on for free'],
  ['Lokaal lenen van je buur', 'Borrow locally from a neighbor'],
  ['Klein prijsje (t/m € 5,-)', 'Small price (up to € 5)'],
  ['Nieuwere &amp; duurdere boeken (&gt; € 5,-)', 'Newer &amp; higher-value books (&gt; € 5)'],
  ['Nieuwere & duurdere boeken (> € 5,-)', 'Newer & higher-value books (> € 5)'],
  ['Buurtgedreven', 'Community-driven'],
  ['4-Cijfer', '4-Digit'],
  ['Postcode zoeken', 'Postal search'],
  ['Boekgenres', 'Genres'],
  ['🔍 Zoek op titel, auteur, ISBN of planknaam...', '🔍 Search by title, author, ISBN or shelf...'],
  ['🔍 Zoek op de Boekenbeurs (bijv. Ottolenghi, Studieboek, Harari, Duin)...', '🔍 Search the Book Market (e.g. Cookbook, Textbook, Fiction)...'],
  ['📂 Alle Boekgenres (16)', '📂 All Genres (16)'],
  ['📖 Literatuur & Roman', '📖 Literature & Fiction'],
  ['📖 Literatuur &amp; Roman', '📖 Literature &amp; Fiction'],
  ['🔪 Spanning & Thriller', '🔪 Suspense & Thriller'],
  ['🔪 Spanning &amp; Thriller', '🔪 Suspense &amp; Thriller'],
  ['🔍 Detective & Misdaad', '🔍 Detective & Crime'],
  ['🔍 Detective &amp; Misdaad', '🔍 Detective &amp; Crime'],
  ['🚀 Fantasy & Sciencefiction', '🚀 Fantasy & Sci-Fi'],
  ['🚀 Fantasy &amp; Sciencefiction', '🚀 Fantasy &amp; Sci-Fi'],
  ['💕 Feelgood & Romantiek', '💕 Feelgood & Romance'],
  ['💕 Feelgood &amp; Romantiek', '💕 Feelgood &amp; Romance'],
  ['🏛️ Geschiedenis & Politiek', '🏛️ History & Politics'],
  ['🏛️ Geschiedenis &amp; Politiek', '🏛️ History &amp; Politics'],
  ['🧠 Psychologie & Filosofie', '🧠 Psychology & Philosophy'],
  ['🧠 Psychologie &amp; Filosofie', '🧠 Psychology &amp; Philosophy'],
  ['🌱 Persoonlijke Ontwikkeling & Gezondheid', '🌱 Personal Development & Health'],
  ['🌱 Persoonlijke Ontwikkeling &amp; Gezondheid', '🌱 Personal Development &amp; Health'],
  ['🌍 Biografie & Waargebeurd', '🌍 Biography & True Story'],
  ['🌍 Biografie &amp; Waargebeurd', '🌍 Biography &amp; True Story'],
  ['🔬 Wetenschap, Natuur & Techniek', '🔬 Science, Nature & Tech'],
  ['🔬 Wetenschap, Natuur &amp; Techniek', '🔬 Science, Nature &amp; Tech'],
  ['🍳 Kookboek, Eten & Lifestyle', '🍳 Cookbook, Food & Lifestyle'],
  ['🍳 Kookboek, Eten &amp; Lifestyle', '🍳 Cookbook, Food &amp; Lifestyle'],
  ['✈️ Reizen, Cultuur & Taal', '✈️ Travel, Culture & Language'],
  ['✈️ Reizen, Cultuur &amp; Taal', '✈️ Travel, Culture &amp; Language'],
  ['🎨 Kunst, Design & Fotografie', '🎨 Art, Design & Photography'],
  ['🎨 Kunst, Design &amp; Fotografie', '🎨 Art, Design &amp; Photography'],
  ['🎓 Studie-, Vak- & Managementboek', '🎓 Study, Academic & Business'],
  ['🎓 Studie-, Vak- &amp; Managementboek', '🎓 Study, Academic &amp; Business'],
  ['🧸 Kinder-, Jeugd- & Young Adult', '🧸 Kids, Youth & Young Adult'],
  ['🧸 Kinder-, Jeugd- &amp; Young Adult', '🧸 Kids, Youth &amp; Young Adult'],
  ['💬 Stripboek, Graphic Novel & Poëzie', '💬 Comics, Graphic Novel & Poetry'],
  ['💬 Stripboek, Graphic Novel &amp; Poëzie', '💬 Comics, Graphic Novel &amp; Poetry'],
  ['🇬🇧 Engelse Boeken (English)', '🇬🇧 English Books'],
  ['🌍 Internationale Boeken (Andere taal)', '🌍 International Books (Other language)'],
  ['🌐 Alle Talen', '🌐 All Languages'],
  ['🇳🇱 Nederlands', '🇳🇱 Dutch'],
  ['🇬🇧 Engels / English', '🇬🇧 English'],
  ['🇬🇧 Engelse Boeken', '🇬🇧 English Books'],
  ['🌍 Internationaal (Andere taal dan NL/EN)', '🌍 International (Languages other than NL/EN)'],
  ['🌍 Internationaal — Duits', '🌍 International — German'],
  ['🌍 Internationaal — Frans', '🌍 International — French'],
  ['🌍 Internationaal — Spaans', '🌍 International — Spanish'],
  ['🌍 Internationaal — Italiaans', '🌍 International — Italian'],
  ['🌍 Internationaal — Andere taal (niet NL/EN)', '🌍 International — Other language (non-NL/EN)'],
  ['📍 Postcode (4 cijfers) of plaats...', '📍 Postal code (4 digits) or city...'],
  ['📍 Dichtst bij postcode eerst', '📍 Closest postal code first'],
  ['📍 Dichtst bij mijn postcode', '📍 Closest to my postal code'],
  ['🆕 Nieuwste eerst', '🆕 Newest first'],
  ['🔤 Titel (A → Z)', '🔤 Title (A → Z)'],
  ['💶 Prijs (Laag → Hoog)', '💶 Price (Low → High)'],
  ['💶 Prijs: Laag → Hoog', '💶 Price: Low → High'],
  ['💶 Prijs: Hoog → Laag', '💶 Price: High → Low'],
  ['Wis filters', 'Clear filters'],
  ['📚 Alle Boeken', '📚 All Books'],
  ['🟢 Zwerfboek (Gratis)', '🟢 Roaming Book (Free)'],
  ['🔵 Leenboek (Buurt)', '🔵 Loan Book (Local)'],
  ['🟡 Koopboek (t/m € 5,-)', '🟡 Budget Buy (up to € 5)'],
  ['🟣 Boekenbeurs (&gt; € 5,-)', '🟣 Book Market (&gt; € 5)'],
  ['🟣 Boekenbeurs (> € 5,-)', '🟣 Book Market (> € 5)'],
  ['🔎 Boek Gezocht (Oproepje plaatsen)', '🔎 Wanted Book (Post request)'],
  ['🗺️ Fysieke Kastjes op de Kaart', '🗺️ Physical Cabinets on the Map'],
  ['Planken per kast:', 'Shelves per cabinet:'],
  ['2 Planken (6 boeken)', '2 Shelves (6 books)'],
  ['3 Planken (9 boeken)', '3 Shelves (9 books)'],
  ['3 Brede Planken (12 boeken)', '3 Wide Shelves (12 books)'],
  ['Klik op een thema rechts om het houten straatkastje aan te passen', 'Click a theme on the right to customize the wooden book cabinet'],
  ['🌿 Groen Tuinhuis', '🌿 Green Garden House'],
  ['🪵 Klassiek Hout', '🪵 Classic Oak'],
  ['📮 Rood Straatkastje', '📮 Red Street Cabinet'],
  ['📌 Buurt-Oproepjes', '📌 Neighborhood Requests'],
  ['🔎 Gezocht in de Buurt — Wie heeft dit boek in de kast staan?', '🔎 Wanted Nearby — Who has this book on their shelf?'],
  ['Staat het boek dat je zoekt nog niet op een plank? Plaats hier een oproepje zodat een buurtgenoot die het thuis in de kast heeft kan reageren!', "Can't find the book you're looking for on a shelf yet? Post a request so a neighbor who owns it can reply!"],
  ['+ 🔎 Zelf een gezocht boek plaatsen', '+ 🔎 Post a Wanted Book'],
  ['🔎 Welk boek zoek je in jouw buurt?', '🔎 Which book are you looking for nearby?'],
  ['Titel van het gezochte boek *', 'Book title *'],
  ['Bijv. De zeven zussen of De avond is ongemak', 'e.g. The Seven Sisters or Dune'],
  ['Auteur (optioneel)', 'Author (optional)'],
  ['Bijv. Lucinda Riley', 'e.g. Frank Herbert'],
  ['Hoe wil je het boek graag lenen/overnemen?', 'How would you like to borrow/get it?'],
  ['🔵/🟢 Graag lenen of 1-op-1 ruilen', '🔵/🟢 Borrow or 1-on-1 swap'],
  ["🔵 Graag lenen (ik breng 'm netjes terug)", "🔵 Borrow only (I'll return it neatly)"],
  ['🟢/🟡 Graag overnemen of voor een klein prijsje kopen', '🟢/🟡 Take over or buy for a small price'],
  ['🔵/🟢 Wil graag lenen of ruilen', '🔵/🟢 Wants to borrow or swap'],
  ['🔵 Wil graag lenen (brengt netjes terug)', '🔵 Wants to borrow (returns neatly)'],
  ['🟢/🟡 Wil overnemen of voor klein prijsje kopen', '🟢/🟡 Wants to take over or buy cheaply'],
  ['Korte toelichting voor je buren (optioneel)', 'Short note for neighbors (optional)'],
  ['Bijv. Voor mijn boekenclub of vakantie volgende week!', 'e.g. For my book club or holiday next week!'],
  ['📌 Oproepje plaatsen in mijn buurt', '📌 Post Request'],
  ['Nieuwere, Gebonden &amp; Bijzondere Boeken', 'Newer, Hardcover &amp; Special Books'],
  ['Nieuwere, Gebonden & Bijzondere Boeken', 'Newer, Hardcover & Special Books'],
  ['Voor recente bestsellers, kookboeken, studieboeken en luxe hardcovers boven de € 5,-. Koop rechtstreeks van buurtgenoten of doe een net tegenbod via de BuurtChat!', 'For recent bestsellers, cookbooks, textbooks and luxury hardcovers over € 5. Buy directly from neighbors or make a fair offer via BuurtChat!'],
  ['➕ Zet jouw Boek op de Boekenbeurs', '➕ List Your Book on the Market'],
  ['✨ Alle Condities', '✨ All Conditions'],
  ['✨ Als nieuw (Cadeauwaardig)', '✨ Like New (Gift-worthy)'],
  ['✨ Als nieuw (Geen gebruikssporen / cadeauwaardig)', '✨ Like New (No signs of wear / gift-worthy)'],
  ['👍 Goed (Netjes gelezen)', '👍 Good (Neatly read)'],
  ['📖 Gelezen (Gebruikssporen)', '📖 Read (Light wear)'],
  ['📖 Gelezen (Lichte gebruikssporen)', '📖 Read (Light signs of wear)'],
  ['✨ Als nieuw', '✨ Like New'],
  ['👍 Goed', '👍 Good'],
  ['📖 Gelezen', '📖 Read'],
  ['Boek Toevoegen aan jouw Boekenplank', 'Add a Book to Your Shelf'],
  ['Snel toevoegen via ISBN', 'Quick add via ISBN'],
  ['Scan of typ een ISBN-nummer óf zoek direct op boektitel / auteur om gegevens en kaft automatisch op te halen.', 'Scan or enter an ISBN number, or search by title / author to fetch details and cover automatically.'],
  ['📷 Stap 1: Zoek op ISBN, Titel of Auteur &amp; Camera-Scanner', '📷 Step 1: Search by ISBN, Title or Author &amp; Camera Scanner'],
  ['📷 Stap 1: Zoek op ISBN, Titel of Auteur & Camera-Scanner', '📷 Step 1: Search by ISBN, Title or Author & Camera Scanner'],
  ['⚡ Snel-Scan (meerdere boeken achter elkaar scannen)', '⚡ Quick Scan (scan multiple books in a row)'],
  ['Vrijblijvend snel scannen:', 'Optional quick scan:'],
  ['aan om met je camera achter elkaar meerdere boeken direct toe te voegen zonder telkens het formulier in te vullen.', 'on to add multiple books straight with your camera without filling the form each time.'],
  ['Vrijblijvend snel scannen: Zet ⚡ Snel-Scan aan om met je camera achter elkaar meerdere boeken direct toe te voegen zonder telkens het formulier in te vullen.', 'Optional fast scanning: Turn on ⚡ Quick Scan to add multiple books straight with your camera without filling the form each time.'],
  ['Typ ISBN (bijv. 9789044543087) of boektitel + auteur...', 'Enter ISBN (e.g. 9789044543087) or book title + author...'],
  ['🔎 Zoek Titel, Auteur &amp; Kaft', '🔎 Lookup Title, Author &amp; Cover'],
  ['🔎 Zoek Titel, Auteur & Kaft', '🔎 Lookup Title, Author & Cover'],
  ['📷 Camera Streepjescode Scanner', '📷 Camera Barcode Scanner'],
  ['Richt je camera op de ISBN-streepjescode achterop het boek...', 'Point your camera at the ISBN barcode on the back of the book...'],
  ['Kaft preview', 'Cover preview'],
  ['Titel van het boek *', 'Book title *'],
  ['Bijv. De meeste mensen deugen', 'e.g. Humankind'],
  ['Auteur *', 'Author *'],
  ['Bijv. Rutger Bregman', 'e.g. Rutger Bregman'],
  ['Boekgenre / Categorie *', 'Book Genre / Category *'],
  ['🌐 Taal van het boek *', '🌐 Book Language *'],
  ['Kaft-URL (automatisch via ISBN of eigen link)', 'Cover URL (automatic via ISBN or custom link)'],
  ['Korte toelichting / staat van het boek', 'Short description / book condition'],
  ['Bijv. Zo goed als nieuw, gelezen met veel plezier!', 'e.g. Like new, enjoyed reading it!'],
  ['🏷️ Stap 2: Kies één van de 3 Stickers óf plaats op de Boekenbeurs *', '🏷️ Step 2: Pick one of the 3 Stickers or list on Book Market *'],
  ['Houden, ruilen of doorgeven', 'Keep, swap or pass on'],
  ['Gratis over te nemen of te ruilen in goed overleg. De lezer mag het boek houden of weer laten verder zwerven door de buurt.', 'Free to take or swap in consultation. The reader can keep it or pass it along in the neighborhood.'],
  ['Alleen voor buurtgenoten', 'Neighbors only'],
  ['Moet na lezen terug. Alleen zichtbaar voor buurtgenoten om in goed overleg te lenen en na het lezen weer terug te brengen.', 'Return after reading. Visible only to local neighbors to borrow and bring back after reading.'],
  ['Klein buurtprijsje', 'Small local price'],
  ['Klein bedrag (max € 5,00). Onderling af te rekenen via Tikkie of contant.', 'Small fee (max € 5.00). Settled directly via cash or payment app.'],
  ['Nieuwere &amp; duurdere boeken (€ 5,50 – € 150)', 'Newer &amp; higher-value books (€ 5.50 – € 150)'],
  ['Nieuwere & duurdere boeken (€ 5,50 – € 150)', 'Newer & higher-value books (€ 5.50 – € 150)'],
  ['Voor recente bestsellers, kookboeken, studieboeken en hardcovers. Inclusief staat van het boek en optie om bieden toe te staan.', 'For recent bestsellers, cookbooks, study books and hardcovers. Includes condition and optional bidding.'],
  ['🟡 Vraagprijs voor dit Koopboek (maximaal € 5,00)', '🟡 Asking price for this Budget Buy (max € 5.00)'],
  ['Rechtstreeks onderling via Tikkie of contant.', 'Directly between neighbors via cash or payment app.'],
  ['🟣 Boekenbeurs Details (Voor nieuwere &amp; duurdere boeken)', '🟣 Book Market Details (Newer &amp; higher-value books)'],
  ['Vraagprijs in € (€ 5,50 t/m € 150,-) *', 'Asking price in € (€ 5.50 to € 150) *'],
  ['Conditie / Staat van het boek *', 'Book Condition *'],
  ['Tegenbod via BuurtChat toestaan', 'Allow counter-offers via BuurtChat'],
  ['(Bieden welkom)', '(Offers welcome)'],
  ['💡 Tip voor duurdere boeken: overhandig het boek 1-op-1 op afspraak aan de deur of verzend het per post.', '💡 Tip for higher-value books: hand over 1-on-1 by appointment at the door or ship via mail.'],
  ['🔵 Let op: Een Leenboek wordt alleen getoond aan buurtgenoten in jouw postcodegebied/woonplaats om in goed overleg te lenen en weer terug te brengen.', '🔵 Note: A Loan Book is only shown to neighbors in your postal area/town to borrow and return after reading.'],
  ['📦 Stap 3: Hoe kan dit boek worden overgedragen? *', '📦 Step 3: How can this book be handed over? *'],
  ['📍 Stap 3: Waar leg je dit boek neer? *', '📍 Step 3: Where will you place this book? *'],
  ['📚 Binnen op Digitale Plank', '📚 Inside on Digital Shelf'],
  ['Je bewaart het boek binnen; buren spreken met je af via de chat.', 'You keep the book inside; neighbors arrange pickup via chat.'],
  ['🏡 In fysieke MiniBieb', '🏡 In Physical Little Library'],
  ['Het boek ligt buiten in de MiniBieb (vrij te pakken zonder afspraak).', 'The book sits outside in your Little Library (free pickup without appointment).'],
  ['🚪 1-op-1 ophalen op afspraak', '🚪 1-on-1 pickup by appointment'],
  ['(Aan de deur / vanuit huis)', '(At the door / from home)'],
  ['✉️ Verzenden per post / brievenbuspakje mogelijk', '✉️ Shipping via mail / mailbox parcel available'],
  ['Kies of je dit boek binnen op je digitale plank bewaart of buiten in de fysieke MiniBieb legt.', 'Choose whether to keep this book on your indoor digital shelf or place it outside in a physical Little Library.'],
  ['🔐 Stap 4: Extra onderlinge borg bij kostbare boeken (Optioneel)', '🔐 Step 4: Optional deposit for valuable books'],
  ['Geen extra onderlinge borg', 'No extra deposit'],
  ['Onderlinge borg (€ 5 tot € 20 via Tikkie/contant)', 'Mutual deposit (€ 5 to € 20 via payment app/cash)'],
  ['Onderpand-boek (1-op-1 tijdelijk ruilboek)', 'Swap book collateral (1-on-1 temporary book swap)'],
  ['📚 Plaats Boek op mijn Boekenplank', '📚 Place Book on My Shelf'],
  ['Interactieve Zwerfboek-Paspoorten', 'Interactive Roaming Book Passports'],
  ['Reisverhalen &amp; Poststempels', 'Travel Stories &amp; Postal Stamps'],
  ['Reisverhalen & Poststempels', 'Travel Stories & Postal Stamps'],
  ['Elk boek in BuurtBieb.nl heeft een eigen stempelkaart waarop lezers een poststempel met hun 4-cijferige postcode, datum en leesreactie achterlaten.', 'Every book in BuurtBieb.nl has its own stamp card where readers leave a postal stamp with their 4-digit postal code, date and reading note.'],
  ['📚 Buurtkastjes', '📚 Bookshelves'],
  ['🛍️ Boekenbeurs', '🛍️ Book Market'],
  ['💬 BuurtChat', '💬 Chat'],
  ['➕ Aanbieden', '➕ Add Book'],
  ['🛂 Paspoorten', '🛂 Passports'],
  ['🏡 Mijn Bieb', '🏡 My Library'],
  ['Inloggen / Aanmelden', 'Log in / Sign up'],
  ['Profiel voltooien', 'Complete profile'],
  ['🚪 Uitloggen', '🚪 Log out'],
  ['Account aanmaken bij BuurtBieb.nl', 'Create Account at BuurtBieb.nl'],
  ['Inloggen bij BuurtBieb.nl', 'Log in to BuurtBieb.nl'],
  ['Log in of maak direct een account aan met gebruikersnaam en wachtwoord of Google.', 'Log in or create an account with username and password or Google.'],
  ['Gebruikersnaam', 'Username'],
  ['Kies of typ je gebruikersnaam', 'Choose or enter your username'],
  ['Wachtwoord', 'Password'],
  ['Minimaal 8 tekens', 'Minimum 8 characters'],
  ['— of —', '— or —'],
  ['🌐 Doorgaan met Google Account', '🌐 Continue with Google Account'],
  ['✨ Account aanmaken', '✨ Create Account'],
  ['🔑 Inloggen', '🔑 Log in'],
  ['Zet BuurtBieb.nl als App op je startscherm of bureaublad', 'Install BuurtBieb.nl as an App on your home screen or desktop'],
  ['voor direct scannen &amp; chatten!', 'for quick scanning &amp; chatting!'],
  ['📲 App Installeren', '📲 Install App'],
  ['🧪 Lokale Testmodus (Zandbak) actief', '🧪 Local Test Mode (Sandbox) active'],
  ['🌐 Terug naar echte Live versie', '🌐 Back to Live version'],
  ['🧪 Testmodus · Sluit', '🧪 Test Mode · Close'],
  ['🟢 Zwerfboek · Gratis', '🟢 Roaming Book · Free'],
  ['🔵 Leenboek · Buurt', '🔵 Loan Book · Local'],
  ['🟡 Koopboek ·', '🟡 Budget Buy ·'],
  ['🟣 Boekenbeurs ·', '🟣 Book Market ·'],
  ['⏳ Gereserveerd', '⏳ Reserved'],
  ['📖 Uitgeleend', '📖 Loaned out'],
  ['🏡 Vrij pakken uit MiniBieb', '🏡 Free pickup from Little Library'],
  ['🚪 Ophalen op afspraak', '🚪 Pickup by appointment'],
  ['✉️ Brievenbuspakje', '✉️ Mailbox parcel'],
  ['🔄 Borg: Onderpand-boek', '🔄 Deposit: Swap book'],
  ['(Tikkie/contant)', '(cash / payment app)'],
  ['Bovenste Plank ·', 'Top Shelf ·'],
  ['Middelste Plank ·', 'Middle Shelf ·'],
  ['Onderste Plank ·', 'Bottom Shelf ·'],
  ['Lege Boekenplank', 'Empty Bookshelf'],
  ['← Vorige kast', '← Previous cabinet'],
  ['Volgende kast →', 'Next cabinet →'],
  ['Welkom bij BuurtBieb.nl — De boekenplank wacht op het eerste boek!', 'Welcome to BuurtBieb.nl — The bookshelf is waiting for its first book!'],
  ['Er staan op dit moment nog geen boeken op deze buurtplank. Deel eenvoudig een boek vanaf je eigen boekenplank thuis of vanuit je MiniBieb, of plaats hieronder een "Boek Gezocht"-oproepje.', 'There are no books on this community shelf yet. Easily share a book from your own shelf or Little Library, or post a "Wanted Book" request below.'],
  ['📚 Eerste boek aanbieden', '📚 Add First Book'],
  ['🔎 "Boek Gezocht"-oproepje plaatsen', '🔎 Post a "Wanted Book" Request'],
  ['📌 Plaats een "🔎 Boek Gezocht"-oproepje bij je buren', '📌 Post a "🔎 Wanted Book" request to your neighbors'],
  ['Dit boek staat momenteel niet op een boekenplank bij jou in de buurt.', 'This book is currently not on a bookshelf near you.'],
  ['Geen boeken op deze plank gevonden', 'No books found on this shelf'],
  ['Steun het onderhoud van BuurtBieb.nl door het boek te bekijken bij Libris.nl, Bol.com of Amazon.nl:', 'Support BuurtBieb.nl by checking the book at Libris.nl, Bol.com or Amazon.nl:'],
  ['Niet in jouw directe buurt gevonden of liever nieuw bestellen?', 'Not found nearby or prefer buying new?'],
  ['🏛️ Bekijk bij Libris.nl', '🏛️ View at Libris.nl'],
  ['📦 Bekijk bij Bol.com', '📦 View at Bol.com'],
  ['🛒 Bekijk bij Amazon.nl', '🛒 View at Amazon.nl'],
  ['Nog geen gezochte boeken in jouw buurt. Zoek je een specifiek boek? Klik rechtsboven op', 'No wanted books in your area yet. Looking for a specific book? Click top-right on'],
  ['💬 Ik heb dit boek voor je! (Open Chat)', '💬 I have this book for you! (Open Chat)'],
  ['✅ Boek gevonden / Oproepje verwijderen', '✅ Book found / Remove request'],
  ['Gezocht door:', 'Requested by:'],
  ['📚 Dit is jouw eigen boek op de plank', '📚 This is your own book on the shelf'],
  ['Status: <strong>⏳ Gereserveerd', 'Status: <strong>⏳ Reserved'],
  ['Status: <strong>📖 Uitgeleend', 'Status: <strong>📖 Loaned out'],
  ['Status: <strong>✅ Beschikbaar</strong> voor buurtgenoten op de boekenplank. (Je kunt geen aanvraag of chat met jezelf starten.)', 'Status: <strong>✅ Available</strong> for neighbors on the bookshelf. (You cannot start a request or chat with yourself.)'],
  ['↩️ Zet weer als Beschikbaar op de plank', '↩️ Set Back to Available on Shelf'],
  ['✅ Overdracht afronden', '✅ Complete Handover'],
  ['📖 Markeer als Uitgeleend', '📖 Mark as Loaned Out'],
  ['🗑️ Boek verwijderen van mijn plank', '🗑️ Remove Book from My Shelf'],
  ['🤝 Kies Overdracht &amp; Neem Contact Op', '🤝 Choose Handover &amp; Contact Owner'],
  ['Dit boek staat op een thuis-boekenplank. Kies hoe je het boek wilt overnemen en spreek af via de chat:', 'This book is on a home bookshelf. Choose how you want to take it over and arrange pickup via chat:'],
  ['🚪 1-op-1 ophalen op afspraak (Aan de deur / vanuit huis)', '🚪 1-on-1 pickup by appointment (At the door / from home)'],
  ['📦 In overleg klaarleggen op afspraak (als niemand thuis is)', '📦 Leave ready for pickup by appointment (if nobody is home)'],
  ['✉️ Verzenden per post / brievenbuspakje', '✉️ Ship by mail / mailbox parcel'],
  ['Verzendlabel onderling afstemmen.', 'Coordinate shipping label together.'],
  ['Lokaal lenen in overleg &amp; na het lezen terugbrengen', 'Borrow locally &amp; return after reading'],
  ['Lokaal lenen in overleg & na het lezen terugbrengen', 'Borrow locally & return after reading'],
  ['Gratis meenemen, ruilen of doorgeven', 'Take, swap or pass on for free'],
  ['Onderling afrekenen', 'Settle directly'],
  ['💬 Aanvragen via Chat', '💬 Request via Chat'],
  ['Voorkeur eigenaar:', 'Owner preference:'],
  ['📚 Boekenplank:', '📚 Bookshelf:'],
  ['🏡 Fysieke MiniBieb:', '🏡 Physical Little Library:'],
  ['Aangeboden in de lokale BuurtBieb.', 'Shared in the local BuurtBieb.'],
  ['🛂 Interactief Zwerfboek-Paspoort (Stempelkaart)', '🛂 Interactive Roaming Book Passport (Stamp Card)'],
  ['Volg de reis van dit boek van lezer naar lezer en laat jouw poststempel achter!', 'Follow the journey of this book from reader to reader and leave your postal stamp!'],
  ['Nog geen stempels. Zet als eerste lezer een poststempel!', 'No stamps yet. Be the first reader to leave a postal stamp!'],
  ['✒️ Laat een nieuwe poststempel achter op de stempelkaart van', '✒️ Leave a new postal stamp on the passport of'],
  ['Jouw naam of bieb-naam', 'Your name or library name'],
  ['Postcode (4 cijfers)', 'Postal code (4 digits)'],
  ['Woonplaats', 'City / Town'],
  ['🟢 Groene Poststempel', '🟢 Green Postal Stamp'],
  ['🔴 Rode Poststempel', '🔴 Red Postal Stamp'],
  ['🟡 Gouden Ex-Libris Stempel', '🟡 Gold Ex-Libris Stamp'],
  ['Korte reactie voor de volgende lezer (max 280 tekens)...', 'Short note for the next reader (max 280 chars)...'],
  ['✒️ Zet Poststempel in Paspoort', '✒️ Add Postal Stamp'],
  ['📯 Zet Poststempel in Paspoort', '📯 Add Postal Stamp'],
  ['Geen Boekenbeurs-boeken gevonden voor dit filter', 'No Book Market books found for this filter'],
  ['Heb je zelf een recent gelezen bestseller, kookboek of studieboek liggen? Zet hem op de Boekenbeurs!', 'Have a recently read bestseller, cookbook or study book? List it on the Book Market!'],
  ['📚 Jouw aangeboden boek', '📚 Your listed book'],
  ['⚙️ Beheren', '⚙️ Manage'],
  ['💬 Koop / Chat in App', '💬 Buy / In-App Chat'],
  ['🔍 Details', '🔍 Details'],
  ['💬 Bied in Chat', '💬 Bid in Chat'],
  ['🏷️ Bieden: €', '🏷️ Bid: €'],
  ['🔒 Vaste prijs · Ophalen aan de deur of verzending per post', '🔒 Fixed price · Door pickup or mail shipping'],
  ['Nog geen actieve gesprekken in je BuurtChat', 'No active conversations in your Chat yet'],
  ['Klik bij een boek op de houten plank of op de Boekenbeurs op', 'Click on any book on the shelf or Book Market on'],
  ['📚 Bekijk Boeken op de Plank', '📚 View Books on the Shelf'],
  ['💬 BuurtChat Gesprekken', '💬 Chat Conversations'],
  ['Klik op een gesprek om te openen', 'Click a conversation to open'],
  ['← Gesprekken', '← Conversations'],
  ['🗑️ Voorbeeldbericht wissen', '🗑️ Clear sample message'],
  ['Typ een bericht...', 'Type a message...'],
  ['Verstuur ➤', 'Send ➤'],
  ['Nog geen Zwerfboek-Paspoorten actief', 'No Roaming Book Passports active yet'],
  ['Zodra er boeken op de plank staan, krijgt elk boek automatisch een eigen stempelkaart waar lezers een poststempel op kunnen zetten.', 'Once books are added to shelves, each book gets a stamp card where readers can leave postal stamps.'],
  ['📚 Eerste boek toevoegen', '📚 Add First Book'],
  ['✒️ Stempel plaatsen / Boek openen', '✒️ Add Stamp / Open Book'],
  ['Nog geen stempels in dit paspoort.', 'No stamps in this passport yet.'],
  ['Huidige ligplaats:', 'Current location:'],
  ['🌱 Doorgegeven / Aan het zwerven', '🌱 Passed on / Roaming'],
  ['Inloggen of Account aanmaken', 'Log in or Create Account'],
  ['Maak eenvoudig een account aan met', 'Easily create an account with'],
  ['Gebruikersnaam &amp; Wachtwoord', 'Username &amp; Password'],
  ['of log direct in via', 'or log straight in with'],
  ['🔐 Account ·', '🔐 Account ·'],
  ['🏡 Heeft fysieke MiniBieb aan de straat', '🏡 Has a street Little Library'],
  ['📚 Deelt vanuit Huis (Digitale Boekenplank)', '📚 Shares from Home (Digital Bookshelf)'],
  ['Profiel &amp; gegevens wijzigen', 'Edit profile &amp; settings'],
  ['Profiel & gegevens wijzigen', 'Edit profile & settings'],
  ['Bewerken sluiten', 'Close editor'],
  ['🗑️ Account verwijderen', '🗑️ Delete Account'],
  ['🗑️ Account definitief verwijderen', '🗑️ Permanently Delete Account'],
  ['📍 Locatie:', '📍 Location:'],
  ['Niet ingesteld (optioneel via Profiel wijzigen)', 'Not set (optional via Edit profile)'],
  ['Jouw zichtbare contactvoorkeuren:', 'Your visible contact preferences:'],
  ['🎨 Jouw Boekenplank-instellingen, Thema &amp; Contactvoorkeuren', '🎨 Bookshelf Settings, Theme &amp; Contact Preferences'],
  ['Hoe deel jij jouw boeken met de buurt?', 'How do you share your books with neighbors?'],
  ['📚 Ik deel vanuit Huis (Digitale Boekenplank)', '📚 I share from Home (Digital Bookshelf)'],
  ['🏡 Ik heb een fysieke MiniBieb aan de straat', '🏡 I have a street Little Library'],
  ['Jouw naam of naam van je Boekenplank / MiniBieb', 'Your name or Bookshelf / Little Library name'],
  ['Visueel Kastjes-Thema', 'Visual Cabinet Theme'],
  ['Postcode (4 cijfers, optioneel)', 'Postal code (4 digits, optional)'],
  ['Woonplaats (optioneel)', 'City / Town (optional)'],
  ['Hoe mogen buurtgenoten contact met jou opnemen? (Meerdere keuzes mogelijk)', 'How may neighbors contact you? (Multiple choices possible)'],
  ['💾 Kastjes-profiel &amp; Contactvoorkeuren opslaan', '💾 Save Profile &amp; Contact Preferences'],
  ['✕ Annuleren', '✕ Cancel'],
  ['Boeken op jouw plank', 'Books on your shelf'],
  ['Boeken op jouw MiniBieb-plank', 'Books in your Little Library'],
  ['📖 Door jou gereserveerde / geleende boeken', '📖 Books reserved / borrowed by you'],
  ['⚡ Meerdere boeken achter elkaar scannen', '⚡ Batch scan books'],
  ['+ Nieuw boek toevoegen', '+ Add new book'],
  ['🔍 Bekijk', '🔍 View'],
  ['🗑️ Verwijderen', '🗑️ Delete'],
  ['✅ Teruggebracht (Zet weer op plank)', '✅ Returned (Set back on shelf)'],
  ['↩️ Zet weer op plank', '↩️ Set back on shelf'],
  ['🔎 Boeken zoeken in jouw buurt', '🔎 Search books in your neighborhood'],
  ['Typ een titel, auteur, ISBN of postcode en druk op', 'Enter a title, author, ISBN or postal code and press'],
  ['om direct door de buurtboekenkast te zoeken.', 'to search the neighborhood bookshelf right away.'],
  ['🔍 Zoek een boek op titel, auteur of ISBN...', '🔍 Search a book by title, author or ISBN...'],
  ['🔍 Zoek boeken', '🔍 Search books'],
  ['Zoek boeken', 'Search books'],
  ['🔍 Titel, auteur of ISBN...', '🔍 Title, author or ISBN...'],
  ['📍 Postcode / plaats', '📍 Postal code / city'],
  ['🔍 Zoek op titel of auteur...', '🔍 Search title or author...'],
  ['ISBN, titel of auteur...', 'ISBN, title or author...'],
  ['Korte toelichting...', 'Short note...'],
  ['Typ een bericht…', 'Type a message…'],
  ['Bijv. voor vakantie of boekenclub', 'E.g. for holiday or book club'],
  ['🌍 Afstand: Heel Nederland', '🌍 Distance: All Netherlands'],
  ['🌍 Heel Nederland', '🌍 All Netherlands'],
  ['📍 Binnen 5 km', '📍 Within 5 km'],
  ['📍 Binnen 15 km', '📍 Within 15 km'],
  ['📍 Binnen 25 km', '📍 Within 25 km'],
  ['📍 Binnen 50 km', '📍 Within 50 km'],
  ['Meer boeken laden', 'Load more books'],
  ['Meer paspoorten laden', 'Load more passports'],
  ['Zwerfboek-Paspoorten', 'Roaming Passports'],
  ['Boek aanbieden', 'Share a Book'],
  ['Delen & Contact', 'Share & Contact'],
  ['Delen &amp; Contact', 'Share &amp; Contact'],
  ['Mijn Account & Hulp', 'My Account & Help'],
  ['Mijn Account &amp; Hulp', 'My Account &amp; Help'],
  ['Hoe werkt BuurtBieb?', 'How does BuurtBieb work?'],
  ['Welkom bij BuurtBieb.nl', 'Welcome to BuurtBieb.nl'],
  ['Zo werkt jouw buurtboekenkast', 'How your neighborhood bookshelf works'],
  ['Deel, leen, ruil of ontdek boeken bij buren en fysieke MiniBiebs in jouw omgeving — helemaal zonder gedoe.', 'Share, borrow, swap or discover books from neighbors and Little Free Libraries nearby — completely hassle-free.'],
  ['1. Ontdek boeken in de buurt', '1. Discover books nearby'],
  ['Blader door de Buurtboekenkast, bekijk de MiniBieb Kaart of de Boekenbeurs en filter op postcode of afstand.', 'Browse the Neighborhood Bookshelf, check the MiniBieb Map or Book Market, and filter by postal code or distance.'],
  ['2. Bied zelf een boek aan', '2. Share a book yourself'],
  ['Scan een ISBN-barcode of zoek op titel — de kaft en info worden automatisch ingevuld. Kies uit Zwerfboek, Leenboek of Koopboek.', 'Scan an ISBN barcode or search by title — cover and details are filled in automatically. Choose Roaming, Loan, or Budget Buy.'],
  ['3. Spreek veilig af via BuurtChat', '3. Arrange pickup safely via BuurtChat'],
  ['Zie je een mooi boek? Stuur direct een berichtje in de app, zonder je telefoonnummer of e-mailadres te delen.', 'Spot a great book? Send a message right inside the app without sharing your phone number or email address.'],
  ['4. Alles overzichtelijk in het menu linksboven', '4. Everything organized in the top-left menu'],
  ['Via de 3 streepjes linksboven vind je alle onderdelen, je eigen bieb en kun je deze uitleg later altijd teruglezen.', 'Tap the 3 lines in the top-left corner for all sections, your own shelf, and to reopen this guide anytime.'],
  ['🚀 Begrepen, aan de slag!', '🚀 Got it, let’s get started!'],
  ['Mijn Account', 'My Account'],
  ['Taal: NL / EN', 'Language: NL / EN'],
  ['App installeren', 'Install App'],
  ['Buurtboekenkast', 'Neighborhood Bookshelf'],
  ['📚 Ontdekken', '📚 Discover'],
  ['📚 Boekenkast', '📚 Bookshelf'],
  ['🗺️ MiniBieb Kaart', '🗺️ MiniBieb Map'],
  ['🔎 Boek Gezocht', '🔎 Wanted'],
  ['🛂 Paspoorten', '🛂 Passports'],
  ['📍 Postcode of plaats...', '📍 Postal code or city...'],
  ['⚙️ Meer filters', '⚙️ More filters'],
  ['📚 2 Planken (6 boeken)', '📚 2 Shelves (6 books)'],
  ['📚 3 Planken (9 boeken)', '📚 3 Shelves (9 books)'],
  ['📚 3 Brede Planken (12 boeken)', '📚 3 Wide Shelves (12 books)'],
  ['🌐 Alle talen', '🌐 All languages'],
  ['🇬🇧 Engels', '🇬🇧 English'],
  ['🌍 Overig', '🌍 Other'],
  ['📚 Alle', '📚 All'],
  ['📚 Buurtboekenkast', '📚 Neighborhood Bookshelf'],
  ['Klik op een boek om details te zien of contact op te nemen', 'Click a book to view details or get in touch'],
  ['📷 Stap 1: Zoek op ISBN, titel of auteur', '📷 Step 1: Search by ISBN, title or author'],
  ['🔎 Zoek boek', '🔎 Find book'],
  ['📷 Foto kaft', '📷 Cover photo'],
  ['Korte samenvatting of staat van het boek (optioneel)', 'Short summary or book condition (optional)'],
  ['Wordt automatisch ingevuld via ISBN of typ zelf iets leuks...', 'Auto-filled via ISBN or write a short note...'],
  ['⚙️ Meer opties (Genre, taal, verzending, borg & snel-scan)', '⚙️ More options (Genre, language, shipping, deposit & quick-scan)'],
  ['⚙️ Meer opties (Genre, taal, verzending, borg &amp; snel-scan)', '⚙️ More options (Genre, language, shipping, deposit &amp; quick-scan)'],
  ['Boekgenre / Categorie', 'Genre / Category'],
  ['🌐 Taal van het boek', '🌐 Book language'],
  ['Kaft-URL (optioneel, of gebruik de foto-knop hierboven)', 'Cover URL (optional, or use the photo button above)'],
  ['📦 Overdracht & locatie', '📦 Handover & location'],
  ['📦 Overdracht &amp; locatie', '📦 Handover &amp; location'],
  ['📚 Binnen op Plank', '📚 Indoor Shelf'],
  ['🚪 1-op-1 ophalen op afspraak', '🚪 1-on-1 pickup by appointment'],
  ['✉️ Verzenden per post mogelijk', '✉️ Postal shipping available'],
  ['🔐 Onderlinge borg (Optioneel)', '🔐 Mutual deposit (Optional)'],
  ['Onderlinge borg (€ 5 tot € 20)', 'Mutual deposit (€ 5 to € 20)'],
  ['⚡ Snel-Scan modus (meerdere boeken achter elkaar)', '⚡ Quick-Scan mode (scan multiple books in a row)'],
  ['💬 Vraag aan beheerder', '💬 Ask host'],
  ['💬 Open BuurtChat', '💬 Open Chat'],
  ['💬 Koop / Stuur bericht', '💬 Buy / Message'],
  ['💬 Bied via BuurtChat', '💬 Offer via Chat'],
  ['🤝 Kies Overdracht & Neem Contact Op', '🤝 Choose Handover & Get in Touch'],
  ['🤝 Kies Overdracht &amp; Neem Contact Op', '🤝 Choose Handover &amp; Get in Touch'],
  ['← Terug', '← Back'],
  ['🕒 Wanneer ophalen?', '🕒 When to pick up?'],
  ['📦 Ligt klaar', '📦 Ready for pickup'],
  ['✅ Opgehaald, dank!', '✅ Picked up, thanks!'],
  ['Schrijf een bericht… (Enter om te versturen)', 'Write a message… (Enter to send)'],
  ['Nieuw gesprek…', 'New conversation…'],
  ['⚙️ Jouw Boekenplank-instellingen', '⚙️ Your Bookshelf Settings'],
  ['💾 Profiel opslaan', '💾 Save Profile'],
  ['Definitief verwijderen', 'Delete permanently'],
  ['🟢 Zwerfboek', '🟢 Roaming Book'],
  ['🔵 Leenboek', '🔵 Loan Book'],
  ['🟡 Koopboek', '🟡 Budget Buy'],
  ['🟣 Boekenbeurs', '🟣 Book Market'],
  ['🔎 Gezocht', '🔎 Wanted'],
  ['>Ontdek<', '>Discover<'],
  ['>Planken<', '>Shelves<'],
  ['>Beurs<', '>Market<'],
  ['>Chat<', '>Chat<'],
  ['>Nieuw<', '>Add<'],
  ['>Paspoort<', '>Passports<'],
  ['>Profiel<', '>Profile<'],
  ['>Wis<', '>Clear<'],
  ['>Wissen<', '>Clear<'],
  ['>Annuleren<', '>Cancel<']
];

const UI_EN_PAIRS = UI_EN_RAW_PAIRS.slice().sort((a, b) => b[0].length - a[0].length);

function translateStringToEn(input) {
  if (!input || !isEn()) return input;
  let out = String(input);
  for (let i = 0; i < UI_EN_PAIRS.length; i++) {
    const nl = UI_EN_PAIRS[i][0];
    if (out.includes(nl)) {
      out = out.split(nl).join(UI_EN_PAIRS[i][1]);
    }
  }
  out = out
    .replace(/Toont boek <strong>([^<]+)<\/strong> van <strong>([^<]+)<\/strong> gevonden boeken/g, 'Showing book <strong>$1</strong> of <strong>$2</strong> books found')
    .replace(/Maximale hoogte: <strong>max\. 3 planken per kast<\/strong>/g, 'Max height: <strong>max. 3 shelves per cabinet</strong>')
    .replace(/\bKast (\d+) van (\d+)\b/g, 'Cabinet $1 of $2')
    .replace(/\bKast (\d+)\b/g, 'Cabinet $1')
    .replace(/(\d+) boeken\b/g, '$1 books')
    .replace(/\b1 boek\b/g, '1 book')
    .replace(/(\d+) Poststempels\b/g, '$1 Postal Stamps')
    .replace(/\b1 Poststempel\b/g, '1 Postal Stamp')
    .replace(/Gezocht boek "([^"]*)" niet in een buurtkastje gevonden\?/g, 'Wanted book "$1" not found in a nearby shelf?')
    .replace(/(>|\n\s*)Door\s+/g, '$1By ')
    .replace(/^Door\s+/gm, 'By ')
    .replace(/\bBoekenplank van\s+/g, 'Bookshelf of ')
    .replace(/\bAangevraagd door\s+/g, 'Requested by ')
    .replace(/·\s*Duits\b/g, '· German')
    .replace(/\b🌍 Duits\b/g, '🌍 German')
    .replace(/\b🌍 Frans\b/g, '🌍 French')
    .replace(/\b🌍 Spaans\b/g, '🌍 Spanish')
    .replace(/\b🌍 Italiaans\b/g, '🌍 Italian')
    .replace(/\b🌍 Andere taal\b/g, '🌍 Other language')
    .replace(/^\s*Ontdek\s*$/g, 'Discover')
    .replace(/^\s*Beurs\s*$/g, 'Market')
    .replace(/^\s*Nieuw\s*$/g, 'Add')
    .replace(/^\s*Profiel\s*$/g, 'Profile')
    .replace(/^\s*Wis\s*$/g, 'Clear')
    .replace(/^\s*Wissen\s*$/g, 'Clear')
    .replace(/^\s*Annuleren\s*$/g, 'Cancel')
    .replace(/\b🌍 Internationaal\b/g, '🌍 International');
  return out;
}

function setTranslatedHtml(el, html) {
  if (!el) return;
  el.innerHTML = isEn() ? translateStringToEn(html) : html;
}

const _nlTextOrigins = typeof WeakMap === 'function' ? new WeakMap() : null;
const _nlAttrOrigins = typeof WeakMap === 'function' ? new WeakMap() : null;
const DYNAMIC_I18N_CONTAINER_IDS = new Set([
  'userStatusContainer',
  'secretTestModeBanner',
  'pwaInstallBanner',
  'onboardingBanner',
  'woodenCabinetContent',
  'physicalMiniBiebsSection',
  'internationalBooksSection',
  'wantedBooksListContainer',
  'marketplaceGridContainer',
  'chatTabContent',
  'passportsTabContent',
  'profileTabContent',
  'bookDetailModalBody',
  'toastContainer'
]);

const EXACT_STATIC_NODE_EN = {
  Planken: 'Shelves',
  Beurs: 'Market',
  Chat: 'Chat',
  Nieuw: 'Add',
  Paspoort: 'Passports',
  Profiel: 'Profile',
  Annuleren: 'Cancel',
  Buurtgedreven: 'Community-driven',
  '4-Cijfer': '4-Digit',
  Boekgenres: 'Genres',
  '— of —': '— or —'
};

function applyDynamicTranslationIfNeeded(el) {
  if (el && isEn() && typeof el.innerHTML === 'string' && el.innerHTML) {
    el.innerHTML = translateStringToEn(el.innerHTML);
  }
}

function applyStaticDomTranslations() {
  const lang = getCurrentLang();
  if (typeof document === 'undefined') return;
  if (document.documentElement && typeof document.documentElement.setAttribute === 'function') {
    document.documentElement.setAttribute('lang', lang);
  }
  if (typeof document.title === 'string') {
    document.title = tr(
      'BuurtBieb.nl — Landelijk Netwerk van Online & Fysieke Mini-Biebs',
      'BuurtBieb.nl — Nationwide Network of Online & Street Little Libraries'
    );
  }
  if (typeof document.createTreeWalker !== 'function' || typeof NodeFilter === 'undefined' || !document.body) {
    return;
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent) continue;
    const tag = parent.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE') continue;
    let skipDynamic = false;
    let cur = parent;
    while (cur && cur !== document.body) {
      if (cur.id && DYNAMIC_I18N_CONTAINER_IDS.has(cur.id)) {
        skipDynamic = true;
        break;
      }
      cur = cur.parentElement;
    }
    if (skipDynamic) continue;

    if (!_nlTextOrigins.has(node)) {
      _nlTextOrigins.set(node, node.nodeValue);
    }
    const orig = _nlTextOrigins.get(node);
    const collapsed = orig ? orig.replace(/\s+/g, ' ').trim() : '';
    if (!collapsed) continue;
    if (lang === 'en') {
      const exactHit = EXACT_STATIC_NODE_EN[collapsed];
      const translatedBody = exactHit || translateStringToEn(collapsed);
      if (translatedBody !== collapsed) {
        const lead = /^\s/.test(orig) ? ' ' : '';
        const trail = /\s$/.test(orig) ? ' ' : '';
        const nextVal = lead + translatedBody + trail;
        if (node.nodeValue !== nextVal) node.nodeValue = nextVal;
      }
    } else if (node.nodeValue !== orig) {
      node.nodeValue = orig;
    }
  }

  document.querySelectorAll('[placeholder], [title]').forEach((el) => {
    let skipDynamic = false;
    let cur = el;
    while (cur && cur !== document.body) {
      if (cur.id && DYNAMIC_I18N_CONTAINER_IDS.has(cur.id)) {
        skipDynamic = true;
        break;
      }
      cur = cur.parentElement;
    }
    if (skipDynamic) return;
    if (!_nlAttrOrigins.has(el)) {
      _nlAttrOrigins.set(el, {
        placeholder: el.getAttribute('placeholder'),
        title: el.getAttribute('title')
      });
    }
    const origAttrs = _nlAttrOrigins.get(el);
    if (origAttrs.placeholder !== null) {
      el.setAttribute('placeholder', lang === 'en' ? translateStringToEn(origAttrs.placeholder) : origAttrs.placeholder);
    }
    if (origAttrs.title !== null) {
      el.setAttribute('title', lang === 'en' ? translateStringToEn(origAttrs.title) : origAttrs.title);
    }
  });
}

window.toggleLanguage = function (forceLang) {
  const current = getCurrentLang();
  const next = forceLang === 'en' || forceLang === 'nl' ? forceLang : current === 'en' ? 'nl' : 'en';
  try {
    localStorage.setItem(LANG_STORAGE_KEY, next);
  } catch {}
  refreshAllViews();
  showToast(next === 'en' ? '🇬🇧 Language switched to English.' : '🇳🇱 Taal geschakeld naar Nederlands.');
};

window.handleBookCoverError = function (imgEl) {
  if (!imgEl || !imgEl.parentElement) return;
  const fallbackTitle = imgEl.getAttribute('data-fallback-title') || '';
  const alreadyRetried = imgEl.getAttribute('data-cover-retried') === 'true';
  const bookId = (imgEl.getAttribute('data-book-id') || '').trim();
  const bookTitle = (imgEl.getAttribute('alt') || fallbackTitle || '').trim();
  const bookAuthor = (imgEl.getAttribute('data-book-author') || '').trim();
  const wrapper = imgEl.parentElement;

  wrapper.classList.add('cover-fallback-active');
  wrapper.textContent = '';
  const span = document.createElement('span');
  span.appendChild(document.createTextNode('📚'));
  if (fallbackTitle) {
    span.appendChild(document.createElement('br'));
    span.appendChild(document.createTextNode(fallbackTitle));
  }
  wrapper.appendChild(span);

  if (
    !alreadyRetried &&
    bookTitle &&
    bookTitle !== 'Boekkaft' &&
    bookTitle !== 'Geen kaft' &&
    window.IsbnService &&
    typeof window.IsbnService.findCoverByTitleAuthor === 'function'
  ) {
    window.IsbnService.findCoverByTitleAuthor(bookTitle, bookAuthor)
      .then((foundCover) => {
        if (!foundCover) return;
        if (bookId && window.BuurtBiebDB && typeof window.BuurtBiebDB.updateBookCover === 'function') {
          window.BuurtBiebDB.updateBookCover(bookId, foundCover);
        }
        if (!wrapper.isConnected) return;

        const retryImg = document.createElement('img');
        retryImg.src = foundCover;
        retryImg.alt = bookTitle;
        retryImg.setAttribute('data-fallback-title', fallbackTitle);
        retryImg.setAttribute('data-cover-retried', 'true');
        if (bookId) retryImg.setAttribute('data-book-id', bookId);
        if (bookAuthor) retryImg.setAttribute('data-book-author', bookAuthor);
        retryImg.onload = function () {
          wrapper.classList.remove('cover-fallback-active');
          window.handleBookCoverLoad(this);
        };
        retryImg.onerror = function () {
          window.handleBookCoverError(this);
        };
        wrapper.textContent = '';
        wrapper.appendChild(retryImg);
      })
      .catch(() => {});
  }
};

window.handleBookCoverLoad = function (imgEl) {
  if (!imgEl) return;
  if (imgEl.naturalWidth <= 1 || imgEl.naturalHeight <= 1) {
    window.handleBookCoverError(imgEl);
  }
};

// Subtiele mobiele haptic feedback (trilfeedback op ondersteunde toestellen zoals Android PWA)
const HAPTIC_PATTERNS = {
  light: 10,
  medium: 18,
  success: [12, 35, 18],
  warning: [24, 40, 24]
};

window.triggerHaptic = function (style = 'light') {
  try {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const pattern = HAPTIC_PATTERNS[style] ?? HAPTIC_PATTERNS.light;
    navigator.vibrate(pattern);
  } catch {}
};

function showToast(message) {
  window.triggerHaptic('success');
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast-msg';
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 4200);
}

const CONDITION_LABELS = {
  als_nieuw: '✨ Als nieuw',
  goed: '👍 Goed',
  gelezen: '📖 Gelezen'
};

const GENRE_ICONS = {
  'Literatuur & Roman': '📖',
  'Spanning & Thriller': '🔪',
  'Detective & Misdaad': '🔍',
  'Fantasy & Sciencefiction': '🚀',
  'Feelgood & Romantiek': '💕',
  'Geschiedenis & Politiek': '🏛️',
  'Psychologie & Filosofie': '🧠',
  'Persoonlijke Ontwikkeling & Gezondheid': '🌱',
  'Biografie & Waargebeurd': '🌍',
  'Wetenschap, Natuur & Techniek': '🔬',
  'Kookboek, Eten & Lifestyle': '🍳',
  'Reizen, Cultuur & Taal': '✈️',
  'Kunst, Design & Fotografie': '🎨',
  'Studie-, Vak- & Managementboek': '🎓',
  'Kinder-, Jeugd- & Young Adult': '🧸',
  'Stripboek, Graphic Novel & Poëzie': '💬',
  'Engelse Boeken': '🇬🇧',
  'Internationale Boeken': '🌍'
};

const GENRE_EN_MAP = {
  'Literatuur & Roman': 'Literature & Fiction',
  'Spanning & Thriller': 'Suspense & Thriller',
  'Detective & Misdaad': 'Detective & Crime',
  'Fantasy & Sciencefiction': 'Fantasy & Sci-Fi',
  'Feelgood & Romantiek': 'Feelgood & Romance',
  'Geschiedenis & Politiek': 'History & Politics',
  'Psychologie & Filosofie': 'Psychology & Philosophy',
  'Persoonlijke Ontwikkeling & Gezondheid': 'Personal Development & Health',
  'Biografie & Waargebeurd': 'Biography & True Story',
  'Wetenschap, Natuur & Techniek': 'Science, Nature & Tech',
  'Kookboek, Eten & Lifestyle': 'Cookbook, Food & Lifestyle',
  'Reizen, Cultuur & Taal': 'Travel, Culture & Language',
  'Kunst, Design & Fotografie': 'Art, Design & Photography',
  'Studie-, Vak- & Managementboek': 'Study, Academic & Business',
  'Kinder-, Jeugd- & Young Adult': 'Kids, Youth & Young Adult',
  'Stripboek, Graphic Novel & Poëzie': 'Comics, Graphic Novel & Poetry',
  'Engelse Boeken': 'English Books',
  'Internationale Boeken': 'International Books'
};

const OTHER_LANG_EN_MAP = {
  Duits: 'German',
  Frans: 'French',
  Spaans: 'Spanish',
  Italiaans: 'Italian',
  'Andere taal': 'Other language'
};

function getBookGenre(book) {
  return book.genre || book.market_category || 'Literatuur & Roman';
}

function getBookLanguageCategory(book) {
  const rawLang = String((book && book.book_language) || '').trim().toLowerCase();
  const genre = getBookGenre(book || {});
  if (rawLang === 'en' || genre === 'Engelse Boeken') return 'en';
  if (rawLang.startsWith('other') || genre === 'Internationale Boeken') return 'other';
  return 'nl';
}

function getBookLanguageDisplay(book) {
  const cat = getBookLanguageCategory(book);
  if (cat === 'en') return tr('🇬🇧 Engels', '🇬🇧 English');
  if (cat === 'other') {
    const rawLang = String((book && book.book_language) || '');
    const customPart = rawLang.includes(':') ? rawLang.split(':').slice(1).join(':').trim() : '';
    const langLabel = customPart
      ? tr(customPart, OTHER_LANG_EN_MAP[customPart] || customPart)
      : tr('Internationaal', 'International');
    return `🌍 ${langLabel}`;
  }
  return tr('🇳🇱 Nederlands', '🇳🇱 Dutch');
}

function renderBookLanguageBadge(book, onlyForeign = false) {
  const cat = getBookLanguageCategory(book);
  if (onlyForeign && cat === 'nl') return '';
  const style =
    cat === 'en'
      ? 'background:#EFF6FF; color:#1D4ED8; border:1px solid #93C5FD;'
      : cat === 'other'
        ? 'background:#F0FDFA; color:#0F766E; border:1px solid #5EEAD4;'
        : 'background:#F3F4F6; color:#374151; border:1px solid #D1D5DB;';
  return `<span class="sticker-badge" style="${style}">${escapeHtml(getBookLanguageDisplay(book))}</span>`;
}

function renderGenreBadge(book) {
  const genre = getBookGenre(book);
  const icon = GENRE_ICONS[genre] || '📚';
  const displayGenre = isEn() ? GENRE_EN_MAP[genre] || genre : genre;
  return `<span class="genre-badge" title="${escapeHtml(displayGenre)}">${icon} ${escapeHtml(displayGenre)}</span>`;
}

// ============================================================================
// STICKER BADGE HELPER
// ============================================================================
function renderStickerBadge(book) {
  if (book.sticker_type === 'zwerfboek') {
    return `<span class="sticker-badge sticker-zwerfboek" title="Mag gehouden of doorgegeven worden">🟢 Zwerfboek · Gratis</span>`;
  }
  if (book.sticker_type === 'leenboek') {
    return `<span class="sticker-badge sticker-leenboek" title="Alleen voor buurtgenoten, na lezen terugbrengen">🔵 Leenboek · Buurt</span>`;
  }
  const priceStr = Number(book.price_eur || 0).toFixed(2).replace('.', ',');
  if (book.sticker_type === 'marktplaats') {
    return `<span class="sticker-badge sticker-marktplaats" title="Boekenbeurs: nieuwer of waardevoller boek">🟣 Boekenbeurs · € ${priceStr}</span>`;
  }
  return `<span class="sticker-badge sticker-koopboek" title="Klein bedrag onderling af te rekenen">🟡 Koopboek · € ${priceStr}</span>`;
}

// ============================================================================
// BUURT-ZICHTBAARHEID VOOR LEENBOEKEN
// Leenboeken zijn bedoeld voor buurtgenoten (zelfde 4-cijferige postcode of zelfde stad/regio)
// ============================================================================
function sanitizeImageUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (raw.startsWith('./') || raw.startsWith('assets/')) return raw;
  // Sta alleen veilige gecomprimeerde raster-foto's toe (geen SVG/HTML data-URI's)
  if (/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(raw) && raw.length <= 220000) {
    return raw;
  }
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.href.replace(/^http:\/\//i, 'https://');
    }
  } catch {}
  return '';
}

window.handleBookCoverPhotoUpload = function (event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  if (!file.type || !file.type.startsWith('image/')) {
    showToast('⚠️ Kies een geldige afbeelding (JPG, PNG of WebP).');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxW = 320;
        const maxH = 480;
        const scale = Math.min(1, maxW / img.width, maxH / img.height);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.72);
        const coverInput = document.getElementById('bookCoverInput');
        if (coverInput) coverInput.value = compressed;
        if (typeof window.updateCoverPreview === 'function') {
          window.updateCoverPreview(compressed, document.getElementById('bookTitleInput')?.value || '');
        }
        showToast('📷 Kaftfoto verkleind en toegevoegd!');
      } catch (err) {
        showToast('⚠️ Kon de foto niet verwerken: ' + (err?.message || 'onbekende fout'));
      }
    };
    img.onerror = () => showToast('⚠️ Kon de gekozen afbeelding niet laden.');
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
  event.target.value = '';
};

function isNeighborForLeenboek(book, currentUser, filterPostal) {
  if (book.sticker_type !== 'leenboek') return true;
  if (!filterPostal && currentUser && book.owner_id === currentUser.id) return true;

  // Als de gebruiker een specifieke 4-cijferige postcode zoekt, controleer de buurt (eerste 2 cijfers = zelfde regio/stad)
  const activePostal = String(filterPostal || (currentUser && currentUser.postal_code_4) || '').trim();
  if (!activePostal) return true; // Nog geen postcode ingesteld: toon met buurt-label

  const bookPostal = String(book.postal_code_4 || '').trim();
  const bookCity = String(book.city || '').trim().toLowerCase();

  // Zelfde 4-cijferige wijk OF zelfde 2-cijferige stadsregio OF zelfde woonplaats
  if (bookPostal && bookPostal === activePostal) return true;
  if (bookPostal && bookPostal.slice(0, 2) === activePostal.slice(0, 2)) return true;
  if (currentUser && currentUser.city && bookCity && bookCity === String(currentUser.city).trim().toLowerCase()) {
    return true;
  }
  return false;
}

// ============================================================================
// WHATSAPP (WA.ME) BERICHT GENERATOR (0% Juridisch Gedoe)
// ============================================================================
function buildRequestMessageText(book, handoverMode, customBidAmount) {
  const user = window.BuurtBiebDB.getCurrentUser();
  const locText = user ? formatLocationLabel(user.postal_code_4, user.city, '') : '';
  const senderName =
    user && !user.needsOnboarding
      ? locText
        ? `${user.bieb_name} (${locText})`
        : user.bieb_name
      : 'een buurtgenoot op BuurtBieb.nl';

  let stickerLabel = '🟢 Zwerfboek (Gratis)';
  if (book.sticker_type === 'leenboek') stickerLabel = '🔵 Leenboek (terugbrengen na lezen)';
  if (book.sticker_type === 'koopboek') {
    stickerLabel = `🟡 Koopboek (€ ${Number(book.price_eur || 0).toFixed(2).replace('.', ',')} rechtstreeks onderling)`;
  }
  if (book.sticker_type === 'marktplaats') {
    const cond = CONDITION_LABELS[book.book_condition] || 'Goed';
    stickerLabel = `🟣 Boekenbeurs (Vraagprijs € ${Number(book.price_eur || 0).toFixed(2).replace('.', ',')} · Staat: ${cond})`;
  }

  let handoverLabel = 'Ophalen aan de deur op afspraak';
  if (handoverMode === 'ruilen_1op1') {
    handoverLabel =
      book.sticker_type === 'leenboek'
        ? '1-op-1 lenen op afspraak met een eigen onderpand-boek'
        : '1-op-1 boek ruilen op afspraak (ik neem een eigen ruilboek mee)';
  } else if (handoverMode === 'buitenkastje_selfservice') {
    handoverLabel = 'Meenemen uit de MiniBieb / in overleg in de MiniBieb klaarleggen op afspraak';
  } else if (handoverMode === 'klaarleggen_op_afspraak') {
    handoverLabel = 'In overleg klaarleggen op afspraak (als er niemand thuis is)';
  } else if (handoverMode === 'post_brievenbus') {
    handoverLabel = 'Verzenden per post / brievenbuspakje';
  }

  let bidLine = '';
  if (customBidAmount && Number(customBidAmount) > 0) {
    const bidStr = Number(customBidAmount).toFixed(2).replace('.', ',');
    bidLine = `\n• Mijn bod: Ik wil graag € ${bidStr} bieden voor dit boek (vraagprijs € ${Number(book.price_eur || 0).toFixed(2).replace('.', ',')})`;
  }

  let depositLine = '';
  if (book.deposit_type === 'bedrag' && book.deposit_amount_eur > 0) {
    depositLine = `\n• Afgesproken onderlinge borg: € ${book.deposit_amount_eur},- (via Tikkie of contant bij ophalen, retour bij inleveren)`;
  } else if (book.deposit_type === 'onderpand_boek') {
    depositLine = `\n• Afgesproken borg: Ik neem een onderpand-boek mee als tijdelijke ruilborg`;
  }

  return (
    `Hoi ${book.owner_bieb_name}! 📚\n\n` +
    `Via BuurtBieb.nl zag ik jouw boek staan en wil ik graag contact opnemen:\n` +
    `• Titel: "${book.title}" — ${book.author}\n` +
    `• Categorie: ${stickerLabel}` +
    `${bidLine}\n` +
    `• Overdracht: ${handoverLabel}` +
    `${depositLine}\n\n` +
    `Groetjes van ${senderName}! Schikt het om dit zo af te spreken?`
  );
}

function buildWhatsAppUrl(book, handoverMode, customBidAmount, messageOverride) {
  const message = messageOverride || buildRequestMessageText(book, handoverMode, customBidAmount);
  const contactInfo = window.BuurtBiebDB.getOwnerContactInfo(book);
  const phone = String(contactInfo.whatsapp_number || '').replace(/[^0-9]/g, '');
  if (phone.length < 8) return '';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function buildMailtoUrl(book, handoverMode, customBidAmount, messageOverride) {
  const message = messageOverride || buildRequestMessageText(book, handoverMode, customBidAmount);
  const contactInfo = window.BuurtBiebDB.getOwnerContactInfo(book);
  const subject = `BuurtBieb.nl aanvraag: "${book.title}" — ${book.author}`;
  return `mailto:${encodeURIComponent(contactInfo.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

// Toon eerst een voorbeeldbericht dat de gebruiker kan controleren, aanpassen of vervangen door eigen tekst.
// Geeft de uiteindelijke tekst terug, of null als de gebruiker annuleert (dan gebeurt er niets).
function confirmOutgoingMessage(draftText) {
  const edited = window.prompt(
    'Controleer je bericht. Je kunt de tekst aanpassen of zelf typen.\nKies OK om verder te gaan, of Annuleren om niets te versturen.',
    draftText
  );
  if (edited === null) return null;
  const clean = edited.trim();
  return clean ? clean : null;
}

function updateUnreadChatBadges() {
  const count = window.BuurtBiebDB.getUnreadChatCount();
  const navBadge = document.getElementById('navUnreadChatBadge');
  const mobBadge = document.getElementById('mobUnreadChatBadge');
  const hamburgerDot = document.getElementById('hamburgerUnreadDot');
  if (navBadge) {
    navBadge.textContent = count;
    navBadge.style.display = count > 0 ? 'inline-block' : 'none';
  }
  if (mobBadge) {
    mobBadge.textContent = count;
    mobBadge.style.display = count > 0 ? 'inline-block' : 'none';
  }
  if (hamburgerDot) {
    hamburgerDot.style.display = count > 0 ? 'block' : 'none';
  }
}

// ============================================================================
// ZIJMENU (3 HORIZONTALE STREEPJES LINKSBOVEN)
// ============================================================================
function updateSideMenuActiveState() {
  const tab = AppState.activeTab || 'plank';
  const sub = AppState.discoverSubView || 'kast';
  const activeKey = tab === 'plank' ? `plank:${sub}` : tab;
  document.querySelectorAll('.side-menu-item[data-menu-key]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-menu-key') === activeKey);
  });
}

window.openSideMenu = function () {
  const drawer = document.getElementById('appSideMenu');
  const backdrop = document.getElementById('appSideMenuBackdrop');
  const btn = document.getElementById('hamburgerMenuBtn');
  if (!drawer) return;
  updateSideMenuActiveState();
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  if (backdrop) {
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
  }
  if (btn) btn.setAttribute('aria-expanded', 'true');
  pushAppHistoryState('drawer:menu');
};

window.closeSideMenu = function () {
  const drawer = document.getElementById('appSideMenu');
  const backdrop = document.getElementById('appSideMenuBackdrop');
  const btn = document.getElementById('hamburgerMenuBtn');
  if (drawer) {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }
  if (backdrop) {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
  }
  if (btn) btn.setAttribute('aria-expanded', 'false');
};

window.toggleSideMenu = function () {
  const drawer = document.getElementById('appSideMenu');
  if (drawer && drawer.classList.contains('open')) {
    window.closeSideMenu();
  } else {
    window.openSideMenu();
  }
};

window.navigateFromMenu = function (tabName, subView) {
  window.closeSideMenu();
  if (tabName === 'plank') {
    if (AppState.activeTab !== 'plank') {
      window.switchTab('plank');
    }
    if (subView) {
      window.switchDiscoverSubView(subView);
    }
  } else {
    window.switchTab(tabName);
  }
  updateSideMenuActiveState();
};

const WELCOME_GUIDE_STORAGE_KEY = 'buurtbieb_welcome_seen_v1';

window.openWelcomeGuideModal = function () {
  const modal = document.getElementById('welcomeGuideModal');
  if (!modal) return;
  modal.classList.add('open');
  applyDynamicTranslationIfNeeded(modal);
  pushAppHistoryState('modal:welcome');
};

window.closeWelcomeGuideModal = function () {
  const modal = document.getElementById('welcomeGuideModal');
  if (modal) {
    modal.classList.remove('open');
  }
  try {
    localStorage.setItem(WELCOME_GUIDE_STORAGE_KEY, '1');
  } catch {}
};

function maybeShowWelcomeGuideOnStartup() {
  let hasSeen = false;
  try {
    hasSeen = localStorage.getItem(WELCOME_GUIDE_STORAGE_KEY) === '1';
  } catch {}
  if (hasSeen) return;
  const anyModalOpen = document.querySelector('.modal-backdrop.open');
  if (anyModalOpen) return;
  window.openWelcomeGuideModal();
}

// ============================================================================
// AFFILIATE LINKS (LIBRIS.NL, BOL.COM & AMAZON.NL HOOFDPAGINA'S)
// ============================================================================
function buildAffiliateLinks() {
  return {
    librisUrl: 'https://www.libris.nl/',
    bolUrl: 'https://www.bol.com/nl/nl/',
    amazonUrl: 'https://www.amazon.nl/'
  };
}

// ============================================================================
// RENDER FUNCTIES & GEHEIME TESTMODUS-TOGGLE (5x tikken op versienummer onderin menu)
// ============================================================================
let _secretVersionTapCount = 0;
let _secretVersionTapTimer = null;

window.handleSecretVersionTap = function (event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
  _secretVersionTapCount += 1;
  clearTimeout(_secretVersionTapTimer);

  if (_secretVersionTapCount >= 5) {
    _secretVersionTapCount = 0;
    window.closeSideMenu();
    window.handleToggleDataMode();
    return;
  }

  _secretVersionTapTimer = setTimeout(() => {
    _secretVersionTapCount = 0;
  }, 2200);
};

// Compat-alias voor bestaande testscripts
window.handleBrandLogoClick = window.handleSecretVersionTap;

if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('keydown', (event) => {
    const key = String(event.key || '').toLowerCase();
    const isSecretShortcut =
      (event.ctrlKey && event.shiftKey && key === 'l') ||
      (event.altKey && event.shiftKey && key === 't');
    if (isSecretShortcut) {
      event.preventDefault();
      window.handleToggleDataMode();
    }
  });
}

window.handleToggleDataMode = function () {
  const currentlyLive = window.BuurtBiebDB.isLiveMode();
  const nextMode = currentlyLive ? 'sandbox' : 'live';
  AppState.activeConversationId = null;
  AppState.chatDraft = null;
  AppState.pendingReservation = null;
  window.BuurtBiebDB.setDataMode(nextMode);
  refreshAllViews();
  showToast(
    nextMode === 'sandbox'
      ? '🧪 Geheime lokale testmodus geactiveerd (gescheiden van Supabase Live).'
      : '🌐 Teruggeschakeld naar de echte Live versie (Supabase).'
  );
};

window.handleResetDemoData = async function () {
  if (window.BuurtBiebDB.isLiveMode()) return;
  await window.BuurtBiebDB.resetDemoData();
  AppState.activeConversationId = null;
  AppState.chatDraft = null;
  refreshAllViews();
  showToast('🔄 Testboeken en testgesprekken zijn opnieuw ingeladen.');
};

window.handleQuickDemoLogin = function (email) {
  if (window.BuurtBiebDB.isLiveMode()) return;
  window.BuurtBiebDB.startPasswordlessSession({ email, provider: 'magic_link' });
  AppState.activeConversationId = null;
  refreshAllViews();
  const user = window.BuurtBiebDB.getCurrentUser();
  showToast(`🧪 Testaccount actief: ${user ? user.bieb_name : email}`);
};

window.handleResetToNewDemoUser = async function () {
  if (window.BuurtBiebDB.isLiveMode()) return;
  await window.BuurtBiebDB.registerWithUsernamePassword({
    username: `Testlezer${String(Date.now()).slice(-4)}`,
    password: 'test1234'
  });
  refreshAllViews();
  const user = window.BuurtBiebDB.getCurrentUser();
  showToast(`🧪 Nieuw testaccount aangemaakt en ingelogd: ${user ? user.bieb_name : 'Testlezer'}`);
};

function renderSecretTestModeBanner() {
  const bannerEl = document.getElementById('secretTestModeBanner');
  if (!bannerEl) return;

  if (window.BuurtBiebDB.isLiveMode()) {
    bannerEl.style.display = 'none';
    bannerEl.innerHTML = '';
    return;
  }

  const currentUser = window.BuurtBiebDB.getCurrentUser();
  const activeName = currentUser
    ? `${escapeHtml(currentUser.bieb_name || currentUser.email || 'Testgebruiker')}`
    : 'Niet ingelogd';

  bannerEl.style.display = '';
  bannerEl.style.background = '#FEF3C7';
  bannerEl.style.borderColor = '#F59E0B';
  bannerEl.style.color = '#78350F';
  bannerEl.innerHTML = `
    <div class="credit-guard-text">
      <span class="credit-guard-icon">🧪</span>
      <div>
        <strong>Lokale Testmodus (Zandbak) actief</strong> — Bevat 12 voorbeeldboeken &amp; demo-accounts (volledig gescheiden van Live Supabase). Actief: <strong>${activeName}</strong>
      </div>
    </div>
    <div style="display:flex; gap:0.4rem; flex-wrap:wrap; align-items:center;">
      <button type="button" class="btn btn-outline btn-sm" onclick="handleQuickDemoLogin('anneke@buurtbieb.nl')">
        👤 Anneke
      </button>
      <button type="button" class="btn btn-outline btn-sm" onclick="handleQuickDemoLogin('bram@buurtbieb.nl')">
        👤 Bram
      </button>
      <button type="button" class="btn btn-outline btn-sm" onclick="handleResetToNewDemoUser()">
        ✨ Nieuw testaccount
      </button>
      <button type="button" class="btn btn-outline btn-sm" onclick="handleResetDemoData()">
        🔄 Reset testdata
      </button>
      <button type="button" class="btn btn-primary btn-sm" onclick="handleToggleDataMode()">
        🌐 Terug naar echte Live versie
      </button>
    </div>
  `;
  applyDynamicTranslationIfNeeded(bannerEl);
}

function renderAuthModalModeBadge() {
  // Alleen tonen wanneer geheime testmodus actief is; in Live blijft dit leeg
}

function isRunningAsInstalledPwa() {
  return Boolean(
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true
  );
}

function getDataModeHeaderButtonsHtml() {
  const buttons = [];
  const en = isEn();
  if (!window.BuurtBiebDB.isLiveMode()) {
    buttons.push(`
      <button type="button" class="btn btn-sm header-test-btn" style="background:#FEF3C7; color:#92400E; border:1px solid #F59E0B;" onclick="handleToggleDataMode()" title="${en ? 'Switch back to Live version' : 'Schakel terug naar de echte Live omgeving'}">
        🧪 Test
      </button>
    `);
  }
  return buttons.join('');
}

function renderHeaderStatus() {
  renderAuthModalModeBadge();
  const user = window.BuurtBiebDB.getCurrentUser();
  const isLoggedIn = Boolean(user && !user.needsOnboarding);
  const statusContainer = document.getElementById('userStatusContainer');
  const sideSignOutBtn = document.getElementById('sideMenuSignOutBtn');
  if (sideSignOutBtn) {
    sideSignOutBtn.style.display = user ? '' : 'none';
  }

  // Toon de persoonlijke tabbladen (Chat, Aanbieden, Mijn Bieb) alleen als je bent ingelogd
  const protectedTabs = ['chat', 'toevoegen', 'profiel'];
  document.querySelectorAll('[data-tab-target]').forEach((btn) => {
    const target = btn.getAttribute('data-tab-target');
    if (protectedTabs.includes(target)) {
      btn.style.display = isLoggedIn ? '' : 'none';
    }
  });
  const mobNav = document.querySelector('.mobile-bottom-nav');
  if (mobNav) {
    mobNav.style.gridTemplateColumns = isLoggedIn ? 'repeat(5, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))';
  }

  if (!statusContainer) return;

  const modeHtml = getDataModeHeaderButtonsHtml();

  if (!user) {
    statusContainer.innerHTML = `
      ${modeHtml}
      <button class="btn btn-primary btn-sm" onclick="openAuthModal()">
        <span>🔑</span> ${tr('Inloggen', 'Log in')}
      </button>
    `;
    applyDynamicTranslationIfNeeded(statusContainer);
    return;
  }

  if (user.needsOnboarding) {
    statusContainer.innerHTML = `
      ${modeHtml}
      <button class="btn btn-primary btn-sm" onclick="openOnboardingModal()">
        <span>📚</span> Profiel voltooien
      </button>
      <button class="btn btn-outline btn-sm header-signout-btn" onclick="handleSignOut()" title="Direct uitloggen">
        🚪 Uitloggen
      </button>
    `;
    applyDynamicTranslationIfNeeded(statusContainer);
    return;
  }

  // Pas kastjesthema van ingelogde gebruiker toe op de pagina
  AppState.selectedCabinetTheme = 'klassiek_hout';
  document.documentElement.setAttribute('data-cabinet-theme', 'klassiek_hout');

  statusContainer.innerHTML = `
    ${modeHtml}
    <button class="btn btn-outline btn-sm header-profile-btn" onclick="switchTab('profiel')" title="${escapeHtml(user.bieb_name)}">
      <span>${user.has_physical_box ? '🏡' : '📚'}</span>
      <span class="header-profile-label">${escapeHtml(user.bieb_name)}</span>
    </button>
    <button class="btn btn-outline btn-sm header-signout-btn" onclick="handleSignOut()" title="Direct uitloggen">
      🚪 Uitloggen
    </button>
  `;
  applyDynamicTranslationIfNeeded(statusContainer);
}

function renderPwaInstallBanner() {
  const bannerEl = document.getElementById('pwaInstallBanner');
  if (!bannerEl) return;

  let isDismissed = false;
  try {
    isDismissed = sessionStorage.getItem('buurtbieb_pwa_dismissed') === '1';
  } catch {}

  if (isRunningAsInstalledPwa() || isDismissed || AppState.activeTab === 'chat') {
    bannerEl.style.display = 'none';
    return;
  }

  bannerEl.style.display = '';
  bannerEl.className = 'credit-guard-banner';
  bannerEl.innerHTML = `
    <div class="credit-guard-text">
      <span class="credit-guard-icon">📲</span>
      <div>
        <strong>Zet BuurtBieb.nl als App op je startscherm of bureaublad</strong> voor direct scannen &amp; chatten!
      </div>
    </div>
    <div style="display:flex; gap:0.45rem; flex-wrap:wrap;">
      <button type="button" class="btn btn-primary btn-sm" onclick="handleInstallPwaClick()">
        📲 App Installeren
      </button>
      <button type="button" class="btn btn-outline btn-sm" onclick="dismissPwaInstallBanner()">
        ✕ Later
      </button>
    </div>
  `;
  applyDynamicTranslationIfNeeded(bannerEl);
}

window.dismissPwaInstallBanner = function () {
  try {
    sessionStorage.setItem('buurtbieb_pwa_dismissed', '1');
  } catch {}
  renderPwaInstallBanner();
};

window.handleInstallPwaClick = async function () {
  if (isRunningAsInstalledPwa()) {
    showToast('BuurtBieb.nl draait al als geïnstalleerde app!');
    return;
  }

  if (window.deferredPwaPrompt) {
    try {
      window.deferredPwaPrompt.prompt();
      const choiceResult = await window.deferredPwaPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        window.deferredPwaPrompt = null;
        showToast('🎉 BuurtBieb.nl wordt nu geïnstalleerd als app!');
      }
      renderPwaInstallBanner();
      renderHeaderStatus();
      return;
    } catch {}
  }

  const ua = navigator.userAgent || '';
  const isIos = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  if (isIos) {
    showAppAlert(
      'App installeren op iPhone / iPad (Safari):\n\n' +
        '1. Tik onderaan op de Deel-knop [↑]\n' +
        '2. Kies "Zet op beginscherm"\n' +
        '3. Tik rechtsboven op "Voeg toe"'
    );
    return;
  }

  showAppAlert(
    'App installeren in Chrome / Edge:\n\n' +
      '• Zorg dat je https://buurtbieb-nl.netlify.app opent in een normaal Chrome- of Edge-venster (ingebouwde preview-tabbladen van een editor staan PWA-installatie niet toe).\n' +
      '• Klik rechts in de adresbalk op het installatie-icoontje (🖥️ / ➕) of open het browsermenu (⋮ / ⋯) → "Apps" → "BuurtBieb.nl installeren".\n' +
      '• Op Android Chrome: tik in het menu (⋮) op "App installeren" of "Toevoegen aan startscherm".'
  );
};

window.deferredPwaPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPwaPrompt = e;
  renderPwaInstallBanner();
  renderHeaderStatus();
});
window.addEventListener('appinstalled', () => {
  window.deferredPwaPrompt = null;
  renderPwaInstallBanner();
  renderHeaderStatus();
  showToast('🎉 BuurtBieb.nl is geïnstalleerd als app!');
});

function renderOnboardingBanner() {
  const bannerEl =
    document.getElementById('onboardingBanner') ||
    document.getElementById('creditGuardBanner');
  if (!bannerEl) return;

  const user = window.BuurtBiebDB.getCurrentUser();

  if (!user || !user.needsOnboarding || AppState.activeTab === 'chat') {
    bannerEl.style.display = 'none';
    return;
  }

  bannerEl.style.display = '';
  bannerEl.className = 'credit-guard-banner';
  bannerEl.innerHTML = `
    <div class="credit-guard-text">
      <span class="credit-guard-icon">📚</span>
      <div>
        <strong>Welkom ${escapeHtml(user.email)}!</strong> Stel nog even je boekenplank-naam, postcode en thema in.
      </div>
    </div>
    <button class="btn btn-primary btn-sm" onclick="openOnboardingModal()">Profiel afronden</button>
  `;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getReferenceCoordsForDistance(user, postalFilter) {
  const pf = String(postalFilter || '').trim();
  if (pf) {
    const postalDigits = pf.replace(/\D/g, '').slice(0, 4);
    return resolveDutchLocationCoords(postalDigits, postalDigits ? '' : pf, pf);
  }
  if (user && typeof user.lat === 'number' && Number.isFinite(user.lat) && typeof user.lng === 'number' && Number.isFinite(user.lng)) {
    return { lat: user.lat, lng: user.lng };
  }
  if (user && (user.postal_code_4 || user.city)) {
    return resolveDutchLocationCoords(user.postal_code_4, user.city, user.id || 'user');
  }
  return null;
}

function getBookApproxDistanceKm(book, refCoords) {
  if (!refCoords || !book) return null;
  if (!book.postal_code_4 && !book.city) return null;
  const bookCoords = resolveDutchLocationCoords(book.postal_code_4, book.city, book.owner_id || book.id);
  if (!bookCoords) return null;
  return haversineKm(refCoords.lat, refCoords.lng, bookCoords.lat, bookCoords.lng);
}

// ============================================================================
// HOUTEN BOEKENKAST & PLANKEN RENDERER
// ============================================================================
function renderBookshelfView(options = {}) {
  const user = window.BuurtBiebDB.getCurrentUser();
  const allBooks = window.BuurtBiebDB.getBooks();

  const q = AppState.searchQuery.trim().toLowerCase();
  const postalFilter = AppState.filterPostal.trim();
  const genreFilter = AppState.filterGenre || 'alle';
  const stickerFilter = AppState.filterSticker;
  const distEl = document.getElementById('shelfDistanceSelect');
  const distanceKm = distEl ? distEl.value : AppState.filterDistanceKm || 'alle';
  const maxKm = distanceKm !== 'alle' ? Number(distanceKm) : null;
  const refCoords = getReferenceCoordsForDistance(user, postalFilter);

  let hiddenLeenboekenOutsideArea = 0;

  const filteredBooks = allBooks.filter((book) => {
    // 0. Verberg eigen boeken in het algemene overzicht (die staan overzichtelijk onder Mijn Bieb)
    if (user && !user.needsOnboarding && book.owner_id === user.id) {
      return false;
    }

    // 0b. Verberg alleen boeken die definitief zijn overgedragen of meegenomen.
    // Gereserveerde en tijdelijk uitgeleende boeken blijven zichtbaar op de plank met een duidelijke status-badge.
    if (book.status === 'overgedragen' || book.status === 'meegenomen') {
      return false;
    }

    // 1. Sticker filter
    if (stickerFilter !== 'alle' && book.sticker_type !== stickerFilter) {
      return false;
    }

    // 1b. Genre filter
    if (genreFilter !== 'alle' && getBookGenre(book) !== genreFilter) {
      return false;
    }

    // 1c. Taalfilter (Alle Talen / Nederlands / Engels / Internationaal overig)
    const langFilter = AppState.filterBookLanguage || 'alle';
    if (langFilter !== 'alle' && getBookLanguageCategory(book) !== langFilter) {
      return false;
    }

    // 2. Zoekopdracht op titel, auteur, ISBN, genre, plaats of kastjesnaam
    if (q) {
      const hay = `${book.title} ${book.author} ${book.isbn} ${getBookGenre(book)} ${book.city} ${book.postal_code_4} ${book.owner_bieb_name}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    // 3. Postcode / Afstandsfilter
    if (maxKm && refCoords) {
      const km = getBookApproxDistanceKm(book, refCoords);
      if (km === null || km > maxKm) {
        return false;
      }
    } else if (postalFilter) {
      const bPostal = String(book.postal_code_4 || '');
      const bCity = String(book.city || '').toLowerCase();
      if (!bPostal.startsWith(postalFilter) && !bCity.includes(postalFilter.toLowerCase())) {
        return false;
      }
    }

    // 4. EIS 2: Leenboek is alleen zichtbaar voor buurtgenoten (ophalen)
    if (book.sticker_type === 'leenboek') {
      const neighborMatch = isNeighborForLeenboek(book, user, postalFilter);
      if (!neighborMatch) {
        hiddenLeenboekenOutsideArea++;
        return false;
      }
    }

    return true;
  });

  // 5. SORTERING (Standaard: Dichtst bij jouw 4-cijferige postcode eerst)
  const sortSelectEl = document.getElementById('shelfSortSelect');
  const sortMode = sortSelectEl ? sortSelectEl.value : AppState.sortMode;
  const refPostalNum = parseInt(
    postalFilter.replace(/\D/g, '') || (user && user.postal_code_4) || '3512',
    10
  );

  filteredBooks.sort((a, b) => {
    if (sortMode === 'dichtbij') {
      const distA = Math.abs(parseInt(a.postal_code_4 || '9999', 10) - refPostalNum);
      const distB = Math.abs(parseInt(b.postal_code_4 || '9999', 10) - refPostalNum);
      if (distA !== distB) return distA - distB;
    } else if (sortMode === 'titel') {
      return String(a.title || '').localeCompare(String(b.title || ''), 'nl');
    } else if (sortMode === 'prijs_laag') {
      return Number(a.price_eur || 0) - Number(b.price_eur || 0);
    }
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  // 6. KAST-PAGINERING (Zodat er nooit honderden boeken tegelijk onder elkaar staan)
  const totalBooks = filteredBooks.length;
  const pageSize = AppState.shelfPageSize || 9;
  const totalPages = Math.max(1, Math.ceil(totalBooks / pageSize));
  if (AppState.shelfPage > totalPages) AppState.shelfPage = totalPages;
  if (AppState.shelfPage < 1) AppState.shelfPage = 1;

  const startIndex = (AppState.shelfPage - 1) * pageSize;
  const booksForCurrentCabinet = filteredBooks.slice(startIndex, startIndex + pageSize);

  // Verdeel boeken op deze pagina over maximaal 3 houten boekenplanken
  const shelves = [];
  const booksPerPlank = pageSize === 12 ? 4 : 3;
  for (let i = 0; i < booksForCurrentCabinet.length; i += booksPerPlank) {
    shelves.push(booksForCurrentCabinet.slice(i, i + booksPerPlank));
  }

  const shelfLabels = [
    `Bovenste Plank · Kast ${AppState.shelfPage} van ${totalPages}`,
    `Middelste Plank · Kast ${AppState.shelfPage} van ${totalPages}`,
    `Onderste Plank · Kast ${AppState.shelfPage} van ${totalPages}`
  ];

  const cabinetContainer = document.getElementById('woodenCabinetContent');
  if (!cabinetContainer) return;

  let shelvesHtml = '';
  if (shelves.length === 0) {
    shelvesHtml = allBooks.length === 0
      ? `
      <div class="bookshelf-tier">
        <div style="text-align:center; padding: 2.2rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📚</div>
          <h3 class="serif-heading" style="margin-bottom: 0.35rem;">Welkom bij BuurtBieb.nl — De boekenplank wacht op het eerste boek!</h3>
          <p style="font-size: 0.92rem; max-width: 540px; margin: 0 auto 0.95rem;">
            Er staan op dit moment nog geen boeken op deze buurtplank. Deel eenvoudig een boek vanaf je eigen boekenplank thuis of vanuit je MiniBieb, of plaats hieronder een "Boek Gezocht"-oproepje.
          </p>
          <div style="display:flex; justify-content:center; gap:0.55rem; flex-wrap:wrap;">
            <button type="button" class="btn btn-primary btn-sm" onclick="switchTab('toevoegen')">
              📚 Eerste boek aanbieden
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="scrollToWantedBooksSection(true)">
              🔎 "Boek Gezocht"-oproepje plaatsen
            </button>
          </div>
        </div>
        <div class="wooden-plank">
          <div class="wooden-plank-surface"></div>
          <div class="wooden-plank-edge">
            <span class="plank-brass-label">BuurtBieb Boekenplank</span>
          </div>
        </div>
      </div>
    `
      : `
      <div class="bookshelf-tier">
        <div style="text-align:center; padding: 2.2rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📭</div>
          <h3 class="serif-heading" style="margin-bottom: 0.35rem;">Geen boeken op deze plank gevonden</h3>
          <p style="font-size: 0.92rem; max-width: 520px; margin: 0 auto 0.85rem;">
            ${
              hiddenLeenboekenOutsideArea > 0
                ? `Er zijn wel ${hiddenLeenboekenOutsideArea} 🔵 Leenboek(en) gevonden, maar die zijn alleen zichtbaar voor directe buurtgenoten.`
                : 'Dit boek staat momenteel niet op een boekenplank bij jou in de buurt.'
            }
          </p>
          <button type="button" class="btn btn-primary btn-sm" onclick="scrollToWantedBooksSection(true)">
            📌 Plaats een "🔎 Boek Gezocht"-oproepje bij je buren
          </button>
        </div>
        <div class="wooden-plank">
          <div class="wooden-plank-surface"></div>
          <div class="wooden-plank-edge">
            <span class="plank-brass-label">Lege Boekenplank</span>
          </div>
        </div>
      </div>
    `;
  } else {
    shelvesHtml = shelves
      .map((booksOnShelf, idx) => {
        const cardsHtml = booksOnShelf
          .map((book) => {
            const contactInfo = window.BuurtBiebDB.getOwnerContactInfo(book);
            const depositBadge =
              book.deposit_type === 'bedrag'
                ? `<span class="delivery-chip deposit-chip">🔐 Borg €${book.deposit_amount_eur} (Tikkie/contant)</span>`
                : book.deposit_type === 'onderpand_boek'
                  ? `<span class="delivery-chip deposit-chip">🔄 Borg: Onderpand-boek</span>`
                  : '';
            const statusShelfBadge =
              book.status === 'uitgeleend'
                ? `<span class="sticker-badge" style="background:#DBEAFE; color:#1E40AF; border:1px solid #93C5FD;">📖 Uitgeleend</span>`
                : book.status === 'gereserveerd'
                  ? `<span class="sticker-badge" style="background:#FEF3C7; color:#92400E; border:1px solid #F59E0B;">⏳ Gereserveerd</span>`
                  : '';

            const safeCoverUrl = sanitizeImageUrl(book.cover_url);
            return `
              <article class="book-on-shelf-card" tabindex="0" role="button" data-action="open-book" data-book-id="${escapeHtml(book.id)}">
                <div>
                  <div class="book-card-header">
                    <div style="display:flex; flex-wrap:wrap; gap:0.25rem; align-items:center;">
                      ${renderStickerBadge(book)}
                      ${statusShelfBadge}
                    </div>
                  </div>
                  <div class="book-top-row" style="margin-top:0.55rem;">
                    <div class="book-cover-3d">
                      ${
                        safeCoverUrl
                          ? `<img src="${escapeHtml(safeCoverUrl)}" alt="${escapeHtml(book.title)}" data-book-id="${escapeHtml(book.id)}" data-book-author="${escapeHtml(book.author || '')}" data-fallback-title="${escapeHtml(String(book.title || '').slice(0, 22))}" onload="handleBookCoverLoad(this)" onerror="handleBookCoverError(this)" />`
                          : `<span>📚<br>${escapeHtml(String(book.title || '').slice(0, 24))}</span>`
                      }
                    </div>
                    <div class="book-meta">
                      <h3 class="book-title" title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</h3>
                      <div class="book-author" title="${escapeHtml(book.author)}">${escapeHtml(book.author)}</div>
                      <div>${renderGenreBadge(book)} ${renderBookLanguageBadge(book, true)}</div>
                      <div class="book-location-box">
                        <span class="book-location-city">📍 ${escapeHtml(formatLocationLabel(book.postal_code_4, book.city))}</span>
                        <span class="book-location-bieb" title="${escapeHtml(book.owner_bieb_name)}">${book.self_service_box ? '🏡' : '📚'} ${escapeHtml(book.owner_bieb_name)}</span>
                        ${renderContactMethodsBadges(contactInfo.methods)}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="book-delivery-tags">
                  ${
                    book.self_service_box
                      ? `<span class="delivery-chip">🏡 Vrij pakken uit MiniBieb</span>`
                      : `
                        ${book.pickup_possible !== false ? `<span class="delivery-chip">🚪 Ophalen op afspraak</span>` : ''}
                        ${book.shipping_possible ? `<span class="delivery-chip">✉️ Brievenbuspakje</span>` : ''}
                      `
                  }
                  ${depositBadge}
                </div>
              </article>
            `;
          })
          .join('');

        return `
          <div class="bookshelf-tier">
            <div class="shelf-books-row ${booksPerPlank === 4 ? 'cols-4' : 'cols-3'}">
              ${cardsHtml}
            </div>
            <div class="wooden-plank">
              <div class="wooden-plank-surface"></div>
              <div class="wooden-plank-edge">
                <span class="plank-brass-label">${shelfLabels[idx] || `Plank ${idx + 1}`}</span>
                <span style="font-size: 0.72rem; color: rgba(250,246,240,0.8); font-weight:600;">${booksOnShelf.length} ${booksOnShelf.length === 1 ? 'boek' : 'boeken'}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // Paginabalk ("Blader naar volgende kast")
  let paginationHtml = '';
  if (totalBooks > 0) {
    const endNum = Math.min(startIndex + pageSize, totalBooks);
    let pageButtons = '';
    for (let p = 1; p <= totalPages; p++) {
      pageButtons += `
        <button type="button" class="page-btn ${p === AppState.shelfPage ? 'active' : ''}" onclick="goToShelfPage(${p})">
          Kast ${p}
        </button>
      `;
    }

    paginationHtml = `
      <div class="cabinet-pagination-bar">
        <div class="pagination-info">
          <span>📚 Toont boek <strong>${startIndex + 1}–${endNum}</strong> van <strong>${totalBooks}</strong> gevonden boeken</span>
          <span>·</span>
          <span>Maximale hoogte: <strong>max. 3 planken per kast</strong></span>
        </div>
        <div class="pagination-controls">
          <button type="button" class="page-btn" ${AppState.shelfPage <= 1 ? 'disabled' : ''} onclick="goToShelfPage(${AppState.shelfPage - 1})">
            ← Vorige kast
          </button>
          ${pageButtons}
          <button type="button" class="page-btn" ${AppState.shelfPage >= totalPages ? 'disabled' : ''} onclick="goToShelfPage(${AppState.shelfPage + 1})">
            Volgende kast →
          </button>
        </div>
      </div>
    `;
  }

  // EIS 5: Affiliate-knoppen naar de hoofdpagina's van Libris.nl, Bol.com en Amazon.nl
  const { librisUrl, bolUrl, amazonUrl } = buildAffiliateLinks();
  const showProminentAffiliate = filteredBooks.length === 0 || Boolean(AppState.searchQuery.trim());

  const affiliateHtml = `
    <div class="affiliate-fallback-box" style="${showProminentAffiliate ? 'border-color: #234233; background: #FFFDF7;' : ''}">
      <div>
        <div style="display:flex; align-items:center; gap:0.45rem; font-weight:700; color:var(--accent-green); font-size:0.98rem;">
          <span>🔍</span>
          <span>${
            filteredBooks.length === 0
              ? `Gezocht boek "${escapeHtml(AppState.searchQuery || 'dit boek')}" niet in een buurtkastje gevonden?`
              : `Niet in jouw directe buurt gevonden of liever nieuw bestellen?`
          }</span>
        </div>
        <p style="font-size:0.84rem; color:var(--text-muted); margin-top:0.2rem;">
          Steun het onderhoud van BuurtBieb.nl door het boek te bekijken bij Libris.nl, Bol.com of Amazon.nl:
        </p>
      </div>
      <div class="affiliate-buttons">
        <a href="${librisUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-libris btn-sm">
          🏛️ Bekijk bij Libris.nl
        </a>
        <a href="${bolUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-bol btn-sm">
          📦 Bekijk bij Bol.com
        </a>
        <a href="${amazonUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-amazon btn-sm">
          🛒 Bekijk bij Amazon.nl
        </a>
      </div>
    </div>
  `;

  cabinetContainer.innerHTML = shelvesHtml + paginationHtml + affiliateHtml;
  applyDynamicTranslationIfNeeded(cabinetContainer);
  if (!options.shelfOnly) {
    renderPhysicalMiniBiebsSection();
    renderInternationalBooksSection();
    renderWantedBooksSection();
  }
}

const DUTCH_CITY_COORDS = {
  utrecht: [52.0907, 5.1214],
  amsterdam: [52.3676, 4.9041],
  groningen: [53.2194, 6.5665],
  haarlem: [52.3874, 4.6462],
  eys: [50.8271, 5.9369],
  gulpen: [50.8165, 5.8919],
  maastricht: [50.8514, 5.691],
  heerlen: [50.8882, 5.9795],
  valkenburg: [50.8654, 5.8323],
  rotterdam: [51.9244, 4.4777],
  'den haag': [52.0705, 4.3007],
  "'s-gravenhage": [52.0705, 4.3007],
  eindhoven: [51.4416, 5.4697],
  nijmegen: [51.8126, 5.8372],
  arnhem: [51.9851, 5.8987],
  enschede: [52.2215, 6.8937],
  zwolle: [52.5168, 6.083],
  leeuwarden: [53.2012, 5.7999],
  breda: [51.5719, 4.7683],
  tilburg: [51.5606, 5.0919],
  leiden: [52.1601, 4.497],
  delft: [52.0116, 4.3571],
  amersfoort: [52.1561, 5.3878],
  alkmaar: [52.6324, 4.7534],
  almere: [52.3508, 5.2647],
  apeldoorn: [52.2112, 5.9699],
  assen: [52.9925, 6.5649],
  dordrecht: [51.8133, 4.6901],
  ede: [52.0402, 5.6649],
  emmen: [52.7858, 6.8976],
  gouda: [52.0115, 4.7105],
  helmond: [51.4793, 5.657],
  hilversum: [52.2292, 5.1669],
  hoorn: [52.6424, 5.0597],
  middelburg: [51.4988, 3.611],
  roermond: [51.1942, 5.9875],
  sittard: [50.9983, 5.869],
  venlo: [51.3704, 6.1724],
  zaandam: [52.4389, 4.8292],
  zoetermeer: [52.0607, 4.494],
  deventer: [52.255, 6.1639],
  hengelo: [52.2659, 6.7931]
};

function resolveDutchLocationCoords(postal4, city, seedKey = '') {
  const cleanCity = String(city || '').trim().toLowerCase();
  let base = DUTCH_CITY_COORDS[cleanCity] || null;
  if (!base) {
    const num = parseInt(String(postal4 || '').replace(/\D/g, ''), 10);
    const prefix = Math.floor(num / 100);
    if (prefix >= 10 && prefix <= 11) base = [52.3676, 4.9041];
    else if (prefix === 12) base = [52.2292, 5.1669];
    else if (prefix === 13) base = [52.3508, 5.2647];
    else if (prefix >= 14 && prefix <= 15) base = [52.47, 4.86];
    else if (prefix >= 16 && prefix <= 18) base = [52.64, 4.88];
    else if (prefix >= 19 && prefix <= 21) base = [52.3874, 4.6462];
    else if (prefix >= 22 && prefix <= 27) base = [52.08, 4.38];
    else if (prefix >= 28 && prefix <= 33) base = [51.92, 4.6];
    else if (prefix >= 34 && prefix <= 39) base = [52.1, 5.22];
    else if (prefix >= 40 && prefix <= 42) base = [51.87, 5.2];
    else if (prefix >= 43 && prefix <= 45) base = [51.4988, 3.68];
    else if (prefix >= 46 && prefix <= 49) base = [51.57, 4.68];
    else if (prefix >= 50 && prefix <= 56) base = [51.52, 5.28];
    else if (prefix >= 57 && prefix <= 61) base = [51.25, 5.95];
    else if (prefix >= 62 && prefix <= 64) base = [50.85, 5.82];
    else if (prefix >= 65 && prefix <= 69) base = [51.9, 5.88];
    else if (prefix >= 70 && prefix <= 76) base = [52.21, 6.42];
    else if (prefix >= 77 && prefix <= 82) base = [52.58, 6.22];
    else if (prefix >= 83 && prefix <= 92) base = [53.14, 5.82];
    else if (prefix >= 93 && prefix <= 99) base = [53.18, 6.56];
    else base = [52.1326, 5.2913];
  }

  let hash = 0;
  const s = String(seedKey || '');
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) % 997;
  }
  const latOffset = ((hash % 17) - 8) * 0.0012;
  const lngOffset = (((Math.floor(hash / 17) % 17) - 8)) * 0.0018;
  return {
    lat: Number((base[0] + latOffset).toFixed(5)),
    lng: Number((base[1] + lngOffset).toFixed(5))
  };
}

function coordsToNlPercent(lat, lng) {
  const latMin = 50.7;
  const latMax = 53.55;
  const lngMin = 3.35;
  const lngMax = 7.25;
  const x = Math.min(92, Math.max(8, ((lng - lngMin) / (lngMax - lngMin)) * 100));
  const y = Math.min(92, Math.max(8, ((latMax - lat) / (latMax - latMin)) * 100));
  return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
}

function formatPhysicalBoxAddress(box) {
  const street = String((box && box.street_address) || '').trim();
  const pcFull = String((box && (box.postal_code_full || box.postal_code_4)) || '').trim();
  const city = String((box && box.city) || '').trim();
  const cityPart = [pcFull, city].filter(Boolean).join(' ');
  const combined = [street, cityPart].filter(Boolean).join(', ');
  return combined || 'Nederland';
}

async function geocodeDutchAddress({ street_address, postal_code_full, postal_code_4, city }) {
  const queryParts = [
    String(street_address || '').trim(),
    String(postal_code_full || postal_code_4 || '').trim(),
    String(city || '').trim()
  ].filter(Boolean);
  if (queryParts.length === 0 || typeof fetch !== 'function') return null;

  try {
    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(queryParts.join(' '))}&rows=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const doc = data?.response?.docs?.[0];
    const pointStr = String(doc?.centroide_ll || '');
    const m = pointStr.match(/POINT\(([0-9.-]+)\s+([0-9.-]+)\)/i);
    if (!m) return null;
    const lng = Number(m[1]);
    const lat = Number(m[2]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
      lat,
      lng,
      postal_code_full: doc?.postcode || postal_code_full || '',
      city: doc?.woonplaatsnaam || city || ''
    };
  } catch {
    return null;
  }
}

function getPhysicalMiniBiebs() {
  const profiles = window.BuurtBiebDB.getLocalProfiles();
  const activeBooks = window.BuurtBiebDB.getBooks().filter(
    (b) => b.status !== 'overgedragen' && b.status !== 'meegenomen'
  );
  const boxMap = new Map();

  profiles.forEach((p) => {
    if (!p || !p.has_physical_box) return;
    const hasExactCoords =
      typeof p.lat === 'number' &&
      Number.isFinite(p.lat) &&
      typeof p.lng === 'number' &&
      Number.isFinite(p.lng);
    const coords = hasExactCoords
      ? { lat: p.lat, lng: p.lng }
      : resolveDutchLocationCoords(p.postal_code_4, p.city, p.id);
    boxMap.set(p.id, {
      id: p.id,
      name: p.bieb_name || 'MiniBieb',
      street_address: p.street_address || '',
      postal_code_full: p.postal_code_full || '',
      postal_code_4: p.postal_code_4 || '',
      city: p.city || '',
      theme: p.theme || 'groen_tuinhuis',
      coords,
      hasExactAddress: Boolean(p.street_address || hasExactCoords),
      books: []
    });
  });

  activeBooks.forEach((b) => {
    if (!b.self_service_box) return;
    const key = b.owner_id || `box-${b.owner_bieb_name || b.id}`;
    if (!boxMap.has(key)) {
      const coords = resolveDutchLocationCoords(b.postal_code_4, b.city, key);
      boxMap.set(key, {
        id: key,
        name: b.owner_bieb_name || 'MiniBieb',
        street_address: '',
        postal_code_full: '',
        postal_code_4: b.postal_code_4 || '',
        city: b.city || '',
        theme: 'groen_tuinhuis',
        coords,
        hasExactAddress: false,
        books: []
      });
    }
    boxMap.get(key).books.push(b);
  });

  const currentUser = window.BuurtBiebDB.getCurrentUser();
  const ownUserId = currentUser && !currentUser.needsOnboarding ? currentUser.id : null;

  return Array.from(boxMap.values())
    .filter((box) => !ownUserId || box.id !== ownUserId)
    .sort((a, b) => {
      if (b.books.length !== a.books.length) return b.books.length - a.books.length;
      return String(a.name).localeCompare(String(b.name), 'nl');
    });
}
window.getPhysicalMiniBiebs = getPhysicalMiniBiebs;

let _physicalBoxesLeafletInstance = null;
let _physicalBoxesLeafletHostEl = null;
let _physicalBoxesLeafletMarkerLayer = null;
let _physicalBoxLeafletMarkers = new Map();

function buildMiniBiebPopupHtml(box) {
  const countLabel =
    box.books.length === 1
      ? tr('1 boek in dit kastje', '1 book in this cabinet')
      : `${box.books.length} ${tr('boeken in dit kastje', 'books in this cabinet')}`;
  const booksListHtml =
    box.books.length > 0
      ? `<ul style="margin:6px 0 0; padding-left:16px; max-height:130px; overflow-y:auto; font-size:12px;">
          ${box.books
            .map(
              (b) =>
                `<li style="margin-bottom:3px;"><a href="#" data-action="open-book" data-book-id="${escapeHtml(b.id)}" style="color:#234233; font-weight:700; text-decoration:underline;">${escapeHtml(b.title)}</a> <span style="color:#56615B;">— ${escapeHtml(b.author)}</span></li>`
            )
            .join('')}
        </ul>`
      : `<div style="margin-top:6px; font-size:12px; color:#56615B;">${tr('Nog geen geregistreerde boeken in dit kastje.', 'No registered books in this cabinet yet.')}</div>`;

  return `
    <div style="min-width:205px; max-width:265px; font-family:inherit; line-height:1.4;">
      <div style="font-weight:800; font-size:13px; color:#234233;">🏡 ${escapeHtml(box.name)}</div>
      <div style="font-size:11.5px; color:#56615B; margin-top:2px;">📍 ${escapeHtml(formatPhysicalBoxAddress(box))}</div>
      <div style="display:inline-block; margin-top:5px; background:#E5F0EA; color:#234233; font-weight:700; font-size:11.5px; padding:2px 7px; border-radius:999px;">
        📚 ${escapeHtml(countLabel)}
      </div>
      ${booksListHtml}
    </div>
  `;
}
window.buildMiniBiebPopupHtml = buildMiniBiebPopupHtml;

window.selectPhysicalMiniBieb = function (boxId, options = {}) {
  AppState.selectedPhysicalBoxId = boxId;
  if (options.fromLeafletMarker && _physicalBoxesLeafletInstance) {
    document.querySelectorAll('.minibieb-box-card').forEach((card) => {
      card.classList.toggle('active', card.getAttribute('data-box-id') === boxId);
    });
    _physicalBoxLeafletMarkers.forEach((m, id) => {
      const isSel = id === boxId;
      m.setStyle({
        radius: isSel ? 10 : 8,
        fillColor: isSel ? '#C8963E' : '#234233'
      });
    });
    const boxes = getPhysicalMiniBiebs();
    const selectedBox = boxes.find((b) => b.id === boxId);
    const panelContainer = document.getElementById('selectedMiniBiebBooksPanelWrapper');
    if (panelContainer && selectedBox) {
      panelContainer.innerHTML = buildSelectedMiniBiebPanelHtml(selectedBox);
      applyDynamicTranslationIfNeeded(panelContainer);
    }
    return;
  }

  renderPhysicalMiniBiebsSection();
  const marker = _physicalBoxLeafletMarkers.get(boxId);
  if (marker && typeof marker.openPopup === 'function') {
    try {
      marker.openPopup();
    } catch {}
  }
  const panel = document.getElementById('selectedMiniBiebBooksPanel');
  if (panel && typeof panel.scrollIntoView === 'function') {
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

let _isHandlingPopState = false;

function pushAppHistoryState(viewKey) {
  if (_isHandlingPopState) return;
  if (typeof window === 'undefined' || !window.history || typeof window.history.pushState !== 'function') return;
  try {
    window.history.pushState(
      {
        bbNav: true,
        viewKey: viewKey || AppState.activeTab || 'plank',
        tab: AppState.activeTab || 'plank',
        sub: AppState.discoverSubView || 'kast',
        chatMode: AppState.chatViewMode || 'thread'
      },
      ''
    );
  } catch {}
}

window.switchDiscoverSubView = function (subView) {
  const next = ['kast', 'kaart', 'gezocht'].includes(subView) ? subView : 'kast';
  const prev = AppState.discoverSubView || 'kast';
  AppState.discoverSubView = next;
  if (next !== prev && next !== 'kast') {
    pushAppHistoryState(`sub:${next}`);
  }

  const kastEl = document.getElementById('discoverPaneKast');
  const kaartEl = document.getElementById('physicalMiniBiebsSection');
  const gezochtEl = document.getElementById('wantedBooksSection');

  if (kastEl) kastEl.style.display = next === 'kast' ? 'block' : 'none';
  if (kaartEl) kaartEl.style.display = next === 'kaart' ? 'block' : 'none';
  if (gezochtEl) gezochtEl.style.display = next === 'gezocht' ? 'block' : 'none';

  document.querySelectorAll('[data-discover-sub]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-discover-sub') === next);
  });
  updateSideMenuActiveState();

  if (next === 'kaart') {
    renderPhysicalMiniBiebsSection();
    if (_physicalBoxesLeafletInstance && typeof _physicalBoxesLeafletInstance.invalidateSize === 'function') {
      setTimeout(() => {
        try {
          _physicalBoxesLeafletInstance.invalidateSize();
        } catch {}
      }, 60);
    }
  } else if (next === 'gezocht') {
    renderWantedBooksSection();
  }
};

window.toggleExtraShelfFilters = function () {
  const panel = document.getElementById('extraShelfFiltersPanel');
  const btn = document.getElementById('toggleExtraFiltersBtn');
  if (!panel) return;
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  if (btn) btn.setAttribute('aria-expanded', String(!isOpen));
};

function updateExtraFiltersBadge() {
  const btn = document.getElementById('toggleExtraFiltersBtn');
  if (!btn) return;
  let count = 0;
  if (AppState.filterGenre && AppState.filterGenre !== 'alle') count += 1;
  if (AppState.filterLanguage && AppState.filterLanguage !== 'alle') count += 1;
  const distEl = document.getElementById('shelfDistanceSelect');
  if (distEl && distEl.value && distEl.value !== 'alle') count += 1;
  const sortEl = document.getElementById('shelfSortSelect');
  if (sortEl && sortEl.value && sortEl.value !== 'dichtbij') count += 1;
  btn.textContent = count > 0 ? `⚙️ ${tr('Meer filters', 'More filters')} (${count})` : `⚙️ ${tr('Meer filters', 'More filters')}`;
}

window.scrollToPhysicalMiniBiebsSection = function () {
  if (AppState.activeTab !== 'plank') {
    switchTab('plank');
  }
  window.switchDiscoverSubView('kaart');
  const sec = document.getElementById('physicalMiniBiebsSection');
  if (sec && typeof sec.scrollIntoView === 'function') {
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

window.filterShelfByPhysicalBox = function (boxName) {
  window.switchDiscoverSubView('kast');
  const sEl = document.getElementById('searchBooksInput');
  if (sEl) sEl.value = boxName;
  AppState.searchQuery = boxName || '';
  AppState.shelfPage = 1;
  renderBookshelfView();
  document.getElementById('woodenCabinetContent')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.handleRegisterOwnPhysicalBoxClick = function () {
  const user = window.BuurtBiebDB.getCurrentUser();
  if (!user) {
    showToast(
      tr(
        'Log eerst in of maak een account aan om je fysieke MiniBieb op de kaart te zetten.',
        'Please log in or create an account first to add your street Little Library to the map.'
      )
    );
    openAuthModal('login');
    return;
  }
  AppState.isEditingProfile = true;
  switchTab('profiel');
};

function mountLeafletMiniBiebsMap(boxes) {
  if (typeof window === 'undefined' || !window.L || typeof document === 'undefined') return;
  const hostEl = document.getElementById('physicalBoxesLeafletMap');
  const fallbackEl = document.getElementById('physicalBoxesFallbackMap');
  if (!hostEl) return;

  try {
    const canReuseMap =
      _physicalBoxesLeafletInstance &&
      _physicalBoxesLeafletHostEl === hostEl &&
      document.body.contains(hostEl);

    let map = _physicalBoxesLeafletInstance;
    if (!canReuseMap) {
      if (_physicalBoxesLeafletInstance) {
        try {
          _physicalBoxesLeafletInstance.remove();
        } catch {}
        _physicalBoxesLeafletInstance = null;
        _physicalBoxesLeafletMarkerLayer = null;
      }
      if (fallbackEl) fallbackEl.style.display = 'none';
      hostEl.style.display = 'block';

      map = window.L.map(hostEl, { scrollWheelZoom: false }).setView([52.1326, 5.2913], 7);
      const esriUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';

      const primaryLayer = window.L.tileLayer(esriUrl, {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri'
      }).addTo(map);

      let errCount = 0;
      primaryLayer.on('tileerror', () => {
        errCount += 1;
        if (errCount >= 2) {
          if (fallbackEl) fallbackEl.style.display = '';
          hostEl.style.display = 'none';
        }
      });

      _physicalBoxesLeafletInstance = map;
      _physicalBoxesLeafletHostEl = hostEl;
      _physicalBoxesLeafletMarkerLayer = window.L.layerGroup().addTo(map);
    } else if (_physicalBoxesLeafletMarkerLayer) {
      _physicalBoxesLeafletMarkerLayer.clearLayers();
    }

    _physicalBoxLeafletMarkers = new Map();
    const bounds = [];
    const targetLayer = _physicalBoxesLeafletMarkerLayer || map;
    boxes.forEach((box) => {
      const isSelected = box.id === AppState.selectedPhysicalBoxId;
      const marker = window.L.circleMarker([box.coords.lat, box.coords.lng], {
        radius: isSelected ? 10 : 8,
        color: '#FFFDF9',
        weight: 2.5,
        fillColor: isSelected ? '#C8963E' : '#234233',
        fillOpacity: 0.96
      }).addTo(targetLayer);
      marker.bindTooltip(`${escapeHtml(box.name)} (${box.books.length})`, { direction: 'top', offset: [0, -6] });
      marker.bindPopup(buildMiniBiebPopupHtml(box), { maxWidth: 280 });
      marker.on('click', () => {
        window.selectPhysicalMiniBieb(box.id, { fromLeafletMarker: true });
        marker.openPopup();
      });
      _physicalBoxLeafletMarkers.set(box.id, marker);
      bounds.push([box.coords.lat, box.coords.lng]);
    });

    if (!canReuseMap) {
      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [36, 36], maxZoom: 12 });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 12);
      }
    }
  } catch {
    if (fallbackEl) fallbackEl.style.display = '';
    if (hostEl) hostEl.style.display = 'none';
  }
}

window.zoomMiniBiebsMap = function (delta) {
  if (delta === 0) {
    AppState.mapZoom = 1;
  } else {
    const next = Number(AppState.mapZoom || 1) + delta;
    AppState.mapZoom = Math.min(2.2, Math.max(1, Number(next.toFixed(2))));
  }
  renderPhysicalMiniBiebsSection();
};

const NL_MAP_REFERENCE_CITIES = [
  { name: 'Groningen', lat: 53.2194, lng: 6.5665 },
  { name: 'Leeuwarden', lat: 53.2012, lng: 5.7999 },
  { name: 'Zwolle', lat: 52.5168, lng: 6.083 },
  { name: 'Enschede', lat: 52.2215, lng: 6.8937 },
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
  { name: 'Utrecht', lat: 52.0907, lng: 5.1214 },
  { name: 'Den Haag', lat: 52.0705, lng: 4.3007 },
  { name: 'Rotterdam', lat: 51.9244, lng: 4.4777 },
  { name: 'Arnhem', lat: 51.9851, lng: 5.8987 },
  { name: 'Middelburg', lat: 51.4988, lng: 3.611 },
  { name: 'Breda', lat: 51.5719, lng: 4.7683 },
  { name: 'Eindhoven', lat: 51.4416, lng: 5.4697 },
  { name: 'Maastricht', lat: 50.8514, lng: 5.691 }
];

function buildSelectedMiniBiebPanelHtml(selectedBox) {
  if (!selectedBox) return '';
  const booksCardsHtml =
    selectedBox.books.length > 0
      ? selectedBox.books
          .map((b) => {
            const statusPill =
              b.status === 'gereserveerd'
                ? `<span class="sticker-badge" style="background:#FEF3C7; color:#92400E;">${tr('⏳ Gereserveerd', '⏳ Reserved')}</span>`
                : b.status === 'uitgeleend'
                  ? `<span class="sticker-badge" style="background:#DBEAFE; color:#1E40AF;">${tr('📖 Uitgeleend', '📖 Loaned out')}</span>`
                  : `<span class="sticker-badge" style="background:#DCFCE7; color:#166534;">${tr('✅ In kastje', '✅ Available inside')}</span>`;
            const safeBookCover = sanitizeImageUrl(b.cover_url);
            return `
              <div
                tabindex="0"
                role="button"
                data-action="open-book"
                data-book-id="${escapeHtml(b.id)}"
                style="cursor:pointer; display:flex; align-items:center; gap:0.75rem; background:#FFF; border:1px solid var(--border-warm); border-radius:10px; padding:0.7rem 0.8rem;"
              >
                <div class="book-cover-3d" style="width:46px; height:68px; flex-shrink:0; font-size:0.72rem;">
                  ${
                    safeBookCover
                      ? `<img src="${escapeHtml(safeBookCover)}" alt="${escapeHtml(b.title)}" data-book-id="${escapeHtml(b.id)}" data-book-author="${escapeHtml(b.author || '')}" data-fallback-title="${escapeHtml(String(b.title || '').slice(0, 12))}" onload="handleBookCoverLoad(this)" onerror="handleBookCoverError(this)" />`
                      : `<span>📚</span>`
                  }
                </div>
                <div style="min-width:0; flex:1;">
                  <div style="display:flex; flex-wrap:wrap; gap:0.25rem; margin-bottom:0.25rem;">
                    ${renderStickerBadge(b)}
                    ${statusPill}
                    ${renderBookLanguageBadge(b, true)}
                  </div>
                  <div style="font-weight:700; font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(b.title)}</div>
                  <div style="font-size:0.78rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(b.author)}</div>
                </div>
              </div>
            `;
          })
          .join('')
      : `<p style="font-size:0.86rem; color:var(--text-muted); margin-top:0.5rem;">${tr('Er liggen op dit moment nog geen geregistreerde boeken in dit fysieke kastje.', 'No registered books are currently inside this physical Little Library.')}</p>`;

  return `
    <div id="selectedMiniBiebBooksPanel" class="minibieb-selected-shelf-box">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.65rem;">
        <div>
          <span class="sticker-badge sticker-leenboek">${tr('📦 Inhoud van aangeklikt kastje', '📦 Books inside selected cabinet')}</span>
          <h3 class="serif-heading" style="font-size:1.2rem; margin-top:0.25rem;">
            🏡 ${escapeHtml(selectedBox.name)} · 📍 ${escapeHtml(formatPhysicalBoxAddress(selectedBox))}
          </h3>
        </div>
        <div style="display:flex; gap:0.45rem; flex-wrap:wrap;">
          <a
            href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBox.street_address ? formatPhysicalBoxAddress(selectedBox) : selectedBox.name + ' ' + formatPhysicalBoxAddress(selectedBox))}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline btn-sm"
            style="background:#FFF;"
          >
            📍 ${tr('Open in Google Maps', 'Open in Google Maps')}
          </a>
          <button type="button" class="btn btn-outline btn-sm" style="background:#FFF;" data-action="filter-box" data-box-name="${escapeHtml(selectedBox.name)}">
            🔍 ${tr('Toon in hoofdkast', 'Show on main shelf')}
          </button>
          ${
            selectedBox.books.length > 0
              ? `<button type="button" class="btn btn-primary btn-sm" data-action="open-book-dropoff" data-book-id="${escapeHtml(selectedBox.books[0].id)}">📷 ${tr('Boek in dit kastje leggen', 'Add book to this cabinet')}</button>`
              : ''
          }
        </div>
      </div>
      <div class="minibieb-books-grid">
        ${booksCardsHtml}
      </div>
    </div>
  `;
}

function renderPhysicalMiniBiebsSection() {
  const sec = document.getElementById('physicalMiniBiebsSection');
  if (!sec) return;

  const boxes = getPhysicalMiniBiebs();
  if (boxes.length > 0 && !boxes.some((b) => b.id === AppState.selectedPhysicalBoxId)) {
    AppState.selectedPhysicalBoxId = boxes[0].id;
  }
  const selectedBox = boxes.find((b) => b.id === AppState.selectedPhysicalBoxId) || null;

  const fallbackPinsHtml = boxes
    .map((box) => {
      const pos = coordsToNlPercent(box.coords.lat, box.coords.lng);
      const isActive = selectedBox && selectedBox.id === box.id;
      return `
        <button
          type="button"
          class="minibieb-pin-fallback ${isActive ? 'active' : ''}"
          style="left:${pos.x}%; top:${pos.y}%;"
          data-action="select-box"
          data-box-id="${escapeHtml(box.id)}"
          aria-label="${escapeHtml(box.name)} (${box.books.length})"
          title="${escapeHtml(box.name)} (${box.books.length}) · ${escapeHtml(formatPhysicalBoxAddress(box))}"
        ></button>
      `;
    })
    .join('');

  const listHtml =
    boxes.length > 0
      ? boxes
          .map((box) => {
            const isActive = selectedBox && selectedBox.id === box.id;
            const bookCountLabel =
              box.books.length === 1
                ? tr('1 boek in kastje', '1 book inside')
                : `${box.books.length} ${tr('boeken in kastje', 'books inside')}`;
            return `
              <button
                type="button"
                data-action="select-box"
                data-box-id="${escapeHtml(box.id)}"
                class="minibieb-box-card ${isActive ? 'active' : ''}"
              >
                <div style="display:flex; justify-content:space-between; align-items:center; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.25rem;">
                  <strong style="font-size:0.94rem;">🏡 ${escapeHtml(box.name)}</strong>
                  <span class="sticker-badge sticker-zwerfboek">📚 ${escapeHtml(bookCountLabel)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; gap:0.4rem; flex-wrap:wrap; font-size:0.78rem; color:var(--text-muted);">
                  <span>📍 ${escapeHtml(formatPhysicalBoxAddress(box))}</span>
                </div>
              </button>
            `;
          })
          .join('')
      : `
        <div style="background:var(--bg-cream); border:1.5px dashed var(--border-warm); border-radius:12px; padding:1.25rem; text-align:center; color:var(--text-muted); font-size:0.86rem;">
          <div style="font-size:1.8rem; margin-bottom:0.35rem;">🏡</div>
          <strong>${tr('Nog geen fysieke MiniBiebs aangemeld', 'No physical Little Libraries listed yet')}</strong>
          <p style="margin-top:0.3rem;">
            ${tr(
              'Heb je zelf een houten boekenkastje aan de straat staan? Zet in Mijn Bieb "Ik heb een fysieke MiniBieb aan de straat" aan en jouw kastje verschijnt direct hier op de landkaart!',
              'Have a physical Little Library at your street? Enable "I have a street Little Library" in My Library and your cabinet will appear right here on the map!'
            )}
          </p>
        </div>
      `;

  const selectedPanelHtml = selectedBox ? buildSelectedMiniBiebPanelHtml(selectedBox) : '';

  const cityLabelsSvg = NL_MAP_REFERENCE_CITIES.map((c) => {
    const pos = coordsToNlPercent(c.lat, c.lng);
    const sx = Number(((pos.x / 100) * 360).toFixed(1));
    const sy = Number(((pos.y / 100) * 400).toFixed(1));
    return `
      <circle cx="${sx}" cy="${sy}" r="2.2" fill="#496A5A" opacity="0.7" />
      <text x="${sx + 4}" y="${sy + 3}" font-size="8.5" fill="#496A5A" font-weight="600">${escapeHtml(c.name)}</text>
    `;
  }).join('');

  const mapZoom = Number(AppState.mapZoom || 1);
  const zoomOrigin = selectedBox
    ? (() => {
        const p = coordsToNlPercent(selectedBox.coords.lat, selectedBox.coords.lng);
        return `${p.x}% ${p.y}%`;
      })()
    : '50% 50%';

  sec.innerHTML = `
    <div class="section-header-flex" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:1rem;">
      <div>
        <span class="sticker-badge sticker-zwerfboek">${tr('🗺️ Landkaart & Fysieke Straatkastjes', '🗺️ Map & Street Little Libraries')}</span>
        <h2 class="serif-heading" style="font-size:1.35rem; margin-top:0.25rem;">
          ${tr('🗺️ Fysieke MiniBieb-Kastjes op de Kaart', '🗺️ Physical Little Libraries on the Map')}
        </h2>
        <p style="font-size:0.86rem; color:var(--text-muted);">
          ${tr(
            'Klik op een kastje op de kaart of in de lijst om direct te zien welke boeken er op dit moment in liggen.',
            'Click on any Little Library on the map or in the list to see which books are currently inside.'
          )}
        </p>
      </div>
      <button type="button" class="btn btn-primary btn-sm" onclick="handleRegisterOwnPhysicalBoxClick()">
        🏡 ${tr('Zet jouw MiniBieb op de kaart', 'Add Your Little Library to the Map')}
      </button>
    </div>

    <div class="minibieb-map-grid">
      <div id="physicalBoxesMapCanvas" class="minibieb-map-canvas">
        <div id="physicalBoxesLeafletMap" class="minibieb-leaflet-host" style="display:none;"></div>
        <div id="physicalBoxesFallbackMap" style="position:relative; width:100%; height:100%; min-height:360px; transform:scale(${mapZoom}); transform-origin:${zoomOrigin}; transition:transform 0.2s ease;">
          <div style="position:absolute; top:10px; left:10px; z-index:5; display:flex; flex-direction:column; gap:4px; background:rgba(255,253,249,0.92); border:1px solid var(--border-warm); border-radius:8px; padding:4px;">
            <button type="button" class="btn btn-outline btn-sm" style="padding:2px 8px; min-height:26px; font-weight:800;" onclick="zoomMiniBiebsMap(0.35)" title="${tr('Inzoomen', 'Zoom in')}">+</button>
            <button type="button" class="btn btn-outline btn-sm" style="padding:2px 8px; min-height:26px; font-weight:800;" onclick="zoomMiniBiebsMap(-0.35)" title="${tr('Uitzoomen', 'Zoom out')}">−</button>
            ${mapZoom > 1 ? `<button type="button" class="btn btn-outline btn-sm" style="padding:2px 6px; min-height:24px; font-size:0.68rem;" onclick="zoomMiniBiebsMap(0)">1x</button>` : ''}
          </div>
          <svg viewBox="0 0 360 400" preserveAspectRatio="xMidYMid meet" style="width:100%; height:100%; max-height:360px; display:block;">
            <rect width="360" height="400" fill="#D9ECE3" />
            <!-- Waddeneilanden -->
            <path d="M126 66 L142 54 L145 64 L132 76 Z" fill="#FFFDF9" stroke="#234233" stroke-width="1.8" />
            <path d="M148 52 L162 46 L165 53 L150 58 Z" fill="#FFFDF9" stroke="#234233" stroke-width="1.8" />
            <path d="M170 46 L194 42 L195 49 L172 52 Z" fill="#FFFDF9" stroke="#234233" stroke-width="1.8" />
            <path d="M202 42 L226 41 L226 47 L203 48 Z" fill="#FFFDF9" stroke="#234233" stroke-width="1.8" />
            <!-- Nederland vasteland & Zeeland & Zuid-Limburg -->
            <path d="M210 49 L258 42 L315 30 L335 45 L312 104 L344 176 L332 204 L286 218 L256 266 L264 338 L244 390 L212 388 L218 338 L192 318 L124 304 L42 308 L20 294 L32 270 L66 254 L78 214 L112 132 L134 78 L168 82 L172 118 L156 146 L186 150 L204 128 L194 94 Z" fill="#FFFDF9" stroke="#234233" stroke-width="2.4" stroke-linejoin="round" />
            <!-- IJsselmeer -->
            <path d="M168 92 L196 98 L206 130 L186 152 L158 144 Z" fill="#CFE5DC" stroke="#8EB8A4" stroke-width="1.2" />
            <!-- Grote rivieren -->
            <path d="M68 238 Q145 224 235 222 T304 226" fill="none" stroke="#B7DACB" stroke-width="3" stroke-linecap="round" />
            <path d="M98 258 Q168 248 228 246" fill="none" stroke="#B7DACB" stroke-width="2.5" stroke-linecap="round" />
            ${cityLabelsSvg}
            <text x="180" y="393" text-anchor="middle" font-size="10" fill="#234233" font-weight="700">${tr('Nederland · Klik op een MiniBieb-pin', 'Netherlands · Click a Little Library pin')}</text>
          </svg>
          ${fallbackPinsHtml}
        </div>
      </div>

      <div class="minibieb-box-list">
        ${listHtml}
      </div>
    </div>

    <div id="selectedMiniBiebBooksPanelWrapper">${selectedPanelHtml}</div>
  `;

  applyDynamicTranslationIfNeeded(sec);
  mountLeafletMiniBiebsMap(boxes);
}

window.setLanguageBookFilter = function (langFilter) {
  AppState.filterBookLanguage = langFilter || 'alle';
  AppState.shelfPage = 1;
  document.querySelectorAll('[data-lang-filter]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-lang-filter') === AppState.filterBookLanguage);
  });
  renderBookshelfView();
};

window.openAddBookWithLanguage = function (langValue) {
  switchTab('toevoegen');
  const langSelect = document.getElementById('bookLanguageInput');
  if (langSelect && langValue) {
    langSelect.value = langValue;
  }
  const isbnEl = document.getElementById('isbnInput');
  if (isbnEl) isbnEl.focus();
};

function renderLanguageSectionColumn({ sectionId, badgeText, titleText, subtitleText, emptyText, books, addLangValue, addButtonLabel, filterKey, filterButtonLabel }) {
  const cardsHtml =
    books.length > 0
      ? books
          .map((b) => {
            const safeLangCover = sanitizeImageUrl(b.cover_url);
            return `
          <div tabindex="0" role="button" data-action="open-book" data-book-id="${escapeHtml(b.id)}" style="cursor:pointer; display:flex; align-items:center; gap:0.7rem; background:#FFF; border:1px solid var(--border-warm); border-radius:10px; padding:0.65rem 0.75rem;">
            <div class="book-cover-3d" style="width:44px; height:64px; flex-shrink:0; font-size:0.7rem;">
              ${
                safeLangCover
                  ? `<img src="${escapeHtml(safeLangCover)}" alt="${escapeHtml(b.title)}" data-book-id="${escapeHtml(b.id)}" data-book-author="${escapeHtml(b.author || '')}" data-fallback-title="${escapeHtml(String(b.title || '').slice(0, 12))}" onload="handleBookCoverLoad(this)" onerror="handleBookCoverError(this)" />`
                  : `<span>📚</span>`
              }
            </div>
            <div style="min-width:0; flex:1;">
              <div style="display:flex; flex-wrap:wrap; gap:0.25rem; margin-bottom:0.2rem;">
                ${renderBookLanguageBadge(b)}
                ${renderStickerBadge(b)}
              </div>
              <div style="font-weight:700; font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(b.title)}</div>
              <div style="font-size:0.78rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(b.author)} · ${escapeHtml(b.owner_bieb_name)}</div>
            </div>
          </div>
        `;
          })
          .join('')
      : `<div style="font-size:0.84rem; color:var(--text-muted); padding:0.75rem; background:rgba(255,255,255,0.7); border:1px dashed var(--border-warm); border-radius:8px;">${escapeHtml(emptyText)}</div>`;

  return `
    <div id="${sectionId}" style="background:var(--bg-cream); border:1.5px solid var(--border-warm); border-radius:12px; padding:1.05rem; display:flex; flex-direction:column; justify-content:space-between; gap:0.85rem;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.35rem;">
          <span class="sticker-badge sticker-leenboek">${escapeHtml(badgeText)} (${books.length})</span>
          ${
            books.length > 0
              ? `<button type="button" class="btn btn-outline btn-sm" style="padding:0.2rem 0.55rem; font-size:0.74rem;" onclick="setLanguageBookFilter('${filterKey}'); document.getElementById('woodenCabinetContent')?.scrollIntoView({ behavior: 'smooth' });">${escapeHtml(filterButtonLabel)}</button>`
              : ''
          }
        </div>
        <h3 class="serif-heading" style="font-size:1.15rem; margin-bottom:0.2rem;">${escapeHtml(titleText)}</h3>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.75rem;">${escapeHtml(subtitleText)}</p>
        <div style="display:grid; gap:0.55rem;">
          ${cardsHtml}
        </div>
      </div>
      <div>
        <button type="button" class="btn btn-primary btn-sm" style="width:100%;" onclick="openAddBookWithLanguage('${addLangValue}')">
          ${escapeHtml(addButtonLabel)}
        </button>
      </div>
    </div>
  `;
}

function renderInternationalBooksSection() {
  const sec = document.getElementById('internationalBooksSection');
  if (!sec) return;

  const activeBooks = window.BuurtBiebDB.getBooks().filter(
    (b) => b.status !== 'overgedragen' && b.status !== 'meegenomen'
  );
  const englishBooks = activeBooks.filter((b) => getBookLanguageCategory(b) === 'en');
  const otherLangBooks = activeBooks.filter((b) => getBookLanguageCategory(b) === 'other');

  sec.innerHTML = `
    <div style="margin-bottom:1rem;">
      <span class="sticker-badge sticker-zwerfboek">${tr('🌍 Talenhoek in de Buurt', '🌍 Languages Corner')}</span>
      <h2 class="serif-heading" style="font-size:1.35rem; margin-top:0.25rem;">
        ${tr('🇬🇧 Engelse Boeken & 🌍 Internationale Boeken', '🇬🇧 English Books & 🌍 International Books')}
      </h2>
      <p style="font-size:0.86rem; color:var(--text-muted);">
        ${tr(
          'Vind hier direct alle Engelstalige boeken én boeken in andere internationale talen (geen Nederlands of Engels) bij jou in de buurt.',
          'Browse English books and international books in any other language (other than Dutch or English) shared nearby.'
        )}
      </p>
    </div>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(290px, 1fr)); gap:1rem;">
      ${renderLanguageSectionColumn({
        sectionId: 'englishBooksSubSection',
        badgeText: tr('🇬🇧 Engelse Boeken', '🇬🇧 English Books'),
        titleText: tr('🇬🇧 Engelse Boeken', '🇬🇧 English Books'),
        subtitleText: tr(
          'Engelstalige romans, thrillers en non-fictie aangeboden door buurtgenoten.',
          'English novels, thrillers and non-fiction shared by neighbors.'
        ),
        emptyText: tr(
          'Nog geen Engelse boeken aangeboden. Heb je een Engels boek om te delen?',
          'No English books listed yet. Have an English book to share?'
        ),
        books: englishBooks,
        addLangValue: 'en',
        addButtonLabel: tr('+ 🇬🇧 Engels boek toevoegen', '+ 🇬🇧 Add English Book'),
        filterKey: 'en',
        filterButtonLabel: tr('Toon in kast', 'Show in cabinet')
      })}
      ${renderLanguageSectionColumn({
        sectionId: 'otherLanguageBooksSubSection',
        badgeText: tr('🌍 Internationaal (niet NL/EN)', '🌍 International (non-NL/EN)'),
        titleText: tr('🌍 Internationale Boeken (andere taal)', '🌍 International Books (other languages)'),
        subtitleText: tr(
          'Boeken in andere talen dan Nederlands en Engels — zoals Duits, Frans, Spaans of Italiaans.',
          'Books in languages other than Dutch and English — such as German, French, Spanish or Italian.'
        ),
        emptyText: tr(
          'Nog geen anderstalige boeken aangeboden. Deel een Duits, Frans, Spaans of ander buitenlands boek!',
          'No books in other languages yet. Share a German, French, Spanish or other international book!'
        ),
        books: otherLangBooks,
        addLangValue: 'other:Duits',
        addButtonLabel: tr('+ 🌍 Internationaal boek toevoegen', '+ 🌍 Add International Book'),
        filterKey: 'other',
        filterButtonLabel: tr('Toon in kast', 'Show in cabinet')
      })}
    </div>
  `;
}

function renderWantedBooksSection() {
  const container = document.getElementById('wantedBooksListContainer');
  if (!container) return;

  const user = window.BuurtBiebDB.getCurrentUser();
  const postalFilter = (AppState.filterPostal || '').trim();
  const refPostalNum = parseInt(
    postalFilter.replace(/\D/g, '') || (user && user.postal_code_4) || '3512',
    10
  );

  const wantedList = window.BuurtBiebDB.getWantedBooks();
  wantedList.sort((a, b) => {
    const distA = Math.abs(parseInt(a.postal_code_4 || '9999', 10) - refPostalNum);
    const distB = Math.abs(parseInt(b.postal_code_4 || '9999', 10) - refPostalNum);
    return distA - distB;
  });

  if (wantedList.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:1.25rem; color:var(--text-muted); font-size:0.88rem;">
        Nog geen gezochte boeken in jouw buurt. Zoek je een specifiek boek? Klik rechtsboven op <strong>"+ 🔎 Zelf een gezocht boek plaatsen"</strong>!
      </div>
    `;
    applyDynamicTranslationIfNeeded(container);
    return;
  }

  const modeLabels = {
    lenen_of_ruilen: '🔵/🟢 Wil graag lenen of ruilen',
    alleen_lenen: '🔵 Wil graag lenen (brengt netjes terug)',
    overnemen_of_kopen: '🟢/🟡 Wil overnemen of voor klein prijsje kopen'
  };

  container.innerHTML = wantedList
    .map((w) => {
      const isMine = Boolean(user && w.seeker_id === user.id);
      const prefLabel = modeLabels[w.prefer_mode] || modeLabels.lenen_of_ruilen;
      return `
        <div style="background:var(--bg-cream); border:1.5px solid var(--border-warm); border-radius:12px; padding:1rem; display:flex; flex-direction:column; justify-content:space-between; gap:0.75rem;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.45rem;">
              <span class="sticker-badge sticker-leenboek">🔎 Gezocht</span>
              <span style="font-size:0.76rem; font-weight:700; color:var(--accent-green);">📍 ${escapeHtml(formatLocationLabel(w.postal_code_4, w.city))}</span>
            </div>
            <h3 class="serif-heading" style="font-size:1.05rem; margin-bottom:0.15rem;">${escapeHtml(w.title)}</h3>
            ${w.author ? `<div style="font-size:0.84rem; color:var(--text-muted); font-weight:600; margin-bottom:0.35rem;">Door ${escapeHtml(w.author)}</div>` : ''}
            <div style="font-size:0.76rem; font-weight:700; color:#1E40AF; margin-bottom:0.35rem;">${escapeHtml(prefLabel)}</div>
            ${w.note ? `<p style="font-size:0.82rem; color:var(--text-main); font-style:italic; margin-bottom:0.4rem;">"${escapeHtml(w.note)}"</p>` : ''}
            <div style="font-size:0.76rem; color:var(--text-muted);">
              Gezocht door: <strong>${escapeHtml(w.seeker_name)}</strong>
            </div>
          </div>
          <div style="display:flex; gap:0.45rem; flex-wrap:wrap; padding-top:0.55rem; border-top:1px dashed var(--border-warm);">
            ${
              isMine
                ? `
                  <button type="button" class="btn btn-outline btn-sm" style="width:100%;" onclick="handleDeleteWantedBook('${w.id}')">
                    ✅ Boek gevonden / Oproepje verwijderen
                  </button>
                `
                : `
                  <button type="button" class="btn btn-primary btn-sm" style="width:100%;" onclick="handleRespondToWantedBook('${w.id}')">
                    💬 Ik heb dit boek voor je! (Open Chat)
                  </button>
                `
            }
          </div>
        </div>
      `;
    })
    .join('');
  applyDynamicTranslationIfNeeded(container);
}

window.scrollToWantedBooksSection = function (openForm) {
  if (AppState.activeTab !== 'plank') {
    switchTab('plank');
  }
  window.switchDiscoverSubView('gezocht');
  const sec = document.getElementById('wantedBooksSection');
  if (openForm) {
    const formBox = document.getElementById('wantedBookFormBox');
    if (formBox && formBox.style.display === 'none') {
      window.toggleWantedBookForm();
    }
  }
  if (sec) {
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

window.toggleWantedBookForm = function () {
  const user = window.BuurtBiebDB.getCurrentUser();
  if (!user) {
    showToast('Log eerst even in om een "Boek Gezocht"-oproepje te plaatsen.');
    openAuthModal();
    return;
  }
  if (user.needsOnboarding) {
    openOnboardingModal();
    return;
  }

  const formBox = document.getElementById('wantedBookFormBox');
  if (!formBox) return;
  const isHidden = formBox.style.display === 'none';
  formBox.style.display = isHidden ? 'block' : 'none';

  if (isHidden) {
    const titleEl = document.getElementById('wantedTitleInput');
    if (titleEl) {
      if (!titleEl.value && AppState.searchQuery.trim()) {
        titleEl.value = AppState.searchQuery.trim();
      }
      titleEl.focus();
    }
  }
};

window.handleWantedBookSubmit = function (event) {
  event.preventDefault();
  try {
    const title = document.getElementById('wantedTitleInput')?.value || '';
    const author = document.getElementById('wantedAuthorInput')?.value || '';
    const prefer_mode = document.getElementById('wantedPreferModeSelect')?.value || 'lenen_of_ruilen';
    const note = document.getElementById('wantedNoteInput')?.value || '';

    const created = window.BuurtBiebDB.addWantedBook({
      title,
      author,
      prefer_mode,
      note
    });

    document.getElementById('wantedBookFormBox').reset();
    document.getElementById('wantedBookFormBox').style.display = 'none';
    showToast(`📌 Je oproepje voor "${created.title}" staat nu op het buurt-prikbord!`);
    renderWantedBooksSection();
  } catch (err) {
    showAppAlert(err.message);
  }
};

window.handleRespondToWantedBook = function (wantedId) {
  const user = window.BuurtBiebDB.getCurrentUser();
  if (!user) {
    showToast('Log eerst even in om te reageren op een gezocht boek.');
    openAuthModal();
    return;
  }
  if (user.needsOnboarding) {
    openOnboardingModal();
    return;
  }

  const wantedItem = window.BuurtBiebDB.getWantedBooks().find((w) => w.id === wantedId);
  if (!wantedItem) return;
  if (wantedItem.seeker_id === user.id) {
    showToast('Dit is jouw eigen oproepje — je kunt geen chat met jezelf starten.');
    return;
  }

  try {
    const { conv, draftMessage } = window.BuurtBiebDB.startWantedBookChat(wantedItem);
    AppState.activeConversationId = conv.id;
    AppState.chatViewMode = 'thread';
    AppState.chatDraft = { convId: conv.id, text: draftMessage };
    showToast(`✏️ Chat met ${wantedItem.seeker_name} geopend — controleer of pas je bericht aan en druk op Verstuur.`);
    switchTab('chat');
  } catch (err) {
    showAppAlert(err.message);
  }
};

window.handleDeleteWantedBook = async function (wantedId) {
  const item = window.BuurtBiebDB.getWantedBooks().find((w) => w.id === wantedId);
  const titleLabel = item && item.title ? `"${item.title}"` : 'dit oproepje';
  const confirmed = await window.showAppConfirm(
    tr(
      `Weet je zeker dat je jouw oproepje voor ${titleLabel} wilt verwijderen?`,
      `Are you sure you want to delete your wanted request for ${titleLabel}?`
    ),
    {
      title: tr('Oproepje verwijderen', 'Delete request'),
      icon: '🗑️',
      confirmText: tr('Verwijderen', 'Delete'),
      cancelText: tr('Annuleren', 'Cancel'),
      danger: true
    }
  );
  if (!confirmed) return;

  try {
    window.BuurtBiebDB.deleteWantedBook(wantedId);
    showToast('✅ Je "Boek Gezocht"-oproepje is gesloten en verwijderd.');
    renderWantedBooksSection();
  } catch (err) {
    showAppAlert(err.message);
  }
};

window.goToShelfPage = function (pageNum) {
  AppState.shelfPage = Number(pageNum) || 1;
  renderBookshelfView();
  const cab = document.querySelector('.wood-cabinet-wrapper');
  if (cab) cab.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.handlePageSizeChange = function (val) {
  AppState.shelfPageSize = Number(val) || 9;
  AppState.shelfPage = 1;
  renderBookshelfView();
};

// Alle communicatie verloopt direct en veilig via de In-App BuurtChat
function renderContactActionButtons(book, handoverMode, isReservation) {
  return `
    <div class="contact-action-btns" style="display:flex; flex-wrap:wrap; gap:0.4rem;">
      <button type="button" class="btn btn-primary btn-sm" onclick="handleStartInAppChatForBook('${book.id}', '${handoverMode}', ${Boolean(isReservation)})">
        💬 ${isReservation ? 'Aanvragen via Chat' : 'Open BuurtChat'}
      </button>
    </div>
  `;
}

// Opent een extern contactkanaal (zonder boek te reserveren) pas nadat de gebruiker het bericht heeft gecontroleerd
window.handleOpenContactChannel = function (bookId, handoverMode, channel) {
  const book = window.BuurtBiebDB.getBooks().find((b) => b.id === bookId);
  if (!book) return;
  const user = window.BuurtBiebDB.getCurrentUser();
  if (user && book.owner_id === user.id) {
    showToast('Dit is jouw eigen boek op de plank — je kunt geen bericht of chat met jezelf starten.');
    return;
  }

  const finalMessage = confirmOutgoingMessage(buildRequestMessageText(book, handoverMode));
  if (finalMessage === null) return;

  const contactInfo = window.BuurtBiebDB.getOwnerContactInfo(book);
  const phone = String(contactInfo.whatsapp_number || '31612345678').replace(/[^0-9]/g, '');

  if (channel === 'email') {
    window.location.href = buildMailtoUrl(book, handoverMode, undefined, finalMessage);
  } else if (channel === 'signal') {
    window.open(`https://signal.me/#p/+${phone}`, '_blank', 'noopener,noreferrer');
  } else if (channel === 'sms') {
    window.location.href = `sms:+${phone}?body=${encodeURIComponent(finalMessage)}`;
  } else {
    window.open(buildWhatsAppUrl(book, handoverMode, undefined, finalMessage), '_blank', 'noopener,noreferrer');
  }
};

// ============================================================================
// BOEK DETAIL & OVERDRACHT MODAL (Stickers & BuurtChat)
// ============================================================================
window.openBookDetailModal = function (bookId) {
  const books = window.BuurtBiebDB.getBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) return;

  AppState.activeBookModalId = bookId;
  const user = window.BuurtBiebDB.getCurrentUser();
  const isOwnBook = Boolean(user && book.owner_id === user.id);
  const contactInfo = window.BuurtBiebDB.getOwnerContactInfo(book);

  const isPaidBook = book.sticker_type === 'koopboek' || book.sticker_type === 'marktplaats';
  const isStreetBox = Boolean(book.self_service_box);
  const handoverSummaryText = isPaidBook
    ? 'Onderling afrekenen (€ ' + Number(book.price_eur).toFixed(2).replace('.', ',') + ')'
    : book.sticker_type === 'leenboek'
      ? 'Lokaal lenen in overleg & na het lezen terugbrengen'
      : 'Gratis meenemen, ruilen of doorgeven';

  let depositNoticeHtml = '';
  if (book.deposit_type === 'bedrag' && book.deposit_amount_eur > 0) {
    depositNoticeHtml = `
      <div style="background:#FFFBEB; border:1px solid #F59E0B; border-radius:8px; padding:0.75rem; margin-top:0.75rem; font-size:0.85rem;">
        <strong>🔐 Onderlinge Borg ingesteld door eigenaar: € ${book.deposit_amount_eur},-</strong><br>
        Dit waardevolle boek heeft een onderlinge borg van € ${book.deposit_amount_eur},- (rechtstreeks via Tikkie of contant bij ophalen).
      </div>
    `;
  } else if (book.deposit_type === 'onderpand_boek') {
    depositNoticeHtml = `
      <div style="background:#FFFBEB; border:1px solid #F59E0B; border-radius:8px; padding:0.75rem; margin-top:0.75rem; font-size:0.85rem;">
        <strong>🔄 Onderpand-boek Borg:</strong><br>
        De eigenaar vraagt bij het lenen tijdelijk een eigen boek als onderpand in het kastje of aan de deur.
      </div>
    `;
  }

  let marktplaatsInfoHtml = '';
  if (book.sticker_type === 'marktplaats') {
    const condLabel = CONDITION_LABELS[book.book_condition] || '✨ Als nieuw';
    const priceStr = Number(book.price_eur || 0).toFixed(2).replace('.', ',');
    marktplaatsInfoHtml = `
      <div style="background:#F8F0FA; border:1.5px solid #C48FD6; border-radius:10px; padding:0.9rem; margin-top:0.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <span class="mp-condition-badge">${escapeHtml(condLabel)}</span>
            <span class="mp-condition-badge">📂 ${escapeHtml(book.market_category || 'Recente Bestseller')}</span>
          </div>
          <span class="mp-price-tag">Vraagprijs € ${priceStr}</span>
        </div>
        ${
          !isOwnBook && book.allow_bidding
            ? `
              <div style="margin-top:0.75rem; padding-top:0.65rem; border-top:1px dashed #C48FD6; display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                <span style="font-size:0.82rem; font-weight:700; color:#5B216E;">🏷️ Doe een tegenbod (€):</span>
                <input type="number" id="modalBidInput_${book.id}" class="input-field" style="width:95px; padding:0.38rem 0.6rem; background:#FFF;" min="1" max="150" step="0.50" placeholder="€ Bod" value="${Math.max(5, (Number(book.price_eur) * 0.85).toFixed(0))}" />
                <button type="button" class="btn btn-primary btn-sm" onclick="handlePlaceBidInAppChat('${book.id}', 'modalBidInput_${book.id}')">
                  💬 Bied via BuurtChat
                </button>
              </div>
            `
            : `<div style="font-size:0.78rem; color:#5B216E; margin-top:0.45rem;">${isOwnBook ? 'Jouw eigen aanbod op de Boekenbeurs.' : 'Vaste vraagprijs (rechtstreeks onderling via Tikkie of contant).'}</div>`
        }
      </div>
    `;
  }

  const modalBody = document.getElementById('bookDetailModalBody');
  modalBody.innerHTML = `
    <div class="modal-book-hero" style="display:flex; gap:1.25rem; flex-wrap:wrap; margin-bottom:1.25rem;">
      <div class="book-cover-3d" style="width:110px; height:162px; font-size:0.85rem;">
        ${
          book.cover_url
            ? `<img src="${escapeHtml(book.cover_url)}" alt="${escapeHtml(book.title)}" data-book-id="${escapeHtml(book.id)}" data-book-author="${escapeHtml(book.author || '')}" data-fallback-title="${escapeHtml(book.title.slice(0, 22))}" onload="handleBookCoverLoad(this)" onerror="handleBookCoverError(this)" />`
            : `<span>📚<br>${escapeHtml(book.title)}</span>`
        }
      </div>
      <div class="modal-book-meta" style="flex:1; min-width:220px;">
        <div class="modal-book-badges" style="display:flex; align-items:center; gap:0.45rem; flex-wrap:wrap;">
          ${renderStickerBadge(book)}
          ${renderGenreBadge(book)}
          ${renderBookLanguageBadge(book)}
        </div>
        <h2 class="serif-heading" style="font-size:1.45rem; margin-top:0.35rem;">${escapeHtml(book.title)}</h2>
        <div style="color:var(--text-muted); font-weight:600; margin-bottom:0.5rem;">
          Door ${escapeHtml(book.author)} ${book.isbn ? `· <small>ISBN ${escapeHtml(book.isbn)}</small>` : ''}
        </div>
        <p style="font-size:0.9rem; margin-bottom:0.65rem;">${escapeHtml(book.description || 'Aangeboden in de lokale BuurtBieb.')}</p>
        <div style="font-size:0.84rem; background:var(--bg-paper); padding:0.6rem 0.85rem; border-radius:8px;">
          <div>
            ${book.self_service_box ? '🏡 Fysieke MiniBieb:' : '📚 Boekenplank:'}
            <strong>${escapeHtml(book.owner_bieb_name)}</strong>${
              book.postal_code_4 || book.city
                ? ` · 📍 <strong>${escapeHtml(formatLocationLabel(book.postal_code_4, book.city))}</strong>`
                : ''
            }
          </div>
        </div>
        ${marktplaatsInfoHtml}
        ${depositNoticeHtml}
      </div>
    </div>

    <!-- EIGENAAR-BEHEER OF OVERDRACHT (THUIS-BOEKENPLANK / FYSIEKE MINIBIEB) -->
    ${
      isOwnBook
        ? `
          <div style="background:#ECFDF5; border:1.5px solid var(--accent-green); border-radius:12px; padding:1.15rem; margin-bottom:1.35rem;">
            <h3 class="serif-heading" style="font-size:1.05rem; margin-bottom:0.35rem;">
              📚 Dit is jouw eigen boek op de plank
            </h3>
            <p style="font-size:0.84rem; color:var(--text-main); margin-bottom:0.8rem;">
              ${
                book.status === 'gereserveerd'
                  ? `Status: <strong>⏳ Gereserveerd${book.reserved_by_name ? ' door ' + escapeHtml(book.reserved_by_name) : ''}</strong>. Gaat de overdracht niet door of is het boek terug? Zet het hieronder weer op Beschikbaar.`
                  : book.status === 'uitgeleend'
                    ? `Status: <strong>📖 Uitgeleend${book.reserved_by_name ? ' aan ' + escapeHtml(book.reserved_by_name) : ''}</strong>. Zet het weer op Beschikbaar zodra je het boek terug hebt.`
                    : `Status: <strong>✅ Beschikbaar</strong> voor buurtgenoten op de boekenplank. (Je kunt geen aanvraag of chat met jezelf starten.)`
              }
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:0.55rem; align-items:center;">
              ${
                book.status === 'gereserveerd' || book.status === 'uitgeleend'
                  ? `
                    <button type="button" class="btn btn-primary btn-sm" onclick="handleReturnBook('${book.id}'); closeBookDetailModal();">
                      ↩️ Zet weer als Beschikbaar op de plank
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" style="background:#FFF;" onclick="handleConfirmBookHandover('${book.id}'); closeBookDetailModal();">
                      ✅ Overdracht afronden
                    </button>
                  `
                  : book.sticker_type === 'leenboek'
                    ? `
                      <button type="button" class="btn btn-outline btn-sm" style="background:#FFF;" onclick="handleMarkLoanedOut('${book.id}'); closeBookDetailModal();">
                        📖 Markeer als Uitgeleend
                      </button>
                    `
                    : ''
              }
              <button type="button" class="btn btn-outline btn-sm" style="background:#FFF; color:#B91C1C; border-color:#FCA5A5;" onclick="closeBookDetailModal(); handleDeleteBook('${book.id}');">
                🗑️ Boek verwijderen van mijn plank
              </button>
            </div>
          </div>
        `
        : isStreetBox
          ? `
          <div style="background:var(--accent-green-light); border:1.5px solid var(--accent-green); border-radius:12px; padding:1.15rem; margin-bottom:1.35rem;">
            <h3 class="serif-heading" style="font-size:1.05rem; margin-bottom:0.35rem;">
              🏡 Fysieke MiniBieb — Gewoon vrij pakken (geen afspraak nodig)
            </h3>
            <p style="font-size:0.84rem; color:var(--text-main); margin-bottom:0.5rem;">
              Dit boek ligt in de openbare MiniBieb <strong>${escapeHtml(book.owner_bieb_name)}</strong> (${escapeHtml(book.postal_code_4)} ${escapeHtml(book.city)}). Je hoeft geen overdracht of afspraak te maken: je kunt er gewoon langslopen en het boek meenemen.
            </p>
            <div style="font-size:0.78rem; color:var(--text-muted); background:rgba(255,255,255,0.75); border:1px dashed var(--border-warm); border-radius:8px; padding:0.55rem 0.75rem; margin-bottom:0.85rem;">
              💡 <strong>Goed om te weten:</strong> Omdat ook veel buurtbewoners die deze app niet gebruiken boeken uit de MiniBieb pakken of erin leggen, klopt het overzicht niet altijd 100% met wat er op dit moment in het kastje ligt.
            </div>

            <div class="mini-bieb-action-row" style="display:flex; flex-wrap:wrap; gap:0.55rem; align-items:center;">
              <button type="button" class="btn btn-primary btn-sm" onclick="handleMarkMiniBiebBookTaken('${book.id}')">
                ✅ Ik heb dit boek meegenomen uit de MiniBieb
              </button>
              <button type="button" class="btn btn-outline btn-sm" style="background:#FFF;" onclick="handleStartInAppChatForBook('${book.id}', 'buitenkastje_selfservice', false)">
                💬 Vraag aan beheerder
              </button>
              <button type="button" class="btn btn-outline btn-sm" style="background:#FFF;" onclick="toggleInlineMiniBiebDropoff('${book.id}')">
                📷 Ik heb een boek in deze MiniBieb gelegd (Scan ISBN)
              </button>
            </div>

            <!-- Inline scanner voor bezoekers die een boek in deze fysieke MiniBieb achterlaten -->
            <div id="inlineMiniBiebDropoffBox" style="display:none; margin-top:0.85rem; background:#FFF; border:1.5px solid var(--accent-green); border-radius:10px; padding:0.85rem;">
              <div style="font-weight:700; font-size:0.85rem; color:var(--accent-green); margin-bottom:0.35rem;">
                📷 Leg je een boek in ${escapeHtml(book.owner_bieb_name)}? Scan of typ hier het ISBN:
              </div>
              <p style="font-size:0.76rem; color:var(--text-muted); margin-bottom:0.55rem;">
                Zo zien buurtgenoten meteen welk nieuw boek jij in dit kastje hebt gelegd!
              </p>
              <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                <input
                  type="text"
                  id="inlineMiniBiebIsbnInput"
                  class="input-field"
                  style="flex:1; min-width:180px;"
                  placeholder="Typ of scan ISBN (bijv. 9789044543087)..."
                  onkeydown="if(event.key==='Enter'){event.preventDefault(); handleInlineMiniBiebDropoffScan('${book.id}');}"
                />
                <button type="button" class="btn btn-primary btn-sm" onclick="handleInlineMiniBiebDropoffScan('${book.id}')">
                  ➕ Zet in deze MiniBieb
                </button>
                <button type="button" class="btn btn-outline btn-sm" onclick="toggleInlineMiniBiebCamera('${book.id}')">
                  📷 Camera
                </button>
              </div>
              <div id="inlineMiniBiebCameraBox" style="display:none; margin-top:0.65rem; background:#000; border-radius:8px; padding:0.5rem; text-align:center;">
                <video id="inlineMiniBiebVideo" autoplay playsinline style="max-width:100%; max-height:190px; border-radius:6px;"></video>
                <div style="color:#FFF; font-size:0.75rem; margin-top:0.3rem;">Richt je camera op de ISBN-streepjescode van het boek dat je in het kastje legt...</div>
              </div>
              <div id="inlineMiniBiebDropoffStatus" style="margin-top:0.45rem; font-size:0.8rem;"></div>
            </div>
          </div>
        `
        : book.status === 'gereserveerd' || book.status === 'uitgeleend'
          ? `
            <div style="background:#FFFBEB; border:1.5px solid #F59E0B; border-radius:12px; padding:1.15rem; margin-bottom:1.35rem;">
              <h3 class="serif-heading" style="font-size:1.05rem; margin-bottom:0.35rem; color:#92400E;">
                ${book.status === 'uitgeleend' ? '📖 Dit boek is momenteel uitgeleend' : '⏳ Dit boek is momenteel gereserveerd'}
              </h3>
              <p style="font-size:0.84rem; color:#78350F; margin-bottom:0.75rem;">
                ${
                  user && book.reserved_by_id === user.id
                    ? `Jij hebt dit boek aangevraagd bij <strong>${escapeHtml(book.owner_bieb_name)}</strong>. Gebruik de chat om verder af te spreken of bevestig de ontvangst hieronder.`
                    : `Dit boek staat wel op de plank van <strong>${escapeHtml(book.owner_bieb_name)}</strong>, maar is tijdelijk gereserveerd${book.reserved_by_name ? ' voor ' + escapeHtml(book.reserved_by_name) : ''}.`
                }
              </p>
              ${
                user && book.reserved_by_id === user.id
                  ? `
                    <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                      ${
                        !book.handover_confirmed
                          ? `<button type="button" class="btn btn-primary btn-sm" onclick="handleConfirmBookHandover('${book.id}')">📦 Ontvangst bevestigen</button>`
                          : ''
                      }
                      <button type="button" class="btn btn-outline btn-sm" style="background:#FFF;" onclick="handleStartInAppChatForBook('${book.id}', 'aan_de_deur_1op1', false)">
                        💬 Open Chat met ${escapeHtml(book.owner_bieb_name)}
                      </button>
                    </div>
                  `
                  : ''
              }
            </div>
          `
          : `
          <div style="background:var(--bg-card); border:1.5px solid var(--border-warm); border-radius:12px; padding:1.15rem; margin-bottom:1.35rem;">
            <h3 class="serif-heading" style="font-size:1.05rem; margin-bottom:0.4rem;">
              🤝 Kies Overdracht &amp; Neem Contact Op
            </h3>
            <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:0.9rem;">
              Dit boek staat op een thuis-boekenplank. Kies hoe je het boek wilt overnemen en spreek af via de chat:
            </p>

            <div style="display:grid; gap:0.65rem;">
              ${
                book.pickup_possible !== false
                  ? `
                    <div class="handover-option-row" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; background:var(--accent-green-light); border:1px solid var(--accent-green); padding:0.75rem 0.95rem; border-radius:8px;">
                      <div>
                        <strong>🚪 1-op-1 ophalen op afspraak (Aan de deur / vanuit huis)</strong>
                        <div style="font-size:0.78rem; color:var(--text-muted);">
                          ${handoverSummaryText} · Spreek in de chat een ophaalmoment af met ${escapeHtml(book.owner_bieb_name)}.
                        </div>
                      </div>
                      ${renderContactActionButtons(book, 'aan_de_deur_1op1', true)}
                    </div>

                    <div class="handover-option-row" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; background:var(--bg-cream); border:1px solid var(--border-warm); padding:0.75rem 0.95rem; border-radius:8px;">
                      <div>
                        <strong>📦 In overleg klaarleggen op afspraak (als niemand thuis is)</strong>
                        <div style="font-size:0.78rem; color:var(--text-muted);">
                          ${handoverSummaryText} · Spreek in overleg af dat ${escapeHtml(book.owner_bieb_name)} het boek op een afgesproken plek/tijd klaarlegt als er niemand thuis is.
                        </div>
                      </div>
                      ${renderContactActionButtons(book, 'klaarleggen_op_afspraak', true)}
                    </div>
                  `
                  : ''
              }

              ${
                !isPaidBook && book.pickup_possible !== false
                  ? `
                    <div class="handover-option-row" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; background:var(--bg-cream); border:1px solid var(--border-warm); padding:0.75rem 0.95rem; border-radius:8px;">
                      <div>
                        <strong>🔄 1-op-1 ${book.sticker_type === 'leenboek' ? 'Lenen met Onderpand-boek' : 'Boek Ruilen'} op afspraak</strong>
                        <div style="font-size:0.78rem; color:var(--text-muted);">
                          ${
                            book.sticker_type === 'leenboek'
                              ? 'Neem tijdelijk een eigen boek mee als onderpand.'
                              : 'Geef of leg in overleg 1 eigen boek terug bij ' + escapeHtml(book.owner_bieb_name) + ' (1 boek geven = 1 boek krijgen).'
                          }
                        </div>
                      </div>
                      ${renderContactActionButtons(book, 'ruilen_1op1', true)}
                    </div>
                  `
                  : ''
              }

              ${
                book.shipping_possible
                  ? `
                    <div class="handover-option-row" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; background:var(--bg-cream); border:1px solid var(--border-warm); padding:0.75rem 0.95rem; border-radius:8px;">
                      <div>
                        <strong>✉️ Verzenden per post / brievenbuspakje</strong>
                        <div style="font-size:0.78rem; color:var(--text-muted);">
                          ${handoverSummaryText} · Verzendlabel onderling afstemmen.
                        </div>
                      </div>
                      ${renderContactActionButtons(book, 'post_brievenbus', true)}
                    </div>
                  `
                  : ''
              }
            </div>
          </div>
        `
    }
  `;

  applyDynamicTranslationIfNeeded(modalBody);
  const modal = document.getElementById('bookDetailModal');
  if (modal) {
    modal.classList.add('open');
    focusFirstInModal(modal);
    pushAppHistoryState('modal:book');
  }
};

window.closeBookDetailModal = function () {
  if (AppState.inlineMiniBiebCameraStream) {
    AppState.inlineMiniBiebCameraStream.getTracks().forEach((t) => t.stop());
    AppState.inlineMiniBiebCameraStream = null;
  }
  const modal = document.getElementById('bookDetailModal');
  if (!modal || !modal.classList.contains('open')) return;
  modal.classList.remove('open');
  AppState.activeBookModalId = null;
  restoreFocusAfterModal();
};

window.handleMarkMiniBiebBookTaken = async function (bookId) {
  const book = window.BuurtBiebDB.getBooks().find((b) => b.id === bookId);
  const titleLabel = book && book.title ? `"${book.title}"` : 'dit boek';
  const confirmed = await window.showAppConfirm(
    tr(
      `Heb je ${titleLabel} daadwerkelijk uit de fysieke MiniBieb meegenomen? Het boek wordt dan uit het overzicht van dit kastje gehaald.`,
      `Did you actually take ${titleLabel} from this physical Little Library? It will be removed from this cabinet's overview.`
    ),
    {
      title: tr('Boek meegenomen bevestigen', 'Confirm book taken'),
      icon: '📚',
      confirmText: tr('Ja, meegenomen', 'Yes, taken'),
      cancelText: tr('Annuleren', 'Cancel'),
      danger: false
    }
  );
  if (!confirmed) return;

  try {
    const removed = window.BuurtBiebDB.markMiniBiebBookTaken(bookId);
    closeBookDetailModal();
    showToast(`✅ Veel leesplezier met "${removed.title}"! Het boek is uit het overzicht van ${removed.owner_bieb_name} gehaald.`);
    refreshAllViews();
  } catch (err) {
    showAppAlert(err.message);
  }
};

window.toggleInlineMiniBiebDropoff = function () {
  const box = document.getElementById('inlineMiniBiebDropoffBox');
  if (!box) return;
  const isHidden = box.style.display === 'none';
  box.style.display = isHidden ? 'block' : 'none';
  if (isHidden) {
    document.getElementById('inlineMiniBiebIsbnInput')?.focus();
  }
};

window.handleInlineMiniBiebDropoffScan = async function (refBookId, presetIsbn) {
  const books = window.BuurtBiebDB.getBooks();
  const refBook = books.find((b) => b.id === refBookId);
  if (!refBook) return;

  const inputEl = document.getElementById('inlineMiniBiebIsbnInput');
  if (presetIsbn && inputEl) {
    inputEl.value = presetIsbn;
  }
  const rawIsbn = inputEl ? inputEl.value.trim() : '';
  const statusEl = document.getElementById('inlineMiniBiebDropoffStatus');

  if (statusEl) {
    statusEl.innerHTML = `<span style="color:var(--accent-green);">⏳ Boekgegevens ophalen via ISBN...</span>`;
  }

  try {
    const bookData = await window.IsbnService.lookupByIsbn(rawIsbn);
    const added = window.BuurtBiebDB.addBookToMiniBiebBox(refBook, bookData);
    if (inputEl) inputEl.value = '';
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#065F46; font-weight:700;">✅ "${escapeHtml(added.title)}" (${escapeHtml(added.author)}) staat nu in ${escapeHtml(refBook.owner_bieb_name)}! Scan gerust nog een boek als je er meer in legt.</span>`;
    }
    showToast(`🏡 "${added.title}" toegevoegd aan ${refBook.owner_bieb_name}!`);
    renderBookshelfView();
  } catch (err) {
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#B45309;">⚠️ ${escapeHtml(err.message)}</span>`;
    }
  }
};

window.toggleInlineMiniBiebCamera = async function (refBookId) {
  const camBox = document.getElementById('inlineMiniBiebCameraBox');
  const videoEl = document.getElementById('inlineMiniBiebVideo');
  if (!camBox || !videoEl) return;

  if (AppState.inlineMiniBiebCameraStream) {
    AppState.inlineMiniBiebCameraStream.getTracks().forEach((t) => t.stop());
    AppState.inlineMiniBiebCameraStream = null;
    camBox.style.display = 'none';
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showAppAlert('Camera niet beschikbaar in deze browser. Typ het ISBN hierboven in.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    AppState.inlineMiniBiebCameraStream = stream;
    videoEl.srcObject = stream;
    camBox.style.display = 'block';

    if ('BarcodeDetector' in window) {
      const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8'] });
      let lastCode = '';
      let lastTime = 0;
      const scanLoop = async () => {
        if (!AppState.inlineMiniBiebCameraStream) return;
        try {
          const barcodes = await detector.detect(videoEl);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            const now = Date.now();
            if (code !== lastCode || now - lastTime > 3000) {
              lastCode = code;
              lastTime = now;
              window.handleInlineMiniBiebDropoffScan(refBookId, code);
            }
          }
        } catch {}
        requestAnimationFrame(scanLoop);
      };
      requestAnimationFrame(scanLoop);
    }
  } catch (err) {
    showAppAlert('Kon camera niet openen: ' + err.message);
  }
};

window.handleBookRequestAndWhatsApp = function (bookId, handoverMode, channel = 'whatsapp') {
  const books = window.BuurtBiebDB.getBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) return;
  const user = window.BuurtBiebDB.getCurrentUser();
  if (user && book.owner_id === user.id) {
    showToast('Dit is jouw eigen boek op de plank — je kunt je eigen boek niet aanvragen.');
    return;
  }

  // Eerst een voorbeeld laten zien: pas na bevestiging wordt het boek aangevraagd en het bericht geopend
  const finalMessage = confirmOutgoingMessage(buildRequestMessageText(book, handoverMode));
  if (finalMessage === null) return;

  try {
    window.BuurtBiebDB.reserveBook(bookId, handoverMode);
    const contactInfo = window.BuurtBiebDB.getOwnerContactInfo(book);
    const phone = String(contactInfo.whatsapp_number || '31612345678').replace(/[^0-9]/g, '');

    if (channel === 'email') {
      window.location.href = buildMailtoUrl(book, handoverMode, undefined, finalMessage);
    } else if (channel === 'signal') {
      window.open(`https://signal.me/#p/+${phone}`, '_blank', 'noopener,noreferrer');
    } else if (channel === 'sms') {
      const body = encodeURIComponent(finalMessage);
      window.location.href = `sms:+${phone}?body=${body}`;
    } else {
      const waUrl = buildWhatsAppUrl(book, handoverMode, undefined, finalMessage);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }

    showToast(
      handoverMode === 'ruilen_1op1'
        ? '1-op-1 ruilafspraak klaargezet!'
        : 'Aanvraag gestart & bericht geopend!'
    );

    renderHeaderStatus();
    renderOnboardingBanner();
    renderBookshelfView();
    window.openBookDetailModal(bookId);
  } catch (err) {
    showAppAlert(err.message);
  }
};

// ============================================================================
// TAB 2: BOEK TOEVOEGEN & ISBN SCANNER / LOOKUP + DE 3 STICKERS
// ============================================================================
window.handleIsbnLookup = async function (presetIsbn) {
  const inputEl = document.getElementById('isbnInput');
  if (presetIsbn && inputEl) {
    inputEl.value = presetIsbn;
  }
  const rawSearchInput = inputEl ? inputEl.value.trim() : '';
  const titleFieldVal = document.getElementById('bookTitleInput')?.value.trim() || '';
  const authorFieldVal = document.getElementById('bookAuthorInput')?.value.trim() || '';
  const fallbackTitleQuery = [titleFieldVal, authorFieldVal].filter(Boolean).join(' ');
  const lookupQuery = rawSearchInput || fallbackTitleQuery;

  const statusEl = document.getElementById('isbnLookupStatus');
  const isQuickBatch = Boolean(document.getElementById('quickBatchScanCheckbox')?.checked);

  if (statusEl) {
    statusEl.innerHTML = `<span style="color:var(--accent-green);">⏳ Boekgegevens &amp; kaft ophalen via Google Books &amp; Open Library...</span>`;
  }

  try {
    const bookData = await window.IsbnService.lookupByIsbn(lookupQuery);
    const cleanedCandidate = window.IsbnService.cleanIsbn(lookupQuery);
    const queryWasIsbn =
      /^[0-9Xx\s-]+$/.test(lookupQuery) &&
      (cleanedCandidate.length === 10 || cleanedCandidate.length === 13);

    // Als "⚡ MiniBieb Snel-Scan" aanstaat, zetten we het boek direct achter elkaar op de plank!
    if (isQuickBatch) {
      const user = window.BuurtBiebDB.getCurrentUser();
      if (!user || user.needsOnboarding) {
        openAuthModal();
        return;
      }

      const hasBox = Boolean(user.has_physical_box);
      const batchTarget = hasBox
        ? document.getElementById('quickBatchTargetSelect')?.value || 'minibieb'
        : 'binnenplank';
      const selfServiceChecked = hasBox && batchTarget === 'minibieb';
      const { book: addedBook } = window.BuurtBiebDB.addBook({
        isbn: bookData.isbn || (queryWasIsbn ? cleanedCandidate : ''),
        title: bookData.title || 'Onbekende titel',
        author: bookData.author || 'Onbekende auteur',
        genre: bookData.genre || 'Literatuur & Roman',
        cover_url: bookData.cover_url || '',
        description: bookData.description || '',
        sticker_type: 'zwerfboek',
        pickup_possible: !selfServiceChecked,
        self_service_box: selfServiceChecked,
        shipping_possible: false
      });

      if (!AppState.batchScannedBooks) AppState.batchScannedBooks = [];
      AppState.batchScannedBooks.unshift(addedBook);
      renderBatchScanList();

      if (inputEl) {
        inputEl.value = '';
        inputEl.focus();
      }
      if (statusEl) {
        statusEl.innerHTML = `<span style="color:#1B5E20; font-weight:700;">⚡ Direct toegevoegd aan jouw ${selfServiceChecked ? 'MiniBieb' : 'Boekenplank'}: "${escapeHtml(addedBook.title)}" — Scan of typ nu het volgende boek!</span>`;
      }
      showToast(`⚡ Direct toegevoegd: "${addedBook.title}"`);
      renderBookshelfView();
      return;
    }

    if (inputEl && !queryWasIsbn) {
      inputEl.value = bookData.isbn || '';
    }
    document.getElementById('bookTitleInput').value = bookData.title || '';
    document.getElementById('bookAuthorInput').value = bookData.author || '';
    document.getElementById('bookCoverInput').value = bookData.cover_url || '';
    const genreSelectEl = document.getElementById('bookGenreInput');
    if (genreSelectEl && bookData.genre) {
      genreSelectEl.value = bookData.genre;
    }
    if (bookData.description && !document.getElementById('bookDescInput').value) {
      document.getElementById('bookDescInput').value = bookData.description;
    }
    updateCoverPreview(bookData.cover_url, bookData.title);

    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#1B5E20; font-weight:700;">✅ Gevonden via ${escapeHtml(bookData.source)}: "${escapeHtml(bookData.title)}" — ${escapeHtml(bookData.author)}</span>`;
    }
    showToast(`Boek gevonden: ${bookData.title}`);
  } catch (err) {
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#B45309;">⚠️ ${escapeHtml(err.message)}</span>`;
    }
  }
};

function renderBatchScanList() {
  const box = document.getElementById('batchScanListContainer');
  if (!box) return;
  const list = (AppState.batchScannedBooks || []).filter((b) =>
    window.BuurtBiebDB.getBooks().some((existing) => existing.id === b.id)
  );
  AppState.batchScannedBooks = list;

  if (list.length === 0) {
    box.style.display = 'none';
    box.innerHTML = '';
    return;
  }

  box.style.display = 'block';
  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
      <strong style="font-size:0.84rem; color:#065F46;">✅ Zojuist achter elkaar gescand (${list.length} ${list.length === 1 ? 'boek' : 'boeken'}):</strong>
      <button type="button" class="btn btn-outline btn-sm" style="padding:0.2rem 0.6rem; font-size:0.75rem;" onclick="switchTab('plank')">
        📚 Bekijk op de plank
      </button>
    </div>
    <div style="display:grid; gap:0.4rem;">
      ${list
        .map(
          (b) => `
          <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; background:#FFF; border:1px solid #A7F3D0; border-radius:8px; padding:0.4rem 0.65rem; font-size:0.82rem;">
            <span style="min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              🟢 <strong>${escapeHtml(b.title)}</strong> — ${escapeHtml(b.author)}
            </span>
            <button type="button" class="btn btn-outline btn-sm" style="padding:0.15rem 0.45rem; font-size:0.72rem; color:#B91C1C; border-color:#FCA5A5; flex-shrink:0;" onclick="handleDeleteBook('${b.id}'); renderBatchScanList();">
              🗑️ Ongedaan maken
            </button>
          </div>
        `
        )
        .join('')}
    </div>
  `;
}

function updateCoverPreview(url, title) {
  const previewEl = document.getElementById('addBookCoverPreview');
  if (!previewEl) return;
  if (url) {
    previewEl.innerHTML = `<img src="${escapeHtml(url)}" alt="${escapeHtml(title || 'Boekkaft')}" data-fallback-title="Geen kaft" onload="handleBookCoverLoad(this)" onerror="handleBookCoverError(this)" />`;
  } else {
    previewEl.innerHTML = `<span>📚<br>Kaft preview</span>`;
  }
}

window.selectStickerInForm = function (stickerType) {
  AppState.selectedStickerInForm = stickerType;
  document.querySelectorAll('.sticker-option-card').forEach((card) => {
    card.classList.toggle('selected', card.getAttribute('data-sticker') === stickerType);
  });

  const priceRow = document.getElementById('koopboekPriceRow');
  const mpRow = document.getElementById('marktplaatsOptionsRow');
  const leenboekInfoRow = document.getElementById('leenboekNeighborNotice');
  if (priceRow) {
    priceRow.style.display = stickerType === 'koopboek' ? 'block' : 'none';
  }
  if (mpRow) {
    mpRow.style.display = stickerType === 'marktplaats' ? 'block' : 'none';
  }
  if (leenboekInfoRow) {
    leenboekInfoRow.style.display = stickerType === 'leenboek' ? 'block' : 'none';
  }

  // Alleen gebruikers die in hun profiel hebben opgegeven dat ze een fysieke MiniBieb hebben (hasBox === true)
  // krijgen de keuze tussen '🏡 In fysieke MiniBieb' en '📚 Binnen op Digitale Plank'.
  const user = window.BuurtBiebDB.getCurrentUser();
  const hasBox = Boolean(user && !user.needsOnboarding && user.has_physical_box);
  const toggleRow = document.getElementById('placementModeToggleRow');
  const step3Label = document.getElementById('step3PlacementLabel');
  if (toggleRow) {
    toggleRow.style.display = hasBox ? 'grid' : 'none';
  }
  if (step3Label) {
    step3Label.textContent = hasBox
      ? '📍 Stap 3: Waar leg je dit boek neer? *'
      : '📦 Stap 3: Hoe kan dit boek worden overgedragen? *';
  }

  // Synchroniseer ook de Snel-Scan dropdown bovenaan op basis van hasBox
  const quickBatchCb = document.getElementById('quickBatchScanCheckbox');
  if (quickBatchCb) {
    window.handleQuickBatchScanToggle(quickBatchCb.checked);
  }

  if (!hasBox || stickerType === 'marktplaats') {
    window.handleBookPlacementModeChange('binnenplank');
    if (stickerType === 'marktplaats') {
      const shippingEl = document.getElementById('shippingCheckbox');
      if (shippingEl) shippingEl.checked = true;
    }
  } else {
    window.handleBookPlacementModeChange('minibieb');
  }
};

window.handleQuickBatchScanToggle = function (isChecked) {
  const user = window.BuurtBiebDB.getCurrentUser();
  const hasBox = Boolean(user && !user.needsOnboarding && user.has_physical_box);
  const sel = document.getElementById('quickBatchTargetSelect');
  const hint = document.getElementById('quickBatchScanHintText');
  if (sel) {
    sel.style.display = isChecked && hasBox ? 'inline-block' : 'none';
    if (!hasBox) sel.value = 'binnenplank';
  }
  if (hint) {
    hint.innerHTML = hasBox
      ? '💡 <strong>Vrijblijvend snel scannen:</strong> Zet <em>⚡ Snel-Scan</em> aan en kies of je de boeken <strong>🏡 buiten in de fysieke MiniBieb</strong> legt of <strong>📚 binnen op je digitale plank</strong> zet.'
      : '💡 <strong>Vrijblijvend snel scannen:</strong> Zet <em>⚡ Snel-Scan</em> aan om met je camera achter elkaar meerdere boeken direct op je digitale plank te zetten.';
  }
};

window.handleBookPlacementModeChange = function (mode) {
  const user = window.BuurtBiebDB.getCurrentUser();
  const hasBox = Boolean(user && !user.needsOnboarding && user.has_physical_box);
  const isMiniBieb = hasBox && mode === 'minibieb';
  const radioIndoor = document.getElementById('placementRadioIndoor');
  const radioMiniBieb = document.getElementById('placementRadioMiniBieb');
  const indoorOptionsBox = document.getElementById('indoorHandoverOptionsBox');
  const selfServiceEl = document.getElementById('selfServiceCheckbox');
  const pickupEl = document.getElementById('pickupCheckbox');
  const hintEl = document.getElementById('selfServiceFormHint');

  if (radioIndoor) radioIndoor.checked = !isMiniBieb;
  if (radioMiniBieb) radioMiniBieb.checked = isMiniBieb;
  if (selfServiceEl) selfServiceEl.checked = isMiniBieb;

  if (indoorOptionsBox) {
    indoorOptionsBox.style.display = isMiniBieb ? 'none' : 'block';
  }
  if (isMiniBieb && pickupEl) {
    pickupEl.checked = false;
  } else if (!isMiniBieb && pickupEl && !document.getElementById('shippingCheckbox')?.checked) {
    pickupEl.checked = true;
  }

  if (hintEl) {
    hintEl.textContent = isMiniBieb
      ? '🏡 Dit boek ligt buiten in jouw fysieke MiniBieb: voorbijgangers kunnen het vrij pakken zonder afspraak.'
      : '📚 Dit boek staat binnen op je digitale plank: buren spreken via de chat met je af om het op te halen of te laten opsturen.';
  }
};

window.handleDepositTypeChange = function (val) {
  AppState.selectedDepositTypeInForm = val;
  const amountBox = document.getElementById('depositAmountContainer');
  if (amountBox) {
    amountBox.style.display = val === 'bedrag' ? 'block' : 'none';
  }
};

window.handleAddBookSubmit = function (event) {
  event.preventDefault();
  const user = window.BuurtBiebDB.getCurrentUser();
  if (!user) {
    openAuthModal();
    return;
  }
  if (user.needsOnboarding) {
    openOnboardingModal();
    return;
  }

  const isbn = document.getElementById('isbnInput').value.trim();
  const title = document.getElementById('bookTitleInput').value.trim();
  const author = document.getElementById('bookAuthorInput').value.trim();
  const genre = document.getElementById('bookGenreInput')?.value || 'Literatuur & Roman';
  const book_language = document.getElementById('bookLanguageInput')?.value || 'nl';
  const cover_url = sanitizeImageUrl(document.getElementById('bookCoverInput').value.trim());
  const description = document.getElementById('bookDescInput').value.trim();
  const isMarktplaats = AppState.selectedStickerInForm === 'marktplaats';
  const price_eur = isMarktplaats
    ? document.getElementById('mpPriceInput').value
    : document.getElementById('bookPriceInput').value;
  const book_condition = isMarktplaats ? document.getElementById('mpConditionInput').value : 'goed';
  const market_category = genre;
  const allow_bidding = isMarktplaats ? document.getElementById('mpAllowBiddingCheckbox').checked : false;

  const pickup_possible = document.getElementById('pickupCheckbox')
    ? document.getElementById('pickupCheckbox').checked
    : true;
  const self_service_box = document.getElementById('selfServiceCheckbox').checked;
  const shipping_possible = document.getElementById('shippingCheckbox').checked;

  if (!pickup_possible && !self_service_box && !shipping_possible) {
    showAppAlert('Vink bij Stap 3 minimaal één overdrachtoptie aan (bijv. 1-op-1 ophalen, verzenden per post of plaatsen in je MiniBieb).');
    return;
  }

  const deposit_type = document.getElementById('depositTypeSelect').value;
  const deposit_amount_eur = document.getElementById('depositAmountRange').value;

  const { book } = window.BuurtBiebDB.addBook({
    isbn,
    title,
    author,
    genre,
    book_language,
    cover_url,
    description,
    sticker_type: AppState.selectedStickerInForm,
    price_eur,
    book_condition,
    market_category,
    allow_bidding,
    pickup_possible,
    self_service_box,
    shipping_possible,
    deposit_type,
    deposit_amount_eur
  });

  // Reset form
  document.getElementById('addBookForm').reset();
  updateCoverPreview('', '');
  document.getElementById('isbnLookupStatus').innerHTML = '';

  const isFreeShare = book.sticker_type === 'zwerfboek' || book.sticker_type === 'leenboek';
  showToast(
    isFreeShare
      ? `🎉 "${book.title}" staat nu op je boekenplank!`
      : `🎉 "${book.title}" is te koop gezet op je boekenplank!`
  );
  renderHeaderStatus();
  renderOnboardingBanner();
  renderMarketplaceView();
  switchTab(isMarktplaats ? 'marktplaats' : 'plank');
};

// Camera Barcode Scanner voor ISBN
function stopCameraBarcodeScanner() {
  const scannerBox = document.getElementById('cameraScannerContainer');
  if (AppState.cameraStream) {
    AppState.cameraStream.getTracks().forEach((t) => t.stop());
    AppState.cameraStream = null;
  }
  if (scannerBox) scannerBox.style.display = 'none';
}

window.toggleCameraBarcodeScanner = async function () {
  const scannerBox = document.getElementById('cameraScannerContainer');
  const videoEl = document.getElementById('barcodeVideo');

  if (AppState.cameraStream) {
    stopCameraBarcodeScanner();
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showAppAlert('Camera niet beschikbaar in deze browser. Vul hieronder handmatig het ISBN of de titel van het boek in.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    AppState.cameraStream = stream;
    videoEl.srcObject = stream;
    scannerBox.style.display = 'block';

    if ('BarcodeDetector' in window) {
      const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8'] });
      let lastScannedCode = '';
      let lastScannedAt = 0;
      let lookupInFlight = false;
      const scanLoop = async () => {
        if (!AppState.cameraStream) return;
        try {
          if (!lookupInFlight) {
            const barcodes = await detector.detect(videoEl);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              const now = Date.now();
              const isQuickBatch = Boolean(document.getElementById('quickBatchScanCheckbox')?.checked);
              if (isQuickBatch) {
                if (code !== lastScannedCode || now - lastScannedAt > 3000) {
                  lastScannedCode = code;
                  lastScannedAt = now;
                  lookupInFlight = true;
                  Promise.resolve(window.handleIsbnLookup(code)).finally(() => {
                    lookupInFlight = false;
                  });
                }
              } else {
                stopCameraBarcodeScanner();
                window.handleIsbnLookup(code);
                return;
              }
            }
          }
        } catch {}
        setTimeout(() => {
          if (AppState.cameraStream) requestAnimationFrame(scanLoop);
        }, 300);
      };
      requestAnimationFrame(scanLoop);
    }
  } catch (err) {
    showAppAlert('Kon camera niet openen: ' + err.message + '. Vul hieronder handmatig het ISBN of de titel van het boek in.');
  }
};

// ============================================================================
// BOEKEN-MARKTPLAATS WEERGAVE (VOOR NIEUWERE & DUURDERE BOEKEN)
// ============================================================================
window.renderMarketplaceView = function () {
  const container = document.getElementById('marketplaceGridContainer');
  if (!container) return;

  const q = (document.getElementById('mpSearchInput')?.value || '').trim().toLowerCase();
  const catFilter = document.getElementById('mpCategorySelect')?.value || 'alle';
  const condFilter = document.getElementById('mpConditionSelect')?.value || 'alle';
  const mpSort = document.getElementById('mpSortSelect')?.value || 'prijs_laag';
  const mpDistVal = document.getElementById('mpDistanceSelect')?.value || 'alle';
  const mpMaxKm = mpDistVal !== 'alle' ? Number(mpDistVal) : null;
  const user = window.BuurtBiebDB.getCurrentUser();
  const mpRefCoords = getReferenceCoordsForDistance(user, '');
  const refPostalNum = parseInt((user && user.postal_code_4) || '3512', 10);

  // Toon alle beschikbare 'marktplaats' boeken (en eventueel 'koopboek' als iemand zoekt)
  const allBooks = window.BuurtBiebDB.getBooks();
  const mpBooks = allBooks.filter((b) => {
    if (user && !user.needsOnboarding && b.owner_id === user.id) return false;
    if (b.status && b.status !== 'beschikbaar') return false;
    if (b.sticker_type !== 'marktplaats' && b.sticker_type !== 'koopboek') return false;
    if (mpMaxKm && mpRefCoords) {
      const km = getBookApproxDistanceKm(b, mpRefCoords);
      if (km === null || km > mpMaxKm) return false;
    }
    const bookGenre = getBookGenre(b);
    if (q) {
      const hay = `${b.title} ${b.author} ${b.description} ${b.city} ${b.postal_code_4} ${bookGenre}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (catFilter !== 'alle' && bookGenre !== catFilter) return false;
    if (condFilter !== 'alle' && (b.book_condition || 'goed') !== condFilter) return false;
    return true;
  });

  // Sorteer op basis van de gekozen Marktplaats-sortering
  mpBooks.sort((a, b) => {
    if (mpSort === 'prijs_laag') return Number(a.price_eur || 0) - Number(b.price_eur || 0);
    if (mpSort === 'prijs_hoog') return Number(b.price_eur || 0) - Number(a.price_eur || 0);
    if (mpSort === 'dichtbij') {
      const distA = Math.abs(parseInt(a.postal_code_4 || '9999', 10) - refPostalNum);
      const distB = Math.abs(parseInt(b.postal_code_4 || '9999', 10) - refPostalNum);
      return distA - distB;
    }
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  if (mpBooks.length === 0) {
    container.innerHTML = `
      <div class="section-card" style="grid-column: 1 / -1; text-align:center; padding:2.2rem;">
        <div style="font-size:2.4rem; margin-bottom:0.4rem;">🛍️</div>
        <h3 class="serif-heading">Geen Boekenbeurs-boeken gevonden voor dit filter</h3>
        <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.3rem;">
          Heb je zelf een recent gelezen bestseller, kookboek of studieboek liggen? Zet hem op de Boekenbeurs!
        </p>
      </div>
    `;
    applyDynamicTranslationIfNeeded(container);
    return;
  }

  const mpVisibleCount = AppState.mpVisibleCount || 6;
  const visibleMpBooks = mpBooks.slice(0, mpVisibleCount);
  const remainingMp = Math.max(0, mpBooks.length - visibleMpBooks.length);

  container.innerHTML = visibleMpBooks
    .map((book) => {
      const priceStr = Number(book.price_eur || 0).toFixed(2).replace('.', ',');
      const condLabel = CONDITION_LABELS[book.book_condition || 'als_nieuw'] || '✨ Als nieuw';
      const suggestedBid = Math.max(4, (Number(book.price_eur || 10) * 0.85)).toFixed(0);
      const contactInfo = window.BuurtBiebDB.getOwnerContactInfo(book);
      const isOwnBook = Boolean(user && book.owner_id === user.id);

      return `
        <article class="marketplace-card">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.75rem;">
              <div style="display:flex; align-items:center; gap:0.35rem; flex-wrap:wrap;">
                <span class="mp-condition-badge">${escapeHtml(condLabel)}</span>
                ${renderGenreBadge(book)}
                ${renderBookLanguageBadge(book, true)}
              </div>
              <span class="mp-price-tag">€ ${priceStr}</span>
            </div>

            <div class="book-top-row" onclick="openBookDetailModal('${book.id}')" style="cursor:pointer;">
              <div class="book-cover-3d" style="width:82px; height:122px;">
                ${
                  book.cover_url
                    ? `<img src="${escapeHtml(book.cover_url)}" alt="${escapeHtml(book.title)}" data-book-id="${escapeHtml(book.id)}" data-book-author="${escapeHtml(book.author || '')}" data-fallback-title="${escapeHtml(book.title.slice(0, 20))}" onload="handleBookCoverLoad(this)" onerror="handleBookCoverError(this)" />`
                    : `<span>📚<br>${escapeHtml(book.title.slice(0, 20))}</span>`
                }
              </div>
              <div class="book-meta">
                <h3 class="book-title" style="font-size:1.05rem;">${escapeHtml(book.title)}</h3>
                <div class="book-author">${escapeHtml(book.author)}</div>
                <p style="font-size:0.78rem; color:var(--text-muted); margin-top:0.25rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                  ${escapeHtml(book.description || '')}
                </p>
                <div class="book-location-box" style="margin-top:0.35rem;">
                  <span class="book-location-city">📍 ${escapeHtml(formatLocationLabel(book.postal_code_4, book.city))}</span>
                  <span class="book-location-bieb">${book.self_service_box ? '🏡' : '📚'} ${escapeHtml(book.owner_bieb_name)}</span>
                  ${renderContactMethodsBadges(contactInfo.methods)}
                </div>
              </div>
            </div>
          </div>

          <div style="border-top:1px dashed var(--border-warm); padding-top:0.75rem; display:grid; gap:0.55rem;">
            ${
              isOwnBook
                ? `
                  <div style="display:flex; gap:0.45rem; flex-wrap:wrap; align-items:center; justify-content:space-between;">
                    <span class="sticker-badge" style="background:#ECFDF5; color:#065F46; border:1px solid #6EE7B7;">📚 Jouw aangeboden boek</span>
                    <button type="button" class="btn btn-outline btn-sm" onclick="openBookDetailModal('${book.id}')">
                      ⚙️ Beheren
                    </button>
                  </div>
                `
                : `
                  <div style="display:flex; gap:0.45rem; flex-wrap:wrap;">
                    <button type="button" class="btn btn-primary btn-sm" style="flex:1;" onclick="handleStartInAppChatForBook('${book.id}', 'aan_de_deur_1op1', false)">
                      💬 Koop / Stuur bericht
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" onclick="openBookDetailModal('${book.id}')">
                      🔍 Details
                    </button>
                  </div>
                  ${
                    book.allow_bidding
                      ? `
                        <div style="display:flex; align-items:center; gap:0.4rem; background:var(--bg-cream); padding:0.4rem 0.55rem; border-radius:8px; border:1px solid var(--border-warm); flex-wrap:wrap;">
                          <span style="font-size:0.74rem; font-weight:700; color:#5B216E; white-space:nowrap;">🏷️ Bieden: €</span>
                          <input type="number" id="mpBid_${book.id}" class="input-field" style="padding:0.28rem 0.5rem; font-size:0.8rem; background:#FFF; width:74px;" min="1" max="150" step="0.50" value="${suggestedBid}" />
                          <button type="button" class="btn btn-outline btn-sm" style="padding:0.28rem 0.6rem; font-size:0.75rem; flex:1;" onclick="handlePlaceBidInAppChat('${book.id}', 'mpBid_${book.id}')">
                            💬 Bied in Chat
                          </button>
                        </div>
                      `
                      : `<div style="font-size:0.73rem; color:var(--text-muted); text-align:center;">🔒 Vaste prijs · Ophalen aan de deur of verzending per post</div>`
                  }
                `
            }
          </div>
        </article>
      `;
    })
    .join('');
  const mpLoadMoreEl = document.getElementById('marketplaceLoadMoreBar');
  if (mpLoadMoreEl) {
    mpLoadMoreEl.innerHTML =
      mpBooks.length > 0
        ? `
          <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.5rem;">
            ${tr(`Toont ${visibleMpBooks.length} van ${mpBooks.length} boeken`, `Showing ${visibleMpBooks.length} of ${mpBooks.length} books`)}
          </div>
          ${
            remainingMp > 0
              ? `<button type="button" class="btn btn-outline btn-sm" onclick="loadMoreMarketplaceBooks()">+ ${tr('Meer boeken laden', 'Load more books')} (${remainingMp})</button>`
              : ''
          }
        `
        : '';
  }
  applyDynamicTranslationIfNeeded(container);
};

window.loadMoreMarketplaceBooks = function () {
  AppState.mpVisibleCount = (AppState.mpVisibleCount || 6) + 6;
  renderMarketplaceView();
};

window.handlePlaceBidViaWhatsApp = function (bookId, inputElementId) {
  const books = window.BuurtBiebDB.getBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) return;
  const user = window.BuurtBiebDB.getCurrentUser();
  if (user && book.owner_id === user.id) {
    showToast('Dit is jouw eigen boek — je kunt geen bod doen op je eigen aanbod.');
    return;
  }
  const bidInput = document.getElementById(inputElementId);
  const bidAmount = bidInput ? Number(bidInput.value) : 0;
  if (!bidAmount || bidAmount <= 0) {
    showAppAlert('Vul een geldig bod in euro’s in.');
    return;
  }
  const handoverModeForBid = book.shipping_possible ? 'post_brievenbus' : 'aan_de_deur_1op1';
  const finalBidMessage = confirmOutgoingMessage(
    buildRequestMessageText(book, handoverModeForBid, bidAmount)
  );
  if (finalBidMessage === null) return;
  const url = buildWhatsAppUrl(book, handoverModeForBid, bidAmount, finalBidMessage);
  window.open(url, '_blank', 'noopener,noreferrer');
  showToast(`🏷️ Je bod van € ${bidAmount.toFixed(2).replace('.', ',')} is geopend in WhatsApp!`);
};

window.handlePlaceBidInAppChat = function (bookId, inputElementId) {
  const user = window.BuurtBiebDB.getCurrentUser();
  if (!user) {
    showToast('Log eerst in om een bod te doen via de BuurtChat.');
    openAuthModal();
    return;
  }
  if (user.needsOnboarding) {
    openOnboardingModal();
    return;
  }
  const books = window.BuurtBiebDB.getBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) return;
  if (book.owner_id === user.id) {
    showToast('Dit is jouw eigen boek — je kunt geen bod doen op je eigen aanbod.');
    return;
  }
  const bidInput = document.getElementById(inputElementId);
  const bidAmount = bidInput ? Number(bidInput.value) : 0;
  if (!bidAmount || bidAmount <= 0) {
    showAppAlert('Vul een geldig bod in euro’s in.');
    return;
  }
  const handoverMode = book.shipping_possible ? 'post_brievenbus' : 'aan_de_deur_1op1';
  const draftText = buildRequestMessageText(book, handoverMode, bidAmount);
  const conv = window.BuurtBiebDB.startOrOpenBookChat({ book, handoverMode });
  AppState.activeConversationId = conv.id;
  AppState.chatViewMode = 'thread';
  AppState.chatDraft = { convId: conv.id, text: draftText };
  closeBookDetailModal();
  showToast(`✏️ Je bod van € ${bidAmount.toFixed(2).replace('.', ',')} staat klaar als voorbeeldbericht — pas aan en druk op Verstuur.`);
  switchTab('chat');
};

window.handleStartInAppChatForBook = function (bookId, handoverMode, isReservation) {
  const user = window.BuurtBiebDB.getCurrentUser();
  if (!user) {
    closeBookDetailModal();
    showToast('Log eerst even in om met deze aanbieder te chatten of een boek aan te vragen.');
    openAuthModal();
    return;
  }
  if (user.needsOnboarding) {
    closeBookDetailModal();
    openOnboardingModal();
    return;
  }

  const books = window.BuurtBiebDB.getBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) return;
  if (book.owner_id === user.id) {
    closeBookDetailModal();
    showToast('Dit is jouw eigen boek op de plank — je kunt geen chat met jezelf starten.');
    return;
  }

  // Er wordt NIETS automatisch verstuurd: we openen de chat met een voorbeeldbericht dat je zelf kunt aanpassen.
  // De aanvraag/reservering wordt pas vastgelegd zodra je het bericht daadwerkelijk verstuurt.
  const conv = window.BuurtBiebDB.startOrOpenBookChat({ book, handoverMode });

  AppState.activeConversationId = conv.id;
  AppState.chatViewMode = 'thread';
  AppState.chatDraft = { convId: conv.id, text: buildRequestMessageText(book, handoverMode) };
  AppState.pendingReservation = isReservation ? { convId: conv.id, bookId, handoverMode } : null;
  closeBookDetailModal();
  showToast(`✏️ Chat met ${book.owner_bieb_name} geopend — controleer of pas je bericht aan en druk op Verstuur.`);
  switchTab('chat');
};

// ============================================================================
// TAB 2B: IN-APP BUURTCHAT RENDERER & HANDLERS
// ============================================================================
function formatChatDateLabel(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, now)) return tr('Vandaag', 'Today');
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return tr('Gisteren', 'Yesterday');
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

function formatChatListTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

function renderChatTab() {
  const container = document.getElementById('chatTabContent');
  if (!container) return;

  const conversations = window.BuurtBiebDB.getConversations();
  const user = window.BuurtBiebDB.getCurrentUser();
  const currentUserId = user && !user.needsOnboarding ? user.id : 'guest-reader';

  if (conversations.length === 0) {
    container.innerHTML = `
      <div class="section-card" style="text-align:center; padding:2.5rem 1.5rem;">
        <div style="font-size:2.6rem; margin-bottom:0.5rem;">💬</div>
        <h3 class="serif-heading">Nog geen actieve gesprekken in je BuurtChat</h3>
        <p style="color:var(--text-muted); font-size:0.9rem; max-width:480px; margin:0.35rem auto 1.2rem;">
          Klik bij een boek op de houten plank of op de Boekenbeurs op <strong>"💬 Aanvragen via Chat"</strong> om direct met je buur af te spreken!
        </p>
        <button class="btn btn-primary" onclick="switchTab('plank')">📚 Bekijk Boeken op de Plank</button>
      </div>
    `;
    applyDynamicTranslationIfNeeded(container);
    updateUnreadChatBadges();
    return;
  }

  if (!AppState.activeConversationId || !conversations.some((c) => c.id === AppState.activeConversationId)) {
    AppState.activeConversationId = conversations[0].id;
  }

  window.BuurtBiebDB.markConversationRead(AppState.activeConversationId);
  updateUnreadChatBadges();

  const activeConv = conversations.find((c) => c.id === AppState.activeConversationId);
  const messages = window.BuurtBiebDB.getMessagesForConversation(activeConv.id);
  const activeBook = window.BuurtBiebDB.getBooks().find((b) => b.id === activeConv.book_id);
  const activeIsOwner = activeConv.owner_id === currentUserId;
  const activePartnerName = activeIsOwner
    ? (activeConv.requester_bieb_name || 'Buurtgenoot')
    : (activeConv.owner_bieb_name || 'Buurtgenoot');
  const activeLocationText =
    !activeIsOwner && (activeConv.owner_postal || activeConv.owner_city)
      ? ` · ${escapeHtml(activeConv.owner_postal || '')} ${escapeHtml(activeConv.owner_city || '')}`
      : '';

  const sidebarItemsHtml = conversations
    .map((c) => {
      const msgs = window.BuurtBiebDB.getMessagesForConversation(c.id);
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
      const unreadCount = msgs.filter((m) => !m.is_read && m.sender_id !== currentUserId).length;
      const isSelected = c.id === AppState.activeConversationId;
      const isOwner = c.owner_id === currentUserId;
      const partnerName = isOwner
        ? (c.requester_bieb_name || 'Buurtgenoot')
        : (c.owner_bieb_name || 'Buurtgenoot');
      const partnerRoleLabel = isOwner
        ? `👤 ${escapeHtml(partnerName)}`
        : `🏡 ${escapeHtml(partnerName)}${c.owner_postal ? ` (${escapeHtml(c.owner_postal)})` : ''}`;
      const listTime = formatChatListTime(lastMsg ? lastMsg.created_at : c.updated_at);

      const safeConvCover = sanitizeImageUrl(c.book_cover);
      return `
        <div class="chat-conv-item ${isSelected ? 'active' : ''}" tabindex="0" role="button" data-action="open-chat" data-conv-id="${escapeHtml(c.id)}">
          <div class="book-cover-3d" style="width:40px; height:58px; font-size:0.6rem; flex-shrink:0;">
            ${
              safeConvCover
                ? `<img src="${escapeHtml(safeConvCover)}" alt="${escapeHtml(c.book_title)}" data-fallback-title="" onload="handleBookCoverLoad(this)" onerror="handleBookCoverError(this)" />`
                : `<span>📚</span>`
            }
          </div>
          <div style="flex:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.35rem;">
              <strong style="font-size:0.86rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${escapeHtml(c.book_title)}
              </strong>
              <span style="font-size:0.68rem; color:var(--text-muted); flex-shrink:0;">${escapeHtml(listTime)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.35rem; margin-top:0.1rem;">
              <span style="font-size:0.74rem; color:var(--accent-green); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${partnerRoleLabel}
              </span>
              ${unreadCount > 0 ? `<span class="unread-counter-pill">${unreadCount}</span>` : ''}
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:0.18rem;">
              ${lastMsg ? escapeHtml(lastMsg.body) : 'Nieuw gesprek…'}
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  let lastDateKey = '';
  const bubblesHtml =
    messages.length > 0
      ? messages
          .map((m) => {
            const isMine = m.sender_id === currentUserId;
            const dObj = new Date(m.created_at);
            const dateKey = Number.isNaN(dObj.getTime()) ? '' : dObj.toISOString().slice(0, 10);
            let dateDividerHtml = '';
            if (dateKey && dateKey !== lastDateKey) {
              lastDateKey = dateKey;
              dateDividerHtml = `<div class="chat-date-divider"><span>${escapeHtml(formatChatDateLabel(m.created_at))}</span></div>`;
            }
            const timeStr = Number.isNaN(dObj.getTime())
              ? ''
              : dObj.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
            const readTicks = isMine
              ? `<span class="chat-read-ticks ${m.is_read ? 'read' : ''}" title="${m.is_read ? 'Gelezen' : 'Verstuurd'}">${m.is_read ? '✓✓' : '✓'}</span>`
              : '';
            return `
              ${dateDividerHtml}
              <div class="chat-bubble-row ${isMine ? 'mine' : 'theirs'}">
                <div class="chat-bubble">
                  ${!isMine ? `<div class="chat-bubble-sender">${escapeHtml(m.sender_name)}</div>` : ''}
                  <div class="chat-bubble-text">${escapeHtml(m.body).replace(/\n/g, '<br>')}</div>
                  <div class="chat-bubble-meta">
                    <span>${timeStr}</span>
                    ${readTicks}
                  </div>
                </div>
              </div>
            `;
          })
          .join('')
      : `
      <div style="text-align:center; padding:2rem 1rem; color:var(--text-muted); font-size:0.86rem;">
        💬 Start hieronder je gesprek met <strong>${escapeHtml(activePartnerName)}</strong> over <em>"${escapeHtml(activeConv.book_title)}"</em>.
      </div>
    `;

  const modeClass =
    AppState.chatViewMode === 'list' ? 'list-only-mode' : 'single-thread-mode';
  const hasDraft = Boolean(
    AppState.chatDraft && AppState.chatDraft.convId === activeConv.id && AppState.chatDraft.text
  );
  const safeActiveCover = sanitizeImageUrl(activeConv.book_cover);

  container.innerHTML = `
    <div class="chat-workspace ${modeClass}">
      <aside class="chat-sidebar">
        <div class="chat-sidebar-header">
          <span>💬 BuurtChat</span>
          <span class="chat-count-pill">${conversations.length}</span>
        </div>
        <div class="chat-conv-list">
          ${sidebarItemsHtml}
        </div>
      </aside>

      <div class="chat-main-pane">
        <div class="chat-book-header">
          <div style="display:flex; align-items:center; gap:0.55rem; min-width:0; flex:1;">
            <button
              type="button"
              class="chat-mobile-back-btn"
              onclick="showChatConversationList()"
              aria-label="Terug naar gesprekken"
              title="Terug naar alle gesprekken (${conversations.length})"
            >
              ←
            </button>
            <div
              class="book-cover-3d"
              style="width:30px; height:42px; flex-shrink:0; cursor:pointer;"
              ${activeBook ? `data-action="open-book" data-book-id="${escapeHtml(activeBook.id)}"` : ''}
              title="${escapeHtml(activeConv.book_title)}"
            >
              ${
                safeActiveCover
                  ? `<img src="${escapeHtml(safeActiveCover)}" alt="${escapeHtml(activeConv.book_title)}" data-fallback-title="" onload="handleBookCoverLoad(this)" onerror="handleBookCoverError(this)" />`
                  : `<span>📚</span>`
              }
            </div>
            <div style="min-width:0; flex:1;">
              <div class="chat-header-partner">${escapeHtml(activePartnerName)}</div>
              <div class="chat-header-book" ${activeBook ? `data-action="open-book" data-book-id="${escapeHtml(activeBook.id)}" style="cursor:pointer;"` : ''}>
                ${escapeHtml(activeConv.book_title)}
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:0.35rem; flex-shrink:0;">
            ${
              !window.BuurtBiebDB.isLiveMode()
                ? `<button type="button" class="chat-header-icon-btn" onclick="simulateNeighborReply('${activeConv.id}')" title="Simuleer testreactie">🧪</button>`
                : ''
            }
            ${
              activeBook && activeBook.status === 'gereserveerd' && !activeBook.handover_confirmed && user && activeBook.owner_id !== user.id
                ? `<button type="button" class="btn btn-cream btn-sm" style="padding:0.3rem 0.6rem; min-height:34px; font-size:0.76rem;" onclick="handleConfirmBookHandover('${activeBook.id}')" title="Bevestig dat je het boek hebt ontvangen">📦 Ontvangen</button>`
                : ''
            }
            ${
              activeBook
                ? `<button type="button" class="chat-header-icon-btn" data-action="open-book" data-book-id="${escapeHtml(activeBook.id)}" aria-label="Boekdetails bekijken" title="Boekdetails bekijken">📖</button>`
                : ''
            }
          </div>
        </div>

        <div id="chatMessagesScrollBox" class="chat-messages-area">
          ${bubblesHtml}
        </div>

        ${
          hasDraft
            ? `
              <div class="chat-draft-banner">
                <span>✏️ <strong>Voorbeeldbericht</strong> — pas gerust aan en verstuur.</span>
                <button type="button" class="btn btn-outline btn-sm" style="padding:0.2rem 0.55rem; font-size:0.74rem; min-height:30px; flex-shrink:0;" onclick="clearChatDraft()">Wissen</button>
              </div>
            `
            : ''
        }

        <form class="chat-input-bar ${hasDraft ? 'has-draft' : ''}" onsubmit="handleSendChatMessage(event, '${activeConv.id}')">
          <textarea
            id="chatMessageInput"
            class="input-field chat-composer-input ${hasDraft ? 'is-draft' : ''}"
            rows="${hasDraft ? 6 : 1}"
            placeholder="Typ een bericht…"
            oninput="this.style.height='auto'; this.style.height=Math.min(this.scrollHeight, 180)+'px';"
            onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault(); this.form.requestSubmit();}"
            required
          >${hasDraft ? escapeHtml(AppState.chatDraft.text) : ''}</textarea>
          <button type="submit" class="chat-send-btn ${hasDraft ? 'has-draft-btn' : ''}" aria-label="Bericht versturen" title="Verstuur bericht">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" style="display:block; transform:translateX(1px);">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
            ${hasDraft ? `<span>${tr('Verstuur', 'Send')}</span>` : ''}
          </button>
        </form>
      </div>
    </div>
  `;

  applyDynamicTranslationIfNeeded(container);
  const scrollBox = document.getElementById('chatMessagesScrollBox');
  if (scrollBox) {
    scrollBox.scrollTop = scrollBox.scrollHeight;
  }
}

window.openChatConversation = function (convId) {
  const prevConvId = AppState.activeConversationId;
  if (prevConvId && prevConvId !== convId) {
    const removed = window.BuurtBiebDB.removeConversationIfEmpty(prevConvId);
    if (removed) {
      if (AppState.chatDraft && AppState.chatDraft.convId === prevConvId) AppState.chatDraft = null;
      if (AppState.pendingReservation && AppState.pendingReservation.convId === prevConvId) {
        AppState.pendingReservation = null;
      }
    }
  }
  AppState.activeConversationId = convId;
  AppState.chatViewMode = 'thread';
  pushAppHistoryState(`chat:${convId}`);
  window.BuurtBiebDB.markConversationRead(convId);
  renderChatTab();
};

window.showChatConversationList = function () {
  const prevConvId = AppState.activeConversationId;
  if (prevConvId) {
    const removed = window.BuurtBiebDB.removeConversationIfEmpty(prevConvId);
    if (removed) {
      if (AppState.chatDraft && AppState.chatDraft.convId === prevConvId) AppState.chatDraft = null;
      if (AppState.pendingReservation && AppState.pendingReservation.convId === prevConvId) AppState.pendingReservation = null;
      AppState.activeConversationId = null;
    }
  }
  AppState.chatViewMode = 'list';
  renderChatTab();
};

window.handleSendChatMessage = function (event, convId) {
  event.preventDefault();
  const inputEl = document.getElementById('chatMessageInput');
  if (!inputEl || !inputEl.value.trim()) return;
  window.triggerHaptic('medium');

  // Pas bij het daadwerkelijk versturen van het eerste bericht wordt het boek aangevraagd/gereserveerd
  const pending = AppState.pendingReservation;
  if (pending && pending.convId === convId) {
    try {
      window.BuurtBiebDB.reserveBook(pending.bookId, pending.handoverMode);
    } catch (err) {
      showAppAlert(err.message);
      return;
    }
    AppState.pendingReservation = null;
    showToast('📚 Je bericht is verstuurd en het boek is voor je aangevraagd!');
  }

  window.BuurtBiebDB.sendChatMessage(convId, inputEl.value);
  AppState.chatDraft = null;
  inputEl.value = '';
  renderChatTab();
  const nextInput = document.getElementById('chatMessageInput');
  if (nextInput && typeof nextInput.focus === 'function') nextInput.focus();
  renderBookshelfView({ shelfOnly: true });
};

window.fillQuickChatReply = function (text) {
  const inputEl = document.getElementById('chatMessageInput');
  if (!inputEl) return;
  inputEl.value = text;
  inputEl.rows = 2;
  inputEl.focus();
};

window.clearChatDraft = function () {
  AppState.chatDraft = null;
  renderChatTab();
  const inputEl = document.getElementById('chatMessageInput');
  if (inputEl) {
    inputEl.value = '';
    inputEl.rows = 2;
    inputEl.focus();
  }
  showToast('✏️ Voorbeeldbericht gewist — je kunt nu je eigen bericht typen.');
};

window.sendQuickChatReply = window.fillQuickChatReply;

window.simulateNeighborReply = function (convId) {
  if (window.BuurtBiebDB.isLiveMode()) return;
  const conversations = window.BuurtBiebDB.getConversations();
  const conv = conversations.find((c) => c.id === convId);
  if (!conv) return;
  const user = window.BuurtBiebDB.getCurrentUser();
  const isOwner = user && conv.owner_id === user.id;
  const partnerId = isOwner ? conv.requester_id : conv.owner_id;
  const partnerName = isOwner
    ? (conv.requester_bieb_name || 'Testbuur')
    : (conv.owner_bieb_name || 'Testbuur');
  window.BuurtBiebDB.sendChatMessage(
    convId,
    `Hoi! Testreactie voor "${conv.book_title}": ik leg het boek voor je klaar, wanneer wil je langskomen?`,
    { senderId: partnerId, senderName: partnerName }
  );
  renderChatTab();
  showToast('🧪 Gesimuleerde testreactie ontvangen.');
};

// ============================================================================
// TAB 3: PROFIEL & KASTJES-THEMA DASHBOARD
// ============================================================================
window.toggleProfileEditForm = function (forceState) {
  AppState.isEditingProfile =
    typeof forceState === 'boolean' ? forceState : !AppState.isEditingProfile;
  renderProfileTab();
};

function renderProfileTab() {
  const container = document.getElementById('profileTabContent');
  if (!container) return;

  const user = window.BuurtBiebDB.getCurrentUser();

  if (!user) {
    container.innerHTML = `
      <div class="section-card" style="text-align:center; padding:2.5rem 1.5rem;">
        <div style="font-size:3rem; margin-bottom:0.5rem;">🏡</div>
        <h2 class="serif-heading" style="margin-bottom:0.5rem;">Inloggen of Account aanmaken</h2>
        <p style="max-width:520px; margin:0 auto 1.25rem; color:var(--text-muted);">
          Maak eenvoudig een account aan met <strong>Gebruikersnaam &amp; Wachtwoord</strong> of log direct in via <strong>Google</strong>.
        </p>
        <div style="display:flex; justify-content:center; gap:0.55rem; flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="openAuthModal('login')">🔑 Inloggen</button>
          <button class="btn btn-outline" onclick="openAuthModal('register')">✨ Account aanmaken</button>
        </div>
      </div>
    `;
    applyDynamicTranslationIfNeeded(container);
    return;
  }

  if (user.needsOnboarding) {
    container.innerHTML = `
      <div class="section-card" style="text-align:center; padding:2.5rem 1.5rem;">
        <h2 class="serif-heading">Voltooi je Eerste Aanmelding</h2>
        <p style="margin:0.5rem 0 1.25rem; color:var(--text-muted);">
          Je bent aangemeld als <strong>${escapeHtml(user.email)}</strong>. Kies nog even je boekenplank-naam en postcode, of log hieronder uit.
        </p>
        <div style="display:flex; justify-content:center; gap:0.65rem; flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="openOnboardingModal()">📚 Profiel instellen</button>
          <button class="btn btn-outline" onclick="handleSignOut()">🚪 Uitloggen</button>
          <button class="btn btn-outline" style="color:#B91C1C; border-color:#FCA5A5;" onclick="handleDeleteAccount()">🗑️ Account verwijderen</button>
        </div>
      </div>
    `;
    applyDynamicTranslationIfNeeded(container);
    return;
  }

  const myBooks = window.BuurtBiebDB.getBooks().filter(
    (b) => b.owner_id === user.id && b.status !== 'overgedragen' && b.status !== 'meegenomen'
  );
  const myReservedBooks = window.BuurtBiebDB.getBooks().filter(
    (b) => b.reserved_by_id === user.id && b.status !== 'overgedragen' && b.status !== 'meegenomen'
  );
  const userMethods = Array.isArray(user.contact_methods) && user.contact_methods.length > 0
    ? user.contact_methods
    : ['in_app_chat', 'email'];

  container.innerHTML = `
    <div class="section-card">
      <div class="profile-header-row" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
        <div>
          <span class="sticker-badge sticker-zwerfboek">🔐 Account · ${escapeHtml(user.bieb_name)}</span>
          <span class="sticker-badge ${user.has_physical_box ? 'sticker-leenboek' : 'sticker-koopboek'}" style="margin-left:0.35rem;">
            ${user.has_physical_box ? '🏡 Heeft fysieke MiniBieb aan de straat' : '📚 Deelt vanuit Huis (Digitale Boekenplank)'}
          </span>
          <h2 class="serif-heading" style="font-size:1.6rem; margin-top:0.35rem;">${escapeHtml(user.bieb_name)}</h2>
          <p style="color:var(--text-muted); font-size:0.9rem;">
            ${
              user.postal_code_4 || user.city
                ? `📍 Locatie: <strong>${escapeHtml(formatLocationLabel(user.postal_code_4, user.city))}</strong>`
                : `📍 Locatie: <span style="opacity:0.8;">Niet ingesteld (optioneel via Profiel wijzigen)</span>`
            }
          </p>
        </div>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button type="button" class="btn btn-primary btn-sm" onclick="toggleProfileEditForm()">
            ✏️ ${AppState.isEditingProfile ? 'Bewerken sluiten' : 'Profiel & gegevens wijzigen'}
          </button>
          <button class="btn btn-outline btn-sm" onclick="handleSignOut()">🚪 Uitloggen</button>
          <button class="btn btn-outline btn-sm" style="color:#B91C1C; border-color:#FCA5A5;" onclick="handleDeleteAccount()">🗑️ Account verwijderen</button>
        </div>
      </div>

      ${
        AppState.isEditingProfile
          ? `
      <!-- PROFIEL BEWERKEN -->
      <form onsubmit="handleProfileUpdateSubmit(event)" style="border-top:1px solid var(--border-warm); padding-top:1.25rem;">
        <h3 class="serif-heading" style="margin-bottom:0.85rem;">⚙️ Jouw Boekenplank-instellingen</h3>

        <div class="form-group">
          <label class="form-label">Hoe deel jij jouw boeken met de buurt?</label>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:0.65rem;">
            <label class="sticker-option-card" style="cursor:pointer; padding:0.75rem;">
              <input type="radio" name="profHasBox" value="false" ${!user.has_physical_box ? 'checked' : ''} />
              <strong>📚 Ik deel vanuit Huis (Digitale Boekenplank)</strong>
              <div style="font-size:0.76rem; color:var(--text-muted); margin-top:0.15rem;">
                Standaard voor de meeste lezers: geen fysieke MiniBieb nodig. Buren halen op afspraak op of per post.
              </div>
            </label>
            <label class="sticker-option-card" style="cursor:pointer; padding:0.75rem;">
              <input type="radio" name="profHasBox" value="true" ${user.has_physical_box ? 'checked' : ''} />
              <strong>🏡 Ik heb een fysieke MiniBieb aan de straat</strong>
              <div style="font-size:0.76rem; color:var(--text-muted); margin-top:0.15rem;">
                Je hebt een echte houten MiniBieb aan de straat waar buren vrij boeken uit kunnen meenemen.
              </div>
            </label>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Jouw naam of naam van je Boekenplank / MiniBieb</label>
            <input type="text" id="profBiebName" class="input-field" value="${escapeHtml(user.bieb_name)}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Postcode (4 cijfers, optioneel)</label>
            <input type="text" id="profPostal" class="input-field" maxlength="4" placeholder="Bijv. 3512" value="${escapeHtml(user.postal_code_4 || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label">Woonplaats (optioneel)</label>
            <input type="text" id="profCity" class="input-field" placeholder="Bijv. Utrecht" value="${escapeHtml(user.city || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label">🏡 Straatnaam + huisnummer (voor fysieke MiniBieb op de kaart)</label>
            <input type="text" id="profStreetAddress" class="input-field" placeholder="Optioneel: bijv. Oudegracht 112" value="${escapeHtml(user.street_address || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label">📍 Volledige postcode (6 tekens, optioneel)</label>
            <input type="text" id="profPostalFull" class="input-field" maxlength="7" placeholder="Optioneel: bijv. 3512 AB" value="${escapeHtml(user.postal_code_full || '')}" />
          </div>
        </div>

        <div class="profile-save-row" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-top:0.5rem;">
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button type="submit" class="btn btn-primary">💾 Profiel opslaan</button>
            <button type="button" class="btn btn-outline" onclick="toggleProfileEditForm(false)">✕ Annuleren</button>
          </div>
          <button type="button" class="btn btn-outline btn-sm" style="color:#B91C1C; border-color:#FCA5A5;" onclick="handleDeleteAccount()">
            🗑️ Account definitief verwijderen
          </button>
        </div>
      </form>
      `
          : ''
      }
    </div>

    ${
      myReservedBooks.length > 0
        ? `
          <div class="section-card">
            <h3 class="serif-heading" style="margin-bottom:0.75rem;">📖 Door jou gereserveerde / geleende boeken</h3>
            <div style="display:grid; gap:0.65rem;">
              ${myReservedBooks
                .map(
                  (b) => `
                  <div class="profile-book-row" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; padding:0.75rem; background:var(--bg-cream); border:1px solid var(--border-warm); border-radius:8px;">
                    <div>
                      ${renderStickerBadge(b)}
                      <strong>${escapeHtml(b.title)}</strong> — ${escapeHtml(b.author)}
                      ${
                        b.handover_confirmed
                          ? `<span class="sticker-badge" style="background:#DCFCE7; color:#166534; margin-left:0.35rem;">✅ Ontvangen</span>`
                          : `<span class="sticker-badge" style="background:#FEF3C7; color:#92400E; margin-left:0.35rem;">⏳ Wacht op afhalen</span>`
                      }
                    </div>
                    <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                      ${
                        !b.handover_confirmed
                          ? `<button class="btn btn-primary btn-sm" onclick="handleConfirmBookHandover('${b.id}')">📦 Ontvangst bevestigen</button>`
                          : ''
                      }
                      <button class="btn btn-outline btn-sm" onclick="handleReturnBook('${b.id}')">
                        ✅ ${b.handover_confirmed ? 'Boek teruggebracht op de plank' : 'Aanvraag annuleren'}
                      </button>
                    </div>
                  </div>
                `
                )
                .join('')}
            </div>
          </div>
        `
        : ''
    }

    ${
      myBooks.length > 0
        ? `
          <div class="section-card">
            <div class="section-header-flex" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.85rem;">
              <h3 class="serif-heading">📚 Boeken op jouw ${user.has_physical_box ? 'MiniBieb-plank' : 'plank'} (${myBooks.length})</h3>
              <div style="display:flex; gap:0.45rem; flex-wrap:wrap;">
                <button class="btn btn-outline btn-sm" onclick="openQuickBatchScanner()">⚡ Meerdere boeken achter elkaar scannen</button>
                <button class="btn btn-primary btn-sm" onclick="switchTab('toevoegen')">+ Nieuw boek toevoegen</button>
              </div>
            </div>
            <div style="display:grid; gap:0.65rem;">
              ${myBooks
                .map(
                  (b) => `
                  <div class="profile-book-row" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; padding:0.75rem; background:var(--bg-cream); border:1px solid var(--border-warm); border-radius:8px;">
                    <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                      ${renderStickerBadge(b)}
                      ${
                        user.has_physical_box
                          ? `
                            <span class="sticker-badge" style="background:${b.self_service_box ? '#ECFDF5' : '#EFF6FF'}; color:${b.self_service_box ? '#065F46' : '#1E40AF'}; border:1px solid ${b.self_service_box ? '#6EE7B7' : '#93C5FD'};">
                              ${b.self_service_box ? '🏡 In fysieke MiniBieb' : '📚 Binnen op Digitale Plank'}
                            </span>
                          `
                          : ''
                      }
                      ${renderGenreBadge(b)}
                      <strong>${escapeHtml(b.title)}</strong> — ${escapeHtml(b.author)}
                      ${
                        b.status === 'uitgeleend'
                          ? `<span class="sticker-badge" style="background:#DBEAFE; color:#1E40AF; border:1px solid #93C5FD;">📖 Uitgeleend${b.reserved_by_name ? ' aan ' + escapeHtml(b.reserved_by_name) : ''} (tijdelijk van plank)</span>`
                          : b.status === 'gereserveerd'
                            ? `<span class="sticker-badge" style="background:#FEF3C7; color:#92400E; border:1px solid #F59E0B;">⏳ Aangevraagd${b.reserved_by_name ? ' door ' + escapeHtml(b.reserved_by_name) : ''} (van plank)</span>`
                            : ''
                      }
                    </div>
                    <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                      ${
                        user.has_physical_box && b.status === 'beschikbaar'
                          ? `
                            <button class="btn btn-outline btn-sm" onclick="handleToggleBookLocation('${b.id}')" title="Verplaats dit boek tussen je fysieke MiniBieb en je digitale binnen-plank">
                              ${b.self_service_box ? '📚 Zet op Binnen-plank' : '🏡 Leg in MiniBieb'}
                            </button>
                          `
                          : ''
                      }
                      ${
                        b.sticker_type === 'leenboek'
                          ? b.status === 'beschikbaar'
                            ? `<button class="btn btn-outline btn-sm" onclick="handleMarkLoanedOut('${b.id}')">📖 Markeer als Uitgeleend</button>`
                            : `<button class="btn btn-primary btn-sm" onclick="handleReturnBook('${b.id}')">✅ Teruggebracht (Zet weer op plank)</button>`
                          : `<button class="btn btn-outline btn-sm" onclick="handleConfirmBookHandover('${b.id}')">✅ ${b.sticker_type === 'zwerfboek' ? 'Weggegeven' : 'Verkocht'} (Van plank af)</button>`
                      }
                      ${
                        b.status === 'gereserveerd' && b.sticker_type !== 'leenboek'
                          ? `<button class="btn btn-outline btn-sm" onclick="handleReturnBook('${b.id}')">↩️ Zet weer op plank</button>`
                          : ''
                      }
                      <button class="btn btn-outline btn-sm" onclick="openBookDetailModal('${b.id}')">
                        🔍 Bekijk
                      </button>
                      <button class="btn btn-outline btn-sm" style="color:#B91C1C; border-color:#FCA5A5;" onclick="handleDeleteBook('${b.id}')">
                        🗑️ Verwijderen
                      </button>
                    </div>
                  </div>
                `
                )
                .join('')}
            </div>
          </div>
        `
        : ''
    }
  `;
  applyDynamicTranslationIfNeeded(container);
}

// ============================================================================
// AUTHENTICATIE & EERSTE AANMELDING (ONBOARDING) HANDLERS
// ============================================================================
window.switchAuthModalMode = function (mode = 'login') {
  AppState.authModalMode = mode === 'register' ? 'register' : 'login';
  const isReg = AppState.authModalMode === 'register';
  const loginBtn = document.getElementById('authTabLoginBtn');
  const regBtn = document.getElementById('authTabRegisterBtn');
  const submitBtn = document.getElementById('authSubmitBtn');
  const titleEl = document.getElementById('authModalTitle');
  const passInput = document.getElementById('authPasswordInput');

  if (loginBtn) {
    loginBtn.className = isReg ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm';
    loginBtn.style.border = isReg ? 'none' : '';
  }
  if (regBtn) {
    regBtn.className = isReg ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';
    regBtn.style.border = isReg ? '' : 'none';
  }
  if (submitBtn) {
    submitBtn.textContent = isReg
      ? tr('✨ Account aanmaken', '✨ Create Account')
      : tr('🔑 Inloggen', '🔑 Log in');
  }
  if (titleEl) {
    titleEl.textContent = isReg
      ? tr('Account aanmaken bij BuurtBieb.nl', 'Create Account at BuurtBieb.nl')
      : tr('Inloggen bij BuurtBieb.nl', 'Log in to BuurtBieb.nl');
  }
  if (passInput) {
    passInput.setAttribute('autocomplete', isReg ? 'new-password' : 'current-password');
  }
};

let _lastFocusedBeforeModal = null;

function focusFirstInModal(modalEl) {
  if (!modalEl || typeof modalEl.querySelector !== 'function') return;
  if (
    typeof document !== 'undefined' &&
    document.activeElement &&
    typeof modalEl.contains === 'function' &&
    !modalEl.contains(document.activeElement)
  ) {
    _lastFocusedBeforeModal = document.activeElement;
  }
  const focusable = modalEl.querySelector(
    'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (focusable && typeof focusable.focus === 'function') {
    setTimeout(() => focusable.focus(), 10);
  }
}

function restoreFocusAfterModal() {
  if (_lastFocusedBeforeModal && typeof _lastFocusedBeforeModal.focus === 'function') {
    try {
      _lastFocusedBeforeModal.focus();
    } catch {}
  }
  _lastFocusedBeforeModal = null;
}

window.openAuthModal = function (defaultMode = 'login') {
  renderAuthModalModeBadge();
  applyStaticDomTranslations();
  window.switchAuthModalMode(defaultMode);
  const passEl = document.getElementById('authPasswordInput');
  if (passEl) passEl.value = '';
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('open');
    focusFirstInModal(modal);
    pushAppHistoryState('modal:auth');
  }
};

window.closeAuthModal = function () {
  const modal = document.getElementById('authModal');
  if (!modal || !modal.classList.contains('open')) return;
  modal.classList.remove('open');
  restoreFocusAfterModal();
};

window.handleUserPasswordAuthSubmit = async function (event) {
  event.preventDefault();
  const username = document.getElementById('authUsernameInput')?.value || '';
  const password = document.getElementById('authPasswordInput')?.value || '';
  const mode = AppState.authModalMode === 'register' ? 'register' : 'login';
  try {
    const res =
      mode === 'register'
        ? await window.BuurtBiebDB.registerWithUsernamePassword({ username, password })
        : await window.BuurtBiebDB.loginWithUsernamePassword({ username, password });
    closeAuthModal();
    showToast(
      mode === 'register'
        ? `✨ Account "${res.profile.bieb_name}" aangemaakt en direct ingelogd!`
        : `🔑 Welkom terug, ${res.profile.bieb_name}!`
    );
    refreshAllViews();
  } catch (err) {
    showAppAlert(err.message);
  }
};

window.handleGoogleLogin = async function () {
  try {
    const res = await window.BuurtBiebDB.signInWithGoogle();
    if (!res || res.cancelled) return;
    closeAuthModal();
    if (res.profile) {
      showToast(`🌐 Welkom bij BuurtBieb, ${res.profile.bieb_name}!`);
      refreshAllViews();
    }
  } catch (err) {
    showAppAlert('Google Login melding: ' + err.message);
  }
};

window.openOnboardingModal = function () {
  const user = window.BuurtBiebDB.getCurrentUser();
  if (user && document.getElementById('onboardingEmailBadge')) {
    document.getElementById('onboardingEmailBadge').textContent = user.email;
  }
  const modal = document.getElementById('onboardingModal');
  if (modal) {
    modal.classList.add('open');
    focusFirstInModal(modal);
  }
};

window.closeOnboardingModal = function () {
  const modal = document.getElementById('onboardingModal');
  if (!modal || !modal.classList.contains('open')) return;
  modal.classList.remove('open');
  restoreFocusAfterModal();
  refreshAllViews();
};

let _appDialogResolver = null;

window.closeAppDialog = function (confirmed = false) {
  const modal = document.getElementById('appDialogModal');
  if (modal && modal.classList.contains('open')) {
    modal.classList.remove('open');
    restoreFocusAfterModal();
  }
  const resolve = _appDialogResolver;
  _appDialogResolver = null;
  if (typeof resolve === 'function') {
    resolve(Boolean(confirmed));
  }
};

window.showAppAlert = function (message, options = {}) {
  const text = String(message || '').trim();
  const modal = document.getElementById('appDialogModal');
  if (!modal) {
    showToast(text);
    return Promise.resolve(true);
  }
  const titleEl = document.getElementById('appDialogTitle');
  const iconEl = document.getElementById('appDialogIcon');
  const msgEl = document.getElementById('appDialogMessage');
  const cancelBtn = document.getElementById('appDialogCancelBtn');
  const confirmBtn = document.getElementById('appDialogConfirmBtn');

  if (titleEl) titleEl.textContent = options.title || tr('Melding', 'Notice');
  if (iconEl) iconEl.textContent = options.icon || 'ℹ️';
  if (msgEl) msgEl.textContent = text;
  if (cancelBtn) cancelBtn.style.display = 'none';
  if (confirmBtn) {
    confirmBtn.textContent = options.confirmText || 'OK';
    confirmBtn.className = 'btn btn-primary btn-sm';
  }

  modal.classList.add('open');
  focusFirstInModal(modal);
  return new Promise((resolve) => {
    _appDialogResolver = resolve;
  });
};

window.showAppConfirm = function (message, options = {}) {
  const text = String(message || '').trim();
  const modal = document.getElementById('appDialogModal');
  if (!modal) {
    return Promise.resolve(false);
  }
  window.triggerHaptic(options.danger ? 'warning' : 'light');
  const titleEl = document.getElementById('appDialogTitle');
  const iconEl = document.getElementById('appDialogIcon');
  const msgEl = document.getElementById('appDialogMessage');
  const cancelBtn = document.getElementById('appDialogCancelBtn');
  const confirmBtn = document.getElementById('appDialogConfirmBtn');

  if (titleEl) titleEl.textContent = options.title || tr('Bevestigen', 'Confirm');
  if (iconEl) iconEl.textContent = options.icon || (options.danger ? '⚠️' : '❓');
  if (msgEl) msgEl.textContent = text;
  if (cancelBtn) {
    cancelBtn.style.display = '';
    cancelBtn.textContent = options.cancelText || tr('Annuleren', 'Cancel');
  }
  if (confirmBtn) {
    confirmBtn.textContent = options.confirmText || tr('Bevestigen', 'Confirm');
    confirmBtn.className = options.danger ? 'btn btn-danger btn-sm' : 'btn btn-primary btn-sm';
  }

  modal.classList.add('open');
  focusFirstInModal(modal);
  return new Promise((resolve) => {
    _appDialogResolver = resolve;
  });
};

// Sluit alleen een daadwerkelijk geopend venster met Escape + focus-trap bij Tab
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const sideMenu = document.getElementById('appSideMenu');
    if (sideMenu?.classList.contains('open')) {
      closeSideMenu();
      return;
    }
    const dialogModal = document.getElementById('appDialogModal');
    if (dialogModal?.classList.contains('open')) {
      closeAppDialog(false);
      return;
    }
    const welcomeModal = document.getElementById('welcomeGuideModal');
    if (welcomeModal?.classList.contains('open')) {
      closeWelcomeGuideModal();
      return;
    }
    const bookModal = document.getElementById('bookDetailModal');
    const authModal = document.getElementById('authModal');
    const onbModal = document.getElementById('onboardingModal');
    if (bookModal?.classList.contains('open')) closeBookDetailModal();
    if (authModal?.classList.contains('open')) closeAuthModal();
    if (onbModal?.classList.contains('open')) closeOnboardingModal();
    return;
  }

  if (e.key === 'Tab') {
    const openModal = document.querySelector('.modal-backdrop.open');
    if (!openModal) return;
    const focusables = Array.from(
      openModal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

window.handleOnboardingSubmit = async function (event) {
  event.preventDefault();
  const bieb_name = document.getElementById('onbBiebName').value.trim();
  const postal_code_4 = document.getElementById('onbPostal4').value.trim();
  const city = document.getElementById('onbCity').value.trim();
  const whatsapp_number = '';
  const theme = 'klassiek_hout';
  const hasBoxRadio = document.querySelector('input[name="onbHasBox"]:checked');
  const has_physical_box = hasBoxRadio ? hasBoxRadio.value === 'true' : false;
  const contact_methods = ['in_app_chat'];

  if (!bieb_name) {
    showAppAlert('Vul een naam in voor jouw boekenplank of MiniBieb.');
    return;
  }
  if (contact_methods.length === 0) {
    showAppAlert('Vink minimaal één contactoptie aan (bijv. 💬 In-App Chat).');
    return;
  }

  try {
    const current = window.BuurtBiebDB.getCurrentUser();
    const taken = await window.BuurtBiebDB.checkBiebNameTakenRemote(
      bieb_name,
      current?.id,
      current?.email
    );
    if (taken) {
      showAppAlert(
        `De naam "${bieb_name}" is al in gebruik door een andere buurtgenoot. Kies een andere naam voor je boekenplank of MiniBieb.`
      );
      return;
    }

    const profile = window.BuurtBiebDB.completeFirstSignUpProfile({
      bieb_name,
      postal_code_4,
      city,
      theme,
      whatsapp_number,
      contact_methods,
      has_physical_box
    });
    AppState.isEditingProfile = false;
    document.getElementById('onboardingModal').classList.remove('open');
    showToast(`${profile.has_physical_box ? '🏡' : '📚'} Welkom "${profile.bieb_name}"! Je boekenplank is ingesteld en klaar om te delen.`);
    refreshAllViews();
  } catch (err) {
    showAppAlert(err.message);
  }
};

window.handleProfileUpdateSubmit = async function (event) {
  event.preventDefault();
  const bieb_name = document.getElementById('profBiebName').value.trim();
  const theme = 'klassiek_hout';
  let postal_code_4 = document.getElementById('profPostal').value.trim();
  let city = document.getElementById('profCity').value.trim();
  const street_address = (document.getElementById('profStreetAddress')?.value || '').trim();
  let postal_code_full = (document.getElementById('profPostalFull')?.value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
  if (postal_code_full.length === 6) {
    postal_code_full = `${postal_code_full.slice(0, 4)} ${postal_code_full.slice(4)}`;
  }
  if (!postal_code_4 && /^[1-9][0-9]{3}/.test(postal_code_full)) {
    postal_code_4 = postal_code_full.slice(0, 4);
  }
  const whatsapp_number = '';
  const hasBoxRadio = document.querySelector('input[name="profHasBox"]:checked');
  const has_physical_box = hasBoxRadio ? hasBoxRadio.value === 'true' : false;
  const contact_methods = ['in_app_chat'];

  if (!bieb_name) {
    showAppAlert('Vul een naam in voor jouw boekenplank of MiniBieb.');
    return;
  }
  if (postal_code_4 && !/^[1-9][0-9]{3}$/.test(postal_code_4)) {
    showAppAlert('Voer een geldige 4-cijferige postcode in (bijv. 3512) of laat het veld leeg.');
    return;
  }
  const cleanPhone = '';

  try {
    const current = window.BuurtBiebDB.getCurrentUser();
    const taken = await window.BuurtBiebDB.checkBiebNameTakenRemote(
      bieb_name,
      current?.id,
      current?.email
    );
    if (taken) {
      showAppAlert(
        `De naam "${bieb_name}" is al in gebruik door een andere buurtgenoot. Kies een andere naam voor je boekenplank of MiniBieb.`
      );
      return;
    }

    let lat = null;
    let lng = null;
    if (has_physical_box && (street_address || postal_code_full || city)) {
      const geo = await geocodeDutchAddress({
        street_address,
        postal_code_full,
        postal_code_4,
        city
      });
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
        if (!postal_code_full && geo.postal_code_full) postal_code_full = geo.postal_code_full;
        if (!city && geo.city) city = geo.city;
        if (!postal_code_4 && /^[1-9][0-9]{3}/.test(postal_code_full)) {
          postal_code_4 = postal_code_full.slice(0, 4);
        }
      } else if (
        current &&
        current.street_address === street_address &&
        current.postal_code_full === postal_code_full &&
        current.city === city
      ) {
        lat = current.lat ?? null;
        lng = current.lng ?? null;
      }
    }

    window.BuurtBiebDB.updateCurrentUserProfile({
      bieb_name,
      theme,
      postal_code_4,
      postal_code_full,
      street_address,
      city,
      lat,
      lng,
      whatsapp_number: cleanPhone,
      contact_methods,
      has_physical_box
    });
    AppState.isEditingProfile = false;
    showToast('Boekenplank-profiel opgeslagen!');
    refreshAllViews();
  } catch (err) {
    showAppAlert(err.message);
  }
};

window.handleSignOut = function () {
  window.BuurtBiebDB.signOut();
  AppState.activeConversationId = null;
  AppState.isEditingProfile = false;
  closeOnboardingModal();
  closeAuthModal();
  showToast('Je bent uitgelogd.');
  if (['chat', 'toevoegen', 'profiel'].includes(AppState.activeTab)) {
    switchTab('plank');
  }
  refreshAllViews();
};

window.handleDeleteAccount = async function () {
  const user = window.BuurtBiebDB.getCurrentUser();
  if (!user) return;

  const confirmed = await window.showAppConfirm(
    `Weet je zeker dat je jouw account (${user.bieb_name || user.email}) en jouw aangeboden boeken definitief wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`,
    {
      title: tr('Account verwijderen', 'Delete account'),
      icon: '🗑️',
      confirmText: tr('Definitief verwijderen', 'Delete permanently'),
      cancelText: tr('Annuleren', 'Cancel'),
      danger: true
    }
  );
  if (!confirmed) return;

  window.BuurtBiebDB.deleteCurrentAccount();
  AppState.activeConversationId = null;
  AppState.isEditingProfile = false;
  closeOnboardingModal();
  closeAuthModal();
  showToast('Je account en bijbehorende gegevens zijn definitief verwijderd.');
  if (['chat', 'toevoegen', 'profiel'].includes(AppState.activeTab)) {
    switchTab('plank');
  }
  refreshAllViews();
};

window.handleConfirmBookHandover = function (bookId) {
  try {
    const res = window.BuurtBiebDB.confirmBookHandover(bookId);
    if (res.isLoanedOut) {
      showToast(`📖 "${res.book.title}" staat nu op 'Uitgeleend' en is tijdelijk van de openbare plank gehaald tot het weer terug is!`);
    } else if (res.removedFromShelf) {
      closeBookDetailModal();
      showToast(`✅ "${res.book.title}" is overgedragen en van de boekenplank gehaald!`);
    }
    refreshAllViews();
  } catch (err) {
    showAppAlert(err.message);
  }
};

window.handleMarkLoanedOut = function (bookId) {
  try {
    const book = window.BuurtBiebDB.markBookLoanedOutByOwner(bookId);
    showToast(`📖 "${book.title}" is gemarkeerd als uitgeleend en tijdelijk van de openbare plank gehaald.`);
    refreshAllViews();
  } catch (err) {
    showAppAlert(err.message);
  }
};

window.handleReturnBook = function (bookId) {
  try {
    window.BuurtBiebDB.returnBorrowedBook(bookId);
    showToast('Boek staat weer als beschikbaar op de plank!');
    refreshAllViews();
  } catch (err) {
    showAppAlert(err.message);
  }
};

window.openQuickBatchScanner = function () {
  switchTab('toevoegen');
  const cb = document.getElementById('quickBatchScanCheckbox');
  if (cb) {
    cb.checked = true;
    window.handleQuickBatchScanToggle(true);
  }
  const isbnEl = document.getElementById('isbnInput');
  if (isbnEl) isbnEl.focus();
};

window.handleToggleBookLocation = function (bookId) {
  try {
    const updated = window.BuurtBiebDB.toggleBookPlacementLocation(bookId);
    showToast(
      updated.self_service_box
        ? `🏡 "${updated.title}" ligt nu buiten in de fysieke MiniBieb (vrij te pakken).`
        : `📚 "${updated.title}" staat nu binnen op je digitale boekenplank (op afspraak).`
    );
    refreshAllViews();
  } catch (err) {
    showAppAlert(err.message);
  }
};

window.handleDeleteBook = async function (bookId) {
  const book = window.BuurtBiebDB.getBooks().find((b) => b.id === bookId);
  const titleLabel = book && book.title ? `"${book.title}"` : 'dit boek';
  const confirmed = await window.showAppConfirm(
    tr(
      `Weet je zeker dat je ${titleLabel} definitief van je boekenplank wilt verwijderen?`,
      `Are you sure you want to permanently remove ${titleLabel} from your bookshelf?`
    ),
    {
      title: tr('Boek verwijderen', 'Delete book'),
      icon: '🗑️',
      confirmText: tr('Definitief verwijderen', 'Delete permanently'),
      cancelText: tr('Annuleren', 'Cancel'),
      danger: true
    }
  );
  if (!confirmed) return;

  try {
    const { removedBook } = window.BuurtBiebDB.deleteBook(bookId);
    showToast(`🗑️ "${removedBook.title}" is van je plank verwijderd.`);
    refreshAllViews();
  } catch (err) {
    showAppAlert(err.message);
  }
};

// ============================================================================
// NAVIGATIE & THEMA WISSELAAR
// ============================================================================
window.switchTab = function (tabName) {
  const protectedTabs = ['chat', 'toevoegen', 'profiel'];
  if (protectedTabs.includes(tabName)) {
    const user = window.BuurtBiebDB.getCurrentUser();
    if (!user) {
      showToast('Log eerst even in om boeken aan te bieden, te chatten of je profiel te bekijken.');
      openAuthModal();
      return;
    }
    if (user.needsOnboarding) {
      openOnboardingModal();
      return;
    }
  }

  if (AppState.activeTab === 'toevoegen' && tabName !== 'toevoegen') {
    stopCameraBarcodeScanner();
  }

  if (AppState.activeTab === 'chat' && tabName !== 'chat' && AppState.activeConversationId) {
    const prevConvId = AppState.activeConversationId;
    const removed = window.BuurtBiebDB.removeConversationIfEmpty(prevConvId);
    if (removed) {
      if (AppState.chatDraft && AppState.chatDraft.convId === prevConvId) AppState.chatDraft = null;
      if (AppState.pendingReservation && AppState.pendingReservation.convId === prevConvId) {
        AppState.pendingReservation = null;
      }
      AppState.activeConversationId = null;
    }
  }

  const prevTab = AppState.activeTab;
  AppState.activeTab = tabName;
  if (tabName !== prevTab && tabName !== 'plank') {
    pushAppHistoryState(`tab:${tabName}`);
  }
  document.body.classList.toggle('chat-tab-open', tabName === 'chat');

  document.querySelectorAll('[data-tab-target]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-tab-target') === tabName);
  });
  updateSideMenuActiveState();

  document.querySelectorAll('.tab-view-section').forEach((sec) => {
    sec.style.display = sec.id === `view-${tabName}` ? 'block' : 'none';
  });

  if (tabName === 'plank') renderBookshelfView();
  if (tabName === 'marktplaats') renderMarketplaceView();
  if (tabName === 'chat') renderChatTab();
  if (tabName === 'toevoegen') selectStickerInForm(AppState.selectedStickerInForm || 'zwerfboek');
  if (tabName === 'profiel') renderProfileTab();
  renderOnboardingBanner();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.previewCabinetTheme = function () {
  AppState.selectedCabinetTheme = 'klassiek_hout';
  document.documentElement.setAttribute('data-cabinet-theme', 'klassiek_hout');
};

window.setStickerFilter = function (sticker) {
  AppState.filterSticker = sticker;
  AppState.shelfPage = 1;
  document.querySelectorAll('.sticker-filter-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-sticker-filter') === sticker);
  });

  // Toon "Prijs (Laag -> Hoog)" ALLEEN bij betaalde categorieën (Koopboek of Marktplaats),
  // niet bij Zwerfboeken of Leenboeken!
  const priceOpt = document.getElementById('shelfSortPriceOption');
  const sortSel = document.getElementById('shelfSortSelect');
  const hasPrice = sticker === 'koopboek' || sticker === 'marktplaats';
  if (priceOpt) {
    priceOpt.style.display = hasPrice ? 'block' : 'none';
    priceOpt.disabled = !hasPrice;
  }
  if (!hasPrice && sortSel && sortSel.value === 'prijs_laag') {
    sortSel.value = 'dichtbij';
  }

  renderBookshelfView();
};

let _searchFilterDebounceTimer = null;

window.handleSearchAndFilterChange = function (immediate = false) {
  const applyFilters = () => {
    const sEl = document.getElementById('searchBooksInput');
    const pEl = document.getElementById('postalFilterInput');
    const gEl = document.getElementById('genreFilterSelect');
    AppState.searchQuery = sEl ? sEl.value : '';
    AppState.filterPostal = pEl ? pEl.value : '';
    AppState.filterGenre = gEl ? gEl.value : 'alle';
    AppState.shelfPage = 1;
    updateExtraFiltersBadge();
    renderBookshelfView({ shelfOnly: true });
  };
  clearTimeout(_searchFilterDebounceTimer);
  if (immediate) {
    applyFilters();
  } else {
    _searchFilterDebounceTimer = setTimeout(applyFilters, 180);
  }
};

window.handleBookSearchSubmit = function (event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
  window.handleSearchAndFilterChange(true);
  const shelfEl = document.getElementById('woodenCabinetContent');
  if (shelfEl && typeof shelfEl.scrollIntoView === 'function') {
    shelfEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

window.resetAllShelfFilters = function () {
  clearTimeout(_searchFilterDebounceTimer);
  const sEl = document.getElementById('searchBooksInput');
  const gEl = document.getElementById('genreFilterSelect');
  const pEl = document.getElementById('postalFilterInput');
  const distEl = document.getElementById('shelfDistanceSelect');
  if (distEl && distEl.value && distEl.value !== 'alle') count += 1;
  const sortEl = document.getElementById('shelfSortSelect');
  if (sEl) sEl.value = '';
  if (gEl) gEl.value = 'alle';
  if (pEl) pEl.value = '';
  if (sortEl) sortEl.value = 'dichtbij';
  const dEl = document.getElementById('shelfDistanceSelect');
  if (dEl) dEl.value = 'alle';
  AppState.filterDistanceKm = 'alle';
  AppState.searchQuery = '';
  AppState.filterPostal = '';
  AppState.filterGenre = 'alle';
  AppState.filterLanguage = 'alle';
  AppState.filterSticker = 'alle';
  AppState.shelfPage = 1;
  document.querySelectorAll('[data-lang-filter]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-lang-filter') === 'alle');
  });
  updateExtraFiltersBadge();
  setStickerFilter('alle');
};

function refreshAllViews() {
  const currentUser = window.BuurtBiebDB.getCurrentUser();
  if (currentUser && !currentUser.needsOnboarding) {
    document.getElementById('onboardingModal')?.classList?.remove('open');
  }
  applyStaticDomTranslations();
  renderHeaderStatus();
  renderSecretTestModeBanner();
  renderPwaInstallBanner();
  renderOnboardingBanner();
  updateUnreadChatBadges();
  const activeTab = AppState.activeTab || 'plank';
  if (activeTab === 'plank') renderBookshelfView();
  else if (activeTab === 'marktplaats') renderMarketplaceView();
  else if (activeTab === 'chat') renderChatTab();
  else if (activeTab === 'profiel') renderProfileTab();
}
window.refreshAllViews = refreshAllViews;

// Centrale veilige event delegation voor data-action elementen (XSS-veilig + toetsenbord-toegankelijk)
function handleDelegatedAction(targetEl, event) {
  const actionEl = targetEl?.closest ? targetEl.closest('[data-action]') : null;
  if (!actionEl) return;
  const action = actionEl.getAttribute('data-action');
  if (action === 'open-book') {
    if (event) event.preventDefault();
    const bookId = actionEl.getAttribute('data-book-id');
    if (bookId) window.openBookDetailModal(bookId);
  } else if (action === 'open-book-dropoff') {
    if (event) event.preventDefault();
    const bookId = actionEl.getAttribute('data-book-id');
    if (bookId) {
      window.openBookDetailModal(bookId);
      if (typeof window.toggleInlineMiniBiebDropoff === 'function') {
        window.toggleInlineMiniBiebDropoff();
      }
    }
  } else if (action === 'select-box') {
    if (event) event.preventDefault();
    const boxId = actionEl.getAttribute('data-box-id');
    if (boxId) window.selectPhysicalMiniBieb(boxId);
  } else if (action === 'filter-box') {
    if (event) event.preventDefault();
    const boxName = actionEl.getAttribute('data-box-name');
    if (boxName) window.filterShelfByPhysicalBox(boxName);
  } else if (action === 'open-chat') {
    if (event) event.preventDefault();
    const convId = actionEl.getAttribute('data-conv-id');
    if (convId) window.openChatConversation(convId);
  }
}

document.addEventListener('click', (e) => {
  const interactiveEl = e.target?.closest
    ? e.target.closest('button, [role="button"], .book-on-shelf-card, .side-menu-item, .mobile-nav-btn, .sticker-filter-btn, .discover-sub-btn')
    : null;
  if (interactiveEl && !interactiveEl.disabled) {
    window.triggerHaptic('light');
  }
  handleDelegatedAction(e.target, e);
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const el = e.target?.closest ? e.target.closest('[data-action][role="button"]') : null;
  if (!el) return;
  handleDelegatedAction(el, e);
});

// ============================================================================
// INITIALISATIE & PWA SERVICE WORKER REGISTRATIE
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  refreshAllViews();
  maybeShowWelcomeGuideOnStartup();

  // Registreer Service Worker voor PWA ondersteuning
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.info('Service Worker registratie overgeslagen:', err);
    });
  }

  // Houd mobiele chat-hoogte exact gesynchroniseerd met het schermtoetsenbord (iOS & Android)
  if (typeof window !== 'undefined' && window.visualViewport) {
    const syncChatViewportHeight = () => {
      const vh = window.visualViewport.height;
      if (vh && vh > 200) {
        document.documentElement.style.setProperty('--chat-vh', `${Math.round(vh)}px`);
      }
      if (AppState.activeTab === 'chat') {
        const scrollBox = document.getElementById('chatMessagesScrollBox');
        if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
      }
    };
    window.visualViewport.addEventListener('resize', syncChatViewportHeight);
    syncChatViewportHeight();
  }

  // Android / Browser terugknop: ga netjes 1 stap terug in de app i.p.v. de PWA direct te sluiten
  if (typeof window !== 'undefined' && window.history && typeof window.history.replaceState === 'function') {
    try {
      window.history.replaceState({ bbNav: true, viewKey: 'home', tab: 'plank', sub: 'kast' }, '');
    } catch {}
    window.addEventListener('popstate', () => {
      _isHandlingPopState = true;
      try {
        const sideMenu = document.getElementById('appSideMenu');
        if (sideMenu?.classList.contains('open')) {
          closeSideMenu();
          return;
        }
        const dialogModal = document.getElementById('appDialogModal');
        if (dialogModal?.classList.contains('open')) {
          closeAppDialog(false);
          return;
        }
        const welcomeModal = document.getElementById('welcomeGuideModal');
        if (welcomeModal?.classList.contains('open')) {
          closeWelcomeGuideModal();
          return;
        }
        const bookModal = document.getElementById('bookDetailModal');
        if (bookModal?.classList.contains('open')) {
          closeBookDetailModal();
          return;
        }
        const authModal = document.getElementById('authModal');
        if (authModal?.classList.contains('open')) {
          closeAuthModal();
          return;
        }
        const onbModal = document.getElementById('onboardingModal');
        if (onbModal?.classList.contains('open')) {
          closeOnboardingModal();
          return;
        }
        if (AppState.activeTab === 'chat' && AppState.chatViewMode === 'thread') {
          showChatConversationList();
          return;
        }
        if (AppState.activeTab === 'plank' && AppState.discoverSubView && AppState.discoverSubView !== 'kast') {
          switchDiscoverSubView('kast');
          return;
        }
        if (AppState.activeTab && AppState.activeTab !== 'plank') {
          switchTab('plank');
          return;
        }
      } finally {
        _isHandlingPopState = false;
      }
    });
  }
});
