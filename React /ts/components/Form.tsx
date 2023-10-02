import { Formik, Form } from "formik";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import styles from "pages/achievements/components/AchievementModals/AchievementModal.module.scss";
import { AchievementData } from "pages/achievements/stores/AchievementsStore";
import { useRootStoreContext } from "rootStore";
import { Button, imagesType, Input, SelectImage } from "shared/components";
import { Select } from "shared/components/Select";
import { AchievementType } from "shared/types";

import { getInitialValues, YUP_OBJECT } from "./config";
import useOptions from "./hooks/useOptions";

const Form = observer(() => {
  const {
    achievementsStore: { achievement, createAchievement, editAchievement },
  } = useRootStoreContext();

  const { t } = useTranslation();

  const { typeOptions, workYearsOptions, durationOptions } = useOptions();

  const createOrEdit = (data: AchievementData): void => {
    achievement.id ? editAchievement(data) : createAchievement(data);
  };

  const INITIAL_VALUES = getInitialValues(achievement);

  return (
    <Formik
      enableReinitialize
      initialValues={INITIAL_VALUES}
      validationSchema={YUP_OBJECT}
      onSubmit={createOrEdit}
    >
      {({
        values,
        errors,
        handleChange,
        handleBlur,
        touched,
        setFieldValue,
        handleSubmit,
      }) => {
        const handleClick = () => {
          setFieldValue("imageUrl", "");
          achievement.imageUrl = "";
        };

        return (
          <Form>
            <div className={styles.editAchievement} id="achievement-modal">
              <div className={styles.achievementInfo}>
                <div className={styles.achievementImageWrapper}>
                  <SelectImage
                    subtext={t("configuration.departments.selectImage")}
                    onUpload={(file) => setFieldValue("imageUrl", file)}
                    src={values.imageUrl}
                    imagesType={imagesType.achievement}
                    deleteAvatarFile={handleClick}
                  />
                </div>

                <div className={styles.dataContainer}>
                  {values.type === AchievementType.WORK_YRS && (
                    <div className={styles.inputDataWrapper}>
                      <Select
                        name="workYears"
                        title={t("achievements.work-years")}
                        placeholder={t("achievements.work-years")}
                        options={workYearsOptions}
                        maxVisibleItemsNum={5}
                        selectedValue={values.workYears.toString()}
                        handleChange={handleChange}
                      />
                    </div>
                  )}

                  <div className={styles.inputDataWrapper}>
                    <Input
                      name="name"
                      type="text"
                      error={errors.name}
                      value={values.name}
                      touched={touched.name}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      title={"achievements.title"}
                      placeholder={"achievements.title"}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.achievementDescription}>
                <Input
                  type="textarea"
                  name="description"
                  error={errors.description}
                  value={values.description}
                  touched={touched.description}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  title={"achievements.description"}
                  placeholder={"achievements.description"}
                  required={false}
                />
              </div>

              <div className={styles.horizontalInputs}>
                <div className={styles.inputDataWrapper}>
                  <Select
                    name="type"
                    title={t("achievements.type")}
                    options={typeOptions}
                    maxVisibleItemsNum={5}
                    selectedValue={values.type}
                    handleChange={handleChange}
                    dropdownPosition={{
                      bottom: "100%",
                    }}
                  />
                </div>

                {values.type === AchievementType.MANUAL && (
                  <div className={styles.inputDataWrapper}>
                    <Select
                      name="durationMonths"
                      title={t("achievements.duration")}
                      options={durationOptions}
                      maxVisibleItemsNum={5}
                      selectedValue={values.durationMonths}
                      handleChange={handleChange}
                      defaultValue={workYearsOptionsDefault}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className={styles.formikControls}>
              <Button variant="primary" onClick={handleSubmit}>
                {t("shared.buttons.save")}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
});

export default Form;
