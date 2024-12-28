import { FormField } from '../../models/form-field';
import { ItemCard } from '../generic/item-card';

const FIELDS: FormField[] = [
  {
    label: 'Movie ID',
    name: 'id',
    description: 'id',
    type: 'string',
  },
  {
    label: 'Movie Name',
    name: 'name',
    description: 'movie name',
    type: 'string',
  },
];

type CardProps = {
  readOnly?: boolean;
  state?: 'create' | 'view' | 'edit';
};
function Card({ readOnly = false, state }: CardProps) {
  return <ItemCard state={state} readOnly={readOnly} fields={FIELDS} />;
}

export { Card };
