import {
    customElement,
    FASTElement,
    html,
    css,
    attr,
    observable,
    Observable
} from "@microsoft/fast-element";

import w3Css from "./static/w3.css";
import someIcon from "./static/icons/oh-ledger-coin.svg";

const template = html<MyTry>`
<div class="w3-panel w3-red">
  ${someIcon}
  <h3 class="my-try-inner">text: ${x => x.text.toUpperCase()}</h3>
  <button id="clicker" @click="${x => x.do()}">CLICK</button>
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

export interface ComplexInterface {
  foo?: string;
  bar?: string;
}

@customElement({
    name: "my-try",
    template,
    styles,
})
export class MyTry extends FASTElement {
    @attr text = "foo";
    @observable obj: ComplexInterface = {};

    connectedCallback() {
      super.connectedCallback();
      console.log('my-header is now connected to the DOM');
    };   
    
    do() {
      this.obj.foo = (new Date()).toISOString();
      this.obj = {...this.obj};
    }

    public foo() {
      console.log('foo');
    }
}
