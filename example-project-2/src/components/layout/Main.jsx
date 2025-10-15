import { useSelector } from "react-redux";
import { Route, Routes, Navigate, useParams } from "react-router-dom";

import { selectUserRole } from "../../store/slices/global/userSlice";

import { Navbar } from "./Navbar";
import { JdeData, JdeDataDetails } from "../jde-data";
import { MesData, MesDataDetails } from "../mes-data";
import { Monitor } from "../monitor";
import {
  WalkdownManagement,
  WalkdownScheduleEquipment,
} from "../walkdown-management";
import { MaterialsManagement } from "../materials-management";
import { Notification } from "../common/Notification";

import { USER_ROLE } from "../../constants/environment";
import { NoPermission } from "../common/NoPermission";
import {
  EnrichmentManagement,
  EnrichmentScheduleEquipment,
} from "../enrichment-management";

// Wrapper component to properly decode URL parameters
const JdeDataDetailsWrapper = () => {
  const { id } = useParams();
  const decodedId = id ? decodeURIComponent(id) : "";
  return <JdeDataDetails id={decodedId} />;
};

// Wrapper component for MES data details
const MesDataDetailsWrapper = () => {
  const { id } = useParams();
  const decodedId = id ? decodeURIComponent(id) : "";
  return <MesDataDetails id={decodedId} />;
};

// Wrapper component for Walkdown schedule equipment
const WalkdownScheduleEquipmentWrapper = () => {
  const { id } = useParams();
  const decodedId = id ? decodeURIComponent(id) : "";
  return <WalkdownScheduleEquipment id={decodedId} />;
};

// Wrapper component for Enrichment schedule equipment
const EnrichmentScheduleEquipmentWrapper = () => {
  const { id } = useParams();
  const decodedId = id ? decodeURIComponent(id) : "";
  return <EnrichmentScheduleEquipment id={decodedId} />;
};

export const Main = () => {
  const userRole = useSelector(selectUserRole);

  const rolesWithAccess = [
    USER_ROLE.DATA_TEAM,
    USER_ROLE.ENRICHMENT_TEAM,
    USER_ROLE.SME,
    USER_ROLE.WALKDOWN_COORDINATOR,
    USER_ROLE.ENRICHMENT_COORDINATOR,
    USER_ROLE.QA_ENGINEER,
    USER_ROLE.ADMIN,
    USER_ROLE.RESTRICTED,
    USER_ROLE.FIELD_ENGINEERS,
    USER_ROLE.MM_SYSTEM_ANALYST,
  ];

  const isJdeDataEnabled = rolesWithAccess.includes(userRole);
  const isMesDataEnabled = rolesWithAccess.includes(userRole);
  const isWalkdownManagementEnabled = rolesWithAccess.includes(userRole);
  const isEnrichmentManagementEnabled = rolesWithAccess.includes(userRole);
  const isMaterialsManagementEnabled = rolesWithAccess.includes(userRole);

  const renderNavigate = () => {
    switch (userRole) {
      case USER_ROLE.ADMIN:
      case USER_ROLE.DATA_TEAM:
      case USER_ROLE.SME:
      case USER_ROLE.RESTRICTED:
        return <Navigate to="/jde-data" />;
      case USER_ROLE.WALKDOWN_COORDINATOR:
        return <Navigate to="/walkdown-management" />;
      case USER_ROLE.MM_SYSTEM_ANALYST:
        return <Navigate to="/materials-management" />;
      case USER_ROLE.ENRICHMENT_TEAM:
        return <Navigate to="/enrichment-management" />;
      default:
        return <Navigate to="/jde-data" />;
    }
  };

  return (
    <div className="flex pt-4 pr-10 pb-0 pl-10 flex-col items-start gap-4 w-full">
      <Navbar
        isJdeDataEnabled={isJdeDataEnabled}
        isMesDataEnabled={isMesDataEnabled}
        isWalkdownManagementEnabled={isWalkdownManagementEnabled}
        isMaterialsManagementEnabled={isMaterialsManagementEnabled}
        isEnrichmentManagementEnabled={isEnrichmentManagementEnabled}
      />
      <div className="w-full">
        <Routes>
          <Route index element={renderNavigate()} />
          {isJdeDataEnabled && (
            <>
              <Route path="/jde-data" element={<JdeData />} />
              <Route path="/jde-data/:id" element={<JdeDataDetailsWrapper />} />
            </>
          )}
          {isMesDataEnabled && (
            <>
              <Route path="/mes-data" element={<MesData />} />
              <Route path="/mes-data/:id" element={<MesDataDetailsWrapper />} />
            </>
          )}
          {isWalkdownManagementEnabled && (
            <>
              <Route
                path="/walkdown-management"
                element={<WalkdownManagement />}
              />
              <Route
                path="/walkdown-management/:id"
                element={<WalkdownScheduleEquipmentWrapper />}
              />
            </>
          )}
          {isEnrichmentManagementEnabled && (
            <>
              <Route
                path="/enrichment-management"
                element={<EnrichmentManagement />}
              />
              <Route
                path="/enrichment-management/:id"
                element={<EnrichmentScheduleEquipmentWrapper />}
              />
            </>
          )}
          {isMaterialsManagementEnabled && (
            <Route
              path="/materials-management"
              element={<MaterialsManagement />}
            />
          )}
          {(isJdeDataEnabled ||
            isWalkdownManagementEnabled ||
            isEnrichmentManagementEnabled ||
            isMaterialsManagementEnabled) && (
            <Route path="/monitor" element={<Monitor />} />
          )}
          <Route path="*" element={<NoPermission />} />
        </Routes>
      </div>
      <Notification />
    </div>
  );
};
