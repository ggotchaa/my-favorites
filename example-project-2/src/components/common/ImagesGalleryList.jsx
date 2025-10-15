import { Image } from "antd";
import Skeleton from "@mui/material/Skeleton";

import { getFormattedImageLink } from "../../utils";

export const ImagesGalleryList = ({
  images = [],
  width,
  height,
  renderMask,
  imageStyle,
}) => {
  const sortedImages = [...images].sort(
    (a, b) => new Date(b?.createdDate) - new Date(a?.createdDate)
  );
  return (
    <Image.PreviewGroup>
      {sortedImages.map((item) => (
        <Image
          key={item.equipmentImagePk}
          width={width}
          height={height}
          style={{
            objectFit: "cover",
            ...(imageStyle ? imageStyle(item) : {}),
          }}
          src={getFormattedImageLink(item.imageLink)}
          fallback={`https://placehold.co/${width}x${height}?text=Image+Error`}
          preview={{
            mask: renderMask(item),
          }}
          placeholder={
            <Skeleton variant="rectangular" width={width} height={height} />
          }
        />
      ))}
    </Image.PreviewGroup>
  );
};
