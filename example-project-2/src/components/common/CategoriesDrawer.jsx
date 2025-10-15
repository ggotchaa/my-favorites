import { Fragment, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";

import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Checkbox from "@mui/material/Checkbox";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import HighlightAltOutlinedIcon from "@mui/icons-material/HighlightAltOutlined";
import CloseIcon from "@mui/icons-material/Close";

import {
  setSelectedCategory,
  setSelectedSubClass,
  setSelectedClass,
  getSelectedCategory,
  getSelectedClass,
  getSelectedSubClass,
  resetAllCategories,
  getFilterParams,
  setFilterParams,
} from "../../store/slices/jde-data/filterSlice";

import { HeaderWithActions } from "./HeaderWithActions";

export const CategoriesDrawer = ({ toggleCategoriesDrawer, categories }) => {
  const dispatch = useDispatch();
  const filterParams = useSelector(getFilterParams);
  const selectedCategory = useSelector(getSelectedCategory);
  const selectedClass = useSelector(getSelectedClass);
  const selectedSubClass = useSelector(getSelectedSubClass);

  const isClearBtnEnabled = [
    selectedCategory,
    selectedClass,
    selectedSubClass,
  ].some((item) => item.id);

  const drawerCategoriesActions = useMemo(
    () => [
      ...(isClearBtnEnabled
        ? [
            {
              label: "Clear all",
              onClick: () => dispatch(resetAllCategories()),
              Icon: DeleteForeverIcon,
              type: "button",
              disabled: false,
              isVisible: true,
              id: "categoriesClearAll",
            },
          ]
        : []),
      {
        label: "Close",
        onClick: toggleCategoriesDrawer(false),
        Icon: CloseIcon,
        type: "label",
        disabled: false,
        isVisible: true,
        id: "categoriesClose",
      },
    ],
    [dispatch, isClearBtnEnabled, toggleCategoriesDrawer]
  );

  const handleSelectCategory = (item) => {
    dispatch(
      setFilterParams({
        ...filterParams,
        CategoryId: item.id,
        SubClassId: undefined,
        ClassId: undefined,
      })
    );
    dispatch(setSelectedCategory(item));
    dispatch(setSelectedClass(undefined));
    dispatch(setSelectedSubClass(undefined));
  };

  const handleCheckbox = (objClass, subclass) => {
    dispatch(setSelectedClass(objClass));
    dispatch(setSelectedSubClass(subclass));
    dispatch(
      setFilterParams({
        ...filterParams,
        ClassId: objClass.id,
        SubClassId: subclass.id,
      })
    );
  };

  const displaySubCategories = () => {
    if (selectedCategory) {
      const subCategories = categories.filter((item) => {
        return item.id === selectedCategory.id;
      })[0]?.children;

      if (subCategories) {
        return (
          <>
            {subCategories.map((item) => (
              <Fragment key={item.id} data-testid="subcategory-fragment">
                <span className="text-xs text-black/[.54]">{item.title}</span>
                <ul className="mb-2">
                  {item.children.map((subClass) => (
                    <li className="flex items-center" key={subClass.id}>
                      <Checkbox
                        size="small"
                        onChange={() => handleCheckbox(item, subClass)}
                        checked={
                          subClass.id === selectedSubClass.id &&
                          item.id === selectedClass.id
                        }
                        data-testid="subcategory-checkbox"
                      />
                      <span
                        className="text-sm text-black/[0.87]"
                        data-testid="subcategory-title"
                      >
                        {subClass.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </Fragment>
            ))}
          </>
        );
      }
    }
  };

  return (
    <div className="min-w-[400px] pt-[60px] py-[24px] px-[24px] h-full">
      <div className="flex flex-col gap-5 fixed bg-white z-10 pt-5 pb-2 pr-4">
        <HeaderWithActions
          title="Categories"
          actions={drawerCategoriesActions}
        />
        <Stack
          direction="row"
          style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
        >
          {categories.map((item) => (
            <Chip
              key={item.id}
              label={item.title}
              onClick={() => handleSelectCategory(item)}
              variant="outlined"
              color={`${
                selectedCategory.id === item.id ? "primary" : "default"
              }`}
              data-testid="category-chip"
            />
          ))}
        </Stack>
      </div>
      <div className="w-full mt-36 pb-1">
        {selectedCategory.id ? (
          displaySubCategories()
        ) : (
          <div className="pt-32 flex flex-col items-center justify-center w-full text-sm text-black/[0.5]">
            Select a category
            <HighlightAltOutlinedIcon fontSize="large" />
          </div>
        )}
      </div>
    </div>
  );
};
