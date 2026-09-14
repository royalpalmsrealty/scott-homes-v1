"use client";

import { ConversationProvider, useConversation, useConversationClientTool } from "@elevenlabs/react";
import { useEffect, useRef, useState } from "react";
import { getOfferDraftContext, getOfferSessionDetails, needsAgentCoordination, parseIntakePatch, representationChoices, type IntakeDraft } from "@/lib/offerIntake";
import { brand } from "@/lib/brand";
import { useScreenAwake } from "./useScreenAwake";
import { ScreenAwakeNotice } from "./ScreenAwakeNotice";
import { observeVoiceBackground } from "@/lib/voiceBackground";
import { createVoiceHealth, type VoiceHealth } from "@/lib/voiceHealth";
import { reportVoiceEvent } from "@/lib/voiceDiagnostics";
import { getHumanHandoffGuidance, HUMAN_CALL_EVENT, shouldOfferHumanHelp } from "@/lib/humanHandoff";
import { CallScottLink } from "./CallScottLink";

export const RECEPTIONIST_AGENT_ID = "agent_4201m294fbxkf2qs82samt0bfwv7";

type AgentConversationProps = {
  agentId?: string;
  onDraft?: (patch: Partial<IntakeDraft>) => void | Promise<string | void>;
  draft?: IntakeDraft;
  propertyContext?: string;
  onUseWrittenForm?: () => void;
  ensureScreenAwake?: () => Promise<boolean>;
};

export function AgentConversation({ agentId = RECEPTIONIST_AGENT_ID, ...props }: AgentConversationProps) {
  return <ConversationProvider><Conversation agentId={agentId} {...props} /></ConversationProvider>;
}

function Conversation({ agentId, onDraft, draft, propertyContext, onUseWrittenForm, ensureScreenAwake }: AgentConversationProps & { agentId: string }) {
  const [messages, setMessages] = useState<{ role: string; message: string }[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [voice, setVoice] = useState(false);
  const [consent, setConsent] = useState(false);
  const [typingReply, setTypingReply] = useState(false);
  const [interrupted, setInterrupted] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const [humanHelp, setHumanHelp] = useState(false);
  const [callOpened, setCallOpened] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [returned, setReturned] = useState(false);
  const [health, setHealth] = useState<VoiceHealth>("ready");
  const [inputLevel, setInputLevel] = useState(0);
  const healthMonitor = useRef(createVoiceHealth());
  const startAttempt = useRef(0);
  const starting = useRef(false);
  const lastAudioLog = useRef(0);
  const lastInputLog = useRef(0);
  const backgroundPause = useRef(false);
  const humanQuestionPending = useRef(false);
  const hasConnected = useRef(false);
  const lastDraftContext = useRef("");
  const conversation = useConversation({
    onMessage: ({ role, message }) => {
      setReturned(false);
      if (role === "user") { healthMonitor.current.userMessage(); reportVoiceEvent("user_received"); }
      else { healthMonitor.current.agentActivity(); reportVoiceEvent("agent_received"); }
      setMessages(previous => [...previous.slice(-79), { role, message }]);
      const offered = shouldOfferHumanHelp(role, message);
      if (role !== "user") humanQuestionPending.current = offered;
      if (offered) { setHumanHelp(true); reportVoiceEvent("human_help"); }
    },
    onAudio: () => {
      healthMonitor.current.agentActivity();
      if (Date.now() - lastAudioLog.current > 10000) { lastAudioLog.current = Date.now(); reportVoiceEvent("audio_received"); }
    },
    onConnect: () => { hasConnected.current = true; starting.current = false; healthMonitor.current.reset(); reportVoiceEvent("connected"); setInterrupted(false); setError(""); },
    onDisconnect: ({ reason }) => {
      starting.current = false;
      reportVoiceEvent("disconnected");
      if (reason !== "user" && hasConnected.current && !backgroundPause.current) {
        setInterrupted(true);
        setHumanHelp(true);
        setError(onDraft ? "Connection ended. Your answers are still on this page. Resume or edit your answers in the summary." : "Connection ended. You can reconnect below.");
      }
    },
    onError: () => { starting.current = false; reportVoiceEvent("connection_error"); if (!backgroundPause.current) { setHumanHelp(true); setError(onDraft ? "The AI connection is unavailable. Try again, call Scott, or edit your answers in the summary." : "The AI connection is unavailable. Try again or call Scott."); } },
  });
  // The hook keeps the tool handler current as the buyer edits the form.
  useConversationClientTool("update_offer_draft", async parameters => {
    if (humanQuestionPending.current) return "No offer changes saved. A yes/no about speaking to Scott is not an intake answer. If the visitor wants Scott, direct them to Call Scott now and pause intake. If they decline, ask the next unanswered offer question.";
    const patch = parseIntakePatch(parameters);
    if (!onDraft || !patch) return "No changes saved. Ask the visitor to edit the onscreen offer fields.";
    const propertyResult = await onDraft(patch);
    if (needsAgentCoordination(patch.representation)) return "The offer interview is paused so the office can coordinate the buyer's existing-agent status. Do not collect more offer terms.";
    const representationNote = patch.representation === representationChoices.transactionBroker ? "The buyer's No-other-agent answer is saved. Ask the next unanswered question without representation commentary. " : "";
    return representationNote + (propertyResult || "Buyer-stated details updated onscreen, replacing prior values for those fields. They are unverified and unsent. The visitor must review and confirm them using the form.");
  });
  const active = conversation.status === "connected";
  const connecting = conversation.status === "connecting";
  const screenAwake = useScreenAwake(!onDraft);
  const draftContext = onDraft && draft ? `${getOfferDraftContext(draft)}\n\n${propertyContext ?? ""}` : "";
  const { sendContextualUpdate } = conversation;
  const { endSession } = conversation;
  useEffect(() => () => { startAttempt.current++; }, []);
  useEffect(() => {
    function openPhone() {
      startAttempt.current++; starting.current = false; setPreparing(false);
      reportVoiceEvent("call_tapped");
      backgroundPause.current = true;
      setCallOpened(true); setHumanHelp(true); setError("");
      setSuspended(false); setInterrupted(true);
      endSession();
    }
    window.addEventListener(HUMAN_CALL_EVENT, openPhone);
    return () => window.removeEventListener(HUMAN_CALL_EVENT, openPhone);
  }, [endSession]);
  useEffect(() => {
    if (!voice || !active) return;
    return observeVoiceBackground(document, window, () => {
      if (backgroundPause.current) return;
      setSuspended(true);
      reportVoiceEvent("hidden");
    }, () => {
      if (backgroundPause.current) return;
      reportVoiceEvent("returned");
      healthMonitor.current.reset();
      setSuspended(false); setReturned(true); setHealth("quiet");
    });
  }, [voice, active]);
  const { getInputVolume, isSpeaking, isMuted } = conversation;
  useEffect(() => {
    if (!voice || !active || suspended) return;
    let previous: VoiceHealth = "ready";
    const timer = setInterval(() => {
      const next = healthMonitor.current.sample({ speaking: isSpeaking, muted: isMuted });
      setHealth(next);
      if (next !== previous && (next === "quiet" || next === "delayed")) reportVoiceEvent(next);
      previous = next;
      const volume = getInputVolume();
      setInputLevel(Number.isFinite(volume) ? Math.round(Math.min(1, Math.max(0, volume)) * 100) : 0);
      if (volume > 0.02 && Date.now() - lastInputLog.current > 10000) { lastInputLog.current = Date.now(); reportVoiceEvent("input_signal"); }
    }, 250);
    return () => clearInterval(timer);
  }, [voice, active, suspended, getInputVolume, isSpeaking, isMuted]);
  useEffect(() => {
    if (!active || !draftContext || draftContext === lastDraftContext.current) return;
    // Coalesce typing without triggering an extra agent response or restarting audio.
    const timer = setTimeout(() => {
      try {
        sendContextualUpdate(draftContext, { contextId: "offer-draft-values" });
        lastDraftContext.current = draftContext;
      } catch { /* A disconnected session receives the full draft on resume. */ }
    }, 350);
    return () => clearTimeout(timer);
  }, [active, draftContext, sendContextualUpdate]);

  async function start(withVoice: boolean) {
    if (starting.current) return;
    const attempt = ++startAttempt.current;
    starting.current = true;
    setPreparing(true); setError("");
    reportVoiceEvent(active ? "reconnect" : "start");
    if (withVoice) {
      const protectedScreen = await (ensureScreenAwake ?? screenAwake.request)();
      if (attempt !== startAttempt.current) return;
      if (!protectedScreen || document.visibilityState !== "visible") {
        starting.current = false; setPreparing(false); setHumanHelp(true);
        setError("This browser has not enabled screen-awake protection. Open this website directly in Safari or Chrome for voice, or call Scott below.");
        reportVoiceEvent("start_blocked");
        return;
      }
    }
    if (active) endSession();
    healthMonitor.current.reset(); setReturned(false); setHealth("ready"); setInputLevel(0);
    backgroundPause.current = false; humanQuestionPending.current = false;
    setSuspended(false); setCallOpened(false); setHumanHelp(false);
    setError(""); setVoice(withVoice); setTypingReply(false);
    setPreparing(false);
    const offerSession = onDraft && draft ? getOfferSessionDetails(draft) : undefined;
    conversation.startSession({
      agentId, connectionType: withVoice ? "webrtc" : "websocket", textOnly: !withVoice,
      useWakeLock: false, // The intake-wide controller handles retries and text sessions too.
      onConversationCreated: session => {
        if (offerSession) {
          session.sendContextualUpdate(`${offerSession.context}\n\n${propertyContext ?? ""}`, { contextId: "offer-draft" });
          lastDraftContext.current = draftContext;
        }
        session.sendContextualUpdate(getHumanHandoffGuidance(brand.broker.name, brand.phone.display), { contextId: "human-help" });
      },
    });
  }

  function useWrittenForm() {
    startAttempt.current++; starting.current = false; setPreparing(false);
    conversation.endSession();
    onUseWrittenForm?.();
  }

  return <div className="space-y-4 font-sans text-sm">
    {humanHelp && <div role="status" className="space-y-3 rounded-xl border border-teal-deep bg-paper p-4">
      <p>{callOpened ? "The AI conversation is paused. Use your phone’s calling app to reach Scott." : "Would you like to speak with Scott directly?"}</p>
      <p className="text-xs text-muted">{brand.phone.display}{onDraft && " · Your saved answers stay on this page."}</p>
      <div className="flex flex-wrap items-center gap-4"><CallScottLink prominent /><button type="button" className="min-h-11 underline" onClick={() => setHumanHelp(false)}>Dismiss</button></div>
    </div>}
    {suspended && <p role="status" className="rounded-lg bg-paper p-3">This page was in the background.{onDraft && " Your saved answers are still here."} If you cannot hear the agent, tap Reconnect voice.</p>}
    {active && voice && (health === "quiet" || health === "delayed" || suspended || returned) && <div role="status" className="space-y-3 rounded-xl border border-teal-deep bg-paper p-4">
      <p>{health === "delayed" ? "Your reply arrived, but the agent has not responded yet." : "Not hearing a response? You can reconnect voice or speak with Scott."}</p>
      <div className="flex flex-wrap gap-3"><button type="button" disabled={preparing} className="min-h-12 rounded-full border border-teal-deep px-4 py-3 text-teal-deep" onClick={() => void start(true)}>Reconnect voice</button><CallScottLink prominent /></div>
    </div>}
    {!active && !connecting && !preparing && (onDraft ? <div className="space-y-5 rounded-2xl bg-paper p-5 text-center">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto size-10 text-teal-deep"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8" /></svg>
      <div className="space-y-2"><h3 className="font-display text-2xl">{interrupted ? "Continue your offer" : "Let’s talk through your offer"}</h3><p className="text-muted">{draft?.propertyReference ? "We’ll continue from your saved answers." : "The agent will guide you through a few short questions."}</p></div>
      {!consent && <p id="offer-voice-consent" className="text-xs leading-5 text-muted">Your conversation will be processed and may be recorded by Royal Palms Realty and ElevenLabs.</p>}
      <button type="button" aria-describedby={!consent ? "offer-voice-consent" : undefined} className="min-h-14 w-full rounded-full bg-teal-deep px-5 py-4 font-semibold text-white" onClick={() => { setConsent(true); start(true); }}>{consent ? "Resume speaking" : "Agree & start speaking"}</button>
      {onUseWrittenForm && <button type="button" className="min-h-11 w-full text-teal-deep underline" onClick={useWrittenForm}>Type my offer instead</button>}
    </div> : <>
      <p>Speak or type with Royal Palms Realty&rsquo;s AI assistant.</p>
      <label className="flex items-start gap-3 text-xs leading-5 text-muted">
        <input type="checkbox" className="mt-1 size-4 shrink-0" checked={consent} onChange={e => setConsent(e.target.checked)} />
        <span>I agree to my conversation being processed and potentially recorded by Royal Palms Realty and ElevenLabs. Please avoid sharing account passwords, access codes, or payment card details.</span>
      </label>
      <div className="flex gap-2">
        <button className="rounded-full bg-teal-deep px-5 py-3 text-white disabled:opacity-40" disabled={!consent} onClick={() => start(true)}>{interrupted ? "Resume speaking" : "Start voice conversation"}</button>
        <button className="rounded-full border border-line px-5 py-3 disabled:opacity-40" disabled={!consent} onClick={() => start(false)}>{interrupted && !voice ? "Resume text conversation" : "Type instead"}</button>
      </div>
    </>)}
    {(connecting || preparing) && <div className="space-y-3 rounded-xl bg-paper p-5"><p role="status">Connecting to the AI assistant…</p>{voice && <p className="text-xs text-muted">Allow microphone access if your browser asks.</p>}{onUseWrittenForm && <button type="button" className="min-h-11 text-teal-deep underline" onClick={useWrittenForm}>Type my offer instead</button>}</div>}
    <ScreenAwakeNotice status={screenAwake.status} />
    {active && !suspended && <div className="flex items-center justify-between gap-3 rounded-lg bg-paper p-3">
      <span role="status">{voice ? (conversation.isSpeaking ? "AI speaking" : conversation.isMuted ? "Microphone muted" : health === "waiting" ? "Reply received" : "Your turn") : "Chat connected"}</span>
      <div className="flex gap-3">
        {voice && <><button className="underline" onClick={() => conversation.setMuted(!conversation.isMuted)}>{conversation.isMuted ? "Unmute" : "Mute"}</button><button type="button" disabled={preparing} className="underline" onClick={() => void start(true)}>Reconnect voice</button></>}
        {!onUseWrittenForm && <button className="underline" onClick={() => conversation.endSession()}>End</button>}
      </div>
    </div>}
    {active && voice && !suspended && <div className="flex items-center gap-3 text-xs text-muted"><span>Microphone activity</span><meter aria-label="Microphone activity" min={0} max={100} value={inputLevel} className="h-3 min-w-0 flex-1" /></div>}
    {active && onUseWrittenForm && <button type="button" className="min-h-12 w-full rounded-full border border-teal-deep px-5 py-3 font-medium text-teal-deep" onClick={useWrittenForm}>Review my answers</button>}
    {messages.length > 0 && <details open={!voice} className="space-y-3">
      <summary className="cursor-pointer py-2 text-xs text-muted">View conversation</summary>
      <div role="log" aria-label="Conversation transcript" aria-live="polite" className="max-h-64 space-y-3 overflow-y-auto">{messages.map((message, i) => <p key={i} className={`rounded-lg p-3 ${message.role === "user" ? "ml-6 bg-teal/10" : "mr-6 bg-paper"}`}><span className="mb-1 block text-xs font-semibold">{message.role === "user" ? "You" : "Royal Palms AI"}</span>{message.message}</p>)}</div>
    </details>}
    {active && !suspended && voice && <button type="button" aria-expanded={typingReply} className="min-h-11 text-xs text-teal-deep underline" onClick={() => setTypingReply(!typingReply)}>{typingReply ? "Hide typing" : "Type a reply"}</button>}
    {active && !suspended && (!voice || typingReply) && <form className="flex gap-2" onSubmit={e => {
      e.preventDefault();
      const message = input.trim();
      if (!message) return;
      setMessages(previous => [...previous.slice(-79), { role: "user", message }]);
      healthMonitor.current.userMessage();
      if (shouldOfferHumanHelp("user", message)) setHumanHelp(true);
      conversation.sendUserMessage(message);
      setInput("");
    }}>
      <input aria-label="Message the AI assistant" value={input} onChange={e => setInput(e.target.value)} maxLength={2000} className="min-w-0 flex-1 rounded-lg border border-line p-3" placeholder="Type a message…" />
      <button className="rounded-lg bg-teal-deep px-4 text-white" disabled={!input.trim()}>Send</button>
    </form>}
    {error && <p role="alert" className="text-red-700">{error} <a href={brand.phone.href} className="underline">{brand.phone.display}</a></p>}
  </div>;
}
