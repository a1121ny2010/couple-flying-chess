// 顾言与悦悦飞行棋同步工具
const SYNC_URL = "https://ygltszivgslsubwmxayc.supabase.co/functions/v1/flying-chess?token=yueyue826&room=guyan_yueyue";

export async function fetchRemoteGameState() {
  try {
    const res = await fetch(SYNC_URL);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("fetchRemoteGameState error:", e);
    return null;
  }
}

export async function postRemoteGameAction(action: "roll" | "sync" | "reset", payload: any = {}) {
  try {
    const res = await fetch(SYNC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("postRemoteGameAction error:", e);
    return null;
  }
}
