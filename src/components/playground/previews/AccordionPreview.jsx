import { useState } from "react";
import { FAQ_ITEMS } from "../../../data/components.js";
import { PlusMinusIcon } from "../../common/Icon.jsx";

// Live Accordion preview. One item is open at a time; clicking the open item
// collapses it.
export function AccordionPreview() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="faq">
      {FAQ_ITEMS.map((item, i) => {
        const open = openFaq === i;
        return (
          <div key={item.q} className="faq-item" data-open={open}>
            <button className="faq-q" onClick={() => setOpenFaq(open ? -1 : i)}>
              <span className="faq-q-text">{item.q}</span>
              <span className="faq-icon" aria-hidden>
                <PlusMinusIcon />
              </span>
            </button>
            <div className="faq-a-wrap">
              <p className="faq-a">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
