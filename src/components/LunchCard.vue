<script setup>
const props = defineProps({
  planung: {
    type: Object,
    required: true
  },

  essenHolenText: {
    type: Function,
    required: true
  },

  doenerText: {
    type: Function,
    required: true
  },

  essensOrtText: {
    type: Function,
    required: true
  }
})

const emit = defineEmits([
  'bearbeiten',
  'loeschen'
])
</script>

<template>
  <article class="planung-card">

    <div class="planung-top">

      <div class="avatar">
        {{
          planung.name
            .charAt(0)
            .toUpperCase()
        }}
      </div>

      <div>
        <h3>
          {{ planung.name }}
        </h3>

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
        <span class="detail-icon">
          🥪
        </span>

        <div>
          <small>
            Essen
          </small>

          <strong>
            Eigenes Essen dabei
          </strong>
        </div>
      </div>

      <div v-if="planung.essenDabei === 'nein'" class="detail-row">
        <span class="detail-icon">
          🛍️
        </span>

        <div>
          <small>
            Holt Essen bei
          </small>

          <strong>
            {{
              essenHolenText(
                planung.essenHolen,
                planung
              )
            }}

            <template v-if="planung.essenHolen === 'doener'">
              –
              {{ doenerText(planung) }}
            </template>
          </strong>
        </div>
      </div>

      <div class="detail-row">
        <span class="detail-icon">
          📍
        </span>

        <div>
          <small>
            Isst
          </small>

          <strong>
            {{
              essensOrtText(
                planung.essensOrt,
                planung
              )
            }}
          </strong>
        </div>
      </div>

    </div>

    <div class="card-actions">

      <button class="edit-button" @click="emit('bearbeiten', planung)">
        Bearbeiten
      </button>

      <button class="delete-button" @click="emit('loeschen', planung.id)">
        Löschen
      </button>

    </div>

  </article>
</template>

<style scoped>
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

  box-shadow:
    0 10px 28px rgba(32, 45, 30, 0.08);
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

  cursor: pointer;
  font-family: inherit;
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
</style>