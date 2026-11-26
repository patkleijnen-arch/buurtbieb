# 📚 BuurtBieb.nl — Landelijk Netwerk van Online & Fysieke Mini-Biebs (Web-App & PWA)

**BuurtBieb.nl** verbindt buurtgenoten in heel Nederland die boeken willen delen, lenen of ruilen via online boekenplanken en fysieke straatkastjes.

Ontworpen met een warme **'cozy' bibliotheek-esthetiek**:
- Crèmekleurige achtergrond (`#FAF6F0`)
- Diepgroene bibliotheek-accenten (`#234233`)
- 3D visuele houten boekenplanken met diepteschaduwen en 3 instelbare kastjesthema's (*Groen Tuinhuis*, *Klassiek Hout*, *Rood Straatkastje*).

---

## 📁 Mappenstructuur

```text
buurtbieb/
├── index.html                  # Volledige responsieve Web-App & PWA interface
├── manifest.json               # Web App Manifest (installeerbaar op iOS & Android)
├── sw.js                       # Service Worker voor offline caching & snelle laadtijden
├── package.json                # Scripts om direct een lokale ontwikkelserver te starten
├── .env.example                # Voorbeeld Supabase & Affiliate configuratie
├── README.md                   # Documentatie & architectuuroverzicht
├── supabase/
│   └── schema.sql              # Volledige PostgreSQL tabellen, RLS policies & Credit triggers
├── assets/
│   └── icons/
│       └── icon.svg            # Schaalbaar BuurtBieb.nl PWA & app-icoon
├── css/
│   └── styles.css              # Cozy bibliotheek-styling, 3D houten planken & thema's
└── js/
    ├── seedData.js             # Startdata met Nederlandse boeken, buurtkastjes & stempels
    ├── isbnService.js          # Open Library API + Google Books API lookup & Camera Barcode Scanner
    ├── supabaseClient.js       # Supabase Auth (Google + Magic Link) & Hybride Database laag
    └── app.js                  # Applicatielogica (Stickers, Anti-Diefstal, WhatsApp wa.me, Paspoort)
```

---

## ✨ Geïmplementeerde Kernfunctionaliteiten

1. **Inloggen & Profiel (Geen wachtwoorden)**:
   - Ondersteuning voor **Google Login** (`signInWithOAuth`) en **Magic Link via e-mail** (`signInWithOtp`) via Supabase Auth.
   - Eerste aanmelding (onboarding) vraagt om een **kastjes-naam**, een **4-cijferige postcode** (géén straatnaam of huisnummer voor maximale privacy), **woonplaats** en één van de 3 visuele thema's (*Groen Tuinhuis*, *Klassiek Hout*, *Rood Straatkastje*).
   - Nieuwe accounts starten automatisch op **`0 Credits`**.

2. **Boeken toevoegen & De 3 Stickers**:
   - **ISBN-scanner & automatische lookup** via zowel de **Open Library API** als de **Google Books API** (inclusief live camera barcode-scanner) die automatisch titel, auteur en kaft-URL invult.
   - Keuze uit de **3 Stickers**:
     - 🟢 **Zwerfboek (Gratis)**: Kost `1 credit` voor de aanvrager. Mag gehouden of doorgegeven worden.
     - 🔵 **Leenboek**: Moet na lezen terug. Alleen zichtbaar voor buurtgenoten (ophalen). Houdt `1 credit` vast als digitale borg.
     - 🟡 **Koopboek**: Klein bedrag (max `€ 5,00`), geen credit nodig.
   - Aanvinkopties per boek: **'Klaarleggen in buitenkastje (self-service)'** en **'Verzenden per post / brievenbuspakje'**.
   - Optionele extra borg bij kostbare boeken: **Onderlinge borg (€ 5 tot € 20 via Tikkie/contant)** of een **onderpand-boek**.

3. **Anti-Diefstal & Credits Systeem**:
   - Gebruikers met `0 credits` kunnen **géén boeken contactloos laten klaarleggen in een buitenkastje**; zij moeten eerst zelf een boek aanbieden (`+1 Credit`) of 1-op-1 aan de deur ruilen.
   - Zodra een gebruiker voldoende credits heeft, kan er gereserveerd en contactloos klaargelegd worden.

4. **Contact & Overdracht (0% Juridisch Gedoe)**:
   - Geen geldstromen of betalingen via de app.
   - **'Vraag aan via WhatsApp'**-knop genereert een vooringevuld `https://wa.me/...` bericht met boektitel, sticker-type, gekozen overdracht en eventuele onderlinge borg-afspraak.

5. **Extra's**:
   - **Interactief Zwerfboek-Paspoort (stempelkaart)** per boek waar lezers een poststempel, 4-cijferige postcode, datum en korte reactie op achterlaten.
   - **Automatische Bol.com / Libris affiliate-knop** wanneer een gezocht boek niet in de buurt beschikbaar is.

---

## 🚀 Starten & Supabase Configureren

1. **Direct openen of starten**:
   - Open `index.html` direct in je browser, of start een lokale server vanuit de map `buurtbieb`:
     ```bash
     npx serve . -l 3000
     ```
2. **Supabase Database inrichten**:
   - Open de **SQL Editor** in je Supabase Dashboard en voer de inhoud van [`supabase/schema.sql`](./supabase/schema.sql) uit.
   - Vul je `SUPABASE_URL` en `SUPABASE_ANON_KEY` in onder het tabblad **🏡 Mijn Kastje & Credits** in de app (of in `js/supabaseClient.js`).
