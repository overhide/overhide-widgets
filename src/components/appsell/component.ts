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
  <template class="panel ${e => e.isEnabled ? '' : 'disabled'} ${e => e.orientation}" @click="${e => e.go()}">
    ${when(e => e.isAuthorized, html<OverhideAppsell>`
      <slot name="authorized-icon">
      </slot>
    `)}
    ${when(e => !e.isAuthorized, html<OverhideAppsell>`
      <slot name="unauthorized-icon">
      </slot>
    `)}
    <slot name="header">
    </slot>
    <slot name="subheader">
    </slot>      
    ${when(e => e.isAuthorized, html<OverhideAppsell>`
      <slot name="authorized-icon"></slot>
    `)}
    ${when(e => !e.isAuthorized, html<OverhideAppsell>`
      <slot name="unauthorized-icon"></slot>
    `)}
  </template>
`;

const styles = css`
${w3Css}
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
export class OverhideAppsell extends FASTElement {
  @attr 
  hubId?: string;

  @attr
  orientation?: Orientation | null = Orientation.vertical;

  @attr
  priceDollars?: number | null;

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

  public go(): void {
  }
}
