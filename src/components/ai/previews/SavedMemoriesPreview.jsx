import { Body, Btn, Btns, Field, Frame, FrameBar, Hot, Label, Note, Part, Row, Say } from "./kit.jsx";
import { Handoff, VoiceStage } from "./voice.jsx";

// Saved Memories in a budgeting product. Somebody mentions their payday once;
// three things follow, and the pattern is that all three are visible.
//
//   Saving is said, in one line, where it happened — memory that fills up
//   silently is discovered later as the product knowing something it
//   shouldn't.
//   Using is said too: the answer that leaned on the payday names it, so a
//   stale fact can't shape an answer with nobody able to see why.
//   Forgetting is real. The row goes and the answers stop using it — and Off
//   is a pause, not a wipe, because people switch memory off for a sensitive
//   stretch rather than for ever.
//
// NOT Visible Sources. That one is what a single piece of work may read; this
// is what the product carries from one piece of work to the next.
const MEMS = [
  { id: "payday", text: "Paid on the 25th" },
  { id: "rent", text: "Rent is £1,150, due on the 1st" },
  { id: "goal", text: "Saving for a trip in June" },
  { id: "round", text: "Likes figures rounded to the pound" },
];
const START = { view: "chat", asked: false, on: true, gone: null, fixing: null, draft: "", fixed: {} };
// The text a memory now says — the original, or what somebody corrected it to.
const textOf = (w, m) => w.fixed?.[m.id] ?? m.text;

function Switch({ on, onClick }) {
  return (
    <Hot label={on ? "Turn memory off" : "Turn memory on"} onClick={onClick}>
      <span className="mk-switch" data-on={on ? "" : undefined}>
        <span className="mk-switch-knob" aria-hidden />
        <span className="vh">{on ? "On" : "Off"}</span>
      </span>
    </Hot>
  );
}

export function SavedMemoriesPreview({ work, set }) {
  const { view, asked, on, gone } = work;

  if (view === "list") {
    const forgot = MEMS.find((m) => m.id === gone);
    const kept = MEMS.filter((m) => m.id !== gone);
    const fixing = work.fixing;
    return (
      <Frame width={540}>
        <FrameBar title="Saved memories" />
        <Body>
          <span className="mk-scope-head">
            <Label>{on ? "Used across every chat" : "Off · nothing used"}</Label>
            <Part name="Toggle Switch">
              <Switch on={on} onClick={() => set({ ...work, on: !on, gone: null })} />
            </Part>
          </span>

          {!on && (
            <Part name="Banner" block>
              <Note kind="Off" title="Nothing new is kept">
                {`The ${kept.length} below wait until it's back on.`}
              </Note>
            </Part>
          )}

          <div className="mk-list" data-off={on ? undefined : ""}>
            {kept.map((m, i) => (
              <Part key={m.id} name={i === 0 ? "List Item" : null} block>
                <Row tone={on ? undefined : "mute"}>
                  {/* Correcting in place: the memory's own row becomes the
                      field, so fixing "paid on the 25th" to the 28th never
                      means deleting it and saying it again. */}
                  {fixing === m.id ? (
                    <span className="mk-mem-fix">
                      <Part name="Input Field" block>
                        <Field
                          value={work.draft}
                          state="focus"
                          onChange={(e) => set({ ...work, draft: e.target.value })}
                        />
                      </Part>
                      <Btns align="end">
                        <Btn onClick={() => set({ ...work, fixing: null })}>Cancel</Btn>
                        <Btn
                          variant="primary"
                          disabled={!work.draft.trim()}
                          onClick={() => set({ ...work, fixing: null, fixed: { ...work.fixed, [m.id]: work.draft.trim() } })}
                        >
                          Save
                        </Btn>
                      </Btns>
                    </span>
                  ) : (
                    <span className="mk-mem-row">
                      <span className="mk-mem-text">{textOf(work, m)}</span>
                      {on && (
                        <span className="mk-mem-acts">
                          <Hot label={`Edit: ${textOf(work, m)}`} onClick={() => set({ ...work, gone: null, fixing: m.id, draft: textOf(work, m) })}>
                            <span className="mk-mem-forget">Edit</span>
                          </Hot>
                          <Hot label={`Forget: ${textOf(work, m)}`} onClick={() => set({ ...work, fixing: null, gone: m.id })}>
                            <span className="mk-mem-forget">Forget</span>
                          </Hot>
                        </span>
                      )}
                    </span>
                  )}
                </Row>
              </Part>
            ))}
          </div>

          {/* Gone for real, and said so — with a moment to change your mind,
              because a forget nobody can take back gets used less. */}
          {forgot && (
            <Part name="Toast" block>
              <span className="mk-mem-toast">
                <span className="mk-mem-toast-text">{`Forgotten: ${forgot.text.toLowerCase()}`}</span>
                <Hot label="Undo forget" onClick={() => set({ ...work, gone: null })}>
                  <span className="mk-mem-undo">Undo</span>
                </Hot>
              </span>
            </Part>
          )}

          <span className="mk-foot">
            <Say tone="mute" size="sm">{`${kept.length} kept`}</Say>
            <Part name="Button">
              <Btns align="end">
                <Btn onClick={() => set({ ...START, on, gone, asked, fixed: work.fixed })}>Back to planning</Btn>
              </Btns>
            </Part>
          </span>
        </Body>
      </Frame>
    );
  }

  return (
    <Frame width={540}>
      <FrameBar title="Budget · planning" />
      <Body>
        <span className="mk-chat-you">Payday is the 25th, so plan around that.</span>
        {/* Said where it happened, in one line, with the way to see all of it. */}
        <Part name="Toast" block>
          <span className="mk-mem-saved">
            <span className="mk-mem-saved-what">Saved: paid on the 25th</span>
            <Hot label="Manage saved memories" onClick={() => set({ ...work, view: "list" })}>
              <span className="mk-mem-manage">Manage</span>
            </Hot>
          </span>
        </Part>
        <p className="mk-mem-reply">Bills due before the 25th will be flagged from now on.</p>

        {asked && (
          <>
            <span className="mk-chat-you">When should the rent go out?</span>
            <p className="mk-mem-reply">Any time after the 25th — it&apos;s due on the 1st, so that leaves a week.</p>
            <span className="mk-mem-used">
              Used: <strong>paid on the 25th</strong> · <strong>rent due on the 1st</strong>
            </span>
          </>
        )}

        <span className="mk-foot">
          <Say tone="mute" size="sm">Memory on</Say>
          {!asked && (
            <Part name="Button">
              <Btns align="end">
                <Btn onClick={() => set({ ...work, asked: true })}>Ask about the rent</Btn>
              </Btns>
            </Part>
          )}
        </span>
      </Body>
    </Frame>
  );
}

SavedMemoriesPreview.work = {
  for: (id) =>
    ({
      saved: START,
      used: { ...START, asked: true },
      list: { ...START, view: "list" },
      forgotten: { ...START, view: "list", gone: "payday" },
      correcting: { ...START, view: "list", fixing: "payday", draft: "Paid on the 28th" },
      off: { ...START, view: "list", on: false },
    })[id] ?? START,

  state: (w) => {
    if (w.view === "chat") return w.asked ? "used" : "saved";
    if (!w.on) return "off";
    if (w.fixing) return "correcting";
    return w.gone ? "forgotten" : "list";
  },
};

// ── Spoken ──────────────────────────────────────────────────────────────────
//
// Same `work`. Saving and using are said in a few words, and "forget that"
// works at any moment. The list is the one part that leaves: four memories
// read out is a list nobody holds, so the count is said and the list goes to
// the phone, where each one can be read and removed.
function MemoryVoice({ work, set }) {
  const { view, asked, on, gone } = work;

  if (view === "list" && on && work.fixing)
    return (
      <VoiceStage device="Watch" mood="listening" heard="That's wrong, it's the 28th" caption="What should it say instead?">
        <Btn variant="primary" onClick={() => set({ ...work, fixing: null, fixed: { ...work.fixed, payday: "Paid on the 28th" } })}>
          Paid on the 28th
        </Btn>
      </VoiceStage>
    );

  if (view === "list" && !on)
    return (
      <VoiceStage device="Watch" mood="stopped" heard="Stop remembering things" caption="Memory's off. Nothing new is kept.">
        <Btn onClick={() => set({ ...work, on: true })}>Turn it back on</Btn>
      </VoiceStage>
    );

  if (view === "list" && gone)
    return (
      <VoiceStage device="Watch" mood="rest" heard="Forget my payday" caption="Forgotten.">
        <Btn onClick={() => set({ ...work, gone: null })}>Undo</Btn>
      </VoiceStage>
    );

  if (view === "list")
    return (
      <VoiceStage device="Watch" mood="speaking" heard="What do you remember about me?" caption="Four things.">
        <Handoff to="Sent to your phone">All four, to look through and clear.</Handoff>
        <Btn onClick={() => set({ ...work, gone: "payday" })}>Forget the payday one</Btn>
        <Btn onClick={() => set({ ...work, on: false })}>Stop remembering</Btn>
      </VoiceStage>
    );

  if (asked)
    return (
      <VoiceStage
        device="Watch"
        mood="speaking"
        heard="When should the rent go out?"
        caption="Any time after the 25th, since that's payday."
      >
        <Btn onClick={() => set({ ...work, view: "list", gone: "payday" })}>Forget my payday</Btn>
      </VoiceStage>
    );

  return (
    <VoiceStage device="Watch" mood="speaking" heard="Payday's the 25th" caption="Noted: payday on the 25th.">
      <Btn onClick={() => set({ ...work, asked: true })}>When should rent go out?</Btn>
      <Btn onClick={() => set({ ...work, view: "list" })}>What do you remember?</Btn>
    </VoiceStage>
  );
}

SavedMemoriesPreview.surfaces = { voice: MemoryVoice };
