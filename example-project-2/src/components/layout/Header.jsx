import { AppBar, Toolbar } from "@mui/material";

import { AppLogo } from "../common/AppLogo";
import { AccountInfo } from "../common/AccountInfo";

export const Header = () => {
  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          minHeight: "64px",
          backgroundColor: "#0066B2",
          padding: "8px 40px",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <AppLogo />
        <AccountInfo />
      </AppBar>
      <Toolbar />
    </>
  );
};
