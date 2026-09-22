<script setup>
import {
  essenHolenOptionen,
  doenerOptionen
} from '../data/options'

// Werte, die App.vue an diese Komponente übergibt
const props = defineProps({
  name: String,
  essenDabei: String,
  essenHolen: String,
  welcherDoener: String,
  andererDoener: String,
  andererEssensOrt: String,
  essensOrt: String,

  fehler: String,

  bearbeitungsId: {
    type: [Number, String],
    default: null
  },

  essensOrtOptionen: {
    type: Array,
    default: () => []
  }
})

// Ereignisse, die LunchForm an App.vue zurückgibt
const emit = defineEmits([
  'update:name',
  'update:essenDabei',
  'update:essenHolen',
  'update:welcherDoener',
  'update:andererDoener',
  'update:andererEssensOrt',
  'update:essensOrt',
  'speichern',
  'abbrechen'
])
</script>

<template>
  <main class="form-page">

    <div class="form-container">

      <!-- Zurück -->
      <button class="back-button" @click="emit('abbrechen')">
        ← Zurück zur Übersicht
      </button>

      <div class="form-card">

        <!-- Überschrift -->
        <div class="form-header">

          <span class="form-icon">
            🥗
          </span>

          <div>
            <h1>
              {{
                bearbeitungsId
                  ? 'Planung bearbeiten'
                  : 'Mittagspause planen'
              }}
            </h1>

            <p>
              Sag dem Kurs, was du heute
              in der Mittagspause vorhast.
            </p>
          </div>

        </div>

        <!-- Formular -->
        <form @submit.prevent="emit('speichern')">

          <!-- Fehlermeldung -->
          <div v-if="fehler" class="error-message">
            ⚠️ {{ fehler }}
          </div>

          <!-- Name -->
          <div class="form-group">

            <label for="name">
              Dein Name
            </label>

            <input id="name" :value="name" type="text" placeholder="z. B. Philipp" @input="
              emit(
                'update:name',
                $event.target.value.trimStart()
              )
              " />

          </div>

          <!-- Essen dabei -->
          <div class="form-group">

            <label>
              Hast du Essen dabei?
            </label>

            <div class="radio-grid">

              <!-- JA -->
              <label class="radio-card" :class="{
                selected: essenDabei === 'ja'
              }">

                <input :checked="essenDabei === 'ja'" type="radio" value="ja" @change="
                  emit(
                    'update:essenDabei',
                    'ja'
                  )
                  " />

                <span class="radio-icon">
                  🥪
                </span>

                <span>
                  <strong>
                    Ja
                  </strong>

                  <small>
                    Ich habe etwas dabei
                  </small>
                </span>

              </label>

              <!-- NEIN -->
              <label class="radio-card" :class="{
                selected: essenDabei === 'nein'
              }">

                <input :checked="essenDabei === 'nein'" type="radio" value="nein" @change="
                  emit(
                    'update:essenDabei',
                    'nein'
                  )
                  " />

                <span class="radio-icon">
                  🛍️
                </span>

                <span>
                  <strong>
                    Nein
                  </strong>

                  <small>
                    Ich hole mir etwas
                  </small>
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

              <select id="essenHolen" :value="essenHolen" @change="
                emit(
                  'update:essenHolen',
                  $event.target.value
                )
                ">

                <option value="">
                  Bitte auswählen
                </option>

                <option v-for="option in essenHolenOptionen" :key="option.value" :value="option.value">
                  {{ option.text }}
                </option>

              </select>

            </div>

            <!-- Eigene Eingabe -->
            <div v-if="essenHolen === 'andererOrt'" class="form-group">

              <label for="andererEssensOrt">
                Wo möchtest du dir etwas holen?
              </label>

              <input id="andererEssensOrt" :value="andererEssensOrt" type="text" placeholder="z. B. Asia Imbiss" @input="
                emit(
                  'update:andererEssensOrt',
                  $event.target.value
                )
                " />

            </div>

            <!-- Döner-Auswahl -->
            <div v-if="essenHolen === 'doener'" class="form-group">

              <label for="welcherDoener">
                Welcher Dönerladen?
              </label>

              <select id="welcherDoener" :value="welcherDoener" @change="
                emit(
                  'update:welcherDoener',
                  $event.target.value
                )
                ">

                <option value="">
                  Bitte auswählen
                </option>

                <option v-for="option in doenerOptionen" :key="option.value" :value="option.value">
                  {{ option.text }}
                </option>

              </select>

            </div>

            <!-- Anderer Döner -->
            <div v-if="welcherDoener === 'anderer'" class="form-group">

              <label for="andererDoener">
                Name des Dönerladens
              </label>

              <input id="andererDoener" :value="andererDoener" type="text" placeholder="Dönerladen eingeben" @input="
                emit(
                  'update:andererDoener',
                  $event.target.value
                )
                " />

            </div>

          </div>

          <!-- Essensort -->
          <div class="form-group">

            <label for="essensOrt">
              Wo möchtest du essen?
            </label>

            <select id="essensOrt" :value="essensOrt" @change="
              emit(
                'update:essensOrt',
                $event.target.value
              )
              ">

              <option value="">
                Bitte auswählen
              </option>

              <option v-for="option in essensOrtOptionen" :key="option.value" :value="option.value">
                {{ option.text }}
              </option>

            </select>

          </div>

          <!-- Buttons -->
          <div class="form-actions">

            <button type="button" class="cancel-button" @click="emit('abbrechen')">
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
</template>

<style scoped>
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

  font-family: inherit;
  font-weight: 600;

  margin-bottom: 20px;
  cursor: pointer;
}

.form-card {
  background: white;

  border: 1px solid #e1e5de;
  border-radius: 24px;

  padding: 34px;

  box-shadow:
    0 12px 40px rgba(40, 50, 35, 0.06);
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

  flex-shrink: 0;

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

/* Formularfelder */

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
  box-sizing: border-box;
}

input[type="text"]:focus,
select:focus {
  border-color: #5a7b5e;

  box-shadow:
    0 0 0 3px rgba(72, 108, 76, 0.1);
}

/* Radio-Auswahl */

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

/* Bedingte Felder */

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

/* Fehler */

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

/* Buttons */

.form-actions {
  display: flex;
  justify-content: flex-end;

  gap: 10px;
  padding-top: 10px;
}

.primary-button,
.cancel-button {
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

.cancel-button {
  border: 1px solid #d8ddd4;
  background: white;

  border-radius: 11px;
  padding: 12px 18px;

  font-size: 14px;
  font-weight: 600;

  color: #5c6359;
}

/* Mobile */

@media (max-width: 650px) {
  .form-page {
    padding: 25px 15px 60px;
  }

  .form-card {
    padding: 23px;
  }

  .radio-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>