import {
  customElement,
  FASTElement,
  html,
  css,
  attr,
  observable,
  Observable
} from "@microsoft/fast-element";

import { ComplexInterface } from '../../my-try';

import w3Css from "../../static/w3.css";

const template = html<OverhideStatus>`

`;

const styles = css`
${w3Css}
`;


@customElement({
  name: "overhide-status",
  template,
  styles,
})
export class OverhideStatus extends FASTElement {
  @attr hubId: string = 'my-try';

  constructor() {
    super(); 

    const el = document.querySelector(`#${this.hubId}`);
    if (el) {
      const notifier = Observable.getNotifier(el);
      const handler = {
        handleChange(source: any, propertyName: string) {
          if (propertyName == 'obj') {
            console.log(`OverhideStats :: ${JSON.stringify(source.obj)}`);
          }
        }
      }

      notifier.subscribe(handler, 'obj')
    }
  }

  connectedCallback() {
    super.connectedCallback();
  };   
}
