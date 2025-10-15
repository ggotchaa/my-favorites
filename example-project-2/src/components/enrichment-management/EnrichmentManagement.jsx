import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import AddIcon from "@mui/icons-material/Add";

import { isSchedulesListUpdated } from "../../store/slices/enrichment-management/schedulesSlice";
import { allowedUserActions } from "../../store/slices/global/userSlice";
import { useEnrichmentManagement } from "../../hooks/useEnrichmentManagement";

import { EnrichmentManagementSchedulesTable } from "./EnrichmentManagementSchedulesTable";
import { HeaderWithActions } from "../common/HeaderWithActions";

export const EnrichmentManagement = () => {
  const allowedActions = useSelector(allowedUserActions);
  const isUserActionEnabled = allowedActions.all || allowedActions.em;
  const isSchedulesUpdated = useSelector(isSchedulesListUpdated);
  const [openNewScheduleModal, setOpenNewScheduleModal] = useState(false);

  const [isSchedulesLoading, setIsSchedulesLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);

  const { getEnrichmentSchedules } = useEnrichmentManagement();

  useEffect(() => {
    let isMounted = true;
    const fetchRows = () => {
      setIsSchedulesLoading(true);
      getEnrichmentSchedules()
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
  }, [getEnrichmentSchedules, isSchedulesUpdated]);

  const handleAddNewSchedule = () => {
    setOpenNewScheduleModal(true);
  };

  const closeNewScheduleModal = () => {
    setOpenNewScheduleModal(false);
  };

  const enrichmentManagementActions = [
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
      data-testid="enrichment-management"
    >
      <HeaderWithActions
        title="Enrichment Management Schedules"
        actions={enrichmentManagementActions}
      />
      <div className="w-full">
        <EnrichmentManagementSchedulesTable
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
