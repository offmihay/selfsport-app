import { StyleSheet, View } from "react-native";
import React from "react";
import PersonalInfoList from "@/src/components/settings/personal-info/PersonalInfoList";
import { useUser } from "@clerk/clerk-expo";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCustomTheme } from "@/src/hooks/useCustomTheme";
import LayoutScrollView from "@/src/components/navigation/layouts/LayoutScrollView";
import { Divider } from "react-native-paper";
import CustomSwitch from "@/src/shared/switch/Switch";
import { useSettings } from "@/src/hooks/useSettings";
import { t } from "i18next";

const OrganizerInfoPage = () => {
  const { user } = useUser();
  const theme = useCustomTheme();
  const { settings, updateSettings } = useSettings();

  return (
    <LayoutScrollView name="organizerInfo" alwaysBounceVertical={false}>
      <View style={styles.wrapper}>
        <View style={[{ backgroundColor: theme.colors.surface, borderRadius: 10 }]}>
          <PersonalInfoList
            label={t("settings.organizerInfo.creatorMode")}
            icon={<MaterialIcons name="mode" size={24} color={theme.colors.text} />}
            renderButton={() => (
              <CustomSwitch
                toggleSwitch={(isOn) => updateSettings({ creatorMode: isOn })}
                value={settings.creatorMode}
              />
            )}
          />
          <Divider />
          <PersonalInfoList
            label={t("settings.organizerInfo.editOrganizerInfo")}
            value={(user?.unsafeMetadata.organizerName as string) || t("common.notSpecified")}
            onPress={() => router.navigate("./edit", { relativeToDirectory: true })}
            icon={<FontAwesome5 name="house-user" size={24} color={theme.colors.text} />}
          />
        </View>
      </View>
    </LayoutScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
});

export default OrganizerInfoPage;
