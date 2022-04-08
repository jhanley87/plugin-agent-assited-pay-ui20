import React from "react";
import * as Flex from "@twilio/flex-ui";
import { FlexPlugin } from "@twilio/flex-plugin";

import { PaymentUi } from "./components/PaymentUi/PaymentUi";

import reducers, { namespace } from "./states";

const PLUGIN_NAME = "Pay20Plugin";

export default class Pay20Plugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof Flex }
   * @param manager { Flex.Manager }
   */
  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    this.registerReducers(manager);

    const options: Flex.ContentFragmentProps = { sortOrder: -1 };
    flex.AgentDesktopView.Panel2.Content.add(
      <PaymentUi key="PaymentUi" />,
      options
    );
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  private registerReducers(manager: Flex.Manager) {
    if (manager.store) {
      const store = manager.store as EnhancedStore;
      if (!store.addReducer) {
        // eslint-disable-next-line
        console.error(
          `You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${Flex.VERSION}`
        );
        return;
      }

      store.addReducer(namespace, reducers);
    }
  }
}

import { Store, Reducer } from "redux";
export interface EnhancedStore<S = any> extends Store<S> {
  addReducer?: (name: string, _reducer: Reducer<any>) => void;
}
