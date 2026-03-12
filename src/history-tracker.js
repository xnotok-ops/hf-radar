/**
 * HF Radar - History Tracker
 * Tracks model/dataset/space popularity across days
 */

const fs = require("fs");
const path = require("path");

const historyPath = path.join(__dirname, "..", "digests", "history.json");

function loadHistory() {
  try {
    if (fs.existsSync(historyPath)) {
      return JSON.parse(fs.readFileSync(historyPath, "utf-8"));
    }
  } catch (e) {
    console.error("Error loading history:", e.message);
  }
  return { daily: {}, items: {} };
}

function saveHistory(history) {
  const dir = path.dirname(historyPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), "utf-8");
  console.log("History saved: " + historyPath);
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function daysAgo(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function recordDaily(data) {
  const history = loadHistory();
  const today = getToday();

  const todayEntry = {};
  for (const [catId, cat] of Object.entries(data)) {
    todayEntry[catId] = cat.items.map(item => ({
      id: item.id,
      name: item.name,
      likes: item.likes,
      downloads: item.downloads || 0,
      url: item.url,
      description: (item.description || "").slice(0, 100),
    }));
  }
  history.daily[today] = todayEntry;

  const allItems = Object.values(data).flatMap(cat => cat.items);
  for (const item of allItems) {
    const key = item.id;
    if (!history.items[key]) {
      history.items[key] = {
        first_seen: today,
        last_seen: today,
        days_seen: 1,
        peak_likes: item.likes,
        url: item.url,
        description: (item.description || "").slice(0, 100),
      };
    } else {
      history.items[key].last_seen = today;
      history.items[key].days_seen += 1;
      if (item.likes > history.items[key].peak_likes) {
        history.items[key].peak_likes = item.likes;
      }
    }
  }

  const cutoff = daysAgo(today, 35);
  for (const date of Object.keys(history.daily)) {
    if (date < cutoff) delete history.daily[date];
  }
  for (const [key, info] of Object.entries(history.items)) {
    if (info.last_seen < cutoff) delete history.items[key];
  }

  saveHistory(history);
  return history;
}

function getWeeklyTrending() {
  const history = loadHistory();
  const today = getToday();
  const weekAgo = daysAgo(today, 7);

  const count = {};
  for (const [date, categories] of Object.entries(history.daily)) {
    if (date >= weekAgo && date <= today) {
      Object.values(categories).flat().forEach(item => {
        if (!count[item.id]) count[item.id] = { ...item, appearances: 0 };
        count[item.id].appearances += 1;
        count[item.id].likes = item.likes;
      });
    }
  }

  return Object.values(count)
    .filter(r => r.appearances >= 3)
    .sort((a, b) => b.appearances - a.appearances || b.likes - a.likes);
}

function getMonthlyConsistent() {
  const history = loadHistory();
  const today = getToday();
  const monthAgo = daysAgo(today, 30);

  const count = {};
  for (const [date, categories] of Object.entries(history.daily)) {
    if (date >= monthAgo && date <= today) {
      Object.values(categories).flat().forEach(item => {
        if (!count[item.id]) count[item.id] = { ...item, appearances: 0 };
        count[item.id].appearances += 1;
        count[item.id].likes = item.likes;
      });
    }
  }

  return Object.values(count)
    .filter(r => r.appearances >= 10)
    .sort((a, b) => b.appearances - a.appearances || b.likes - a.likes);
}

module.exports = { recordDaily, getWeeklyTrending, getMonthlyConsistent, loadHistory };
