<script setup>
defineProps({
  anzahlTeilnehmer: {
    type: Number,
    required: true
  },

  anzahlEssenDabei: {
    type: Number,
    required: true
  },

  haeufigstesEssenHolen: {
    type: Array,
    required: true
  },

  haeufigsteEssensOrte: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <section class="stats">

    <!-- Teilnehmer -->
    <div v-if="anzahlTeilnehmer > 0" class="stat-card">
      <span class="stat-icon">
        👥
      </span>

      <div>
        <span class="stat-number">
          {{ anzahlTeilnehmer }}
        </span>

        <span class="stat-label">
          Teilnehmer
        </span>
      </div>
    </div>

    <!-- Essen dabei -->
    <div v-if="anzahlEssenDabei > 0" class="stat-card">
      <span class="stat-icon">
        🥪
      </span>

      <div>
        <span class="stat-number">
          {{ anzahlEssenDabei }}
        </span>

        <span class="stat-label">
          Essen dabei
        </span>
      </div>
    </div>

    <!-- Häufigste Orte zum Essen holen -->
    <div v-for="eintrag in haeufigstesEssenHolen" :key="'holen-' + eintrag.text" class="stat-card">
      <span class="stat-icon">
        🛍️
      </span>

      <div>
        <span class="stat-number">
          {{ eintrag.anzahl }}
        </span>

        <span class="stat-label">
          {{ eintrag.text }}
        </span>
      </div>
    </div>

    <!-- Häufigste Essensorte -->
    <div v-for="eintrag in haeufigsteEssensOrte" :key="'essen-' + eintrag.text" class="stat-card">
      <span class="stat-icon">
        📍
      </span>

      <div>
        <span class="stat-number">
          {{ eintrag.anzahl }}
        </span>

        <span class="stat-label">
          {{ eintrag.text }}
        </span>
      </div>
    </div>

  </section>
</template>

<style scoped>
.stats {
  display: grid;

  grid-template-columns:
    repeat(auto-fit,
      minmax(220px, 1fr));

  gap: 16px;
  margin-top: 24px;
}

.stat-card {
  background: white;

  border:
    1px solid #e5e8e2;

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

  flex-shrink: 0;
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

@media (max-width: 650px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>