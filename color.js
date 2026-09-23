// Small, dependency-free color conversions shared by the picker and legacy reader.
export function normalizarCor(value) {
  if (typeof value !== "string") return null;
  let color = value.trim().toLowerCase();
  const aliases = { rosa: "pink", amarelo: "yellow", verde: "green", azul: "blue", laranja: "orange", roxo: "purple", vermelho: "red", lilas: "#cec0ec", "lilás": "#cec0ec" };
  color = aliases[color] || color;
  if (/^#[\da-f]{3}$/i.test(color)) color = "#" + [...color.slice(1)].map(c => c + c).join("");
  if (/^#[\da-f]{6}$/i.test(color)) return color.toUpperCase();
  // Accept old CSS named/RGB colors, never CSS variables, URLs or transparent ink.
  if (!/^[a-z]+$|^rgb\([\d\s,.%]+\)$/i.test(color) || /^(transparent|currentcolor|inherit|initial|unset|revert)$/.test(color) || !CSS.supports("color", color)) return null;
  const context = document.createElement("canvas").getContext("2d");
  context.fillStyle = color;
  const result = context.fillStyle;
  if (/^#[\da-f]{6}$/i.test(result)) return result.toUpperCase();
  const channels = result.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return channels ? "#" + channels.slice(1).map(n => Number(n).toString(16).padStart(2, "0")).join("").toUpperCase() : null;
}

export function hsvParaHex(h, s, v) {
  const hue = ((h % 360) + 360) % 360 / 60, chroma = v * s;
  const x = chroma * (1 - Math.abs(hue % 2 - 1)), m = v - chroma;
  const rgb = [[chroma,x,0],[x,chroma,0],[0,chroma,x],[0,x,chroma],[x,0,chroma],[chroma,0,x]][Math.floor(hue)];
  return "#" + rgb.map(n => Math.round((n + m) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function hexParaHSV(hex) {
  const [r,g,b] = hex.slice(1).match(/../g).map(n => parseInt(n, 16) / 255);
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
  let h = !d ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}
