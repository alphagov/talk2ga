const USERNAME_KEY = 'username';

export class LocalStorageService {
  static saveItem = (key: string, value: any, description = '') => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(
        `Failed to save ${description} state to localStorage:`,
        error,
      );
    }
  };

  static loadItem = (key: string, description = '') => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(
        `Failed to load ${description} state from localStorage:`,
        error,
      );
      return null;
    }
  };
}

export const setUsername = (username: string) =>
  LocalStorageService.saveItem(USERNAME_KEY, username, 'showFields');

export const getUsername = () =>
  LocalStorageService.loadItem(USERNAME_KEY, 'showFields');
