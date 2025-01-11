import {
  ActionSheetIOS,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import Loader from "../shared/loader/Loader";
import ChooseCameraModal from "../shared/modal/ChooseCameraModal";
import ButtonDefault from "../shared/button/ButtonDefault";
import { pickCameraImage } from "@/src/services/pickCameraImage";
import { pickGalleryImage } from "@/src/services/pickGalleryImage";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ImagePickerAsset } from "expo-image-picker";
import { useUploadImage } from "@/src/queries/upload-image";
import { Image } from "expo-image";
import CustomText from "../shared/text/CustomText";
import { useCustomTheme } from "@/src/hooks/useCustomTheme";
import { ImageUploadResponse } from "@/src/types/image";
import { useTranslation } from "react-i18next";
import ButtonInput from "../shared/button/ButtonInput";
import CustomIcon from "../shared/icon/CustomIcon";

export type UploadedImageAsset = ImagePickerAsset & {
  publicId?: string;
  isError?: boolean;
  uniqueID?: string;
  secure_url?: string;
};

type Props = {
  onImageUploadSuccess: (images: UploadedImageAsset[]) => void;
};

const ChoosePhoto = (props: Props) => {
  const { onImageUploadSuccess } = props;
  const { t } = useTranslation();
  const theme = useCustomTheme();

  const uploadImage = useUploadImage();

  const [images, setImages] = useState<UploadedImageAsset[]>([]);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleOpenCameraModal = () => {
    Keyboard.dismiss();
    bottomSheetRef.current?.present();
  };

  const handleGalleryImagePick = async () => {
    const result = await pickGalleryImage({ allowsEditing: true });

    result && handleUploadImage({ ...result[0], uniqueID: `${result[0].assetId}${Date.now()}` });
  };

  const handleCameraImagePick = async () => {
    const result = await pickCameraImage({ aspect: [3, 4] });
    result && handleUploadImage(result);
  };

  const handleUploadImage = (imagePickerAsset: UploadedImageAsset) => {
    if (!imagePickerAsset) return;

    const isExisted = images.some((img) => img.uniqueID === imagePickerAsset.uniqueID);

    if (!isExisted) {
      setImages((prev) => [...prev, { ...imagePickerAsset, isError: false }]);
    } else {
      setImages((prev) =>
        prev.map((img) =>
          img.assetId === imagePickerAsset.assetId ? { ...img, isError: false } : img
        )
      );
    }
    uploadImage.mutate(imagePickerAsset, {
      onSuccess: (data: ImageUploadResponse) => {
        setImages((prev) =>
          prev.map(
            (img) =>
              img.assetId === imagePickerAsset.assetId
                ? { ...img, publicId: data.secure_url, secure_url: data.secure_url }
                : img // here change data.public_id if needed + type data
          )
        );
      },
      onError: (error) => {
        setImages((prev) =>
          prev.map((img) =>
            img.assetId === imagePickerAsset.assetId ? { ...img, isError: true } : img
          )
        );
      },
    });
  };

  useEffect(() => {
    const readyImages = images.filter((img) => img.publicId && !img.isError);
    onImageUploadSuccess(readyImages);
  }, [images]);

  return (
    <>
      <View className="flex flex-row gap-3">
        <View style={{ width: 160 }}>
          <ButtonInput onPress={handleOpenCameraModal}>
            <View className="flex flex-row gap-2 w-full justify-center">
              <CustomIcon
                render={(color, size) => <FontAwesome name="image" size={size} color={color} />}
              />
              <CustomText>Add photo</CustomText>
            </View>
          </ButtonInput>
        </View>

        {images && (
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onContentSizeChange={() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }}
          >
            <View className="flex flex-row gap-2 flex-wrap">
              {images.map((image, index) => {
                const isError = image.isError;
                const isUploading = uploadImage.isPending && !image.publicId && !isError;

                return (
                  <View
                    className="relative"
                    key={index}
                    style={[
                      { borderRadius: 5, width: 45, height: 45, overflow: "hidden" },
                      isError && {
                        borderWidth: 1,
                        borderColor: theme.colors.error,
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: image?.uri }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",

                        opacity: isUploading || isError ? 0.7 : 1,
                      }}
                    />
                    {isUploading && (
                      <View className="absolute left-0 top-0 w-full h-full flex items-center justify-center">
                        <Loader style={{ width: 45, height: 45 }} />
                      </View>
                    )}
                    {isError && (
                      <View className="absolute left-0 top-0 w-full h-full flex items-center justify-center">
                        <TouchableOpacity onPress={() => handleUploadImage(image)}>
                          <FontAwesome6 name="arrow-rotate-right" size={18} color="white" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}

        <ChooseCameraModal
          ref={bottomSheetRef}
          onGallery={() => handleGalleryImagePick()}
          onCamera={() => handleCameraImagePick()}
        />
      </View>
    </>
  );
};

export default ChoosePhoto;
