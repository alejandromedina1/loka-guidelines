import { Body, Btn, Btns, Chip, Field, Frame, FrameBar, GhostLines, Hot, Label, Note, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Nothing, Obj } from "./canvas.jsx";

// Prompt Box — a real one. You type in it, the count counts what you typed, the
// limit is a limit you can actually cross, and Send sends the words that are in
// the box.
//
// Framed as a step in a workflow rather than a chat window. The pattern does
// involve a text field, which is why the hub's first principle says to save one
// for genuinely open-ended intent — but "open-ended" is not the same as
// "conversational". This is somebody starting a piece of work by describing it,
// which is the case that earns a prompt in a product that isn't a chatbot.

// 240, not the 4,000 a real composer would carry. The pattern's claim is that
// the limit shows as you approach it rather than once you're refused, and a
// limit nobody can reach by typing can't demonstrate that — it would leave Over
// limit as a frame you have to be shown, which is the thing this playground
// stopped doing. A short brief field is a plausible product for it.
const LIMIT = 240;
// Where the counter starts warning. Approaching, not refused.
const NEAR = 0.8;

// What "Add a file" attaches, in order. The pattern's first decision is that
// chips carry the parameters models read badly — which account, which dates,
// what shape the answer takes — so the three that can be attached are those.
const CONTEXT = ["Current account", "Last 30 days", "As a chart"];

export function PromptComposerPreview({ work, set }) {
  const { text, chips, sent } = work;
  const over = text.length > LIMIT;
  const near = text.length >= LIMIT * NEAR;
  const left = LIMIT - text.length;

  return (
    <Frame width={540}>
      <FrameBar title="New spending report" />
      <Body>
        {/* Submitted: the request is echoed and locked above the answer it
            produced, and a fresh composer opens below for the follow-up. The
            echo is the text that was actually in the box. */}
        {sent && (
          <>
            <div className="mk-echo">
              <Label>You asked</Label>
              <Say size="sm">{sent}</Say>
            </div>
            <GhostLines widths={[100, 95, 88, 54]} />
          </>
        )}

        {/* The three parameters the decision says belong on chips rather than in
            prose — shown before the send rather than discovered after it, and
            removable, because a context chip you can't take off is a decision
            made for you. */}
        {chips.length > 0 && (
          <span className="mk-chips">
            {chips.map((c) => (
              <Hot
                key={c}
                label={`Remove ${c}`}
                onClick={() => set({ ...work, chips: chips.filter((x) => x !== c) })}
              >
                <Chip>{c} ×</Chip>
              </Hot>
            ))}
          </span>
        )}

        <Field
          rows={2}
          state={over ? "error" : text ? "focus" : "idle"}
          placeholder="Describe the report you want…"
          value={text}
          onChange={(e) => set({ ...work, text: e.target.value })}
        />

        {over && (
          <Note tone="warn">Shorten by {text.length - LIMIT} characters to send.</Note>
        )}

        <span className="mk-foot">
          {/* The count is always on and only speaks up near the end. Silent
              until 80%, then it says how much room is left, then it says how
              much has to go — which is the difference between a limit you can
              plan around and one that refuses you. */}
          {near ? (
            <Say tone={over ? "bad" : "mute"} size="sm">
              {over
                ? `${text.length} / ${LIMIT} characters`
                : `${left} character${left === 1 ? "" : "s"} left`}
            </Say>
          ) : (
            <span />
          )}
          <Btns align="end">
            <Btn
              disabled={chips.length >= CONTEXT.length}
              onClick={() => set({ ...work, chips: [...chips, CONTEXT[chips.length]] })}
            >
              Add context
            </Btn>
            <Btn
              variant="primary"
              disabled={!text.trim() || over}
              onClick={() => set({ ...work, sent: text, text: "", chips: [] })}
            >
              Send
            </Btn>
          </Btns>
        </span>
      </Body>
    </Frame>
  );
}

// Which state the box is in, read off what is in it. Nothing selects these:
// typing produces Composing, attaching produces With context, and the 241st
// character produces Over limit whether or not anybody wanted it to.
PromptComposerPreview.work = {
  for: (id) =>
    ({
      empty: { text: "", chips: [], sent: null },
      composing: { text: "What did I spend on food last month?", chips: [], sent: null },
      context: { text: "What did I spend on food last month?", chips: CONTEXT, sent: null },
      over: {
        text:
          "What did I spend on food last month, and break it down by shop, by day of the week, " +
          "by card, and compare each one against the same month last year and the year before " +
          "that, to see whether this is a trend or a one-off, and flag anything that looks " +
          "like a subscription I have forgotten about",
        chips: [],
        sent: null,
      },
      submitted: { text: "", chips: [], sent: "What did I spend on food last month?" },
    })[id] ?? { text: "", chips: [], sent: null },

  state: (w) => {
    if (w.sent) return "submitted";
    if (w.text.length > LIMIT) return "over";
    if (w.chips.length) return "context";
    return w.text ? "composing" : "empty";
  },
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`: `text` is what has been said so far, `chips` is what the product
// has pinned down, `sent` is the request going. What changes is that there is
// nothing to edit before it goes — so the two things the screen box does with
// its own surface, showing context before the send and showing the limit before
// the refusal, both have to become something the product *says*.
//
// Over limit is the interesting one. There is no character count out loud, and
// a limit nobody can see is not a limit — it is a request that rambled, and the
// only way to hold it is to ask for the one part that narrows it.
function PromptVoice({ work, set }) {
  const { text, chips, sent } = work;
  const over = text.length > LIMIT;

  if (sent) {
    return (
      <VoiceStage
        device="Car"
        mood="thinking"
        heard={sent}
        caption="Working it out — it'll be on your phone when you stop."
      >
        <Btn onClick={() => set({ text: "", chips: [], sent: null })}>Ask something else</Btn>
      </VoiceStage>
    );
  }

  if (over) {
    return (
      <VoiceStage
        device="Car"
        mood="speaking"
        heard={`${text.slice(0, 64)}…`}
        caption="That's a lot at once. Which month do you want?"
      >
        <Btn onClick={() => set({ ...work, text: "What did I spend on food last month?" })}>
          Say “last month”
        </Btn>
      </VoiceStage>
    );
  }

  if (chips.length) {
    // Context before the send, said instead of shown. The product repeats what
    // it has pinned down and waits — which costs a turn, and buys the same
    // thing the chips buy on a screen.
    return (
      <VoiceStage
        device="Car"
        mood="speaking"
        heard={text || "What did I spend on food last month?"}
        caption={`${chips.join(", ")}. Shall I?`}
      >
        <Btn variant="primary" onClick={() => set({ ...work, sent: text || "What did I spend on food last month?", text: "", chips: [] })}>
          Yes
        </Btn>
        <Btn onClick={() => set({ ...work, chips: [] })}>Change that</Btn>
      </VoiceStage>
    );
  }

  return (
    <VoiceStage
      device="Car"
      mood="listening"
      heard={text || undefined}
      caption={text ? undefined : "Ask about your spending."}
    >
      {text && (
        <Btn variant="primary" onClick={() => set({ ...work, chips: CONTEXT })}>
          Stop talking
        </Btn>
      )}
      {!text && (
        <Btn onClick={() => set({ ...work, text: "What did I spend on food last month?" })}>
          Speak
        </Btn>
      )}
    </VoiceStage>
  );
}

PromptComposerPreview.surfaces = { voice: PromptVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`. What changes is where the box is and what it already knows: the
// thing selected *is* the context, so the box opens on the object rather than in
// a panel and the chips are already filled in by the selection.
//
// That removes the pattern's hardest job. On a screen, context has to be pinned
// before the send or it is a surprise afterwards — which is why the chips exist
// and why the first decision is about them. Here the reader can see what is
// selected, so what the request will act on is not a promise at all.
function PromptCanvas({ work, set }) {
  const { text, chips, sent } = work;
  const over = text.length > LIMIT;

  return (
    <Board title="Board · Q3 spending">
      <Obj label="Selection" meta="3 charts" selected wide>
        <span className="cv-layer" data-tone={sent ? "next" : undefined}>
          {sent ? "Rewritten from the three selected charts." : "Three charts, March to May"}
        </span>
      </Obj>

      {/* The box on the object, not in a panel. Its scope is the selection, so
          the one thing a screen composer must say out loud is already drawn. */}
      <Obj label={over ? "Too long" : "Ask about this selection"} meta={chips.length ? "Uses the selection" : undefined}>
        <Field
          rows={2}
          state={over ? "error" : text ? "focus" : "idle"}
          placeholder="What should this become?"
          value={text}
          onChange={(e) => set({ ...work, text: e.target.value })}
        />
        {over && <Say tone="bad" size="sm">{`Shorten by ${text.length - LIMIT}`}</Say>}
        <span className="cv-on-object">
          <Btn
            disabled={chips.length >= CONTEXT.length}
            onClick={() => set({ ...work, chips: [...chips, CONTEXT[chips.length]] })}
          >
            Narrow it
          </Btn>
          <Btn
            variant="primary"
            disabled={!text.trim() || over}
            onClick={() => set({ ...work, sent: text, text: "", chips: [] })}
          >
            Make it
          </Btn>
        </span>
      </Obj>

      {!text && !sent && <Nothing>Select something, then ask.</Nothing>}
    </Board>
  );
}

PromptComposerPreview.surfaces.canvas = PromptCanvas;
