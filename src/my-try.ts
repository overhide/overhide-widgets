import {
    customElement,
    FASTElement,
    html,
    css,
    attr
} from "@microsoft/fast-element";

const template = html<MyTry>`
<div>
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
