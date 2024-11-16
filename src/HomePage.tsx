import React from "react";
import { Box, Paper } from "@mui/material";
import PageLayout from "./PageLayout";
import { Link } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import HomeCs from "./HomeCs";
import HomeEn from "./HomeEn";

export default function ErrorPage() {
  const intl = useIntl();

  return (
    <PageLayout
      title={intl.formatMessage({
        id: "zpevnikator.git",
        defaultMessage: "Zpevnikator.git",
      })}
    >
      <Box sx={{ m: 2 }} style={{ maxWidth: 600 }}>
        {intl.locale?.startsWith("cs") ? <HomeCs /> : <HomeEn />}
      </Box>
    </PageLayout>
  );
}
