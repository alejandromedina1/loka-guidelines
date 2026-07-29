import { AVATARS } from "../../../data/components.js";

// Live Avatars preview: a row of people, a size demo, and an overlapping stack.
export function AvatarsPreview() {
  return (
    <div className="avatars-demo">
      <div className="avatars-row">
        {AVATARS.map((a) => (
          <span key={a.name} className="avatar" style={{ background: a.color }} title={a.name}>
            {a.initials}
          </span>
        ))}
      </div>
      <div className="avatars-row">
        <span className="avatar avatar-sm" style={{ background: AVATARS[0].color }}>
          {AVATARS[0].initials}
        </span>
        <span className="avatar" style={{ background: AVATARS[1].color }}>
          {AVATARS[1].initials}
        </span>
        <span className="avatar avatar-lg" style={{ background: AVATARS[2].color }}>
          {AVATARS[2].initials}
        </span>
      </div>
      <div className="avatars-stack">
        {AVATARS.slice(0, 4).map((a) => (
          <span key={a.name} className="avatar" style={{ background: a.color }}>
            {a.initials}
          </span>
        ))}
        <span className="avatar avatar-more">+3</span>
      </div>
    </div>
  );
}
