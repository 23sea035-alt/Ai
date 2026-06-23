const CRISIS_RESOURCES = [
  "988 Suicide & Crisis Lifeline: Call or text 988 (US)",
  "Crisis Text Line: Text HOME to 741741",
  "International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/",
];

export function buildCrisisResponse(): string {
  return (
    "I hear you, and I want you to know you're not alone. " +
    "What you're feeling matters, and there are people who care and can help right now.\n\n" +
    "Please reach out to a crisis resource:\n" +
    "• 988 Suicide & Crisis Lifeline — Call or text 988 (US)\n" +
    "• Crisis Text Line — Text HOME to 741741\n" +
    "• Or contact your local emergency services.\n\n" +
    "I'm here to support you, but these professionals are trained to help in ways I cannot. " +
    "Would you like to talk about something that might help ground you right now?"
  );
}

export const SAFE_FALLBACK_REPLY = "I need to be careful with my response here. Let me think about how to respond thoughtfully to what you've shared.";

export { CRISIS_RESOURCES };
