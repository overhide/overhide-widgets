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
  PaymentsInfo
} from '../hub/definitions';

import w3Css from "../../static/w3.css";
import infoIcon from "../../static/icons/info.svg";
import clipboardIcon from "../../static/icons/clipboard.svg";

const template = html<OverhideOhledger>`
  <div class="panel w3-panel w3-border w3-round-xxlarge ${e => e.isActive ? 'active' : ''}">
    <div class="w3-row w3-margin">
      <div class="w3-col s6 w3-left-align">
        <span class="name">passphrase login</span>
      </div>
      <div class="currency-span w3-col s6 w3-right-align">
        <span class="currency w3-text-dark-grey">dollars</span>
        <span class="info svg w3-tooltip">
          ${infoIcon}
          <span class="right-tooltip w3-text w3-tag w3-round-xlarge">
            for any in-app purchases, payments would be in US dollars
          </span>
        </span>
      </div>
    </div>
    <form>
      <div class="w3-row w3-margin">
        <div class="w3-col s12">
          <div class="input">
            <div class="clipboard">
              <div class="clickable svg2" @click="${e => e.copyToClipboard()}" :disabled="${e => !e.isKeyValid}">${clipboardIcon}</div>
              <input autocomplete="passphrase" name="passphrase" id="passphrase" class="w3-input" type="text" :value="${e => e.key}" @change="${(e,c) => e.changeKey(c.event)}" @keyup="${(e,c) => e.changeKey(c.event)}">
            </div>
            <label>passphrase</label>
          </div>
        </div>
      </div>
      <div class="w3-row w3-margin">
        <div class="w3-col s6">
          <div class="input">
            <input class="w3-button w3-blue" type="button" @click="${e => e.generate()}" value="generate new">
          </div>
        </div>
        <div class="w3-col s6">
          <div class="input">
            <input class="w3-button w3-border w3-border-blue" type="button" @click="${e => e.showTransactions()}" value="show transactions" :disabled="${e => !e.isKeyValid}">
          </div>
        </div>
      </div>
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
            <input type="submit" class="w3-button w3-green w3-wide" type="button" value="continue" @click="${e => e.continue()}" :disabled="${e => !e.isKeyValid}">
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
  }

  .svg2 svg {
    width: 1.5em;
    height: 1.5em;
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
  name: "overhide-ohledger",
  template,
  styles,
})
export class OverhideOhledger extends FASTElement {
  @attr 
  hubId?: string;

  @observable
  key?: string | null;

  @observable
  address?: string | null;

  @observable
  isKeyValid: boolean = false;

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
    this.key = info.payerPrivateKey[Imparter.ohledger];
    this.address = info.payerAddress[Imparter.ohledger];
    this.isActive = info.currentImparter === Imparter.ohledger;
  }

  async changeKey(event: any) {
    this.key = event.target.value;
    this.setNormalMessage();
    if (this.hub && this.key) {
      this.isKeyValid = (/^0x[0-9a-fA-F]{64}$/.test(this.key)) && await this.hub.setSecretKey(Imparter.ohledger, this.key);
      if (!this.isKeyValid) {
        this.setInvalidMessage();
      }
    }
  }

  async generate() {
    this.setNormalMessage();
    if (this.hub) {
      await this.hub.generateNewKeys(Imparter.ohledger);
      this.isKeyValid = true;
    }
  }

  setNormalMessage() {
    this.messageClass = 'normalMessage';
    this.message = html`Login with a passphrase &mdash; Remember this passphrase &mdash; You will need it for future logins &mdash; Keep this passphrase safe in password manager`;
  }

  setInvalidMessage() {
    this.messageClass = 'invalidMessage';
    this.message = html`The passphrase must be a 64 characters '0x' prefixed hexadecimal value &mdash; <b>Easiest to just generate</b>`;
  }

  copyToClipboard() {
    if (!this.key) return;
    const el = document.createElement('textarea');
    el.value = this.key;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  showTransactions() {
    if (this.hub && this.key && this.isKeyValid && this.address) {
      window.open(`${this.hub.getUrl(Imparter.ohledger)}/ledger.html?address=${this.address}`,
        'targetWindow',
        'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=300')
    }
  }

  async continue() {
    if (this.hub && this.key && this.isKeyValid && this.address) {
      await this.hub.setCurrentImparter(Imparter.ohledger);
      this.$emit('close');
    }
  }
}