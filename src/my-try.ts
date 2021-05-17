import {
    customElement,
    FASTElement,
    html,
    css,
    attr
} from "@microsoft/fast-element";

import w3Css from "./static/w3.css";
import someIcon from "./static/icons/oh-ledger-coin.svg";

const template = html<MyTry>`
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
    name: "my-try",
    template,
    styles,
})
export class MyTry extends FASTElement {
    @attr text = "foo";

    connectedCallback() {
      super.connectedCallback();
      console.log('my-header is now connected to the DOM');
    };    
}
