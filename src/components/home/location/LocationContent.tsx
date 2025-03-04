import { Keyboard, Platform, ScrollView, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { Location } from "../types";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import StickyFooterView from "../../../shared/view/StickyFooterView";
import ButtonDefault from "@/src/shared/button/ButtonDefault";
import { t } from "i18next";
import GoogleAutoComplete, {
  PlaceObject,
} from "../../tournaments/choose-location/GoogleAutocomplete";
import GoogleLogo from "@/src/shared/logo/GoogleLogo";
import FilterItem from "../filter/FilterItem";

type Props = {
  location: Location | null | undefined;
  onConfirm?: (location: Location | null | undefined) => void;
  onReset?: () => void;
};

const FilterContent = (props: Props) => {
  const { onConfirm, location: locationInit, onReset } = props;
  const { dismiss } = useBottomSheetModal();
  const [location, setLocation] = useState<Location | null | undefined>(
    locationInit || { radius: 50 }
  );

  const iosBottomBias = Platform.OS === "ios" ? 30 : 0;

  const handleShowResults = () => {
    onConfirm?.(location);
    Keyboard.dismiss();
    dismiss("location-modal");
  };

  const handleSelect = (location: PlaceObject) => {
    const latitude = isNaN(Number(location.latitude)) ? undefined : Number(location.latitude);
    const longitude = isNaN(Number(location.longitude)) ? undefined : Number(location.longitude);
    if (typeof longitude === "number" && typeof latitude === "number") {
      setLocation((prev) => {
        const res = {
          geoCoordinates: {
            latitude,
            longitude,
          },
          address: location.address,
        };
        return { ...prev, ...res };
      });
    }
  };

  const handlePressRadius = (radius: number) => {
    setLocation((prev) => {
      if (!prev) return { radius };
      const { radius: prevRadius, ...rest } = prev;

      if (prev.radius === radius) return rest;
      return { ...prev, radius };
    });
  };

  const radiusOptions = [10, 20, 50, 100, 200, 500];

  const handleReset = () => {
    onReset?.();
    Keyboard.dismiss();
    dismiss("location-modal");
  };

  return (
    <View className="flex-1 relative">
      <GoogleLogo className="absolute h-10 left-8 top-4" style={{ width: 70 }} />

      <View style={[styles.modalWrapper, { paddingBottom: 70 + iosBottomBias }]}>
        <View style={styles.autoCompleteSection}>
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex flex-row gap-2 mt-3 mb-6">
                {radiusOptions.map((radius, index) => (
                  <FilterItem
                    key={index}
                    label={`${radius} ${t("common.km")}`}
                    isSelected={radius === location?.radius}
                    onPress={() => handlePressRadius(radius)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
          <GoogleAutoComplete
            onSubmit={handleSelect}
            query={{ type: "(cities)" }}
            maxRows={3}
            location={{
              address: location?.address || "",
              latitude: location?.geoCoordinates?.latitude?.toString(),
              longitude: location?.geoCoordinates?.longitude?.toString(),
            }}
          />
        </View>
      </View>

      <StickyFooterView
        wrapperStyle={{ paddingHorizontal: 20 }}
        offset={{ closed: 10 - iosBottomBias, opened: 30 }}
      >
        <View style={[styles.buttonWrapper]}>
          <View style={{ flex: 1, flexDirection: "row", gap: 10 }}>
            <ButtonDefault
              title={t("common.showResults")}
              onPress={() => handleShowResults()}
              style={{ width: "65%" }}
              disabled={!location?.address}
            />
            <ButtonDefault
              type="white"
              className="flex-1"
              title={t("common.reset")}
              onPress={handleReset}
              disabled={!location?.address && !location?.radius}
            />
          </View>
        </View>
      </StickyFooterView>
    </View>
  );
};

const styles = StyleSheet.create({
  autoCompleteSection: {
    width: "100%",
    height: 450,
  },

  modalWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  buttonWrapper: {
    paddingTop: 10,
    paddingBottom: 40,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default FilterContent;
