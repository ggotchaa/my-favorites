import { useState, useEffect, useCallback } from "react";
import Iframe from "react-iframe";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";

import { useClearSchedulePagination } from "../../hooks/useClearSchedulePagination";

import {
  DCAM,
  WALKDOWN_APP,
  JDE_DATA_PROFILE,
  MES_DATA_ENRICHMENT_PROGRESS,
} from "../../constants/monitor";

export const Monitor = () => {
  const [activeButton, setActiveButton] = useState("all_units");
  const [selectedUrl, setSelectedUrl] = useState(DCAM);

  // Clear schedule pagination data on component mount
  useClearSchedulePagination();

  useEffect(() => {
    switch (activeButton) {
      case "all_units":
        setSelectedUrl(DCAM);
        break;
      case "walkdown":
        setSelectedUrl(WALKDOWN_APP);
        break;
      case "data_profile":
        setSelectedUrl(JDE_DATA_PROFILE);
        break;
      case "mes_data_enrichment_progress":
        setSelectedUrl(MES_DATA_ENRICHMENT_PROGRESS);
        break;
      default:
        return null;
    }
  }, [activeButton]);

  const renderIframe = useCallback(() => {
    return <Iframe url={selectedUrl} width="1200px" height="600px" />;
  }, [selectedUrl]);

  const handleClick = (btn) => {
    setActiveButton(btn);
  };

  return (
    <div
      className="min-w-[800px] max-w-[1200px] h-screen"
      data-testid="monitor-container"
    >
      <ButtonGroup
        variant="outlined"
        aria-label="Power Bi Dashboards"
        data-testid="monitor-button-group"
      >
        <Button
          sx={{
            backgroundColor: activeButton === "all_units" ? "#0066B214" : "",
          }}
          onClick={() => handleClick("all_units")}
          data-testid="all-units-button"
        >
          All Units
        </Button>
        <Button
          sx={{
            backgroundColor: activeButton === "walkdown" ? "#0066B214" : "",
          }}
          onClick={() => handleClick("walkdown")}
          data-testid="walkdown-button"
        >
          Walkdown App
        </Button>
        <Button
          sx={{
            backgroundColor: activeButton === "data_profile" ? "#0066B214" : "",
          }}
          onClick={() => handleClick("data_profile")}
          data-testid="jde-data-profile-button"
        >
          JDE Data Profile
        </Button>
        <Button
          sx={{
            backgroundColor:
              activeButton === "mes_data_enrichment_progress"
                ? "#0066B214"
                : "",
          }}
          onClick={() => handleClick("mes_data_enrichment_progress")}
          data-testid="mes-data-enrichment-button"
        >
          MES Data Enrichment Progress
        </Button>
      </ButtonGroup>
      <div
        className="mt-6 h-auto w-auto bg-white"
        data-testid="monitor-iframe-container"
      >
        {renderIframe()}
      </div>
    </div>
  );
};
