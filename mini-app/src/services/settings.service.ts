export abstract class BaseSettings {
  fromJson(json: any): this {
    Object.assign(this, json);
    return this;
  }

  cloneWith(fields: Partial<this> = {}): this {
    const clone = Object.create(this);
    Object.assign(clone, this, fields);
    return clone;
  }
}

export class SettingsService {
  private static store: Map<string, BaseSettings> = new Map();

  static async save(settings: BaseSettings) {
    const settingsKey = settings.constructor.name;
    this.store.set(settingsKey, settings);
  }

  static async load<T extends BaseSettings>(settingsClass: new () => T): Promise<T | null> {
    const settingsKey = settingsClass.name;
    const settings = this.store.get(settingsKey);
    if (settings) {
      return settings as T;
    }
    return null;
  }
}
