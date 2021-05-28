import {
  customElement,
  FASTElement,
  html,
  css,
  attr,
  Observable,
  observable
} from "@microsoft/fast-element";

import {
  Imparter,
  IOverhideHub,
  PaymentsInfo,
  Social
} from '../hub/definitions';

import w3Css from "../../static/w3.css";
import infoIcon from "../../static/icons/info.svg";
import ethIcon from "../../static/icons/ethereum.svg";

const template = html<OverhideEthWeb3>`
  <div class="panel w3-panel w3-border w3-round-xxlarge ${e => e.isActive ? 'active' : ''}">
    <div class="w3-row w3-margin">
      <div class="w3-col s6 w3-left-align">
        <span class="name svg3">${ethIcon} ethereum login</span>
      </div>
      <div class="currency-span w3-col s6 w3-right-align">
        <span class="currency w3-text-dark-grey">ethers</span>
        <span class="info svg w3-tooltip">
          ${infoIcon}
          <span class="right-tooltip w3-text w3-tag w3-round-xlarge">
            for any in-app purchases, payments would be in ethers (wei)
          </span>
        </span>
      </div>
    </div>
    <form>
      <div class="w3-row w3-margin">
        <div class="message w3-col s12">
          <span class="${e => e.messageClass}">
            ${e => e.message}
          </span>
        </div>
      </div>    
      <div class="w3-row w3-margin">
        <div class="w3-col s12">
          <div class="input">
            <input type="submit" class="w3-button w3-green w3-wide" type="button" value="continue" @click="${e => e.continue()}">
          </div>
        </div>
      </div>    
    </form>
  </div>
`;

const styles = css`
  ${w3Css}

  :host {
    font-family: "Segoe UI", Arial, sans-serif
  }  

  .panel:hover {
    color:#000 !important;
    background-color:#fdf5e6 !important  ;
  }

  .panel.active {
    color:#000 !important;
    background-color:#ddffdd !important;
  }

  .panel:hover .w3-input {
    color:#000 !important;
    background-color:#fdf5e6 !important;
  }

  .panel.active .w3-input {
    color:#000 !important;
    background-color:#ddffdd !important;
  }

  .name {
    margin-left: 1em;
    font-weight: bold;
  }

  .currency {
    font-weight: lighter;
    font-variant: small-caps;
  }

  .currency-span .info {
    margin-right: 1em;
  }

  .svg svg {
    width: 1em;
    height: 1em;
    top: 4px;
    position: relative;
  }

  .svg2 svg {
    width: 1.5em;
    height: 1.5em;
  }

  .svg3 svg {
    width: 1.7em;
    height: 1.7em;
    top: 6px;
    position: relative;
  }

  .clipboard {
    position: relative;
  }

  .clipboard .clickable {
    right: 1px;
    position: absolute;
    top: 6px;
    min-width: 2em;
    text-align: center;
    cursor:pointer;
  }  

  .panel .clipboard .clickable {
    background-color: white !important  ;
  }

  .panel.active .clipboard .clickable {
    background-color:#ddffdd !important  ;
  }

  .panel:hover .clipboard .clickable {
    background-color:#fdf5e6 !important  ;
  }

  .panel.active:hover .clipboard .clickable {
    background-color:#ddffdd !important  ;
  }
  .clipboard .clickable svg {
    width: 1.5em;
  }  

  .right-tooltip {
    position:absolute;
    right:40px;
    width: 20em;
    z-index: 50;
  }

  .input {
    margin-left: 1em;
    margin-right: 1em;
  }

  .input input {
    width: 100%;
  }

  .message {
    margin-left: 1em;
    margin-right: 1em;
    font-weight: lighter;
    font-variant: small-caps;
  }

  .invalidMessage {
    color: red;
  }
`;


@customElement({
  name: "overhide-eth-web3",
  template,
  styles,
})
export class OverhideEthWeb3 extends FASTElement {
  @attr 
  hubId?: string;

  @observable
  address?: string | null;

  @observable
  isActive: boolean = false;

  @observable
  messageClass: string = 'normalMessage';

  @observable
  message?:any;

  hub?: IOverhideHub; 

  public constructor() {
    super();
    this.setNormalMessage();
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
    this.setHub(document.querySelector(`#${this.hubId}`) as any);
  }

  connectedCallback() {
    super.connectedCallback();
  };

  paymentInfoChanged(info: PaymentsInfo): void {
    this.address = info.payerAddress[Imparter.ethWeb3];
    if (this.address) {
      this.setNormalMessage();
    }
    this.isActive = info.currentImparter === Imparter.ethWeb3;
  }

  setNormalMessage() {
    this.messageClass = 'normalMessage';
    this.message = `Address: ${this.address}`;
  }

  setInvalidMessage() {
    this.messageClass = 'invalidMessage';
    this.message = html`There was a problem logging you in.`;
  }

  async continue() {
    if (this.hub) {
      const result: boolean = await this.hub.setCurrentImparter(Imparter.ethWeb3);
      if (!result) {
        this.setInvalidMessage();
        return;
      } 
      this.$emit('close');
    }
  }
}
