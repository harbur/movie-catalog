import QueryParams from "@/models/queryParams";
import { Route, Routes, useParams } from "react-router-dom";
import Create from "./create";
import Edit from "./edit";
import { List } from "./list";
import View from "./view";

function Movies() {
  return (
    <Routes>
      <Route path="/" element={<List />} />
      <Route path="new" element={<Create />} />
      <Route path=":id/edit" element={<EditParams />} />
      <Route path=":id/*" element={<ViewParams />} />
    </Routes>
  );
}

function ViewParams() {
  const { id } = useParams<QueryParams>()
  return <View id={+id!} />
}

function EditParams() {
  const { id } = useParams<QueryParams>()
  return <Edit id={+id!} />
}

export default Movies;