/** Static Holder of locale information */
abstract class IdsLocaleData {
  static loadedLocales = new Map();

  // The lang files that have been loaded up
  static loadedLanguages = new Map();
}

export default IdsLocaleData;
