// proto-tweaks.jsx — Tweaks panel for the Pedala Sampa prototype.
// Drives the vanilla app via window.PSTweaks.apply(). Mounts into #tweaks-root.

const THEMES = [
  { key: 'asfalto',  label: 'Asfalto',      sw: ['#1A120B', '#00796B', '#FFB300', '#E8E0D0'] },
  { key: 'ciclovia', label: 'Ciclovia',     sw: ['#11271C', '#1F8A4C', '#F2B33A', '#DCE7DA'] },
  { key: 'sol',      label: 'Pôr do Sol',   sw: ['#2A1714', '#D9542B', '#F2A23C', '#F0E2D2'] },
  { key: 'metro',    label: 'Metrô SP',     sw: ['#14223B', '#1565C0', '#FFB300', '#E1E6EC'] },
  { key: 'coral',    label: 'Coral & Teal', sw: ['#1E2A2B', '#0E8F86', '#FF5A5F', '#E9E4DE'] },
  { key: 'noturno',  label: 'Noturno',      sw: ['#14130E', '#2FCB7E', '#FFC83D', '#211F18'] },
];
const FONTS = [
  { value: 'sinal',     label: 'Sinal — Archivo' },
  { value: 'grotesca',  label: 'Grotesca — Space Grotesk' },
  { value: 'editorial', label: 'Editorial — Bricolage' },
  { value: 'geo',       label: 'Geo — Unbounded' },
  { value: 'classica',  label: 'Clássica — Syne' },
];

const PS_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "ciclovia",
  "font": "sinal",
  "density": "compact",
  "icons": true
}/*EDITMODE-END*/;

function paletteFor(key) {
  const t = THEMES.find((x) => x.key === key) || THEMES[0];
  return t.sw;
}
function themeForPalette(sw) {
  const j = JSON.stringify(sw);
  const t = THEMES.find((x) => JSON.stringify(x.sw) === j);
  return t ? t.key : 'asfalto';
}

function PSTweaksApp() {
  const [t, setTweak] = useTweaks(PS_TWEAK_DEFAULTS);

  React.useEffect(() => {
    if (window.PSTweaks) window.PSTweaks.apply(t);
  }, [t.theme, t.font, t.density, t.icons]);

  // header light/dark toggle drives the same tweak state
  React.useEffect(() => {
    const onSet = (e) => setTweak('theme', e.detail);
    window.addEventListener('ps-set-theme', onSet);
    return () => window.removeEventListener('ps-set-theme', onSet);
  }, [setTweak]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Tema" />
      <TweakRadio
        label="Claro / escuro"
        value={t.theme}
        options={[{ value: 'ciclovia', label: 'Ciclovia' }, { value: 'noturno', label: 'Noturno' }]}
        onChange={(v) => setTweak('theme', v)}
      />
      <TweakSection label="Tipografia" />
      <TweakSelect
        label="Par de fontes"
        value={t.font}
        options={FONTS}
        onChange={(v) => setTweak('font', v)}
      />
      <TweakSection label="Layout" />
      <TweakRadio
        label="Densidade da lista"
        value={t.density}
        options={[{ value: 'comfortable', label: 'Confortável' }, { value: 'compact', label: 'Compacta' }]}
        onChange={(v) => setTweak('density', v)}
      />
      <TweakToggle
        label="Ícones nos dados"
        value={t.icons}
        onChange={(v) => setTweak('icons', v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<PSTweaksApp />);
