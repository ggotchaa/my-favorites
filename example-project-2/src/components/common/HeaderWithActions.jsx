import { Button } from "@mui/material";
import { DownloadMenu } from "./DownloadMenu";

export const HeaderWithActions = ({ title, actions }) => {
  return (
    <div
      className="flex items-center justify-between w-full h-[20px]"
      data-testid="header-with-actions"
    >
      <h6
        data-testid="table-title"
        className="text-xl not-italic font-bold leading-6"
      >
        {title}
      </h6>
      {actions && (
        <div
          className="flex items-center gap-4"
          data-testid="header-actions-container"
        >
          {actions.map((action) => {
            if (action.isVisible) {
              if (action.type === "button") {
                return (
                  <Button
                    key={action.label}
                    size="small"
                    startIcon={<action.Icon />}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    data-testid={action.id}
                  >
                    {action.label}
                  </Button>
                );
              } else if (action.type === "menu") {
                return (
                  <DownloadMenu
                    key={action.label}
                    label={action.label}
                    isDisabled={action.disabled}
                    isExcelLoading={action.isExcelLoading}
                    isCSVLoading={action.isCSVLoading}
                    downloadExcel={action?.downloadExcel || null}
                    downloadCSV={action.downloadCSV}
                    data-testid={action.id}
                  />
                );
              } else {
                return (
                  <action.Icon
                    onClick={action.onClick}
                    key={action.label}
                    sx={{
                      width: "24px",
                      height: "24px",
                      color: "#BDBDBD",
                      cursor: "pointer",
                    }}
                    disabled={action.disabled}
                    data-testid={action.id}
                  />
                );
              }
            } else {
              return null;
            }
          })}
        </div>
      )}
    </div>
  );
};
