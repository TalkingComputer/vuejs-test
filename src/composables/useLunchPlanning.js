import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted
} from 'vue'

import {
  essenHolenOptionen,
  doenerOptionen,
  festeEssensOrte
} from '../data/options'

import { supabase } from '../lib/supabase'

export function useLunchPlanning() {
  // --------------------------------------------------
  // Formular
  // --------------------------------------------------

  const name = ref('')
  const essenDabei = ref('')
  const essenHolen = ref('')
  const welcherDoener = ref('')
  const andererDoener = ref('')
  const andererEssensOrt = ref('')
  const essensOrt = ref('')

  const fehler = ref('')
  const bearbeitungsId = ref(null)

  // --------------------------------------------------
  // Planungen
  // --------------------------------------------------

  const planungen = ref([])
  const wirdGeladen = ref(false)
  const ladeFehler = ref('')

  // Datenbank-Zeile (snake_case) auf unser
  // Formular-Objekt (camelCase) abbilden
  function zeileZuPlanung(zeile) {
    return {
      id: zeile.id,
      name: zeile.name,
      essenDabei: zeile.essen_dabei,
      essenHolen: zeile.essen_holen ?? '',
      welcherDoener: zeile.welcher_doener ?? '',
      andererDoener: zeile.anderer_doener ?? '',
      andererEssensOrt: zeile.anderer_essens_ort ?? '',
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
      ladeFehler.value =
        'Die Planungen konnten nicht geladen werden.'
      console.error(error)
    } else {
      planungen.value = data.map(zeileZuPlanung)
    }

    wirdGeladen.value = false
  }

  // Planungen beim Start laden und bei Änderungen
  // anderer Nutzer automatisch aktualisieren
  // (Supabase Realtime)
  let realtimeChannel = null

  onMounted(() => {
    planungenLaden()

    realtimeChannel = supabase
      .channel('planungen-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'planungen'
        },
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
      andererEssensOrt.value = ''
    }
  })

  watch(essenHolen, (neuerWert) => {
    if (neuerWert !== 'doener') {
      welcherDoener.value = ''
      andererDoener.value = ''
    }

    if (neuerWert !== 'andererOrt') {
      andererEssensOrt.value = ''
    }

    if (
      neuerWert !== 'megges' &&
      essensOrt.value === 'megges'
    ) {
      essensOrt.value = ''
    }

    if (
      neuerWert !== 'doener' &&
      essensOrt.value === 'doenerladen'
    ) {
      essensOrt.value = ''
    }

    if (
      neuerWert !== 'andererOrt' &&
      essensOrt.value === 'andererOrt'
    ) {
      essensOrt.value = ''
    }
  })

  watch(welcherDoener, (neuerWert) => {
    if (neuerWert !== 'anderer') {
      andererDoener.value = ''
    }

    if (
      !neuerWert &&
      essensOrt.value === 'doenerladen'
    ) {
      essensOrt.value = ''
    }
  })

  // --------------------------------------------------
  // Texte für Anzeige
  // --------------------------------------------------

  function essenHolenText(
    wert,
    planung = null
  ) {
    if (
      wert === 'andererOrt' &&
      planung
    ) {
      return (
        planung.andererEssensOrt ||
        'Anderer Ort'
      )
    }

    const option =
      essenHolenOptionen.find(
        (eintrag) =>
          eintrag.value === wert
      )

    return option
      ? option.text
      : wert
  }

  function doenerText(planung) {
    if (
      planung.welcherDoener ===
      'anderer'
    ) {
      return planung.andererDoener
    }

    const option =
      doenerOptionen.find(
        (eintrag) =>
          eintrag.value ===
          planung.welcherDoener
      )

    return option
      ? option.text
      : ''
  }

  function essensOrtText(
    wert,
    planung
  ) {
    if (wert === 'doenerladen') {
      return `Bei ${doenerText(planung)}`
    }

    if (wert === 'andererOrt') {
      return `Bei ${planung.andererEssensOrt}`
    }

    if (wert === 'megges') {
      return 'Bei Megges'
    }

    const option =
      festeEssensOrte.find(
        (eintrag) =>
          eintrag.value === wert
      )

    return option
      ? option.text
      : wert
  }

  // --------------------------------------------------
  // Statistik
  // --------------------------------------------------

  const anzahlTeilnehmer =
    computed(() => {
      return planungen.value.length
    })

  const anzahlEssenDabei =
    computed(() => {
      return planungen.value.filter(
        (planung) =>
          planung.essenDabei === 'ja'
      ).length
    })

  function haeufigsteWerte(werte) {
    const zaehler = {}

    werte.forEach((wert) => {
      if (!wert) return

      if (!zaehler[wert]) {
        zaehler[wert] = 0
      }

      zaehler[wert]++
    })

    const eintraege =
      Object.entries(zaehler)

    if (eintraege.length === 0) {
      return []
    }

    const maximaleAnzahl =
      Math.max(
        ...eintraege.map(
          ([, anzahl]) => anzahl
        )
      )

    return eintraege
      .filter(
        ([, anzahl]) =>
          anzahl === maximaleAnzahl
      )
      .map(
        ([wert, anzahl]) => ({
          wert,
          anzahl
        })
      )
  }

  const haeufigstesEssenHolen =
    computed(() => {
      const werte =
        planungen.value
          .filter(
            (planung) =>
              planung.essenDabei ===
              'nein'
          )
          .map((planung) => {
            if (
              planung.essenHolen ===
              'andererOrt'
            ) {
              return (
                'andererOrt:' +
                planung.andererEssensOrt
              )
            }

            return planung.essenHolen
          })

      return haeufigsteWerte(
        werte
      ).map((eintrag) => {
        if (
          eintrag.wert.startsWith(
            'andererOrt:'
          )
        ) {
          return {
            anzahl:
              eintrag.anzahl,

            text:
              eintrag.wert.replace(
                'andererOrt:',
                ''
              )
          }
        }

        return {
          anzahl:
            eintrag.anzahl,

          text:
            essenHolenText(
              eintrag.wert
            )
        }
      })
    })

  const haeufigsteEssensOrte =
    computed(() => {
      const werte =
        planungen.value.map(
          (planung) => {
            if (
              planung.essensOrt ===
              'doenerladen'
            ) {
              return (
                'doenerladen:' +
                doenerText(planung)
              )
            }

            if (
              planung.essensOrt ===
              'andererOrt'
            ) {
              return (
                'andererOrt:' +
                planung.andererEssensOrt
              )
            }

            return planung.essensOrt
          }
        )

      return haeufigsteWerte(
        werte
      ).map((eintrag) => {
        if (
          eintrag.wert.startsWith(
            'doenerladen:'
          )
        ) {
          return {
            anzahl:
              eintrag.anzahl,

            text:
              `Bei ${eintrag.wert.replace(
                'doenerladen:',
                ''
              )}`
          }
        }

        if (
          eintrag.wert.startsWith(
            'andererOrt:'
          )
        ) {
          return {
            anzahl:
              eintrag.anzahl,

            text:
              `Bei ${eintrag.wert.replace(
                'andererOrt:',
                ''
              )}`
          }
        }

        const beispielPlanung =
          planungen.value.find(
            (planung) =>
              planung.essensOrt ===
              eintrag.wert
          )

        return {
          anzahl:
            eintrag.anzahl,

          text:
            essensOrtText(
              eintrag.wert,
              beispielPlanung
            )
        }
      })
    })

  // --------------------------------------------------
  // Dönername
  // --------------------------------------------------

  const doenerName =
    computed(() => {
      if (
        welcherDoener.value ===
        'anderer'
      ) {
        return (
          andererDoener.value ||
          'Dönerladen'
        )
      }

      const option =
        doenerOptionen.find(
          (eintrag) =>
            eintrag.value ===
            welcherDoener.value
        )

      return option
        ? option.text
        : 'Dönerladen'
    })

  // --------------------------------------------------
  // Dynamische Essensorte
  // --------------------------------------------------

  const essensOrtOptionen =
    computed(() => {
      const optionen = [
        ...festeEssensOrte
      ]

      if (
        essenHolen.value ===
        'megges'
      ) {
        optionen.push({
          value: 'megges',
          text: 'Bei Megges'
        })
      }

      if (
        essenHolen.value ===
          'doener' &&
        welcherDoener.value
      ) {
        optionen.push({
          value: 'doenerladen',
          text:
            `Bei ${doenerName.value}`
        })
      }

      if (
        essenHolen.value ===
          'andererOrt' &&
        andererEssensOrt.value
      ) {
        optionen.push({
          value: 'andererOrt',
          text:
            `Bei ${andererEssensOrt.value}`
        })
      }

      return optionen
    })

  // --------------------------------------------------
  // Speichern
  // --------------------------------------------------

  async function planungSpeichern() {
    fehler.value = ''

    if (!name.value) {
      fehler.value =
        'Bitte gib deinen Namen ein.'
      return false
    }

    const vorhandenePlanung =
      planungen.value.find(
        (planung) =>
          planung.name
            .trim()
            .toLowerCase() ===
            name.value
              .trim()
              .toLowerCase() &&
          planung.id !==
            bearbeitungsId.value
      )

    if (vorhandenePlanung) {
      fehler.value =
        `${name.value} hat bereits eine Planung eingetragen. Bitte bearbeite den vorhandenen Eintrag.`
      return false
    }

    if (!essenDabei.value) {
      fehler.value =
        'Bitte gib an, ob du Essen dabeihast.'
      return false
    }

    if (
      essenDabei.value ===
        'nein' &&
      !essenHolen.value
    ) {
      fehler.value =
        'Bitte wähle aus, wo du dir Essen holen möchtest.'
      return false
    }

    if (
      essenHolen.value ===
        'doener' &&
      !welcherDoener.value
    ) {
      fehler.value =
        'Bitte wähle einen Dönerladen aus.'
      return false
    }

    if (
      welcherDoener.value ===
        'anderer' &&
      !andererDoener.value
    ) {
      fehler.value =
        'Bitte gib den Namen des Dönerladens ein.'
      return false
    }

    if (
      essenHolen.value ===
        'andererOrt' &&
      !andererEssensOrt.value
    ) {
      fehler.value =
        'Bitte gib ein, wo du dir etwas holen möchtest.'
      return false
    }

    if (!essensOrt.value) {
      fehler.value =
        'Bitte wähle aus, wo du essen möchtest.'
      return false
    }

    const planung = {
      name:
        name.value,

      essen_dabei:
        essenDabei.value,

      essen_holen:
        essenDabei.value === 'nein'
          ? essenHolen.value
          : null,

      welcher_doener:
        essenHolen.value === 'doener'
          ? welcherDoener.value
          : null,

      anderer_doener:
        welcherDoener.value === 'anderer'
          ? andererDoener.value
          : null,

      anderer_essens_ort:
        essenHolen.value === 'andererOrt' ||
        essensOrt.value === 'andererOrt'
          ? andererEssensOrt.value
          : null,

      essens_ort:
        essensOrt.value
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
      fehler.value =
        'Speichern hat nicht geklappt. Bitte versuch es erneut.'
      console.error(error)
      return false
    }

    await planungenLaden()
    formularZuruecksetzen()

    return true
  }

  // --------------------------------------------------
  // Bearbeiten
  // --------------------------------------------------

  function planungBearbeiten(
    planung
  ) {
    name.value =
      planung.name

    essenDabei.value =
      planung.essenDabei

    essenHolen.value =
      planung.essenHolen

    welcherDoener.value =
      planung.welcherDoener

    andererDoener.value =
      planung.andererDoener

    andererEssensOrt.value =
      planung.andererEssensOrt ||
      ''

    essensOrt.value =
      planung.essensOrt

    bearbeitungsId.value =
      planung.id
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
    andererEssensOrt.value = ''
    essensOrt.value = ''

    bearbeitungsId.value = null
    fehler.value = ''
  }

  // --------------------------------------------------
  // Alles exportieren
  // --------------------------------------------------

  return {
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
    wirdGeladen,
    ladeFehler,

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
  }
}