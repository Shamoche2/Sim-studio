const { C, text, rect, circle } = Sim;
Sim({
  title: "Colour: Mixing Light and Filters",
  intro: "Screens make every colour by mixing red, green and blue light. Overlap all three and you get white. Filters work the other way: they absorb some colours and only let others through.",
  controls: [
    { id: "r", label: "Red light", min: 0, max: 255, step: 5, value: 255 },
    { id: "g", label: "Green light", min: 0, max: 255, step: 5, value: 255 },
    { id: "b", label: "Blue light", min: 0, max: 255, step: 5, value: 0 },
    { id: "filter", label: "Filter in front of a white light", type: "select", options: [["none", "No filter"], ["red", "Red filter"], ["green", "Green filter"], ["blue", "Blue filter"], ["yellow", "Yellow filter (red + green)"], ["cyan", "Cyan filter (green + blue)"], ["magenta", "Magenta filter (red + blue)"]] },
  ],
  readouts: [["mix", "Mixed colour"], ["hex", "Screen code"], ["through", "Filter lets through"]],
  name(r, g, b) { const on = (v) => v > 127; const k = `${+on(r)}${+on(g)}${+on(b)}`; return { "000": "black", "100": "red", "010": "green", "001": "blue", "110": "yellow", "011": "cyan", "101": "magenta", "111": "white" }[k]; },
  draw({ ctx, W, H }, s, p) {
    rect(ctx, 0, 0, W, H, "#111");
    const left = W * 0.55, cx = left / 2, cy = H / 2, R = Math.min(left, H) * 0.24, off = R * 0.6;
    ctx.globalCompositeOperation = "lighter";
    circle(ctx, cx, cy - off * 0.7, R, `rgb(${p.r},0,0)`); circle(ctx, cx - off * 0.7, cy + off * 0.5, R, `rgb(0,${p.g},0)`); circle(ctx, cx + off * 0.7, cy + off * 0.5, R, `rgb(0,0,${p.b})`);
    ctx.globalCompositeOperation = "source-over";
    text(ctx, "Overlapping spotlights", 10, 20, { color: "#adb5bd", size: 12 });
    const F = { none: [1, 1, 1], red: [1, 0, 0], green: [0, 1, 0], blue: [0, 0, 1], yellow: [1, 1, 0], cyan: [0, 1, 1], magenta: [1, 0, 1] }[p.filter];
    const fx = left + 20, fw = W - left - 40, y0 = H * 0.2;
    rect(ctx, fx, y0, 40, 40, "#fff", null, 20); text(ctx, "white", fx + 20, y0 + 56, { align: "center", color: "#adb5bd", size: 11 });
    ["#ff0000", "#00ff00", "#0000ff"].forEach((c, i) => { rect(ctx, fx + 44, y0 + 8 + i * 9, fw * 0.35, 5, c); });
    rect(ctx, fx + 44 + fw * 0.35, y0 - 10, 14, 60, `rgba(${F[0] * 255},${F[1] * 255},${F[2] * 255},${p.filter === "none" ? 0.1 : 0.6})`, "#adb5bd", 2);
    ["#ff0000", "#00ff00", "#0000ff"].forEach((c, i) => { if (F[i]) rect(ctx, fx + 58 + fw * 0.35, y0 + 8 + i * 9, fw * 0.35, 5, c); });
    rect(ctx, fx + fw * 0.3, y0 + 90, fw * 0.5, 80, `rgb(${F[0] * 255},${F[1] * 255},${F[2] * 255})`, "#495057", 6);
    text(ctx, "what you see on the screen", fx + fw * 0.55, y0 + 186, { align: "center", color: "#adb5bd", size: 11 });
  },
  read(s, p) { const F = { none: "red, green and blue", red: "red only", green: "green only", blue: "blue only", yellow: "red and green", cyan: "green and blue", magenta: "red and blue" }; return { mix: this.name(p.r, p.g, p.b), hex: "#" + [p.r, p.g, p.b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase(), through: F[p.filter] }; },
  keyIdea: "<b>Key idea:</b> the primary colours of light are red, green and blue. Red + green = yellow, green + blue = cyan, red + blue = magenta, all three = white. A filter transmits its own colour and absorbs the rest.",
  tryThis: ["Make yellow light using only the sliders.", "What colour do you get with red and blue at full strength?", "A red rose is lit through a green filter. What colour does it look, and why?"],
});
