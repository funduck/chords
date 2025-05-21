import { Signals } from "@src/signals-registry";
import { Link } from "@telegram-apps/telegram-ui";
import { useNavigate } from "react-router";

function TabLink({ id, to, children }: { id: string; to: string; children?: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <Link
      id={`tab-link-${id}`}
      onClick={() => {
        Signals.selectedTabId.set(id);
        navigate(to);
      }}
    >
      {children}
    </Link>
  );
}

export default TabLink;
