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
  static async save(settings: BaseSettings) {
    const settingsKey = "settings:" + settings.constructor.name;
    console.debug("Saving settings for", settingsKey);
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }

  static async load<T extends BaseSettings>(settingsClass: new () => T): Promise<T | null> {
    const settingsKey = "settings:" + settingsClass.name;
    console.debug("Loading settings for", settingsKey);
    const settingsJson = localStorage.getItem(settingsKey);
    if (settingsJson) {
      const settings = new settingsClass();
      settings.fromJson(JSON.parse(settingsJson));
      return settings;
    }
    return null;
  }
}
