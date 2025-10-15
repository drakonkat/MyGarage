import React, { createContext, useContext } from 'react';
import { UserStore } from './UserStore.ts';
import { ViewStore } from './ViewStore.ts';

export class RootStore {
  userStore: UserStore;
  viewStore: ViewStore;

  constructor() {
    this.userStore = new UserStore(this);
    this.viewStore = new ViewStore(this);
  }
}

const rootStore = new RootStore();
const RootStoreContext = createContext<RootStore>(rootStore);

export const RootStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement(RootStoreContext.Provider, { value: rootStore }, children);
};

export const useStores = () => {
  return useContext(RootStoreContext);
};