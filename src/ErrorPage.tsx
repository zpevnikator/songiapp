import React from "react";
import { Box, Paper } from "@mui/material";
import PageLayout from "./PageLayout";
import { Link } from "react-router-dom";
import { FormattedMessage } from "react-intl";

export default function ErrorPage() {
  return (
    <PageLayout>
      <Box sx={{ m: 1 }}>
        <FormattedMessage
          id="page-not-exists"
          defaultMessage="Oops!! This page doesn't exist"
        />
      </Box>
      <Box sx={{ m: 1 }}>
        <Link to="/">
          <FormattedMessage id="go-to-home" defaultMessage="Go to Home" />
        </Link>
      </Box>
    </PageLayout>
  );
}
