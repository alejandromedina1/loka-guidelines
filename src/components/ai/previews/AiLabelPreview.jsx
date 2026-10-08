import { Body, Btn, Btns, Chip, Frame, FrameBar, Hot, Label, Part, Row, Say } from "./kit.jsx";
import { VoiceStage } from "./voice.jsx";
import { Board, Obj, OnObject } from "./canvas.jsx";

// AI Label on an email reply the product drafted. One mark, the same one
// everywhere, and the pattern is everything that happens to it: opened, it says
// what wrote the draft and from what; edited, it names both authors; sent, it
// travels to the reader as a quiet note; rewritten to the last word, it comes
// off — because by then it would be a claim about history, not about the text.
//
// The mark is a word with a small glyph, not a glyph alone. A sparkle on its
// own is what five products each invented, and the reader learns five symbols
// and trusts none of them. It is the library's own Tag, not a pill drawn for
// the occasion — one mark means one implementation of it.
const LINES = {
  ai: [
    "Thanks for flagging this.",
    "Invoice 3041 was paid on the 12th — the remittance is attached.",
    "Let us know if it hasn't arrived by Friday.",
  ],
  mixed: [
    "Thanks for flagging this.",
    "Paid on the 12th; remittance attached.",
    "Let us know if it hasn't arrived by Friday.",
  ],
  mine: ["Hi Dana,", "Paid on the 12th — remittance attached.", "Shout if it's not there by Friday."],
};
// Which lines a person wrote, so the draft can say so line by line.
const BY_YOU = { ai: [], mixed: [1], mine: [0, 1, 2] };
const START = { text: "ai", open: false, sent: false };

function Spark() {
  return (
    <svg className="mk-ailabel-glyph" viewBox="0 0 12 12" aria-hidden>
      <path d="M6 1l1.2 3.8L11 6 7.2 7.2 6 11 4.8 7.2 1 6l3.8-1.2z" />
    </svg>
  );
}

function Lines({ text }) {
  return (
    <div className="mk-mail">
      {LINES[text].map((line, i) => {
        const yours = BY_YOU[text].includes(i);
        return (
          <p key={line} className="mk-mail-line" data-by={yours && text !== "mine" ? "you" : undefined}>
            {line}
            {yours && text !== "mine" && <span className="vh"> — edited by you</span>}
          </p>
        );
      })}
    </div>
  );
}

export function AiLabelPreview({ work, set }) {
  const { text, open, sent } = work;
  const labelled = text !== "mine";

  if (sent) {
    return (
      <Frame width={540}>
        <FrameBar title="Northwind · invoice 3041" />
        <Body>
          <Row lead>
            <span className="mk-mail-head">
              <span className="mk-mail-from">You → Dana Okafor</span>
              <span className="mk-mail-when">14:06</span>
            </span>
          </Row>
          <Lines text={text} />
          {/* What the reader sees. Once, under the message, in the same words
              the sender saw — the reader is the one deciding how far to trust
              it, and they weren't there when it was written. */}
          {labelled && (
            <span className="mk-ailabel-foot">
              <Spark />
              Drafted with AI
            </span>
          )}
        </Body>
      </Frame>
    );
  }

  return (
    <Frame width={540}>
      <FrameBar title="Reply · Northwind invoice 3041" />
      <Body>
        <span className="mk-scope-head">
          <Label>To Dana Okafor</Label>
          {labelled && (
            <Part name="Tags">
              <Hot label="What wrote this draft" onClick={() => set({ ...work, open: !open })}>
                <Chip>
                  <span className="mk-ailabel" data-open={open ? "" : undefined}>
                    <Spark />
                    {text === "mixed" ? "AI draft · edited by you" : "AI draft"}
                  </span>
                </Chip>
              </Hot>
            </Part>
          )}
        </span>

        {open && labelled && (
          <Part name="Popover" block>
            <div className="mk-ailabel-pop">
              <span className="mk-param">
                <span className="mk-param-key">Written by</span>
                <span className="mk-param-val">Auto-reply, 14:02</span>
              </span>
              <span className="mk-param">
                <span className="mk-param-key">From</span>
                <span className="mk-param-val">Your last 3 emails with Dana</span>
              </span>
              <span className="mk-param">
                <span className="mk-param-key">Checked by</span>
                <span className="mk-param-val">Nobody yet</span>
              </span>
            </div>
          </Part>
        )}

        <Lines text={text} />

        <span className="mk-foot">
          <Say tone="mute" size="sm">
            {text === "mine" ? "Draft · yours" : "Draft · not sent"}
          </Say>
          <Part name="Button">
            <Btns align="end">
              {text === "ai" && (
                <Btn onClick={() => set({ ...work, text: "mixed", open: false })}>Edit a line</Btn>
              )}
              {text === "mixed" && (
                <Btn onClick={() => set({ ...work, text: "mine", open: false })}>Rewrite the rest</Btn>
              )}
              <Btn variant="primary" onClick={() => set({ ...work, sent: true, open: false })}>
                Send
              </Btn>
            </Btns>
          </Part>
        </span>
      </Body>
    </Frame>
  );
}

AiLabelPreview.work = {
  for: (id) =>
    ({
      drafted: START,
      explained: { ...START, open: true },
      edited: { ...START, text: "mixed" },
      sent: { ...START, text: "mixed", sent: true },
      rewritten: { ...START, text: "mine" },
    })[id] ?? START,

  // Rewritten wins over sent: a reply that is all the sender's own words is
  // theirs whether or not it has gone, and it leaves without a note.
  state: (w) => {
    if (w.text === "mine") return "rewritten";
    if (w.sent) return "sent";
    if (w.open) return "explained";
    return w.text === "mixed" ? "edited" : "drafted";
  },
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`. There is no mark to see, so the label is a few words said once,
// before the draft, in the product's own voice — never a chime, and never a
// named character, which would be a persona standing where a disclosure goes.
function LabelVoice({ work, set }) {
  const { text, open, sent } = work;

  if (text === "mine")
    return (
      <VoiceStage device="Car" mood="rest" heard="Scrap it, I'll say it myself" caption="That one's all yours now." />
    );

  if (sent)
    return <VoiceStage device="Car" mood="rest" heard="Send it" caption="Sent. It's marked as drafted with help." />;

  if (open)
    return (
      <VoiceStage
        device="Car"
        mood="speaking"
        heard="Who wrote that?"
        caption="Drafted from your last three emails with Dana. Nobody's checked it yet."
      >
        <Btn variant="primary" onClick={() => set({ ...work, sent: true, open: false })}>Send it</Btn>
      </VoiceStage>
    );

  if (text === "mixed")
    return (
      <VoiceStage
        device="Car"
        mood="listening"
        heard="Say the remittance is attached"
        caption="Changed. Part of it's yours now."
      >
        <Btn variant="primary" onClick={() => set({ ...work, sent: true })}>Send it</Btn>
        <Btn onClick={() => set({ ...work, text: "mine" })}>Start it again</Btn>
      </VoiceStage>
    );

  return (
    <VoiceStage
      device="Car"
      mood="speaking"
      heard="Reply to Dana about the invoice"
      caption="Here's a draft reply: thanks for flagging this — invoice 3041 was paid on the 12th."
    >
      <Btn onClick={() => set({ ...work, open: true })}>Who wrote that?</Btn>
      <Btn onClick={() => set({ ...work, text: "mixed" })}>Change a line</Btn>
    </VoiceStage>
  );
}

AiLabelPreview.surfaces = { voice: LabelVoice };

// ── On a canvas ─────────────────────────────────────────────────────────────
//
// Same `work`, on a launch plan the product filled in. The mark sits on each
// object it placed and travels with the object — moved, copied or grouped, a
// sticky note does not lose its author.
const NOTES = ["Brief agreed", "Beta list: 40 customers", "Launch email draft"];

function LabelCanvas({ work, set }) {
  const { text, open, sent } = work;
  const marked = (i) => text !== "mine" && i > 0;

  return (
    <Board title={sent ? "Board · Launch plan · shared" : "Board · Launch plan"}>
      {NOTES.map((n, i) => (
        <Obj
          key={n}
          label={n}
          meta={i === 2 && text === "mixed" ? "Edited by you" : i === 0 || text === "mine" ? "You" : undefined}
          selected={i === 2 && open}
        >
          {i === 2 && open && (
            <span className="cv-layer" data-provisional>Placed by Auto-plan from the brief · not checked</span>
          )}
          {marked(i) && (
            <OnObject>
              <Hot label={`What placed ${n}`} onClick={() => set({ ...work, open: !open })}>
                <Chip>
                  <span className="mk-ailabel">
                    <Spark />
                    {i === 2 && text === "mixed" ? "AI · edited" : "AI"}
                  </span>
                </Chip>
              </Hot>
            </OnObject>
          )}
        </Obj>
      ))}
      <span className="cv-foot">
        <Say tone="mute" size="sm">
          {sent ? "Shared with Dana, marks kept" : text === "mine" ? "Every note rewritten by you" : "2 of 3 notes placed by Auto-plan"}
        </Say>
        {!sent && (
          <Btns align="end">
            {text === "ai" && <Btn onClick={() => set({ ...work, text: "mixed", open: false })}>Edit the email note</Btn>}
            {text === "mixed" && <Btn onClick={() => set({ ...work, text: "mine" })}>Rewrite them all</Btn>}
            <Btn variant="primary" onClick={() => set({ ...work, sent: true, open: false })}>Share</Btn>
          </Btns>
        )}
      </span>
    </Board>
  );
}

AiLabelPreview.surfaces.canvas = LabelCanvas;
