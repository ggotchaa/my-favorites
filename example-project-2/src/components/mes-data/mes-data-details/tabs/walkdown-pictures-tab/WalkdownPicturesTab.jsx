import { useState } from "react";
import { useDispatch } from "react-redux";
import { CircularProgress, Paper, IconButton, Button } from "@mui/material";
import { DeleteOutlineOutlined, AddPhotoAlternate } from "@mui/icons-material";

import { setIsWalkdownPicturesUpdated } from "../../../../../store/slices/mes-data/characteristicsSlice";
import { useMesData } from "../../../../../hooks/useMesData";

import { NotFound } from "../../../../common/NotFound";
import { ImageInfo } from "../../../../common/ImageInfo";
import { TransitionsModal } from "../../../../common/Modal";
import { ImagesGalleryList } from "../../../../common/ImagesGalleryList";
import { DeletionAgreement } from "../../../../common/DeletionAgreement";
import { DetailsActionsWithHeader } from "../../../../common/DetailsActionsWithHeader";
import { AddPhotoModal } from "./AddPhotoModal";

import NotFoundImagesIcon from "../../../../../assets/no-images.svg";

export const WalkdownPicturesTab = ({
  images = [],
  loading,
  assetNumberPhk,
  equipmentTag,
  canAddPhoto,
  canEditPhoto,
  onUploadSuccess,
}) => {
  const dispatch = useDispatch();
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openAddPhotoModal, setOpenAddPhotoModal] = useState(false);
  const [pending, setPending] = useState(false);
  const [uploadPending, setUploadPending] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [imagesIdToBeDeleted, setImagesIdToBeDeleted] = useState([]);

  const {
    deleteWalkdownPictures,
    uploadEquipmentImages,
    getImageLinksBeforeUpload,
  } = useMesData();

  const handleEditMode = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setImagesIdToBeDeleted([]);
    setEditMode(false);
  };

  const handleSave = () => {
    if (!imagesIdToBeDeleted.length) {
      setEditMode(false);
    } else {
      setPending(true);
      deleteWalkdownPictures(imagesIdToBeDeleted)
        .then((response) => {
          if (response) {
            setEditMode(false);
            setImagesIdToBeDeleted([]);
            dispatch(setIsWalkdownPicturesUpdated());
          }
        })
        .finally(() => {
          setPending(false);
          setEditMode(false);
        });
    }
  };

  const handleDelete = (e, imageId) => {
    e.stopPropagation();
    setSelectedImageId(imageId);
    setOpenConfirmModal(true);
  };

  const handleOpenInfo = (event, image) => {
    event.stopPropagation();
    setSelectedImageInfo({ image, user: image.user });
    setOpenInfo(true);
  };

  const handleCloseInfo = () => {
    setOpenInfo(false);
  };

  const renderMask = (image) => {
    return (
      <div className="flex flex-col justify-end items-center gap-4 h-full w-full pb-4">
        {editMode && (
          <IconButton
            sx={{
              color: "#fff",
              ":hover": { backgroundColor: "#F44336" },
            }}
            onClick={(e) => handleDelete(e, image.equipmentImagePk)}
            disabled={pending}
            data-testid="delete-image-button"
          >
            <DeleteOutlineOutlined />
          </IconButton>
        )}
        <div className="bg-black/[0.5] flex items-center w-full justify-between px-2">
          <span>{image.imageDescription}</span>
          <IconButton
            onClick={(event) => handleOpenInfo(event, image)}
            disabled={pending}
            data-testid="image-info-button"
          >
            <span className="text-white text-sm rounded-md border-2 border-white hover:bg-white/[0.3]  py-1 px-2">
              More...
            </span>
          </IconButton>
        </div>
      </div>
    );
  };

  const closeConfirmModal = () => {
    setImagesIdToBeDeleted(
      imagesIdToBeDeleted.filter((id) => id !== selectedImageId)
    );
    setOpenConfirmModal(false);
  };

  const agreeConfirmModal = () => {
    setImagesIdToBeDeleted([
      ...new Set([...imagesIdToBeDeleted, selectedImageId]),
    ]);
    setOpenConfirmModal(false);
  };

  const handleOpenAddPhotoModal = () => {
    setOpenAddPhotoModal(true);
  };

  const handleCloseAddPhotoModal = () => {
    setOpenAddPhotoModal(false);
  };

  const getImageStyle = (image, imagesToDelete) => ({
    border: imagesToDelete.includes(image.equipmentImagePk)
      ? "4px dashed #f44336"
      : "none",
    opacity: imagesToDelete.includes(image.equipmentImagePk) ? "0.7" : "1",
    filter: imagesToDelete.includes(image.equipmentImagePk)
      ? "grayscale(100%)"
      : "none",
  });

  const handleUploadImages = async (uploadData) => {
    if (!assetNumberPhk) {
      console.error("Asset number PHK is required for image upload");
      return;
    }

    setUploadPending(true);
    try {
      const linkPromises = uploadData.files.map((file) => {
        return getImageLinksBeforeUpload(assetNumberPhk, file);
      });
      const imageLinksResults = await Promise.all(linkPromises);
      const allImageLinks = imageLinksResults.filter(
        (result) => result !== null
      );

      if (allImageLinks.length > 0 && allImageLinks.every((link) => link)) {
        const { files, ...payload } = uploadData;
        payload.imageLinks = allImageLinks;

        await uploadEquipmentImages(assetNumberPhk, payload);
        dispatch(setIsWalkdownPicturesUpdated());
        if (onUploadSuccess) {
          onUploadSuccess();
        }
        handleCloseAddPhotoModal();
      } else {
        throw new Error("Failed to get image links");
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploadPending(false);
    }
  };

  const renderAddPhotoButton = () => (
    <Button
      variant="outlined"
      onClick={handleOpenAddPhotoModal}
      disabled={uploadPending}
      data-testid="add-photo-button"
      startIcon={<AddPhotoAlternate />}
      sx={{
        width: 180,
        height: 180,
        border: "2px dashed #ccc",
        borderRadius: 2,
        "&:hover": {
          border: "2px dashed #1976d2",
          backgroundColor: "rgba(25, 118, 210, 0.04)",
        },
      }}
    >
      Add photo
    </Button>
  );

  return (
    <>
      <Paper
        elevation={0}
        variant="outlined"
        className="min-h-[400px] min-w-[850px] max-w-[1200px] w-fit"
        data-testid="walkdown-pictures-container"
      >
        <DetailsActionsWithHeader
          header="Walkdown pictures"
          handleCancel={handleCancel}
          handleEditMode={handleEditMode}
          handleSave={handleSave}
          editMode={editMode}
          actionMode={Boolean(images.length)}
          loading={loading}
          isActionsDisabled={pending}
          canEditPhoto={canEditPhoto}
        />
        <div className="flex flex-auto flex-wrap gap-4 p-4">
          {loading ? (
            <div className="flex w-full flex-col gap-2 justify-center items-center min-h-[300px]">
              <CircularProgress data-testid="loading-spinner" />
            </div>
          ) : (
            <>
              {!images.length &&
                (canAddPhoto ? (
                  <div className="flex w-full flex-col gap-2 justify-center items-center min-h-[300px]">
                    {renderAddPhotoButton()}
                  </div>
                ) : (
                  <NotFound
                    imageUrl={NotFoundImagesIcon}
                    text="No pictures found"
                  />
                ))}
              <ImagesGalleryList
                width={180}
                height={180}
                images={images}
                renderMask={renderMask}
                data-testid="images-gallery-list"
                imageStyle={(image) =>
                  getImageStyle(image, imagesIdToBeDeleted)
                }
              />
              {canAddPhoto && images.length > 0 && renderAddPhotoButton()}
            </>
          )}
        </div>
      </Paper>
      <TransitionsModal open={openInfo} handleClose={handleCloseInfo}>
        <ImageInfo selectedImageInfo={selectedImageInfo} />
      </TransitionsModal>
      <TransitionsModal open={openConfirmModal} handleClose={closeConfirmModal}>
        <DeletionAgreement
          title="Delete image?"
          subtitle="You will not be able to restore it later."
          onCancel={closeConfirmModal}
          onConfirm={agreeConfirmModal}
        />
      </TransitionsModal>
      <AddPhotoModal
        open={openAddPhotoModal}
        onClose={handleCloseAddPhotoModal}
        onUpload={handleUploadImages}
        loading={uploadPending}
        equipmentTag={equipmentTag}
      />
    </>
  );
};
