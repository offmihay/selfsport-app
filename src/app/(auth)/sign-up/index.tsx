import { View, StyleSheet, TouchableOpacity, Keyboard, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { t } from "i18next";

import CustomText from "../../../components/shared/text/CustomText";

import TouchableBtn from "@/src/components/shared/button/ButtonDefault";
import ButtonBack from "@/src/components/shared/button/ButtonBack";
import { useSignUpMutation } from "../../../queries/signup";
import { useCustomTheme } from "@/src/hooks/useCustomTheme";
import CustomTextInput from "@/src/components/shared/input/CustomTextInput";
import { Controller, FormProvider, useForm } from "react-hook-form";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import CustomKeyboardAvoidingView from "@/src/components/shared/view/CustomKeyboardAvoidingView";
import DismissKeyboardView from "@/src/components/shared/view/DismissKeyboardView";
import RHFormInput from "@/src/components/shared/form/RHFormInput";

type EmailData = {
  email: string;
};

export default function SignUpEmailScreen() {
  const theme = useCustomTheme();
  const router = useRouter();

  const signUpMutation = useSignUpMutation();

  const methods = useForm<EmailData>({
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors: formErrors, isDirty },
    clearErrors,
    setError,
  } = methods;

  useEffect(() => {
    clearErrors();
  }, [watch("email")]);

  const onCheckUpEmail = (data: EmailData) => {
    signUpMutation.mutate(data.email, {
      onSuccess: () => {
        router.navigate({
          pathname: "/sign-up/password",
          params: { email: watch("email") },
        });
      },
      onError: (error: any) => {
        if (error.clerkError) {
          error.errors.forEach((err: any) => {
            const param = err.meta.paramName;
            const errParam = param === "email_address" ? "email" : "root.clerkError";
            setError(errParam, {
              type: err.code,
              message: t(`errors.${err.code}`),
            });
          });
        } else {
          setError("root.serverError", {
            type: "server_error",
            message: t(`errors.server_error`),
          });
        }
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <CustomKeyboardAvoidingView
        keyboardVerticalOffset={-250}
        style={{ backgroundColor: theme.colors.background }}
      >
        <ButtonBack />
        <DismissKeyboardView>
          <View style={[styles.wrapper]}>
            <View style={[styles.contentWrapper]}>
              <View className="h-[300]">
                <Animated.View layout={LinearTransition} className="mb-12">
                  <CustomText type="subtitle" color={theme.colors.text} center>
                    {t("signup.titleEmail")}
                  </CustomText>
                </Animated.View>
                <Animated.View layout={LinearTransition}>
                  <RHFormInput
                    name="email"
                    label={t("signup.email")}
                    control={control}
                    inputProps={{
                      useClearButton: true,
                      isError: !!formErrors.email,
                    }}
                    rules={{
                      maxLength: { value: 30, message: t("errors.email_too_long") },
                      pattern: {
                        value: /^\s*[\w-\.]+@([\w-]+\.)+[\w-]{1,4}\s*$/g,
                        message: t("errors.email_invalid"),
                      },
                    }}
                  />
                </Animated.View>
                {formErrors.email?.message && (
                  <Animated.View
                    layout={LinearTransition}
                    className="ml-2 mb-1"
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(300)}
                  >
                    <CustomText color={theme.colors.error} type="predefault">
                      {formErrors.email?.message}
                    </CustomText>
                  </Animated.View>
                )}

                <Animated.View layout={LinearTransition} className="ml-2 w-[200] mt-2">
                  <TouchableOpacity
                    onPress={() =>
                      router.navigate({
                        pathname: "/sign-in-modal",
                      })
                    }
                  >
                    <CustomText color="#0082FF" type="predefault">
                      {t("signup.alreadyHaveAccount")}
                      {/* <Loader style={{ margin: 0, width: 25, height: 15 }} /> */}
                    </CustomText>
                  </TouchableOpacity>
                </Animated.View>
                {formErrors.root && (
                  <Animated.View
                    layout={LinearTransition}
                    className="ml-2 mt-1"
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(300)}
                  >
                    {Object.values(formErrors.root).map((error, index) => (
                      <CustomText color={theme.colors.error} type="predefault" key={index}>
                        {(error as { message: string }).message}
                      </CustomText>
                    ))}
                  </Animated.View>
                )}
                <Animated.View className="mt-6" layout={LinearTransition}>
                  <TouchableBtn
                    onPress={handleSubmit(onCheckUpEmail)}
                    loading={signUpMutation.isPending}
                    title={t("signup.continue")}
                    disabled={!watch("email") || Object.keys(formErrors).length !== 0}
                  />
                </Animated.View>
              </View>
            </View>
          </View>
        </DismissKeyboardView>
      </CustomKeyboardAvoidingView>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
  },
});
