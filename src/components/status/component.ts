import {
  customElement,
  FASTElement,
  html,
  css,
  attr,
  Observable
} from "@microsoft/fast-element";

import {
  PaymentsInfo
} from '../hub/definitions';

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
  @attr 
  hubId?: string;

  public constructor() {
    super(); 
  }

  public setHub(hub: any) {
    const notifier = Observable.getNotifier(hub);
    const that = this;
    const handler = {
      handleChange(source: any, propertyName: string) {
        switch (propertyName) {
          case 'paymentsInfo':
            that.paymentInfoChanged(source.paymentsInfo);
            break;
          case 'error':
            that.errorSet(source.error);
            break;
        } 
      }
    }

    notifier.subscribe(handler, 'paymentsInfo')
    notifier.subscribe(handler, 'error')
  }

  hubIdChanged(oldValue: string, newValue: string) {
    const el = document.querySelector(`#${this.hubId}`);
    if (!el) {
      console.log(`WARNING: overhide-status configured for overhide-hub with ID ${newValue} but no element in DOM with this ID.`);
      return;
    }
    this.setHub(el);
  }

  connectedCallback() {
    super.connectedCallback();
  };

  paymentInfoChanged(info: PaymentsInfo): void {
    console.log(`paymentInfoChanged :: ${JSON.stringify(info,null,2)}`);
  }

  errorSet(error: string): void {
    console.log(`ERROR (overhide-status) :: ${status}`);
  }
}
