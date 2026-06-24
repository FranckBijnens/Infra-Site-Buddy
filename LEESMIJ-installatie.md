# Verbraeken Werf Registratie — in productie zetten

Deze gids zet de app live in twee delen:

1. **Google Sheets + Apps Script** = de centrale opslag (medewerkers, werven, registraties).
2. **GitHub Pages** = host de app gratis op een `https://`-adres (nodig voor GPS en om de app te kunnen installeren).

Daarna koppel je beide en test je of alles juist registreert.

## Welke bestanden waar?

| Bestand | Waar plaatsen |
|---|---|
| `werf-registratie.html` | GitHub (de app) |
| `index.html` | GitHub (opent de app via het hoofdadres) |
| `manifest.json` | GitHub (maakt het installeerbaar) |
| `service-worker.js` | GitHub (offline + installeerbaar) |
| `verbraeken-icon.svg` | GitHub (app-icoon) |
| `AppsScript-backend.gs` | **Niet** op GitHub — deze plak je in Google Apps Script |

---

## Deel A — Google Sheets backend

1. Ga naar [sheets.google.com](https://sheets.google.com) en maak één nieuw, leeg spreadsheet. Geef het een naam, bv. *Verbraeken Werf Registratie*. De tabbladen Medewerkers, Werven en Registraties worden straks automatisch aangemaakt.
2. In het spreadsheet: **Extensies → Apps Script**.
3. Wis de voorbeeldcode en plak de volledige inhoud van `AppsScript-backend.gs`. Klik op het opslaan-icoon (of Ctrl+S).
4. Klik rechtsboven op **Implementeren → Nieuwe implementatie**.
5. Klik op het tandwiel naast "Type selecteren" en kies **Web-app**.
6. Stel in:
   - **Uitvoeren als:** Ik (jouw account)
   - **Wie heeft toegang:** **Anyone** / **Iedereen**  ← belangrijk, niet "Anyone with Google account", anders moet de app inloggen en werkt de sync niet.
7. Klik **Implementeren**. De eerste keer vraagt Google om toestemming: kies je account → bij de waarschuwing "Google heeft deze app niet geverifieerd" klik je op **Geavanceerd → Ga naar … (onveilig)** → **Toestaan**. (Dat is jouw eigen script, dus veilig.)
8. Kopieer de **web-app-URL** die eindigt op `/exec`. Die heb je straks nodig.

> **Later iets wijzigen aan het script?** Plak de nieuwe code, dan **Implementeren → Implementaties beheren → potlood → Versie: Nieuwe versie → Implementeren**. Zo blijft de URL hetzelfde.

---

## Deel B — GitHub Pages (de app hosten)

1. Maak (gratis) een account op [github.com](https://github.com) als je er nog geen hebt.
2. Klik rechtsboven op **+ → New repository**. Geef een naam, bv. `werf-registratie`, zet hem op **Public**, en klik **Create repository**.
3. Klik op **uploading an existing file** (of **Add file → Upload files**) en sleep deze 5 bestanden erin:
   - `index.html`
   - `werf-registratie.html`
   - `manifest.json`
   - `service-worker.js`
   - `verbraeken-icon.svg`

   Klik daarna op **Commit changes**.
4. Ga naar **Settings → Pages**.
5. Onder **Build and deployment → Source** kies je **Deploy from a branch**, daarna **Branch: `main`** en map **`/ (root)`**. Klik **Save**.
6. Wacht ~1 minuut en ververs. Bovenaan verschijnt je adres:
   `https://JOUWGEBRUIKERSNAAM.github.io/werf-registratie/`

Dat is de link die je medewerkers gebruiken.

---

## Deel C — App aan de Sheet koppelen

1. Open het GitHub Pages-adres **op je telefoon** (of computer).
2. Log in met de standaardbeheerder: **admin** / **admin123**.
3. Ga naar **Beheer → Google Sheets Setup**, plak de **`/exec`-URL** uit Deel A, en klik **Opslaan**. De app synchroniseert meteen — de statusbalk onderaan toont "Gesynchroniseerd".
4. **Wijzig meteen het admin-wachtwoord** (zie hieronder) en voeg je medewerkers en werven toe via Beheer.

> **Belangrijk over het wachtwoord:** omdat de repo openbaar is, is het standaardwachtwoord `admin123` voor iedereen zichtbaar in de code. Verander het dus voordat je de link uitdeelt. Wachtwoorden wijzigen kan via Beheer (een medewerker opnieuw aanmaken) of rechtstreeks in het tabblad **Medewerkers** in de Sheet (kolom `pass`).

---

## Deel D — Op de telefoon installeren

- **Android (Chrome):** open de link → menu (⋮) → **App installeren** of **Toevoegen aan startscherm**.
- **iPhone (Safari):** open de link → deel-icoon → **Zet op beginscherm**.
- De eerste keer dat je een werfbezoek start, vraagt de telefoon om **locatietoestemming** — kies **Toestaan** (anders wordt er geen GPS vastgelegd).

---

## Deel E — Controleren of het juist registreert

Doe deze test één keer volledig:

1. Tik op **Werfbezoek starten**, kies een werf en type, en **Aankomst registreren**. Sta GPS toe. Er verschijnt de blauwe kaart "Actief werfbezoek" met een lopende teller.
2. Tik na een halve minuut op **Werf verlaten** (sta GPS toe).
3. Open je Google Sheet, tabblad **Registraties**. Er hoort een nieuwe rij te staan met datum, aankomst, vertrek, duur en de GPS-coördinaten (aankomst én vertrek).
4. Controleer de **statusbalk** onderaan in de app: die moet "Gesynchroniseerd" tonen.
5. **Tweede toestel:** log op een andere telefoon in. De medewerkers, werven en registraties horen identiek te verschijnen.
6. **Offline-test:** zet vliegtuigmodus aan, registreer een bezoek → de statusbalk toont "Offline — wordt later verstuurd (1 in wachtrij)". Zet het netwerk terug aan → binnen ~2 minuten (of bij het volgende inloggen) verdwijnt de wachtrij en staat de rij in de Sheet.

Als alle zes kloppen, draait alles correct.

---

## Aandachtspunten

- **Toegang tot de backend:** de Apps Script-URL is openbaar aanroepbaar (dat moet, anders kan de app er niet bij zonder Google-login). De Sheet zelf blijft privé. Voor een interne tool is dit doorgaans prima. Wil je extra afscherming (alleen jouw app mag schrijven via een gedeelde geheime sleutel), dan kan dat eenvoudig toegevoegd worden.
- **Wachtwoorden** staan in leesbare tekst in de Sheet. Voor een klein team meestal aanvaardbaar; versleuteling kan toegevoegd worden indien gewenst.
- **App bijwerken:** upload de nieuwe `werf-registratie.html` (en/of andere bestanden) opnieuw naar GitHub. Pas in `service-worker.js` het versienummer aan (`...-v1` → `...-v2`) zodat telefoons de nieuwe versie ophalen in plaats van de oude uit de cache.
