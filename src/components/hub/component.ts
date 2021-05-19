import {
  customElement,
  FASTElement,
  html,
  css,
  attr,
  observable
} from "@microsoft/fast-element";

import w3Css from "./static/w3.css";
import someIcon from "./static/icons/oh-ledger-coin.svg";

const template = html<OverhideHub>`
<div class="w3-panel w3-red">
${someIcon}
<h3 id="my-try">text: ${x => x.text.toUpperCase()}</h3>
</div>
`;

const styles = css`
.body {
font-weight: bold;
}

.footer {
color: cornflowerblue;
}

${w3Css}
`;

@customElement({
  name: "overhide-hub",
  template,
  styles,
})
export class OverhideHub extends FASTElement {
  @attr text = "foo";

  @observable 

  connectedCallback() {
    super.connectedCallback();
    console.log('my-header is now connected to the DOM');
  };    
}
