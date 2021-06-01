import {
  customElement,
  FASTElement,
  html,
  css,
  attr,
  observable,
  Observable,
  slotted,
  when
} from "@microsoft/fast-element";

import {
  Imparter,
  IOverhideAppsell,
  IOverhideSkuClickedEvent,
  IOverhideSkuTopupOutstandingEvent,
  IOverhideLogin,
  IOverhideHub,
  NetworkType,
  PaymentsInfo,
  Social
} from '../hub/definitions';

import w3Css from "../../static/w3.css";

const template = html<OverhideAppsell>`
  <template>
    <div class="panel ${e => e.orientation}">
      ${when(e => e.isAuthorized, html<OverhideAppsell>`
        <slot name="authorized-header" class="${e => e.isClickable() ? '' : 'noclick'}"  @click="${e => e.isClickable() && e.click()}">
        </slot>
      `)}
      ${when(e => !e.isAuthorized, html<OverhideAppsell>`
        <slot name="unauthorized-header" class="${e => e.isClickable() ? '' : 'noclick'}"  @click="${e => e.isClickable() && e.click()}">
        </slot>
      `)}
      ${when(e => e.isAuthorized, html<OverhideAppsell>`
        <slot name="authorized-button" ${slotted('authorizedButton')} class="button w3-button w3-dark-grey ${e => e.isClickable() ? '' : 'noclick'}"  @click="${e => e.isClickable() && e.click()}">
          <div class="button-content">${e => e.getAuthButtonContent()}</div>
        </slot>
      `)}
      ${when(e => !e.isAuthorized, html<OverhideAppsell>`
        <slot name="unauthorized-button" ${slotted('unauthorizedButton')} class="button w3-button w3-dark-grey ${e => e.isClickable() ? '' : 'noclick'}"  @click="${e => e.isClickable() && e.click()}">
          <div class="button-content">${e => e.getUnauthButtonContent()}</div>
        </slot>
      `)}
      ${when(e => e.isAuthorized, html<OverhideAppsell>`
        <slot name="authorized-footer" class="${e => e.isClickable() ? '' : 'noclick'}"  @click="${e => e.isClickable() && e.click()}"></slot>
      `)}
      ${when(e => !e.isAuthorized, html<OverhideAppsell>`
        <slot name="unauthorized-footer" class="${e => e.isClickable() ? '' : 'noclick'}"  @click="${e => e.isClickable() && e.click()}"></slot>
      `)}
    </div>
  </template>
`;

const styles = css`
${w3Css}

  :host {
    display: flex;
    align-content: stretch;
    justify-content: stretch;
    margin: auto;
    contain: content;
    text-align: center;    
    width: 100%;
    height: 100%;
  }

  .panel {
    flex-basis: 100%;
    flex-grow: 2;      
    display: flex;
    align-items: stretch;
    justify-content: center;
  }

  .panel.horizontal {
    flex-direction: row;
  }

  .panel.vertical {
    flex-direction: column;
  }

  .button.disabled {
    cursor: inherit;
    opacity: .5;
  }

  .button {
    cursor: pointer !important;
    flex-basis: 100%;
    flex-grow: 2;     
    width: 100%;
    height: 100%;
    white-space: inherit;
    margin: 0px;
    padding: 0px;
  }

  .button-content {
    padding: 1em;
  }

  .noclick {
    cursor: inherit;
    pointer-events: none;
  }
`;

export enum Orientation {
  horizontal = 'horizontal',
  vertical = 'vertical'
}

@customElement({
  name: "overhide-appsell",
  template,
  styles,
})
export class OverhideAppsell extends FASTElement implements IOverhideAppsell {
  @attr 
  hubId?: string;

  @attr
  orientation?: Orientation | null = Orientation.vertical;

  @attr
  sku?: string | null;

  @attr
  priceDollars?: string | null;

  // If this attribute is specified, the component will act as a login button.
  //
  // All other attribtues except for hubId and orientation are ignored.
  //
  // When customizing this component as a login button, only the unauthorized slots need modifying:
  // - unauthorized-header
  // - unauthorized-button
  // - unauthorized-footer
  @attr
  loginMessage?: string | null;

  // String to show when component detects fully authorized state.
  @attr
  authorizedMessage: string = 'overwrite authorizedMessage attribute';

  // Template String to show when component detects unauthorized state:  top-up amount is replaced 
  // at the ${topup} placeholder.
  @attr
  unauthorizedTemplate: string = ' overwrite unauthorizedTemplate attribute';

  @attr({ mode: 'boolean' })
  inhibitLogin: boolean = false;

  @attr
  bitcoinAddress?: string | null;

  @attr
  ethereumAddress?: string | null;

  @attr
  overhideAddress?: string | null;

  @attr
  withinMinutes?: string | null;

  @observable
  topupDollars?: number | null;

  // Flags whether this sku is authorized.
  @observable
  public isAuthorized?: boolean | null;

  @observable
  asOf?: string | null;

  @observable 
  authorizedButton?: Node[];

  @observable 
  unauthorizedButton?: Node[];  

  hub?: IOverhideHub | null; 
  currentImparter?: Imparter | null;
  signature?: string | null;
  loginElement?: IOverhideLogin | null;
  isLogedIn: boolean = false
  lastInfo?: PaymentsInfo | null;

  public constructor() {
    super(); 
  }

  public setHub(hub: any) {
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
    
    notifier.subscribe(handler, 'paymentsInfo');
    if (this.sku) {
      this.hub?.setComponentForSku(this.sku, this);
    }    
  }

  public async click(): Promise<void> {
    if (this.loginElement && (this.loginMessage || (!this.inhibitLogin && !this.isLogedIn))) {
      this.loginElement.open();
      return;
    }

    if (this.loginMessage) {
      return; // this is just a login button, no further actions.
    }

    if (this.isLogedIn && !this.isAuthorized) {
      if (this.topupDollars == undefined || this.topupDollars == null) {
        console.error(`topup dollars not available`);
        return;
      }
      await this.authorize();
      return;
    }

    if (!this.lastInfo) {
      console.error(`no lastInfo`);
      return;
    }

    if (!this.currentImparter || this.currentImparter == Imparter.unknown) {
      console.error(`current imparter not set`);
      return;
    }

    if (!this.hub) {
      console.error(`hub not set`);
      return;
    }

    const event: IOverhideSkuClickedEvent = <IOverhideSkuClickedEvent> {
      sku: this.sku,
      topup: this.topupDollars,
      currency: this.lastInfo.currentCurrency,
      from: this.lastInfo.payerAddress[this.currentImparter],
      isTest: this.hub?.getNetworkType() == NetworkType.test,
      message: this.lastInfo.messageToSign[this.currentImparter],
      signature: this.lastInfo.payerSignature[this.currentImparter],
      to: this.getToAddress(),
      asOf: this.asOf
    };
    this.$emit(`overhide-appsell-sku-clicked`, event);
  }

  hubIdChanged(oldValue: string, newValue: string) {
    const el = document.querySelector(`#${this.hubId}`);
    if (!el) {
      console.log(`WARNING: overhide-appsell configured for overhide-hub with ID ${newValue} but no element in DOM with this ID.`);
      return;
    }
    this.setHub(el);
  }

  connectedCallback() {
    super.connectedCallback();

    this.validate();
    this.wireUpButtonContent();
  };

  async paymentInfoChanged(info: PaymentsInfo): Promise<void> {
    this.lastInfo = info;
    this.currentImparter = info.currentImparter;
    this.loginElement = info.loginElement;
    this.isLogedIn = !!info.currentImparter && !!info.payerSignature[info.currentImparter];
    this.signature = info.payerSignature[info.currentImparter];
    this.validate();

    this.isAuthorized = false;
    this.topupDollars = parseFloat(this.priceDollars || "0");
    if (!this.loginMessage && this.currentImparter && this.currentImparter != Imparter.unknown) {
      try {
        this.isAuthorized = await this.determineAuthorized();
      } catch (e) {
      } 
    }
  }

  toDollars(what?: number | null): string {
    return (Math.round((what || 0) * 100) / 100).toFixed(2);
  }

  authorizedButtonChanged(oldValue: string, newValue: string) {
    this.wireUpButtonContent();
  }

  unauthorizedButtonChanged(oldValue: string, newValue: string) {
    this.wireUpButtonContent();
  }

  authorizedMessageChanged(oldValue: string, newValue: string) {
    this.authorizedMessage = newValue;
    this.wireUpButtonContent();
  }

  unauthorizedTemplateChanged(oldValue: string, newValue: string) {
    this.unauthorizedTemplate = newValue;
    this.wireUpButtonContent();
  }

  skuChanged(oldValue: string, newValue: string) {
    this.sku = newValue;
    if (this.hub) {
      this.hub.refresh();
    }
  }
  
  priceDollarsChanged(oldValue: string, newValue: string) {
    this.priceDollars = newValue;
    this.topupDollars = parseFloat(newValue);
    if (this.hub) {
      this.hub.refresh();
    }
  }

  validate() {
    if (!this.hub) {
      console.warn(`hub not setup on overhide-appsell component with sku ${this.sku}`);
      return;
    }
    if (this.loginMessage) {
      return; // no other validations.
    }
    if (!this.sku) {
      console.error(`overhide-appsell component not provided a sku`);
      return;
    }
    if (!this.priceDollars) {
      console.error(`overhide-appsell component with sku ${this.sku} not provided a priceDollars`);
      return;
    }
    if (!!this.withinMinutes) {
      try {
        parseInt(this.withinMinutes);
      } catch (e) {
        console.error(`overhide-appsell component with sku ${this.sku} has non-number withinMinutes: ${this.withinMinutes}`);
        return;          
      }
    }
  }

  wireUpButtonContent() {
    const authButton: Node | null = this.authorizedButton && this.authorizedButton.length > 0 ? this.authorizedButton[0] : null;
    if (authButton) {
      authButton.textContent = this.getAuthButtonContent();
    }

    const unauthButton: Node | null = this.unauthorizedButton && this.unauthorizedButton.length > 0 ? this.unauthorizedButton[0] : null;
    if (unauthButton) {
      unauthButton.textContent = this.getUnauthButtonContent();
    }
  }

  getToAddress(): string | null {
    if (!!this.currentImparter) {
      switch(this.currentImparter) {
        case Imparter.btcManual:
          return this.bitcoinAddress || null;
        case Imparter.ethWeb3:
          return this.ethereumAddress || null;
        default:
          return this.overhideAddress || null;          
      }
    }
    return null;
  }

  getAuthButtonContent(): string {
    return this.loginMessage ? this.loginMessage : this.authorizedMessage;;
  }

  getUnauthButtonContent(): string {
    return this.loginMessage ? this.loginMessage : this.unauthorizedTemplate.replace(/\$\{topup\}/g, this.toDollars(this.topupDollars));
  }

  isClickable(): boolean {
    return this.isAuthorized || !this.inhibitLogin || !!this.loginMessage;
  }

  // @throws 
  async determineAuthorized(): Promise<boolean> {
    const address = this.getToAddress();
    if (!this.hub) {
      console.error(`no hub`);
      throw `no hub`;
    }

    if (!this.lastInfo) {
      console.error(`no lastInfo`);
      throw `no lastInfo`;
    }
    
    if (!address) {
      const message = `allowed user to log in with $${this.currentImparter} but overhide-appsell component with sku ${this.sku} doesn't have an address setup for that ledger`;
      console.error(message);
      throw message;
    }
    if (!this.priceDollars) {
      var price: number = 0;
    } else {
      var price: number = parseFloat(this.priceDollars);
    }

    if (price == 0) {    
      this.topupDollars = 0;  
      return this.lastInfo.isOnLedger[this.currentImparter || Imparter.unknown];
    }

    const result = await this.hub.getOutstanding(price, address, this.withinMinutes ? parseFloat(this.withinMinutes) : null);
    this.topupDollars = result.delta;
    this.asOf = result.asOf;

    const event: IOverhideSkuTopupOutstandingEvent = <IOverhideSkuTopupOutstandingEvent> {
      sku: this.sku,
      topup: this.topupDollars
    }
    this.$emit(`overhide-appsell-topup-outstanding`, event);
    return this.topupDollars == 0;
  }

  async authorize(): Promise<boolean> {
    try {
      const isAuthorized = await this.determineAuthorized();
      const address = this.getToAddress();
      if (this.hub && address && !isAuthorized) {
        return await this.hub.topUp(this.topupDollars || 0, address);
      }
    } catch (e) {
    }
    return false;
  }
}
