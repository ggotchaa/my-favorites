import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import AddIcon from "@mui/icons-material/Add";

import { isSchedulesListUpdated } from "../../store/slices/walkdown-management/schedulesSlice";
import { allowedUserActions } from "../../store/slices/global/userSlice";
import { useWalkdownManagement } from "../../hooks/useWalkdownManagement";

import { WalkdownManagementSchedulesTable } from "./WalkdownManagementSchedulesTable";
import { HeaderWithActions } from "../common/HeaderWithActions";

export const WalkdownManagement = () => {
  const allowedActions = useSelector(allowedUserActions);
  const isUserActionEnabled = allowedActions.all || allowedActions.wm;
  const isSchedulesUpdated = useSelector(isSchedulesListUpdated);
  const [openNewScheduleModal, setOpenNewScheduleModal] = useState(false);

  const [isSchedulesLoading, setIsSchedulesLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);

  const { getWalkdownSchedules } = useWalkdownManagement();

  useEffect(() => {
    let isMounted = true;
    const fetchRows = () => {
      setIsSchedulesLoading(true);
      getWalkdownSchedules()
        .then((response) => {
          if (isMounted && response) {
            setSchedules(response);
            setIsSchedulesLoading(false);
          }
        })
        .finally(() => {
          setIsSchedulesLoading(false);
        });
    };

    fetchRows();
    return () => {
      isMounted = false;
    };
  }, [getWalkdownSchedules, isSchedulesUpdated]);

  const handleAddNewSchedule = () => {
    setOpenNewScheduleModal(true);
  };

  const closeNewScheduleModal = () => {
    setOpenNewScheduleModal(false);
  };

  const walkdownManagementActions = [
    {
      label: "Add new schedule",
      onClick: handleAddNewSchedule,
      Icon: AddIcon,
      type: "button",
      disabled: false,
      isVisible: isUserActionEnabled,
      id: "add-new-schedule-btn",
    },
  ];

  return (
    <div
      className="flex flex-col gap-2 w-full"
      data-testid="walkdown-management-container"
    >
      <HeaderWithActions
        title="Walkdown Management Schedules"
        actions={walkdownManagementActions}
      />
      <div className="w-full" data-testid="schedules-table-container">
        <WalkdownManagementSchedulesTable
          rows={schedules}
          loading={isSchedulesLoading}
          openNewScheduleModal={openNewScheduleModal}
          closeNewScheduleModal={closeNewScheduleModal}
          isUserActionEnabled={isUserActionEnabled}
        />
      </div>
    </div>
  );
};
