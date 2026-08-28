import { useNavigate } from 'react-router-dom';
import useMousetrap from '../hooks/use-mousetrap';

function KeyboardShortcuts() {
  const navigate = useNavigate()

  // shortcuts
  useMousetrap("g h", () => navigate("/"));
  useMousetrap("g m", () => navigate("/movies"));

  return <></>
}

export default KeyboardShortcuts
