import {
  customElement,
  FASTElement,
  html,
  css,
  attr,
  observable,
  Observable,
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
        <slot name="authorized-header">
        </slot>
      `)}
      ${when(e => !e.isAuthorized, html<OverhideAppsell>`
        <slot name="unauthorized-header">
        </slot>
      `)}
      ${when(e => e.isAuthorized, html<OverhideAppsell>`
        <div class="button ${e => e.isEnabled ? '' : 'disabled'}" @click="${e => e.click()}">
          <slot name="authorized-button" class="w3-button w3-blue button-content">
            <slot name="authorized-message"></slot>
          </slot>
        </div>
      `)}
      ${when(e => !e.isAuthorized, html<OverhideAppsell>`
        <div class="button ${e => e.isEnabled ? '' : 'disabled'}" @click="${e => e.click()}">
          <slot name="unauthorized-button" class="w3-button button-content w3-blue">
            <slot name="unauthorized-prefix"></slot><slot name="unauthorized-dollars">${e => e.toDollars(e.topupDollars)}</slot><slot name="unauthorized-postfix"></slot>
          </slot>
        </div>
      `)}
      ${when(e => e.isAuthorized, html<OverhideAppsell>`
        <slot name="authorized-footer"></slot>
      `)}
      ${when(e => !e.isAuthorized, html<OverhideAppsell>`
        <slot name="unauthorized-footer"></slot>
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

  .button {
    cursor: pointer;
    flex-basis: 100%;
    flex-grow: 2;    
  }

  .button.disabled {
    cursor: inherit;
    opacity: .5;
  }

  .button-content {
    width: 100%;
    height: 100%;
    white-space: inherit;
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

  @observable
  topupDollars?: number | null;

  @observable
  isEnabled?: boolean | null;

  @observable
  isAuthorized?: boolean | null;

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
  };

  paymentInfoChanged(info: PaymentsInfo): void {
    this.currentImparter = info.currentImparter;
  }

  toDollars(what?: number | null): string {
    return (Math.round((what || 0) * 100) / 100).toFixed(2);
  }
}
