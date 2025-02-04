import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TournamentFormat, TournamentSkillLevel, TournamentSport } from "@/src/types/types";
import RHFormDropdownInput from "@/src/shared/form/RHFormDropdownInput";
import RHFormInput from "@/src/shared/form/RHFormInput";
import { ImageResource } from "../../../../shared/controllers/ImagePickerController";
import DualInputSection from "../DualInputSection";
import { TournamentFormData } from "./schema";
import CustomText from "@/src/shared/text/CustomText";
import ChooseImageSection from "../ChooseImageSection";
import RHFormDatePicker from "@/src/shared/form/RHFormDatePicker";
import CustomAnimatedView from "@/src/shared/view/CustomAnimatedView";
import { useCustomTheme } from "@/src/hooks/useCustomTheme";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { Divider } from "react-native-paper";

type Props = {
  type: "edit" | "create";
  id?: string;
};
export const TournamentEditForm = ({ type, id }: Props) => {
  const { t } = useTranslation();
  const [isOpenedAdditional, setIsOpenedAdditional] = useState(false);
  const theme = useCustomTheme();
  const {
    control,
    watch,
    setValue,
    setFocus,
    formState: { errors },
  } = useFormContext<TournamentFormData>();

  const updateImages = (images: ImageResource[]) => {
    setValue("images", images);
  };

  const goToLocationPage = () => {
    router.navigate({
      pathname: `tournaments/${type}/choose-location`,
      params: {
        id,
        address: watch("location"),
        latitude: watch("geoCoordinates.latitude"),
        longitude: watch("geoCoordinates.longitude"),
      },
    });
  };

  return (
    <View className="flex flex-col gap-1">
      <CustomText type="subtitle" className="ml-1 mb-3">
        Tournament Details
      </CustomText>
      <RHFormDropdownInput
        control={control}
        name="sportType"
        label={t("tournament.sportType.title")}
        inputProps={{
          value: watch("sportType") && t(`tournament.sportType.${watch("sportType")}`),
        }}
        dropdownProps={{
          selectedValue: watch("sportType"),
          onValueChange: (itemValue) => setValue("sportType", itemValue || undefined),
          items: [
            {
              label: t(`tournament.sportType.${TournamentSport.TENNIS}`),
              value: TournamentSport.TENNIS,
            },
            {
              label: t(`tournament.sportType.${TournamentSport.BADMINTON}`),
              value: TournamentSport.BADMINTON,
            },
            {
              label: t(`tournament.sportType.${TournamentSport.SQUASH}`),
              value: TournamentSport.SQUASH,
            },
            {
              label: t(`tournament.sportType.${TournamentSport.TABLE_TENNIS}`),
              value: TournamentSport.TABLE_TENNIS,
            },
          ],
          selectAnLabel: t("tournament.sportType.label"),
        }}
      />

      <RHFormInput
        name="title"
        label={t("tournament.title")}
        control={control}
        onSubmitEditing={() => setFocus("description")}
      />

      <RHFormInput
        name="description"
        label={t("tournament.description")}
        inputProps={{
          style: { height: 100 },
          styleWrapper: { height: 110 },
          multiline: true,
          textAlignVertical: "top",
          returnKeyType: "default",
          useClearButton: false,
        }}
        control={control}
      />

      <ChooseImageSection
        defaultImages={watch("images")}
        onImageUploadSuccess={updateImages}
        errorMessage={errors.images?.message!}
      />

      <DualInputSection>
        <RHFormInput
          name="entryFee"
          label={t("tournament.entryFee")}
          inputProps={{ keyboardType: "number-pad" }}
          control={control}
          onSubmitEditing={() => setFocus("prizePool")}
        />
        <RHFormInput
          name="prizePool"
          label={t("tournament.prizePool")}
          inputProps={{ keyboardType: "number-pad" }}
          control={control}
          onSubmitEditing={() => setFocus("ageRestrictions.minAge")}
        />
      </DualInputSection>
      <CustomAnimatedView>
        <Divider className="mt-3" />
        <CustomText type="subtitle" className="ml-1 my-3">
          Restrictions
        </CustomText>
      </CustomAnimatedView>
      <DualInputSection>
        <RHFormInput
          name="ageRestrictions.minAge"
          label={t("tournament.ageRestriction.minAge")}
          inputProps={{ keyboardType: "number-pad" }}
          control={control}
          onSubmitEditing={() => setFocus("ageRestrictions.maxAge")}
        />

        <RHFormInput
          name="ageRestrictions.maxAge"
          label={t("tournament.ageRestriction.maxAge")}
          inputProps={{
            keyboardType: "number-pad",
          }}
          control={control}
          onSubmitEditing={() => setFocus("maxParticipants")}
        />
      </DualInputSection>

      <RHFormInput
        name="maxParticipants"
        label={t("tournament.maxParticipants")}
        inputProps={{ keyboardType: "number-pad" }}
        control={control}
        onSubmitEditing={() => setFocus("skillLevel")}
      />

      <RHFormDropdownInput
        control={control}
        name="skillLevel"
        label={t("tournament.skillLevel.title")}
        inputProps={{
          value: watch("skillLevel") && t(`tournament.skillLevel.${watch("skillLevel")}`),
        }}
        dropdownProps={{
          selectedValue: watch("skillLevel"),
          onValueChange: (itemValue) => setValue("skillLevel", itemValue || undefined),
          items: [
            {
              label: t(`tournament.skillLevel.${TournamentSkillLevel.AMATEUR}`),
              value: TournamentSkillLevel.AMATEUR,
            },
            {
              label: t(`tournament.skillLevel.${TournamentSkillLevel.INTERMEDIATE}`),
              value: TournamentSkillLevel.INTERMEDIATE,
            },
            {
              label: t(`tournament.skillLevel.${TournamentSkillLevel.PROFESSIONAL}`),
              value: TournamentSkillLevel.PROFESSIONAL,
            },
          ],
          selectAnLabel: t("tournament.skillLevel.label"),
        }}
      />
      <Pressable
        onPress={() => setIsOpenedAdditional((prev) => !prev)}
        className="mb-2"
        style={{ width: 180 }}
      >
        <CustomText color={theme.colors.link}>Additional parameters</CustomText>
      </Pressable>
      {isOpenedAdditional && (
        <>
          <RHFormDropdownInput
            control={control}
            name="format"
            label={t("tournament.format.title")}
            inputProps={{
              value: watch("format") && t(`tournament.format.${watch("format")}`),
            }}
            dropdownProps={{
              selectedValue: watch("format")!,
              onValueChange: (itemValue) => setValue("format", itemValue || undefined),
              items: [
                {
                  label: t(`tournament.format.${TournamentFormat.SINGLES}`),
                  value: TournamentFormat.SINGLES,
                },
                {
                  label: t(`tournament.format.${TournamentFormat.DOUBLES}`),
                  value: TournamentFormat.DOUBLES,
                },
                {
                  label: t(`tournament.format.${TournamentFormat.SQUAD}`),
                  value: TournamentFormat.SQUAD,
                },
              ],
              selectAnLabel: t("tournament.format.label"),
            }}
          />
          <RHFormInput
            name="rules"
            label={t("tournament.rules")}
            inputProps={{
              style: {
                height: 100,
              },
              styleWrapper: {
                height: 110,
              },
              multiline: true,
              textAlignVertical: "top",
              returnKeyType: "default",
              useClearButton: false,
            }}
            control={control}
          />
        </>
      )}
      <CustomAnimatedView>
        <Divider className="mt-2" />
        <CustomText type="subtitle" className="ml-1 my-3">
          Location & Date
        </CustomText>
      </CustomAnimatedView>
      <RHFormInput name="city" label={t("tournament.city")} control={control} />
      <Pressable onPress={goToLocationPage}>
        <RHFormInput
          name="location"
          label={t("tournament.location")}
          control={control}
          inputProps={{
            disabled: true,
            onPress: goToLocationPage,
          }}
        />
      </Pressable>
      <DualInputSection>
        <RHFormDatePicker
          name="dateStart"
          label={t("tournament.dateStart")}
          datePickerProps={{
            minimumDate: new Date(),
            maximumDate: new Date(new Date().getFullYear() + 5, 0, 1),
          }}
          control={control}
        />

        <RHFormDatePicker
          name="dateEnd"
          label={t("tournament.dateEnd")}
          datePickerProps={{
            minimumDate: watch("dateStart") ? new Date(watch("dateStart")) : undefined,
          }}
          control={control}
        />
      </DualInputSection>
    </View>
  );
};
