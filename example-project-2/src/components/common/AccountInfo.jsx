import { useMsal } from "@azure/msal-react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { useSelector } from "react-redux";
import { selectUserRole } from "../../store/slices/global/userSlice";

export const AccountInfo = () => {
  const { accounts } = useMsal();
  const userRole = useSelector(selectUserRole);

  const getAccountFullName = () => {
    const accountEmail = accounts[0]?.username;
    const accountName = accountEmail?.split("@")[0];
    return accountName.toLowerCase();
  };

  return (
    <div className="flex items-center gap-[8px]" data-testid="account-info">
      <AccountCircleIcon className="text-white" sx={{ fontSize: "48px" }} />
      <div className="flex flex-col gap-[2px] justify-center">
        <span
          className="text-white text-base not-italic font-normal leading-5"
          data-testid="account-full-name"
        >
          {getAccountFullName()}
        </span>
        <span
          className="text-white text-sm not-italic font-normal leading-4"
          data-testid="account-role"
        >
          {userRole}
        </span>
      </div>
    </div>
  );
};
