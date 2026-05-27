import { useEffect } from "react";

type HeaderProps = {
  onExportClick?: () => void;
};

export default function Header({
  onExportClick,
}: HeaderProps = {}) {
  //const [user] = useState<string>("Local User");

  useEffect(() => {}, []);

  return (
    <div className="dq-header">
      <div className="dq-header-left">
        <div className="dq-header-brand"></div>
      </div>

      <div className="dq-header-title-wrap">
        <h1 className="dq-header-title">
          DATA QUALITY MONITOR
        </h1>

        <div className="dq-header-date">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="dq-header-right">
        {onExportClick && (
          <button
            className="dq-export-btn"
            type="button"
            onClick={onExportClick}
          >
            Export to Excel
          </button>
        )}

        <div className="dq-user">
          {/* 👤 {user} */}
        </div>
      </div>
    </div>
  );
}