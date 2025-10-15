/**
 * Validates equipment tag and parent tag
 * @param {Object} params - Validation parameters
 * @param {string} params.tagNumber - Tag number to validate
 * @param {Function} params.validateNewEquipmentTag - Function to validate tag
 * @param {Function} params.setErrors - Function to set validation errors
 * @param {string} params.fieldName - Field name for error state (EQUIPMENT_TAG or PARENT_EQUIPMENT_TAG)
 * @returns {Promise<boolean>} - Returns true if validation passes, false otherwise
 */
export const validateTag = async ({
  tagNumber,
  validateNewEquipmentTag,
  setErrors,
  fieldName,
  skipValidation,
}) => {
  if (!tagNumber) return true;

  if (tagNumber.includes(' ') || tagNumber.trim() !== tagNumber) {
    setErrors((prev) => ({ 
      ...prev, 
      [fieldName]: "Tag number cannot contain spaces at the beginning, end, or in between." 
    }));
    return false;
  }

  if (skipValidation) {
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    return true;
  }

  try {
    const response = await validateNewEquipmentTag({ tagNumber });

    if (response.status === 400 && response.data) {
      setErrors((prev) => ({ ...prev, [fieldName]: response.data }));
      return false;
    }

    if (response.status === 200) {
      const tagExists = response.data === true;
      
      if (fieldName === "PARENT_EQUIPMENT_TAG") {
        if (tagExists) {
          setErrors((prev) => ({ ...prev, [fieldName]: "" }));
          return true;
        } else {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: "Parent tag number doesn't exist",
          }));
          return false;
        }
      } else if (fieldName === "EQUIPMENT_TAG") {
        if (tagExists) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: "This tag number already exists",
          }));
          return false;
        } else {
          setErrors((prev) => ({ ...prev, [fieldName]: "" }));
          return true;
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error validating tag:", error);
    return false;
  }
};