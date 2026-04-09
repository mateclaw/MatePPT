/**
*
*  AvatarInfoCard rule
*
*/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const AvatarInfoCardRule: ValidRule[] = [
  {
    field: 'description',
    name: '形象描述',
    types: [
      [ValidType.MAXLENGTH, 200],
    ],
  },
];
