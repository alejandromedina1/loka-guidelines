// The voice kit — one living indicator, in the state it is in.
//
// THE SECOND ATTEMPT, AND WHY THE FIRST WAS WRONG
//
// The first one drew a turn timeline: both parties on a rail, the gaps marked
// with how long they were, and what could be done at each point beside it. It
// avoided speech bubbles and it was still a transcript, because it was a record
// of an exchange rather than a picture of a product. The give-away is the hub's
// own rule — "a preview is a product screen, and it has to look like one" — and
// a person talking to a speaker never sees a log of their conversation. They
// see one thing that is alive, and a line of words.
//
// It also broke the model every other preview follows. A screen preview draws
// ONE state and the lab walks between them; the timeline drew all five at once,
// which is the thing Play was removed for. The wait doesn't need a segment
// labelled "420ms" — it needs the indicator to sit in its waiting state for
// 420ms, which the tick already does. Show, don't annotate.
//
// So: a dark stage, an orb that moves differently depending on what is
// happening, and the words underneath. The design decisions land where they
// land on every other surface — in the states, and in the controls the product
// really draws.
//
// THREE THINGS KEEP IT HONEST
//
//   the mood is also a word.  The orb carries the state in motion and colour,
//                 and neither survives a screenshot, a reduced-motion setting
//                 or a screen reader. So the caption says it — which is what a
//                 real device prints anyway: "Listening…".
//   the ramp is ours.         A radial of blue-100 into blue-60, not the purple
//                 every voice assistant on the market uses. This is a Loka
//                 wireframe; borrowing another product's signature colour would
//                 make it a picture of that product.
//   no persona.               The device is named for what it is — a speaker, a
//                 car — never for a character. Same rule as "no frame is titled
//                 Assistant", on the surface where a frame has no title at all.

// The moods an indicator can be in, and the word each one shows. The word is
// not a label for designers: it is the copy the product prints under the orb,
// which is why it reads as a product would say it rather than as a state name.
export const MOODS = {
  listening: "Listening…",
  thinking: "One moment",
  speaking: "Speaking",
  rest: "Done",
  stopped: "Stopped",
  lost: "Lost the connection",
};

// The surface: a dark stage with the indicator on it. Dark because that is what
// an ambient device does — it sits in a room and has to be readable without
// lighting it — and because it separates this surface from the screen ones at a
// glance, which the timeline never managed.
export function VoiceStage({ device, mood = "listening", heard, caption, children }) {
  return (
    <div className="mk-frame vc-stage">
      <div className="vc-head">
        <span className="vc-device">{device}</span>
      </div>

      <div className="vc-field">
        <Orb mood={mood} />
        {/* The state in words, under the orb, where the device prints it. This
            is the only thing carrying the state once motion is off. */}
        <span className="vc-mood">{MOODS[mood]}</span>
      </div>

      {/* What was heard, quietly, above what is being said — a real voice
          product shows this so somebody can tell a wrong answer from a
          misheard question, which is the most common failure on this surface
          and one no screen pattern has to handle. */}
      {heard && <p className="vc-heard">“{heard}”</p>}
      {caption && <p className="vc-caption">{caption}</p>}

      {children && <div className="vc-acts">{children}</div>}
    </div>
  );
}

// The indicator itself. Decorative: everything it says is said again by the
// caption, so there is nothing here for a screen reader to lose.
export function Orb({ mood }) {
  return (
    <span className="vc-orb" data-mood={mood} aria-hidden>
      <span className="vc-orb-core" />
      <span className="vc-orb-ring" />
    </span>
  );
}

// There is no control component here, on purpose. What the device draws is a
// button, and the kit already has the real one — a bespoke `.vc-say` sat here
// for a while and was a second button in a project whose whole argument is that
// there is one. The previews import Btn like every other surface does.
//
// What a voice affordance *is* — a tap target on a device with a screen, a word
// on one without — doesn't change that. Drawn as a control either way, because
// the alternative is an annotation reading "you can talk over it from here",
// which is the caption-that-explains-the-pattern this hub keeps deleting.

// Where the exchange leaves this surface. Four patterns have no voice form, and
// the honest drawing of that is not an empty stage — it is the handoff, which is
// a real decision with a real answer.
export function Handoff({ to, children }) {
  return (
    <div className="vc-handoff">
      <span className="vc-handoff-to">{to}</span>
      <span className="vc-handoff-note">{children}</span>
    </div>
  );
}
