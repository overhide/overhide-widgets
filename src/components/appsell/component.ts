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
        <slot name="authorized-button" ${slotted('authorizedButton')} class="button w3-button w3-blue ${e => e.isClickable() ? '' : 'noclick'}"  @click="${e => e.isClickable() && e.click()}">
          <div class="button-content">${e => e.getAuthButtonContent()}</div>
        </slot>
      `)}
      ${when(e => !e.isAuthorized, html<OverhideAppsell>`
        <slot name="unauthorized-button" ${slotted('unauthorizedButton')} class="button w3-button w3-blue ${e => e.isClickable() ? '' : 'noclick'}"  @click="${e => e.isClickable() && e.click()}">
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

/**
 * The event sent when an appsell SKU deemed authorized by 
 * overhide is clicked by the user.
 * 
 * Usually safest to route state-changes in response to this
 * event via the back-end, and validate authorizations.
 * 
 * All necessary information to validate is provided in this
 * event.
 */
export interface OverhideSkuClickedEvent {

}

@customElement({
  name: "overhide-appsell",
  template,
  styles,
})
export class OverhideAppsell extends FASTElement {
  @attr 
  hubId?: string;

  @attr
  orientation?: Orientation | null = Orientation.vertical;

  @attr
  sku?: string | null;

  @attr
  priceDollars?: number | null;

  // String to show when component detects fully authorized state.
  @attr
  authorizedMessage: string = 'overwrite authorizedMessage attribute';

  // Template String to show when component detects unauthorized state:  top-up amount is replaced 
  // at the ${topup} placeholder.
  @attr
  unauthorizedTemplate: string = ' overwrite unauthorizedTemplate attribute';

  @attr({ mode: 'boolean' })
  inhibitLogin: boolean = false;

  @observable
  topupDollars?: number | null;

  @observable
  isAuthorized?: boolean | null;

  @observable 
  authorizedButton?: Node[];

  @observable 
  unauthorizedButton?: Node[];  

  hub?: IOverhideHub | null; 
  currentImparter?: Imparter | null;

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

    notifier.subscribe(handler, 'paymentsInfo')
  }

  public click(): void {
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
    this.wireUpButtonContent();
  };

  paymentInfoChanged(info: PaymentsInfo): void {
    this.currentImparter = info.currentImparter;
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

  getAuthButtonContent(): string {
    return this.authorizedMessage;;
  }

  getUnauthButtonContent(): string {
    return this.unauthorizedTemplate.replace(/\$\{topup\}/g, this.toDollars(this.topupDollars));
  }

  isClickable(): boolean {
    return this.isAuthorized || !this.inhibitLogin;
  }
}
