import { useState } from "react";
import { useLocation } from "react-router-dom";
import Iframe from "react-iframe";

import { CircularProgress, Paper } from "@mui/material";

export const EquipmentDocuments = () => {
  const location = useLocation();
  const id = location.pathname.split("/")[2]; // get the id from url path
  const [loading, setLoading] = useState(true);

  return (
    <Paper
      data-testid="equipment-documents-container"
      elevation={0}
      variant="outlined"
      className="w-[1000px] min-h-[400px] h-[800px] flex items-center justify-center bg-[#f4f5f6]"
    >
      {loading ? (
        <div data-testid="equipment-documents-loading" className="absolute">
          <CircularProgress data-testid="equipment-documents-spinner" />
        </div>
      ) : (
        <></>
      )}
      <Iframe
        data-testid="equipment-documents-iframe"
        url={`https://eportal.tengizchevroil.com/#/item/${id}`}
        width="100%"
        height="100%"
        onLoad={() => setLoading(false)}
      />
    </Paper>
  );
};
