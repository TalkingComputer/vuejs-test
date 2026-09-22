<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { supabase } from './lib/supabase'

// --------------------------------------------------
// Navigation
// --------------------------------------------------

const ansicht = ref('start')

// --------------------------------------------------
// Formular
// --------------------------------------------------

const name = ref('')
const essenDabei = ref('')
const essenHolen = ref('')
const welcherDoener = ref('')
const andererDoener = ref('')
const essensOrt = ref('')

const fehler = ref('')
const bearbeitungsId = ref(null)

// --------------------------------------------------
// Planungen
// --------------------------------------------------

const planungen = ref([])
const wirdGeladen = ref(false)
const ladeFehler = ref('')

// Datenbank-Zeile (snake_case) auf unser Formular-Objekt (camelCase) abbilden
function zeileZuPlanung(zeile) {
  return {
    id: zeile.id,
    name: zeile.name,
    essenDabei: zeile.essen_dabei,
    essenHolen: zeile.essen_holen ?? '',
    welcherDoener: zeile.welcher_doener ?? '',
    andererDoener: zeile.anderer_doener ?? '',
    essensOrt: zeile.essens_ort
  }
}

async function planungenLaden() {
  wirdGeladen.value = true
  ladeFehler.value = ''

  const { data, error } = await supabase
    .from('planungen')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    ladeFehler.value = 'Die Planungen konnten nicht geladen werden.'
    console.error(error)
  } else {
    planungen.value = data.map(zeileZuPlanung)
  }

  wirdGeladen.value = false
}

// Planungen beim Start laden und bei Änderungen anderer
// Nutzer automatisch aktualisieren (Supabase Realtime)
let realtimeChannel = null

onMounted(() => {
  planungenLaden()

  realtimeChannel = supabase
    .channel('planungen-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'planungen' },
      () => {
        planungenLaden()
      }
    )
    .subscribe()
})

onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }
})

// --------------------------------------------------
// Abhängige Eingaben zurücksetzen
// --------------------------------------------------

watch(essenDabei, (neuerWert) => {
  if (neuerWert === 'ja') {
    essenHolen.value = ''
    welcherDoener.value = ''
    andererDoener.value = ''
  }
})

watch(essenHolen, (neuerWert) => {
  if (neuerWert !== 'doener') {
    welcherDoener.value = ''
    andererDoener.value = ''
  }
})

watch(welcherDoener, (neuerWert) => {
  if (neuerWert !== 'anderer') {
    andererDoener.value = ''
  }
})

// --------------------------------------------------
// Statistiken
// --------------------------------------------------

const anzahlTeilnehmer = computed(() => {
  return planungen.value.length
})

const anzahlEssenDabei = computed(() => {
  return planungen.value.filter(
    (planung) => planung.essenDabei === 'ja'
  ).length
})

const anzahlEssenHolen = computed(() => {
  return planungen.value.filter(
    (planung) => planung.essenDabei === 'nein'
  ).length
})

const anzahlKosmos = computed(() => {
  return planungen.value.filter(
    (planung) => planung.essensOrt === 'kosmos'
  ).length
})

// --------------------------------------------------
// Formular speichern
// --------------------------------------------------

async function planungSpeichern() {
  fehler.value = ''

  if (!name.value) {
    fehler.value = 'Bitte gib deinen Namen ein.'
    return
  }

  if (!essenDabei.value) {
    fehler.value = 'Bitte gib an, ob du Essen dabeihast.'
    return
  }

  if (essenDabei.value === 'nein' && !essenHolen.value) {
    fehler.value = 'Bitte wähle aus, wo du dir Essen holen möchtest.'
    return
  }

  if (
    essenHolen.value === 'doener' &&
    !welcherDoener.value
  ) {
    fehler.value = 'Bitte wähle einen Dönerladen aus.'
    return
  }

  if (
    welcherDoener.value === 'anderer' &&
    !andererDoener.value
  ) {
    fehler.value = 'Bitte gib den Namen des Dönerladens ein.'
    return
  }

  if (!essensOrt.value) {
    fehler.value = 'Bitte wähle aus, wo du essen möchtest.'
    return
  }

  const planung = {
    name: name.value,
    essen_dabei: essenDabei.value,
    essen_holen: essenDabei.value === 'nein' ? essenHolen.value : null,
    welcher_doener: essenHolen.value === 'doener' ? welcherDoener.value : null,
    anderer_doener: welcherDoener.value === 'anderer' ? andererDoener.value : null,
    essens_ort: essensOrt.value
  }

  const { error } =
    bearbeitungsId.value !== null
      ? await supabase
          .from('planungen')
          .update(planung)
          .eq('id', bearbeitungsId.value)
      : await supabase
          .from('planungen')
          .insert(planung)

  if (error) {
    fehler.value = 'Speichern hat nicht geklappt. Bitte versuch es erneut.'
    console.error(error)
    return
  }

  await planungenLaden()
  formularZuruecksetzen()
  ansicht.value = 'start'
}

// --------------------------------------------------
// Bearbeiten
// --------------------------------------------------

function planungBearbeiten(planung) {
  name.value = planung.name
  essenDabei.value = planung.essenDabei
  essenHolen.value = planung.essenHolen
  welcherDoener.value = planung.welcherDoener
  andererDoener.value = planung.andererDoener
  essensOrt.value = planung.essensOrt

  bearbeitungsId.value = planung.id

  ansicht.value = 'formular'
}

// --------------------------------------------------
// Löschen
// --------------------------------------------------

async function planungLoeschen(id) {
  const { error } = await supabase
    .from('planungen')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(error)
    return
  }

  await planungenLaden()
}

// --------------------------------------------------
// Formular zurücksetzen
// --------------------------------------------------

function formularZuruecksetzen() {
  name.value = ''
  essenDabei.value = ''
  essenHolen.value = ''
  welcherDoener.value = ''
  andererDoener.value = ''
  essensOrt.value = ''

  bearbeitungsId.value = null
  fehler.value = ''
}

// --------------------------------------------------
// Anzeige-Texte
// --------------------------------------------------

function essenHolenText(wert) {
  const texte = {
    rewe: 'Rewe',
    doener: 'Döner',
    baecker: 'Bäcker',
    megges: 'Megges'
  }

  return texte[wert] || wert
}

function doenerText(planung) {
  if (planung.welcherDoener === 'anderer') {
    return planung.andererDoener
  }

  const texte = {
    kebup: 'Kebup',
    munzur: 'Munzur Kebaphaus',
    king: 'King Mese Döner',
    nudelhaus: 'Nudelhaus'
  }

  return texte[planung.welcherDoener] || ''
}

function essensOrtText(wert) {
  const texte = {
    raum: 'Im Raum',
    kosmos: 'Kosmos',
    draussen: 'Draußen',
    marvin: 'Bei Marvin'
  }

  return texte[wert] || wert
}

function neuePlanung() {
  formularZuruecksetzen()
  ansicht.value = 'formular'
}
</script>

<template>
  <div class="app">
    <!-- Navigation -->
    <header class="header">
      <div class="header-inner">
        <button class="logo" @click="ansicht = 'start'">
          <span class="logo-icon">🍽️</span>

          <span>
            <strong>Die 15 Minuten</strong>
            <small>Mittagspause gemeinsam planen</small>
          </span>
        </button>

        <nav>
          <button class="nav-button" :class="{ aktiv: ansicht === 'start' }" @click="ansicht = 'start'">
            Übersicht
          </button>

          <button class="nav-button nav-primary" @click="neuePlanung">
            + Eintragen
          </button>
        </nav>
      </div>
    </header>

    <!-- Startseite -->
    <main v-if="ansicht === 'start'" class="container">
      <section class="hero">
        <div>
          <span class="hero-label">HEUTIGE MITTAGSPAUSE</span>

          <h1>Was machen wir heute?</h1>

          <p>
            Sieh auf einen Blick, wer Essen dabeihat,
            wer sich etwas holt und wo gemeinsam gegessen wird.
          </p>

          <button class="primary-button" @click="neuePlanung">
            Meine Planung eintragen
          </button>
        </div>

        <div class="hero-emoji">
          🥪
        </div>
      </section>

      <!-- Lade- und Fehlerzustand -->
      <p v-if="wirdGeladen" class="status-hinweis">
        Planungen werden geladen …
      </p>

      <p v-if="ladeFehler" class="status-hinweis status-fehler">
        ⚠️ {{ ladeFehler }}
      </p>

      <!-- Statistik -->
      <section class="stats">
        <div class="stat-card">
          <span class="stat-icon">👥</span>

          <div>
            <span class="stat-number">
              {{ anzahlTeilnehmer }}
            </span>

            <span class="stat-label">
              Teilnehmer
            </span>
          </div>
        </div>

        <div class="stat-card">
          <span class="stat-icon">🥪</span>

          <div>
            <span class="stat-number">
              {{ anzahlEssenDabei }}
            </span>

            <span class="stat-label">
              Essen dabei
            </span>
          </div>
        </div>

        <div class="stat-card">
          <span class="stat-icon">🛍️</span>

          <div>
            <span class="stat-number">
              {{ anzahlEssenHolen }}
            </span>

            <span class="stat-label">
              Holen sich etwas
            </span>
          </div>
        </div>

        <div class="stat-card">
          <span class="stat-icon">📍</span>

          <div>
            <span class="stat-number">
              {{ anzahlKosmos }}
            </span>

            <span class="stat-label">
              Gehen ins Kosmos
            </span>
          </div>
        </div>
      </section>

      <!-- Planungen -->
      <section class="planungen-section">
        <div class="section-header">
          <div>
            <h2>Heutige Planungen</h2>

            <p>
              Alle Einträge des Kurses auf einen Blick.
            </p>
          </div>

          <button class="secondary-button" @click="neuePlanung">
            + Eintrag hinzufügen
          </button>
        </div>

        <!-- Keine Planungen -->
        <div v-if="planungen.length === 0" class="empty-state">
          <div class="empty-icon">🍴</div>

          <h3>Noch keine Planungen</h3>

          <p>
            Sei die erste Person und trage deine
            Mittagspause ein.
          </p>

          <button class="primary-button" @click="neuePlanung">
            Planung eintragen
          </button>
        </div>

        <!-- Planungskarten -->
        <div v-else class="planung-grid">
          <article v-for="planung in planungen" :key="planung.id" class="planung-card">
            <div class="planung-top">
              <div class="avatar">
                {{ planung.name.charAt(0).toUpperCase() }}
              </div>

              <div>
                <h3>{{ planung.name }}</h3>

                <span v-if="planung.essenDabei === 'ja'" class="badge badge-green">
                  Essen dabei
                </span>

                <span v-else class="badge badge-orange">
                  Holt sich etwas
                </span>
              </div>
            </div>

            <div class="planung-details">
              <div v-if="planung.essenDabei === 'ja'" class="detail-row">
                <span class="detail-icon">🥪</span>

                <div>
                  <small>Essen</small>
                  <strong>Eigenes Essen dabei</strong>
                </div>
              </div>

              <div v-if="planung.essenDabei === 'nein'" class="detail-row">
                <span class="detail-icon">🛍️</span>

                <div>
                  <small>Holt Essen bei</small>

                  <strong>
                    {{ essenHolenText(planung.essenHolen) }}

                    <template v-if="planung.essenHolen === 'doener'">
                      – {{ doenerText(planung) }}
                    </template>
                  </strong>
                </div>
              </div>

              <div class="detail-row">
                <span class="detail-icon">📍</span>

                <div>
                  <small>Isst</small>

                  <strong>
                    {{ essensOrtText(planung.essensOrt) }}
                  </strong>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <button class="edit-button" @click="planungBearbeiten(planung)">
                Bearbeiten
              </button>

              <button class="delete-button" @click="planungLoeschen(planung.id)">
                Löschen
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>

    <!-- Formular -->
    <main v-if="ansicht === 'formular'" class="form-page">
      <div class="form-container">
        <button class="back-button" @click="ansicht = 'start'">
          ← Zurück zur Übersicht
        </button>

        <div class="form-card">
          <div class="form-header">
            <span class="form-icon">🥗</span>

            <div>
              <h1>
                {{
                  bearbeitungsId
                    ? 'Planung bearbeiten'
                    : 'Mittagspause planen'
                }}
              </h1>

              <p>
                Sag dem Kurs, was du heute in der
                Mittagspause vorhast.
              </p>
            </div>
          </div>

          <form @submit.prevent="planungSpeichern">
            <div v-if="fehler" class="error-message">
              ⚠️ {{ fehler }}
            </div>

            <!-- Name -->
            <div class="form-group">
              <label for="name">
                Dein Name
              </label>

              <input id="name" v-model.trim="name" type="text" placeholder="z. B. Philipp" />
            </div>

            <!-- Essen dabei -->
            <div class="form-group">
              <label>
                Hast du Essen dabei?
              </label>

              <div class="radio-grid">
                <label class="radio-card" :class="{ selected: essenDabei === 'ja' }">
                  <input v-model="essenDabei" type="radio" value="ja" />

                  <span class="radio-icon">🥪</span>

                  <span>
                    <strong>Ja</strong>
                    <small>Ich habe etwas dabei</small>
                  </span>
                </label>

                <label class="radio-card" :class="{ selected: essenDabei === 'nein' }">
                  <input v-model="essenDabei" type="radio" value="nein" />

                  <span class="radio-icon">🛍️</span>

                  <span>
                    <strong>Nein</strong>
                    <small>Ich hole mir etwas</small>
                  </span>
                </label>
              </div>
            </div>

            <!-- Essen holen -->
            <div v-if="essenDabei === 'nein'" class="conditional-box">
              <div class="form-group">
                <label for="essenHolen">
                  Wo möchtest du dir etwas holen?
                </label>

                <select id="essenHolen" v-model="essenHolen">
                  <option value="">
                    Bitte auswählen
                  </option>

                  <option value="rewe">
                    Rewe
                  </option>

                  <option value="doener">
                    Döner
                  </option>

                  <option value="baecker">
                    Bäcker
                  </option>

                  <option value="megges">
                    Megges
                  </option>
                </select>
              </div>

              <!-- Döner -->
              <div v-if="essenHolen === 'doener'" class="form-group">
                <label for="welcherDoener">
                  Welcher Dönerladen?
                </label>

                <select id="welcherDoener" v-model="welcherDoener">
                  <option value="">
                    Bitte auswählen
                  </option>

                  <option value="kebup">
                    Kebup
                  </option>

                  <option value="munzur">
                    Munzur Kebaphaus
                  </option>

                  <option value="king">
                    King Mese Döner
                  </option>

                  <option value="nudelhaus">
                    Nudelhaus
                  </option>

                  <option value="anderer">
                    Anderer Dönerladen
                  </option>
                </select>
              </div>

              <!-- Anderer Döner -->
              <div v-if="welcherDoener === 'anderer'" class="form-group">
                <label for="andererDoener">
                  Name des Dönerladens
                </label>

                <input id="andererDoener" v-model.trim="andererDoener" type="text" placeholder="Dönerladen eingeben" />
              </div>
            </div>

            <!-- Essensort -->
            <div class="form-group">
              <label for="essensOrt">
                Wo möchtest du essen?
              </label>

              <select id="essensOrt" v-model="essensOrt">
                <option value="">
                  Bitte auswählen
                </option>

                <option value="raum">
                  Im Raum
                </option>

                <option value="kosmos">
                  Kosmos
                </option>

                <option value="draussen">
                  Irgendwo draußen
                </option>

                <option value="marvin">
                  Bei Marvin
                </option>
              </select>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-button" @click="ansicht = 'start'">
                Abbrechen
              </button>

              <button type="submit" class="primary-button">
                {{
                  bearbeitungsId
                    ? 'Änderungen speichern'
                    : 'Planung speichern'
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  background: #f7f8f5;
  color: #20241f;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

/* Header */

.header {
  background: white;
  border-bottom: 1px solid #e7e9e4;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-inner {
  max-width: 1180px;
  margin: 0 auto;
  min-height: 76px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.logo {
  border: none;
  background: none;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-align: left;
  color: inherit;
}

.logo-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  background: #eff6e9;
  border-radius: 13px;
  font-size: 24px;
}

.logo strong,
.logo small {
  display: block;
}

.logo strong {
  font-size: 17px;
}

.logo small {
  color: #747b70;
  margin-top: 2px;
}

nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-button {
  border: none;
  background: transparent;
  padding: 10px 15px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #656b62;
  cursor: pointer;
}

.nav-button:hover,
.nav-button.aktiv {
  background: #f1f3ee;
  color: #1f241d;
}

.nav-primary {
  background: #315c37;
  color: white;
}

.nav-primary:hover {
  background: #274b2c;
  color: white;
}

/* Layout */

.container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 42px 24px 80px;
}

/* Hero */

.hero {
  min-height: 280px;
  background:
    linear-gradient(120deg,
      #eaf2e4,
      #f4eee0);
  border-radius: 28px;
  padding: 46px 52px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  overflow: hidden;
}

.hero-label {
  display: inline-block;
  color: #426148;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.4px;
  margin-bottom: 13px;
}

.hero h1 {
  margin: 0;
  font-size: clamp(36px, 5vw, 58px);
  line-height: 1.02;
  letter-spacing: -2px;
}

.hero p {
  max-width: 620px;
  color: #60675d;
  font-size: 17px;
  line-height: 1.65;
  margin: 20px 0 28px;
}

.hero-emoji {
  font-size: 110px;
  transform: rotate(7deg);
}

/* Buttons */

.primary-button,
.secondary-button,
.cancel-button,
.edit-button,
.delete-button,
.back-button {
  font-family: inherit;
  cursor: pointer;
}

.primary-button {
  border: none;
  background: #315c37;
  color: white;
  border-radius: 12px;
  padding: 13px 20px;
  font-size: 15px;
  font-weight: 700;
}

.primary-button:hover {
  background: #274b2c;
}

.secondary-button {
  border: 1px solid #d8ddd4;
  background: white;
  border-radius: 11px;
  padding: 11px 16px;
  font-weight: 600;
  color: #343a31;
}

/* Status */

.status-hinweis {
  margin: 20px 0 0;
  padding: 12px 15px;
  border-radius: 11px;
  background: #eef2ea;
  color: #444b41;
  font-size: 14px;
  font-weight: 600;
}

.status-fehler {
  background: #fff1ee;
  color: #9d4336;
}

/* Statistik */

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e8e2;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
}

.stat-icon {
  width: 45px;
  height: 45px;
  display: grid;
  place-items: center;
  background: #f2f5ef;
  border-radius: 12px;
  font-size: 22px;
}

.stat-number,
.stat-label {
  display: block;
}

.stat-number {
  font-size: 25px;
  font-weight: 800;
}

.stat-label {
  color: #777e74;
  font-size: 13px;
  margin-top: 2px;
}

/* Übersicht */

.planungen-section {
  margin-top: 50px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
  margin-bottom: 22px;
}

.section-header h2 {
  margin: 0 0 5px;
  font-size: 26px;
}

.section-header p {
  margin: 0;
  color: #747a71;
}

.planung-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.planung-card {
  background: white;
  border: 1px solid #e3e6e0;
  border-radius: 18px;
  padding: 21px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.planung-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(32, 45, 30, 0.08);
}

.planung-top {
  display: flex;
  align-items: center;
  gap: 13px;
  padding-bottom: 18px;
  border-bottom: 1px solid #eceee9;
}

.avatar {
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #315c37;
  color: white;
  font-weight: 800;
  font-size: 18px;
}

.planung-top h3 {
  margin: 0 0 5px;
  font-size: 17px;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
}

.badge-green {
  background: #eaf5e7;
  color: #426642;
}

.badge-orange {
  background: #fff0dc;
  color: #8c5d20;
}

.planung-details {
  padding: 17px 0 8px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-row {
  display: flex;
  gap: 11px;
  align-items: center;
}

.detail-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  background: #f5f6f3;
  border-radius: 9px;
}

.detail-row small,
.detail-row strong {
  display: block;
}

.detail-row small {
  color: #858b81;
  font-size: 11px;
  margin-bottom: 2px;
}

.detail-row strong {
  font-size: 14px;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eceee9;
}

.edit-button,
.delete-button {
  flex: 1;
  padding: 9px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
}

.edit-button {
  border: 1px solid #d9ddd5;
  background: white;
  color: #3b4338;
}

.delete-button {
  border: none;
  background: #fff0ed;
  color: #a94335;
}

/* Empty State */

.empty-state {
  background: white;
  border: 1px dashed #ccd2c8;
  border-radius: 20px;
  padding: 55px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
}

.empty-state h3 {
  margin: 15px 0 5px;
}

.empty-state p {
  color: #787f74;
  margin-bottom: 22px;
}

/* Formular */

.form-page {
  min-height: calc(100vh - 76px);
  padding: 42px 20px 80px;
}

.form-container {
  max-width: 720px;
  margin: 0 auto;
}

.back-button {
  border: none;
  background: transparent;
  padding: 0;
  color: #586257;
  font-weight: 600;
  margin-bottom: 20px;
}

.form-card {
  background: white;
  border: 1px solid #e1e5de;
  border-radius: 24px;
  padding: 34px;
  box-shadow: 0 12px 40px rgba(40, 50, 35, 0.06);
}

.form-header {
  display: flex;
  gap: 17px;
  align-items: flex-start;
  margin-bottom: 32px;
}

.form-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  background: #edf5e8;
  border-radius: 15px;
  font-size: 27px;
}

.form-header h1 {
  margin: 0 0 5px;
  font-size: 28px;
}

.form-header p {
  margin: 0;
  color: #777e73;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 24px;
}

.form-group>label {
  display: block;
  margin-bottom: 9px;
  font-size: 14px;
  font-weight: 700;
}

input[type="text"],
select {
  width: 100%;
  height: 48px;
  padding: 0 13px;
  border: 1px solid #d9ddd5;
  border-radius: 11px;
  background: white;
  font: inherit;
  color: #292e27;
  outline: none;
}

input[type="text"]:focus,
select:focus {
  border-color: #5a7b5e;
  box-shadow: 0 0 0 3px rgba(72, 108, 76, 0.1);
}

.radio-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.radio-card {
  padding: 17px;
  border: 1px solid #dce0d8;
  border-radius: 14px;
  display: flex;
  gap: 11px;
  align-items: center;
  cursor: pointer;
  transition: 0.15s;
}

.radio-card:hover {
  border-color: #aeb9aa;
}

.radio-card.selected {
  background: #eef5e9;
  border-color: #66806a;
}

.radio-card input {
  display: none;
}

.radio-icon {
  font-size: 26px;
}

.radio-card strong,
.radio-card small {
  display: block;
}

.radio-card small {
  color: #7b8277;
  margin-top: 2px;
}

.conditional-box {
  background: #f8faf6;
  padding: 20px;
  margin-bottom: 24px;
  border-radius: 15px;
  border: 1px solid #e2e7df;
}

.conditional-box .form-group:last-child {
  margin-bottom: 0;
}

.error-message {
  padding: 12px 15px;
  background: #fff1ee;
  color: #9d4336;
  border: 1px solid #f0d2cb;
  border-radius: 11px;
  margin-bottom: 23px;
  font-size: 14px;
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
}

.cancel-button {
  border: 1px solid #d8ddd4;
  background: white;
  border-radius: 11px;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 600;
  color: #5c6359;
}

/* Responsive */

@media (max-width: 900px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .planung-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hero-emoji {
    font-size: 80px;
  }
}

@media (max-width: 650px) {
  .header-inner {
    padding: 0 15px;
  }

  .logo small {
    display: none;
  }

  .nav-button:first-child {
    display: none;
  }

  .container {
    padding: 25px 15px 60px;
  }

  .hero {
    padding: 30px 25px;
  }

  .hero-emoji {
    display: none;
  }

  .stats {
    grid-template-columns: 1fr 1fr;
  }

  .planung-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .radio-grid {
    grid-template-columns: 1fr;
  }

  .form-card {
    padding: 23px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>