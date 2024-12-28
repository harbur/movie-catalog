import { CheckboxField } from '@/ui/form/checkbox-field';
import { FormField } from '../../models/form-field';
import { InputField } from '@/ui/form/input-field';
import { NumberField } from '@/ui/form/number-field';

type ItemCardProps = {
  readOnly?: boolean;
  state?: 'create' | 'view' | 'edit';
  fields: FormField[];
};
function ItemCard({ readOnly = false, state, fields }: ItemCardProps) {
  return (
    <>
      {fields.map(
        (field) =>
          (state && field.visible && !field.visible.includes(state)) ||
          (field.type === 'string' && (
            <InputField
              key={field.name}
              label={field.label}
              name={field.name}
              description={field.description}
              readOnly={readOnly}
              state={state}
            />
          )) ||
          (field.type === 'number' && (
            <NumberField
              key={field.name}
              label={field.label}
              name={field.name}
              description={field.description}
              readOnly={readOnly}
            />
          )) ||
          (
            <CheckboxField
              key={field.name}
              label={field.label}
              name={field.name}
              description={field.description}
              readOnly={readOnly}
            />
          ),
      )}
    </>
  );
}

export { ItemCard };
