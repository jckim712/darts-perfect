import React, { useState, useEffect } from "react";
import { loadAllPlayers, savePlayer, removePlayer, getPlayer } from "./firebase";

const STARTING_SCORE = 501;

const CHECKOUT_MAP = {
  170: "T20 T20 Bull", 167: "T20 T19 Bull", 164: "T20 T18 Bull", 161: "T20 T17 Bull",
  160: "T20 T20 D20", 158: "T20 T20 D19", 157: "T20 T19 D20", 156: "T20 T20 D18",
  155: "T20 T19 D19", 154: "T20 T18 D20", 153: "T20 T19 D18", 152: "T20 T20 D16",
  151: "T20 T17 D20", 150: "T20 T18 D18", 149: "T20 T19 D16", 148: "T20 T16 D20",
  147: "T20 T17 D18", 146: "T20 T18 D16", 145: "T20 T15 D20", 144: "T20 T18 D15",
  143: "T20 T17 D16", 142: "T20 T14 D20", 141: "T20 T19 D12", 140: "T20 T16 D16",
  139: "T20 T13 D20", 138: "T20 T18 D12", 137: "T20 T15 D16", 136: "T20 T20 D8",
  135: "T20 T17 D12", 134: "T20 T14 D16", 133: "T20 T19 D8", 132: "T20 T16 D12",
  131: "T20 T13 D16", 130: "T20 T18 D8", 129: "T19 T16 D12", 128: "T18 T14 D16",
  127: "T20 T17 D8", 126: "T19 T19 D6", 125: "25 T20 D20", 124: "T20 T14 D11",
  123: "T19 T16 D9", 122: "T18 T18 D7", 121: "T20 T11 D14", 120: "T20 S20 D20",
  119: "T19 T12 D13", 118: "T20 S18 D20", 117: "T20 S17 D20", 116: "T20 S16 D20",
  115: "T20 S15 D20", 114: "T20 S14 D20", 113: "T20 S13 D20", 112: "T20 S12 D20",
  111: "T20 S11 D20", 110: "T20 S10 D20", 109: "T20 S9 D20", 108: "T20 S8 D20",
  107: "T19 S10 D20", 106: "T20 S6 D20", 105: "T20 S5 D20", 104: "T18 S10 D20",
  103: "T19 S6 D20", 102: "T20 S2 D20", 101: "T17 S10 D20", 100: "T20 D20",
  99: "T19 S2 D20", 98: "T20 D19", 97: "T19 D20", 96: "T20 D18",
  95: "T19 D19", 94: "T18 D20", 93: "T19 D18", 92: "T20 D16",
  91: "T17 D20", 90: "T18 D18", 89: "T19 D16", 88: "T16 D20",
  87: "T17 D18", 86: "T18 D16", 85: "T15 D20", 84: "T20 D12",
  83: "T17 D16", 82: "T14 D20", 81: "T19 D12", 80: "T20 D10",
  79: "T13 D20", 78: "T18 D12", 77: "T19 D10", 76: "T20 D8",
  75: "T17 D12", 74: "T14 D16", 73: "T19 D8", 72: "T16 D12",
  71: "T13 D16", 70: "T18 D8", 69: "T19 D6", 68: "T20 D4",
  67: "T17 D8", 66: "T10 D18", 65: "T19 D4", 64: "T16 D8",
  63: "T13 D12", 62: "T10 D16", 61: "T15 D8", 60: "S20 D20",
  59: "S19 D20", 58: "S18 D20", 57: "S17 D20", 56: "S16 D20",
  55: "S15 D20", 54: "S14 D20", 53: "S13 D20", 52: "S12 D20",
  51: "S11 D20", 50: "Bull", 49: "S9 D20", 48: "S8 D20",
  47: "S15 D16", 46: "S6 D20", 45: "S13 D16", 44: "S4 D20",
  43: "S3 D20", 42: "S10 D16", 41: "S9 D16", 40: "D20",
  39: "S7 D16", 38: "D19", 37: "S5 D16", 36: "D18",
  35: "S3 D16", 34: "D17", 33: "S1 D16", 32: "D16",
  31: "S15 D8", 30: "D15", 29: "S13 D8", 28: "D14",
  27: "S11 D8", 26: "D13", 25: "S9 D8", 24: "D12",
  23: "S7 D8", 22: "D11", 21: "S5 D8", 20: "D10",
  19: "S3 D8", 18: "D9", 17: "S1 D8", 16: "D8",
  15: "S7 D4", 14: "D7", 13: "S5 D4", 12: "D6",
  11: "S3 D4", 10: "D5", 9: "S1 D4", 8: "D4",
  7: "S3 D2", 6: "D3", 5: "S1 D2", 4: "D2", 3: "S1 D1", 2: "D1",
};

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

const dlg = { background: "#ffffff", borderRadius: 16, padding: 24, maxWidth: 320, width: "100%", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" };
function Overlay({ children, onClose }) { return (<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }} onClick={onClose || undefined}><div onClick={e => e.stopPropagation()}>{children}</div></div>); }
function DartCountDialog({ score, onSelect }) { return (<Overlay><div style={{ background: "#1A1A1A", borderRadius: 16, padding: "28px 24px", maxWidth: 300, width: "100%", textAlign: "center", border: "2px solid #333", boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}><div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Checkout</div><div style={{ fontSize: 44, fontWeight: 500, color: "#5DCAA5", fontFamily: "'Inter', 'Helvetica Neue', -apple-system, sans-serif", marginBottom: 6 }}>{score}</div><div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>Darts used this turn?</div><div style={{ display: "flex", gap: 10, justifyContent: "center" }}>{[1, 2, 3].map(n => (<button key={n} onClick={() => onSelect(n)} style={{ width: 72, height: 68, fontSize: 28, fontWeight: 500, borderRadius: 12, cursor: "pointer", background: "#282828", color: "#fff", border: "2px solid #444", fontFamily: "'Inter', 'Helvetica Neue', -apple-system, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>{n}<span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>dart{n > 1 ? "s" : ""}</span></button>))}</div></div></Overlay>); }
function WinDialog({ playerName, legs, onDone }) { return (<Overlay><div style={{ background: "#1A1A1A", borderRadius: 16, padding: "36px 28px", maxWidth: 320, width: "100%", textAlign: "center", border: "2px solid #C41E2A", boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}><div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Match over</div><div style={{ fontSize: 32, fontWeight: 500, color: "#fff", marginBottom: 4 }}>{playerName}</div><div style={{ fontSize: 22, color: "#C41E2A", fontWeight: 500, marginBottom: 16 }}>Won!!</div><div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>{legs[0]} - {legs[1]}</div><button onClick={onDone} style={{ padding: "12px 40px", fontSize: 15, fontWeight: 500, borderRadius: 12, cursor: "pointer", background: "#C41E2A", color: "#fff", border: "none" }}>Done</button></div></Overlay>); }
function ConfirmOverlay({ title, message, confirmLabel, danger, onConfirm, onCancel }) { return (<Overlay onClose={onCancel}><div style={{ ...dlg }}><div style={{ fontSize: 17, fontWeight: 500, color: "#1A1A1A", marginBottom: 8 }}>{title}</div><div style={{ fontSize: 14, color: "#666", marginBottom: 24, lineHeight: 1.5 }}>{message}</div><div style={{ display: "flex", gap: 8 }}><button onClick={onCancel} style={{ flex: 1, padding: "11px", fontSize: 14, fontWeight: 500, borderRadius: 10, cursor: "pointer", background: "#f0f0f0", color: "#333", border: "none" }}>Cancel</button><button onClick={onConfirm} style={{ flex: 1, padding: "11px", fontSize: 14, fontWeight: 500, borderRadius: 10, cursor: "pointer", background: danger ? "#C41E2A" : "#1B8A42", color: "#fff", border: "none" }}>{confirmLabel || (danger ? "Delete" : "Confirm")}</button></div></div></Overlay>); }
function ScoreFlash({ score, onDone }) { useEffect(() => { const t = setTimeout(() => onDone(), 1200); return () => clearTimeout(t); }, []); return (<div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 50, pointerEvents: "none", animation: "scoreFlash 1.2s ease-out forwards" }}><div style={{ fontSize: 56, fontWeight: 500, color: "#FFD700", fontFamily: "'Inter', 'Helvetica Neue', -apple-system, sans-serif", textShadow: "0 0 20px rgba(255,215,0,0.5), 0 4px 12px rgba(0,0,0,0.6)", whiteSpace: "nowrap" }}>{score}!</div></div>); }

function StatRow({ label, v1, v2, highlight }) {
  return (<div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", padding: "6px 0", borderBottom: "0.5px solid #2A2A2A" }}>
    <div style={{ textAlign: "center", fontSize: 14, fontWeight: highlight === 0 ? 500 : 400, color: highlight === 0 ? "#5DCAA5" : "#fff", fontFamily: "'Inter', 'Helvetica Neue', -apple-system, sans-serif" }}>{v1}</div>
    <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.4)", padding: "0 12px", minWidth: 90 }}>{label}</div>
    <div style={{ textAlign: "center", fontSize: 14, fontWeight: highlight === 1 ? 500 : 400, color: highlight === 1 ? "#5DCAA5" : "#fff", fontFamily: "'Inter', 'Helvetica Neue', -apple-system, sans-serif" }}>{v2}</div>
  </div>);
}
function better(a, b) { if (a === b || a === "—" || b === "—") return undefined; return parseFloat(a) > parseFloat(b) ? 0 : 1; }
function betterLow(a, b) { if (!a || !b) return undefined; return a < b ? 0 : b < a ? 1 : undefined; }
function betterHigh(a, b) { if (a === b) return undefined; return a > b ? 0 : 1; }

function MatchStatsView({ pNames, legsScore, mStats, legResults, onDone, onBack }) {
  const a3 = [0, 1].map(i => mStats[i].totalDarts > 0 ? (mStats[i].totalScore / mStats[i].totalDarts * 3).toFixed(1) : "—");
  const totalTons = [0, 1].map(i => (legResults || []).reduce((s, lr) => s + (lr[i]?.ton || 0), 0));
  const totalT40 = [0, 1].map(i => (legResults || []).reduce((s, lr) => s + (lr[i]?.ton40 || 0), 0));
  const totalT80 = [0, 1].map(i => (legResults || []).reduce((s, lr) => s + (lr[i]?.ton80 || 0), 0));
  const bestLeg = [0, 1].map(i => { let b = null; (legResults || []).forEach(lr => { if (lr[i]?.won && (b === null || lr[i].totalDarts < b)) b = lr[i].totalDarts; }); return b; });
  return (<div style={{ maxWidth: 420, margin: "0 auto", border: "3px solid #1A1A1A", borderRadius: 16, overflow: "hidden", background: "#1A1A1A", color: "#fff" }}><div style={{ padding: "1.5rem 1rem" }}>
    {onBack && <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 12, padding: 0 }}>← Back</button>}
    <div style={{ textAlign: "center", marginBottom: 20 }}><div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Match statistics</div><div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}><div style={{ textAlign: "center" }}><div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>{pNames[0]}</div><div style={{ fontSize: 28, fontWeight: 500, color: "#C41E2A", fontFamily: "'Inter', 'Helvetica Neue', -apple-system, sans-serif" }}>{legsScore[0]}</div></div><div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>—</div><div style={{ textAlign: "center" }}><div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>{pNames[1]}</div><div style={{ fontSize: 28, fontWeight: 500, color: "#1B8A42", fontFamily: "'Inter', 'Helvetica Neue', -apple-system, sans-serif" }}>{legsScore[1]}</div></div></div></div>
    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Match totals</div>
    <StatRow label="3-dart avg" v1={a3[0]} v2={a3[1]} highlight={better(a3[0], a3[1])} />
    <StatRow label="Darts thrown" v1={mStats[0].totalDarts} v2={mStats[1].totalDarts} />
    <StatRow label="High turn" v1={mStats[0].highTurn} v2={mStats[1].highTurn} highlight={betterHigh(mStats[0].highTurn, mStats[1].highTurn)} />
    <StatRow label="100+" v1={totalTons[0]} v2={totalTons[1]} highlight={betterHigh(totalTons[0], totalTons[1])} />
    <StatRow label="140+" v1={totalT40[0]} v2={totalT40[1]} highlight={betterHigh(totalT40[0], totalT40[1])} />
    <StatRow label="180" v1={totalT80[0]} v2={totalT80[1]} highlight={betterHigh(totalT80[0], totalT80[1])} />
    <StatRow label="Best leg" v1={bestLeg[0] ? `${bestLeg[0]}d` : "—"} v2={bestLeg[1] ? `${bestLeg[1]}d` : "—"} highlight={betterLow(bestLeg[0], bestLeg[1])} />
    {legResults && legResults.length > 0 && (<><div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1, textTransform: "uppercase", marginTop: 20, marginBottom: 8 }}>Per leg breakdown</div>
      {legResults.map((lr, li) => { const la3 = [0, 1].map(i => lr[i].totalDarts > 0 ? (lr[i].totalScore / lr[i].totalDarts * 3).toFixed(1) : "—"); const w = lr[0].won ? 0 : 1; return (<div key={li} style={{ marginBottom: 12, background: "#222", borderRadius: 10, padding: "10px 12px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Leg {li + 1}</span><span style={{ fontSize: 11, color: w === 0 ? "#C41E2A" : "#1B8A42", fontWeight: 500 }}>{pNames[w]} won</span></div>
        <StatRow label="3-dart avg" v1={la3[0]} v2={la3[1]} highlight={better(la3[0], la3[1])} /><StatRow label="Rounds" v1={lr[0].rounds} v2={lr[1].rounds} /><StatRow label="Darts" v1={lr[0].totalDarts} v2={lr[1].totalDarts} /><StatRow label="High turn" v1={lr[0].highTurn} v2={lr[1].highTurn} highlight={betterHigh(lr[0].highTurn, lr[1].highTurn)} /><StatRow label="100+" v1={lr[0].ton || 0} v2={lr[1].ton || 0} /><StatRow label="140+" v1={lr[0].ton40 || 0} v2={lr[1].ton40 || 0} /></div>); })}</>)}
    {onDone && <button onClick={onDone} style={{ width: "100%", padding: "14px", fontSize: 15, fontWeight: 500, borderRadius: 12, cursor: "pointer", background: "#C41E2A", color: "#fff", border: "none", marginTop: 12 }}>Done</button>}
  </div></div>);
}

export default function DartScorer() {
  const [screen, setScreen] = useState("home");
  const [allPlayers, setAllPlayers] = useState([]); const [loading, setLoading] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState([null, null]); const [assigningSeat, setAssigningSeat] = useState(null);
  const [newNameInput, setNewNameInput] = useState(""); const [newPinInput, setNewPinInput] = useState(""); const [showCreateInput, setShowCreateInput] = useState(false); const [legFormat, setLegFormat] = useState(3);
  const [scores, setScores] = useState([501, 501]); const [currentPlayer, setCurrentPlayer] = useState(0);
  const [inputValue, setInputValue] = useState(""); const [inputParts, setInputParts] = useState([]);
  const [history, setHistory] = useState([[], []]); const [winner, setWinner] = useState(null); const [matchWinner, setMatchWinner] = useState(null);
  const [gameStats, setGameStats] = useState([{ rounds: 0, totalScore: 0, totalDarts: 0, highTurn: 0 }, { rounds: 0, totalScore: 0, totalDarts: 0, highTurn: 0 }]);
  const [matchStats, setMatchStats] = useState([{ totalScore: 0, totalDarts: 0, highTurn: 0, legsWon: 0 }, { totalScore: 0, totalDarts: 0, highTurn: 0, legsWon: 0 }]);
  const [legResults, setLegResults] = useState([]);
  const [message, setMessage] = useState(""); const [legs, setLegs] = useState([0, 0]); const [startingPlayer, setStartingPlayer] = useState(0);
  const [pendingCheckout, setPendingCheckout] = useState(null); const [showWinDialog, setShowWinDialog] = useState(false);
  const [viewingPlayer, setViewingPlayer] = useState(null); const [deleteTarget, setDeleteTarget] = useState(null); const [deletePinInput, setDeletePinInput] = useState(""); const [deletePinError, setDeletePinError] = useState(false); const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [scoreFlash, setScoreFlash] = useState(null);
  const [flashKey, setFlashKey] = useState(0);
  const [viewingGameDetail, setViewingGameDetail] = useState(null);
  const [showLegWinDialog, setShowLegWinDialog] = useState(false);
  const [legSnapshots, setLegSnapshots] = useState([]);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    loadAllPlayers().then(p => { setAllPlayers(p); setLoading(false); }).catch(() => setLoading(false));
    try {
      const saved = localStorage.getItem("dartsperfect_session");
      if (saved) { const s = JSON.parse(saved); if (s && s.screen === "game") { setResumeData(s); setShowResumePrompt(true); } }
    } catch {}
  }, []);

  useEffect(() => {
    if (screen === "game" && !matchWinner) {
      try {
        localStorage.setItem("dartsperfect_session", JSON.stringify({ screen: "game", scores, currentPlayer, history, winner, matchWinner, gameStats, matchStats, legResults, legs, startingPlayer, legFormat, selectedPlayers, legSnapshots }));
      } catch {}
    }
    if (screen === "home" || screen === "matchStats") {
      try { localStorage.removeItem("dartsperfect_session"); } catch {}
    }
  }, [screen, scores, currentPlayer, history, legs, winner, matchWinner, gameStats, matchStats, legResults, legSnapshots]);
  async function refreshPlayers() { try { setAllPlayers(await loadAllPlayers()); } catch {} }
  async function createPlayer(name, pin) { try { const p = { id: genId(), name: name.trim(), pin: pin || "1234", createdAt: Date.now(), lastPlayed: null, gamesPlayed: 0, gamesWon: 0, totalRounds: 0, totalScore: 0, totalDarts: 0, highTurn: 0, gameHistory: [] }; await savePlayer(p); await refreshPlayers(); return p; } catch (e) { console.error("Create failed:", e); return { id: genId(), name: name.trim(), pin: pin || "1234", createdAt: Date.now(), lastPlayed: null, gamesPlayed: 0, gamesWon: 0, totalRounds: 0, totalScore: 0, totalDarts: 0, highTurn: 0, gameHistory: [] }; } }
  async function recordMatchResult(playerId, mStat, won, opponentName, legScore, detailStr) {
    try {
      const fresh = await getPlayer(playerId);
      if (!fresh) { console.error("Player not found:", playerId); return; }
      const u = { ...fresh };
      u.gamesPlayed = (u.gamesPlayed || 0) + 1;
      if (won) u.gamesWon = (u.gamesWon || 0) + 1;
      u.totalDarts = (u.totalDarts || 0) + (mStat.totalDarts || 0);
      u.totalScore = (u.totalScore || 0) + (mStat.totalScore || 0);
      u.totalRounds = (u.totalRounds || 0) + Math.ceil((mStat.totalDarts || 0) / 3);
      u.highTurn = Math.max(u.highTurn || 0, mStat.highTurn || 0);
      u.lastPlayed = Date.now();
      const a = mStat.totalDarts > 0 ? Math.round(mStat.totalScore / mStat.totalDarts * 3 * 10) / 10 : 0;
      const entry = { date: Date.now(), won: !!won, opponent: opponentName || "", avg3dart: a, totalDarts: mStat.totalDarts || 0, highTurn: mStat.highTurn || 0, legs: legScore || "" };
      if (detailStr) entry.detail = detailStr;
      u.gameHistory = [entry, ...(u.gameHistory || []).slice(0, 49)];
      await savePlayer(u);
      console.log("Saved match for", u.name, "games:", u.gamesPlayed);
    } catch (e) { console.error("Record match failed:", playerId, e); }
  }

  async function saveMatchResults(p, nl, ms, newLR, ns) {
    try {
      const p1id = selectedPlayers[0]; const p2id = selectedPlayers[1];
      const p1d = getPlayerById(p1id); const p2d = getPlayerById(p2id);
      if (!p1d || !p2d) { console.error("Players not found for saving"); return; }
      const ls = nl[0] + "-" + nl[1];
      const detail = JSON.stringify({ pNames: [p1d.name, p2d.name], legsScore: [nl[0], nl[1]], mStats: [{ totalScore: ms[0].totalScore, totalDarts: ms[0].totalDarts, highTurn: ms[0].highTurn, legsWon: ms[0].legsWon }, { totalScore: ms[1].totalScore, totalDarts: ms[1].totalDarts, highTurn: ms[1].highTurn, legsWon: ms[1].legsWon }], legResults: newLR });
      await recordMatchResult(p1id, ms[0], p === 0, p2d.name, ls, detail);
      await recordMatchResult(p2id, ms[1], p === 1, p1d.name, ls, detail);
      await refreshPlayers();
      console.log("All match results saved");
    } catch (e) { console.error("saveMatchResults failed:", e); }
  }
  function getPlayerById(id) { return allPlayers.find(p => p.id === id); }
  const currentInputTotal = inputParts.reduce((s, v) => s + v, 0) + (inputValue ? parseInt(inputValue) || 0 : 0);
  const hasInput = inputParts.length > 0 || inputValue !== "";
  const previewScore = hasInput ? scores[currentPlayer] - currentInputTotal : scores[currentPlayer];

  function resumeGame(data) {
    setScores(data.scores); setCurrentPlayer(data.currentPlayer); setHistory(data.history);
    setWinner(data.winner); setMatchWinner(data.matchWinner); setGameStats(data.gameStats);
    setMatchStats(data.matchStats); setLegResults(data.legResults || []); setLegs(data.legs);
    setStartingPlayer(data.startingPlayer); setLegFormat(data.legFormat);
    setSelectedPlayers(data.selectedPlayers); setLegSnapshots(data.legSnapshots || []);
    setInputValue(""); setInputParts([]); setMessage(""); setPendingCheckout(null);
    setScoreFlash(null); setShowWinDialog(false); setShowLegWinDialog(false);
    setScreen("game");
  }

  function startGame() { if (!selectedPlayers[0] || !selectedPlayers[1]) return; setScores([501, 501]); setCurrentPlayer(0); setInputValue(""); setInputParts([]); setHistory([[], []]); setWinner(null); setMatchWinner(null); setShowWinDialog(false); setShowLegWinDialog(false); setGameStats([{ rounds: 0, totalScore: 0, totalDarts: 0, highTurn: 0 }, { rounds: 0, totalScore: 0, totalDarts: 0, highTurn: 0 }]); setMatchStats([{ totalScore: 0, totalDarts: 0, highTurn: 0, legsWon: 0 }, { totalScore: 0, totalDarts: 0, highTurn: 0, legsWon: 0 }]); setLegResults([]); setLegSnapshots([]); setMessage("Game on!"); setTimeout(() => setMessage(""), 1500); setLegs([0, 0]); setStartingPlayer(0); setPendingCheckout(null); setScoreFlash(null); setScreen("game"); }

  function startNewLeg() {
    const snapshot = { scores: [...scores], currentPlayer, history: [history[0].slice(), history[1].slice()], gameStats: gameStats.map(s => ({...s})), legs: [...legs], startingPlayer, winner };
    setLegSnapshots(prev => [...prev, snapshot]);
    setShowLegWinDialog(false); setScores([501, 501]); const ns = 1 - startingPlayer; setStartingPlayer(ns); setCurrentPlayer(ns); setInputValue(""); setInputParts([]); setHistory([[], []]); setWinner(null); setGameStats([{ rounds: 0, totalScore: 0, totalDarts: 0, highTurn: 0 }, { rounds: 0, totalScore: 0, totalDarts: 0, highTurn: 0 }]); setMessage(""); setPendingCheckout(null); setScoreFlash(null);
  }
  function triggerScoreFlash(score) { if (score >= 100) { setScoreFlash(score); setFlashKey(k => k + 1); } }

  function applyTurn(turnScore, dartCount) {
    const p = pendingCheckout ? pendingCheckout.player : currentPlayer; const isC = pendingCheckout !== null;
    if (!isC) {
      const n2 = scores[p] - turnScore;
      if (n2 < 0 || n2 === 1) { setMessage("BUST!"); setTimeout(() => setMessage(""), 1200); const nh = [...history]; nh[p] = [...nh[p], { score: 0, remaining: scores[p], bust: true }]; setHistory(nh); const ns = [...gameStats]; ns[p] = { ...ns[p], rounds: ns[p].rounds + 1, totalDarts: ns[p].totalDarts + 3 }; setGameStats(ns); setInputValue(""); setInputParts([]); setCurrentPlayer(1 - p); return; }
      if (n2 === 0) { setPendingCheckout({ player: p, turnScore }); return; }
      const sc = [...scores]; sc[p] = n2; setScores(sc); const nh = [...history]; nh[p] = [...nh[p], { score: turnScore, remaining: n2 }]; setHistory(nh);
      const ns = [...gameStats]; ns[p] = { rounds: ns[p].rounds + 1, totalScore: ns[p].totalScore + turnScore, totalDarts: ns[p].totalDarts + 3, highTurn: Math.max(ns[p].highTurn, turnScore) }; setGameStats(ns);
      setCurrentPlayer(1 - p); setInputValue(""); setInputParts([]);
    } else {
      const ts = pendingCheckout.turnScore; const sc = [...scores]; sc[p] = 0; setScores(sc);
      const nh = [...history]; nh[p] = [...nh[p], { score: ts, remaining: 0, checkout: true, darts: dartCount }]; setHistory(nh);
      const ns = [...gameStats]; ns[p] = { rounds: ns[p].rounds + 1, totalScore: ns[p].totalScore + ts, totalDarts: ns[p].totalDarts + dartCount, highTurn: Math.max(ns[p].highTurn, ts) }; setGameStats(ns);
      const nl = [...legs]; nl[p] += 1; setLegs(nl);
      const finalHist = [...history]; finalHist[p] = [...finalHist[p]];
      const legRes = [0, 1].map(i => { const st = i === p ? ns[i] : gameStats[i]; return { rounds: st.rounds, totalScore: st.totalScore, totalDarts: st.totalDarts, highTurn: st.highTurn, won: i === p, ton: finalHist[i].filter(h => !h.bust && h.score >= 100 && h.score < 140).length, ton40: finalHist[i].filter(h => !h.bust && h.score >= 140 && h.score < 180).length, ton80: finalHist[i].filter(h => !h.bust && h.score >= 180).length }; });
      const newLR = [...legResults, legRes]; setLegResults(newLR);
      const ms = [...matchStats]; [0, 1].forEach(i => { const st = i === p ? ns[i] : gameStats[i]; ms[i] = { totalScore: ms[i].totalScore + st.totalScore, totalDarts: ms[i].totalDarts + st.totalDarts, highTurn: Math.max(ms[i].highTurn, st.highTurn), legsWon: nl[i] }; }); setMatchStats(ms);
      if (nl[p] >= legFormat) { setMatchWinner(p); setShowWinDialog(true);
        saveMatchResults(p, nl, ms, newLR, ns);
      } else { setWinner(p); setShowLegWinDialog(true); }
      setPendingCheckout(null); setInputValue(""); setInputParts([]);
    }
  }

  function submitScore(ts) { if (winner !== null || matchWinner !== null || pendingCheckout !== null) return; if (ts >= 100) triggerScoreFlash(ts); applyTurn(ts, 3); }
  function handleBust() { if (winner !== null || matchWinner !== null || pendingCheckout !== null) return; const p = currentPlayer; setMessage("BUST!"); setTimeout(() => setMessage(""), 1200); const nh = [...history]; nh[p] = [...nh[p], { score: 0, remaining: scores[p], bust: true }]; setHistory(nh); const ns = [...gameStats]; ns[p] = { ...ns[p], rounds: ns[p].rounds + 1, totalDarts: ns[p].totalDarts + 3 }; setGameStats(ns); setInputValue(""); setInputParts([]); setCurrentPlayer(1 - p); }
  function handleNumKey(n) { if (winner !== null || matchWinner !== null || pendingCheckout !== null) return; const next = inputValue + String(n); if (parseInt(next) <= 180) setInputValue(next); }
  function handleDelete() { if (inputValue.length > 0) setInputValue(v => v.slice(0, -1)); else if (inputParts.length > 0) { setInputValue(String(inputParts[inputParts.length - 1])); setInputParts(p => p.slice(0, -1)); } }
  function handlePlus() { if (inputValue === "") return; setInputParts(prev => [...prev, parseInt(inputValue)]); setInputValue(""); }
  function handleSubmitInput() { if (inputValue === "" && inputParts.length === 0) return; const total = inputParts.reduce((s, v) => s + v, 0) + (inputValue ? parseInt(inputValue) || 0 : 0); if (total > 180) { setMessage("Max 180!"); setTimeout(() => setMessage(""), 1200); return; } if (total >= 100) triggerScoreFlash(total); setInputParts([]); applyTurn(total, 3); }
  function undoLast() {
    if (pendingCheckout) { setPendingCheckout(null); return; }
    if (showLegWinDialog) { setShowLegWinDialog(false); }
    const p = 1 - currentPlayer;
    // If current leg has no history, restore previous leg
    if (history[0].length === 0 && history[1].length === 0 && legSnapshots.length > 0) {
      const snap = legSnapshots[legSnapshots.length - 1];
      setLegSnapshots(prev => prev.slice(0, -1));
      setScores(snap.scores); setCurrentPlayer(snap.currentPlayer);
      setHistory(snap.history); setGameStats(snap.gameStats);
      setLegs(snap.legs); setStartingPlayer(snap.startingPlayer);
      setWinner(snap.winner || null);
      setLegResults(prev => prev.slice(0, -1));
      // Undo matchStats for this leg
      const prevLeg = legResults[legResults.length - 1];
      if (prevLeg) {
        const ms = [...matchStats];
        [0, 1].forEach(i => { ms[i] = { totalScore: ms[i].totalScore - (prevLeg[i]?.totalScore || 0), totalDarts: ms[i].totalDarts - (prevLeg[i]?.totalDarts || 0), highTurn: ms[i].highTurn, legsWon: ms[i].legsWon - (prevLeg[i]?.won ? 1 : 0) }; });
        setMatchStats(ms);
      }
      setMessage(""); setShowLegWinDialog(false);
      return;
    }
    if (history[p].length === 0 && history[currentPlayer].length === 0) return;
    // Normal undo within current leg
    const target = history[p].length > 0 ? p : currentPlayer;
    const nh = [...history]; const last = nh[target][nh[target].length - 1]; nh[target] = nh[target].slice(0, -1); setHistory(nh);
    if (!last.bust) { const sc = [...scores]; sc[target] += last.score; setScores(sc); }
    const d = last.checkout ? (last.darts || 3) : 3;
    const ns = [...gameStats]; ns[target] = { rounds: ns[target].rounds - 1, totalScore: ns[target].totalScore - (last.bust ? 0 : last.score), totalDarts: ns[target].totalDarts - d, highTurn: ns[target].highTurn }; setGameStats(ns);
    setCurrentPlayer(target); setWinner(null); setMessage("");
  }

  const calcAvg3 = i => { const d = gameStats[i].totalDarts; return d > 0 ? (gameStats[i].totalScore / d * 3).toFixed(1) : "—"; };
  const playerAvg3 = p => (p.totalDarts || 0) > 0 ? ((p.totalScore / p.totalDarts) * 3).toFixed(1) : (p.totalRounds > 0 ? (p.totalScore / p.totalRounds).toFixed(1) : "—");
  const playerWinRate = p => p.gamesPlayed > 0 ? Math.round(p.gamesWon / p.gamesPlayed * 100) : 0;
  const B = { border: "none", cursor: "pointer", borderRadius: 0, padding: 0, fontFamily: "'Inter', 'Helvetica Neue', -apple-system, sans-serif", display: "flex", alignItems: "center", justifyContent: "center" };
  const SC = ["#C41E2A", "#1B8A42"];

  // ── GAME DETAIL ──
  if (screen === "gameDetail" && viewingGameDetail) {
    const g = viewingGameDetail;
    if (g.detail) {
      let d = g.detail;
      if (typeof d === "string") { try { d = JSON.parse(d); } catch { d = null; } }
      if (d) return <MatchStatsView pNames={d.pNames} legsScore={d.legsScore} mStats={d.mStats} legResults={d.legResults} onBack={() => { setViewingGameDetail(null); setScreen("profile"); }} />;
    }
    return (<div style={{ maxWidth: 420, margin: "0 auto", border: "3px solid #1A1A1A", borderRadius: 16, overflow: "hidden", background: "#1A1A1A", color: "#fff" }}><div style={{ padding: "1.5rem 1rem" }}><button onClick={() => { setViewingGameDetail(null); setScreen("profile"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 16, padding: 0 }}>← Back</button><div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Detailed stats not available for this game.</div></div></div>);
  }

  // ── HOME ──
  if (screen === "home") {
    return (<div style={{ maxWidth: 600, margin: "0 auto", border: "3px solid #1A1A1A", borderRadius: 16, overflow: "hidden", background: "#111", minHeight: "100vh" }}>
      {deleteTarget && (
        <Overlay onClose={() => { setDeleteTarget(null); setDeletePinInput(""); setDeletePinError(false); }}>
          <div style={{ background: "#ffffff", borderRadius: 16, padding: 24, maxWidth: 320, width: "100%", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: 17, fontWeight: 500, color: "#1A1A1A", marginBottom: 8 }}>Delete {deleteTarget.name}?</div>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 16, lineHeight: 1.5 }}>Enter PIN to confirm deletion.</div>
            <input value={deletePinInput} onChange={e => { setDeletePinInput(e.target.value.replace(/\D/g, "").slice(0, 8)); setDeletePinError(false); }} placeholder="PIN" type="password" style={{ width: "100%", padding: "10px 12px", fontSize: 16, borderRadius: 10, border: deletePinError ? "2px solid #C41E2A" : "1px solid #ddd", outline: "none", marginBottom: 8, textAlign: "center", letterSpacing: 4 }} />
            {deletePinError && <div style={{ fontSize: 12, color: "#C41E2A", marginBottom: 8, textAlign: "center" }}>Wrong PIN</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setDeleteTarget(null); setDeletePinInput(""); setDeletePinError(false); }} style={{ flex: 1, padding: "11px", fontSize: 14, fontWeight: 500, borderRadius: 10, cursor: "pointer", background: "#f0f0f0", color: "#333", border: "none" }}>Cancel</button>
              <button onClick={async () => {
                const pin = deleteTarget.pin || "1234";
                if (deletePinInput === pin) {
                  await removePlayer(deleteTarget.id); const sp = [...selectedPlayers]; if (sp[0] === deleteTarget.id) sp[0] = null; if (sp[1] === deleteTarget.id) sp[1] = null; setSelectedPlayers(sp); await refreshPlayers(); setDeleteTarget(null); setDeletePinInput(""); setDeletePinError(false);
                } else { setDeletePinError(true); }
              }} style={{ flex: 1, padding: "11px", fontSize: 14, fontWeight: 500, borderRadius: 10, cursor: "pointer", background: "#C41E2A", color: "#fff", border: "none" }}>Delete</button>
            </div>
          </div>
        </Overlay>
      )}
      {showResumePrompt && resumeData && (
        <Overlay onClose={() => { setShowResumePrompt(false); localStorage.removeItem("dartsperfect_session"); }}>
          <div style={{ background: "#1A1A1A", borderRadius: 16, padding: "28px 24px", maxWidth: 320, width: "100%", textAlign: "center", border: "2px solid #DAA520", boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Unfinished game found</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: "#fff", marginBottom: 4 }}>{resumeData.legs ? `${resumeData.legs[0]} - ${resumeData.legs[1]}` : ""}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Would you like to continue?</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setShowResumePrompt(false); localStorage.removeItem("dartsperfect_session"); }} style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 500, borderRadius: 10, cursor: "pointer", background: "#333", color: "#aaa", border: "none" }}>Discard</button>
              <button onClick={() => { setShowResumePrompt(false); resumeGame(resumeData); }} style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 500, borderRadius: 10, cursor: "pointer", background: "#C41E2A", color: "#fff", border: "none" }}>Resume</button>
            </div>
          </div>
        </Overlay>
      )}
      <div style={{ padding: "2rem 1rem" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Score calculator</div>
          <div style={{ fontSize: 36, fontWeight: 500, color: "#C41E2A", letterSpacing: 2, lineHeight: 1 }}>DARTS</div>
          <div style={{ fontSize: 36, fontWeight: 500, color: "#fff", letterSpacing: 2, lineHeight: 1, marginTop: 2 }}>PERFECT</div>
        </div>
        {loading ? <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: 32 }}>Loading...</div> : (<>
          <div style={{ marginBottom: 14 }}>{[0, 1].map(seat => { const sel = selectedPlayers[seat] ? getPlayerById(selectedPlayers[seat]) : null; const isA = assigningSeat === seat; return (
            <div key={seat} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", marginBottom: 6, background: "#1A1A1A", borderRadius: 12, border: isA ? `2px solid ${SC[seat]}` : sel ? `2px solid ${SC[seat]}` : "1px solid #333", cursor: "pointer" }} onClick={() => { if (sel && !isA) { const sp = [...selectedPlayers]; sp[seat] = null; setSelectedPlayers(sp); } else setAssigningSeat(isA ? null : seat); }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: SC[seat], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 500, fontSize: 11, flexShrink: 0 }}>P{seat + 1}</div>
              <div style={{ flex: 1 }}>{sel ? (<div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>{sel.name}</span><span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>avg {playerAvg3(sel)}</span></div>) : (<span style={{ fontSize: 14, color: isA ? SC[seat] : "rgba(255,255,255,0.35)", fontWeight: isA ? 500 : 400 }}>{isA ? "Tap a player below..." : "Tap to select"}</span>)}</div>
              {sel && <span style={{ fontSize: 16, color: "rgba(255,255,255,0.35)" }}>×</span>}
            </div>); })}</div>
          <div style={{ marginBottom: 18 }}><div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 6, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>Match format</div><div style={{ display: "flex", gap: 6 }}>{[3, 5, 7].map(n => (<button key={n} onClick={() => setLegFormat(n)} style={{ flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 500, borderRadius: 10, cursor: "pointer", background: legFormat === n ? "#C41E2A" : "#222", color: legFormat === n ? "#fff" : "rgba(255,255,255,0.6)", border: legFormat === n ? "none" : "1px solid #333" }}>First to {n}</button>))}</div></div>
          <button onClick={startGame} disabled={!selectedPlayers[0] || !selectedPlayers[1] || selectedPlayers[0] === selectedPlayers[1]} style={{ width: "100%", padding: "14px", fontSize: 16, fontWeight: 500, borderRadius: 12, cursor: "pointer", background: (selectedPlayers[0] && selectedPlayers[1] && selectedPlayers[0] !== selectedPlayers[1]) ? "#C41E2A" : "#333", color: "#fff", border: "none", marginBottom: 20, opacity: (selectedPlayers[0] && selectedPlayers[1] && selectedPlayers[0] !== selectedPlayers[1]) ? 1 : 0.5 }}>Game on!</button>
          {showCreateInput ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14, padding: "12px", background: "#1A1A1A", borderRadius: 12, border: "1px solid #333" }}>
              <input autoFocus value={newNameInput} onChange={e => setNewNameInput(e.target.value)} placeholder="Player name" style={{ background: "#222", border: "1px solid #333", borderRadius: 8, outline: "none", fontSize: 15, color: "#fff", padding: "8px 10px" }} />
              <input value={newPinInput} onChange={e => setNewPinInput(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="PIN (numbers)" type="password" style={{ background: "#222", border: "1px solid #333", borderRadius: 8, outline: "none", fontSize: 15, color: "#fff", padding: "8px 10px" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={async () => {
                  if (newNameInput.trim() && newPinInput.trim()) {
                    const np = await createPlayer(newNameInput.trim(), newPinInput.trim());
                    if (assigningSeat !== null) { const sp = [...selectedPlayers]; sp[assigningSeat] = np.id; setSelectedPlayers(sp); setAssigningSeat(null); }
                    setNewNameInput(""); setNewPinInput(""); setShowCreateInput(false);
                  }
                }} style={{ flex: 1, padding: "8px", fontSize: 13, fontWeight: 500, background: (newNameInput.trim() && newPinInput.trim()) ? "#C41E2A" : "#333", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Create</button>
                <button onClick={() => { setShowCreateInput(false); setNewNameInput(""); setNewPinInput(""); }} style={{ padding: "8px 12px", fontSize: 16, background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>×</button>
              </div>
            </div>
          ) : (<button onClick={() => setShowCreateInput(true)} style={{ width: "100%", padding: "10px", fontSize: 13, fontWeight: 500, marginBottom: 14, borderRadius: 12, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", border: "1.5px dashed #444" }}>+ Create new player</button>)}
          {allPlayers.length > 0 && (<div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>Players</div><div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {allPlayers.map(p => { const isSel = selectedPlayers[0] === p.id || selectedPlayers[1] === p.id; const sSeat = selectedPlayers[0] === p.id ? 0 : selectedPlayers[1] === p.id ? 1 : -1; return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: isSel ? "#222" : "#1A1A1A", borderRadius: 12, cursor: "pointer", border: isSel ? `2px solid ${SC[sSeat]}` : assigningSeat !== null ? `1.5px solid ${SC[assigningSeat]}44` : "1px solid #2A2A2A", opacity: (assigningSeat !== null && isSel) ? 0.4 : 1 }} onClick={() => { if (assigningSeat !== null && !isSel) { const sp = [...selectedPlayers]; sp[assigningSeat] = p.id; setSelectedPlayers(sp); setAssigningSeat(null); } }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: isSel ? SC[sSeat] : "#333", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 500, fontSize: 15, flexShrink: 0 }}>{p.name.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 500, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>{p.name}{isSel && <span style={{ fontSize: 10, fontWeight: 500, color: SC[sSeat], background: SC[sSeat] + "18", padding: "1px 6px", borderRadius: 10 }}>P{sSeat + 1}</span>}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{p.gamesPlayed > 0 ? `${p.gamesPlayed}G · avg ${playerAvg3(p)} · ${playerWinRate(p)}%W` : "No games yet"}</div></div>
                <button onClick={e => { e.stopPropagation(); setViewingPlayer(p); setScreen("profile"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 18, padding: "4px 6px" }}>›</button>
              </div>); })}</div></div>)}
          {allPlayers.length === 0 && !showCreateInput && <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Create players to get started</div>}
        </>)}
      </div></div>);
  }

  // ── PROFILE ──
  if (screen === "profile" && viewingPlayer) {
    const p = getPlayerById(viewingPlayer.id) || viewingPlayer;
    return (<div style={{ maxWidth: 600, margin: "0 auto", border: "3px solid #1A1A1A", borderRadius: 16, overflow: "hidden", background: "#111", minHeight: "100vh" }}>
      {deleteTarget && (
        <Overlay onClose={() => { setDeleteTarget(null); setDeletePinInput(""); setDeletePinError(false); }}>
          <div style={{ background: "#ffffff", borderRadius: 16, padding: 24, maxWidth: 320, width: "100%", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: 17, fontWeight: 500, color: "#1A1A1A", marginBottom: 8 }}>Delete {deleteTarget.name}?</div>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 16, lineHeight: 1.5 }}>Enter PIN to confirm deletion.</div>
            <input value={deletePinInput} onChange={e => { setDeletePinInput(e.target.value.replace(/\D/g, "").slice(0, 8)); setDeletePinError(false); }} placeholder="PIN" type="password" style={{ width: "100%", padding: "10px 12px", fontSize: 16, borderRadius: 10, border: deletePinError ? "2px solid #C41E2A" : "1px solid #ddd", outline: "none", marginBottom: 8, textAlign: "center", letterSpacing: 4 }} />
            {deletePinError && <div style={{ fontSize: 12, color: "#C41E2A", marginBottom: 8, textAlign: "center" }}>Wrong PIN</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setDeleteTarget(null); setDeletePinInput(""); setDeletePinError(false); }} style={{ flex: 1, padding: "11px", fontSize: 14, fontWeight: 500, borderRadius: 10, cursor: "pointer", background: "#f0f0f0", color: "#333", border: "none" }}>Cancel</button>
              <button onClick={async () => {
                const pin = deleteTarget.pin || "1234";
                if (deletePinInput === pin) {
                  await removePlayer(deleteTarget.id); const sp = [...selectedPlayers]; if (sp[0] === deleteTarget.id) sp[0] = null; if (sp[1] === deleteTarget.id) sp[1] = null; setSelectedPlayers(sp); await refreshPlayers(); setDeleteTarget(null); setDeletePinInput(""); setDeletePinError(false); setScreen("home");
                } else { setDeletePinError(true); }
              }} style={{ flex: 1, padding: "11px", fontSize: 14, fontWeight: 500, borderRadius: 10, cursor: "pointer", background: "#C41E2A", color: "#fff", border: "none" }}>Delete</button>
            </div>
          </div>
        </Overlay>
      )}
      <div style={{ padding: "1.5rem 1rem" }}>
        <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 16, padding: 0 }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}><div style={{ width: 52, height: 52, borderRadius: "50%", background: "#C41E2A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 500, fontSize: 22, flexShrink: 0 }}>{p.name.charAt(0).toUpperCase()}</div><div><div style={{ fontSize: 22, fontWeight: 500, color: "#fff" }}>{p.name}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Joined {new Date(p.createdAt).toLocaleDateString()}</div></div></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>{[{ label: "Games", value: p.gamesPlayed }, { label: "Wins", value: p.gamesWon }, { label: "Win %", value: playerWinRate(p) + "%" }, { label: "3-dart avg", value: playerAvg3(p) }, { label: "High turn", value: p.highTurn || "—" }, { label: "Total darts", value: p.totalDarts || "—" }].map((s, i) => (<div key={i} style={{ background: "#1A1A1A", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}><div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{s.label}</div><div style={{ fontSize: 17, fontWeight: 500, color: "#fff", fontFamily: "'Inter', 'Helvetica Neue', -apple-system, sans-serif" }}>{s.value}</div></div>))}</div>
        {p.gameHistory && p.gameHistory.length > 0 && (<div style={{ marginBottom: 24 }}><div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>Recent games</div><div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {p.gameHistory.map((g, i) => (<div key={i} onClick={() => { setViewingGameDetail(g); setScreen("gameDetail"); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#1A1A1A", borderRadius: 10, borderLeft: `3px solid ${g.won ? "#1B8A42" : "#C41E2A"}`, cursor: "pointer" }}>
            <div style={{ fontSize: 12, fontWeight: 500, width: 22, textAlign: "center", color: g.won ? "#1B8A42" : "#C41E2A" }}>{g.won ? "W" : "L"}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: "#fff" }}>vs {g.opponent} {g.legs && <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>({g.legs})</span>}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>3d avg {g.avg3dart || g.avgPerRound} · high {g.highTurn}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{new Date(g.date).toLocaleDateString()}</span><span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>›</span></div>
          </div>))}</div></div>)}
        <button onClick={() => setDeleteTarget(p)} style={{ width: "100%", padding: "10px", fontSize: 13, fontWeight: 500, borderRadius: 10, cursor: "pointer", background: "transparent", color: "#C41E2A", border: "1px solid #C41E2A33" }}>Delete player</button>
      </div></div>);
  }

  // ── MATCH STATS ──
  if (screen === "matchStats") {
    const pN = [getPlayerById(selectedPlayers[0])?.name || "P1", getPlayerById(selectedPlayers[1])?.name || "P2"];
    return <MatchStatsView pNames={pN} legsScore={[legs[0], legs[1]]} mStats={matchStats} legResults={legResults} onDone={() => setScreen("home")} />;
  }

  // ── GAME ──
  const p1 = getPlayerById(selectedPlayers[0]); const p2 = getPlayerById(selectedPlayers[1]);
  const pNames = [p1?.name || "P1", p2?.name || "P2"];
  const displayScores = [0, 1].map(i => i === currentPlayer ? previewScore : scores[i]);
  const inputDisplay = inputParts.length > 0 ? inputParts.join(" + ") + (inputValue ? " + " + inputValue : " +") + " = " + currentInputTotal : (inputValue || "0");
  const ROWS = [{ left: 26, keys: [1, 2, 3], right: 57 }, { left: 29, keys: [4, 5, 6], right: 60 }, { left: 41, keys: [7, 8, 9], right: 95 }, { left: 45, keys: ["del", 0, "+"], right: 100 }];
  const maxRounds = Math.max(history[0].length, history[1].length);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", userSelect: "none", display: "flex", flexDirection: "column", border: "3px solid #1A1A1A", borderRadius: 16, overflow: "hidden", position: "relative", background: "#111", height: "100vh", maxHeight: "100dvh" }}>
      {pendingCheckout && <DartCountDialog score={pendingCheckout.turnScore} onSelect={n => applyTurn(pendingCheckout.turnScore, n)} />}
      {showWinDialog && matchWinner !== null && <WinDialog playerName={pNames[matchWinner]} legs={legs} onDone={() => { setShowWinDialog(false); setScreen("matchStats"); }} />}
      {showEndConfirm && <ConfirmOverlay title="End match" message="End current match? Progress will not be saved." confirmLabel="End match" danger onConfirm={() => { setShowEndConfirm(false); setScreen("home"); }} onCancel={() => setShowEndConfirm(false)} />}
      {scoreFlash !== null && <ScoreFlash key={flashKey} score={scoreFlash} onDone={() => setScoreFlash(null)} />}

      {/* SCOREBOARD */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 52px 1fr", flexShrink: 0 }}>
        {[0, 1].map(idx => { const isTyping = idx === currentPlayer && hasInput; const sc = displayScores[idx]; const isBust = isTyping && (sc < 0 || sc === 1); return (
          <div key={idx} style={{ padding: "1.2vh 0", textAlign: "center", background: currentPlayer === idx ? SC[idx] : "#1A1A1A", transition: "background 0.2s", order: idx === 0 ? 0 : 2 }}>
            <div style={{ fontSize: "2.5vw", fontWeight: 500, color: "rgba(255,255,255,0.65)", letterSpacing: 0.5 }}>{pNames[idx]}</div>
            <div style={{ fontSize: "8vw", fontWeight: 500, fontFamily: "'Inter', 'Helvetica Neue', -apple-system, sans-serif", letterSpacing: -2, lineHeight: 1.1, color: isBust ? "#FF6B6B" : isTyping ? "#FFD700" : "#fff", transition: "color 0.15s" }}>{isBust ? scores[idx] : sc}</div>
            {isBust ? <div style={{ fontSize: "2.5vw", color: "#FF6B6B", fontWeight: 500, marginTop: 1 }}>BUST</div> : <div style={{ fontSize: "2.2vw", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>avg {calcAvg3(idx)}</div>}
          </div>); })}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#111", order: 1, gap: 2 }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase" }}>Ft{legFormat}</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: "#fff", fontFamily: "'Inter', 'Helvetica Neue', -apple-system, sans-serif" }}>{legs[0]}-{legs[1]}</div>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: SC[currentPlayer], alignSelf: currentPlayer === 0 ? "flex-start" : "flex-end", margin: "0 10px", transition: "all 0.3s" }} />
        </div>
      </div>

      {/* ROUND HISTORY (DartConnect style) */}
      <div style={{ background: "#0A0A0A", flex: 1, minHeight: 80, overflowY: "auto", borderTop: "1px solid #222", borderBottom: "1px solid #222" }}>
        {maxRounds === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 80 }}>
            {message ? <div style={{ fontSize: message.includes("BUST") || message.includes("Max") ? 18 : 16, fontWeight: 500, color: message.includes("BUST") || message.includes("Max") ? "#E24B4A" : "#5DCAA5" }}>{message}</div>
            : <div style={{ fontSize: 14, color: "rgba(255,255,255,0.2)" }}>Scores will appear here</div>}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr", fontSize: 16, fontFamily: "'Inter', 'Helvetica Neue', -apple-system, sans-serif", padding: "4px 8px" }}>
            {message && <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4px 0", fontSize: 16, fontWeight: 500, color: message.includes("BUST") || message.includes("Max") ? "#E24B4A" : "#5DCAA5" }}>{message}</div>}
            {Array.from({ length: maxRounds }).map((_, i) => {
              const ri = maxRounds - 1 - i;
              return (<React.Fragment key={ri}>
                <div style={{ textAlign: "center", padding: "5px 0", color: history[0][ri]?.bust ? "#E24B4A" : history[0][ri]?.checkout ? "#5DCAA5" : "rgba(255,255,255,0.7)" }}>
                  {history[0][ri] ? (history[0][ri].bust ? "BUST" : history[0][ri].score) : ""}{history[0][ri] && !history[0][ri].bust && <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}> {history[0][ri].remaining}</span>}{history[0][ri]?.checkout && <span style={{ color: "#5DCAA5", fontSize: 12 }}> ({history[0][ri].darts}d)</span>}
                </div>
                <div style={{ textAlign: "center", color: "rgba(255,255,255,0.15)", padding: "5px 0", fontSize: 12 }}>{ri + 1}</div>
                <div style={{ textAlign: "center", padding: "5px 0", color: history[1][ri]?.bust ? "#E24B4A" : history[1][ri]?.checkout ? "#5DCAA5" : "rgba(255,255,255,0.7)" }}>
                  {history[1][ri] ? (history[1][ri].bust ? "BUST" : history[1][ri].score) : ""}{history[1][ri] && !history[1][ri].bust && <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}> {history[1][ri].remaining}</span>}{history[1][ri]?.checkout && <span style={{ color: "#5DCAA5", fontSize: 12 }}> ({history[1][ri].darts}d)</span>}
                </div>
              </React.Fragment>);
            })}
          </div>
        )}
      </div>

      {/* INPUT DISPLAY */}
      <div style={{ background: "#fff", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "center", height: "6vh", flexShrink: 0 }}>
        <span style={{ fontSize: "5vw", fontWeight: 500, color: (inputValue || inputParts.length > 0) ? "#1A1A1A" : "#ccc", fontFamily: "'Inter', 'Helvetica Neue', -apple-system, sans-serif", letterSpacing: -1, whiteSpace: "nowrap", overflow: "hidden" }}>{inputDisplay}</span>
        {(inputValue || inputParts.length > 0) && <span style={{ width: 2, height: "3vh", background: "#C41E2A", marginLeft: 2, flexShrink: 0, animation: "blink 1s step-end infinite" }} />}
      </div>

      {/* BACK / MODE / BUST */}
      <div style={{ display: "grid", gridTemplateColumns: "64px 1fr 64px", flexShrink: 0 }}>
        <button onClick={undoLast} style={{ ...B, padding: "8px 0", fontSize: 12, fontWeight: 500, background: "#333", color: "#fff", border: "0.5px solid #444" }}>BACK</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#222", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: 0.5 }}>{scores[currentPlayer] <= 170 ? "Double out" : "Straight-In"}</div>
        <button onClick={handleBust} style={{ ...B, padding: "8px 0", fontSize: 12, fontWeight: 500, background: "#8B4513", color: "#fff" }}>BUST</button>
      </div>

      {/* KEYPAD */}
      <div style={{ display: "flex", flexDirection: "column", background: "#222", flexShrink: 0, flex: 2 }}>
        {ROWS.map((row, ri) => (<div key={ri} style={{ display: "grid", gridTemplateColumns: "12% 1fr 1fr 1fr 12%", flex: 1 }}>
          <button onClick={() => submitScore(row.left)} style={{ ...B, fontSize: "3.2vw", fontWeight: 500, background: "transparent", color: "#B5D4F4", border: "0.5px solid #2A2A2A" }}>{row.left}</button>
          {row.keys.map((k, ki) => { const isDel = k === "del"; const isPlus = k === "+"; return (<button key={ki} onClick={() => { if (isDel) handleDelete(); else if (isPlus) handlePlus(); else handleNumKey(k); }} style={{ ...B, fontSize: isDel || isPlus ? "3.5vw" : "5vw", fontWeight: 500, background: isDel ? "#444" : isPlus ? "#2A5A8A" : "#F5F0E8", color: isDel || isPlus ? "#fff" : "#1A1A1A", border: "0.5px solid rgba(0,0,0,0.1)" }}>{isDel ? "←" : k}</button>); })}
          <button onClick={() => submitScore(row.right)} style={{ ...B, fontSize: "3.2vw", fontWeight: 500, background: "transparent", color: "#B5D4F4", border: "0.5px solid #2A2A2A" }}>{row.right}</button>
        </div>))}
        <div style={{ display: "grid", gridTemplateColumns: "12% 1fr 1fr 1fr 12%", flex: 1 }}>
          <button onClick={() => submitScore(85)} style={{ ...B, fontSize: "3.2vw", fontWeight: 500, background: "transparent", color: "#B5D4F4", border: "0.5px solid #2A2A2A" }}>85</button>
          <button onClick={() => submitScore(0)} style={{ ...B, fontSize: "3.2vw", fontWeight: 500, background: "#DAA520", color: "#fff", border: "0.5px solid rgba(0,0,0,0.1)" }}>MISS</button>
          <button onClick={() => submitScore(180)} style={{ ...B, fontSize: "3.5vw", fontWeight: 500, background: "#C41E2A", color: "#fff", border: "0.5px solid rgba(0,0,0,0.1)" }}>180</button>
          <button onClick={handleSubmitInput} style={{ ...B, fontSize: "3.5vw", fontWeight: 500, background: "#1B8A42", color: "#fff", border: "0.5px solid rgba(0,0,0,0.1)" }}>OK</button>
          <button onClick={() => submitScore(140)} style={{ ...B, fontSize: "3.2vw", fontWeight: 500, background: "transparent", color: "#B5D4F4", border: "0.5px solid #2A2A2A" }}>140</button>
        </div>
      </div>

      {/* LEG WIN DIALOG */}
      {showLegWinDialog && winner !== null && !matchWinner && (() => {
        const winnerName = getPlayerById(selectedPlayers[winner])?.name;
        return (<Overlay><div style={{ background: "#1A1A1A", borderRadius: 16, padding: "32px 28px", maxWidth: 320, width: "100%", textAlign: "center", border: "2px solid #5DCAA5", boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Leg {legs[0] + legs[1]}</div>
          <div style={{ fontSize: 28, fontWeight: 500, color: "#fff", marginBottom: 4 }}>{winnerName}</div>
          <div style={{ fontSize: 18, color: "#5DCAA5", fontWeight: 500, marginBottom: 6 }}>Wins the leg!</div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", marginBottom: 24 }}>{legs[0]} - {legs[1]}</div>
          <button onClick={startNewLeg} style={{ padding: "14px 48px", fontSize: 16, fontWeight: 500, borderRadius: 12, cursor: "pointer", background: "#C41E2A", color: "#fff", border: "none" }}>Next Leg</button>
        </div></Overlay>);
      })()}

      {/* BOTTOM BAR */}
      <div style={{ background: "#111", padding: "7px 10px", display: "flex", alignItems: "center", justifyContent: "flex-end", flexShrink: 0 }}>
        {matchWinner !== null ? (<button onClick={() => setScreen("matchStats")} style={{ ...B, padding: "6px 12px", fontSize: 12, fontWeight: 500, background: "#C41E2A", color: "#fff", borderRadius: 8 }}>Stats</button>
        ) : (<button onClick={() => setShowEndConfirm(true)} style={{ ...B, fontSize: 12, color: "#E24B4A", background: "none" }}>End</button>)}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes scoreFlash { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); } 15% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); } 30% { transform: translate(-50%, -50%) scale(1); } 80% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -60%) scale(1); } }
        button:active { opacity: 0.65 !important; transform: scale(0.97); }
        * { box-sizing: border-box; margin: 0; }
      `}</style>
    </div>
  );
}
