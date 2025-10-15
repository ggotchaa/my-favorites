import { useSelector } from "react-redux";
import { selectUserRole } from "../store/slices/global/userSlice";
import { useEffect, useState } from "react";

const enrichmentUserReviewByDSEquipmentNextStatuses = [
  "Review by FV",
  "Review by Archive",
  "Internal QA/QC",
];

const enrichmentUserReturnToDSEquipmentNextStatuses = [
  "Return to FV",
  "Review by Archive",
  "Internal QA/QC",
];

const enrichmentCoordinatorEquipmentStatuses = [
  "JDE E1 Original",
  "Review by LTI",
  "Completed by LTI",
  "Review by DS",
  "Review by FV",
  "Review by Archive",
  "Return to DS",
  "Return to FV",
  "Internal QA/QC",
  "Ready for QA/QC",
];

export const useFilterByPermissions = (
  initialEquipmentStatus,
  equipmentStatuses,
  attributeStatuses
) => {
  const [isEnrichmentEditEnabled, setIsEnrichmentEditEnabled] = useState(false);
  const [isAttrEditEnabled, setIsAttrEditEnabled] = useState(false);
  const [isEditEnrichmentStatusEnabled, setIsEditEnrichmentStatusEnabled] =
    useState(false);
  const [isEditEnrichmentCommentEnabled, setIsEditEnrichmentCommentEnabled] =
    useState(false);
  const [isEditAttrValueEnabled, setIsEditAttrValueEnabled] = useState(false);
  const [isEditAttrCommentEnabled, setIsEditAttrCommentEnabled] =
    useState(false);
  const [isEditAttrStatusEnabled, setIsEditAttrStatusEnabled] = useState(false);
  const userRole = useSelector(selectUserRole);
  const [filteredEquipmentStatuses, setFilteredEquipmentStatuses] = useState(
    []
  );
  const [filteredAttrStatuses, setFilteredAttrStatuses] = useState([]);

  const [currentEquipmentStatus, setCurrentEquipmentStatus] = useState(
    initialEquipmentStatus || { value: "", label: "" }
  );

  useEffect(() => {
    if (initialEquipmentStatus?.label) {
      setCurrentEquipmentStatus(initialEquipmentStatus);
    }
  }, [initialEquipmentStatus]);

  function setFlagBoolean(boolean) {
    setIsEnrichmentEditEnabled(boolean);
    setIsAttrEditEnabled(boolean);
    setIsEditEnrichmentStatusEnabled(boolean);
    setIsEditEnrichmentCommentEnabled(boolean);
    setIsEditAttrValueEnabled(boolean);
    setIsEditAttrCommentEnabled(boolean);
    setIsEditAttrStatusEnabled(boolean);
  }

  function setFlagBooleanForSMEUser(boolean) {
    setIsEnrichmentEditEnabled(boolean);
    setIsAttrEditEnabled(boolean);
    setIsEditEnrichmentStatusEnabled(boolean);
    setIsEditEnrichmentCommentEnabled(boolean);
    setIsEditAttrCommentEnabled(boolean);
    setIsEditAttrStatusEnabled(boolean);
  }

  function setFlagBooleanForEnrichmentCoordinator(boolean) {
    setIsEnrichmentEditEnabled(boolean);
    setIsAttrEditEnabled(boolean);
    setIsEditEnrichmentCommentEnabled(boolean);
    setIsEditAttrCommentEnabled(boolean);
  }

  useEffect(() => {
    if (userRole === "Admin") {
      setFlagBoolean(true);
      setFilteredEquipmentStatuses(equipmentStatuses);
      setFilteredAttrStatuses(attributeStatuses);
    } else if (
      (userRole === "Enrichment user" || userRole === "QA Engineer") &&
      currentEquipmentStatus.label === "Review by DS"
    ) {
      setFlagBoolean(true);
      setFilteredEquipmentStatuses(
        equipmentStatuses.filter((item) =>
          enrichmentUserReviewByDSEquipmentNextStatuses.includes(item.label)
        )
      );
      setFilteredAttrStatuses(
        attributeStatuses.filter((item) => item.label === "Updated by DS")
      );
    } else if (
      (userRole === "Enrichment user" || userRole === "QA Engineer") &&
      currentEquipmentStatus.label === "Return to DS"
    ) {
      setFlagBoolean(true);
      setFilteredEquipmentStatuses(
        equipmentStatuses.filter((item) =>
          enrichmentUserReturnToDSEquipmentNextStatuses.includes(item.label)
        )
      );
      setFilteredAttrStatuses(
        attributeStatuses.filter((item) => item.label === "Updated by DS")
      );
    } else if (
      (userRole === "QA Engineer" || userRole === "Enrichment user") &&
      (currentEquipmentStatus.label === "Return to FV" ||
        currentEquipmentStatus.label === "Review by Archive" ||
        currentEquipmentStatus.label === "Review by FV")
    ) {
      setFlagBoolean(true);
      setFilteredEquipmentStatuses(
        equipmentStatuses.filter((item) => item.label === "Return to DS")
      );
      setFilteredAttrStatuses(
        attributeStatuses.filter((item) => item.label === "Updated by DS")
      );
    } else if (
      userRole === "QA Engineer" &&
      currentEquipmentStatus.label === "Internal QA/QC"
    ) {
      setFlagBoolean(true);
      setFilteredEquipmentStatuses(
        equipmentStatuses.filter(
          (item) =>
            item.label === "Return to DS" || item.label === "Ready for QA/QC"
        )
      );
      setFilteredAttrStatuses(
        attributeStatuses.filter(
          (item) =>
            item.label === "Return to DS" ||
            item.label === "Ready for JDE update" ||
            item.label === "Updated by DS"
        )
      );
    } else if (
      userRole === "QA Engineer" &&
      currentEquipmentStatus.label === "Ready for QA/QC"
    ) {
      setFlagBoolean(true);
      setFilteredEquipmentStatuses(
        equipmentStatuses.filter(
          (item) =>
            item.label === "Return to DS" ||
            item.label === "Ready for JDE update"
        )
      );
      setFilteredAttrStatuses(
        attributeStatuses.filter(
          (item) =>
            item.label === "Return to DS" ||
            item.label === "Ready for JDE update" ||
            item.label === "Updated by DS"
        )
      );
    } else if (
      userRole === "QA Engineer" &&
      currentEquipmentStatus.label === "Ready for JDE update"
    ) {
      setIsEditEnrichmentStatusEnabled(true);
      setIsEditEnrichmentCommentEnabled(true);
      setIsEnrichmentEditEnabled(true);
      setIsAttrEditEnabled(false);
      setFilteredEquipmentStatuses(
        equipmentStatuses.filter((item) => item.label === "ACD submitted")
      );
    } else if (
      userRole === "SME user" &&
      currentEquipmentStatus.label === "Ready for QA/QC"
    ) {
      setFlagBooleanForSMEUser(true);
      setFilteredEquipmentStatuses(
        equipmentStatuses.filter(
          (item) =>
            item.label === "Internal QA/QC" ||
            item.label === "Ready for JDE update"
        )
      );
      setFilteredAttrStatuses(
        attributeStatuses.filter(
          (item) =>
            item.label === "Return to DS" ||
            item.label === "Ready for JDE update"
        )
      );
    } else if (
      userRole === "SME user" &&
      currentEquipmentStatus.label === "Ready for JDE update"
    ) {
      setFlagBooleanForSMEUser(true);
      setFilteredEquipmentStatuses(
        equipmentStatuses.filter(
          (item) =>
            item.label === "Internal QA/QC" || item.label === "ACD submitted"
        )
      );
      setFilteredAttrStatuses(
        attributeStatuses.filter(
          (item) =>
            item.label === "Return to DS" ||
            item.label === "Ready for JDE update"
        )
      );
    } else if (
      userRole === "Enrichment coordinator" &&
      enrichmentCoordinatorEquipmentStatuses.includes(
        currentEquipmentStatus.label
      )
    ) {
      setFlagBooleanForEnrichmentCoordinator(true);
    } else {
      setFlagBooleanForSMEUser(false);
      setFlagBoolean(false);
      setFlagBooleanForEnrichmentCoordinator(false);
    }
  }, [
    attributeStatuses,
    equipmentStatuses,
    currentEquipmentStatus.label,
    userRole,
  ]);

  return {
    flag: {
      isEnrichmentEditEnabled,
      isAttrEditEnabled,
      isEditEnrichmentStatusEnabled,
      isEditEnrichmentCommentEnabled,
      isEditAttrValueEnabled,
      isEditAttrCommentEnabled,
      isEditAttrStatusEnabled,
    },
    filteredAttrStatuses,
    filteredEquipmentStatuses,
    setCurrentEquipmentStatus,
  };
};
