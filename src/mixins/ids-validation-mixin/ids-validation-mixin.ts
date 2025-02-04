import { IdsInputInterface } from '../../components/ids-input/ids-input-attributes';
import { attributes } from '../../core/ids-attributes';
import { IdsConstructor } from '../../core/ids-element';
import { isObjectAndNotEmpty } from '../../utils/ids-object-utils/ids-object-utils';
import { isValidDate } from '../../utils/ids-date-utils/ids-date-utils';
import { EventsMixinInterface } from '../ids-events-mixin/ids-events-mixin';

export type IdsValidationErrorMessage = {
  /** The unique id in the check messages */
  id: string;

  /** The Type of message and icon */
  type?: string | 'error' | 'info' | 'alert' | 'warn' | 'icon';

  /** The localized message text */
  message?: string;

  /** The Type of message icon */
  icon?: string;
};

export type IdsValidationRule = {
  /** The unique rule id */
  id: string;

  /** The Type of rule */
  type: string | 'error' | 'info' | 'alert' | 'warn' | 'icon';

  /** The localized message text */
  message: string;

  /** The method to check validation logic, return true if is valid */
  check: (input: HTMLElement) => boolean;
};

type Constraints = IdsConstructor<EventsMixinInterface>;

/**
 * Adds validation to any input field
 * @param {any} superclass Accepts a superclass and creates a new subclass from it
 * @returns {any} The extended object
 */
const IdsValidationMixin = <T extends Constraints>(superclass: T) => class extends superclass {
  isTypeNotValid?: any;

  constructor(...args: any[]) {
    super(...args);
  }

  connectedCallback() {
    super.connectedCallback?.();
    this.handleValidation();
  }

  static get attributes() {
    return [
      ...(superclass as any).attributes,
      attributes.VALIDATE,
      attributes.VALIDATION_EVENTS,
      attributes.VALIDATION_ICON,
      attributes.VALIDATION_ID,
      attributes.VALIDATION_MESSAGE,
      attributes.VALIDATION_TYPE
    ];
  }

  // Map of rules to use
  useRules = new Map();

  // List of events to validate on
  validationEventsList: any = [];

  // Default icon
  VALIDATION_DEFAULT_ICON = 'user-profile';

  // Icons
  VALIDATION_ICONS: any = {
    alert: 'alert',
    error: 'error',
    info: 'info',
    success: 'success',
  };

  /**
   * Handle the validation rules
   * @returns {void}
   */
  handleValidation() {
    const thisAsInput = this as IdsInputInterface;
    const isRadioGroup = thisAsInput.input?.classList.contains('ids-radio-group');
    const canRadio = ((!isRadioGroup) || (!!(isRadioGroup && this.querySelector('ids-radio'))));

    if (thisAsInput.labelEl && typeof this.validate === 'string' && canRadio) {
      // const isCheckbox = thisAsInput.input?.getAttribute('type') === 'checkbox';
      // const defaultEvents = (isCheckbox || isRadioGroup) ? 'change.validationmixin' : 'blur.validationmixin';
      // const defaultEvents = 'change.validationmixin';
      const events = (this.validationEvents && typeof this.validationEvents === 'string')
        ? this.validationEvents : 'change.validationmixin blur.validationmixin';
      this.validationEventsList = [...new Set(events.split(' '))];
      const getRule = (id: string) => ({ id, rule: this.rules[id] });
      let isRulesAdded = false;

      this.validate.split(' ').forEach((strRule) => {
        if (!getRule(strRule).rule) return;

        if (strRule === 'required') {
          thisAsInput.labelEl?.classList.add('required');
          thisAsInput.input?.setAttribute('aria-required', true);

          if (isRadioGroup) {
            const radioArr = [].slice.call(this.querySelectorAll('ids-radio'));
            radioArr.forEach((r: any) => r.input.setAttribute('required', 'required'));
          }
          (this as any).validationElems?.editor?.setAttribute('aria-required', true);
        }

        /**
         * Set the useRules map
         * @param {*} input element(s)
         */
        const setRules = (input: any) => {
          const useRules = this.useRules.get(input);
          if (useRules) {
            const found = useRules.some((r: any) => r.id === strRule);
            if (!found) {
              const mergeRule = [...useRules, getRule(strRule)];
              this.useRules.set(input, mergeRule);
              isRulesAdded = true;
            }
          } else {
            this.useRules.set(input, [getRule(strRule)]);
            isRulesAdded = true;
          }
        };

        setRules(thisAsInput.input);
      });

      if (isRulesAdded) {
        this.handleValidationEvents();
      }

      // Update to remove unused rule/s
      const arrayValidate: string[] = this.validate?.split(' ');
      let rules = this.useRules.get(thisAsInput.input);

      if (thisAsInput.input && (rules?.length > arrayValidate?.length)) {
        const removed: string[] = [];
        arrayValidate.forEach((id: string) => {
          rules = rules.filter((r: any) => {
            if (r.id === id) return true;
            removed.push(r.id);
            return false;
          });
        });
        removed.forEach((id: string) => this.removeValidationMessage({ id }));
        this.useRules.set(thisAsInput.input, rules);
      }
    } else {
      this.destroyValidation();
    }
  }

  /**
   * Check the validation and add/remove errors as needed
   * @private
   * @returns {void}
   */
  checkValidation() {
    /**
     * Check validation rules
     * @param {*} input element
     */
    const checkRules = (input: any) => {
      this.isTypeNotValid = {};
      let isValid = true;
      const useRules = this.useRules.get(input);
      useRules?.forEach((thisRule: any) => {
        if (thisRule.rule !== undefined && !thisRule.rule?.check(input) && this.isTypeNotValid) {
          this.addMessage(thisRule.rule);
          isValid = false;
          this.isTypeNotValid[thisRule.rule.type] = true;
        } else if (thisRule.rule !== undefined) {
          this.removeMessage(thisRule.rule);
        }
      });
      this.isTypeNotValid = null;
      this.triggerEvent('validate', this, { detail: { elem: this, value: (this as IdsInputInterface).value, isValid } });
    };

    if ((this as IdsInputInterface).input) {
      checkRules((this as IdsInputInterface).input);
    }
  }

  /**
   * Add validation rule/s
   * @param {IdsValidationRule} [rule] incoming rule/s settings
   * @returns {void}
   */
  addValidationRule(rule: Array<IdsValidationRule> | IdsValidationRule): void {
    const isValid = (val: any) => typeof val === 'string' && val !== '';
    const addToValidate: string[] = [];
    let isRulesAdded = false;

    // Add rule
    const addRule = (newRule: IdsValidationRule) => {
      const { id, type, message } = newRule;
      if (isValid(id) && isValid(type) && isValid(message) && typeof newRule.check === 'function') {
        if (!this.rules[id]) {
          isRulesAdded = true;
          this.rules[id] = newRule;
          if (!this.validate || (!(new RegExp(id)).test(this.validate))) addToValidate.push(id);
        }
      }
    };

    // Check if single or multiple rules need to be add
    if (rule?.constructor === Array) {
      rule.forEach((r: IdsValidationRule) => addRule(r));
    } else {
      addRule(rule as IdsValidationRule);
    }

    // Bind rule/s
    if (isRulesAdded) {
      if (addToValidate.length) {
        const val = this.validate ? `${this.validate} ` : '';
        this.validate = `${val}${[...new Set(addToValidate)].join(' ')}`;
      }
      this.handleValidation();
    }
  }

  /**
   * Remove validation rule/s
   * @param {string} [ruleId] incoming rule/s id
   * @returns {void}
   */
  removeValidationRule(ruleId: Array<string> | string): void {
    const isValid = (val: any) => typeof val === 'string' && val !== '';
    let validate = this.validate;
    let isRulesRemoved = false;

    // Remove rule
    const removeRule = (id: string) => {
      if (isValid(id) && this.rules[id] && (new RegExp(id)).test(validate as string)) {
        isRulesRemoved = true;
        delete this.rules[id];
        validate = validate?.replace(id, '') || null;
      }
    };

    // Check if single or multiple rules need to be remove
    if (ruleId?.constructor === Array) {
      ruleId.forEach((id: string) => removeRule(id));
    } else {
      removeRule(ruleId as string);
    }

    // Unbind rule/s
    if (isRulesRemoved) {
      this.validate = validate?.replace(/\s\s+/g, ' ').trim() || null;
    }
  }

  /**
   * Add validation message/s
   * @param {Array|object} [message] incoming message/s settings
   * @returns {void}
   */
  addValidationMessage(message: Array<IdsValidationErrorMessage> | IdsValidationErrorMessage): void {
    const addMessage = (obj: any): void => {
      if (isObjectAndNotEmpty(obj)) this.addMessage(obj);
    };

    if (message?.constructor === Array) {
      message.forEach((m) => addMessage(m));
    } else {
      addMessage(message);
    }
  }

  /**
   * Remove validation message/s
   * @param {Array|object} [message] incoming message/s settings
   * @returns {void}
   */
  removeValidationMessage(message: Array<IdsValidationErrorMessage> | IdsValidationErrorMessage): void {
    const removeMessage = (obj: any): void => {
      if (isObjectAndNotEmpty(obj)) this.removeMessage(obj);
    };

    if (message?.constructor === Array) {
      message.forEach((m) => removeMessage(m));
    } else {
      removeMessage(message);
    }
  }

  /**
   * Add a message to an input
   * @param {object} [settings] incoming settings
   * @returns {void}
   */
  addMessage(settings: IdsValidationErrorMessage): void {
    const {
      id,
      type,
      message,
      icon
    } = settings;
    const thisAsInput = this as IdsInputInterface;

    if (!id) return;
    let elem = this.shadowRoot?.querySelector(`[validation-id="${id}"]`);
    if (elem) return; // Already has this message

    // Add error and related details
    const regex = new RegExp(`^\\b(${Object.keys(this.VALIDATION_ICONS).join('|')})\\b$`, 'g');
    const isValidationIcon = type && (regex.test(type));
    let audible = isValidationIcon ? type.replace(/^./, type[0].toUpperCase()) : null;
    audible = audible ? `<ids-text audible="true">${audible} </ids-text>` : '';
    let cssClass = 'validation-message';
    let iconName = type ? this.VALIDATION_ICONS[type] : '';
    const messageId = `${thisAsInput.input?.getAttribute('id')}-${settings.type}`;

    if (!iconName && type === 'icon') {
      iconName = icon || this.VALIDATION_DEFAULT_ICON;
      cssClass += iconName ? ' has-custom-icon' : '';
    }
    cssClass += isValidationIcon ? ` ${type}` : '';
    cssClass += (this as any).disabled ? ' disabled' : '';
    const iconHtml = iconName ? `<ids-icon icon="${iconName}" class="ids-icon"></ids-icon>` : '';

    // Add error message div and associated aria
    elem = document.createElement('div');

    elem.setAttribute('id', messageId);
    elem.setAttribute('validation-id', id);
    elem.setAttribute('type', type as string);
    elem.className = cssClass;
    elem.innerHTML = `${iconHtml}<ids-text error="true" class="message-text">${audible}${message}</ids-text>`;
    (this as any).validationElems?.main?.classList.add(type);
    thisAsInput.fieldContainer?.classList.add(type ?? '');
    thisAsInput.input?.setAttribute('aria-describedby', messageId);
    thisAsInput.input?.setAttribute('aria-invalid', 'true');

    const rootEl = this.shadowRoot?.querySelector('.ids-input, .ids-textarea, .ids-checkbox');
    const parent = rootEl || this.shadowRoot;
    parent?.appendChild(elem);

    // Add extra classes for radios
    const isRadioGroup = thisAsInput.input?.classList.contains('ids-radio-group');
    if (isRadioGroup) {
      const radioArr = [].slice.call(this.querySelectorAll('ids-radio'));
      radioArr.forEach((r: HTMLElement) => r.setAttribute('validation-has-error', 'true'));
    }
  }

  /**
   * Remove the message(s) from an input
   * @param {object} [settings] incoming settings
   * @returns {void}
   */
  removeMessage(settings: IdsValidationErrorMessage): void {
    const thisAsInput = this as IdsInputInterface;
    const id = settings.id;
    let type = settings.type;

    const removeMsg = (elem: any) => {
      if (elem) {
        const thisId = (id === null || typeof id === 'undefined') ? elem.getAttribute('id') : id;
        if (!type) {
          type = elem.getAttribute('type');
        }
        if (!this.isTypeNotValid) {
          this.isTypeNotValid = {};
        }
        elem.remove?.();
        // Remove related items, added manually by markup
        if (this.validationId === thisId) {
          this.validationId = null;
          this.validationType = null;
          this.validationMessage = null;
          this.validationIcon = null;
        }
      }
    };

    const el: any = this.shadowRoot?.querySelector(`[validation-id="${id}"]`);
    if (el) {
      removeMsg(el);
    } else if (type && (id === null || typeof id === 'undefined')) {
      const typeElms: any = this.shadowRoot?.querySelectorAll(`.validation-message[type="${type}"]`);
      typeElms.forEach((typeEl: any) => removeMsg(typeEl));
    }

    if (type) {
      if (this.isTypeNotValid && !this.isTypeNotValid[type]) {
        thisAsInput.fieldContainer?.classList.remove(type);
        thisAsInput.input?.removeAttribute('aria-describedby');
        thisAsInput.input?.removeAttribute('aria-invalid');
      }
    }

    const isRadioGroup = thisAsInput.input?.classList.contains('ids-radio-group');
    if (isRadioGroup) {
      const radioArr = [].slice.call(this.querySelectorAll('ids-radio'));
      radioArr.forEach((r: HTMLElement) => r.removeAttribute('validation-has-error'));
    }

    if (type) (this as any).validationElems?.main?.classList.remove(type);
  }

  /**
   * Remove all the validation messages
   * @returns {void}
   */
  removeAllValidationMessages() {
    const nodes = [].slice.call(this.shadowRoot?.querySelectorAll('.validation-message'));
    nodes.forEach((node: HTMLElement) => {
      const messageSettings: IdsValidationErrorMessage = {
        id: (node.getAttribute('validation-id') as string)
      };
      const type: any = node.getAttribute('type');
      if (type) {
        messageSettings.type = type;
      }
      this.removeMessage(messageSettings);
    });
  }

  /**
   * Set validation message manually
   * @returns {void}
   */
  setMessageManually() {
    const getVal = (val?: string | null): string => (
      typeof val === 'string' && val.trim() !== '' ? val.trim() : ''
    );
    const id = getVal(this.validationId);
    const type = getVal(this.validationType);
    const message = getVal(this.validationMessage);
    const icon = getVal(this.validationIcon);

    if (id && type && message) {
      const args = { id, type, message, icon }; // eslint-disable-line
      this.removeMessage(args);
      this.addMessage(args);
    }
  }

  /**
   * Handle validation events
   * @private
   * @param {string} option If 'remove', will remove attached events
   * @returns {void}
   */
  handleValidationEvents(option = '') {
    /**
     * Handle the validation events
     * @param {*} input element(s)
     */
    const validationEvents = (input: HTMLElement) => {
      this.validationEventsList.forEach((eventName: string) => {
        if (option === 'remove') {
          const handler = this.handledEvents.get(eventName);
          if (handler && handler.target === input) {
            this.offEvent(eventName, input);
          }
        } else {
          this.onEvent(eventName, input, () => {
            this.checkValidation();
          });
        }
      });
    };

    if ((this as IdsInputInterface).input) {
      validationEvents((this as IdsInputInterface).input);
    }
  }

  /**
   * Destroy the validation mixin
   * @returns {void}
   */
  destroyValidation() {
    /**
     * Destroy validation
     * @param {*} input element(s)
     */
    const destroy = (input: any) => {
      const useRules = this.useRules.get(input);
      if (useRules) {
        this.handleValidationEvents('remove');
        this.useRules.delete(input);
      }
      if (!(/\brequired\b/gi.test(this.validate as string))) {
        (this as IdsInputInterface).labelEl?.classList.remove('required');
        input.removeAttribute('aria-required');
        (this as any).validationElems?.editor?.removeAttribute('aria-required');
      }
      this.removeAllValidationMessages();
    };

    if ((this as IdsInputInterface).input) {
      destroy((this as IdsInputInterface).input);
    }
  }

  /**
   * Set all validation rules
   * @private
   */
  rules: any = {
    /**
     * Required validation rule
     * @private
     */
    required: {
      check: (input: any) => {
        // Checkbox
        if (input.getAttribute('type') === 'checkbox') {
          return input.checked;
        }
        // Radio
        if (input.classList.contains('ids-radio-group')) {
          return input.getRootNode()?.host?.checked;
        }
        const val = input.value;
        return !(
          (val === null)
          || (typeof val === 'string' && val === '')
          || (typeof val === 'number' && Number.isNaN(val))
        );
      },
      message: 'Required',
      type: 'error',
      id: 'required'
    },

    /**
     * Email validation rule
     * @private
     */
    email: {
      check: (input: any) => {
        const val = input.value;
        const regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,16}(?:\.[a-z]{2})?)$/i;
        return (val.length) ? regex.test(val) : true;
      },
      message: 'Email address not valid',
      type: 'error',
      id: 'email'
    },

    date: {
      check(input: any) {
        const hostCompoment = input.getRootNode().host;
        const val = input.value;
        if (input instanceof Date) {
          return input && input.getTime && !Number.isNaN(input.getTime());
        }

        const dateFormat = hostCompoment.format;
        const options: any = {};
        if (dateFormat) {
          options.dateFormat = dateFormat;
        }

        this.message = hostCompoment.localeAPI.translate('InvalidDate', { showBrackets: false });

        const parsedDate = hostCompoment.localeAPI.parseDate(val, options);
        return !(((parsedDate === undefined) && val !== ''));
      },
      message: 'Invalid Date',
      type: 'error',
      id: 'date'
    },

    time: {
      check(input: any) {
        const hostCompoment = input.getRootNode().host;
        const val = input.value;

        if (!val) return true;

        const defaultFormat = hostCompoment.localeAPI.calendar(hostCompoment.localeAPI.locale.name).timeFormat;
        const attrFormat = hostCompoment.format;

        const format = attrFormat || defaultFormat;

        this.message = hostCompoment.localeAPI.translate('InvalidTime', { showBrackets: false });

        const parsedTime = hostCompoment.localeAPI.parseDate(val, { dateFormat: format, strictTime: true });

        return isValidDate(parsedTime);
      },
      message: 'Invalid Time',
      type: 'error',
      id: 'time'
    }
  };

  /**
   * Sets the validation check to use
   * @param {string} value The `validate` attribute
   */
  set validate(value) {
    if (value) {
      this.setAttribute(attributes.VALIDATE, value);
    } else {
      this.removeAttribute(attributes.VALIDATE);
    }

    this.handleValidation();
  }

  get validate() { return this.getAttribute(attributes.VALIDATE); }

  /**
   * Sets which events to fire validation on
   * @param {string} value The `validation-events` attribute
   */
  set validationEvents(value) {
    if (value) {
      this.setAttribute(attributes.VALIDATION_EVENTS, value);
    } else {
      this.removeAttribute(attributes.VALIDATION_EVENTS);
    }
    this.handleValidation();
  }

  get validationEvents() { return this.getAttribute(attributes.VALIDATION_EVENTS); }

  /**
   * Sets  message icon, use with manually messages thru markup
   * @param {string} value The value
   */
  set validationIcon(value) {
    if (value) {
      this.setAttribute(attributes.VALIDATION_ICON, value);
    } else {
      this.removeAttribute(attributes.VALIDATION_ICON);
    }
    this.setMessageManually();
  }

  get validationIcon() { return this.getAttribute(attributes.VALIDATION_ICON); }

  /**
   * Sets  message id, use with manually messages thru markup
   * @param {string} value The value
   */
  set validationId(value) {
    if (value) {
      this.setAttribute(attributes.VALIDATION_ID, value);
    } else {
      this.removeAttribute(attributes.VALIDATION_ID);
    }
    this.setMessageManually();
  }

  get validationId() { return this.getAttribute(attributes.VALIDATION_ID); }

  /**
   * Sets message string, use with manually messages thru markup
   * @param {string} value The value
   */
  set validationMessage(value) {
    if (value) {
      this.setAttribute(attributes.VALIDATION_MESSAGE, value);
    } else {
      this.removeAttribute(attributes.VALIDATION_MESSAGE);
    }
    this.setMessageManually();
  }

  get validationMessage() { return this.getAttribute(attributes.VALIDATION_MESSAGE); }

  /**
   * Sets message type, use with manually messages thru markup
   * @param {string} value The value
   */
  set validationType(value) {
    if (value) {
      this.setAttribute(attributes.VALIDATION_TYPE, value);
    } else {
      this.removeAttribute(attributes.VALIDATION_TYPE);
    }
    this.setMessageManually();
  }

  get validationType() { return this.getAttribute(attributes.VALIDATION_TYPE); }

  /**
   * Return if the field is valid or not
   * @returns {boolean} true if invalid
   */
  get isValid(): boolean { return this.shadowRoot?.querySelectorAll('.validation-message').length === 0; }

  /**
   * Return if the current validation errors
   * @returns {Array<IdsValidationErrorMessage>} The current errors
   */
  get validationMessages(): Array<IdsValidationErrorMessage> {
    const msgs: Array<IdsValidationErrorMessage> = [];
    this.shadowRoot?.querySelectorAll('.validation-message').forEach((message: Element) => {
      msgs.push({
        message: message.querySelector('ids-text')?.childNodes[1].textContent || '',
        type: message.getAttribute('type') || '',
        id: message.getAttribute('validation-id') || ''
      });
    });
    return msgs;
  }
};

export default IdsValidationMixin;
