import React from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloudIcon from "@mui/icons-material/Cloud";
import PeopleIcon from "@mui/icons-material/People";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import InstallAppSnackbar from "./InstallAppSnackbar";
import _ from "lodash";
import SearchField from "./SearchField";

interface PageLayoutProps {
  title?: string;
  children: any;
  showBack?: boolean;
  showSearchLink?: boolean;
  searchText?: string;
  onChangeSearchText?: (value: string) => void;
  menuItems?: MenuItemDefinition[];
}

interface MenuItemDefinition {
  text: string;
  onClick: Function;
}

function PageLayout(props: PageLayoutProps) {
  const {
    title,
    children,
    showBack = false,
    menuItems = null,
    showSearchLink = false,
    searchText = "",
    onChangeSearchText,
  } = props;

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const bottomNavigationUrls = ["/", "/databases", "/search"];

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => (showBack ? navigate(-1) : setDrawerOpen(true))}
          >
            {showBack ? <ArrowBackIcon /> : <MenuIcon />}
          </IconButton>
          {title && (
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
          )}

          {onChangeSearchText && (
            <SearchField value={searchText} onChange={onChangeSearchText} />
          )}

          {menuItems && (
            <IconButton
              size="large"
              aria-label="display more actions"
              edge="end"
              color="inherit"
              onClick={(e) => setMenuAnchorEl(e?.currentTarget)}
            >
              <MoreVertIcon />
            </IconButton>
          )}

          {showSearchLink && (
            <IconButton
              size="large"
              aria-label="display more actions"
              edge="end"
              color="inherit"
              onClick={() => navigate("/search")}
            >
              <SearchIcon />
            </IconButton>
          )}

          {menuItems && (
            <Menu
              id="basic-menu"
              anchorEl={menuAnchorEl}
              open={!!menuAnchorEl}
              onClose={() => setMenuAnchorEl(null)}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setMenuAnchorEl(null);
                  }}
                >
                  {item.text}
                </MenuItem>
              ))}
            </Menu>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={() => setDrawerOpen(false)}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/databases")}>
                <ListItemIcon>
                  <CloudIcon />
                </ListItemIcon>
                <ListItemText primary="Databases" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/")}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Artists" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/search")}>
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText primary="Search" />
              </ListItemButton>
            </ListItem>
          </List>
          {/* <Divider />
          <List>
            {["All mail", "Trash", "Spam"].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List> */}
        </Box>
      </Drawer>
      <Box sx={{ pb: 7, pt: 8 }}>{children}</Box>

      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={_.findIndex(
            bottomNavigationUrls,
            (x) => x == location.pathname
          )}
          onChange={(event, newValue) => {
            navigate(bottomNavigationUrls[newValue]);
          }}
        >
          <BottomNavigationAction label="Artists" icon={<PeopleIcon />} />
          <BottomNavigationAction label="Databases" icon={<CloudIcon />} />
          <BottomNavigationAction label="Search" icon={<SearchIcon />} />
        </BottomNavigation>
      </Paper>

      <InstallAppSnackbar />
    </div>
  );
}

export default PageLayout;
