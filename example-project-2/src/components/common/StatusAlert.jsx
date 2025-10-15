import { Alert } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

export const StatusAlert = ({ value, comment, severity, style }) => {
  return value ? (
    <Alert
      data-testid="defined-status"
      iconMapping={{
        warning: <FiberManualRecordIcon sx={{ fontSize: "10px" }} />,
        success: <FiberManualRecordIcon sx={{ fontSize: "10px" }} />,
        info: <FiberManualRecordIcon sx={{ fontSize: "10px" }} />,
        error: <FiberManualRecordIcon sx={{ fontSize: "10px" }} />,
      }}
      className="flex items-center h-[30px]"
      severity={severity}
    >
      <div className="flex flex-col">
        <span className="text-sm">{value}</span>
        {value === "postponed" && comment ? (
          <span className="text-xs">{`[${comment.toLowerCase()}]`}</span>
        ) : null}
      </div>
    </Alert>
  ) : (
    <Alert
      iconMapping={{
        warning: <FiberManualRecordIcon sx={{ fontSize: "10px" }} />,
        success: <FiberManualRecordIcon sx={{ fontSize: "10px" }} />,
        info: <FiberManualRecordIcon sx={{ fontSize: "10px" }} />,
        error: <FiberManualRecordIcon sx={{ fontSize: "10px" }} />,
      }}
      className="flex items-center h-[30px]"
      severity="info"
      data-testid="not-defined-status"
    >
      Not defined
    </Alert>
  );
};
