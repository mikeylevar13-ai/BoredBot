const $ = (id) => document.getElementById(id);

const state = {
  current: null,
  streak: Number(localStorage.getItem("bb_streak") || 0),
  count: Number(localStorage.getItem("bb_count") || 0),
  history: JSON.parse(localStorage.getItem("bb_history") || "[]"),
};

const missions = [
  { time: 2,  energy:["low","med","high"], place:["any","home"],   text:"2 min: drink a full glass of water and take 10 slow breaths." },
  { time: 5,  energy:["low","med"],        place:["any","home"],   text:"5 min: delete 10 junk photos or screenshots." },
  { time: 5,  energy:["med","high"],       place:["outside","any"],text:"5 min: walk to the nearest corner and back—no phone." },
  { time: 10, energy:["low","med"],        place:["home","any"],   text:"10 min: tidy ONE surface (desk/table) until it looks ‘finished’." },
  { time: 10, energy:["med","high"],       place:["any"],          text:"10 min: do a quick body circuit: 10 squats, 10 wall pushups, 30s plank ×2." },
  { time: 20, energy:["med","high"],       place:["any","home"],   text:"20 min: TheoTown mission—add 1 new neighborhood + 1 park per block + 1 service building." },
  { time: 20, energy:["low","med"],        place:["any"],          text:"20 min: learn something—watch one short tutorial and write 5 bullet takeaways." },
  { time: 60, energy:["med","high"],       place:["home","any"],   text:"60 min: build something—make a tiny project (notes app, calculator, or city district plan)." },
];

function save() {
  localStorage.setItem("bb_streak", String(state.streak));
  localStorage.setItem("bb_count", String(state.count));
  localStorage.setItem("bb_history", JSON.stringify(state.history.slice(0, 30)));
}

function render() {
  $("streak").textContent = state.streak;
  $("count").textContent = state.count;

  const ul = $("historyList");
  ul.innerHTML = "";
  state.history.slice(0, 12).forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${new Date(item.ts).toLocaleString()}: ${item.text}`;
    ul.appendChild(li);
  });
}

function pickMission() {
  const time = Number($("time").value);
  const energy = $("energy").value;
  const place = $("place").value;

  const pool = missions.filter(m =>
    m.time === time &&
    m.energy.includes(energy) &&
    m.place.includes(place)
  );

  // fallback: relax place restriction if empty
  const pool2 = pool.length ? pool : missions.filter(m =>
    m.time === time && m.energy.includes(energy) && m.place.includes("any")
  );

  const chosen = pool2[Math.floor(Math.random() * pool2.length)];
  state.current = chosen?.text || "No mission found—try different settings.";
  $("missionText").textContent = state.current;

  $("swap").disabled = !chosen;
  $("done").disabled = !chosen;
}

$("gen").addEventListener("click", pickMission);
$("swap").addEventListener("click", pickMission);

$("done").addEventListener("click", () => {
  if (!state.current) return;
  state.count += 1;
  state.streak += 1;
  state.history.unshift({ ts: Date.now(), text: state.current });
  save();
  render();
});

$("reset").addEventListener("click", () => {
  state.streak = 0;
  save();
  render();
});

// PWA: register service worker (needs to be served over HTTPS or localhost)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

render();
