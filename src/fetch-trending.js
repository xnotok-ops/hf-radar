/**
 * HF Radar - Fetch Trending from Hugging Face
 * Fetches trending models, datasets, and spaces
 */

const CATEGORIES = [
  {
    id: "models",
    name: "Trending Models",
    endpoint: "https://huggingface.co/api/models",
    params: "sort=trending&direction=-1&limit=20",
  },
  {
    id: "datasets",
    name: "Trending Datasets",
    endpoint: "https://huggingface.co/api/datasets",
    params: "sort=trending&direction=-1&limit=20",
  },
  {
    id: "spaces",
    name: "Trending Spaces",
    endpoint: "https://huggingface.co/api/spaces",
    params: "sort=trending&direction=-1&limit=20",
  },
];

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function daysSince(dateStr) {
  if (!dateStr) return 999;
  return Math.max(1, Math.floor((new Date() - new Date(dateStr)) / 864e5));
}

async function fetchCategory(cat, token) {
  const url = `${cat.endpoint}?${cat.params}`;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`HF API error: ${res.status} for ${cat.id}`);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error(`Fetch error for ${cat.id}: ${err.message}`);
    return [];
  }
}

function processModels(raw) {
  return raw.map(m => {
    const days = daysSince(m.createdAt);
    const likes = m.likes || 0;
    const downloads = m.downloads || 0;
    return {
      id: m.modelId || m.id,
      name: m.modelId || m.id,
      author: m.author || (m.modelId || "").split("/")[0] || "unknown",
      url: `https://huggingface.co/${m.modelId || m.id}`,
      likes,
      downloads,
      downloads_per_day: parseFloat((downloads / days).toFixed(1)),
      likes_per_day: parseFloat((likes / days).toFixed(1)),
      pipeline_tag: m.pipeline_tag || "unknown",
      tags: (m.tags || []).slice(0, 8),
      created_at: m.createdAt,
      updated_at: m.lastModified,
      description: m.cardData?.description || m.pipeline_tag || "No description",
      private: m.private || false,
    };
  }).filter(m => !m.private);
}

function processDatasets(raw) {
  return raw.map(d => {
    const days = daysSince(d.createdAt);
    const likes = d.likes || 0;
    const downloads = d.downloads || 0;
    return {
      id: d.id,
      name: d.id,
      author: d.author || (d.id || "").split("/")[0] || "unknown",
      url: `https://huggingface.co/datasets/${d.id}`,
      likes,
      downloads,
      downloads_per_day: parseFloat((downloads / days).toFixed(1)),
      likes_per_day: parseFloat((likes / days).toFixed(1)),
      tags: (d.tags || []).slice(0, 8),
      created_at: d.createdAt,
      updated_at: d.lastModified,
      description: d.cardData?.description || "No description",
    };
  });
}

function processSpaces(raw) {
  return raw.map(s => {
    const days = daysSince(s.createdAt);
    const likes = s.likes || 0;
    return {
      id: s.id,
      name: s.id,
      author: s.author || (s.id || "").split("/")[0] || "unknown",
      url: `https://huggingface.co/spaces/${s.id}`,
      likes,
      likes_per_day: parseFloat((likes / days).toFixed(1)),
      sdk: s.sdk || "unknown",
      tags: (s.tags || []).slice(0, 8),
      created_at: s.createdAt,
      updated_at: s.lastModified,
      description: s.cardData?.short_description || s.sdk || "No description",
    };
  });
}

async function fetchAllHF(token) {
  const results = {};

  for (const cat of CATEGORIES) {
    console.log(`Fetching: ${cat.name}...`);
    await new Promise(r => setTimeout(r, 1000));

    const raw = await fetchCategory(cat, token);

    let processed;
    if (cat.id === "models") processed = processModels(raw);
    else if (cat.id === "datasets") processed = processDatasets(raw);
    else processed = processSpaces(raw);

    results[cat.id] = {
      name: cat.name,
      items: processed.slice(0, 15),
    };

    console.log(`  → ${processed.length} ${cat.id} fetched`);
  }

  return results;
}

module.exports = { fetchAllHF, CATEGORIES, formatNum };
