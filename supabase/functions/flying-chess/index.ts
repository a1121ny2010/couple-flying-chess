// 顾言与悦悦专属飞行棋联机服务端 Edge Function
// 部署路径: supabase/functions/flying-chess/index.ts
// 鉴权 token: yueyue826

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface MoveAction {
  action: "roll" | "sync" | "reset" | "task_resolve";
  player_id?: number;
  steps?: number;
  room_id?: string;
  task_outcome?: "accept" | "reject";
  state?: any;
}

const rooms = new Map<string, any>();

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      },
    });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const roomId = url.searchParams.get("room") || "guyan_yueyue";

  if (req.method === "GET") {
    const roomState = rooms.get(roomId) || {
      turn: 0,
      players: [
        { id: 0, name: "顾言", role: "male", step: 0 },
        { id: 1, name: "悦悦", role: "female", step: 0 }
      ],
      lastAction: null,
      updatedAt: Date.now()
    };
    return new Response(JSON.stringify(roomState), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  if (req.method === "POST") {
    try {
      const body: MoveAction = await req.json();
      let roomState = rooms.get(roomId) || {
        turn: 0,
        players: [
          { id: 0, name: "顾言", role: "male", step: 0 },
          { id: 1, name: "悦悦", role: "female", step: 0 }
        ],
        lastAction: null,
        updatedAt: Date.now()
      };

      if (body.action === "roll") {
        const steps = body.steps || (Math.floor(Math.random() * 6) + 1);
        const pId = body.player_id ?? roomState.turn;
        roomState.players[pId].step = Math.min(48, roomState.players[pId].step + steps);
        roomState.lastAction = { type: "roll", player_id: pId, steps };
        roomState.turn = pId === 0 ? 1 : 0;
        roomState.updatedAt = Date.now();
      } else if (body.action === "sync" && body.state) {
        roomState = { ...body.state, updatedAt: Date.now() };
      } else if (body.action === "reset") {
        roomState.players[0].step = 0;
        roomState.players[1].step = 0;
        roomState.turn = 0;
        roomState.lastAction = { type: "reset" };
        roomState.updatedAt = Date.now();
      }

      rooms.set(roomId, roomState);

      return new Response(JSON.stringify({ success: true, state: roomState }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  }

  return new Response("method not allowed", { status: 405 });
});
