/**
 * HF Radar - Fetch Trending from Hugging Face (v3 - fixed params)
 */

const CATEGORIES = [
  {
    id: "models",
    name: "Trending Models",
    endpoint: "https://huggingface.co/api/models?sort=trending&limit=20",
  },
  {
    id: "datasets",
    name: "Trending Datasets",
    endpoint: "https://huggingface.co/api/datasets?sort=trending&limit=20",
  },
  {
    id: "spaces",
    name: "Trending Spaces",
    endpoint: "https://huggingface.co/api/spaces?sort=trending&limit=20",
  },
];

function formatNum(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function daysSince(dateStr) {
  if (!dateStr) return 999;
  return Math.max(1, Math.floor((new Date() - new Date(dateStr)) / 864e5));
}

async function fetchCategory(cat) {
  console.log("  URL: " + cat.endpoint);

  try {
    const res = await fetch(cat.endpoint);
    console.log("  Status: " + res.status);

    if (!res.ok) {
      const body = await res.text();
      console.error("  Error body: " + body.slice(0, 200));
      return [];
    }

    const data = await res.json();
    console.log("  Items received: " + (Array.isArray(data) ? data.length : 0));
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("  Fetch error: " + err.message);
    return [];
  }
}

function processModels(raw) {
  return raw.map(m => {
    const id = m.modelId || m.id || m._id || "unknown";
    const days = daysSince(m.createdAt);
    const likes = m.likes || 0;
    const downloads = m.downloads || 0;
    return {
      id: id,
      name: id,
      author: (id || "").split("/")[0] || "unknown",
      url: "https://huggingface.co/" + id,
      likes,
      downloads,
      downloads_per_day: parseFloat((downloads / days).toFixed(1)),
      likes_per_day: parseFloat((likes / days).toFixed(1)),
      pipeline_tag: m.pipeline_tag || m.pipelineTag || "unknown",
      tags: (m.tags || []).slice(0, 8),
      created_at: m.createdAt || "",
      updated_at: m.lastModified || "",
      description: m.pipeline_tag || m.pipelineTag || "No description",
    };
  });
}

function processDatasets(raw) {
  return raw.map(d => {
    const id = d.id || d._id || "unknown";
    const days = daysSince(d.createdAt);
    const likes = d.likes || 0;
    const downloads = d.downloads || 0;
    return {
      id: id,
      name: id,
      author: (id || "").split("/")[0] || "unknown",
      url: "https://huggingface.co/datasets/" + id,
      likes,
      downloads,
      downloads_per_day: parseFloat((downloads / days).toFixed(1)),
      likes_per_day: parseFloat((likes / days).toFixed(1)),
      tags: (d.tags || []).slice(0, 8),
      created_at: d.createdAt || "",
      updated_at: d.lastModified || "",
      description: "Dataset",
    };
  });
}

function processSpaces(raw) {
  return raw.map(s => {
    const id = s.id || s._id || "unknown";
    const days = daysSince(s.createdAt);
    const likes = s.likes || 0;
    return {
      id: id,
      name: id,
      author: (id || "").split("/")[0] || "unknown",
      url: "https://huggingface.co/spaces/" + id,
      likes,
      likes_per_day: parseFloat((likes / days).toFixed(1)),
      sdk: s.sdk || "unknown",
      tags: (s.tags || []).slice(0, 8),
      created_at: s.createdAt || "",
      updated_at: s.lastModified || "",
      description: s.sdk || "Space",
    };
  });
}

async function fetchAllHF(token) {
  const results = {};

  for (const cat of CATEGORIES) {
    console.log("Fetching: " + cat.name + "...");
    await new Promise(r => setTimeout(r, 1000));

    const raw = await fetchCategory(cat);

    let processed = [];
    if (cat.id === "models") processed = processModels(raw);
    else if (cat.id === "datasets") processed = processDatasets(raw);
    else processed = processSpaces(raw);

    results[cat.id] = {
      name: cat.name,
      items: processed.slice(0, 15),
    };

    console.log("  Processed: " + processed.length + " " + cat.id);
  }

  return results;
}

module.exports = { fetchAllHF, CATEGORIES, formatNum };
