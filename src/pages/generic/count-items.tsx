import { Where } from '../../models/where';
import { useCount } from './api';

type CountItemsProps = {
  collection: string;
  where: Where;
};

function CountItems({ collection, where }: CountItemsProps) {
  const { data } = useCount(collection, where);
  return <span>{data.length}</span>;
}

export { CountItems };