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
import { OverhideBtcManual } from './btc-manual';

import w3Css from "../../static/w3.css";
import closeIcon from "../../static/icons/close.svg";

OverhideOhledger;
OverhideBtcManual;

const template = html<OverhideLogin>`
  <template class="w3-modal" ${ref('rootElement')} style="padding-top: 0px; padding-bottom: 0px;">
    <div class="envelope" ${ref('envelopeElement')} @click="${(e, c) => e.outsideClick(c.event)}">
      <div class="w3-modal-content modal">
      <div class="w3-display-container modal-container">

        <button class="close-button w3-right w3-display-topright" type="button" @click="${(e, c) => e.close()}">${closeIcon}</button>
      
        <div class="modal">
          <div class="w3-container">
            <slot name="header"></slot>
            ${when(e => e.overhideLedgerEnabled, html<OverhideLogin>`
              <div class="s12">
                <overhide-ohledger hubId="${e => e.hubId}" @close="${(e) => e.close()}"></overhide-ohledger>
              </div>
            `)}
            ${when(e => e.overhideLedgerEnabled, html<OverhideLogin>`
              <div class="s12">
                <overhide-btc-manual hubId="${e => e.hubId}" @close="${(e) => e.close()}"></overhide-btc-manual>
              </div>
            `)}
            ${when(e => e.overhideLedgerEnabled, html<OverhideLogin>`
              <div class="s12">
                <overhide-ohledger hubId="${e => e.hubId}" @close="${(e) => e.close()}"></overhide-ohledger>
              </div>
            `)}
            ${when(e => e.overhideLedgerEnabled, html<OverhideLogin>`
              <div class="s12">
                <overhide-btc-manual hubId="${e => e.hubId}" @close="${(e) => e.close()}"></overhide-btc-manual>
              </div>
            `)}
            ${when(e => e.overhideLedgerEnabled, html<OverhideLogin>`
              <div class="s12">
                <overhide-ohledger hubId="${e => e.hubId}" @close="${(e) => e.close()}"></overhide-ohledger>
              </div>
            `)}
            ${when(e => e.overhideLedgerEnabled, html<OverhideLogin>`
              <div class="s12">
                <overhide-btc-manual hubId="${e => e.hubId}" @close="${(e) => e.close()}"></overhide-btc-manual>
              </div>
            `)}
            ${when(e => e.overhideLedgerEnabled, html<OverhideLogin>`
              <div class="s12">
                <overhide-ohledger hubId="${e => e.hubId}" @close="${(e) => e.close()}"></overhide-ohledger>
              </div>
            `)}
            ${when(e => e.overhideLedgerEnabled, html<OverhideLogin>`
              <div class="s12">
                <overhide-btc-manual hubId="${e => e.hubId}" @close="${(e) => e.close()}"></overhide-btc-manual>
              </div>
            `)}          
          </div>
        </div>
      </div>
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
    max-height: 80vh;
    background: white;
    overflow-y: auto;
  }

  .modal-container {
    max-width: 40em;
    max-height: 80vh;
  }

  .content {
    overflow-y: scroll;
  }

  .envelope {
    width: 100%;
    height: 100%;
    padding-top: 70px;
  }

  .close-button {
    background: white;
    border: none;
    cursor: pointer;
    padding: 4px;
    padding-right: 6px;
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
  envelopeElement?: HTMLElement;
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

    window.addEventListener('keydown', (event: any) => {
      if (event.key == 'Escape') {
        this.close();
      }
    });  
  };

  paymentInfoChanged(info: PaymentsInfo): void {
  }

  close(): void {
    if (this.rootElement) {
      this.rootElement.style.display = 'none';
      this.$emit('overhide-login-close');
    }
  }

  outsideClick(event: any) {
    if (event.target == this.envelopeElement) {
      this.close();
    }
  }
}
