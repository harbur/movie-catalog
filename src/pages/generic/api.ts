import { collection as firebaseCollection, limit, orderBy as firestoreOrderBy, query, Query, where as firebaseWhere, where as firestoreWhere } from 'firebase/firestore';
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import { Where } from '../../models/where';

export const useCount = (collection: string, where: Where) => {
  var ref = firebaseCollection(useFirestore(), collection);
  const filteredRef = query(ref, firebaseWhere(where.field, '==', where.value));
  const response = useFirestoreCollectionData(filteredRef, { idField: 'id' });
  return { ref, ...response };
};

/**
 * retrieves array of items from a collection.
 * 
 * @param collection the name of the collection.
 * @param where optional filter collection with a field value (by default no filter is applied)
 * @param startsWith optional filter collection with a field value. When used the orderBy do no apply. (by default no filter is applied)
 * @param pagination optional pagination limit (by default no pagination is applied)
 * @param orderBy field which will be used for listing order.
 * @returns array of items
 */
export const useItems = <T = any>(collection: string, where: Where | undefined, startsWith: Where | undefined, pagination: number | undefined, orderBy: string) => {
  var q = query(firebaseCollection(useFirestore(), collection)) as Query<T>;

  if (pagination !== undefined && pagination !== 0) {
    q = query(q, limit(pagination));
  }
  if (where && where.value) {
    q = query(q, firestoreWhere(where.field, '==', where.value));
    q = query(q, firestoreOrderBy(orderBy, 'desc'));
  } else if (startsWith && startsWith.value) {
    q = query(q, firestoreWhere(startsWith.field, '>=', startsWith.value));
    q = query(q, firestoreWhere(startsWith.field, '<=', startsWith.value + '~'));
  } else {
    q = query(q, firestoreOrderBy(orderBy, 'desc'));
  }

  const response = useFirestoreCollectionData(q, { idField: 'id' });
  return { ...response };
};