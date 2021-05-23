import {
  attr,
  css,
  customElement,
  html,
  ref,
  when,
  FASTElement,
  Observable
} from "@microsoft/fast-element";

import {
  Imparter,
  IOverhideHub,
  PaymentsInfo
} from '../hub/definitions';

import { OverhideOhledger } from './ohledger';

import w3Css from "../../static/w3.css";
import closeIcon from "../../static/icons/close.svg";

OverhideOhledger;

const template = html<OverhideLogin>`
  <template class="w3-modal" ${ref('rootElement')}>
    <div class="w3-modal-content modal">
      <div class="w3-container">
        <slot name="header"><div class="w3-padding-16"></div></slot>
        <span @click="${(e, c) => e.close()}" class="w3-button w3-display-topright">${closeIcon}</span>      
        ${when(e => e.overhideLedgerEnabled, html<OverhideLogin>`
          <overhide-ohledger hubId="${e => e.hubId}" @close="${(e) => e.close()}"></overhide-ledger>
        `)}
      </div>
    </div>
  </template>
`;

const styles = css`
  ${w3Css}
  
  :host {
    font-family: "Segoe UI", Arial, sans-serif
  }  

  svg {
    margin-top: 3px;
    width: 1em;
    height: 1em;
  }

  .modal {
    max-width: 40em;
  }
`;


@customElement({
  name: "overhide-login",
  template,
  styles,
})
export class OverhideLogin extends FASTElement {
  @attr 
  hubId?: string;

  @attr
  overhideLedgerEnabled?: boolean = true;

  rootElement?: HTMLElement;
  hub?: IOverhideHub; 

  public constructor() {
    super(); 
  }

  public setHub(hub: IOverhideHub) {
    this.hub = hub;
    const notifier = Observable.getNotifier(hub);
    const that = this;
    const handler = {
      handleChange(source: any, propertyName: string) {
        switch (propertyName) {
          case 'paymentsInfo':
            that.paymentInfoChanged(source.paymentsInfo);
            break;
        } 
      }
    }

    notifier.subscribe(handler, 'paymentsInfo')
    notifier.subscribe(handler, 'error')
  }

  hubIdChanged(oldValue: string, newValue: string) {
    const el = document.querySelector(`#${this.hubId}`) as any;
    if (!el) {
      console.log(`WARNING: overhide-login configured for overhide-hub with ID ${newValue} but no element in DOM with this ID.`);
      return;
    }
    if (!el.THIS_IS_OVERHIDE_HUB) {
      console.log(`WARNING: overhide-login configured for overhide-hub with ID ${newValue} but element with this ID is not an overhide-hub element.`);
      return;
    }
    this.setHub(el);
  }

  connectedCallback() {
    super.connectedCallback();
  };

  paymentInfoChanged(info: PaymentsInfo): void {
  }

  close(): void {
    if (this.rootElement) {
      this.rootElement.style.display = 'none';
    }
  }
}
