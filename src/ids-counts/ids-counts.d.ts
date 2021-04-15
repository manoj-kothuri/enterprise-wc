// Ids is a JavaScript project, but we define TypeScript declarations so we can
// confirm our code is type safe, and to support TypeScript users.

import { IdsElement } from '../ids-base/ids-element';

export default class IdsCounts extends IdsElement {
  /** Set the tag type/color */
  color: 'base' | 'caution' | 'danger' | 'success' | 'warning' | string;

  /** List the settable component properties */
  properties: string[];
}
