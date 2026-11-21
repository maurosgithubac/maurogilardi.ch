/**
 * Treemap (Squarified, Bruls et al.): verteilt Werte als Rechtecke in eine Fläche.
 * Je grösser der Wert, desto grösser die Kachel. Rein rechnerisch, ohne Abhängigkeiten.
 */

export type TreeItem<T> = { id: string; value: number; data: T };
export type TreeRect<T> = { item: TreeItem<T>; x: number; y: number; w: number; h: number };

function worst(areas: number[], side: number) {
  const sum = areas.reduce((a, b) => a + b, 0);
  const max = Math.max(...areas);
  const min = Math.min(...areas);
  return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min));
}

export function squarify<T>(items: TreeItem<T>[], width: number, height: number): TreeRect<T>[] {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (total <= 0 || width <= 0 || height <= 0) return [];

  const sorted = [...items].sort((a, b) => b.value - a.value);
  const scale = (width * height) / total;
  const areas = sorted.map((i) => i.value * scale);

  const out: TreeRect<T>[] = [];
  let x = 0;
  let y = 0;
  let w = width;
  let h = height;
  let i = 0;

  while (i < sorted.length) {
    const side = Math.min(w, h);
    const row = [areas[i]];
    let j = i + 1;
    while (j < sorted.length) {
      const next = [...row, areas[j]];
      if (worst(next, side) <= worst(row, side)) {
        row.push(areas[j]);
        j += 1;
      } else {
        break;
      }
    }
    const sum = row.reduce((a, b) => a + b, 0);
    if (w >= h) {
      // Spalte links, Kacheln übereinander
      const colW = sum / h;
      let cy = y;
      row.forEach((a, k) => {
        const rh = a / colW;
        out.push({ item: sorted[i + k], x, y: cy, w: colW, h: rh });
        cy += rh;
      });
      x += colW;
      w -= colW;
    } else {
      // Zeile oben, Kacheln nebeneinander
      const rowH = sum / w;
      let cx = x;
      row.forEach((a, k) => {
        const rw = a / rowH;
        out.push({ item: sorted[i + k], x: cx, y, w: rw, h: rowH });
        cx += rw;
      });
      y += rowH;
      h -= rowH;
    }
    i = j;
  }
  return out;
}
