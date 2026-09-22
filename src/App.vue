<script setup>
import { ref } from 'vue'

import AppHeader from './components/AppHeader.vue'
import LunchForm from './components/LunchForm.vue'
import LunchCard from './components/LunchCard.vue'
import LunchStats from './components/LunchStats.vue'

import {
  useLunchPlanning
} from './composables/useLunchPlanning'

// --------------------------------------------------
// Navigation
// --------------------------------------------------

const ansicht = ref('start')

// --------------------------------------------------
// Planungslogik
// --------------------------------------------------

const {
  name,
  essenDabei,
  essenHolen,
  welcherDoener,
  andererDoener,
  andererEssensOrt,
  essensOrt,

  fehler,
  bearbeitungsId,

  planungen,

  anzahlTeilnehmer,
  anzahlEssenDabei,
  haeufigstesEssenHolen,
  haeufigsteEssensOrte,

  essensOrtOptionen,

  essenHolenText,
  doenerText,
  essensOrtText,

  planungSpeichern,
  planungBearbeiten,
  planungLoeschen,
  formularZuruecksetzen
} = useLunchPlanning()

// --------------------------------------------------
// Neue Planung
// --------------------------------------------------

function neuePlanung() {
  formularZuruecksetzen()
  ansicht.value = 'formular'
}

// --------------------------------------------------
// Speichern
// --------------------------------------------------

function speichern() {
  const erfolgreich = planungSpeichern()

  if (erfolgreich) {
    ansicht.value = 'start'
  }
}

// --------------------------------------------------
// Bearbeiten
// --------------------------------------------------

function bearbeiten(planung) {
  planungBearbeiten(planung)
  ansicht.value = 'formular'
}

// --------------------------------------------------
// Abbrechen
// --------------------------------------------------

function abbrechen() {
  formularZuruecksetzen()
  ansicht.value = 'start'
}
</script>

<template>
  <div class="app">

    <!-- Header-Komponente -->
    <AppHeader :ansicht="ansicht" @start="ansicht = 'start'" @neu="neuePlanung" />

    <!-- Startseite -->
    <main v-if="ansicht === 'start'" class="container">

      <!-- Hero -->
      <section class="hero">

        <div>
          <span class="hero-label">
            HEUTIGE MITTAGSPAUSE
          </span>

          <h1>
            Was machen wir heute?
          </h1>

          <p>
            Sieh auf einen Blick,
            wer Essen dabeihat,
            wer sich etwas holt
            und wo gemeinsam gegessen wird.
          </p>

          <button class="primary-button" @click="neuePlanung">
            Meine Planung eintragen
          </button>
        </div>

        <div class="hero-emoji">
          🥪
        </div>

      </section>

      <!-- Statistik-Komponente -->
      <LunchStats :anzahl-teilnehmer="anzahlTeilnehmer" :anzahl-essen-dabei="anzahlEssenDabei"
        :haeufigstes-essen-holen="haeufigstesEssenHolen" :haeufigste-essens-orte="haeufigsteEssensOrte" />

      <!-- Planungen -->
      <section class="planungen-section">

        <div class="section-header">

          <div>
            <h2>
              Heutige Planungen
            </h2>

            <p>
              Alle Einträge des Kurses
              auf einen Blick.
            </p>
          </div>

          <button class="secondary-button" @click="neuePlanung">
            + Eintrag hinzufügen
          </button>

        </div>

        <!-- Noch keine Einträge -->
        <div v-if="planungen.length === 0" class="empty-state">
          <div class="empty-icon">
            🍴
          </div>

          <h3>
            Noch keine Planungen
          </h3>

          <p>
            Sei die erste Person
            und trage deine Mittagspause ein.
          </p>

          <button class="primary-button" @click="neuePlanung">
            Planung eintragen
          </button>
        </div>

        <!-- Planungskarten -->
        <div v-else class="planung-grid">
          <LunchCard v-for="planung in planungen" :key="planung.id" :planung="planung"
            :essen-holen-text="essenHolenText" :doener-text="doenerText" :essens-ort-text="essensOrtText"
            @bearbeiten="bearbeiten" @loeschen="planungLoeschen" />
        </div>

      </section>

    </main>

    <!-- Formular-Komponente -->
    <LunchForm v-if="ansicht === 'formular'" v-model:name="name" v-model:essenDabei="essenDabei"
      v-model:essenHolen="essenHolen" v-model:welcherDoener="welcherDoener" v-model:andererDoener="andererDoener"
      v-model:andererEssensOrt="andererEssensOrt" v-model:essensOrt="essensOrt" :fehler="fehler"
      :bearbeitungs-id="bearbeitungsId" :essens-ort-optionen="essensOrtOptionen" @speichern="speichern"
      @abbrechen="abbrechen" />

  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.app {
  width: 100%;
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

/* --------------------------------------------------
   Layout
-------------------------------------------------- */

.container {
  max-width: 1180px;
  margin: 0 auto;

  padding:
    42px 24px 80px;
}

/* --------------------------------------------------
   Hero
-------------------------------------------------- */

.hero {
  min-height: 280px;

  background:
    linear-gradient(120deg,
      #eaf2e4,
      #f4eee0);

  border-radius: 28px;

  padding:
    46px 52px;

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

  font-size:
    clamp(36px,
      5vw,
      58px);

  line-height: 1.02;
  letter-spacing: -2px;
}

.hero p {
  max-width: 620px;

  color: #60675d;

  font-size: 17px;
  line-height: 1.65;

  margin:
    20px 0 28px;
}

.hero-emoji {
  font-size: 110px;

  transform:
    rotate(7deg);
}

/* --------------------------------------------------
   Buttons
-------------------------------------------------- */

.primary-button,
.secondary-button {
  font-family: inherit;
  cursor: pointer;
}

.primary-button {
  border: none;

  background: #315c37;
  color: white;

  border-radius: 12px;

  padding:
    13px 20px;

  font-size: 15px;
  font-weight: 700;
}

.primary-button:hover {
  background: #274b2c;
}

.secondary-button {
  border:
    1px solid #d8ddd4;

  background: white;

  border-radius: 11px;

  padding:
    11px 16px;

  font-weight: 600;

  color: #343a31;
}

/* --------------------------------------------------
   Planungen
-------------------------------------------------- */

.planungen-section {
  margin-top: 50px;
}

.section-header {
  display: flex;

  justify-content:
    space-between;

  align-items: end;

  gap: 20px;

  margin-bottom: 22px;
}

.section-header h2 {
  margin:
    0 0 5px;

  font-size: 26px;
}

.section-header p {
  margin: 0;

  color: #747a71;
}

.planung-grid {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 18px;
}

/* --------------------------------------------------
   Noch keine Planungen
-------------------------------------------------- */

.empty-state {
  background: white;

  border:
    1px dashed #ccd2c8;

  border-radius: 20px;

  padding:
    55px 20px;

  text-align: center;
}

.empty-icon {
  font-size: 48px;
}

.empty-state h3 {
  margin:
    15px 0 5px;
}

.empty-state p {
  color: #787f74;

  margin-bottom: 22px;
}

/* --------------------------------------------------
   Responsive
-------------------------------------------------- */

@media (max-width: 900px) {

  .planung-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .hero-emoji {
    font-size: 80px;
  }

}

@media (max-width: 650px) {

  .container {
    padding:
      25px 15px 60px;
  }

  .hero {
    padding:
      30px 25px;
  }

  .hero-emoji {
    display: none;
  }

  .planung-grid {
    grid-template-columns:
      1fr;
  }

  .section-header {
    align-items:
      flex-start;

    flex-direction:
      column;
  }

}
</style>