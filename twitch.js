const CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";

// Résolutions disponibles, de la meilleure à la moins bonne
const DEFAULT_RESOLUTIONS = {
  chunked: { name: "Source", resolution: "chunked", frameRate: 60 },
  "1440p60": { name: "1440p60", resolution: "2560x1440", frameRate: 60 },
  "1080p60": { name: "1080p60", resolution: "1920x1080", frameRate: 60 },
  "720p60": { name: "720p60", resolution: "1280x720", frameRate: 60 },
  "480p30": { name: "480p", resolution: "854x480", frameRate: 30 },
  "360p30": { name: "360p", resolution: "640x360", frameRate: 30 },
  "160p30": { name: "160p", resolution: "284x160", frameRate: 30 },
};

// Récupère les infos de la VOD via l'API GQL
async function fetchVodData(vodId) {
  const resp = await fetch("https://gql.twitch.tv/gql", {
    method: "POST",
    headers: {
      "Client-Id": CLIENT_ID,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `query {
        video(id: "${vodId}") {
          broadcastType
          createdAt
          seekPreviewsURL
          owner { login }
        }
      }`,
    }),
  });

  const data = await resp.json();
  return data?.data?.video ?? null;
}

// Vérifie si une URL de qualité est accessible et retourne le codec utilisé
async function checkQuality(url) {
  const resp = await fetch(url);
  if (!resp.ok) return null;

  const text = await resp.text();

  if (text.includes(".ts")) {
    return "avc1.4D001E"; // H.264
  }

  if (text.includes(".mp4")) {
    const initResp = await fetch(url.replace("index-dvr.m3u8", "init-0.mp4"));
    if (initResp.ok) {
      const content = await initResp.text();
      return content.includes("hev1") ? "hev1.1.6.L93.B0" : "avc1.4D001E";
    }
    return "hev1.1.6.L93.B0"; // H.265 par défaut pour les mp4
  }

  return null;
}

// Construit l'URL CloudFront selon le type de VOD et la résolution
function buildPlaylistUrl(
  domain,
  vodId,
  vodSpecialID,
  channelLogin,
  broadcastType,
  createdAt,
  resKey,
) {
  const now = new Date("2023-02-10");
  const created = new Date(createdAt);
  const daysDiff = (now - created) / (1000 * 3600 * 24);

  if (broadcastType === "highlight") {
    return `https://${domain}/${vodSpecialID}/${resKey}/highlight-${vodId}.m3u8`;
  }

  if (broadcastType === "upload" && daysDiff > 7) {
    return `https://${domain}/${channelLogin}/${vodId}/${vodSpecialID}/${resKey}/index-dvr.m3u8`;
  }

  return `https://${domain}/${vodSpecialID}/${resKey}/index-dvr.m3u8`;
}

// Fonction principale : retourne la meilleure URL M3U8 disponible pour une VOD
async function getTwitchVodUrl(vodId) {
  const vod = await fetchVodData(vodId);

  if (!vod) {
    throw new Error("VOD introuvable ou inaccessible.");
  }

  // Extraire le domaine CloudFront et l'ID spécial depuis seekPreviewsURL
  const previewUrl = new URL(vod.seekPreviewsURL);
  const domain = previewUrl.host;
  const paths = previewUrl.pathname.split("/");
  const vodSpecialID =
    paths[paths.findIndex((p) => p.includes("storyboards")) - 1];
  const broadcastType = vod.broadcastType.toLowerCase();
  const channelLogin = vod.owner.login;

  // Parcourir les résolutions et retourner la première valide
  for (const [resKey] of Object.entries(DEFAULT_RESOLUTIONS)) {
    const url = buildPlaylistUrl(
      domain,
      vodId,
      vodSpecialID,
      channelLogin,
      broadcastType,
      vod.createdAt,
      resKey,
    );

    const codec = await checkQuality(url);

    if (codec) {
      console.log(`✅ Qualité trouvée : ${resKey} (${codec})`);
      return url;
    }
  }

  throw new Error("Aucune qualité disponible trouvée pour cette VOD.");
}

// --- Utilisation ---
const VOD_ID = "2704932198"; // Remplace par l'ID de ta VOD

getTwitchVodUrl(VOD_ID)
  .then((url) => {
    console.log("🎬 URL M3U8 :", url);
    // Ouvre cette URL dans VLC ou un lecteur HLS
  })
  .catch((err) => {
    console.error("❌ Erreur :", err.message);
  });
