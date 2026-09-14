// This event stops website audio before the visitor opens their phone app.
// Only a deliberate tap on the published telephone link dispatches it.
export const HUMAN_CALL_EVENT = "royal-palms:call-human";

export function getHumanHandoffGuidance(name: string, phone: string): string {
  return `Human help takes priority over the intake, including before the existing-agent question. The visitor can speak with ${name} directly at ${phone}. If they express frustration, anger, distress, repeated confusion, difficulty being heard, or dissatisfaction with the AI, briefly ask: “Would you like to speak with Scott directly?” Pause intake questions and wait for their answer. If they ask for a human, live agent, or Scott, honor that immediately without requiring any more offer details or asking why. If they decline, continue from the next unanswered question without pressure or another handoff pitch. If they accept or directly request a person, say only: “Tap Call Scott now to call him directly.” The Call Scott now link is always visible at the bottom of this panel and opens their phone’s calling app. This website does not have an in-call telephone bridge; never claim a transfer is underway, that Scott has answered, or that a callback was arranged. Do not say they are being transferred and then continue the interview. Their saved draft stays on this page, but has not been sent to Scott. Never save a handoff yes/no as an answer to the existing-agent or offer questions.`;
}

// Display-only signals: these can reveal a call link, but never dial, submit an
// offer, change draft answers, or treat a transcript as consent to an action.
export function shouldOfferHumanHelp(role: string, message: string): boolean {
  const text = message.toLowerCase().replace(/[’]/g, "'");
  if (role !== "user") {
    return /\bcall scott now\b/.test(text)
      || /\b(?:would you like|do you want)\b.*\b(?:speak|talk|call|connect|transfer)\b.*\b(?:scott|human|live agent|real person)\b/.test(text);
  }
  if (/\b(?:don't|do not|not now|no thanks|no thank you|i'm not|i am not)\b/.test(text)) return false;
  return /\b(?:speak|talk|connect|transfer)\b.{0,40}\b(?:human|live agent|real person|scott)\b/.test(text)
    || /\b(?:call|get me) scott\b/.test(text)
    || /\b(?:i'm|i am|i feel|i'm getting|i am getting)\s+(?:really |very |so )?(?:frustrated|angry|upset|annoyed|confused)\b/.test(text)
    || /\b(?:this is (?:so |really )?(?:frustrating|ridiculous)|you(?:'re| are) not listening|you (?:can't|cannot) hear me|stop (?:asking|repeating))\b/.test(text);
}
