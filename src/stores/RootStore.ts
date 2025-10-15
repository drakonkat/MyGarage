import React, { createContext, useContext } from 'react';
import { UserStore } from './UserStore.ts';
import { ViewStore } from './ViewStore.ts';
import { MechanicStore } from './MechanicStore.ts';

export class RootStore {
  userStore: UserStore;
  viewStore: ViewStore;
  mechanicStore: MechanicStore;

  constructor() {
    this.userStore = new UserStore(this);
    this.viewStore = new ViewStore(this);
    this.mechanicStore = new MechanicStore(this);
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