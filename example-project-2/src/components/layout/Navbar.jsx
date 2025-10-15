import { Link, useLocation } from "react-router-dom";
import { Box, Tabs, Tab } from "@mui/material";
import { TabContext } from "@mui/lab";

export const Navbar = ({
  isJdeDataEnabled,
  isMesDataEnabled,
  isWalkdownManagementEnabled,
  isMaterialsManagementEnabled,
  isEnrichmentManagementEnabled,
}) => {
  const { pathname } = useLocation();

  return (
    <TabContext value={pathname}>
      <Box sx={{ width: "100%" }}>
        <Tabs
          value={pathname}
          aria-label="page navigation"
          role="navigation"
          data-testid="navigation-tabs"
          sx={{
            minHeight: "40px",
            "& .MuiTab-root": {
              minHeight: "40px",
              padding: "6px 12px",
            },
          }}
        >
          {isJdeDataEnabled && (
            <Tab
              LinkComponent={Link}
              label="JDE data"
              to="/jde-data"
              value="/jde-data"
              data-testid="jde-data-tab"
            />
          )}
          {isMesDataEnabled && (
            <Tab
              LinkComponent={Link}
              label="MES data"
              to="/mes-data"
              value="/mes-data"
              data-testid="mes-data-tab"
            />
          )}
          {isWalkdownManagementEnabled && (
            <Tab
              LinkComponent={Link}
              label="Walkdown Management"
              to="/walkdown-management"
              value="/walkdown-management"
              data-testid="walkdown-management-tab"
            />
          )}
          {isEnrichmentManagementEnabled && (
            <Tab
              LinkComponent={Link}
              label="Enrichment Management"
              to="/enrichment-management"
              value="/enrichment-management"
              data-testid="enrichment-management-tab"
            />
          )}
          {isMaterialsManagementEnabled && (
            <Tab
              LinkComponent={Link}
              label="Materials Management"
              to="/materials-management"
              value="/materials-management"
              data-testid="materials-management-tab"
            />
          )}
          <Tab
            LinkComponent={Link}
            label="Monitor"
            to="/monitor"
            value="/monitor"
            data-testid="monitor-tab"
          />
        </Tabs>
      </Box>
    </TabContext>
  );
};
