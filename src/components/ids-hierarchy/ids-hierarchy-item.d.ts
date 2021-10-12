// Ids is a JavaScript project, but we define TypeScript declarations so we can
// confirm our code is type safe, and to support TypeScript users.

import { IdsElement } from '../../core';

export default class extends IdsElement {
  /** Set the expanded state */
  expanded: string;

  /** Set the selected state */
  selected: string;

  /** Set the rootItem element */
  rootItem: string;
}
