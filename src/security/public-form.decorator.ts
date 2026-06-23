import { SetMetadata } from '@nestjs/common';

export const PUBLIC_FORM_ACTION_KEY = 'publicFormAction';

export type PublicFormAction = 'quick-message' | 'order';

export const PublicForm = (action: PublicFormAction) =>
  SetMetadata(PUBLIC_FORM_ACTION_KEY, action);
