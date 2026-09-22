<script setup>
defineProps({
  ansicht: {
    type: String,
    required: true
  }
})

const emit = defineEmits([
  'start',
  'neu'
])
</script>

<template>
  <header class="header">
    <div class="header-inner">

      <button class="logo" @click="emit('start')">
        <span class="logo-icon">
          🍽️
        </span>

        <span>
          <strong>
            Mittagspausen Planung
          </strong>
        </span>
      </button>

      <nav>
        <button class="nav-button" :class="{ aktiv: ansicht === 'start' }" @click="emit('start')">
          Übersicht
        </button>

        <button class="nav-button nav-primary" @click="emit('neu')">
          + Eintragen
        </button>
      </nav>

    </div>
  </header>
</template>

<style scoped>
.header {
  background: white;

  border-bottom:
    1px solid #e7e9e4;

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

.logo strong {
  display: block;
  font-size: 17px;
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

@media (max-width: 650px) {
  .header-inner {
    padding: 0 15px;
  }

  .nav-button:first-child {
    display: none;
  }
}
</style>