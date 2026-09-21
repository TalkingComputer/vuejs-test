<script setup>
import { ref } from 'vue'

const name = ref('')
const essenDabei = ref('')
const essenHolen = ref('')
const welcherDoener = ref('')
const andererDoener = ref('')
const essensOrt = ref('')
const planungen = ref([])

function planungSpeichern() {
  const planung = {
    name: name.value,
    essenDabei: essenDabei.value,
    essenHolen: essenHolen.value,
    welcherDoener: welcherDoener.value,
    andererDoener: andererDoener.value,
    essensOrt: essensOrt.value
  }

  planungen.value.push(planung)
}

</script>

<template>
  <main>
    <form @submit.prevent="planungSpeichern">
      <h1>Mittagspause</h1>
      <p>Plane deine Mittagspause mit dem Kurs.</p>

      <label for="name">Name:</label>
      <input id="name" v-model.trim="name" type="text" placeholder="Dein Name" />

      <p v-if="name">Hallo {{ name }}</p>

      <p>Essen dabei?</p>

      <label>
        <input type="radio" value="ja" v-model="essenDabei" />
        Ja
      </label>

      <label>
        <input type="radio" value="nein" v-model="essenDabei" />
        Nein
      </label>

      <div v-if="essenDabei === 'nein'">
        <label for="essenHolen">Was möchtest du dir holen?</label>

        <select id="essenHolen" v-model="essenHolen">
          <option value="">Bitte auswählen</option>
          <option value="rewe">Rewe</option>
          <option value="doener">Döner</option>
          <option value="baecker">Bäcker</option>
          <option value="megges">Megges</option>
        </select>

        <div v-if="essenHolen === 'doener'">
          <label for="welcherDoener">Welcher Döner?</label>

          <select id="welcherDoener" v-model="welcherDoener">
            <option value="">Bitte auswählen</option>
            <option value="kebup">Kebup</option>
            <option value="munzur">Munzur Kebaphaus</option>
            <option value="king">King Mese Döner</option>
            <option value="nudelhaus">Nudelhaus</option>
            <option value="anderer">Anderer Dönerladen</option>
          </select>

          <div v-if="welcherDoener === 'anderer'">
            <label for="andererDoener">Anderer Dönerladen:</label>

            <input id="andererDoener" v-model.trim="andererDoener" type="text" placeholder="Anderer Dönerladen" />
          </div>
        </div>
      </div>

      <p>Wo möchtest du essen?</p>

      <select id="essensOrt" v-model="essensOrt">
        <option value="">Bitte auswählen</option>
        <option value="raum">Im Raum</option>
        <option value="kosmos">Kosmos</option>
        <option value="draussen">irgendwo draußen</option>
        <option value="marvin">bei Marvin</option>

      </select>

      <button type="submit">Planung speichern</button>
    </form>

    <h2>Planungen</h2>

    <div v-for="planung in planungen" :key="planung.name">
      <p>
        {{ planung.name }} -
        Essen dabei: {{ planung.essenDabei }} -
      <div v-if="essenDabei === 'nein'">
        Essen holen bei: {{ planung.essenHolen }}
      </div>
      <div v-if="essenHolen === 'doener'">

        <div v-if="welcherDoener === 'anderer'">
          ({{ planung.andererDoener }})
        </div>
        <div v-else>
          ({{ planung.welcherDoener }})
        </div>



      </div>
      Ort: {{ planung.essensOrt }}
      </p>
    </div>

  </main>
</template>

<style scoped></style>