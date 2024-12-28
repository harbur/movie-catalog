import { ColumnDef, VisibilityState } from '@tanstack/react-table';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Where } from '../../models/where';
import { DataTable } from '../../components/ui/data-table';
import { useItems } from './api';
import { paginationState } from '@/state/atoms/pagination-state';
import { listState } from '@/state/atoms/list-state';

type ListItemsCardProps<T> = {
  collection: string;
  where?: Where;
  columns: ColumnDef<T>[]
  orderBy?: string;
  startsWith?: Where;
  initialColumnVisibility?: VisibilityState
};
function ListItemsCard<T>({ collection, where, columns, orderBy = 'timestamp', startsWith, initialColumnVisibility = {} }: ListItemsCardProps<T>) {
  const pagination = useRecoilValue(paginationState);
  const { data } = useItems<T>(collection, where, startsWith, pagination, orderBy);
  const setList = useSetRecoilState<T[]>(listState);

  useEffect(() => setList(data), [data]);

  return <DataTable
    to={`/${collection}`}
    columns={columns}
    initialColumnVisibility={initialColumnVisibility}
    data={data} />;
}

export { ListItemsCard };