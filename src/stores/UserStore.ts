import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from './RootStore.ts';
import { apiClient } from '../ApiClient.ts';
import { User } from '../types.ts';

export class UserStore {
  rootStore: RootStore;
  token: string | null = null;
  user: User | null = null;
  isInitializing: boolean = true;
  error: string | null = null;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  get isLoggedIn() {
    return !!this.token && !!this.user;
  }

  initialize = () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('authUser');
    if (token && user) {
      this.token = token;
      this.user = JSON.parse(user);
      apiClient.setToken(token);
      this.rootStore.viewStore.setView(
        this.user?.role === 'mechanic' ? 'mechanic_dashboard' : 'personal_dashboard'
      );
    }
    runInAction(() => {
        this.isInitializing = false;
    });
  };

  login = async (email: string, password: string): Promise<void> => {
    this.error = null;
    try {
      const data = await apiClient.login(email, password);
      runInAction(() => {
        this.token = data.token;
        this.user = data.user;
        apiClient.setToken(data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(data.user));
        this.rootStore.viewStore.setView(
          this.user?.role === 'mechanic' ? 'mechanic_dashboard' : 'personal_dashboard'
        );
      });
    } catch (error: any) {
        runInAction(() => {
            this.error = error.message || "Login failed";
        });
        throw error;
    }
  };
  
  signup = async (email: string, password: string, role: 'personal' | 'mechanic'): Promise<void> => {
    this.error = null;
    try {
      await apiClient.register(email, password, role);
      // After successful registration, log the user in automatically
      await this.login(email, password);
    } catch (error: any) {
        runInAction(() => {
            this.error = error.message || "Signup failed";
        });
        throw error;
    }
  };

  logout = () => {
    this.token = null;
    this.user = null;
    apiClient.setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    this.rootStore.viewStore.setView('landing');
  };
}