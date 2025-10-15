import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore.ts';

type AppView = 
  | 'landing'
  | 'login'
  | 'signup'
  | 'anonymous_dashboard'
  | 'personal_dashboard'
  | 'mechanic_dashboard';

export class ViewStore {
  rootStore: RootStore;
  currentView: AppView = 'landing';

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  setView = (view: AppView) => {
    this.currentView = view;
  };
}